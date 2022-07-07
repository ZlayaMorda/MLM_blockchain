// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

interface MainInterface{
    function getInviter(address _address) external view returns(address);

    function getDirectPartners(address _address) external view returns(address[] memory);
}