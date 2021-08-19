const assert = require('assert');

const { ModelDerivativeClient } = require('..');

describe('ModelDerivativeClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET, TEST_MODEL_URN, TEST_VIEWABLE_GUID } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        assert(TEST_MODEL_URN);
        assert(TEST_VIEWABLE_GUID);
        this.client = new ModelDerivativeClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
        this.testModelUrn = TEST_MODEL_URN;
        this.testViewableGuid = TEST_VIEWABLE_GUID;
    });

    describe('formats()', function() {
        it('should return a list of formats', async function() {
            const formats = await this.client.getFormats();
            assert(formats);
        });
    });

    describe('getManifest()', function() {
        it('should return derivative manifest', async function() {
            const manifest = await this.client.getManifest(this.testModelUrn);
            assert(manifest);
        });
    });

    describe('getMetadata()', function() {
        it('should return all viewables in a derivative', async function() {
            const metadata = await this.client.getMetadata(this.testModelUrn);
            assert(metadata);
        });
    });

    describe('getDerivativeTree()', function() {
        it('should return the logical tree of a viewable', async function() {
            const tree = await this.client.getDerivativeTree(this.testModelUrn, this.testViewableGuid);
            assert(tree);
        });
    });

    describe('getDerivativeProperties()', function() {
        it('should return properties of an entire viewable', async function() {
            const props = await this.client.getDerivativeProperties(this.testModelUrn, this.testViewableGuid);
            assert(props);
        });
        it('should return properties of a single object', async function() {
            const props = await this.client.getDerivativeProperties(this.testModelUrn, this.testViewableGuid, 1);
            assert(props);
        });
    });

    describe('getThumbnail()', function() {
        it('should return all viewables in a derivative', async function() {
            const thubmnail = await this.client.getThumbnail(this.testModelUrn);
            assert(thubmnail);
        });
    });
});
