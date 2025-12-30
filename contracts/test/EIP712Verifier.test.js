const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("EIP712Verifier", function () {
  // ============ FIXTURES ============

  async function deployEIP712VerifierFixture() {
    const [owner, agent1, agent2, user, other] = await ethers.getSigners();

    const EIP712Verifier = await ethers.getContractFactory("EIP712Verifier");
    const verifier = await EIP712Verifier.deploy();

    return { verifier, owner, agent1, agent2, user, other };
  }

  // ============ DEPLOYMENT TESTS ============

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { verifier, owner } = await loadFixture(deployEIP712VerifierFixture);
      expect(await verifier.owner()).to.equal(owner.address);
    });

    it("Should have correct EIP-712 domain", async function () {
      const { verifier } = await loadFixture(deployEIP712VerifierFixture);
      const domainSeparator = await verifier.getDomainSeparator();
      expect(domainSeparator).to.not.equal(ethers.ZeroHash);
    });
  });

  // ============ AGENT MANAGEMENT TESTS ============

  describe("Agent Management", function () {
    it("Should authorize agent", async function () {
      const { verifier, owner, agent1 } = await loadFixture(deployEIP712VerifierFixture);

      await expect(verifier.connect(owner).authorizeAgent(agent1.address))
        .to.emit(verifier, "AgentAuthorized")
        .withArgs(agent1.address);

      expect(await verifier.isAuthorizedAgent(agent1.address)).to.be.true;
    });

    it("Should revoke agent", async function () {
      const { verifier, owner, agent1 } = await loadFixture(deployEIP712VerifierFixture);

      await verifier.connect(owner).authorizeAgent(agent1.address);
      
      await expect(verifier.connect(owner).revokeAgent(agent1.address))
        .to.emit(verifier, "AgentRevoked")
        .withArgs(agent1.address);

      expect(await verifier.isAuthorizedAgent(agent1.address)).to.be.false;
    });

    it("Should reject unauthorized agent management", async function () {
      const { verifier, agent1, other } = await loadFixture(deployEIP712VerifierFixture);

      await expect(
        verifier.connect(other).authorizeAgent(agent1.address)
      ).to.be.revertedWithCustomError(verifier, "OwnableUnauthorizedAccount");
    });

    it("Should reject invalid agent addresses", async function () {
      const { verifier, owner } = await loadFixture(deployEIP712VerifierFixture);

      await expect(
        verifier.connect(owner).authorizeAgent(ethers.ZeroAddress)
      ).to.be.revertedWith("EIP712Verifier: Invalid agent address");
    });
  });

  // ============ PAYOUT SIGNATURE TESTS ============

  describe("Payout Signature Verification", function () {
    async function authorizedAgentFixture() {
      const fixture = await loadFixture(deployEIP712VerifierFixture);
      const { verifier, owner, agent1 } = fixture;

      await verifier.connect(owner).authorizeAgent(agent1.address);

      return fixture;
    }

    it("Should verify valid payout signature", async function () {
      const { verifier, agent1, user } = await loadFixture(authorizedAgentFixture);

      const payoutData = {
        milestoneId: "milestone-123",
        recipient: user.address,
        amount: ethers.parseEther("1.0"),
        timestamp: Math.floor(Date.now() / 1000)
      };

      // Create EIP-712 signature
      const domain = {
        name: "VeraProtocol",
        version: "1",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await verifier.getAddress()
      };

      const types = {
        Payout: [
          { name: "milestoneId", type: "string" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" }
        ]
      };

      const signature = await agent1.signTypedData(domain, types, payoutData);

      const [signer, isValid] = await verifier.verifyPayoutSignature(payoutData, signature);

      expect(signer).to.equal(agent1.address);
      expect(isValid).to.be.true;
    });

    it("Should reject signature from unauthorized agent", async function () {
      const { verifier, agent2, user } = await loadFixture(authorizedAgentFixture);

      const payoutData = {
        milestoneId: "milestone-123",
        recipient: user.address,
        amount: ethers.parseEther("1.0"),
        timestamp: Math.floor(Date.now() / 1000)
      };

      const domain = {
        name: "VeraProtocol",
        version: "1",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await verifier.getAddress()
      };

      const types = {
        Payout: [
          { name: "milestoneId", type: "string" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" }
        ]
      };

      const signature = await agent2.signTypedData(domain, types, payoutData);

      const [signer, isValid] = await verifier.verifyPayoutSignature(payoutData, signature);

      expect(signer).to.equal(agent2.address);
      expect(isValid).to.be.false;
    });

    it("Should prevent signature replay attacks", async function () {
      const { verifier, agent1, user } = await loadFixture(authorizedAgentFixture);

      const payoutData = {
        milestoneId: "milestone-123",
        recipient: user.address,
        amount: ethers.parseEther("1.0"),
        timestamp: Math.floor(Date.now() / 1000)
      };

      const domain = {
        name: "VeraProtocol",
        version: "1",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await verifier.getAddress()
      };

      const types = {
        Payout: [
          { name: "milestoneId", type: "string" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" }
        ]
      };

      const signature = await agent1.signTypedData(domain, types, payoutData);

      // First verification should succeed
      await verifier.verifyPayoutSignature(payoutData, signature);

      // Second verification should fail due to replay protection
      await expect(
        verifier.verifyPayoutSignature(payoutData, signature)
      ).to.be.revertedWith("EIP712Verifier: Signature already used");
    });
  });

  // ============ VERIFICATION DATA SIGNATURE TESTS ============

  describe("Verification Data Signature Tests", function () {
    async function authorizedAgentFixture() {
      const fixture = await loadFixture(deployEIP712VerifierFixture);
      const { verifier, owner, agent1 } = fixture;

      await verifier.connect(owner).authorizeAgent(agent1.address);

      return fixture;
    }

    it("Should verify valid verification data signature", async function () {
      const { verifier, agent1, user } = await loadFixture(authorizedAgentFixture);

      const verificationData = {
        projectId: "project-123",
        milestoneId: "milestone-456",
        freelancer: user.address,
        technicalAmount: ethers.parseEther("0.8"),
        subjectiveAmount: ethers.parseEther("0.2"),
        timestamp: Math.floor(Date.now() / 1000),
        ipfsHash: "QmTest123Hash",
        approved: true
      };

      const domain = {
        name: "VeraProtocol",
        version: "1",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await verifier.getAddress()
      };

      const types = {
        VerificationData: [
          { name: "projectId", type: "string" },
          { name: "milestoneId", type: "string" },
          { name: "freelancer", type: "address" },
          { name: "technicalAmount", type: "uint256" },
          { name: "subjectiveAmount", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "ipfsHash", type: "string" },
          { name: "approved", type: "bool" }
        ]
      };

      const signature = await agent1.signTypedData(domain, types, verificationData);

      const [signer, isValid] = await verifier.verifyVerificationSignature(verificationData, signature);

      expect(signer).to.equal(agent1.address);
      expect(isValid).to.be.true;
    });
  });

  // ============ PROPERTY-BASED TESTS ============

  describe("Property-Based Tests", function () {
    /**
     * Property 10: EIP-712 Signature Structure
     * For any verified milestone, the generated EIP-712 signature should contain milestone ID, amount, recipient, and timestamp
     * Feature: vera-protocol, Property 10: EIP-712 Signature Structure
     */
    it("Property 10: Should generate consistent EIP-712 hashes for payout data", async function () {
      const { verifier, user } = await loadFixture(deployEIP712VerifierFixture);

      const testCases = [
        {
          milestoneId: "milestone-1",
          recipient: user.address,
          amount: ethers.parseEther("1.0"),
          timestamp: 1640995200 // 2022-01-01
        },
        {
          milestoneId: "milestone-2",
          recipient: user.address,
          amount: ethers.parseEther("0.5"),
          timestamp: 1640995300
        },
        {
          milestoneId: "milestone-very-long-id-with-special-chars-123!@#",
          recipient: user.address,
          amount: BigInt("999999999999999999"),
          timestamp: 2147483647 // Max 32-bit timestamp
        }
      ];

      for (const payoutData of testCases) {
        const hash1 = await verifier.getPayoutHash(payoutData);
        const hash2 = await verifier.getPayoutHash(payoutData);

        // Same data should produce same hash
        expect(hash1).to.equal(hash2);
        expect(hash1).to.not.equal(ethers.ZeroHash);

        // Hash should be deterministic and contain all required fields
        // We verify this by changing each field and ensuring hash changes
        const modifiedData1 = { ...payoutData, milestoneId: payoutData.milestoneId + "-modified" };
        const modifiedHash1 = await verifier.getPayoutHash(modifiedData1);
        expect(modifiedHash1).to.not.equal(hash1);

        const modifiedData2 = { ...payoutData, amount: payoutData.amount + 1n };
        const modifiedHash2 = await verifier.getPayoutHash(modifiedData2);
        expect(modifiedHash2).to.not.equal(hash1);

        const modifiedData3 = { ...payoutData, timestamp: payoutData.timestamp + 1 };
        const modifiedHash3 = await verifier.getPayoutHash(modifiedData3);
        expect(modifiedHash3).to.not.equal(hash1);
      }
    });

    /**
     * Property 11: Cryptographic Signature Validity
     * For any generated EIP-712 signature, the signature should be cryptographically valid and verifiable on-chain
     * Feature: vera-protocol, Property 11: Cryptographic Signature Validity
     */
    it("Property 11: Should maintain cryptographic validity for all signature operations", async function () {
      const { verifier, owner, agent1, user } = await loadFixture(deployEIP712VerifierFixture);

      await verifier.connect(owner).authorizeAgent(agent1.address);

      // Test multiple signature scenarios
      const testScenarios = [
        {
          name: "Standard payout",
          data: {
            milestoneId: "milestone-standard",
            recipient: user.address,
            amount: ethers.parseEther("1.0"),
            timestamp: Math.floor(Date.now() / 1000)
          }
        },
        {
          name: "Micro payment",
          data: {
            milestoneId: "milestone-micro",
            recipient: user.address,
            amount: BigInt("1"), // 1 wei
            timestamp: Math.floor(Date.now() / 1000)
          }
        },
        {
          name: "Large payment",
          data: {
            milestoneId: "milestone-large",
            recipient: user.address,
            amount: ethers.parseEther("1000000"), // 1M ETH
            timestamp: Math.floor(Date.now() / 1000)
          }
        },
        {
          name: "Unicode milestone ID",
          data: {
            milestoneId: "milestone-🚀-unicode-测试",
            recipient: user.address,
            amount: ethers.parseEther("0.5"),
            timestamp: Math.floor(Date.now() / 1000)
          }
        }
      ];

      const domain = {
        name: "VeraProtocol",
        version: "1",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await verifier.getAddress()
      };

      const types = {
        Payout: [
          { name: "milestoneId", type: "string" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" }
        ]
      };

      for (const scenario of testScenarios) {
        // Generate signature
        const signature = await agent1.signTypedData(domain, types, scenario.data);

        // Verify signature is valid
        const [signer, isValid] = await verifier.verifyPayoutSignaturePure(scenario.data, signature);
        
        expect(signer).to.equal(agent1.address, `Failed for scenario: ${scenario.name}`);
        expect(isValid).to.be.true;

        // Verify signature can be used for actual verification (state-changing)
        const [signerState, isValidState] = await verifier.verifyPayoutSignature(scenario.data, signature);
        
        expect(signerState).to.equal(agent1.address);
        expect(isValidState).to.be.true;

        // Verify signature is now marked as used
        const hash = await verifier.getPayoutHash(scenario.data);
        expect(await verifier.isSignatureUsed(hash)).to.be.true;
      }
    });

    /**
     * Property Test: Signature Uniqueness
     * For any two different payout data structures, the generated signatures should be different
     */
    it("Property: Should generate unique signatures for different data", async function () {
      const { verifier, owner, agent1, user } = await loadFixture(deployEIP712VerifierFixture);

      await verifier.connect(owner).authorizeAgent(agent1.address);

      const domain = {
        name: "VeraProtocol",
        version: "1",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await verifier.getAddress()
      };

      const types = {
        Payout: [
          { name: "milestoneId", type: "string" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" }
        ]
      };

      // Generate multiple different payout data
      const baseData = {
        milestoneId: "milestone-base",
        recipient: user.address,
        amount: ethers.parseEther("1.0"),
        timestamp: Math.floor(Date.now() / 1000)
      };

      const variations = [
        { ...baseData, milestoneId: "milestone-different" },
        { ...baseData, amount: ethers.parseEther("2.0") },
        { ...baseData, timestamp: baseData.timestamp + 1 },
        { ...baseData, milestoneId: "milestone-base", amount: baseData.amount + 1n }
      ];

      const signatures = [];
      const hashes = [];

      // Generate signatures for base and all variations
      for (const data of [baseData, ...variations]) {
        const signature = await agent1.signTypedData(domain, types, data);
        const hash = await verifier.getPayoutHash(data);
        
        signatures.push(signature);
        hashes.push(hash);
      }

      // Verify all signatures are unique
      for (let i = 0; i < signatures.length; i++) {
        for (let j = i + 1; j < signatures.length; j++) {
          expect(signatures[i]).to.not.equal(signatures[j], 
            `Signatures ${i} and ${j} should be different`);
          expect(hashes[i]).to.not.equal(hashes[j], 
            `Hashes ${i} and ${j} should be different`);
        }
      }
    });
  });

  // ============ VIEW FUNCTION TESTS ============

  describe("View Functions", function () {
    it("Should return correct domain separator", async function () {
      const { verifier } = await loadFixture(deployEIP712VerifierFixture);
      
      const domainSeparator = await verifier.getDomainSeparator();
      expect(domainSeparator).to.not.equal(ethers.ZeroHash);
      
      // Domain separator should be consistent
      const domainSeparator2 = await verifier.getDomainSeparator();
      expect(domainSeparator).to.equal(domainSeparator2);
    });

    it("Should track signature usage correctly", async function () {
      const { verifier, owner, agent1, user } = await loadFixture(deployEIP712VerifierFixture);

      await verifier.connect(owner).authorizeAgent(agent1.address);

      const payoutData = {
        milestoneId: "milestone-usage-test",
        recipient: user.address,
        amount: ethers.parseEther("1.0"),
        timestamp: Math.floor(Date.now() / 1000)
      };

      const hash = await verifier.getPayoutHash(payoutData);
      
      // Initially not used
      expect(await verifier.isSignatureUsed(hash)).to.be.false;

      const domain = {
        name: "VeraProtocol",
        version: "1",
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: await verifier.getAddress()
      };

      const types = {
        Payout: [
          { name: "milestoneId", type: "string" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" }
        ]
      };

      const signature = await agent1.signTypedData(domain, types, payoutData);

      // Use the signature
      await verifier.verifyPayoutSignature(payoutData, signature);

      // Now should be marked as used
      expect(await verifier.isSignatureUsed(hash)).to.be.true;
    });
  });
});