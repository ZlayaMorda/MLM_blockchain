// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/**
Provides verification of the eip712 signing
*/
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

    /**
    @dev owner may set signer address
    @param _signer address of signer to set
    */
    function setSignerAddress(address _signer) external onlyOwner {
        signerAddress = _signer;
    }

    /**
    @dev verify if signer address is right
    @param _message message struct
    @return true if right address
    */
    function verify(SignatureMessage calldata _message) external view returns(bool) {
        return (signerAddress == _getAddress(_message));
    }

    /**
    @dev get hash of message struct
    @param _message message struct
    @return bytes32 hash
    */
    function _getHash(SignatureMessage calldata _message) private view returns(bytes32) {
        return _hashTypedDataV4(
            keccak256(abi.encode(
            keccak256("SignatureMessage(address userWallet,uint256 salt,uint256 amount,string name)"),
            _message.userWallet,
            _message.salt,
            _message.amount,
            keccak256(bytes(_message.name))
        )));
    }

    /**
    @dev get signer address from hash
    @param _message message struct
    @return signer address
    */
    function _getAddress(SignatureMessage calldata _message) private view returns(address) {
        bytes32 digest = _getHash(_message);
        return ECDSA.recover(digest, _message.signature);
    }
}
