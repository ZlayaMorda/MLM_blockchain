// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Main is Initializable{
    mapping (address => address) inviter;
    mapping (address => address[]) directPartners;
    mapping (address => uint) investment;

    /**
    add direct partner
    @param inviterAddress address which send referal link
    @dev add direct partner and link which invited 
    */
    function referralInvite(address _inviterAddress) external {
        inviter[msg.sender] = _inviterAddress;
        directPartners[_inviterAddress].push(msg.sender);
    }

    /**
    invest sum
    @dev invest more then 20 weis, contract get 5%
    */
    function investSum() external payable {
        if (msg.value < 20){
            revert("Too much little sum");
        }
        investment[msg.sender] += 95 * msg.value / 100;
    }

    function getContractSum() external view returns(uint){
        return address(this).balance;
    }

    function getUserSum() external view returns(uint){
        return investment[msg.sender];
    }
}