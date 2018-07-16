const rp = require('request-promise');
const uuid = require('uuid');
const now = require('performance-now');

const multichainHost = process.env.MULTICHAIN_HOST || 'localhost';
const URL = `http://${multichainHost}:8571`;
const ASSEST_TO_CREATE = process.env.ASSETS_TO_CREATE || 100;
const headers = {
    'content-type': 'text/plain',
};
const auth = {
    user: 'user',
    pass: 'local-password',
};

async function getAddress() {
    const body = JSON.stringify({ jsonrpc: '1.0', id: 'test', method: 'listaddresses', params: [] });
    const options = { url: URL, method: 'GET', headers, auth, body };

    const response = await rp(options);
    const responseObj = JSON.parse(response);
    return responseObj.result[0].address;
}

async function issue(counter, address) {
    const assetId = uuid.v4().replace(/-/g, ''); // remove hyphens from uuid as its longer than max length of asset name
    const metadata = {
        streamId: `streamId-${counter}`, // Not a real stream id in this example, just metadata
        cData: `c-${counter}`,
        lData: `l-${counter}`,
        sData: `s-${counter}`,
        mData: `m-${counter}`,
        dateCreated: new Date().toString(),
    };

    const body = JSON.stringify({ jsonrpc: '1.0', id: 'test', method: 'issuefrom', params: [address, address, assetId, 1, 1, 0, metadata] });
    const options = { url: URL, method: 'POST', headers, auth, body };

    const start = now();
    const response = await rp(options);
    const end = now();
    const duration = (end - start).toFixed(1);
    console.log(`${counter}, ${duration}`);
    return response.body;
}

async function directTest() {
    const address = await getAddress();
    const start = now();
    for (let i = 0; i < ASSEST_TO_CREATE; i += 1) {
        await issue(i, address);
    }
    const end = now();
    const duration = (end - start).toFixed(1) / 1000;
    console.log(`It took ${duration} seconds to generate ${ASSEST_TO_CREATE} assets`);
}

directTest();
