const { Web3WsProviderProxy, ethToConflux } = require("../src");
const { genRPCPayload, promiseSend } = require("./");
require("chai").should();

// let url = "ws://127.0.0.1:12535";
let url = "ws://test.confluxrpc.org/ws/v2";
let provider = new Web3WsProviderProxy(url, {
    chainAdaptor: ethToConflux({ url })
});

describe("CFX get RPCs", function () {
    describe("#cfx_blockNumber", function () {
        it("should be string", async function () {
            payload = genRPCPayload("eth_blockNumber");
            let result = await promiseSend(provider, payload);
            result.should.be.a("string");
        });
    });

    describe("#accounts", function () {
        it("should be array", async function () {
            payload = genRPCPayload("eth_accounts");
            let result = await promiseSend(provider, payload);
            result.should.be.a("array");
        });
    });
});
