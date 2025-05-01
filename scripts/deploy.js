const hre = require("hardhat");

async function main() {
  console.log("Deploying DeScam contract...");

  const DeScam = await hre.ethers.getContractFactory("DeScam");
  const descam = await DeScam.deploy();

  await descam.waitForDeployment();
  
  const address = await descam.getAddress();
  console.log(`DeScam deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
