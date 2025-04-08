const hre = require("hardhat");

async function main() {
    // Get the contract factory
    const DeScam = await hre.ethers.getContractFactory("DeScam");

    // Deploy the contract
    console.log("Deploying DeScam contract...");
    const descam = await DeScam.deploy();

    // Wait for deployment to complete
    await descam.waitForDeployment();

    // Get the deployed contract address
    const descamAddress = await descam.getAddress();
    console.log("DeScam deployed to:", descamAddress);
}

// Execute the main function and handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });