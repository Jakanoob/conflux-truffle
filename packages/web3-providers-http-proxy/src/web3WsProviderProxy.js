const WebsocketProvider = require("web3-providers-ws");
const defaultAdaptor = require("./util").defaultAdaptor;
const debug = require("debug")("Web3WsProviderProxy");
const { send } = require('./lib');

class Web3WsProviderProxy extends WebsocketProvider {
    constructor(url, options) {
        super(url, options);
        this.chainAdaptor = options.chainAdaptor || defaultAdaptor;
        this.id = "wsProviderProxy";
        this.host = url;
    }

    superSend(payload, callback) {
        super.send(payload, callback);
    }

    send(payload, callback) {
        send.call(this, payload, callback);
    }
}

module.exports = Web3WsProviderProxy;