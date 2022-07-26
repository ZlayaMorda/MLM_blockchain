const { expect } = require("chai")
const { ethers } = require("hardhat")
const taurus = require("../artifacts/contracts/Token/TaurusTokenERC20.sol/TaurusToken.json")
const {deployMockContract} = require("ethereum-waffle");
const {deploy} = require("@openzeppelin/hardhat-upgrades/dist/utils");

describe("TaurusVendor", function() {
    let owner
    let user

    let taurusMock
    let taurusVendor

    before(async function() {
        [owner, user] = await ethers.getSigners()
        taurusMock = await deployMockContract(owner, taurus.abi)

        const TaurusVendor = await ethers.getContractFactory("TaurusVendor", owner)
        taurusVendor = await TaurusVendor.deploy()

        await taurusMock.mock.transfer.withArgs(taurusVendor.address, ethers.utils.parseEther("1"))
            .returns(true)

        await taurusMock.mock.transfer.withArgs(user.address, ethers.utils.parseEther("1"))
            .returns(true)

        await taurusMock.mock.balanceOf.withArgs(taurusVendor.address)
            .returns(ethers.utils.parseEther("1"))
    })

    it("Correct revert set token address", async function() {
        await taurusVendor.connect(owner).setTokenAddress(taurusMock.address)
        await expect(taurusVendor.connect(user).setTokenAddress(owner.address))
            .to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Correct deploy addresses", async function() {
        await expect(taurusMock.address).to.be.properAddress
        await expect(taurusVendor.address).to.be.properAddress
    })

    it("Correct revert cause low ether value", async function() {
        await expect(taurusVendor.connect(user).buyTokens({value: ethers.utils.parseEther("0.00001")}))
            .to.be.revertedWith("TaurusVendor:: You should send more ether")
    })

    it("Correct revert cause low tokens value", async function() {
        await expect(taurusVendor.connect(user).buyTokens({value: ethers.utils.parseEther("2")}))
            .to.be.revertedWith("TaurusVendor:: There aren't enough tokens on the balance")
    })

    it("Correct revert withdraw money", async function() {
        await expect(taurusVendor.withdraw())
            .to.be.revertedWith("TaurusVendor:: Contract has not balance to withdraw")
    })

    it("Correct buy all tokens", async function() {
        await expect(await taurusVendor.connect(user).buyTokens({value: ethers.utils.parseEther("1")}))
            .to.changeEtherBalances([taurusVendor, user],
            [ethers.utils.parseEther("1"), ethers.utils.parseEther("-1")])
    })

    it("Correct withdraw all ether", async function() {
        await expect(await taurusVendor.connect(owner).withdraw())
            .to.changeEtherBalances([owner, taurusVendor],
            [ethers.utils.parseEther("1"), ethers.utils.parseEther("-1")])
    })

    it("Correct revert withdraw ether", async function() {
        await expect(taurusVendor.connect(user).withdraw())
            .to.be.revertedWith("Ownable: caller is not the owner")
    })
})
