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
        bytes32 contentHash;       // IPFS CID (as bytes32 for gas efficiency)
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
    event ReportSubmitted(uint256 indexed id, address indexed reporter, bytes32 contentHash);
    event ReportDetailsUpdated(uint256 indexed id, bytes32 newContentHash, ScamType scamType);
    event ReportVerified(uint256 indexed id, address indexed verifier, uint256 stake);
    event ReportDisputed(uint256 indexed id, address indexed disputer, uint256 stake);
    event ReportResolved(uint256 indexed id, bool verified);
    event StakeReleased(uint256 indexed reportId, address indexed staker, uint256 amount, bool wasVerifier);
    event GovernanceParameterChanged(string parameterName, uint256 oldValue, uint256 newValue);
    
    // Constructor
    constructor() Ownable(msg.sender) {
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
    function submitReport(bytes32 _contentHash, ScamType _scamType) 
        public 
        whenNotPaused 
        withCooldown 
    {
        require(_contentHash != bytes32(0), "Content hash required");
        
        reportCount++;
        reports[reportCount] = Report({
            id: reportCount,
            reporter: msg.sender,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            verified: false,
            verificationCount: 0,
            disputeCount: 0,
            disputed: false
        });
        
        emit ReportSubmitted(reportCount, msg.sender, _contentHash);
        emit ReportDetailsUpdated(reportCount, _contentHash, _scamType);
    }
    
    function updateReportContent(uint256 _reportId, bytes32 _newContentHash, ScamType _scamType)
        public
        whenNotPaused
    {
        Report storage report = reports[_reportId];
        require(report.id != 0, "Report does not exist");
        require(report.reporter == msg.sender, "Only reporter can update content");
        require(!report.verified && !report.disputed, "Cannot update verified or disputed report");
        
        report.contentHash = _newContentHash;
        emit ReportDetailsUpdated(_reportId, _newContentHash, _scamType);
    }
    
    function verifyReport(uint256 _reportId) 
        public 
        payable
        whenNotPaused
        withCooldown
        nonReentrant
    {
        Report storage report = reports[_reportId];
        require(report.id != 0, "Report does not exist");
        require(report.reporter != msg.sender, "Cannot verify own report");
        require(!report.verified || report.disputed, "Report already verified");
        require(msg.value >= verificationStake, "Insufficient verification stake");
        require(reportVerificationStakes[_reportId][msg.sender] == 0, "Already verified this report");
        
        reportVerificationStakes[_reportId][msg.sender] = msg.value;
        report.verificationCount++;
        
        if(report.verificationCount >= resolutionThreshold && 
           report.verificationCount > report.disputeCount) {
            report.verified = true;
            report.disputed = false;
            positiveReputation[report.reporter]++;
        }
        
        positiveReputation[msg.sender]++;
        emit ReportVerified(_reportId, msg.sender, msg.value);
    }
    
    function disputeReport(uint256 _reportId) 
        public 
        payable
        whenNotPaused
        withCooldown
        nonReentrant
    {
        Report storage report = reports[_reportId];
        require(report.id != 0, "Report does not exist");
        require(report.timestamp + disputePeriod > block.timestamp, "Dispute period ended");
        require(msg.value >= verificationStake, "Insufficient dispute stake");
        require(reportDisputeStakes[_reportId][msg.sender] == 0, "Already disputed this report");
        
        reportDisputeStakes[_reportId][msg.sender] = msg.value;
        report.disputeCount++;
        report.disputed = true;
        
        if(report.disputeCount > report.verificationCount) {
            report.verified = false;
        }
        
        emit ReportDisputed(_reportId, msg.sender, msg.value);
    }
    
    function resolveReport(uint256 _reportId) 
        public 
        whenNotPaused
        nonReentrant
    {
        Report storage report = reports[_reportId];
        require(report.id != 0, "Report does not exist");
        require(report.disputed, "Report not under dispute");
        require(report.timestamp + disputePeriod < block.timestamp, "Dispute period not ended");
        
        bool isVerified = report.verificationCount > report.disputeCount;
        report.verified = isVerified;
        report.disputed = false;
        
        if (isVerified) {
            positiveReputation[report.reporter]++;
        } else {
            negativeReputation[report.reporter]++;
        }
        
        emit ReportResolved(_reportId, report.verified);
    }
    
    function releaseStake(uint256 _reportId, address _staker) 
        public 
        nonReentrant
    {
        Report storage report = reports[_reportId];
        require(report.id != 0, "Report does not exist");
        require(!report.disputed, "Report still under dispute");
        
        bool wasVerifier = reportVerificationStakes[_reportId][_staker] > 0;
        bool wasDisputer = reportDisputeStakes[_reportId][_staker] > 0;
        
        uint256 releaseAmount = 0;
        if (wasVerifier && report.verified) {
            releaseAmount = reportVerificationStakes[_reportId][_staker];
            reportVerificationStakes[_reportId][_staker] = 0;
        } else if (wasDisputer && !report.verified) {
            releaseAmount = reportDisputeStakes[_reportId][_staker];
            reportDisputeStakes[_reportId][_staker] = 0;
        } else {
            revert("No stakes to release or staker not on winning side");
        }
        
        require(releaseAmount > 0, "No funds to release");
        (bool success, ) = payable(_staker).call{value: releaseAmount}("");
        require(success, "Transfer failed");
        
        emit StakeReleased(_reportId, _staker, releaseAmount, wasVerifier);
    }
    
    // Query functions
    function getReport(uint256 _reportId) public view returns (Report memory) {
        require(reports[_reportId].id != 0, "Report does not exist");
        return reports[_reportId];
    }
    
    function getNetReputation(address _address) public view returns (int256) {
        return int256(positiveReputation[_address]) - int256(negativeReputation[_address]);
    }
    
    // Governance functions
    function setVerificationStake(uint256 _newStake) public onlyOwner {
        uint256 oldValue = verificationStake;
        verificationStake = _newStake;
        emit GovernanceParameterChanged("verificationStake", oldValue, _newStake);
    }
    
    function setReputationCooldown(uint256 _newCooldown) public onlyOwner {
        uint256 oldValue = reputationCooldown;
        reputationCooldown = _newCooldown;
        emit GovernanceParameterChanged("reputationCooldown", oldValue, _newCooldown);
    }
    
    function setDisputePeriod(uint256 _newPeriod) public onlyOwner {
        uint256 oldValue = disputePeriod;
        disputePeriod = _newPeriod;
        emit GovernanceParameterChanged("disputePeriod", oldValue, _newPeriod);
    }
    
    function setResolutionThreshold(uint256 _newThreshold) public onlyOwner {
        uint256 oldValue = resolutionThreshold;
        resolutionThreshold = _newThreshold;
        emit GovernanceParameterChanged("resolutionThreshold", oldValue, _newThreshold);
    }
    
    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
    }
    
    function recoverEth(uint256 _amount) public onlyOwner {
        require(_amount <= address(this).balance, "Not enough ETH in contract");
        payable(owner()).transfer(_amount);
    }
}
