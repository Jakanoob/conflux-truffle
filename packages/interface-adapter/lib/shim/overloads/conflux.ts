import { Web3Shim } from "..";
import cfxsdk from "js-conflux-sdk";
// @ts-ignore
import { ethToConflux, HttpProvider } from "web3-providers-http-proxy";
const debug = require("debug")("interface-adapter:conflux.ts");

// We simply return plain ol' Web3.js
export const ConfluxDefinition = {
  async initNetworkType(web3: Web3Shim) {
    overrides.initCfx(web3);
    overrides.provider(web3);
  }
};

var cfx: cfxsdk.Conflux;

const overrides = {
  initCfx: (web3: Web3Shim) => {
    // save cfx object
    cfx = new cfxsdk.Conflux({
      // @ts-ignore
      url: web3.currentProvider.host // TODO get network config from web3 object
      // @ts-ignore
      // logger:console
    });
    // @ts-ignore
    cfx.updateNetworkId().catch(debug);

    // @ts-ignore
    web3.cfx = cfx;
    // @ts-ignore
    web3.cfxsdk = cfxsdk;
    // @ts-ignore
    cfx.getAccounts = web3.eth.getAccounts;
  },

  provider: (web3: Web3Shim) => {
    if (!(web3.currentProvider instanceof HttpProvider)) {
      let provider = new HttpProvider(
        // @ts-ignore
        web3.currentProvider.host,
        {
          keepAlive: false,
          // @ts-ignore
          chainAdaptor: ethToConflux({ url: web3.currentProvider.host })
        }
      );
      web3.setProvider(provider);
    }
  },
};
