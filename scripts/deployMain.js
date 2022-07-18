const { ethers, upgrades } = require("hardhat")

async function main() {
    const Main = await ethers.getContractFactory("Main")
    const main = await upgrades.deployProxy(Main)
    await main.deployed()

    console.log("main deployed to address", main.address)
}

main()
.then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
