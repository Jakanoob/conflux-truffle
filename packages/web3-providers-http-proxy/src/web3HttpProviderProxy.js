const Web3HttpProvider = require("web3-providers-http");
const defaultAdaptor = require("./util").defaultAdaptor;
const debug = require("debug")("provider-proxy");
const { send } = require('./lib');

class Web3HttpProviderProxy extends Web3HttpProvider {
  constructor(host, options) {
    super(host, options);
    this.chainAdaptor = options.chainAdaptor || defaultAdaptor;
    this.id = "Web3HttpProviderProxy";
  }

  superSend(payload, callback) {
    super.send(payload, callback);
  }

  send(payload, callback) {
    send.call(this, payload, callback);
  }
}

module.exports = Web3HttpProviderProxy;