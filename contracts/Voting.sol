// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    mapping(string => uint256) public votes;
    mapping(address => bool) public hasVoted;
    mapping(address => uint256) public nonces;

    event Voted(address indexed voter, string candidate);

    function voteViaRelayer(
        string memory candidate,
        address signer,
        uint256 nonce,
        bytes memory signature
    ) public {
        require(!hasVoted[signer], "Already voted");
        require(nonces[signer] == nonce, "Invalid nonce");

        bytes32 messageHash = getMessageHash(candidate, signer, nonce);
        address recovered = recoverSigner(messageHash, signature);

        require(recovered == signer, "Invalid signature");

        hasVoted[signer] = true;
        nonces[signer]++;
        votes[candidate]++;

        emit Voted(signer, candidate);
    }

    function getMessageHash(string memory candidate, address signer, uint256 nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(candidate, signer, nonce));
    }

    function recoverSigner(bytes32 hash, bytes memory signature) public pure returns (address) {
        return _recover(hash, signature);
    }

    function _recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        bytes32 ethSignedHash = prefixed(hash);

        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedHash, v, r, s);
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}