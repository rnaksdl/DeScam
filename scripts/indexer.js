const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const DeScamABI = require('../artifacts/contracts/DeScam.sol/DeScam.json');

// Simple indexer that listens for events and stores them in a JSON file
async function startIndexer() {
  console.log('Starting DeScam indexer...');
  
  // Get contract address from environment variable
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0x5fbdb2315678afecb367f032d93f642f64180aa3';
  
  console.log(`Using contract: ${contractAddress}`);
  
  // Configure to your network - Using ethers v6 syntax
  try {
    // Create the provider - ethers v6 syntax is different!
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Test connection
    const blockNumber = await provider.getBlockNumber();
    console.log(`Connected to Ethereum node at block ${blockNumber}`);
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, DeScamABI.abi, provider);
    
    // Path to store indexed data
    const dataPath = path.join(__dirname, '../data');
    if (!fs.existsSync(dataPath)) {
      console.log(`Creating data directory at ${dataPath}`);
      fs.mkdirSync(dataPath);
    }
    
    // Load existing data if available
    const reportFilePath = path.join(dataPath, 'reports.json');
    let reports = {};
    if (fs.existsSync(reportFilePath)) {
      reports = JSON.parse(fs.readFileSync(reportFilePath));
      console.log(`Loaded ${Object.keys(reports).length} existing reports`);
    }
    
    // Listen for report submission events
    console.log('Listening for ReportSubmitted events...');
    
    contract.on('ReportSubmitted', async (id, reporter, ipfsHash, scamType, event) => {
      console.log(`New report #${id} submitted by ${reporter}`);
      console.log(`IPFS Hash: ${ipfsHash}`);
      console.log(`Scam Type: ${scamType}`);
      
      // Store basic report data
      reports[id.toString()] = {
        id: id.toString(),
        reporter,
        ipfsHash,
        scamType: scamType.toString(),
        blockNumber: event.blockNumber,
        timestamp: (new Date()).toISOString()
      };
      
      // Save to file
      fs.writeFileSync(reportFilePath, JSON.stringify(reports, null, 2));
      console.log(`Updated reports.json with report #${id}`);
    });
    
    console.log('Indexer started successfully. Waiting for events...');
    console.log('Press Ctrl+C to stop the indexer');
  } catch (error) {
    console.error('Error connecting to Ethereum node:');
    console.error(error.message);
    process.exit(1);
  }
}

startIndexer().catch(error => {
  console.error('Fatal error in indexer:', error);
  process.exit(1);
});
