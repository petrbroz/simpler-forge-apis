import { Scope, AuthToken } from 'forge-apis';
import { IAuthProvider, TwoLeggedAuthProvider } from './common';

/**
 * Client providing access to Autodesk Forge Authentication APIs.
 * @link https://forge.autodesk.com/en/docs/oauth/v2
 */
export class AuthenticationClient {
    protected authProvider: IAuthProvider;

    constructor(clientId: string, clientSecret: string) {
        this.authProvider = new TwoLeggedAuthProvider(clientId, clientSecret);
    }

    /**
     * Retrieves 2-legged access token for a specific set of scopes.
     * @link https://forge.autodesk.com/en/docs/oauth/v2/reference/http/authenticate-POST
     * Unless the {@see force} parameter is used, the access tokens are cached
     * based on their scopes and the 'expires_in' field in the response.
     * @param {Scope[]} scopes List of requested {@link https://forge.autodesk.com/en/docs/oauth/v2/developers_guide/scopes|scopes}.
     * @param {boolean} [force] Skip cache, if there is any, and retrieve a new token.
     * @returns {Promise<AuthToken>} Access token object.
     */
    public async authenticate(scopes: Scope[], force?: boolean): Promise<AuthToken> {
        return this.authProvider.getToken(scopes, force);
    }
}
