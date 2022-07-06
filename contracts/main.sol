// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Main is Initializable{
    mapping (address => address) inviter;
    mapping (address => address[]) directPartners;
    mapping (address => uint) investment;

    /**
    @dev get user's inviter address
    @param adr user's address
    @return inviter address
    */
    function getInviter(address adr) external view returns(address){
        return inviter[adr];
    }

    /**
    @dev get array of direct partners
    @param user's address
    @return array of direct partners
    */
    function getDirectPartners(address adr) external view returns(address[] memory){
        return directPartners[adr];
    }

    /**
    @dev get user's investment sum
    @param user's address
    @return investment sum
    */
    function getInvestment(address adr) external view returns(uint){
        return investment[adr];
    }

    /**
    @dev add direct partner and link which invited 
    @param _inviterAddress address which send referal link
    */
    function referralInvite(address _inviterAddress) external {
        inviter[msg.sender] = _inviterAddress;
        directPartners[_inviterAddress].push(msg.sender);
    }

    /**
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
