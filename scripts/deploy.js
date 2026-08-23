/**
 * @title Deployment Script — CarbonCreditTrading
 * @description Deploys the CarbonCreditTrading contract to the local Hardhat network.
 *              After deployment, logs the contract address and admin address.
 *
 * Usage:
 *   npx hardhat node                                         # Start local blockchain
 *   npx hardhat run scripts/deploy.js --network localhost     # Deploy contract
 */

const hre = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("  Deploying CarbonCreditTrading Contract");
  console.log("=".repeat(60));

  // Get the deployer account (first Hardhat account = admin)
  const [deployer] = await hre.ethers.getSigners();
  console.log(`\nDeployer (Admin): ${deployer.address}`);

  // Get deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${hre.ethers.formatEther(balance)} ETH`);

  // Deploy the contract
  console.log("\nDeploying contract...");
  const CarbonCreditTrading = await hre.ethers.getContractFactory("CarbonCreditTrading");
  const contract = await CarbonCreditTrading.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log(`\n✅ CarbonCreditTrading deployed to: ${contractAddress}`);
  console.log(`   Admin address: ${deployer.address}`);
  console.log(`   Network: ${hre.network.name}`);
  console.log("\n" + "=".repeat(60));
  console.log("  Deployment Complete!");
  console.log("=".repeat(60));

  // Return contract address for use in other scripts
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
