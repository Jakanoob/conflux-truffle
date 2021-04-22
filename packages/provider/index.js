const debug = require("debug")("provider");
const Web3 = require("web3");
const { createInterfaceAdapter } = require("@truffle/interface-adapter");
const wrapper = require("./wrapper");
const DEFAULT_NETWORK_CHECK_TIMEOUT = 5000;
const providerProxy = require("web3-providers-http-proxy");
const { promisify } = require('util');

module.exports = {
  wrap: function (provider, options) {
    return wrapper.wrap(provider, options);
  },

  create: function (options) {
    const provider = this.getProvider(options);
    return this.wrap(provider, options);
  },

  getProvider: function (options) {
    let provider;
    let isConflux = !options.type || options.type == "conflux";
    if (options.provider && typeof options.provider === "function") {
      provider = options.provider();
    } else if (options.provider) {
      provider = options.provider;
    } else if (options.websockets || /^wss?:\/\//.test(options.url)) {
      if (isConflux) {
        return new providerProxy.Web3WsProviderProxy(
          options.url || `http://${options.host}:${options.port}`, {
          keepAlive: false,
          chainAdaptor: providerProxy.ethToConflux(options)
        });
      }
      return new Web3.providers.WebsocketProvider(
        options.url || "ws://" + options.host + ":" + options.port
      );
    } else {
      if (isConflux) {
        return new providerProxy.Web3HttpProviderProxy(
          options.url || `http://${options.host}:${options.port}`, {
          keepAlive: false,
          chainAdaptor: providerProxy.ethToConflux(options)
        });
      }
      return new Web3.providers.HttpProvider(
        options.url || `http://${options.host}:${options.port}`,
        { keepAlive: false }
      );
    }
    return provider;
  },

  testConnection: function (options) {
    let networkCheckTimeout, networkType;
    const { networks, network } = options;
    if (networks && networks[network]) {
      networkCheckTimeout =
        networks[network].networkCheckTimeout || DEFAULT_NETWORK_CHECK_TIMEOUT;
      networkType = networks[network].type;
    } else {
      networkCheckTimeout = DEFAULT_NETWORK_CHECK_TIMEOUT;
    }
    const provider = this.getProvider(options);
    const interfaceAdapter = createInterfaceAdapter({ provider, networkType });
    return new Promise((resolve, reject) => {
      const noResponseFromNetworkCall = setTimeout(() => {
        const errorMessage =
          "There was a timeout while attempting to connect to the network." +
          "\n       Check to see that your provider is valid.\n       If you " +
          "have a slow internet connection, try configuring a longer " +
          "timeout in your Truffle config. Use the " +
          "networks[networkName].networkCheckTimeout property to do this.";
        throw new Error(errorMessage);
      }, networkCheckTimeout);

      let networkCheckDelay = 1;
      (function networkCheck() {
        setTimeout(async () => {
          try {
            await interfaceAdapter.getBlockNumber();
            clearTimeout(noResponseFromNetworkCall);
            clearTimeout(networkCheck);
            await nodeVersionCheck();
            return resolve(true);
          } catch (error) {
            console.log(
              "> Something went wrong while attempting to connect " +
              "to the network. Check your network configuration."
            );
            clearTimeout(noResponseFromNetworkCall);
            clearTimeout(networkCheck);
            return reject(error);
          }
          networkCheckDelay *= 2;
          networkCheck();
        }, networkCheckDelay);
      })();

      async function nodeVersionCheck() {
        isConflux = !networkType || networkType === "conflux";
        if (!isConflux){
          const errMsg = `\nUnsupport network type ${networkType}, only support conflux-rust node\n`;
          throw errMsg;
        } 

        let payload = {
          id: Date.now(),
          jsonrpc: "2.0",
          method: "cfx_clientVersion",
        };

        pSend = promisify(provider.send);
        let response = await pSend(payload);
        let version = response && response.result;

        let matchs = /[^d]*(\d\.\d\.\d)[^d]*/ig.exec(version);
        if (matchs && matchs[1] > "1.1.0") {
          return true;
        }

        const errMsg = `\nUnsupport conflux-rust version ${version}, ` +
          `please use conflux-rust version large than 1.1.0\n`;
        throw errMsg;
      };
    });
  },
};
