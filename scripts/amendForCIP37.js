const fs = require("fs");
const path = require("path");

const replaces = [
  {
    old: "var inputAddressFormatter = function (address) {",
    new: "var inputAddressFormatter = function (address)  { return address",
    filePattern: /.*node_modules\/web3-core-helpers\/(src|lib)\/formatters\.js/g
  },
  {
    old:
      "    if(options.data && !utils.isHex(options.data)) {\n" +
      "        throw new Error('The data field must be HEX encoded data.');\n" +
      "    }",

    new:
      "//    if(options.data && !utils.isHex(options.data)) {\n" +
      "//        throw new Error('The data field must be HEX encoded data.');\n" +
      "//    }",
    filePattern: /.*node_modules\/web3-core-helpers\/src\/formatters\.js/g
  },
  {
    old: "var toChecksumAddress = function (address) {",
    new: "var toChecksumAddress = function (address)  { return address",
    filePattern: /.*node_modules\/web3-utils\/(src|lib)\/index\.js/g
  },
  {
    old: "function isAddress(address) {",
    new: "function isAddress(address)  { return true",
    filePattern: /node_modules\/@ethersproject\/address\/lib\/index\.js/g
  },
  {
    old: "var isAddress = function (address) {",
    new: "var isAddress = function (address)  { return true",
    filePattern: /.*node_modules\/web3-utils\/(src|lib)\/(index|utils)\.js/g
  }
];

function foreachFilesInPath(fPath, callback) {
  const fstat = fs.lstatSync(fPath);
  if (fstat.isDirectory()) {
    const dir = fs.readdirSync(fPath);

    dir.forEach(subDir =>
      foreachFilesInPath(path.join(fPath, subDir), callback)
    );
    return;
  }

  if (fstat.isFile) {
    callback(fPath);
  }
}

function deepReplaceDir() {
  let root = path.join(__dirname, "../");
  console.log("deep amend checksum functions in root path:", root);
  foreachFilesInPath(root, fPath => {
    replaces.forEach(i => {
      if (i.filePattern.test(fPath)) {
        console.log("replace file", fPath);
        let content = fs.readFileSync(fPath).toString();
        content = content.replaceAll(i.old, i.new);
        fs.writeFileSync(fPath, content);
      }
    });
  });
}

deepReplaceDir();
