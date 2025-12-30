const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("VeraEscrow", function () {
  // ============ FIXTURES ============

  async function deployVeraEscrowFixture() {
    const [owner, client, freelancer, agent, other] = await ethers.getSigners();

    // Deploy EIP712Verifier first
    const EIP712Verifier = await ethers.getContractFactory("EIP712Verifier");
    const verifier = await EIP712Verifier.deploy();

    // Deploy VeraEscrow with agent address
    const VeraEscrow = await ethers.getContractFactory("VeraEscrow");
    const escrow = await VeraEscrow.deploy(agent.address);

    // Authorize the agent in the verifier
    await verifier.authorizeAgent(agent.address);

    return { escrow, verifier, owner, client, freelancer, agent, other };
  }

  // ============ DEPLOYMENT TESTS ============

  describe("Deployment", function () {
    it("Should set the correct authorized agent", async function () {
      const { escrow, agent } = await loadFixture(deployVeraEscrowFixture);
      expect(await escrow.authorizedAgent()).to.equal(agent.address);
    });

    it("Should set the correct owner", async function () {
      const { escrow, owner } = await loadFixture(deployVeraEscrowFixture);
      expect(await escrow.owner()).to.equal(owner.address);
    });

    it("Should have correct constants", async function () {
      const { escrow } = await loadFixture(deployVeraEscrowFixture);
      expect(await escrow.TECHNICAL_RELEASE_PERCENTAGE()).to.equal(80);
      expect(await escrow.SUBJECTIVE_BUFFER_PERCENTAGE()).to.equal(20);
      expect(await escrow.SILENT_CONSENT_PERIOD()).to.equal(72 * 60 * 60); // 72 hours
    });
  });

  // ============ PROJECT CREATION TESTS ============

  describe("Project Creation", function () {
    it("Should create a project with correct parameters", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployVeraEscrowFixture);
      
      const projectId = ethers.keccak256(ethers.toUtf8Bytes("test-project-1"));
      const ipfsHash = ethers.keccak256(ethers.toUtf8Bytes("QmTest123"));
      const amount = ethers.parseEther("1.0");

      await expect(
        escrow.connect(client).createProject(projectId, freelancer.address, ipfsHash, { value: amount })
      ).to.emit(escrow, "ProjectCreated")
        .withArgs(projectId, client.address, freelancer.address, amount, ipfsHash);

      const project = await escrow.projects(projectId);
      expect(project.client).to.equal(client.address);
      expect(project.freelancer).to.equal(freelancer.address);
      expect(project.totalAmount).to.equal(amount);
      expect(project.ipfsHash).to.equal(ipfsHash);
    });

    it("Should reject project creation with invalid parameters", async function () {
      const { escrow, client, freelancer } = await loadFixture(deployVeraEscrowFixture);
      
      const projectId = ethers.keccak256(ethers.toUtf8Bytes("test-project-1"));
      const ipfsHash = ethers.keccak256(ethers.toUtf8Bytes("QmTest123"));

      // Invalid project ID
      await expect(
        escrow.connect(client).createProject(ethers.ZeroHash, freelancer.address, ipfsHash, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("VeraEscrow: Invalid project ID");

      // Invalid freelancer address
      await expect(
        escrow.connect(client).createProject(projectId, ethers.ZeroAddress, ipfsHash, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("VeraEscrow: Invalid freelancer address");

      // Client cannot be freelancer
      await expect(
        escrow.connect(client).createProject(projectId, client.address, ipfsHash, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("VeraEscrow: Client cannot be freelancer");

      // No funds deposited
      await expect(
        escrow.connect(client).createProject(projectId, freelancer.address, ipfsHash, { value: 0 })
      ).to.be.revertedWith("VeraEscrow: Must deposit funds");
    });
  });

  // ============ MILESTONE TESTS ============

  describe("Milestone Management", function () {
    async function createProjectFixture() {
      const fixture = await loadFixture(deployVeraEscrowFixture);
      const { escrow, client, freelancer } = fixture;
      
      const projectId = ethers.keccak256(ethers.toUtf8Bytes("test-project-1"));
      const ipfsHash = ethers.keccak256(ethers.toUtf8Bytes("QmTest123"));
      const amount = ethers.parseEther("1.0");

      await escrow.connect(client).createProject(projectId, freelancer.address, ipfsHash, { value: amount });
      
      return { ...fixture, projectId, ipfsHash, projectAmount: amount };
    }

    it("Should create milestone with correct 80/20 split", async function () {
      const { escrow, client, projectId } = await loadFixture(createProjectFixture);
      
      const milestoneId = ethers.keccak256(ethers.toUtf8Bytes("milestone-1"));
      const milestoneAmount = ethers.parseEther("0.5");

      await escrow.connect(client).createMilestone(projectId, milestoneId, milestoneAmount);

      const milestone = await escrow.milestones(milestoneId);
      const expectedTechnical = (milestoneAmount * 80n) / 100n;
      const expectedSubjective = milestoneAmount - expectedTechnical;

      expect(milestone.technicalAmount).to.equal(expectedTechnical);
      expect(milestone.subjectiveAmount).to.equal(expectedSubjective);
      expect(milestone.projectId).to.equal(projectId);
    });

    it("Should allow freelancer to submit milestone", async function () {
      const { escrow, client, freelancer, projectId } = await loadFixture(createProjectFixture);
      
      const milestoneId = ethers.keccak256(ethers.toUtf8Bytes("milestone-1"));
      const milestoneAmount = ethers.parseEther("0.5");

      await escrow.connect(client).createMilestone(projectId, milestoneId, milestoneAmount);
      
      await expect(
        escrow.connect(freelancer).submitMilestone(milestoneId)
      ).to.emit(escrow, "MilestoneSubmitted")
        .withArgs(milestoneId, projectId, await time.latest() + 1);

      const milestone = await escrow.milestones(milestoneId);
      expect(milestone.status).to.equal(1); // MilestoneStatus.Submitted
    });
  });

  // ============ EIP-712 SIGNATURE TESTS ============

  describe("EIP-712 Signature Verification", function () {
    async function createSubmittedMilestoneFixture() {
      const fixture = await loadFixture(createProjectFixture);
      const { escrow, client, freelancer, projectId } = fixture;
      
      const milestoneId = ethers.keccak256(ethers.toUtf8Bytes("milestone-1"));
      const milestoneAmount = ethers.parseEther("0.5");

      await escrow.connect(client).createMilestone(projectId, milestoneId, milestoneAmount);
      await escrow.connect(freelancer).submitMilestone(milestoneId);
      
      return { ...fixture, milestoneId, milestoneAmount };
    }

    it("Should verify and release funds with valid AI signature", async function () {
      const { escrow, agent, freelancer, projectId, milestoneId, milestoneAmount } = 
        await loadFixture(createSubmittedMilestoneFixture);

      const technicalAmount = (milestoneAmount * 80n) / 100n;
      const subjectiveAmount = milestoneAmount - technicalAmount;

      // Create verification data
      const verificationData = {
        projectId: projectId,
        milestoneId: milestoneId,
        freelancer: freelancer.address,
        technicalAmount: technicalAmount,
        subjectiveAmount: subjectiveAmount,
        timestamp: await time.latest(),
        ipfsHash: ethers.keccak256(ethers.toUtf8Bytes("QmTest123")),
        approved: true
      };

      // Create EIP-712 signature
      const domain = {
        name: "VeraProtocol",
        version: "1.0.0",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await escrow.getAddress()
      };

      const types = {
        VerificationData: [
          { name: "projectId", type: "bytes32" },
          { name: "milestoneId", type: "bytes32" },
          { name: "freelancer", type: "address" },
          { name: "technicalAmount", type: "uint256" },
          { name: "subjectiveAmount", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "ipfsHash", type: "bytes32" },
          { name: "approved", type: "bool" }
        ]
      };

      const signature = await agent.signTypedData(domain, types, verificationData);

      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

      await expect(
        escrow.verifyAndRelease(verificationData, signature)
      ).to.emit(escrow, "TechnicalReleaseExecuted")
        .withArgs(milestoneId, freelancer.address, technicalAmount);

      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);
      expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(technicalAmount);

      const milestone = await escrow.milestones(milestoneId);
      expect(milestone.technicalReleased).to.be.true;
      expect(milestone.status).to.equal(2); // MilestoneStatus.TechnicalReleased
    });

    it("Should reject invalid signatures", async function () {
      const { escrow, other, freelancer, projectId, milestoneId, milestoneAmount } = 
        await loadFixture(createSubmittedMilestoneFixture);

      const technicalAmount = (milestoneAmount * 80n) / 100n;
      const subjectiveAmount = milestoneAmount - technicalAmount;

      const verificationData = {
        projectId: projectId,
        milestoneId: milestoneId,
        freelancer: freelancer.address,
        technicalAmount: technicalAmount,
        subjectiveAmount: subjectiveAmount,
        timestamp: await time.latest(),
        ipfsHash: ethers.keccak256(ethers.toUtf8Bytes("QmTest123")),
        approved: true
      };

      // Create signature with unauthorized signer
      const domain = {
        name: "VeraProtocol",
        version: "1.0.0",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await escrow.getAddress()
      };

      const types = {
        VerificationData: [
          { name: "projectId", type: "bytes32" },
          { name: "milestoneId", type: "bytes32" },
          { name: "freelancer", type: "address" },
          { name: "technicalAmount", type: "uint256" },
          { name: "subjectiveAmount", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "ipfsHash", type: "bytes32" },
          { name: "approved", type: "bool" }
        ]
      };

      const invalidSignature = await other.signTypedData(domain, types, verificationData);

      await expect(
        escrow.verifyAndRelease(verificationData, invalidSignature)
      ).to.be.revertedWith("VeraEscrow: Invalid agent signature");
    });
  });

  // ============ SILENT CONSENT TESTS ============

  describe("Silent Consent Protocol", function () {
    async function createTechnicalReleasedMilestoneFixture() {
      const fixture = await loadFixture(createSubmittedMilestoneFixture);
      const { escrow, agent, freelancer, projectId, milestoneId, milestoneAmount } = fixture;

      const technicalAmount = (milestoneAmount * 80n) / 100n;
      const subjectiveAmount = milestoneAmount - technicalAmount;

      const verificationData = {
        projectId: projectId,
        milestoneId: milestoneId,
        freelancer: freelancer.address,
        technicalAmount: technicalAmount,
        subjectiveAmount: subjectiveAmount,
        timestamp: await time.latest(),
        ipfsHash: ethers.keccak256(ethers.toUtf8Bytes("QmTest123")),
        approved: true
      };

      const domain = {
        name: "VeraProtocol",
        version: "1.0.0",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await escrow.getAddress()
      };

      const types = {
        VerificationData: [
          { name: "projectId", type: "bytes32" },
          { name: "milestoneId", type: "bytes32" },
          { name: "freelancer", type: "address" },
          { name: "technicalAmount", type: "uint256" },
          { name: "subjectiveAmount", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "ipfsHash", type: "bytes32" },
          { name: "approved", type: "bool" }
        ]
      };

      const signature = await agent.signTypedData(domain, types, verificationData);
      await escrow.verifyAndRelease(verificationData, signature);

      return { ...fixture, technicalAmount, subjectiveAmount };
    }

    it("Should release subjective funds after 72 hours", async function () {
      const { escrow, freelancer, milestoneId, subjectiveAmount } = 
        await loadFixture(createTechnicalReleasedMilestoneFixture);

      // Fast forward 72 hours + 1 second
      await time.increase(72 * 60 * 60 + 1);

      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

      await expect(
        escrow.releaseSilentConsent(milestoneId)
      ).to.emit(escrow, "SilentConsentTriggered")
        .withArgs(milestoneId, await time.latest() + 1)
        .and.to.emit(escrow, "SubjectiveReleaseExecuted")
        .withArgs(milestoneId, freelancer.address, subjectiveAmount);

      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);
      expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(subjectiveAmount);
    });

    it("Should not release subjective funds before 72 hours", async function () {
      const { escrow, milestoneId } = await loadFixture(createTechnicalReleasedMilestoneFixture);

      // Try to release before 72 hours
      await expect(
        escrow.releaseSilentConsent(milestoneId)
      ).to.be.revertedWith("VeraEscrow: Silent consent period active");
    });

    it("Should allow client to approve subjective before silent consent", async function () {
      const { escrow, client, freelancer, milestoneId, subjectiveAmount } = 
        await loadFixture(createTechnicalReleasedMilestoneFixture);

      const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

      await expect(
        escrow.connect(client).approveSubjective(milestoneId)
      ).to.emit(escrow, "SubjectiveReleaseExecuted")
        .withArgs(milestoneId, freelancer.address, subjectiveAmount);

      const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);
      expect(freelancerBalanceAfter - freelancerBalanceBefore).to.equal(subjectiveAmount);
    });
  });

  // ============ PROPERTY-BASED TESTS ============

  describe("Property-Based Tests", function () {
    /**
     * Property 4: Escrow Contract 80/20 Split
     * For any deposit amount, the smart contract should allocate exactly 80% to objective milestones and 20% to subjective variance
     * Feature: vera-protocol, Property 4: Escrow Contract 80/20 Split
     */
    it("Property 4: Should maintain 80/20 split for any milestone amount", async function () {
      const { escrow, client, projectId } = await loadFixture(createProjectFixture);

      // Test with various milestone amounts
      const testAmounts = [
        ethers.parseEther("0.1"),
        ethers.parseEther("1.0"),
        ethers.parseEther("10.0"),
        ethers.parseEther("0.333"),
        ethers.parseEther("2.7182"), // e
        ethers.parseEther("3.14159"), // pi
        BigInt("1"), // 1 wei
        BigInt("999999999999999999"), // Just under 1 ETH
      ];

      for (let i = 0; i < testAmounts.length; i++) {
        const amount = testAmounts[i];
        const milestoneId = ethers.keccak256(ethers.toUtf8Bytes(`milestone-${i}`));
        
        await escrow.connect(client).createMilestone(projectId, milestoneId, amount);
        
        const milestone = await escrow.milestones(milestoneId);
        const expectedTechnical = (amount * 80n) / 100n;
        const expectedSubjective = amount - expectedTechnical;
        
        expect(milestone.technicalAmount).to.equal(expectedTechnical);
        expect(milestone.subjectiveAmount).to.equal(expectedSubjective);
        
        // Verify the split adds up to the original amount
        expect(milestone.technicalAmount + milestone.subjectiveAmount).to.equal(amount);
        
        // Verify the percentage is exactly 80% (within rounding)
        const actualPercentage = (milestone.technicalAmount * 100n) / amount;
        expect(actualPercentage).to.equal(80n);
      }
    });

    /**
     * Property 5: Automated Payment Release
     * For any verified milestone completion, the system should automatically release the corresponding payment amount without manual intervention
     * Feature: vera-protocol, Property 5: Automated Payment Release
     */
    it("Property 5: Should automatically release technical payment upon verification", async function () {
      const { escrow, agent, client, freelancer, projectId } = await loadFixture(createProjectFixture);

      // Test with multiple milestones
      const testCases = [
        { id: "milestone-auto-1", amount: ethers.parseEther("0.5") },
        { id: "milestone-auto-2", amount: ethers.parseEther("1.0") },
        { id: "milestone-auto-3", amount: ethers.parseEther("0.25") },
      ];

      for (const testCase of testCases) {
        const milestoneId = ethers.keccak256(ethers.toUtf8Bytes(testCase.id));
        
        // Create and submit milestone
        await escrow.connect(client).createMilestone(projectId, milestoneId, testCase.amount);
        await escrow.connect(freelancer).submitMilestone(milestoneId);

        const technicalAmount = (testCase.amount * 80n) / 100n;
        const subjectiveAmount = testCase.amount - technicalAmount;

        // Create verification signature
        const verificationData = {
          projectId: projectId,
          milestoneId: milestoneId,
          freelancer: freelancer.address,
          technicalAmount: technicalAmount,
          subjectiveAmount: subjectiveAmount,
          timestamp: await time.latest(),
          ipfsHash: ethers.keccak256(ethers.toUtf8Bytes("QmTest123")),
          approved: true
        };

        const domain = {
          name: "VeraProtocol",
          version: "1.0.0",
          chainId: await ethers.provider.getNetwork().then(n => n.chainId),
          verifyingContract: await escrow.getAddress()
        };

        const types = {
          VerificationData: [
            { name: "projectId", type: "bytes32" },
            { name: "milestoneId", type: "bytes32" },
            { name: "freelancer", type: "address" },
            { name: "technicalAmount", type: "uint256" },
            { name: "subjectiveAmount", type: "uint256" },
            { name: "timestamp", type: "uint256" },
            { name: "ipfsHash", type: "bytes32" },
            { name: "approved", type: "bool" }
          ]
        };

        const signature = await agent.signTypedData(domain, types, verificationData);

        const freelancerBalanceBefore = await ethers.provider.getBalance(freelancer.address);

        // Verify and release - should automatically release technical amount
        await escrow.verifyAndRelease(verificationData, signature);

        const freelancerBalanceAfter = await ethers.provider.getBalance(freelancer.address);
        const actualPayment = freelancerBalanceAfter - freelancerBalanceBefore;

        // Verify automatic release of technical amount (80%)
        expect(actualPayment).to.equal(technicalAmount);

        // Verify milestone status updated
        const milestone = await escrow.milestones(milestoneId);
        expect(milestone.technicalReleased).to.be.true;
        expect(milestone.status).to.equal(2); // TechnicalReleased
      }
    });
  });

  // ============ DISPUTE TESTS ============

  describe("Dispute Management", function () {
    it("Should allow client to raise dispute within window", async function () {
      const { escrow, client, milestoneId } = await loadFixture(createTechnicalReleasedMilestoneFixture);

      await expect(
        escrow.connect(client).raiseDispute(milestoneId, "Quality concerns")
      ).to.emit(escrow, "DisputeRaised")
        .withArgs(milestoneId, client.address, "Quality concerns");

      const milestone = await escrow.milestones(milestoneId);
      expect(milestone.status).to.equal(4); // MilestoneStatus.Disputed
    });

    it("Should not allow dispute after window expires", async function () {
      const { escrow, client, milestoneId } = await loadFixture(createTechnicalReleasedMilestoneFixture);

      // Fast forward past dispute window (72 hours + 24 hours + 1 second)
      await time.increase(96 * 60 * 60 + 1);

      await expect(
        escrow.connect(client).raiseDispute(milestoneId, "Quality concerns")
      ).to.be.revertedWith("VeraEscrow: Dispute window expired");
    });
  });
});

// Helper function to create project fixture (reusable)
async function createProjectFixture() {
  const fixture = await loadFixture(deployVeraEscrowFixture);
  const { escrow, client, freelancer } = fixture;
  
  const projectId = ethers.keccak256(ethers.toUtf8Bytes("test-project-1"));
  const ipfsHash = ethers.keccak256(ethers.toUtf8Bytes("QmTest123"));
  const amount = ethers.parseEther("1.0");

  await escrow.connect(client).createProject(projectId, freelancer.address, ipfsHash, { value: amount });
  
  return { ...fixture, projectId, ipfsHash, projectAmount: amount };
}

// Helper function to create submitted milestone fixture
async function createSubmittedMilestoneFixture() {
  const fixture = await createProjectFixture();
  const { escrow, client, freelancer, projectId } = fixture;
  
  const milestoneId = ethers.keccak256(ethers.toUtf8Bytes("milestone-1"));
  const milestoneAmount = ethers.parseEther("0.5");

  await escrow.connect(client).createMilestone(projectId, milestoneId, milestoneAmount);
  await escrow.connect(freelancer).submitMilestone(milestoneId);
  
  return { ...fixture, milestoneId, milestoneAmount };
}

// Helper function to create technical released milestone fixture
async function createTechnicalReleasedMilestoneFixture() {
  const fixture = await createSubmittedMilestoneFixture();
  const { escrow, agent, freelancer, projectId, milestoneId, milestoneAmount } = fixture;

  const technicalAmount = (milestoneAmount * 80n) / 100n;
  const subjectiveAmount = milestoneAmount - technicalAmount;

  const verificationData = {
    projectId: projectId,
    milestoneId: milestoneId,
    freelancer: freelancer.address,
    technicalAmount: technicalAmount,
    subjectiveAmount: subjectiveAmount,
    timestamp: await time.latest(),
    ipfsHash: ethers.keccak256(ethers.toUtf8Bytes("QmTest123")),
    approved: true
  };

  const domain = {
    name: "VeraProtocol",
    version: "1.0.0",
    chainId: await ethers.provider.getNetwork().then(n => n.chainId),
    verifyingContract: await escrow.getAddress()
  };

  const types = {
    VerificationData: [
      { name: "projectId", type: "bytes32" },
      { name: "milestoneId", type: "bytes32" },
      { name: "freelancer", type: "address" },
      { name: "technicalAmount", type: "uint256" },
      { name: "subjectiveAmount", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "ipfsHash", type: "bytes32" },
      { name: "approved", type: "bool" }
    ]
  };

  const signature = await agent.signTypedData(domain, types, verificationData);
  await escrow.verifyAndRelease(verificationData, signature);

  return { ...fixture, technicalAmount, subjectiveAmount };
}