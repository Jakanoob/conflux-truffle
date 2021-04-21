const util = require('util');
const debug = require("debug")("provider-proxy");

function send(payload, callback) {
    let _this = this;
    const adapted = this.chainAdaptor(payload);

    if (adapted.then) {
        return adapted.then(execute).catch(wrappedCallback);
    }

    try {
        execute(adapted);
    } catch (err) {
        wrappedCallback(err);
    }


    function wrappedCallback(err, result) {
        if (result && result.error && result.error.message) {
            let errData = result.error.data;
            result.error.message += errData ? `\n> error data: ${util.inspect(errData)}` : "";
        }
        if (err) debug("error:", err.stack);
        callback(err, result);
    };

    function execute(_adapted) {
        if (_adapted.adaptedSend)
            return _adapted.adaptedSend(_this.supersend.bind(_this), payload, wrappedCallback);

        _this.superSend(_adapted.adaptedPayload, function (err, result) {
            let adaptorResult = result && _adapted.adaptedOutputFn(result);
            debug("adaptor rpc:", util.inspect({
                request: _adapted.adaptedPayload,
                response: adaptorResult
            }, { depth: null }), "\n");

            if (adaptorResult && adaptorResult.error && adaptorResult.error.message) {
                let payloadInfo = `\n> adapted payload is: ${JSON.stringify(
                    _adapted.adaptedPayload
                )}`;
                if (!adaptorResult.error.message.endsWith(payloadInfo))
                    adaptorResult.error.message += payloadInfo;
            }
            wrappedCallback(err, adaptorResult);
        });
    };
};

module.exports={
    send
};