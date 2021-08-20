import { AuthToken, AuthClientTwoLegged, Scope } from 'forge-apis';

export const DefaultHost = 'https://developer.api.autodesk.com';

export type AuthOptions = { access_token: string } | { client_id: string, client_secret: string };

export interface IClientOptions {
    region: Region;
    host: string;
}

export enum Region {
    US = 'us',
    EMEA = 'emea'
}

export interface IAuthProvider {
    getToken(scopes: Scope[], force?: boolean): Promise<AuthToken>;
}

export class StaticAuthProvider implements IAuthProvider {
    constructor(protected token: string) { }

    public async getToken(scopes: Scope[], force?: boolean): Promise<AuthToken> {
        // TODO: parse the original JWT and warn if the scopes do not match or when it expires
        return Promise.resolve({
            access_token: this.token,
            token_type: 'Bearer',
            expires_in: 3600
        });
    }
}

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
