// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./main.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Transfer is Initializable{
    mapping (address => uint) private investment;

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
    @dev invest more then 20 weis, contract get 5%
    */
    function investSum() external payable {
        if (msg.value < 20){
            revert("Too much little sum");
        }
        investment[msg.sender] += 95 * msg.value / 100;
    }

    /**
    @dev determine user's lvl
    @param _adrUser address of needable user
    @return user's lvl
    */
    function getLevel(address _adrUser) private view returns(uint){
        for(uint i = 0; i < levelsPerSum.length; i++){
            if(investment[_adrUser] < levelsPerSum[i]){
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
        if(numOfPartners != 0){
            uint[] memory levels = new uint[](numOfPartners);
            for(uint i = 0; i < numOfPartners - 1; i++){
                levels[i] =  getLevel(MainInterface(mainAddress).getDirectPartners(msg.sender)[i]);    
            }
            return (levels, numOfPartners);
        }
        return (new uint [](0), numOfPartners);
    }

    /**
    @dev withdraw user money, call functions to pay commisions and to pay user
    @param _sum sum to withdraw
    */
    function withdrawMoney(uint _sum) external{
        if(_sum > investment[msg.sender]){
            revert("The sum is over then investment");
        }
        payFromContract(_sum, msg.sender);
        payForParents(_sum);
    }

    /**
    @dev pay commision for all inviters
    @param _sum sum to withdraw
    */
    function payForParents(uint _sum) private{
        uint i = 1;
        address parent = MainInterface(mainAddress).getInviter(msg.sender);
        while(i < 11 && parent != address(0)){
            uint lvl = getLevel(parent);
            if(lvl > i){
                investment[parent] += _sum * commissionPercent[lvl - 1] / 1000;
            }
            parent = MainInterface(mainAddress).getInviter(parent);
        }
    }

    /**
    @dev withdraw money to user
    @param _sum sum to withdraw
    @param _adr user's address
    */
    function payFromContract(uint _sum, address _adr) private{
        (bool sent, /*memory data*/) = _adr.call{value: _sum}("");
        require(sent,"Fail, ether has not sent");
        investment[_adr] -= _sum;
    }


    function getContractSum() external view returns(uint){
        return address(this).balance;
    }

    function getUserSum() external view returns(uint){
        return investment[msg.sender];
    }
}
