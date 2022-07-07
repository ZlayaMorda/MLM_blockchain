// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

interface TransferInterface{
    function getMainAddress() external view returns(address);

    function getLevel(address _adrUser) external view returns (uint);
}