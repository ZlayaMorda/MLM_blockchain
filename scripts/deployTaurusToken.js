const { ethers } = require("hardhat")

async function main() {
    const TaurusToken = await ethers.getContractFactory("TaurusToken")
    const taurusToken = await TaurusToken.deploy({value: ethers.utils.parseEther("10000")})
    await taurusToken.deployed()

    console.log("main deployed to address", taurusToken.address)
}

main()
.then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
