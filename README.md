# simpler-forge-apis

![publish to npm](https://github.com/petrbroz/simpler-forge-apis/workflows/Publish%20to%20NPM/badge.svg)
[![npm version](https://badge.fury.io/js/simpler-forge-apis.svg)](https://badge.fury.io/js/simpler-forge-apis)
![node](https://img.shields.io/node/v/simpler-forge-apis.svg)
![npm downloads](https://img.shields.io/npm/dw/simpler-forge-apis.svg)
![platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)

Experimental wrapper around the official [Autodesk Forge SDK](https://github.com/Autodesk-Forge/forge-api-nodejs-client)
providing higher-level abstractions and (hopefully) an easier-to-work-with API.

- Documentation: https://unpkg.com/simpler-forge-apis@latest/docs/index.html
- Completeness: [see STATUS.md](./STATUS.md)

## Motivation

- With the official SDK you have to maintain access tokens yourself which can be a bit of a hassle,
and you have to pass tokens to individual API calls. This library handles all of that for you:

```js
// Using the official SDK

let _tokenCache = new Map();

async function _getAccessToken(scopes) {
    const key = scopes.join(',');
    let token = _tokenCache.get(key);
    if (!token || token.expires_at < Date.now()) {
        const client = new AuthClientTwoLegged(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, scopes);
        token = await client.authenticate();
        token.expires_at = Date.now() + token.expires_in * 1000;
        _tokenCache.set(key, token);
    }
    return {
        access_token: token.access_token,
        expires_in: Math.round((token.expires_at - Date.now()) / 1000)
    };
}

const token = await _getAccessToken(['viewables:read']);
console.log(await new DerivativesApi().getFormats({}, null, token));
console.log(await new DerivativesApi().getManifest(URN, {}, null, token));

// Using this library

const client = new ModelDerivativeClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
console.log(await client.getFormats());
console.log(await client.getManifest(URN));

// Or, if you already have an existing token you want to reuse

const client = new ModelDerivativeClient({ access_token: ACCESS_TOKEN });
console.log(await client.getFormats());
console.log(await client.getManifest(URN));
```

- The official SDK typically returns complete response objects (with body, status code, etc.),
and when working with endpoints that return _lists_ of data, it typically leaves the pagination or
collection to you. This library takes care of that as well:

```js
// Using the official SDK

const token = await _getAccessToken(['data:read']);
let response = await new ObjectsApi().getObjects(BUCKET, { limit: 64 }, null, token);
let objects = response.body.items;
while (response.body.next) {
    const startAt = new URL(response.body.next).searchParams.get('startAt');
    response = await new ObjectsApi().getObjects(BUCKET, { limit: 64, startAt }, null, token);
    objects = objects.concat(response.body.items);
}
console.log(objects);

// Using this library

const client = new OSSClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
console.log(await client.listObjects(BUCKET));

// Or, paging through the results using the `for await` loop

for await (const batch of client.enumerateObjects(BUCKET)) {
    console.log(batch);
}
```

- When working with different regions, the official SDK sometimes expects these to be provided per
each method call, and sometimes per each class instance. And when working with custom hosts, you
need to pass in a custom `ApiClient` object. In this library the region and host are always defined
per class instance:

```js
// Using the official SDK

const token = await _getAccessToken(['bucket:read', 'viewables:read']);
const apiClient = new ApiClient('https://developer-dev.api.autodesk.com');

const bucketsApi = new BucketsApi(apiClient);
let response = await bucketsApi.getBuckets({ limit: 64, region: 'EMEA' }, null, token);
let buckets = response.body.items;
while (response.body.next) {
    const startAt = new URL(response.body.next).searchParams.get('startAt') as string;
    response = await bucketsApi.getBuckets({ limit: 64, startAt, region: 'EMEA' }, null, credentials);
    buckets = buckets.concat(response.body.items);
}
console.log(buckets);

const derivativesApi = new DerivativesApi(apiClient, 'EMEA');
console.log(await derivativesApi.getManifest(URN, {}, null, token));

// Using this library

const options = { region: Region.EMEA, host: 'https://developer-dev.api.autodesk.com' };
const ossClient = new OSSClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET }, options);
console.log(await ossClient.listBuckets());
const mdClient = new ModelDerivativeClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET }, options);
console.log(await mdClient.getManifest(URN));
```

## Usage

1. Install the library to your project:

```bash
# using npm
npm install simpler-forge-apis

# using yarn
yarn add simpler-forge-apis
```

2. Import the classes you'll be working with, for example:

```js
// in JavaScript
const { DataManagementClient, ModelDerivativeClient, TwoLeggedAuthProvider } = require('simpler-forge-apis');

// in TypeScript
import { DataManagementClient, ModelDerivativeClient, TwoLeggedAuthProvider } from 'simpler-forge-apis';
```

3. Instantiate the clients with specific auth options:

```js
// by passing in an existing access token
let dataManagementClient = new DataManagementClient({ access_token: FORGE_ACCESS_TOKEN });

// by passing in your application's client ID and secret (so each instance will generate its own tokens)
let dataManagementClient = new DataManagementClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });

// by passing in a shared 2-legged OAuth provider
let twoLeggedAuthProvider = new TwoLeggedAuthProvider(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);
let dataManagementClient = new DataManagementClient(twoLeggedAuthProvider);
let modelDerivativeClient = new ModelDerivativeClient(twoLeggedAuthProvider);

// by passing in a custom auth provider
const customAuthProvider = {
    async getToken(scopes) {
        // Get the token for the given set of scopes from somewhere, for example, from a database.
        // The returned object should contain 3 properties: `access_token` (the actual token string),
        // `token_type` (always "Bearer"), and `expires_in` (expiration time in seconds).
        return { access_token: '...', token_type: 'Bearer', expires_in: 3599 };
    }
};
let dataManagementClient = new DataManagementClient(customAuthProvider);
```
