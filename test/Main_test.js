const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Main", function() {
    let owner
    let inviter
    let partner
    let main

    before(async function() {
        [owner, inviter, partner] = await ethers.getSigners()
        const Main = await ethers.getContractFactory("Main", owner)
        main = await Main.deploy()
        await  main.deployed()
    })

    it("Correct deploy address", async function() {
        await expect(main.address).to.be.properAddress
    })

    describe("Empty addresses", function() {

        it("should return empty inviter address", async function() {
            await expect(await main.getInviter(partner.address)).to.hexEqual("0x0")
        })

        it("should return empty partner address", async function() {
            const partners_mas = await main.getDirectPartners(inviter.address)
            await expect(await partners_mas.length).equal(0)
        })
    })

    describe("Get valid address", function() {

        before(async function() {
            await main.connect(partner).referralInvite(inviter.address)
        })

        it("should return correct inviter address", async function() {
            await expect(await main.getInviter(partner.address)).to.equal(inviter.address)
        })

        it("should return correct partner address", async function() {
            const partners_mas = await main.getDirectPartners(inviter.address)
            await expect(await partners_mas[0]).to.equal(partner.address)
        })
    })
})
