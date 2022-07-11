const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")
const {deployMockContract} = require("ethereum-waffle")

describe("Transfer", function() {
    let owner
    let main
    let transfer
    let mainMock

    beforeEach(async function() {
        [owner] = await ethers.getSigners()
        const main = require("../artifacts/contracts/interfaces/IMain.sol/IMain.json")
        mainMock = await deployMockContract(owner, main.abi)

        const Transfer = await ethers.getContractFactory("Transfer", owner)
        transfer = await upgrades.deployProxy(Transfer, [mainMock.address], {
            initializer: "initialize",
        })
        await transfer.deployed()
        console.log("transfer deployed to ", transfer.address)
    })

    it("Correct deploy addresses", async function() {
        expect(mainMock.address).to.be.properAddress
        expect(transfer.address).to.be.properAddress
        expect(await transfer.getAddress()).to.equal(mainMock.address)
    })

    it("Correct upgrade transfer", async function() {
        const TransferV2 = await ethers.getContractFactory("Transfer")
        await upgrades.upgradeProxy(transfer.address, TransferV2)
        expect(transfer.address).to.be.properAddress
        expect(await transfer.getAddress()).to.equal(mainMock.address)
    })

    it("Correct get contract sum", async function() {
        expect(await transfer.connect(owner).getContractSum()).to.equal(0)
    })
})
