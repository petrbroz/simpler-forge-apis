const assert = require('assert');

const { DataManagementClient } = require('..');

describe('DataManagementClient', function() {
    beforeEach(function() {
        const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
        assert(FORGE_CLIENT_ID);
        assert(FORGE_CLIENT_SECRET);
        // this.testHubId = '';
        this.client = new DataManagementClient({ client_id: FORGE_CLIENT_ID, client_secret: FORGE_CLIENT_SECRET });
    });

    describe('listHubs()', function() {
        it('should return list of hubs', async function() {
            const hubs = await this.client.listHubs();
            assert(hubs);
        });
    });

    // describe('listProjects()', function() {
    //     it('should return list of projects', async function() {
    //         const projects = await this.client.listProjects(this.testHubId);
    //         assert(projects);
    //     });
    // });
});
