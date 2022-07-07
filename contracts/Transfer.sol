// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./interfaces/IMain.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
Store user's investment sum
Store array of commission percents
Store array of levels per investment sum
Store address of main contract to use its fields

Provides all operations with money in MLM, getting
level and partners
*/
contract Transfer is Initializable, OwnableUpgradeable {
    mapping (address => uint) private investment;

    uint[] private levelsPerSum;
    uint[] private  commissionPercent;
    address private mainAddress;

    /**
    @dev initialize the contract (main address, array of lvls, array of commission percent) 
    @param _mainAddress the address of the main contract
    */
    function initialize(address _mainAddress) external initializer {
        mainAddress = _mainAddress;

        levelsPerSum = [
            0.005 ether,
            0.01 ether,
            0.02 ether,
            0.05 ether,
            0.1 ether,
            0.2 ether,
            0.5 ether,
            1 ether,
            2 ether,
            5 ether
        ];

        // need to divide by 1000 to get percent
        commissionPercent = [10, 7, 5, 2, 1, 1, 1, 1, 1, 1];
    }

    /**
    @dev invest more then 20 weis, contract get 5%
    */
    function investSum() external payable {
        require(
            msg.value > 20,
            "Transfer:: Too much little sum"
        );
        investment[msg.sender] += 95 * msg.value / 100;
    }

    /**
    @dev get contract balance
    @return contract balance
    */
    function getContractSum() external view onlyOwner returns (uint) {
        return address(this).balance;
    }

    /**
    @dev get user's investment balance in the MLM
    @return user's investment balance
    */
    function getUserSum() external view returns (uint) {
        return investment[msg.sender];
    }

    /**
    @dev determine user's lvl
    @param _addressUser address of needable user
    @return user's lvl
    */
    function getLevel(address _addressUser) external view returns (uint) {
        return _getLevel(_addressUser);
    }

    /**
    @dev determine current user's lvl
    @return lvl of sender
    */
    function getOwnLevel() external view returns (uint) {
        return _getLevel(msg.sender);
    }

    /**
    @dev determine num  of direct partners and their lvls
    @return array of lvls
    @return num of partners
    */
    function getPartners() external view returns (uint[] memory, uint) {
        uint numOfPartners = IMain(mainAddress).getDirectPartners(msg.sender).length;
        if(numOfPartners != 0) {
            uint[] memory levels = new uint[](numOfPartners);
            for(uint i = 0; i < numOfPartners - 1; i++){
                levels[i] =  _getLevel(IMain(mainAddress).getDirectPartners(msg.sender)[i]);    
            }
            return (levels, numOfPartners);
        }
        return (new uint [](0), numOfPartners);
    }

    /**
    @dev withdraw user money, call functions to pay commisions and to pay user
    @param _sum sum to withdraw
    */
    function withdrawMoney(uint _sum) external {
        require(
            _sum < investment[msg.sender],
            "Transfer:: The sum is over then investment"
        );
        _payFromContract(_sum, msg.sender);
        _payForPartners(_sum);
    }

    /**
    @dev determine user's lvl
    @param _addressUser address of needable user
    @return user's lvl
    */
    function _getLevel(address _addressUser) private view returns (uint) {
        for(uint i = 0; i < levelsPerSum.length; i++){
            if(investment[_addressUser] < levelsPerSum[i]){
                return i;
            }
        }  
        return 10;      
    }

    /**
    @dev pay commision for all inviters
    @param _sum sum to withdraw
    */
    function _payForPartners(uint _sum) private {
        uint i = 1;
        address parent = IMain(mainAddress).getInviter(msg.sender);
        while(i < 11 && parent != address(0)) {
            uint lvl = _getLevel(parent);
            if(lvl > i){
                investment[parent] += _sum * commissionPercent[lvl - 1] / 1000;
            }
            parent = IMain(mainAddress).getInviter(parent);
        }
    }

    /**
    @dev withdraw money to user
    @param _sum sum to withdraw
    @param _adr user's address
    */
    function _payFromContract(uint _sum, address _adr) private {
        (bool sent, /*memory data*/) = _adr.call{value: _sum}("");
        require(sent,"Transfer:: Fail, ether has not sent");
        investment[_adr] -= _sum;
    }
}
