# MLM system in blockchain

### solidity ^0.8.12
### Hardhat

---
* The user may log in by 2 ways:
    * without a referral link
    * with a referral link (the user became a **direct partner** of the 
    user whos link used)
---
* The user may invest
    * 5% of the invested sum must be credited to the contract account 
---
* Levels are depending investing sum:
    * 1 level - 0.005 eth
    * 2 level - 0.01 eth
    * 3 level - 0.02 eth
    * 4 level - 0.05 eth
    * 5 level - 0.1 eth
    * 6 level - 0.2 eth
    * 7 level - 0.5 eh
    * 8 level - 1 eth
    * 9 level - 2 eth
    * 10 level - 5 eth
* The user may check own level
---
* The user may check num of the direct partners and their level
---
* The user may withdraw the money
---
* If **an user level >= a partner's deep** the user receive commission:
    * 1 level - 1%
    * 2 level - 0.7%
    * 3 level - 0.5%
    * 4 level - 0.2%
    * 5 level - 0.1%
    * 6 level - 0.1%
    * 7 level - 0.1%
    * 8 level - 0.1%
    * 9 level - 0.1%
    * 10 level - 0.1%
