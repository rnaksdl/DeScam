// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DeScam
 * @dev A decentralized platform for reporting and verifying crypto scams
 */
contract DeScam is Ownable, ReentrancyGuard {
    // Enums
    enum ScamType { Phishing, Ponzi, FakeICO, Impersonation, Rugpull, Other }
    
    // Optimized Report struct for gas efficiency
    struct Report {
        uint256 id;                // Unique identifier
        address reporter;          // Report submitter
        string ipfsHash;           // IPFS CID as string (not bytes32)
        uint256 timestamp;         // Submission time
        bool verified;             // Verification status
        uint8 verificationCount;   // Number of verifications (uint8 saves gas)
        uint8 disputeCount;        // Number of disputes
        bool disputed;             // Dispute status
    }
    
    // State variables
    mapping(uint256 => Report) public reports;
    mapping(address => uint256) public positiveReputation;
    mapping(address => uint256) public negativeReputation;
    mapping(uint256 => mapping(address => uint256)) public reportVerificationStakes;
    mapping(uint256 => mapping(address => uint256)) public reportDisputeStakes;
    mapping(address => uint256) public lastActionTime;
    
    uint256 public reportCount;
    uint256 public verificationStake = 0.01 ether;
    uint256 public reputationCooldown = 1 days;
    uint256 public disputePeriod = 7 days;
    uint256 public resolutionThreshold = 5;
    bool public paused = false;
    
    // Events
    event ReportSubmitted(uint256 indexed id, address indexed reporter, string ipfsHash);
    event ReportDetailsUpdated(uint256 indexed id, string newIpfsHash, ScamType scamType);
    event ReportVerified(uint256 indexed id, address indexed verifier, uint256 stake);
    event ReportDisputed(uint256 indexed id, address indexed disputer, uint256 stake);
    event ReportResolved(uint256 indexed id, bool verified);
    event StakeReleased(uint256 indexed reportId, address indexed staker, uint256 amount, bool wasVerifier);
    event GovernanceParameterChanged(string parameterName, uint256 oldValue, uint256 newValue);
    
    // Constructor - fixed for OpenZeppelin 4.9.3
    constructor() {
        reportCount = 0;
    }
    
    // Modifiers
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier withCooldown() {
        require(lastActionTime[msg.sender] + reputationCooldown < block.timestamp, "Action cooldown active");
        _;
        lastActionTime[msg.sender] = block.timestamp;
    }
    
    // Core functions
    function submitReport(string memory _ipfsHash, ScamType _scamType) 
        public 
        whenNotPaused 
        withCooldown 
    {
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        reportCount++;
        reports[reportCount] = Report({
            id: reportCount,
            reporter: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            verified: false,
            verificationCount: 0,
            disputeCount: 0,
            disputed: false
        });
        
        emit ReportSubmitted(reportCount, msg.sender, _ipfsHash);
        emit ReportDetailsUpdated(reportCount, _ipfsHash, _scamType);
    }
    
    function updateReportContent(uint256 _reportId, string memory _newIpfsHash, ScamType _scamType)
        public
        whenNotPaused
    {
        Report storage report = reports[_reportId];
        require(report.id != 0, "Report does not exist");
        require(report.reporter == msg.sender, "Only reporter can update content");
        require(!report.verified && !report.disputed, "Cannot update verified or disputed report");
        
        report.ipfsHash = _newIpfsHash;
        emit ReportDetailsUpdated(_reportId, _newIpfsHash, _scamType);
    }
    
    // Rest of your contract functions remain the same
    // ...
}
