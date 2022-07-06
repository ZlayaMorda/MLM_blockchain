// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./main.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface MainInterface{
    function getInviter(address adr) external view returns(address);

    function getDirectPartners(address adr) external view returns(address[] memory);

    function getInvestment(address adr) external view returns(uint);
}

contract Transfer is Initializable{
    uint[] private levelsPerSum;
    uint[] private  commissionPercent;
    address private mainAddress;

    /**
    @dev initialize the contarct (main address, array of lvls, array of commission percent) 
    @param adr the address of the main contract
    */
    function initialize(address adr) external initializer{
        mainAddress = adr;

        levelsPerSum = [
            5e15,
            1e16,
            2e16,
            5e16,
            1e17,
            2e17,
            5e17,
            1e18,
            2e18,
            5e18
        ];

        // need to divide by 1000 to get percent
        commissionPercent = [10, 7, 5, 2, 1, 1, 1, 1, 1, 1];
    }

    /**
    @dev determine user's lvl
    @param _adrUser address of needable user
    @return user's lvl
    */
    function getLevel(address _adrUser) private view returns(uint){
        for(uint i=0; i < levelsPerSum.length; i++){
            if(MainInterface(mainAddress).getInvestment(_adrUser) < levelsPerSum[i]){
                return i;
            }
        }  
        return 10;      
    }

    /**
    @dev determine current user's lvl
    */
    function getOwnLevel() external view returns(uint){
        return getLevel(msg.sender);
    }

    /**
    @dev determine num  of direct partners and their lvls
    @return array of lvls
    @return num of partners
    */
    function getPartners() external view returns(uint[] memory, uint){
        uint numOfPartners = MainInterface(mainAddress).getDirectPartners(msg.sender).length;
        uint[] memory levels = new uint[](numOfPartners);
        for(uint i = 0; i < numOfPartners - 1; i++){
            levels[i] =  getLevel(MainInterface(mainAddress).getDirectPartners(msg.sender)[i]);    
        }
        return (levels, numOfPartners);
    }
}
