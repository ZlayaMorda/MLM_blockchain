// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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
            keccak256("Mail(address userWallet,uint256 salt,uint256 amount,string name,bytes32 signature)"),
            _message.userWallet,
            _message.salt,
            _message.amount,
            _message.name
        )));
    }

    function getAddress(SignatureMessage calldata _message) private view returns(address) {
        bytes32 digest = getHash(_message);
        return ECDSA.recover(digest, _message.signature);
    }

    function vefify(SignatureMessage calldata _message) external view returns(bool) {
        return (signerAddress == getAddress(_message));
    }
}
