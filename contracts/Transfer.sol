// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./interfaces/IMain.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
    address private tokenAddress;
    

    struct partner {
        address partnerAddress;
        uint256 partnerLevel;
    }

    /**
    @dev initialize the contract (main address, array of lvls, array of commission percent)
    */
    function initialize() external initializer {
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
    @dev Check main address is empty
    */
    modifier validMainAddress() {
        require(
            mainAddress != address(0),
            "Transfer:: Address of Main contract not set"
        );

        _;
    }

    /**
    @dev set main address
    @param _mainAddress address of Main contract
    */
    function setMainAddress(address _mainAddress) external onlyOwner {
        mainAddress = _mainAddress;
    }

    /**
    @dev set token address
    @param _tokenAddress address of the token
    */
    function setTokenAddress(address _tokenAddress) external onlyOwner {
        tokenAddress = _tokenAddress;
    }

    /**
    @dev invest more then 20 TRS, contract get 5%
    @param _tokenSum sum of invest in token
    */
    function investSum(uint256 _tokenSum) external {
        require(
            _tokenSum > 20,
            "Transfer:: Too much little sum"
        );

        require(
            IERC20(tokenAddress).approve(address(this), _tokenSum),
             "Transfer:: not approved invest"
        );

        bool sent = IERC20(tokenAddress).transferFrom(address(msg.sender), address(this), _tokenSum);
        require(sent, "TaurusVendor:: Failed to invest tokens to MLM");

        investment[msg.sender] += 95 * _tokenSum / 100;
    }

    /**
    @dev get contract balance in TRS
    @return contract balance in TRS
    */
    function getContractSum() external view onlyOwner returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
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
    function getPartners() external view validMainAddress returns(partner[] memory){
        address[] memory partners = IMain(mainAddress).getDirectPartners(msg.sender);
        partner[] memory partnerLevels = new partner[](partners.length);
        for(uint256 i = 0; i < partners.length; i++){
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
            _sum <= investment[msg.sender],
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
    function _payForPartners(uint256 _sum) private validMainAddress {
        uint256 i = 1;
        address parent = IMain(mainAddress).getInviter(msg.sender);
        while(i < 11 && parent != address(0)) {
            uint256 lvl = _getLevel(parent);
            if(lvl > i){
                investment[parent] += _sum * commissionPercent[i - 1] / 1000;
            }
            i++;
            parent = IMain(mainAddress).getInviter(parent);
        }
    }

    /**
    @dev withdraw TRS to user
    @param _sum sum to withdraw
    @param _address user's address
    */
    function _payFromContract(uint256 _sum, address _address) private {
        bool sent = IERC20(tokenAddress).transfer(_address, _sum);
        require(sent, "TaurusVendor:: Failed to transfer token to user");

        investment[_address] -= _sum;
    }
}
