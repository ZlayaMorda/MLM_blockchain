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
    mapping (address => uint256) private investment;

    uint256[] private levelsPerSum;
    uint256[] private  commissionPercent;
    address private mainAddress;

    struct partner {
        address partnerAddress;
        uint256 pertnerLevel;
    }

    /**
    @dev initialize the contract (main address, array of lvls, array of commission percent) 
    @param _mainAddress the address of the main contract
    */
    function initialize(address _mainAddress) external initializer {
        mainAddress = _mainAddress;
        __Ownable_init();

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
    function getContractSum() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    /**
    @dev get user's investment balance in the MLM
    @return user's investment balance
    */
    function getUserSum() external view returns (uint256) {
        return investment[msg.sender];
    }

    /**
    @dev determine current user's lvl
    @return lvl of sender
    */
    function getOwnLevel() external view returns (uint256) {
        return _getLevel(msg.sender);
    }

    /**
    @dev determine num  of direct partners and their lvls
    @return array of partner(address, level)
    */
    function getPartners() external view returns(partner[] memory){
        address[] memory partners = IMain(mainAddress).getDirectPartners(msg.sender);
        partner[] memory partnerLevels = new partner[](partners.length);
        for(uint256 i = 0; i < partners.length - 1; i++){
            partnerLevels[i] = partner(partners[i], _getLevel(partners[i]));    
        }
        return (partnerLevels);
    }

    /**
    @dev withdraw user money, call functions to pay commisions and to pay user
    @param _sum sum to withdraw
    */
    function withdrawMoney(uint256 _sum) external {
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
    function _getLevel(address _addressUser) private view returns (uint256) {
        for(uint256 i = 0; i < levelsPerSum.length; i++){
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
    function _payForPartners(uint256 _sum) private {
        uint256 i = 1;
        address parent = IMain(mainAddress).getInviter(msg.sender);
        while(i < 11 && parent != address(0)) {
            uint256 lvl = _getLevel(parent);
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
    function _payFromContract(uint256 _sum, address _adr) private {
        (bool sent, /*memory data*/) = _adr.call{value: _sum}("");
        require(sent,"Transfer:: Fail, ether has not sent");
        investment[_adr] -= _sum;
    }
}
