Which endpoints are already available in this library:

# Auth

## Two-Legged Context

- [x] https://forge.autodesk.com/en/docs/oauth/v2/reference/http/authenticate-POST

## Three-Legged Context

- [x] https://forge.autodesk.com/en/docs/oauth/v2/reference/http/authorize-GET
- [x] https://forge.autodesk.com/en/docs/oauth/v2/reference/http/gettoken-POST
- [x] https://forge.autodesk.com/en/docs/oauth/v2/reference/http/refreshtoken-POST

## Informational

- [x] https://forge.autodesk.com/en/docs/oauth/v2/reference/http/users-@me-GET
- [ ] https://forge.autodesk.com/en/docs/oauth/v2/reference/http/asymmetrickeys-GET

# Data

## OSS

- [ ] Streamed uploads/downloads (currently `ObjectsApi` only seems to accept `string | Buffer` as the payload)

### Buckets

- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-POST
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-GET
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-details-GET
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-DELETE

### Objects

- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-PUT
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-resumable-PUT
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-status-:sessionId-GET
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-GET
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-details-GET
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-signed-POST
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/signedresources-:id-PUT
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/signedresources-:id-resumable-PUT
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/signedresources-:id-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/signedresources-:id-DELETE
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-copyto-:newObjectName-PUT
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-DELETE
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-:objectName-signeds3download-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/buckets-:bucketKey-objects-batchsigneds3download-POST

## Data Management

### Hubs

- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-GET
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-hub_id-GET

### Projects

- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-hub_id-projects-GET
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-hub_id-projects-project_id-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-hub_id-projects-project_id-hub-GET
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/hubs-hub_id-projects-project_id-topFolders-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-downloads-download_id-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-jobs-job_id-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-downloads-POST
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-storage-POST

### Folders

- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-folder_id-GET
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-folder_id-contents-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-folder_id-parent-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-folder_id-refs-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-folder_id-relationships-links-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-folder_id-relationships-refs-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-folder_id-search-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-POST
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-folder_id-relationships-refs-POST
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-folders-folder_id-PATCH

### Items

- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-parent-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-refs-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-relationships-links-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-relationships-refs-GET
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-tip-GET
- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-versions-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-POST
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-relationships-refs-POST
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-items-item_id-PATCH

### Versions

- [x] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-versions-version_id-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-versions-version_id-downloadFormats-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-versions-version_id-downloads-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-versions-version_id-item-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-versions-version_id-refs-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-versions-version_id-relationships-links-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-versions-version_id-relationships-refs-GET
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-versions-POST
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-versions-version_id-relationships-refs-POST
- [ ] https://forge.autodesk.com/en/docs/data/v2/reference/http/projects-project_id-versions-version_id-PATCH

# Model Derivative

## Derivatives

- [x] https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/formats-GET
- [x] https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/job-POST
- [ ] https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-references-POST
- [x] https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-thumbnail-GET
- [x] https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-GET
- [x] https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-DELETE
- [x] https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-derivativeurn-GET
- [x] https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-derivativeurn-HEAD
- [x] https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-GET
- [x] https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-GET
- [x] https://forge.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-metadata-guid-properties-GET
