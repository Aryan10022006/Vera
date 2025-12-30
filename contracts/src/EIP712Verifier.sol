// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EIP712Verifier
 * @dev Standalone EIP-712 signature verification contract for Vera Protocol
 * Handles cryptographic verification of AI agent signatures for milestone payouts
 */
contract EIP712Verifier is EIP712, Ownable {
    using ECDSA for bytes32;

    // ============ CONSTANTS ============
    
    /// @dev EIP-712 type hash for payout signatures
    bytes32 private constant PAYOUT_TYPEHASH = keccak256(
        "Payout(string milestoneId,address recipient,uint256 amount,uint256 timestamp)"
    );

    /// @dev EIP-712 type hash for verification data
    bytes32 private constant VERIFICATION_TYPEHASH = keccak256(
        "VerificationData(string projectId,string milestoneId,address freelancer,uint256 technicalAmount,uint256 subjectiveAmount,uint256 timestamp,string ipfsHash,bool approved)"
    );

    // ============ STRUCTS ============

    struct PayoutData {
        string milestoneId;
        address recipient;
        uint256 amount;
        uint256 timestamp;
    }

    struct VerificationData {
        string projectId;
        string milestoneId;
        address freelancer;
        uint256 technicalAmount;
        uint256 subjectiveAmount;
        uint256 timestamp;
        string ipfsHash;
        bool approved;
    }

    // ============ STATE VARIABLES ============

    /// @dev Mapping of authorized AI agent addresses
    mapping(address => bool) public authorizedAgents;
    
    /// @dev Mapping to track used signatures (prevent replay attacks)
    mapping(bytes32 => bool) public usedSignatures;

    // ============ EVENTS ============

    event AgentAuthorized(address indexed agent);
    event AgentRevoked(address indexed agent);
    event SignatureVerified(bytes32 indexed signatureHash, address indexed signer);

    // ============ MODIFIERS ============

    modifier onlyAuthorizedAgent(address agent) {
        require(authorizedAgents[agent], "EIP712Verifier: Unauthorized agent");
        _;
    }

    // ============ CONSTRUCTOR ============

    constructor() EIP712("VeraProtocol", "1") Ownable(msg.sender) {}

    // ============ CORE FUNCTIONS ============

    /**
     * @dev Verifies a payout signature from an authorized AI agent
     * @param data The payout data struct
     * @param signature The EIP-712 signature
     * @return signer The address that signed the data
     * @return isValid Whether the signature is valid and from authorized agent
     */
    function verifyPayoutSignature(
        PayoutData calldata data,
        bytes calldata signature
    ) external returns (address signer, bool isValid) {
        bytes32 structHash = keccak256(abi.encode(
            PAYOUT_TYPEHASH,
            keccak256(bytes(data.milestoneId)),
            data.recipient,
            data.amount,
            data.timestamp
        ));

        bytes32 hash = _hashTypedDataV4(structHash);
        
        // Check for signature replay
        require(!usedSignatures[hash], "EIP712Verifier: Signature already used");
        
        signer = hash.recover(signature);
        isValid = authorizedAgents[signer];

        if (isValid) {
            usedSignatures[hash] = true;
            emit SignatureVerified(hash, signer);
        }

        return (signer, isValid);
    }

    /**
     * @dev Verifies a verification data signature from an authorized AI agent
     * @param data The verification data struct
     * @param signature The EIP-712 signature
     * @return signer The address that signed the data
     * @return isValid Whether the signature is valid and from authorized agent
     */
    function verifyVerificationSignature(
        VerificationData calldata data,
        bytes calldata signature
    ) external returns (address signer, bool isValid) {
        bytes32 structHash = keccak256(abi.encode(
            VERIFICATION_TYPEHASH,
            keccak256(bytes(data.projectId)),
            keccak256(bytes(data.milestoneId)),
            data.freelancer,
            data.technicalAmount,
            data.subjectiveAmount,
            data.timestamp,
            keccak256(bytes(data.ipfsHash)),
            data.approved
        ));

        bytes32 hash = _hashTypedDataV4(structHash);
        
        // Check for signature replay
        require(!usedSignatures[hash], "EIP712Verifier: Signature already used");
        
        signer = hash.recover(signature);
        isValid = authorizedAgents[signer];

        if (isValid) {
            usedSignatures[hash] = true;
            emit SignatureVerified(hash, signer);
        }

        return (signer, isValid);
    }

    /**
     * @dev Pure function to verify signature without state changes (for view calls)
     * @param data The payout data struct
     * @param signature The EIP-712 signature
     * @return signer The address that signed the data
     * @return isValid Whether the signature is valid and from authorized agent
     */
    function verifyPayoutSignaturePure(
        PayoutData calldata data,
        bytes calldata signature
    ) external view returns (address signer, bool isValid) {
        bytes32 structHash = keccak256(abi.encode(
            PAYOUT_TYPEHASH,
            keccak256(bytes(data.milestoneId)),
            data.recipient,
            data.amount,
            data.timestamp
        ));

        bytes32 hash = _hashTypedDataV4(structHash);
        signer = hash.recover(signature);
        isValid = authorizedAgents[signer] && !usedSignatures[hash];

        return (signer, isValid);
    }

    /**
     * @dev Generates the EIP-712 hash for payout data (for off-chain signing)
     * @param data The payout data struct
     * @return hash The EIP-712 hash to be signed
     */
    function getPayoutHash(PayoutData calldata data) external view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(
            PAYOUT_TYPEHASH,
            keccak256(bytes(data.milestoneId)),
            data.recipient,
            data.amount,
            data.timestamp
        ));

        return _hashTypedDataV4(structHash);
    }

    /**
     * @dev Generates the EIP-712 hash for verification data (for off-chain signing)
     * @param data The verification data struct
     * @return hash The EIP-712 hash to be signed
     */
    function getVerificationHash(VerificationData calldata data) external view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(
            VERIFICATION_TYPEHASH,
            keccak256(bytes(data.projectId)),
            keccak256(bytes(data.milestoneId)),
            data.freelancer,
            data.technicalAmount,
            data.subjectiveAmount,
            data.timestamp,
            keccak256(bytes(data.ipfsHash)),
            data.approved
        ));

        return _hashTypedDataV4(structHash);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Authorizes an AI agent to sign verification data
     * @param agent The address of the AI agent to authorize
     */
    function authorizeAgent(address agent) external onlyOwner {
        require(agent != address(0), "EIP712Verifier: Invalid agent address");
        require(!authorizedAgents[agent], "EIP712Verifier: Agent already authorized");
        
        authorizedAgents[agent] = true;
        emit AgentAuthorized(agent);
    }

    /**
     * @dev Revokes authorization for an AI agent
     * @param agent The address of the AI agent to revoke
     */
    function revokeAgent(address agent) external onlyOwner {
        require(authorizedAgents[agent], "EIP712Verifier: Agent not authorized");
        
        authorizedAgents[agent] = false;
        emit AgentRevoked(agent);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Returns the EIP-712 domain separator
     */
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @dev Checks if an agent is authorized
     * @param agent The agent address to check
     * @return Whether the agent is authorized
     */
    function isAuthorizedAgent(address agent) external view returns (bool) {
        return authorizedAgents[agent];
    }

    /**
     * @dev Checks if a signature hash has been used
     * @param signatureHash The signature hash to check
     * @return Whether the signature has been used
     */
    function isSignatureUsed(bytes32 signatureHash) external view returns (bool) {
        return usedSignatures[signatureHash];
    }
}