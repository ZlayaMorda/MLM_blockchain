require("@nomiclabs/hardhat-waffle")
require('@openzeppelin/hardhat-upgrades')
require("solidity-coverage")
require("@nomiclabs/hardhat-etherscan")
require('@nomiclabs/hardhat-ethers');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    defaultNetwork: "ropsten",
    networks: {
        ropsten: {
            url: process.env.INFURA_API_KEY,
            accounts: [process.env.PRI_KEY],
        },
    },
    solidity: "0.8.12",
    etherscan: {
        apiKey: process.env.API_KEY,
    }
};
