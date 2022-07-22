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
        class Message {
            userWallet
            salt
            amount
            name
            signature
            constructor(userWallet, salt, amount, name, signature) {
                this.userWallet = userWallet
                this.salt = salt
                this.amount = amount
                this.name = name
                this.signature = signature
            }
        }

        const domain = {
            name: 'Ether Mail',
            version: '1',
            chainId: 1,
            verifyingContract: signer.address
        };

        const types = {
            SignatureMessage: [
                { name: 'userWallet', type: 'address'},
                { name: 'salt', type: 'uint256'},
                { name: 'amount', type: 'uint256'},
                { name: 'name', type: 'string'}
                // { name: 'signature', type: 'string'}
            ]
        };

        const value = {
            userWallet: user.address,
            salt: 1234,// BigInt("1234"),
            amount: 1,//BigInt("1"),
            name: "TRS"
        };

        const signature = await signer._signTypedData(domain, types, value)

        const message = new Message(
            user.address,
            1234,
            1,
            "TRS",
            signature
        )
        // console.log(user.address)
        // console.log(signer.address)
        // console.log(await verification.connect(user).getAddress(message))
        await expect(await verification.connect(user).verify(message)).to.be.equal(true)
    })

})
