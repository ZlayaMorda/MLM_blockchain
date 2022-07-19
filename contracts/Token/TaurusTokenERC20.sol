// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TaurusToken is ERC20 {

    constructor(uint256 _initialSupply) ERC20("Taurus", "Trs") {
        _mint(msg.sender, _initialSupply);
    }
}