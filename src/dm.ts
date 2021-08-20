import { AuthClient, Scope, ApiClient, HubsApi, ProjectsApi, FoldersApi, ItemsApi, VersionsApi } from 'forge-apis';
import { DefaultHost, AuthOptions, IClientOptions, Region, IAuthProvider, StaticAuthProvider, TwoLeggedAuthProvider } from './common';

const ReadTokenScopes: Scope[] = ['data:read'];

export interface IHub {
    id: string;
    name?: string;
    region?: string;
    extension?: object;
}

interface IProject {
    id: string;
    name?: string;
    scopes?: string[];
    extension?: object;
}

/**
 * Client providing access to Autodesk Forge Data Management APIs.
 * @link https://forge.autodesk.com/en/docs/data/v2
 */
export class DataManagementClient {
    protected authProvider: IAuthProvider;
    protected host: string;
    protected region: Region;
    protected apiClient: ApiClient;
    protected hubsApi: HubsApi;
    protected projectsApi: ProjectsApi;
    protected foldersApi: FoldersApi;
    protected itemsApi: ItemsApi;
    protected versionsApi: VersionsApi;

    constructor(protected auth: AuthOptions, options?: IClientOptions) {
        if ('access_token' in auth) {
            this.authProvider = new StaticAuthProvider(auth.access_token);
        } else {
            this.authProvider = new TwoLeggedAuthProvider(auth.client_id, auth.client_secret);
        }
        this.host = options?.host || DefaultHost;
        this.region = options?.region || Region.US;
        this.apiClient = new ApiClient(this.host);
        this.hubsApi = new HubsApi(this.apiClient);
        this.projectsApi = new ProjectsApi(this.apiClient);
        this.foldersApi = new FoldersApi(this.apiClient);
        this.itemsApi = new ItemsApi(this.apiClient);
        this.versionsApi = new VersionsApi(this.apiClient);
    }

    // public async *enumerateHubs(): AsyncIterable<IHub[]> {
    //     const credentials = await this.authProvider.getToken(ReadTokenScopes);
    //     let response = await this.hubsApi.getHubs({}, null as unknown as AuthClient, credentials);
    //     yield response.body.data;
    //     while (response.body?.links?.next) {
    //         call response.body.links.next ???
    //         yield response.body.items;
    //     }
    // }

    /**
     * Gets a list of all hubs accessible to given credentials.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-GET
     * @async
     * @returns {Promise<IHub[]>} List of hubs.
     */
    public async listHubs(): Promise<IHub[]> {
        // TODO: support for custom user ID
        // TODO: what if the response includes `response.links.next`? Do we have to paginate manually?
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.hubsApi.getHubs({}, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Retrieves details of specific hub.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-hub_id-GET
     * @async
     * @param {string} hubId Hub ID.
     * @returns {Promise<IHub>} Hub details.
     */
    public async getHubDetails(hubId: string): Promise<IHub> {
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.hubsApi.getHub(hubId, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Lists all projects in a hub.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-hub_id-projects-GET
     * @async
     * @param {string} hubId Hub ID.
     * @returns {Promise<IProject[]>} List of projects.
     */
     public async listProjects(hubId: string): Promise<IProject[]> {
        // TODO: support for custom user ID
        // TODO: what if the response includes `response.links.next`? Do we have to paginate manually?
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.projectsApi.getHubProjects(hubId, {}, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Gets details of specific project.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-hub_id-projects-project_id-GET
     * @async
     * @param {string} hubId Hub ID.
     * @param {string} projectId Project ID.
     * @returns {Promise<IProject>} Hub details or null if there isn't one.
     */
    public async getProjectDetails(hubId: string, projectId: string): Promise<IProject> {
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.projectsApi.getProject(hubId, projectId, null as unknown as AuthClient, credentials);
        return response.body.data;
    }
}
