const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Vera Protocol contracts to Sepolia...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // For demo purposes, use deployer as the initial authorized agent
  // In production, this would be the AI agent's address
  const authorizedAgent = deployer.address;
  console.log("Authorized AI Agent:", authorizedAgent);

  // Deploy VeraEscrow contract
  const VeraEscrow = await ethers.getContractFactory("VeraEscrow");
  const veraEscrow = await VeraEscrow.deploy(authorizedAgent);

  await veraEscrow.waitForDeployment();
  const contractAddress = await veraEscrow.getAddress();

  console.log("✅ VeraEscrow deployed to:", contractAddress);
  console.log("📋 Contract Details:");
  console.log("  - Technical Release: 80% (IMMUTABLE)");
  console.log("  - Subjective Buffer: 20% (IMMUTABLE)");
  console.log("  - Silent Consent: 72 hours (IMMUTABLE)");
  console.log("  - Dispute Window: 24 hours");
  console.log("  - EIP-712 Domain: VeraProtocol v1.0.0");
  console.log("  - Chain ID: 11155111 (Sepolia)");

  // Get domain separator for verification
  const domainSeparator = await veraEscrow.getDomainSeparator();
  console.log("🔐 Domain Separator:", domainSeparator);

  console.log("\n🔗 Verification Command:");
  console.log(`npx hardhat verify --network sepolia ${contractAddress} "${authorizedAgent}"`);

  console.log("\n📝 Save these details for frontend integration:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`AUTHORIZED_AGENT=${authorizedAgent}`);
  console.log(`DOMAIN_SEPARATOR=${domainSeparator}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });