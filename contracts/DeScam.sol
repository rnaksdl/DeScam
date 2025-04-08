// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DeScam is Ownable {
    struct Report {
        uint256 id;
        address reporter;
        string ipfsHash;
        uint256 timestamp;
        bool verified;
    }

    mapping(uint256 => Report) public reports;
    mapping(address => uint256) public reputation;
    uint256 public reportCount;

    event ReportSubmitted(uint256 id, address indexed reporter, string ipfsHash);
    event ReportVerified(uint256 id, address indexed verifier);

    // Pass the deployer's address to the Ownable constructor
    constructor() Ownable(msg.sender) {
        reportCount = 0;
    }

    function submitReport(string memory _ipfsHash) public {
        reportCount++;
        reports[reportCount] = Report(reportCount, msg.sender, _ipfsHash, block.timestamp, false);
        emit ReportSubmitted(reportCount, msg.sender, _ipfsHash);
    }

    function verifyReport(uint256 _reportId) public {
        require(reports[_reportId].id != 0, "Report does not exist");
        require(!reports[_reportId].verified, "Report already verified");

        reports[_reportId].verified = true;
        reputation[msg.sender]++;
        emit ReportVerified(_reportId, msg.sender);
    }

    function getReport(uint256 _reportId) public view returns (Report memory) {
        return reports[_reportId];
    }
}