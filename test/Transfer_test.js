const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")

describe("Transfer", function() {
    let owner;
    let main;
    let transfer;

    beforeEach(async function() {
        [owner] = await ethers.getSigners()
        const Main = await ethers.getContractFactory("Main", owner)
        main = await Main.deploy()
        await main.deployed()
        console.log("main deployed to ", main.address)
        const Transfer = await ethers.getContractFactory("Transfer", owner)
        transfer = await upgrades.deployProxy(Transfer, [main.address], {
            initializer: "initialize",
        })
        await transfer.deployed()
        console.log("owner", transfer.owner())
        console.log("transfer deployed to ", transfer.address)
    })

    it("Correct deploy addresses", async function() {
        expect(main.address).to.be.properAddress
        expect(transfer.address).to.be.properAddress
        expect(await transfer.getAddress()).to.equal(main.address)
    })

    it("Correct upgrade transfer", async function() {
        const TransferV2 = await ethers.getContractFactory("Transfer")
        await upgrades.upgradeProxy(transfer.address, TransferV2)
        expect(transfer.address).to.be.properAddress
        expect(await transfer.getAddress()).to.equal(main.address)
    })

    it("Correct get contract sum", async function() {
        expect(await transfer.connect(owner).getContractSum()).to.equal(0)
    })
})
