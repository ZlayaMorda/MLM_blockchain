// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Main is Initializable{
    mapping (address => address) private inviter;
    mapping (address => address[]) private directPartners;

    /**
    @dev get user's inviter address
    @param _adr user's address
    @return inviter address
    */
    function getInviter(address _adr) external view returns(address){
        return inviter[_adr];
    }

    /**
    @dev get array of direct partners
    @param _adr user's address
    @return array of direct partners
    */
    function getDirectPartners(address _adr) external view returns(address[] memory){
        return directPartners[_adr];
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

interface MainInterface{
    function getInviter(address adr) external view returns(address);

    function getDirectPartners(address adr) external view returns(address[] memory);
}