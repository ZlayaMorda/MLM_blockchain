// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./TaurusTokenERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TaurusVendor is Ownable {

    address private tokenAddress;

    uint256 private tokenPerEth = 1000000000000000000;

    function setTokenAddress(address _tokenAddress) external onlyOwner {
        tokenAddress = _tokenAddress;
    }

    /**
    @dev Provides users to buy tokens from this contract
    */
    function buyTokens() external payable {
        require (
            msg.value >= 0.0001 ether,
            "TaurusVendor:: You should send more ether"
        );
        
        uint256 amountToBuy = msg.value * tokenPerEth / (10 ** 18);

        require(
            IERC20(tokenAddress).balanceOf(address(this)) >= amountToBuy,
            "TaurusVendor:: There aren't enough tokens on the balance"
        );

        bool sent = IERC20(tokenAddress).transfer(msg.sender, amountToBuy);
        require(sent, "TaurusVendor:: Failed to transfer token to user");
    }

    /**
    @dev owner may to withdraw money from the contract
    */
    function withdraw() external onlyOwner {
        require(
            address(this).balance > 0,
            "TaurusVendor:: Contract has not balance to withdraw"
        );

        (bool sent,) = msg.sender.call{value: address(this).balance}("");
        require(sent, "TaurusVendor:: Failed to send user balance back to the owner");
    }
}
