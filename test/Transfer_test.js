const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")
const { deployMockContract } = require("ethereum-waffle")
const { constants } = require("@openzeppelin/test-helpers")

describe("Transfer", function() {
    let transfer
    let mainMock
    let users
    let invest_commission
    let invest_sums
    let invest_neg_sums
    let user_levels
    let contract_sum

    before(async function() {
        invest_commission = 95
        invest_sums = ["0.01", "0.005", "6", "0.03", "0.02", "1"]
        invest_neg_sums = ["-0.01", "-0.005", "-6", "-0.03", "-0.02", "-1"]
        user_levels = [1, 0, 10, 3, 2, 7, 0]
        contract_sum = "7.065"

        users = new Array(7)
        users = await ethers.getSigners()
        const main = require("../artifacts/contracts/interfaces/IMain.sol/IMain.json")
        mainMock = await deployMockContract(users[0], main.abi)

        await mainMock.mock.getDirectPartners.withArgs(users[0].address)
            .returns([users[1].address, users[2].address, users[users.length - 1].address])

        await mainMock.mock.getInviter.withArgs(users[0].address)
            .returns(constants.ZERO_ADDRESS)

        await mainMock.mock.getInviter.withArgs(users[1].address)
            .returns(users[0].address)

        await mainMock.mock.getInviter.withArgs(users[2].address)
            .returns(users[0].address)

        await mainMock.mock.getInviter.withArgs(users[users.length - 1].address)
            .returns(users[0].address)

        await mainMock.mock.getDirectPartners.withArgs(users[2].address)
            .returns([users[3].address])

        await mainMock.mock.getInviter.withArgs(users[3].address)
            .returns(users[2].address)

        await mainMock.mock.getDirectPartners.withArgs(users[3].address)
            .returns([users[4].address])

        await mainMock.mock.getInviter.withArgs(users[4].address)
            .returns(users[3].address)

        await mainMock.mock.getDirectPartners.withArgs(users[4].address)
            .returns([users[5].address])

        await mainMock.mock.getInviter.withArgs(users[5].address)
            .returns(users[4].address)

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
        for(let i = 0; i < invest_sums.length; i++) {
            await expect(
                await transfer.connect(users[i]).investSum({value: ethers.utils.parseEther(invest_sums[i])})
            ).to.changeEtherBalances([users[i], transfer],
                    [ethers.utils.parseEther(invest_neg_sums[i]), ethers.utils.parseEther(invest_sums[i])])
        }
    })

    it("Should revert if invest less then 20 wei", async function() {
        await expect(
            transfer.connect(users[0]).investSum({value: 19})
        ).to.be.revertedWith("Transfer:: Too much little sum")
    })

    it("Should get contract sum", async function() {
        await expect(
            await transfer.connect(users[0]).getContractSum()).to.equal(ethers.utils.parseEther(contract_sum))
    })

    it("Should revert getting contract sum", async function() {
        await expect(
            transfer.connect(users[1]).getContractSum()
        ).to.revertedWith("Ownable: caller is not the owner")
    })

    it("Should get user sum", async function() {
        for(let i = 0; i < invest_sums.length; i++) {
            await expect(
                await transfer.connect(users[i]).getUserSum()).to.equal
            (ethers.utils.parseEther(invest_sums[i]).mul(invest_commission).div(100))
        }

        await expect(
            await transfer.connect(users[users.length - 1]).getUserSum()).to.equal(0)
    })

    it("Should get user level", async function() {
        for(let i = 0; i < user_levels.length; i++) {
            await expect(
                await transfer.connect(users[i]).getOwnLevel()).to.equal(user_levels[i])
        }
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

        for(let i = 1; i < len; i++) {
            partners_mas.push(new partner(users[i].address, await transfer.connect(users[i]).getOwnLevel()))
        }
        partners_mas.push(new partner(users[users.length - 1].address,
            await transfer.connect(users[users.length - 1]).getOwnLevel()))

        await expect(len).to.equal(partners_mas.length)
        for(let i = 0; i < len; i++) {
            await expect(contract_array[i].partnerLevel).to.equal(partners_mas[i].partner_level)
            await expect(contract_array[i].partnerAddress).to.equal(partners_mas[i].partner_address)
        }
    })

    it("Should correctly withdraw money and pay commissions", async function() {
        await expect(await transfer.connect(users[5]).withdrawMoney(ethers.utils.parseEther("0.95"))
        ).to.changeEtherBalances([users[5], transfer],
                    [ethers.utils.parseEther("0.95"), ethers.utils.parseEther("-0.95")])

        await expect(await transfer.connect(users[4]).getUserSum())
            .to.equal((ethers.utils.parseEther(invest_sums[4]).mul(invest_commission).div(100))
                .add((ethers.utils.parseEther("0.95")).mul(7).div(1000)))

        await expect(await transfer.connect(users[3]).getUserSum())
            .to.equal((ethers.utils.parseEther(invest_sums[3]).mul(invest_commission).div(100))
                .add((ethers.utils.parseEther("0.95")).mul(5).div(1000)))

        await expect(await transfer.connect(users[2]).getUserSum())
            .to.equal((ethers.utils.parseEther(invest_sums[2]).mul(invest_commission).div(100))
                .add((ethers.utils.parseEther("0.95")).mul(1).div(1000)))

        await expect(await transfer.connect(users[0]).getUserSum())
            .to.equal(ethers.utils.parseEther("0.0095"))

        await expect(
            await transfer.connect(users[0]).getContractSum())
            .to.equal(ethers.utils.parseEther(contract_sum).sub(ethers.utils.parseEther("0.95")))
    })

    it("Should revert withdraw money", async function() {
        await expect(
            transfer.connect(users[5]).withdrawMoney(ethers.utils.parseEther("0.01"))
        ).to.be.revertedWith("Transfer:: The sum is over then investment")
    })

})
