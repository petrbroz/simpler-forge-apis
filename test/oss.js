const assert = require('assert');
const { OSSClient } = require('../dist');

describe('OSSClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, TEST_BUCKET_KEY, TEST_OBJECT_KEY } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        assert(TEST_BUCKET_KEY);
        assert(TEST_OBJECT_KEY);
        this.client = new OSSClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
        this.testBucketKey = TEST_BUCKET_KEY;
        this.testObjectKey = TEST_OBJECT_KEY;
        this.timeout(30 * 1000); // Increase timeout to 30 seconds
    });

    describe('listBuckets()', function() {
        it('should return a list of buckets', async function() {
            const buckets = await this.client.listBuckets();
            assert(buckets.length > 0);
        });
    });

    describe('enumerateBuckets()', function() {
        it('should enumerate over buckets', async function() {
            for await (const buckets of this.client.enumerateBuckets()) {
                assert(buckets.length > 0);
                break;
            }
        });
    });

    describe('getBucketDetails()', function() {
        it('should retrieve bucket details', async function () {
            const bucket = await this.client.getBucketDetails(this.testBucketKey);
            assert(bucket.bucketKey === this.testBucketKey);
        });
    });

    describe('listObjects()', function() {
        it('should return a list of objects', async function() {
            const objects = await this.client.listObjects(this.testBucketKey);
            assert(objects.length > 0);
        });
        it('should only list objects with given prefix', async function() {
            const prefix = 'p';
            const objects = await this.client.listObjects(this.testBucketKey, prefix);
            for (const obj of objects) {
                assert(obj.objectKey.startsWith(prefix));
            }
        });
    });

    describe('enumerateObjects()', function() {
        it('should enumerate over objects', async function() {
            for await (const objects of this.client.enumerateObjects(this.testBucketKey)) {
                assert(objects.length > 0);
                break;
            }
        });
        it('should only enumerate over objects with given prefix', async function() {
            const prefix = 'p';
            for await (const objects of this.client.enumerateObjects(this.testBucketKey, prefix)) {
                for (const obj of objects) {
                    assert(obj.objectKey.startsWith(prefix));
                }
            }
        });
    });

    describe('getObjectDetails()', function() {
        it('should retrieve object details', async function () {
            const object = await this.client.getObjectDetails(this.testBucketKey, this.testObjectKey);
            assert(object.objectKey === this.testObjectKey);
        });
    });
});
