import { AuthToken, AuthClientTwoLegged, Scope } from 'forge-apis';
import decodeJWT from 'jwt-decode';

export const DefaultHost = 'https://developer.api.autodesk.com';

export type AuthOptions = { access_token: string } | { client_id: string, client_secret: string } | IAuthProvider;

export interface IClientOptions {
    region: Region;
    host: string;
}

export enum Region {
    US = 'us',
    EMEA = 'emea'
}

/**
 * Interface for an authentication/authorization provider that can provide access tokens
 * to different API clients in this library.
 */
export interface IAuthProvider {
    /**
     * Generates access token that satisfies the provided set of scopes.
     * @link https://forge.autodesk.com/en/docs/oauth/v2/developers_guide/scopes
     * @param {Scope[]} scopes List of required scopes.
     * @param {boolean} force Skip cached tokens (if there are any) and generate a new one.
     * @returns {Promise<AuthToken>} Access token satisfying the input set of scopes.
     */
    getToken(scopes: Scope[], force?: boolean): Promise<AuthToken>;
}

interface IJsonWebToken {
    scope: Scope[];
    client_id: string;
    aud: string;
    jti: string;
    exp: number;
}

/**
 * Simple authentication/authorization provider using a hard-coded access token
 * provided by the user. It will output a console warning if any of the requested
 * scopes is not included in the hard-coded token.
 */
export class StaticAuthProvider implements IAuthProvider {
    constructor(protected accessToken: string) {
    }

    protected validateToken(scopes: Scope[]) {
        const jwt = decodeJWT(this.accessToken) as IJsonWebToken;
        for (const scope of scopes) {
            if (!jwt.scope.includes(scope)) {
                console.warn('Requested scope is not included in the access token provided', scope);
            }
        }
    }

    public async getToken(scopes: Scope[], force?: boolean): Promise<AuthToken> {
        this.validateToken(scopes);
        return Promise.resolve({
            access_token: this.accessToken,
            token_type: 'Bearer',
            expires_in: 3600
        });
    }
}

/**
 * Simple authentication/authorization provider generating access tokens
 * using the 2-legged OAuth workflow with the provided client ID and secret.
 * Tokens are cached for the specific sets of scopes.
 */
export class TwoLeggedAuthProvider implements IAuthProvider {
    protected cache: Map<string, AuthToken & { expires_at: number }>;

    constructor(protected clientId: string, protected clientSecret: string) {
        this.cache = new Map();
    }

    public async getToken(scopes: Scope[], force?: boolean): Promise<AuthToken> {
        const key = scopes.join('+');
        let token = this.cache.get(key);
        if (force || !token || token.expires_at < Date.now()) {
            const authClient = new AuthClientTwoLegged(this.clientId, this.clientSecret, scopes, false);
            const credentials = await authClient.authenticate();
            token = {
                access_token: credentials.access_token,
                token_type: credentials.token_type,
                expires_in: credentials.expires_in,
                expires_at: Date.now() + credentials.expires_in * 1000
            };
            this.cache.set(key, token);
        }
        return {
            access_token: token.access_token,
            token_type: token.token_type,
            expires_in: Math.round((token.expires_at - Date.now()) / 1000)
        };
    }
}
