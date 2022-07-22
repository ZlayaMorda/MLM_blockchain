const { ethers } = require("hardhat")

describe("Verification", function() {
    let owner
    let signer
    let verification

    before(async function() {
        [owner, signer] = ethers.getSigners()

        const Verification = await ethers.getContractFactory("Verification", owner)
        verification = await Verification.deploy()
        await verification.deployed()
    })

    it("Correct deploy", async function() {
        await expect(verification.address).to.be.properAddress
    })

})
