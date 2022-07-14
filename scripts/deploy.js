const { ethers, upgrades } = require("hardhat")

async function main() {
    const Main = await ethers.getContractFactory("Main")
    const main = await Main.deploy()
    await main.deployed()

    const Transfer = await ethers.getContractFactory("Transfer")
    const transfer = await upgrades.deployProxy(Transfer, [main.address], {
        initializer: "initialize",
    })
    await transfer.deployed()

    console.log("main deployed to address", main.address, "\ntransfer deployed to address", transfer.address)
}

main()
.then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
