const { ropstenSecret, rinkebySecret } = require("./secret");

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.7",
  paths: {
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ropsten: {
      url: ropstenSecret.url,
      accounts: [ropstenSecret.key],
    },
    rinkeby: {
      url: rinkebySecret.url,
      accounts: [rinkebySecret.key],
    },
  },
};
