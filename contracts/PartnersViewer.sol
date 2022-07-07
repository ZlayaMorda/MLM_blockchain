// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./interfaces/IMain.sol";
import "./interfaces/ITransfer.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PartnersViewer is Initializable{

    address private transferAddress;
    address private mainAddress;

    struct partner {
        address partnerAddress;
        uint pertnerLevel;
    }
    /**
    @dev initialize the contract (transferAddress)
    @param _transferAddress address of transfer contract
    */
    function initialize(address _transferAddress, address _mainAddress) external initializer {
        transferAddress = _transferAddress;
        mainAddress = _mainAddress;
    }

    /**
    @dev determine num  of direct partners and their lvls
    @return array of partner(address, level)
    */
    function getPartners() external view returns(partner[] memory){
        address[] memory partners = IMain(mainAddress).getDirectPartners(msg.sender);
        partner[] memory partnerLevels = new partner[](partners.length);
        for(uint i = 0; i < partners.length - 1; i++){
            partnerLevels[i] = partner(partners[i], ITransfer(transferAddress).getLevel(partners[i]));    
        }
        return (partnerLevels);
    }
}