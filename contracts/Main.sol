// SPDX-License-Identifier: MITadoc

pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
Store inviter address for an user
Store array of direct partners addresses for an user
Get their addresses 
*/
contract Main is Initializable{
    mapping (address => address) private inviter;
    mapping (address => address[]) private directPartners;

    /**
    @dev get user's inviter address
    @param _address user's address
    @return inviter address
    */
    function getInviter(address _address) external view returns (address) {
        return inviter[_address];
    }

    /**
    @dev get array of direct partners
    @param _address user's address
    @return array of direct partners
    */
    function getDirectPartners(address _address) external view returns (address[] memory) {
        return directPartners[_address];
    }

    /**
    @dev add direct partner and link which invited 
    @param _inviterAddress address which send referal link
    */
    function referralInvite(address _inviterAddress) external {
        inviter[msg.sender] = _inviterAddress;
        directPartners[_inviterAddress].push(msg.sender);
    }
}