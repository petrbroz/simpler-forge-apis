import { Scope, AuthToken, AuthClientThreeLegged } from 'forge-apis';
import { DefaultHost, IAuthProvider, TwoLeggedAuthProvider } from './common';

/**
 * Client providing access to Autodesk Forge Authentication APIs.
 * @link https://forge.autodesk.com/en/docs/oauth/v2
 */
export class AuthenticationClient {
    protected host: string;
    protected clientId: string;
    protected clientSecret: string;
    protected authProvider: IAuthProvider;

    constructor(clientId: string, clientSecret: string, host?: string) {
        this.host = host || DefaultHost;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.authProvider = new TwoLeggedAuthProvider(clientId, clientSecret);
    }

    /**
     * Retrieves 2-legged access token for a specific set of scopes.
     * Unless the {@see force} parameter is used, the access tokens are cached
     * based on their scopes and the `expires_in` field in the response.
     * @link https://forge.autodesk.com/en/docs/oauth/v2/reference/http/authenticate-POST
     * @link https://forge.autodesk.com/en/docs/oauth/v2/developers_guide/scopes
     * @async
     * @param {Scope[]} scopes List of requested scopes.
     * @param {boolean} [force] Skip cache, if there is any, and retrieve a new token.
     * @returns {Promise<AuthToken>} 2-legged access token object.
     */
    public async authenticate(scopes: Scope[], force?: boolean): Promise<AuthToken> {
        return this.authProvider.getToken(scopes, force);
    }

    /**
     * Generates a URL that users should be redirected to in 3-legged OAuth workflows.
     * @link https://forge.autodesk.com/en/docs/oauth/v2/reference/http/authorize-GET
     * @link https://forge.autodesk.com/en/docs/oauth/v2/developers_guide/scopes
     * @param {Scope[]} scopes List of requested scopes.
     * @param {string} redirectUri Callback URL. Must match the URL configured for this app on the Forge portal.
     * @returns {string} Autodesk login URL.
     */
    public getAuthorizationUrl(scopes: Scope[], redirectUri: string): string {
        return `${this.host}/authentication/v1/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(' ')}`;
    }

    /**
     * Exchanges temporary code retrieved from 3-legged OAuth workflow for an access token.
     * @link https://forge.autodesk.com/en/docs/oauth/v2/reference/http/gettoken-POST
     * @async
     * @param {string} code Temporary code returned from the 3-legged OAuth workflow.
     * @param {string} redirectUri Callback URL. Must match the URL configured for this app on the Forge portal.
     * @returns {Promise<AuthToken>} 3-legged access token object.
     */
    public async getToken(code: string, redirectUri: string): Promise<AuthToken> {
        // Why do we need to specify scopes here?
        const threeLeggedClient = new AuthClientThreeLegged(this.clientId, this.clientSecret, redirectUri, [], false);
        return threeLeggedClient.getToken(code);
    }

    /**
     * Refreshes 3-legged access token.
     * @link https://forge.autodesk.com/en/docs/oauth/v2/reference/http/refreshtoken-POST
     * @link https://forge.autodesk.com/en/docs/oauth/v2/developers_guide/scopes
     * @async
     * @param {string} refreshToken Refresh token.
     * @param {Scope[]} scopes List of requested scopes.
     * @returns {Promise<AuthToken>} 3-legged access token object.
     */
    public async refreshToken(refreshToken: string, scopes: Scope[]): Promise<AuthToken> {
        // Why do we need to specify scopes and redirect URI here?
        const threeLeggedClient = new AuthClientThreeLegged(this.clientId, this.clientSecret, '', [], false);
        return threeLeggedClient.refreshToken({ refresh_token: refreshToken }, scopes);
    }
}
