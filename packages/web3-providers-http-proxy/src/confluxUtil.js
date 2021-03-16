const util = require('./util');
const yargs = require("yargs/yargs");


async function detectNetworkId() {
  const { Environment } = require("@truffle/environment");
  const Config = require("@truffle/config");
  
  const inputArguments = process.argv.slice(2);
  let args = yargs();
  let argv = args.parse(inputArguments);
  
  const config = Config.detect({network:argv.network});
  await Environment.detect(config);
  return config.networks[config.network].network_id;
}

module.exports = {
  ...util,
  detectNetworkId,
};
