import { AuthClient, Scope, ApiClient, HubsApi, ProjectsApi, FoldersApi, ItemsApi, VersionsApi } from 'forge-apis';
import { DefaultHost, AuthOptions, IClientOptions, Region, IAuthProvider, StaticAuthProvider, TwoLeggedAuthProvider } from './common';

const ReadTokenScopes: Scope[] = ['data:read'];

export interface IHub {
    type: 'hubs';
    id: string;
    attributes: {
        name?: string;
        region?: string;
        extension?: any;
    };
}

export interface IProject {
    type: 'projects';
    id: string;
    attributes: {
        name?: string;
        scopes?: string[];
        extension?: any;
    };
}

export interface IFolder {
    type: 'folders';
    id: string;
    attributes: {
        name?: string; // The name of the folder.
        displayName?: string; // Note that this field is reserved for future releases and should not be used. Use attributes.name for the folder name.
        objectCount?: number; // The number of objects inside the folder.
        createTime?: string; // The time the folder was created, in the following format: YYYY-MM-DDThh:mm:ss.sz.
        createUserId?: string; // The unique identifier of the user who created the folder.
        createUserName?: string; // The name of the user who created the folder.
        lastModifiedTime?: string; // The last time the folder was modified, in the following format: YYYY-MM-DDThh:mm:ss.sz.
        lastModifiedUserId?: string; // The unique identifier of the user who last modified the folder.
        lastModifiedUserName?: string; // The name of the user who last modified the folder.
        hidden?: boolean; // The folder’s current visibility state.
        extension?: any; // The extension object of the data.
    };
}

export interface IItem {
    type: 'items';
    id: string;
    attributes: {
        displayName?: string; // Displayable name of an item.
        createTime?: string; // The time the item was created, in the following format: YYYY-MM-DDThh:mm:ss.sz.
        createUserId?: string; // The unique identifier of the user who created the item.
        createUserName?: string; // The name of the user who created the item.
        lastModifiedTime?: string; // The last time the item was modified, in the following format: YYYY-MM-DDThh:mm:ss.sz.
        lastModifiedUserId?: string; // The unique identifier of the user who last modified the item.
        lastModifiedUserName?: string; // The name of the user who last modified the item.
        hidden?: boolean; // true if the file has been deleted. false if the file has not been deleted.
        reserved?: boolean; // Indicates the availability of the file. A reserved file can only be modified by the user that reserved it.
        reservedTime?: string; // The time the item was reserved.
        reservedUserId?: string; // The unique identifier of the user who reserved the item.
        reservedUserName?: string; // The name of the user who reserved the item.
        pathInProject?: string; // The relative path of the item starting from project’s root folder.
        extension?: object;
        folder?: string; // URN of parent folder
        derivative?: string; // URN of viewable
        storage?: string; // storage ID
        versionNumber?: number; // version number of tip version
    };
}

interface IVersion {
    id: string;
    type: string;
    attributes: {
        name?: string; // The filename used when synced to local disk.
        displayName?: string; // Displayable name of the version.
        derivative?: string; // URN of viewable for given version
        versionNumber?: number; // Version number of this versioned file.
        mimeType?: string; // Mimetype of the version’s content.
        fileType?: string; // File type, only present if this version represents a file.
        storage?: number; // Storage ID for given file verison.
        storageSize?: number; // File size in bytes, only present if this version represents a file.
        createTime?: string; // The time that the resource was created at.
        createUserId?: string; // The userId that created the resource.
        createUserName?: string; // The username that created the resource.
        lastModifiedTime?: string; // The time that the resource was last modifed.
        lastModifiedUserId?: string; // The userId that last modified the resource.
        lastModifiedUserName?: string; // The username that last modified the resource.
        extension?: object; // The extension object of the data.
    };
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
        // TODO: support for custom user ID
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.projectsApi.getProject(hubId, projectId, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Gets a list of top folders in a project.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-hub_id-projects-project_id-topFolders-GET
     * @async
     * @param {string} hubId Hub ID.
     * @param {string} projectId Project ID.
     * @returns {Promise<IFolder[]>} List of folder records.
     */
    async listProjecFolders(hubId: string, projectId: string): Promise<IFolder[]> {
        // TODO: support for custom user ID
        // TODO: what if the response includes `response.links.next`? Do we have to paginate manually?
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.projectsApi.getProjectTopFolders(hubId, projectId, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Gets contents of a folder.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-folder_id-contents-GET
     * @async
     * @param {string} projectId Project ID.
     * @param {string} folderId Folder ID.
     * @returns {Promise<(IFolder | IItem)[]>} List of folder contents.
     */
    async listFolderContents(projectId: string, folderId: string): Promise<(IFolder | IItem)[]> {
        // TODO: support for custom user ID
        // TODO: what if the response includes `response.links.next`? Do we have to paginate manually?
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.foldersApi.getFolderContents(projectId, folderId, {}, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Returns the folder by ID for any folder within a given project.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-folder_id-GET
     * @param {string} projectId Project ID.
     * @param {string} folderId Folder ID.
     * @returns {Promise<IFolder>} Folder details.
     */
    async getFolderDetails(projectId: string, folderId: string): Promise<IFolder> {
        // TODO: support for custom user ID
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.foldersApi.getFolder(projectId, folderId, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Gets details of an item.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-GET
     * @async
     * @param {string} projectId Project ID.
     * @param {string} itemId Item ID.
     * @returns {Promise<IItemDetails>} Item details.
     */
    async getItemDetails(projectId: string, itemId: string): Promise<IItem> {
        // TODO: support for custom user ID
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.itemsApi.getItem(projectId, itemId, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Lists versions of an item.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-versions-GET
     * @async
     * @param {string} projectId Project ID.
     * @param {string} itemId Item ID.
     * @returns {Promise<IVersion[]>} List of item versions.
     */
    async listItemVersions(projectId: string, itemId: string): Promise<IVersion[]> {
        // TODO: support for custom user ID
        // TODO: what if the response includes `response.links.next`? Do we have to paginate manually?
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.itemsApi.getItemVersions(projectId, itemId, {}, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Gets "tip" version of an item.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-tip-GET
     * @async
     * @param {string} projectId Project ID.
     * @param {string} itemId Item ID.
     * @returns {Promise<IVersion>} Tip version of the item.
     */
    async getItemTipVersion(projectId: string, itemId: string): Promise<IVersion> {
        // TODO: support for custom user ID
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.itemsApi.getItemTip(projectId, itemId, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Gets specific version of an item.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-versions-version_id-GET
     * @async
     * @param {string} projectId Project ID.
     * @param {string} versionId Version ID.
     * @returns {Promise<IVersion>} Specific version of folder item.
     */
    async getVersionDetails(projectId: string, versionId: string): Promise<IVersion> {
        // TODO: support for custom user ID
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.versionsApi.getVersion(projectId, versionId, null as unknown as AuthClient, credentials);
        return response.body.data;
    }
}
