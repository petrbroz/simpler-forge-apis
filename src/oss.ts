import { AuthClient, BucketsApi, ObjectsApi, Scope, ApiClient, PostBucketsPayload } from 'forge-apis';
import { IAuthProvider, StaticAuthProvider, TwoLeggedAuthProvider } from './auth';

type AuthOptions = { access_token: string } | { client_id: string, client_secret: string };

export enum Region {
    US = 'us',
    EMEA = 'emea'
}

export interface IClientOptions {
    region: Region;
    host: string;
}

export interface IBucket {
    bucketKey: string;
    createdDate: number;
    policyKey: string;
}

export interface IBucketPermission {
    authId: string;
    access: string;
}

export interface IBucketDetails extends IBucket {
    bucketOwner: string;
    permissions: IBucketPermission[];
}

export enum DataRetentionPolicy {
    Transient = 'transient',
    Temporary = 'temporary',
    Persistent = 'persistent'
}

export interface IObject {
    objectKey: string;
    bucketKey: string;
    objectId: string;
    sha1: string;
    size: number;
    location: string;
}

export interface ISignedUrl {
    signedUrl: string;
    expiration: number;
    singleUse: boolean;
}

const DefaultPageSize = 64;
const DefaultHost = 'https://developer.api.autodesk.com';
const ReadTokenScopes: Scope[] = ['bucket:read', 'data:read'];
const WriteTokenScopes: Scope[] = ['bucket:create', 'bucket:delete', 'data:write'];

export class OSSClient {
    protected authProvider: IAuthProvider;
    protected host: string;
    protected region: Region;
    protected apiClient: ApiClient;
    protected bucketsApi: BucketsApi;
    protected objectsApi: ObjectsApi;

    constructor(protected auth: AuthOptions, options?: IClientOptions) {
        if ('access_token' in auth) {
            this.authProvider = new StaticAuthProvider(auth.access_token);
        } else {
            this.authProvider = new TwoLeggedAuthProvider(auth.client_id, auth.client_secret);
        }
        this.host = options?.host || DefaultHost;
        this.region = options?.region || Region.US;
        this.apiClient = new ApiClient(this.host);
        this.bucketsApi = new BucketsApi(this.apiClient);
        this.objectsApi = new ObjectsApi(this.apiClient);
    }

    // #region Buckets

    /**
     * Enumerates all buckets in pages/batches of predefined size.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET
     * @async
     * @generator
     * @param {number} [pageSize] Max number of buckets to receive in one batch (allowed values: 1-100).
     * @yields {AsyncIterable<IBucket[]>} Bucket batches.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    public async *enumerateBuckets(pageSize: number = DefaultPageSize): AsyncIterable<IBucket[]> {
        // TODO: validate input params
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        let response = await this.bucketsApi.getBuckets({ limit: pageSize, region: this.region }, null as unknown as AuthClient, credentials);
        yield response.body.items;
        while (response.body.next) {
            // TODO: refresh credentials when needed
            const startAt = new URL(response.body.next).searchParams.get('startAt') as string;
            response = await this.bucketsApi.getBuckets({ limit: pageSize, startAt, region: this.region }, null as unknown as AuthClient, credentials);
            yield response.body.items;
        }
    }

    /**
     * Lists all buckets.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET
     * @async
     * @returns {Promise<IBucket[]>} List of buckets.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    public async listBuckets(): Promise<IBucket[]> {
        let buckets: IBucket[] = [];
        for await (const page of this.enumerateBuckets()) {
            buckets = buckets.concat(page);
        }
        return buckets;
    }

    /**
     * Retrieves details of a specific bucket.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-details-GET
     * @async
     * @param {string} bucketKey Bucket key.
     * @returns {Promise<IBucketDetails>} Bucket details.
     * @throws Error when the request fails, for example, due to insufficient rights, or when a bucket
     * with this name does not exist.
     */
    public async getBucketDetails(bucketKey: string): Promise<IBucketDetails> {
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.bucketsApi.getBucketDetails(bucketKey, null as unknown as AuthClient, credentials);
        return response.body;
    }

    /**
     * Creates a new bucket.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-POST
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {DataRetentionPolicy} policyKey Data retention policy for objects uploaded to this bucket.
     * @param {object[]} [allow] Optional list of access authorizations for other Forge applications.
     * @returns {Promise<IBucketDetails>} Bucket details.
     * @throws Error when the request fails, for example, due to insufficient rights, incorrect scopes,
     * or when a bucket with this name already exists.
     */
    public async createBucket(bucketKey: string, policyKey: DataRetentionPolicy, allow?: { authId: string, access: 'full' | 'read' }[]): Promise<IBucketDetails> {
        const credentials = await this.authProvider.getToken(WriteTokenScopes);
        const payload: PostBucketsPayload = { bucketKey, policyKey, allow };
        const response = await this.bucketsApi.createBucket(payload, { xAdsRegion: this.region }, null as unknown as AuthClient, credentials);
        return response.body;
    }

    // #endregion

    // #region Objects

    /**
     * Enumerates all objects in a bucket in pages/batches of predefined size.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET
     * @async
     * @generator
     * @param {string} bucketKey Bucket key.
     * @param {string} [beginsWith] Optional filter to only return objects whose keys are prefixed with this value.
     * @param {number} [pageSize] Max number of objects to receive in one batch (allowed values: 1-100).
     * @yields {AsyncIterable<IObject[]>} Object batches.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    public async *enumerateObjects(bucketKey: string, beginsWith?: string, pageSize: number = DefaultPageSize): AsyncIterable<IObject[]> {
        // TODO: validate input params
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        let response = await this.objectsApi.getObjects(bucketKey, { limit: pageSize, beginsWith }, null as unknown as AuthClient, credentials);
        yield response.body.items;
        while (response.body.next) {
            // TODO: refresh credentials when needed
            const startAt = new URL(response.body.next).searchParams.get('startAt') as string;
            response = await this.objectsApi.getObjects(bucketKey, { limit: pageSize, startAt, beginsWith }, null as unknown as AuthClient, credentials);
            yield response.body.items;
        }
    }

    /**
     * Lists all objects in a bucket.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {string} [beginsWith] Optional filter to only return objects whose keys are prefixed with this value.
     * @returns {Promise<IObject[]>} List of objects.
     * @throws Error when the request fails, for example, due to insufficient rights, or incorrect scopes.
     */
    public async listObjects(bucketKey: string, beginsWith?: string): Promise<IObject[]> {
        let objects: IObject[] = [];
        for await (const page of this.enumerateObjects(bucketKey, beginsWith)) {
            objects = objects.concat(page);
        }
        return objects;
    }

    /**
     * Gets details of a specific object.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-details-GET
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {string} objectKey Object name.
     * @returns {Promise<IObject>} Object details.
     * @throws Error when the request fails, for example, due to insufficient rights, or when an object
     * with this name does not exist.
     */
    public async getObjectDetails(bucketKey: string, objectKey: string): Promise<IObject> {
        const credentials = await this.authProvider.getToken(ReadTokenScopes);
        const response = await this.objectsApi.getObjectDetails(bucketKey, objectKey, {}, null as unknown as AuthClient, credentials);
        return response.body;
    }

    /**
     * Creates signed URL for specific object.
     * @link https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-signed-POST
     * @async
     * @param {string} bucketKey Bucket key.
     * @param {string} objectKey Object key.
     * @param {string} [access="readwrite"] Signed URL access authorization.
     * @param {number} [minutesExpiration=60] Optional expiration time (in minutes).
     * @returns {Promise<ISignedUrl>} New signed URL resource.
     * @throws Error when the request fails, for example, due to insufficient rights.
     */
    public async createSignedUrl(bucketKey: string, objectKey: string, access: 'read' | 'write' | 'readwrite' = 'read', minutesExpiration: number = 60): Promise<ISignedUrl> {
        const credentials = await this.authProvider.getToken(WriteTokenScopes);
        const response = await this.objectsApi.createSignedResource(bucketKey, objectKey, { minutesExpiration }, { access }, null as unknown as AuthClient, credentials);
        return response.body;
    }

    // #endregion
}
