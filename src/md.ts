// TODO: clean up the terminology in the code comments (manifest, derivative, modeldata, viewable, etc.)

import { AuthClient, Scope, ApiClient, DerivativesApi } from 'forge-apis';
import { IAuthProvider, StaticAuthProvider, TwoLeggedAuthProvider } from './auth';
import { DefaultHost, AuthOptions, IClientOptions, Region } from './common';

const ReadTokenScopes: Scope[] = ['data:read', 'viewables:read'];
const WriteTokenScopes: Scope[] = ['data:write', 'data:read'];

export interface IDerivativeFormats {
    [outputFormat: string]: string[];
}

export interface IDerivativeManifest {
    type: string;
    hasThumbnail: string;
    status: string;
    progress: string;
    region: string;
    urn: string;
    version: string;
    derivatives: IDerivative[];
}

export interface IDerivative {
    status: string;
    progress?: string;
    name?: string;
    hasThumbnail?: string;
    outputType?: string;
    children?: DerivativeChild[];
}

type DerivativeChild = IDerivativeResourceChild | IDerivativeGeometryChild | IDerivativeViewChild;

export interface IDerivativeChild {
    guid: string;
    type: string;
    role: string;
    status: string;
    progress?: string;
    children?: DerivativeChild[];
}

export interface IDerivativeResourceChild extends IDerivativeChild {
    type: 'resource';
    urn: string;
    mime: string;
}

export interface IDerivativeGeometryChild extends IDerivativeChild {
    type: 'geometry';
    name?: string;
    viewableID?: string;
    phaseNames?: string;
    hasThumbnail?: string;
    properties?: any;
}

export interface IDerivativeViewChild extends IDerivativeChild {
    type: 'view';
    name?: string;
    camera?: number[];
    viewbox?: number[];
}

export interface IDerivativeMetadata {
    type: 'metadata';
    metadata: { guid: string; name: string; role: string; }[];
}

export interface IDerivativeTree {
    type: 'objects';
    objects: any[]; // TODO
}

export interface IDerivativeProperties {
    type: 'properties';
    collection: any[]; // TODO
}

export enum ThumbnailSize {
    Small = 100,
    Medium = 200,
    Large = 400
}

/**
 * Client providing access to Autodesk Forge Model Derivative APIs.
 * @link https://forge.autodesk.com/en/docs/model-derivative/v2
 */
export class ModelDerivativeClient {
    protected authProvider: IAuthProvider;
    protected host: string;
    protected region: Region;
    protected apiClient: ApiClient;
    protected derivativesApi: DerivativesApi;

    constructor(protected auth: AuthOptions, options?: IClientOptions) {
        if ('access_token' in auth) {
            this.authProvider = new StaticAuthProvider(auth.access_token);
        } else {
            this.authProvider = new TwoLeggedAuthProvider(auth.client_id, auth.client_secret);
        }
        this.host = options?.host || DefaultHost;
        this.region = options?.region || Region.US;
        this.apiClient = new ApiClient(this.host);
        this.derivativesApi = new DerivativesApi(this.apiClient, this.region.toUpperCase()); // Be careful, the official API expects region to be "US", "EMEA", or "EU" (all upper-cased)
    }

    /**
     * Gets a list of supported translation formats.
     * @link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/formats-GET
     * @async
     * @yields {Promise<IDerivativeFormats>} Dictionary of all supported output formats
     * mapped to arrays of formats these outputs can be obtained from.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    public async getFormats(): Promise<IDerivativeFormats> {
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.derivativesApi.getFormats({}, null as unknown as AuthClient, credentials);
        return response.body;
    }

    /**
     * Retrieves manifest of a derivative.
     * @link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-GET
     * @async
     * @param {string} urn Document derivative URN.
     * @returns {Promise<IDerivativeManifest>} Document derivative manifest.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    public async getManifest(urn: string): Promise<IDerivativeManifest> {
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.derivativesApi.getManifest(urn, {}, null as unknown as AuthClient, credentials);
        return response.body;
    }

    /**
     * Deletes manifest and all derivatives associated with it.
     * @link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-DELETE
     * @async
     * @param {string} urn Document derivative URN.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    public async deleteManifest(urn: string): Promise<void> {
        const credentials = await this.authProvider.getToken(WriteTokenScopes);
        await this.derivativesApi.deleteManifest(urn, null as unknown as AuthClient, credentials);
    }

    /**
     * Retrieves metadata of a derivative.
     * @link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-GET
     * @async
     * @param {string} urn Document derivative URN.
     * @returns {Promise<IDerivativeMetadata>} Document derivative metadata.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    public async getMetadata(urn: string): Promise<IDerivativeMetadata> {
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.derivativesApi.getMetadata(urn, {}, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Retrieves object tree of a specific derivative.
     * @link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-GET
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @param {boolean} [forceLargeResult] Force query even when exceeding the size limit (20MB).
     * @param {boolean} [forceRebuild] Force the regeneration of the derivatives.
     * @returns {Promise<IDerivativeTree>} Viewable object tree.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    public async getDerivativeTree(urn: string, guid: string, forceLargeResult?: boolean, forceRebuild?: boolean): Promise<IDerivativeTree> {
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.derivativesApi.getModelviewMetadata(urn, guid, { xAdsForce: forceRebuild, forceget: forceLargeResult }, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Retrieves properties of a specific derivative.
     * @link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-properties-GET
     * @async
     * @param {string} urn Document derivative URN.
     * @param {string} guid Viewable GUID.
     * @param {number} objectId Optional ID of a single object to retrieve the properties for.
     * @param {boolean} [forceLargeResult] Force query even when exceeding the size limit (20MB).
     * @param {boolean} [forceRebuild] Force the regeneration of the derivatives.
     * @returns {Promise<IDerivativeProps>} Viewable properties.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    public async getDerivativeProperties(urn: string, guid: string, objectId?: number, forceLargeResult?: boolean, forceRebuild?: boolean): Promise<IDerivativeProperties> {
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.derivativesApi.getModelviewProperties(urn, guid, { xAdsForce: forceRebuild, forceget: forceLargeResult, objectid: objectId }, null as unknown as AuthClient, credentials);
        return response.body.data;
    }

    /**
     * Downloads content of a specific model derivative.
     * @link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-derivativeurn-GET
     * @async
     * @param {string} modelUrn Model URN.
     * @param {string} derivativeUrn Derivative URN.
     * @returns {Promise<Buffer>} Derivative content.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    public async getDerivative(modelUrn: string, derivativeUrn: string): Promise<Buffer> {
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.derivativesApi.getDerivativeManifest(modelUrn, derivativeUrn, {}, null as unknown as AuthClient, credentials);
        return response.body;
    }

    /**
     * Retrieves derivative thumbnail.
     * @link https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-thumbnail-GET
     * @async
     * @param {string} urn Document derivative URN.
     * @param {ThumbnailSize} [size=ThumbnailSize.Medium] Thumbnail size (small: 100x100 px, medium: 200x200 px, or large: 400x400 px).
     * @returns {Promise<ArrayBuffer>} Thumbnail data.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    public async getThumbnail(urn: string, size: ThumbnailSize = ThumbnailSize.Medium): Promise<Buffer> {
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.derivativesApi.getThumbnail(urn, { width: size }, null as unknown as AuthClient, credentials);
        return response.body;
    }
}

/**
 * Converts ID of an object to base64-encoded URN expected by {@link ModelDerivativeClient}.
 * @param {string} id Object ID.
 * @returns {string} base64-encoded object URN.
 * @example
 *     urnify('urn:adsk.objects:os.object:my-bucket/my-file.dwg'); // returns 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bXktYnVja2V0L215LWZpbGUuZHdn'
 */
export function urnify(id: string): string {
    return Buffer.from(id).toString('base64').replace(/=/g, '');
}
