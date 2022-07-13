const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")
const {deployMockContract} = require("ethereum-waffle")
const main = require("../artifacts/contracts/interfaces/IMain.sol/IMain.json")
const { constants } = require("@openzeppelin/test-helpers")

describe("Transfer", function() {
    let transfer
    let mainMock
    let invest_commission
    let invest_sums
    let invest_neg_sums
    let user_levels
    let contract_sum
    
    let owner
    let root_user
    let partner_1
    let partner_2
    let partner_3_empty
    let partner_2_1
    let partner_2_2
    let partner_2_3
    

    before(async function() {
        invest_commission = 95
        invest_sums = ["0.01", "0.005", "6", "0.03", "0.02", "1"]
        invest_neg_sums = ["-0.01", "-0.005", "-6", "-0.03", "-0.02", "-1"]
        user_levels = [1, 0, 10, 0, 3, 2, 7]
        contract_sum = "7.065"

        [owner, root_user, partner_1, partner_2, partner_3_empty,
            partner_2_1, partner_2_2, partner_2_3] = await ethers.getSigners()
        
        mainMock = await deployMockContract(owner, main.abi)
        
        await mainMock.mock.getDirectPartners.withArgs(root_user.address)
            .returns([partner_1.address, partner_2.address, partner_3_empty.address])

        await mainMock.mock.getInviter.withArgs(root_user.address)
            .returns(constants.ZERO_ADDRESS)

        await mainMock.mock.getInviter.withArgs(partner_1.address)
            .returns(root_user.address)

        await mainMock.mock.getInviter.withArgs(partner_2.address)
            .returns(root_user.address)

        await mainMock.mock.getInviter.withArgs(partner_3_empty.address)
            .returns(root_user.address)

        await mainMock.mock.getDirectPartners.withArgs(partner_2.address)
            .returns([partner_2_1.address])

        await mainMock.mock.getInviter.withArgs(partner_2_1.address)
            .returns(partner_2.address)

        await mainMock.mock.getDirectPartners.withArgs(partner_2_1.address)
            .returns([partner_2_2.address])

        await mainMock.mock.getInviter.withArgs(partner_2_2.address)
            .returns(partner_2_1.address)

        await mainMock.mock.getDirectPartners.withArgs(partner_2_2.address)
            .returns([partner_2_3.address])

        await mainMock.mock.getInviter.withArgs(partner_2_3.address)
            .returns(partner_2_2.address)


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
    })

    it("Correct upgrade transfer", async function() {
        const TransferV2 = await ethers.getContractFactory("Transfer")
        await upgrades.upgradeProxy(transfer.address, TransferV2)
        await expect(transfer.address).to.be.properAddress
    })

    it("Should invest correct ether", async function() {
        await expect(
            await transfer.connect(root_user).investSum({value: ethers.utils.parseEther(invest_sums[0])})
        ).to.changeEtherBalances(root_user, transfer,
            [ethers.utils.parseEther(invest_neg_sums[0]), ethers.utils.parseEther(invest_sums[0])])

        await expect(
            await transfer.connect(partner_1).investSum({value: ethers.utils.parseEther(invest_sums[1])})
        ).to.changeEtherBalances(partner_1, transfer,
            [ethers.utils.parseEther(invest_neg_sums[1]), ethers.utils.parseEther(invest_sums[1])])

        await expect(
            await transfer.connect(partner_2).investSum({value: ethers.utils.parseEther(invest_sums[2])})
        ).to.changeEtherBalances(partner_2, transfer,
            [ethers.utils.parseEther(invest_neg_sums[2]), ethers.utils.parseEther(invest_sums[2])])

        await expect(
            await transfer.connect(partner_2_1).investSum({value: ethers.utils.parseEther(invest_sums[3])})
        ).to.changeEtherBalances(partner_2_1, transfer,
            [ethers.utils.parseEther(invest_neg_sums[3]), ethers.utils.parseEther(invest_sums[3])])

        await expect(
            await transfer.connect(partner_2_2).investSum({value: ethers.utils.parseEther(invest_sums[4])})
        ).to.changeEtherBalances(partner_2_2, transfer,
            [ethers.utils.parseEther(invest_neg_sums[4]), ethers.utils.parseEther(invest_sums[4])])

        await expect(
            await transfer.connect(partner_2_3).investSum({value: ethers.utils.parseEther(invest_sums[5])})
        ).to.changeEtherBalances(partner_2_3, transfer,
            [ethers.utils.parseEther(invest_neg_sums[5]), ethers.utils.parseEther(invest_sums[5])])
    })

    it("Should revert if invest less then 20 wei", async function() {
        await expect(
            transfer.connect(root_user).investSum({value: 19})
        ).to.be.revertedWith("Transfer:: Too much little sum")
    })

    it("Should get contract sum", async function() {
        await expect(
            await transfer.connect(owner).getContractSum()).to.equal(ethers.utils.parseEther(contract_sum))
    })

    it("Should revert getting contract sum", async function() {
        await expect(
            transfer.connect(partner_1).getContractSum()
        ).to.revertedWith("Ownable: caller is not the owner")
    })

    it("Should get user sum", async function() {
        await expect(
            await transfer.connect(root_user).getUserSum()).to.equal
        (ethers.utils.parseEther(invest_sums[0]).mul(invest_commission).div(100))

        await expect(
            await transfer.connect(partner_1).getUserSum()).to.equal
        (ethers.utils.parseEther(invest_sums[1]).mul(invest_commission).div(100))

        await expect(
            await transfer.connect(partner_2).getUserSum()).to.equal
        (ethers.utils.parseEther(invest_sums[2]).mul(invest_commission).div(100))

        await expect(
            await transfer.connect(partner_2_1).getUserSum()).to.equal
        (ethers.utils.parseEther(invest_sums[3]).mul(invest_commission).div(100))

        await expect(
            await transfer.connect(partner_2_2).getUserSum()).to.equal
        (ethers.utils.parseEther(invest_sums[4]).mul(invest_commission).div(100))

        await expect(
            await transfer.connect(partner_2_3).getUserSum()).to.equal
        (ethers.utils.parseEther(invest_sums[5]).mul(invest_commission).div(100))

        await expect(
            await transfer.connect(partner_3_empty).getUserSum()).to.equal(0)
    })

    it("Should get user level", async function() {
        await expect(
            await transfer.connect(root_user).getOwnLevel()).to.equal(user_levels[0])

        await expect(
            await transfer.connect(partner_1).getOwnLevel()).to.equal(user_levels[1])

        await expect(
            await transfer.connect(partner_2).getOwnLevel()).to.equal(user_levels[2])

        await expect(
            await transfer.connect(partner_3_empty).getOwnLevel()).to.equal(user_levels[3])

        await expect(
            await transfer.connect(partner_2_1).getOwnLevel()).to.equal(user_levels[4])

        await expect(
            await transfer.connect(partner_2_2).getOwnLevel()).to.equal(user_levels[5])

        await expect(
            await transfer.connect(partner_2_3).getOwnLevel()).to.equal(user_levels[6])
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

        const contract_array = await transfer.connect(root_user).getPartners()
        const len = contract_array.length

        let partners_mas = []
        partners_mas.push(new partner(partner_1.address, await transfer.connect(partner_1).getOwnLevel()))
        partners_mas.push(new partner(partner_2.address, await transfer.connect(partner_2).getOwnLevel()))
        partners_mas.push(new partner(partner_3_empty.address, await transfer.connect(partner_3_empty).getOwnLevel()))

        await expect(len).to.equal(partners_mas.length)

        for(let i = 0; i < len; i++) {
            await expect(contract_array[i].partnerLevel).to.equal(partners_mas[i].partner_level)
            await expect(contract_array[i].partnerAddress).to.equal(partners_mas[i].partner_address)
        }
    })

    it("Should correctly withdraw money and pay commissions", async function() {
        await expect(await transfer.connect(partner_2_3).withdrawMoney(ethers.utils.parseEther("0.95"))
        ).to.changeEtherBalances([partner_2_3, transfer],
                    [ethers.utils.parseEther("0.95"), ethers.utils.parseEther("-0.95")])

        await expect(await transfer.connect(partner_2_2).getUserSum())
            .to.equal((ethers.utils.parseEther(invest_sums[4]).mul(invest_commission).div(100))
                .add((ethers.utils.parseEther("0.95")).mul(7).div(1000)))

        await expect(await transfer.connect(partner_2_1).getUserSum())
            .to.equal((ethers.utils.parseEther(invest_sums[3]).mul(invest_commission).div(100))
                .add((ethers.utils.parseEther("0.95")).mul(5).div(1000)))

        await expect(await transfer.connect(partner_2).getUserSum())
            .to.equal((ethers.utils.parseEther(invest_sums[2]).mul(invest_commission).div(100))
                .add((ethers.utils.parseEther("0.95")).mul(1).div(1000)))

        await expect(await transfer.connect(root_user).getUserSum())
            .to.equal(ethers.utils.parseEther("0.0095"))

        await expect(
            await transfer.connect(root_user).getContractSum())
            .to.equal(ethers.utils.parseEther(contract_sum).sub(ethers.utils.parseEther("0.95")))
    })

    it("Should revert withdraw money", async function() {
        await expect(
            transfer.connect(partner_2_3).withdrawMoney(ethers.utils.parseEther("0.01"))
        ).to.be.revertedWith("Transfer:: The sum is over then investment")
    })
})
