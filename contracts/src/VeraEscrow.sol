// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title VeraEscrow
 * @dev Pure Web3 AI-mediated escrow contract implementing 80/20 variance buffer
 * and 72-hour silent consent protocol as immutable system invariants
 */
contract VeraEscrow is ReentrancyGuard, Pausable, Ownable, EIP712 {
    using ECDSA for bytes32;

    // ============ CONSTANTS ============
    
    /// @dev Technical milestone auto-release percentage (80% - IMMUTABLE INVARIANT)
    uint256 public constant TECHNICAL_RELEASE_PERCENTAGE = 80;
    
    /// @dev Subjective variance buffer percentage (20% - IMMUTABLE INVARIANT)  
    uint256 public constant SUBJECTIVE_BUFFER_PERCENTAGE = 20;
    
    /// @dev Silent consent timeout period (72 hours - IMMUTABLE INVARIANT)
    uint256 public constant SILENT_CONSENT_PERIOD = 72 hours;
    
    /// @dev Additional dispute window after auto-release (24 hours)
    uint256 public constant DISPUTE_WINDOW = 24 hours;

    // ============ EIP-712 DOMAIN SEPARATOR ============
    
    bytes32 private constant VERIFICATION_TYPEHASH = keccak256(
        "VerificationData(bytes32 projectId,bytes32 milestoneId,address freelancer,uint256 technicalAmount,uint256 subjectiveAmount,uint256 timestamp,bytes32 ipfsHash,bool approved)"
    );

    // ============ STRUCTS ============

    struct Project {
        bytes32 id;
        address client;
        address freelancer;
        uint256 totalAmount;
        bytes32 ipfsHash;
        ProjectStatus status;
        uint256 createdAt;
        uint256 milestonesCount;
    }

    struct Milestone {
        bytes32 id;
        bytes32 projectId;
        uint256 technicalAmount;    // 80% of milestone value
        uint256 subjectiveAmount;   // 20% of milestone value
        MilestoneStatus status;
        uint256 submittedAt;
        uint256 silentConsentDeadline;
        bool technicalReleased;
        bool subjectiveReleased;
    }

    struct VerificationData {
        bytes32 projectId;
        bytes32 milestoneId;
        address freelancer;
        uint256 technicalAmount;
        uint256 subjectiveAmount;
        uint256 timestamp;
        bytes32 ipfsHash;
        bool approved;
    }

    // ============ ENUMS ============

    enum ProjectStatus {
        Active,
        Completed,
        Disputed,
        Cancelled
    }

    enum MilestoneStatus {
        Pending,
        Submitted,
        TechnicalReleased,
        FullyReleased,
        Disputed
    }

    // ============ STATE VARIABLES ============

    /// @dev Authorized AI agent address for verification signatures
    address public authorizedAgent;
    
    /// @dev Mapping of project ID to Project struct
    mapping(bytes32 => Project) public projects;
    
    /// @dev Mapping of milestone ID to Milestone struct
    mapping(bytes32 => Milestone) public milestones;
    
    /// @dev Mapping of project ID to milestone IDs array
    mapping(bytes32 => bytes32[]) public projectMilestones;

    // ============ EVENTS ============

    event ProjectCreated(
        bytes32 indexed projectId,
        address indexed client,
        address indexed freelancer,
        uint256 totalAmount,
        bytes32 ipfsHash
    );

    event MilestoneSubmitted(
        bytes32 indexed milestoneId,
        bytes32 indexed projectId,
        uint256 timestamp
    );

    event TechnicalReleaseExecuted(
        bytes32 indexed milestoneId,
        address indexed freelancer,
        uint256 amount
    );

    event SubjectiveReleaseExecuted(
        bytes32 indexed milestoneId,
        address indexed freelancer,
        uint256 amount
    );

    event SilentConsentTriggered(
        bytes32 indexed milestoneId,
        uint256 timestamp
    );

    event DisputeRaised(
        bytes32 indexed milestoneId,
        address indexed disputer,
        string reason
    );

    // ============ MODIFIERS ============

    modifier onlyAuthorizedAgent() {
        require(msg.sender == authorizedAgent, "VeraEscrow: Unauthorized agent");
        _;
    }

    modifier validProject(bytes32 projectId) {
        require(projects[projectId].id != bytes32(0), "VeraEscrow: Project does not exist");
        _;
    }

    modifier validMilestone(bytes32 milestoneId) {
        require(milestones[milestoneId].id != bytes32(0), "VeraEscrow: Milestone does not exist");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor(address _authorizedAgent) 
        EIP712("VeraProtocol", "1.0.0") 
        Ownable(msg.sender)
    {
        require(_authorizedAgent != address(0), "VeraEscrow: Invalid agent address");
        authorizedAgent = _authorizedAgent;
    }

    // ============ CORE FUNCTIONS ============

    /**
     * @dev Creates a new project with escrowed funds
     * @param projectId Unique identifier for the project
     * @param freelancer Address of the freelancer
     * @param ipfsHash IPFS hash of the project agreement JSON
     */
    function createProject(
        bytes32 projectId,
        address freelancer,
        bytes32 ipfsHash
    ) external payable nonReentrant whenNotPaused {
        require(projectId != bytes32(0), "VeraEscrow: Invalid project ID");
        require(freelancer != address(0), "VeraEscrow: Invalid freelancer address");
        require(freelancer != msg.sender, "VeraEscrow: Client cannot be freelancer");
        require(ipfsHash != bytes32(0), "VeraEscrow: Invalid IPFS hash");
        require(msg.value > 0, "VeraEscrow: Must deposit funds");
        require(projects[projectId].id == bytes32(0), "VeraEscrow: Project already exists");

        projects[projectId] = Project({
            id: projectId,
            client: msg.sender,
            freelancer: freelancer,
            totalAmount: msg.value,
            ipfsHash: ipfsHash,
            status: ProjectStatus.Active,
            createdAt: block.timestamp,
            milestonesCount: 0
        });

        emit ProjectCreated(projectId, msg.sender, freelancer, msg.value, ipfsHash);
    }

    /**
     * @dev Creates a milestone within a project
     * @param projectId The project this milestone belongs to
     * @param milestoneId Unique identifier for the milestone
     * @param totalAmount Total amount for this milestone
     */
    function createMilestone(
        bytes32 projectId,
        bytes32 milestoneId,
        uint256 totalAmount
    ) external validProject(projectId) {
        require(milestoneId != bytes32(0), "VeraEscrow: Invalid milestone ID");
        require(totalAmount > 0, "VeraEscrow: Invalid milestone amount");
        require(milestones[milestoneId].id == bytes32(0), "VeraEscrow: Milestone already exists");
        require(msg.sender == projects[projectId].client, "VeraEscrow: Only client can create milestones");

        // Calculate 80/20 split (IMMUTABLE INVARIANT)
        uint256 technicalAmount = (totalAmount * TECHNICAL_RELEASE_PERCENTAGE) / 100;
        uint256 subjectiveAmount = totalAmount - technicalAmount;

        milestones[milestoneId] = Milestone({
            id: milestoneId,
            projectId: projectId,
            technicalAmount: technicalAmount,
            subjectiveAmount: subjectiveAmount,
            status: MilestoneStatus.Pending,
            submittedAt: 0,
            silentConsentDeadline: 0,
            technicalReleased: false,
            subjectiveReleased: false
        });

        projectMilestones[projectId].push(milestoneId);
        projects[projectId].milestonesCount++;
    }

    /**
     * @dev Submits a milestone for AI verification
     * @param milestoneId The milestone being submitted
     */
    function submitMilestone(bytes32 milestoneId) 
        external 
        validMilestone(milestoneId) 
        nonReentrant 
    {
        Milestone storage milestone = milestones[milestoneId];
        Project storage project = projects[milestone.projectId];
        
        require(msg.sender == project.freelancer, "VeraEscrow: Only freelancer can submit");
        require(milestone.status == MilestoneStatus.Pending, "VeraEscrow: Invalid milestone status");
        require(project.status == ProjectStatus.Active, "VeraEscrow: Project not active");

        milestone.status = MilestoneStatus.Submitted;
        milestone.submittedAt = block.timestamp;

        emit MilestoneSubmitted(milestoneId, milestone.projectId, block.timestamp);
    }

    /**
     * @dev Verifies milestone and releases funds based on AI agent signature
     * @param data The verification data struct
     * @param signature EIP-712 signature from authorized AI agent
     */
    function verifyAndRelease(
        VerificationData calldata data,
        bytes calldata signature
    ) external nonReentrant whenNotPaused validMilestone(data.milestoneId) {
        // Verify EIP-712 signature
        bytes32 structHash = keccak256(abi.encode(
            VERIFICATION_TYPEHASH,
            data.projectId,
            data.milestoneId,
            data.freelancer,
            data.technicalAmount,
            data.subjectiveAmount,
            data.timestamp,
            data.ipfsHash,
            data.approved
        ));

        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(signature);
        
        require(signer == authorizedAgent, "VeraEscrow: Invalid agent signature");
        require(data.approved, "VeraEscrow: Verification failed");

        Milestone storage milestone = milestones[data.milestoneId];
        Project storage project = projects[data.projectId];

        require(milestone.status == MilestoneStatus.Submitted, "VeraEscrow: Invalid milestone status");
        require(data.freelancer == project.freelancer, "VeraEscrow: Freelancer mismatch");
        require(data.projectId == milestone.projectId, "VeraEscrow: Project mismatch");

        // IMMUTABLE INVARIANT: Auto-release 80% technical amount immediately
        if (!milestone.technicalReleased) {
            milestone.technicalReleased = true;
            milestone.status = MilestoneStatus.TechnicalReleased;
            
            // Transfer 80% to freelancer immediately
            (bool success, ) = payable(project.freelancer).call{value: milestone.technicalAmount}("");
            require(success, "VeraEscrow: Technical payment failed");
            
            emit TechnicalReleaseExecuted(data.milestoneId, project.freelancer, milestone.technicalAmount);
        }

        // Start 72-hour silent consent timer for 20% subjective buffer (IMMUTABLE INVARIANT)
        milestone.silentConsentDeadline = block.timestamp + SILENT_CONSENT_PERIOD;
    }

    /**
     * @dev Releases subjective buffer after silent consent period expires
     * @param milestoneId The milestone to release subjective funds for
     */
    function releaseSilentConsent(bytes32 milestoneId) 
        external 
        nonReentrant 
        validMilestone(milestoneId) 
    {
        Milestone storage milestone = milestones[milestoneId];
        Project storage project = projects[milestone.projectId];

        require(milestone.status == MilestoneStatus.TechnicalReleased, "VeraEscrow: Technical not released");
        require(!milestone.subjectiveReleased, "VeraEscrow: Subjective already released");
        require(block.timestamp >= milestone.silentConsentDeadline, "VeraEscrow: Silent consent period active");

        milestone.subjectiveReleased = true;
        milestone.status = MilestoneStatus.FullyReleased;

        // Transfer remaining 20% to freelancer
        (bool success, ) = payable(project.freelancer).call{value: milestone.subjectiveAmount}("");
        require(success, "VeraEscrow: Subjective payment failed");

        emit SilentConsentTriggered(milestoneId, block.timestamp);
        emit SubjectiveReleaseExecuted(milestoneId, project.freelancer, milestone.subjectiveAmount);
    }

    /**
     * @dev Allows client to approve subjective elements before silent consent expires
     * @param milestoneId The milestone to approve
     */
    function approveSubjective(bytes32 milestoneId) 
        external 
        nonReentrant 
        validMilestone(milestoneId) 
    {
        Milestone storage milestone = milestones[milestoneId];
        Project storage project = projects[milestone.projectId];

        require(msg.sender == project.client, "VeraEscrow: Only client can approve");
        require(milestone.status == MilestoneStatus.TechnicalReleased, "VeraEscrow: Technical not released");
        require(!milestone.subjectiveReleased, "VeraEscrow: Subjective already released");
        require(block.timestamp < milestone.silentConsentDeadline, "VeraEscrow: Silent consent expired");

        milestone.subjectiveReleased = true;
        milestone.status = MilestoneStatus.FullyReleased;

        // Transfer remaining 20% to freelancer
        (bool success, ) = payable(project.freelancer).call{value: milestone.subjectiveAmount}("");
        require(success, "VeraEscrow: Subjective payment failed");

        emit SubjectiveReleaseExecuted(milestoneId, project.freelancer, milestone.subjectiveAmount);
    }

    /**
     * @dev Raises a dispute for a milestone (only within dispute window)
     * @param milestoneId The milestone being disputed
     * @param reason The reason for the dispute
     */
    function raiseDispute(bytes32 milestoneId, string calldata reason) 
        external 
        validMilestone(milestoneId) 
    {
        Milestone storage milestone = milestones[milestoneId];
        Project storage project = projects[milestone.projectId];

        require(msg.sender == project.client, "VeraEscrow: Only client can dispute");
        require(milestone.technicalReleased, "VeraEscrow: Technical not released yet");
        require(!milestone.subjectiveReleased, "VeraEscrow: Cannot dispute after subjective release");
        require(
            block.timestamp <= milestone.silentConsentDeadline + DISPUTE_WINDOW,
            "VeraEscrow: Dispute window expired"
        );

        milestone.status = MilestoneStatus.Disputed;
        project.status = ProjectStatus.Disputed;

        emit DisputeRaised(milestoneId, msg.sender, reason);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Returns project milestones array
     */
    function getProjectMilestones(bytes32 projectId) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return projectMilestones[projectId];
    }

    /**
     * @dev Returns the EIP-712 domain separator
     */
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Updates the authorized agent address (only owner)
     */
    function updateAuthorizedAgent(address newAgent) external onlyOwner {
        require(newAgent != address(0), "VeraEscrow: Invalid agent address");
        authorizedAgent = newAgent;
    }

    /**
     * @dev Emergency pause function (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause function (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ EMERGENCY FUNCTIONS ============

    /**
     * @dev Emergency withdrawal function (only when paused)
     */
    function emergencyWithdraw(bytes32 projectId) 
        external 
        nonReentrant 
        whenPaused 
        validProject(projectId) 
    {
        Project storage project = projects[projectId];
        require(msg.sender == project.client, "VeraEscrow: Only client can withdraw");
        
        uint256 amount = project.totalAmount;
        project.totalAmount = 0;
        project.status = ProjectStatus.Cancelled;

        (bool success, ) = payable(project.client).call{value: amount}("");
        require(success, "VeraEscrow: Emergency withdrawal failed");
    }
}