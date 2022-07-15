require("@nomiclabs/hardhat-waffle")
require('@openzeppelin/hardhat-upgrades')
require("solidity-coverage")
require("@nomiclabs/hardhat-etherscan")
require('@nomiclabs/hardhat-ethers');

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: "0.8.12",
    // defaultNetwork: "ropsten",
    // networks: {
    //     ropsten: {
    //         url: process.env.INFURA_API_KEY,
    //         accounts: [process.env.PRI_KEY],
    //     },
    // },
    // etherscan: {
    //     apiKey: process.env.API_KEY,
    // }
};
