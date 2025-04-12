// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DeScam
 * @dev A decentralized platform for reporting and verifying crypto scams
 * This contract implements a stake-based verification system with 
 * reputation mechanics to ensure data quality in a permissionless environment
 */
contract DeScam is Ownable, ReentrancyGuard {
    // ================= TYPES =================

    /**
     * @dev Enum representing different types of scams for categorization
     */
    enum ScamType { 
        Phishing,     // Fake websites, emails that steal credentials
        Ponzi,        // Investment schemes that pay earlier investors with new investors' money
        FakeICO,      // Fraudulent initial coin offerings
        Impersonation,// Pretending to be a known entity or person
        Rugpull,      // When devs abandon a project and run away with funds
        Other         // Any other type of scam
    }

    /**
     * @dev Struct to store report information
     */
    struct Report {
        uint256 id;                 // Unique identifier for the report
        address reporter;           // Address of the person who submitted the report
        string ipfsHash;            // IPFS hash containing detailed report information
        uint256 timestamp;          // When the report was submitted
        bool verified;              // Whether the report has been verified
        ScamType scamType;          // Category of the reported scam
        uint256 verificationCount;  // Number of addresses that verified this report
        uint256 disputeCount;       // Number of addresses that disputed this report
        bool disputed;              // Whether the report is currently under dispute
        uint256 totalStake;         // Total amount staked on this report (both for and against)
    }

    // ================= STATE VARIABLES =================

    // Report storage
    mapping(uint256 => Report) public reports;
    uint256 public reportCount;
    
    // Reputation system
    mapping(address => uint256) public positiveReputation;   // Tracks positive reputation points
    mapping(address => uint256) public negativeReputation;   // Tracks negative reputation points
    
    // Staking system
    mapping(uint256 => mapping(address => uint256)) public reportVerificationStakes; // Stakes for verification
    mapping(uint256 => mapping(address => uint256)) public reportDisputeStakes;      // Stakes for disputes
    
    // Time & value constraints
    mapping(address => uint256) public lastActionTime;       // Last action timestamp per address
    uint256 public verificationStake = 0.01 ether;          // Minimum stake required to verify
    uint256 public reputationCooldown = 1 days;            // Cooldown period between reputation actions
    uint256 public disputePeriod = 7 days;                 // Time period for disputing a report
    uint256 public resolutionThreshold = 5;                // Minimum verifications needed for auto-resolution
    
    // Governance parameters
    uint256 public minReputationToPropose = 5;             // Minimum reputation needed to propose governance changes
    bool public paused = false;                           // Emergency pause switch

    // ================= EVENTS =================
    
    event ReportSubmitted(uint256 indexed id, address indexed reporter, string ipfsHash, ScamType scamType);
    event ReportVerified(uint256 indexed id, address indexed verifier, uint256 stake);
    event ReportDisputed(uint256 indexed id, address indexed disputer, uint256 stake);
    event ReportResolved(uint256 indexed id, bool verified, uint256 totalStake);
    event StakeReleased(uint256 indexed reportId, address indexed staker, uint256 amount, bool wasVerifier);
    event GovernanceParameterChanged(string parameterName, uint256 oldValue, uint256 newValue);

    // ================= CONSTRUCTOR =================

    /**
     * @dev Sets up the DeScam contract with the deployer as the initial owner
     */
    constructor() Ownable(msg.sender) {
        reportCount = 0;
    }

    // ================= MODIFIERS =================
    
    /**
     * @dev Ensures the contract is not paused
     */
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    /**
     * @dev Enforces a cooldown period between actions to prevent spam
     */
    modifier withCooldown() {
        require(
            lastActionTime[msg.sender] + reputationCooldown < block.timestamp, 
            "Action cooldown period active"
        );
        _;
        lastActionTime[msg.sender] = block.timestamp;
    }
    
    // ================= REPORT FUNCTIONS =================

    /**
     * @dev Submit a new scam report with supporting evidence in IPFS
     * @param _ipfsHash IPFS hash containing detailed report information
     * @param _scamType Category of the scam being reported
     */
    function submitReport(string memory _ipfsHash, ScamType _scamType) 
        public 
        whenNotPaused 
        withCooldown 
    {
        // Input validation
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        // Create new report with incremented ID
        reportCount++;
        reports[reportCount] = Report({
            id: reportCount,
            reporter: msg.sender,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            verified: false,
            scamType: _scamType,
            verificationCount: 0,
            disputeCount: 0,
            disputed: false,
            totalStake: 0
        });

        // Emit report submission event
        emit ReportSubmitted(reportCount, msg.sender, _ipfsHash, _scamType);
    }

    /**
     * @dev Verify a report by staking ETH
     * @param _reportId ID of the report to verify
     */
    function verifyReport(uint256 _reportId) 
        public 
        payable
        whenNotPaused
        withCooldown
        nonReentrant  
    {
        // Validations
        Report storage report = reports[_reportId];
        require(report.id != 0, "Report does not exist");
        require(report.reporter != msg.sender, "Cannot verify own report");
        require(!report.verified || report.disputed, "Report already verified");
        require(msg.value >= verificationStake, "Insufficient verification stake");
        require(reportVerificationStakes[_reportId][msg.sender] == 0, "Already verified this report");

        // Record stake and update report
        reportVerificationStakes[_reportId][msg.sender] = msg.value;
        report.totalStake += msg.value;
        report.verificationCount++;
        
        // Check if verification threshold is reached
        if(report.verificationCount >= resolutionThreshold && 
           report.verificationCount > report.disputeCount) {
            report.verified = true;
            report.disputed = false;
            // Award reputation to reporter
            positiveReputation[report.reporter]++;
        }
        
        // Award reputation to verifier
        positiveReputation[msg.sender]++;
        
        // Emit verification event
        emit ReportVerified(_reportId, msg.sender, msg.value);
    }

    /**
     * @dev Dispute a report by staking ETH
     * @param _reportId ID of the report to dispute
     */
    function disputeReport(uint256 _reportId) 
        public 
        payable
        whenNotPaused
        withCooldown
        nonReentrant
    {
        // Validations
        Report storage report = reports[_reportId];
        require(report.id != 0, "Report does not exist");
        require(report.timestamp + disputePeriod > block.timestamp, "Dispute period ended");
        require(msg.value >= verificationStake, "Insufficient dispute stake");
        require(reportDisputeStakes[_reportId][msg.sender] == 0, "Already disputed this report");
        require(report.reporter != msg.sender, "Cannot dispute own report");
        
        // Record stake and update report
        reportDisputeStakes[_reportId][msg.sender] = msg.value;
        report.totalStake += msg.value;
        report.disputeCount++;
        report.disputed = true;
        
        // Check if disputes exceed verifications
        if(report.disputeCount > report.verificationCount) {
            report.verified = false;
        }
        
        // Emit dispute event
        emit ReportDisputed(_reportId, msg.sender, msg.value);
    }
    
    /**
     * @dev Resolve a disputed report (called after dispute period ends)
     * @param _reportId ID of the report to resolve
     */
    function resolveReport(uint256 _reportId) 
        public 
        whenNotPaused
        nonReentrant
    {
        Report storage report = reports[_reportId];
        require(report.id != 0, "Report does not exist");
        require(report.disputed, "Report not under dispute");
        require(
            report.timestamp + disputePeriod < block.timestamp, 
            "Dispute period not ended"
        );
        
        // Determine if report is verified based on verification vs dispute counts
        bool isVerified = report.verificationCount > report.disputeCount;
        report.verified = isVerified;
        report.disputed = false;
        
        // Update reputations
        if (isVerified) {
            // Reward reporter and verifiers
            positiveReputation[report.reporter]++;
            negativeReputation[report.reporter] = negativeReputation[report.reporter] > 0 ? 
                                                 negativeReputation[report.reporter] - 1 : 0;
        } else {
            // Penalize reporter
            negativeReputation[report.reporter]++;
        }
        
        emit ReportResolved(_reportId, report.verified, report.totalStake);
    }

    /**
     * @dev Release stakes after a report is resolved
     * @param _reportId ID of the report
     * @param _staker Address of the staker to release funds to
     */
    function releaseStake(uint256 _reportId, address _staker) 
        public 
        nonReentrant
    {
        Report storage report = reports[_reportId];
        require(report.id != 0, "Report does not exist");
        require(!report.disputed, "Report still under dispute");
        
        // Determine if the staker was on the winning side
        bool wasVerifier = reportVerificationStakes[_reportId][_staker] > 0;
        bool wasDisputer = reportDisputeStakes[_reportId][_staker] > 0;
        
        // Calculate amount to release based on whether they were on the winning side
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
        
        // Add a bonus from the losing side's stakes (proportional to stake)
        // This is a simplified distribution model
        
        // Transfer funds
        require(releaseAmount > 0, "No funds to release");
        (bool success, ) = payable(_staker).call{value: releaseAmount}("");
        require(success, "Transfer failed");
        
        emit StakeReleased(_reportId, _staker, releaseAmount, wasVerifier);
    }

    // ================= QUERY FUNCTIONS =================

    /**
     * @dev Get a report by its ID
     * @param _reportId ID of the report to retrieve
     * @return Report struct containing all report information
     */
    function getReport(uint256 _reportId) public view returns (Report memory) {
        require(reports[_reportId].id != 0, "Report does not exist");
        return reports[_reportId];
    }
    
    /**
     * @dev Get the net reputation of an address
     * @param _address Address to check
     * @return Net reputation score (positive - negative)
     */
    function getNetReputation(address _address) public view returns (int256) {
        return int256(positiveReputation[_address]) - int256(negativeReputation[_address]);
    }

    /**
     * @dev Check if an address has a stake in a report
     * @param _reportId ID of the report
     * @param _address Address to check
     * @return (hasVerificationStake, hasDisputeStake, stakeAmount)
     */
    function checkStake(uint256 _reportId, address _address) 
        public 
        view 
        returns (bool, bool, uint256) 
    {
        uint256 verificationStake = reportVerificationStakes[_reportId][_address];
        uint256 disputeStake = reportDisputeStakes[_reportId][_address];
        
        return (
            verificationStake > 0,
            disputeStake > 0,
            verificationStake + disputeStake
        );
    }

    // ================= GOVERNANCE FUNCTIONS =================

    /**
     * @dev Update the minimum stake required for verification (only owner)
     * @param _newStake New minimum stake value
     */
    function setVerificationStake(uint256 _newStake) public onlyOwner {
        uint256 oldValue = verificationStake;
        verificationStake = _newStake;
        emit GovernanceParameterChanged("verificationStake", oldValue, _newStake);
    }
    
    /**
     * @dev Update the reputation cooldown period (only owner)
     * @param _newCooldown New cooldown period in seconds
     */
    function setReputationCooldown(uint256 _newCooldown) public onlyOwner {
        uint256 oldValue = reputationCooldown;
        reputationCooldown = _newCooldown;
        emit GovernanceParameterChanged("reputationCooldown", oldValue, _newCooldown);
    }
    
    /**
     * @dev Update the dispute period (only owner)
     * @param _newPeriod New dispute period in seconds
     */
    function setDisputePeriod(uint256 _newPeriod) public onlyOwner {
        uint256 oldValue = disputePeriod;
        disputePeriod = _newPeriod;
        emit GovernanceParameterChanged("disputePeriod", oldValue, _newPeriod);
    }
    
    /**
     * @dev Set the resolution threshold (only owner)
     * @param _newThreshold New threshold
     */
    function setResolutionThreshold(uint256 _newThreshold) public onlyOwner {
        uint256 oldValue = resolutionThreshold;
        resolutionThreshold = _newThreshold;
        emit GovernanceParameterChanged("resolutionThreshold", oldValue, _newThreshold);
    }

    /**
     * @dev Pause the contract in case of emergency (only owner)
     * @param _paused New pause state
     */
    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
    }

    /**
     * @dev Allow contract owner to recover any ETH sent to the contract by mistake
     * @param _amount Amount of ETH to recover
     */
    function recoverEth(uint256 _amount) public onlyOwner {
        require(_amount <= address(this).balance, "Not enough ETH in contract");
        payable(owner()).transfer(_amount);
    }
}
