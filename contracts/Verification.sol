// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

// using ECDSA for bytes32;

contract Verification is EIP712, Ownable{
    address signerAddress;

    struct SignatureMessage {
        address userWallet;
        uint256 salt;
        uint256 amount;
        string name;
        bytes signature;
    }

    constructor() EIP712("TRS", "1") {}

    function setSignerAddress(address _signer) external onlyOwner {
        signerAddress = _signer;
    } 

    function getHash(SignatureMessage calldata _message) private view returns(bytes32) {
        return _hashTypedDataV4(
            keccak256(abi.encode(
            keccak256("SignatureMessage(address userWallet,uint256 salt,uint256 amount,string name)"),
            _message.userWallet,
            _message.salt,
            _message.amount,
            keccak256(bytes(_message.name))
        )));
    }

    function getAddress(SignatureMessage calldata _message) private view returns(address) {
        bytes32 digest = getHash(_message);
        return ECDSA.recover(digest, _message.signature);
    }

    function verify(SignatureMessage calldata _message) external view returns(bool) {
        console.log(getAddress(_message));
        console.log(signerAddress);
        return (signerAddress == getAddress(_message));
    }
}
