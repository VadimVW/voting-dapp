// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    string[] public candidates;
    mapping(string => uint256) public votes;
    mapping(address => bool) public hasVoted;

    constructor(string[] memory _candidates) {
        candidates = _candidates;
    }

    function vote(string memory candidate) public {
        require(!hasVoted[msg.sender], "Already voted.");
        require(validCandidate(candidate), "Invalid candidate.");
        votes[candidate]++;
        hasVoted[msg.sender] = true;
    }

    function validCandidate(string memory candidate) internal view returns (bool) {
        for (uint i = 0; i < candidates.length; i++) {
            if (keccak256(bytes(candidates[i])) == keccak256(bytes(candidate))) {
                return true;
            }
        }
        return false;
    }

    function getVotes(string memory candidate) public view returns (uint256) {
        return votes[candidate];
    }
}