// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./TaurusTokenERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TaurusVendor is Ownable {

    TaurusToken taurusToken;

    uint256 private tokenPerEth = 10000;

    constructor(address tokenAddress) {
        taurusToken = TaurusToken(tokenAddress);
    }

    function buyTokens() external payable returns(uint256 tokensAmount) {
        require (
            msg.value >= 0.0001 ether,
            "TaurusVendor:: You should send more ether"
        );
        
        uint256 amountToBuy = msg.value * tokenPerEth / (10 ** 18);

        require(
            taurusToken.balanceOf(address(this)) >= amountToBuy,
            "TaurusVendor:: There aren't enough tokens on the balance"
        );

        bool sent = taurusToken.transfer(msg.sender, amountToBuy);
        require(sent, "TaurusVendor:: Failed to transfer token to user");

        return amountToBuy;
    }

}