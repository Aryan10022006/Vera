# Vera Protocol - Requirements Specification (EARS Notation)

## System Overview
Vera Protocol SHALL implement a Pure Web3 AI-mediated escrow system that eliminates freelance fraud through decentralized verification and automated arbitration.

## R1: Voice-to-IPFS Handshake
**WHEN** a client initiates a project conversation via voice input,  
**THE SYSTEM** SHALL convert the human conversation into a structured JSON agreement,  
**AND** SHALL pin the agreement to IPFS,  
**AND** SHALL return an IPFS hash as the immutable project reference.

### R1.1: Voice Processing
**THE SYSTEM** SHALL accept voice input in multiple languages,  
**AND** SHALL transcribe speech to text with >95% accuracy,  
**AND** SHALL extract project requirements, deliverables, timeline, and payment terms.

### R1.2: Agreement Structure
**THE SYSTEM** SHALL generate a JSON agreement containing:
- Project title and description
- Technical requirements (80% of scope)
- Subjective requirements (20% of scope)
- Milestone definitions with acceptance criteria
- Payment amount and schedule
- Deadline timestamps
- Client and freelancer wallet addresses

### R1.3: IPFS Pinning
**THE SYSTEM** SHALL pin the agreement JSON to IPFS,  
**AND** SHALL ensure the content remains accessible for the project duration,  
**AND** SHALL provide the IPFS hash to both parties.

## R2: Verification Logic
**WHEN** a freelancer submits work for milestone verification,  
**THE KIRO AGENT** SHALL use #[fetch] to read the IPFS agreement,  
**AND** SHALL use #[github] to audit the freelancer's code repository,  
**AND** SHALL compare deliverables against the original requirements.

### R2.1: IPFS Agreement Retrieval
**THE AGENT** SHALL fetch the project agreement from IPFS using the provided hash,  
**AND** SHALL parse the JSON structure to extract verification criteria,  
**AND** SHALL validate the agreement integrity.

### R2.2: Code Audit Process
**THE AGENT** SHALL access the freelancer's GitHub repository,  
**AND** SHALL analyze code quality, functionality, and security,  
**AND** SHALL verify that all technical requirements are met,  
**AND** SHALL generate an audit report with pass/fail status.

### R2.3: Milestone Assessment
**THE AGENT** SHALL evaluate each milestone against defined acceptance criteria,  
**AND** SHALL calculate completion percentage for technical elements (80%),  
**AND** SHALL flag subjective elements (20%) for separate review,  
**AND** SHALL determine if milestone qualifies for automatic payout.

## R3: Typed Data Signing
**IF** the audit passes technical requirements,  
**THE AGENT** SHALL generate an EIP-712 compliant signature for the payout,  
**AND** SHALL include milestone details, payment amount, and verification timestamp,  
**AND** SHALL submit the signature to the smart contract.

### R3.1: EIP-712 Structure with Domain Separation
**THE SYSTEM** SHALL implement typed data structure containing:
- Domain separator with contract address and chain ID for replay attack prevention
- Network-specific domain separator to prevent cross-chain signature reuse
- Milestone identifier and completion status
- Payment recipient address and amount
- Verification timestamp and agent signature
- IPFS hash reference for audit trail

**THE DOMAIN SEPARATOR** SHALL include:
- Contract name: "VeraProtocol"
- Contract version: "1.0.0"  
- Chain ID: Network-specific identifier (11155111 for Sepolia)
- Verifying contract address: Deployed VeraEscrow contract address

### R3.2: Signature Generation
**THE AGENT** SHALL sign the typed data using a secure private key,  
**AND** SHALL ensure signature validity can be verified on-chain,  
**AND** SHALL include all necessary parameters for contract execution.

## R4: Smart Escrow Contract
**THE SOLIDITY CONTRACT** SHALL be deployed on Sepolia testnet,  
**AND** SHALL hold escrowed funds securely,  
**AND** SHALL release funds only upon verifying the AI agent's signature,  
**AND** SHALL implement multi-signature security for critical operations.

### R4.1: Fund Management
**THE CONTRACT** SHALL accept ETH deposits from clients,  
**AND** SHALL lock funds until milestone completion,  
**AND** SHALL support partial releases based on milestone progress,  
**AND** SHALL handle refunds for disputed or cancelled projects.

### R4.2: Signature Verification
**THE CONTRACT** SHALL verify EIP-712 signatures from authorized AI agents,  
**AND** SHALL validate signature parameters against stored project data,  
**AND** SHALL execute payouts automatically upon successful verification,  
**AND** SHALL emit events for all state changes.

### R4.3: Emergency Controls
**THE CONTRACT** SHALL include pause functionality for security incidents,  
**AND** SHALL support contract upgrades through proxy patterns,  
**AND** SHALL implement timelock delays for critical parameter changes.

## R5: 80/20 Variance Buffer (CORE SYSTEM INVARIANT)
**THE SYSTEM** SHALL implement an 80/20 split as an immutable protocol invariant,  
**WHERE** 80% of payment MUST be tied to objective technical milestones,  
**AND** 20% SHALL be held in a variance buffer for subjective evaluation,  
**AND** this ratio SHALL NOT be modifiable by any party or governance mechanism.

### R5.1: Technical Milestone Auto-Release (INVARIANT)
**WHEN** technical requirements are verified as complete,  
**THE SYSTEM** SHALL automatically release 80% of the milestone payment,  
**REGARDLESS** of subjective disputes, style preferences, or client objections,  
**AND** this release SHALL be irreversible and immediate.

### R5.2: Subjective Buffer Management
**THE SYSTEM** SHALL hold 20% of payment for subjective elements,  
**AND** SHALL require explicit approval from both parties OR timeout resolution,  
**AND** SHALL provide dispute resolution mechanisms for contested elements.

## R6: 72-Hour Silent Consent Protocol (CORE SYSTEM INVARIANT)
**THE SYSTEM** SHALL implement Silent Consent as an immutable protocol invariant,  
**WHERE** funds MUST automatically release after 72 hours of client non-response,  
**REGARDLESS** of external factors or manual intervention attempts.

**WHEN** a milestone is submitted and passes AI audit,  
**THE SYSTEM** SHALL notify the client of completion,  
**AND** SHALL start a 72-hour countdown timer,  
**AND** SHALL automatically release funds if no objection is raised within 72 hours.

### R6.1: Notification System
**THE SYSTEM** SHALL send notifications via multiple channels (email, wallet, platform),  
**AND** SHALL provide clear instructions for reviewing and approving/rejecting work,  
**AND** SHALL include direct links to submitted deliverables.

### R6.2: Automatic Release
**IF** no client response is received within 72 hours,  
**THE SYSTEM** SHALL automatically trigger fund release,  
**AND** SHALL execute the payout transaction,  
**AND** SHALL update project status to milestone completed.

### R6.3: Dispute Window
**THE CLIENT** SHALL have 24 additional hours after auto-release to raise disputes,  
**AND** SHALL provide specific technical objections with evidence,  
**AND** SHALL trigger dispute resolution process if valid concerns are raised.

## R7: Decentralization Requirements
**THE SYSTEM** SHALL operate without traditional databases,  
**AND** SHALL store all data on IPFS or blockchain,  
**AND** SHALL ensure no single point of failure,  
**AND** SHALL maintain censorship resistance.

### R7.1: Data Storage
**ALL PROJECT DATA** SHALL be stored on IPFS with content addressing,  
**ALL FINANCIAL TRANSACTIONS** SHALL be recorded on blockchain,  
**ALL AGENT DECISIONS** SHALL be cryptographically signed and verifiable.

### R7.2: Agent Decentralization
**THE AI AGENTS** SHALL operate as independent oracles,  
**AND** SHALL be replaceable without system disruption,  
**AND** SHALL provide transparent audit trails for all decisions.

## R8: Security Requirements
**THE SYSTEM** SHALL implement zero-trust architecture,  
**AND** SHALL encrypt all sensitive communications,  
**AND** SHALL undergo security audits before mainnet deployment,  
**AND** SHALL include bug bounty programs for ongoing security validation.