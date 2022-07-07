// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

interface ITransfer{
    function getLevel(address _adrUser) external view returns (uint);
}