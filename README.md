# simpler-forge-apis

Experimental wrapper around the official Autodesk Forge SDK providing higher-level abstractions
and ideally an easier-to-work-with interface.

## Benefits

- Different clients generate their own access tokens as needed
  - No need to manage them manually
  - But if you still want to, you can - just pass in an existing access token instead of client ID/secret
- Endpoints returning lists of results can either be enumerated or returned as one large list
  - No need to write custom `while` loops paging through the results
- Additional settings such as host or region can be configured (and remembered) once per client instance
  - No need to repeat these in every API call
- Logically grouped clients, e.g., a single class for all OSS endpoints
  - No need to instantiate `ObjectsApi` and `BucketsApi` separately
- Returns the data directly
  - No need to pick the results from `response.body`

Compare these two implementations of going through the OSS objects in a bucket:

Using the standard APIs:

```js
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

const token = await _getAccessToken(INTERNAL_TOKEN_SCOPES);
let response = await new ObjectsApi().getObjects(BUCKET, { limit: 64 }, null, token);
let objects = response.body.items;
while (response.body.next) {
    const startAt = new URL(response.body.next).searchParams.get('startAt');
    response = await new ObjectsApi().getObjects(BUCKET, { limit: 64, startAt }, null, token);
    objects = objects.concat(response.body.items);
}
```

Using the simplified APIs:

```js
const client = new OSSClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
const objects = await client.listObjects(BUCKET);
```
