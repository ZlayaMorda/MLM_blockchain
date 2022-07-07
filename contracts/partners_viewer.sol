// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./interfaces/main_interface.sol";
import "./interfaces/transfer_interface.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract partnersViewer is Initializable{

    address private transferAddress;

    /**
    @dev initialize the contract (transferAddress)
    @param _transferAddress address of transfer contract
    */
    function initialize(address _transferAddress) external initializer {
        transferAddress = _transferAddress;
    }
    /**
    @dev determine num  of direct partners and their lvls
    @return array of lvls
    @return num of partners
    */
    function getPartners() external view returns(uint[] memory, uint){
        address mainAddress = TransferInterface(transferAddress).getMainAddress();
        uint numOfPartners = MainInterface(mainAddress).getDirectPartners(msg.sender).length;
        if(numOfPartners != 0){
            uint[] memory levels = new uint[](numOfPartners);
            for(uint i = 0; i < numOfPartners - 1; i++){
                levels[i] =  TransferInterface(transferAddress).getLevel(MainInterface(mainAddress).getDirectPartners(msg.sender)[i]);    
            }
            return (levels, numOfPartners);
        }
        return (new uint [](0), numOfPartners);
    }
}