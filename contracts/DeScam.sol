// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeScam is Ownable {
    struct Report {
        uint256 id;
        address reporter;
        string ipfsHash;
        uint256 timestamp;
        bool verified;
        uint256 votes;
    }

    mapping(uint256 => Report) public reports;
    mapping(address => uint256) public reputation;
    uint256 public reportCount;

    event ReportSubmitted(uint256 id, address indexed reporter, string ipfsHash);
    event ReportVerified(uint256 id, address indexed verifier);
    event ReputationUpdated(address indexed user, uint256 newReputation);

    constructor() {
        reportCount = 0;
    }

    function submitReport(string memory _ipfsHash) public {
        reportCount++;
        reports[reportCount] = Report(reportCount, msg.sender, _ipfsHash, block.timestamp, false, 0);
        emit ReportSubmitted(reportCount, msg.sender, _ipfsHash);
    }

    function verifyReport(uint256 _reportId) public {
        require(reports[_reportId].id != 0, "Report does not exist");
        require(!reports[_reportId].verified, "Report already verified");

        reports[_reportId].verified = true;
        reputation[msg.sender] += 1; // Increase reputation for verifying
        emit ReportVerified(_reportId, msg.sender);
        emit ReputationUpdated(msg.sender, reputation[msg.sender]);
    }

    function getReport(uint256 _reportId) public view returns (Report memory) {
        return reports[_reportId];
    }

    function getReputation(address _user) public view returns (uint256) {
        return reputation[_user];
    }
}