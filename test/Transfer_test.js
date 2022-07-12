const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")
const { deployMockContract } = require("ethereum-waffle")
const { constants } = require("@openzeppelin/test-helpers")

describe("Transfer", function() {
    let transfer
    let mainMock
    let users

    before(async function() {
        users = new Array(7)
        users = await ethers.getSigners()
        const main = require("../artifacts/contracts/interfaces/IMain.sol/IMain.json")
        mainMock = await deployMockContract(users[0], main.abi)

        await mainMock.mock.getDirectPartners.withArgs(users[0].address)
            .returns([users[1].address, users[2].address, users[3].address])

        await mainMock.mock.getInviter.withArgs(users[0].address)
            .returns(constants.ZERO_ADDRESS)

        await mainMock.mock.getInviter.withArgs(users[1].address)
            .returns(users[0].address)

        await mainMock.mock.getInviter.withArgs(users[2].address)
            .returns(users[0].address)

        await mainMock.mock.getInviter.withArgs(users[3].address)
            .returns(users[0].address)

        await mainMock.mock.getDirectPartners.withArgs(users[2].address)
            .returns([users[4].address])

        await mainMock.mock.getInviter.withArgs(users[4].address)
            .returns(users[2].address)

        await mainMock.mock.getDirectPartners.withArgs(users[4].address)
            .returns([users[5].address])

        await mainMock.mock.getInviter.withArgs(users[5].address)
            .returns(users[4].address)

        await mainMock.mock.getDirectPartners.withArgs(users[5].address)
            .returns([users[6].address])

        await mainMock.mock.getInviter.withArgs(users[6].address)
            .returns(users[5].address)

        const Transfer = await ethers.getContractFactory("Transfer", users[0])
        transfer = await upgrades.deployProxy(Transfer, [mainMock.address], {
            initializer: "initialize",
        })
        await transfer.deployed()
    })

    it("Should deploy addresses", async function() {
        await expect(mainMock.address).to.be.properAddress
        await expect(transfer.address).to.be.properAddress
        await expect(await transfer.getAddress()).to.equal(mainMock.address)
    })

    it("Should upgrade transfer", async function() {
        const TransferV2 = await ethers.getContractFactory("Transfer")
        await upgrades.upgradeProxy(transfer.address, TransferV2)
        await expect(transfer.address).to.be.properAddress
        await expect(await transfer.getAddress()).to.equal(mainMock.address)
    })

    it("Should invest correct ether", async function() {
        await expect(
            await transfer.connect(users[0]).investSum({value: ethers.utils.parseEther("0.01")})
        ).to.changeEtherBalances([users[0], transfer],
                    [ethers.utils.parseEther("-0.01"), ethers.utils.parseEther("0.01")])

        await expect(
            await transfer.connect(users[1]).investSum({value: ethers.utils.parseEther("0.005")})
        ).to.changeEtherBalances([users[1], transfer],
                    [ethers.utils.parseEther("-0.005"), ethers.utils.parseEther("0.005")])

        await expect(
            await transfer.connect(users[2]).investSum({value: ethers.utils.parseEther("6")})
        ).to.changeEtherBalances([users[2], transfer],
                    [ethers.utils.parseEther("-6"), ethers.utils.parseEther("6")])

        await expect(await transfer.connect(users[4]).investSum({value: ethers.utils.parseEther("0.03")})
        ).to.changeEtherBalances([users[4], transfer],
                    [ethers.utils.parseEther("-0.03"), ethers.utils.parseEther("0.03")])

        await expect(await transfer.connect(users[5]).investSum({value: ethers.utils.parseEther("0.02")})
        ).to.changeEtherBalances([users[5], transfer],
                    [ethers.utils.parseEther("-0.02"), ethers.utils.parseEther("0.02")])

        await expect(await transfer.connect(users[6]).investSum({value: ethers.utils.parseEther("1")})
        ).to.changeEtherBalances([users[6], transfer],
                    [ethers.utils.parseEther("-1"), ethers.utils.parseEther("1")])

    })

    it("Should revert if invest less then 20 wei", async function() {
        await expect(
            transfer.connect(users[0]).investSum({value: 19})
        ).to.be.revertedWith("Transfer:: Too much little sum")
    })

    it("Should get contract sum", async function() {
        await expect(
            await transfer.connect(users[0]).getContractSum()).to.equal(ethers.utils.parseEther("7.065"))
    })

    it("Should revert getting contract sum", async function() {
        await expect(
            transfer.connect(users[1]).getContractSum()
        ).to.revertedWith("Ownable: caller is not the owner")
    })

    it("Should get user sum", async function() {
        await expect(
            await transfer.connect(users[0]).getUserSum()).to.equal(ethers.utils.parseEther("0.0095"))

        await expect(
            await transfer.connect(users[1]).getUserSum()).to.equal(ethers.utils.parseEther("0.00475"))

        await expect(
            await transfer.connect(users[2]).getUserSum()).to.equal(ethers.utils.parseEther("5.7"))

        await expect(
            await transfer.connect(users[3]).getUserSum()).to.equal(0)

        await expect(
            await transfer.connect(users[4]).getUserSum()).to.equal(ethers.utils.parseEther("0.0285"))

        await expect(
            await transfer.connect(users[5]).getUserSum()).to.equal(ethers.utils.parseEther("0.019"))

        await expect(
            await transfer.connect(users[6]).getUserSum()).to.equal(ethers.utils.parseEther("0.95"))
    })

    it("Should get user level", async function() {
        await expect(
            await transfer.connect(users[0]).getOwnLevel()).to.equal(1)

        await expect(
            await transfer.connect(users[1]).getOwnLevel()).to.equal(0)

        await expect(
            await transfer.connect(users[2]).getOwnLevel()).to.equal(10)

        await expect(
            await transfer.connect(users[3]).getOwnLevel()).to.equal(0)

        await expect(
            await transfer.connect(users[4]).getOwnLevel()).to.equal(3)

        await expect(
            await transfer.connect(users[5]).getOwnLevel()).to.equal(2)

        await expect(
            await transfer.connect(users[6]).getOwnLevel()).to.equal(7)
    })

    it("Should get array of structs (partner_address, partner_level", async function() {
        class partner {
            partner_address;
            partner_level;
            constructor(partner_address, partner_level) {
                this.partner_address = partner_address
                this.partner_level = partner_level
            }
        }

        const contract_array = await transfer.connect(users[0]).getPartners()
        const len = contract_array.length

        let partners_mas = []

        for(let i = 1; i < len + 1; i++) {
            partners_mas.push(new partner(users[i].address, await transfer.connect(users[i]).getOwnLevel()))
        }

        await expect(len).to.equal(partners_mas.length)
        for(let i = 0; i < len; i++) {
            await expect(contract_array[i].partnerLevel).to.equal(partners_mas[i].partner_level)
            await expect(contract_array[i].partnerAddress).to.equal(partners_mas[i].partner_address)
        }
    })

    it("Should correctly withdraw money and pay commissions", async function() {
        //await transfer.connect(users[6]).withdrawMoney(ethers.utils.parseEther("0.95"))

        await expect(await transfer.connect(users[6]).withdrawMoney(ethers.utils.parseEther("0.95"))
        ).to.changeEtherBalances([users[6], transfer],
                    [ethers.utils.parseEther("0.95"), ethers.utils.parseEther("-0.95")])

        await expect(await transfer.connect(users[5]).getUserSum())
            .to.equal(ethers.utils.parseEther("0.02565"))

        await expect(await transfer.connect(users[4]).getUserSum())
            .to.equal(ethers.utils.parseEther("0.03325"))

        await expect(await transfer.connect(users[2]).getUserSum())
            .to.equal(ethers.utils.parseEther("5.70095"))

        await expect(await transfer.connect(users[0]).getUserSum())
            .to.equal(ethers.utils.parseEther("0.0095"))

        await expect(
            await transfer.connect(users[0]).getContractSum()).to.equal(ethers.utils.parseEther("6.115"))
    })

    it("Should revert withdraw money", async function() {
        await expect(
            transfer.connect(users[6]).withdrawMoney(ethers.utils.parseEther("0.01"))
        ).to.be.revertedWith("Transfer:: The sum is over then investment")
    })

})
