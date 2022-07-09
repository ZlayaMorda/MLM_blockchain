const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Main", function() {
    let owner
    let inviter
    let partner
    let main

    beforeEach(async function() {
        [owner, inviter, partner] = await ethers.getSigners()
        const Main = await ethers.getContractFactory("Main", owner)
        main = await Main.deploy()
        await  main.deployed()
        console.log(main.address)
    })

    it("Correct deploy address", async function() {
        expect(main.address).to.be.properAddress
    })

    describe("Get valid address", function() {

        beforeEach(async function() {
            await main.connect(partner).referralInvite(inviter.address)
        })

        it("should return correct inviter address", async function() {
            expect(await main.getInviter(partner.address)).to.equal(inviter.address)
        })

        it("should return correct partner address", async function() {
            const partners_mas = await main.getDirectPartners(inviter.address)
            expect(partners_mas[0]).to.equal(partner.address)
        })

        it("should return correct partner's addresses", async function() {
            const [new_partner] = await ethers.getSigners()
            await main.connect(new_partner).referralInvite(inviter.address)
            const partners_mas = await main.getDirectPartners(inviter.address)
            expect(partners_mas[0], partners_mas[1]).to.equal(partner.address, new_partner.address)

        })
    })
    describe("Empty addresses", function() {
        
        it("should return empty inviter address", async function() {
            expect(await main.getInviter(partner.address)).to.hexEqual("0x0")
        })
        
        it("should return empty partner address", async function() {
            const partners_mas = await main.getDirectPartners(inviter.address)
            expect(partners_mas.length).equal(0)
        })
    })
})
