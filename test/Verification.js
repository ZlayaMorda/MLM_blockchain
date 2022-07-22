const { ethers } = require("hardhat")
const { expect } = require("chai")

describe("Verification", function() {
    let user
    let owner
    let signer
    let verification

    before(async function() {
        [owner, signer, user] = await ethers.getSigners()

        const Verification = await ethers.getContractFactory("Verification", owner)
        verification = await Verification.deploy()
        await verification.deployed()
        await verification.connect(owner).setSignerAddress(signer.address)
    })

    it("Correct deploy", async function() {
        await expect(verification.address).to.be.properAddress
    })

    it("Correct revert setter", async function() {
        await expect(verification.connect(signer).setSignerAddress(signer.address))
            .to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Correct verification", async function() {

        const domain = {
            name: 'TRS',
            version: '1',
            chainId: 31337,
            verifyingContract: verification.address
        };

        const types = {
            SignatureMessage: [
                { name: 'userWallet', type: 'address'},
                { name: 'salt', type: 'uint256'},
                { name: 'amount', type: 'uint256'},
                { name: 'name', type: 'string'}
            ]
        };

        const value = {
            userWallet: user.address,
            salt: 1234,
            amount: 1,
            name: "TRS"
        };

        const signature = await signer._signTypedData(domain, types, value)

        console.log(signer.address)
        await expect(await verification.connect(user).verify({
            userWallet: user.address,
            salt: 1234,
            amount: 1,
            name: "TRS",
            signature: signature
        })).to.be.true
    })

})
