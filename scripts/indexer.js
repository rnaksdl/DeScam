const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const DeScamABI = require('../artifacts/contracts/DeScam.sol/DeScam.json');

// Simple indexer that listens for events and stores them in a JSON file
// In a production environment, this would use a proper database
async function startIndexer() {
  // Configure to your network
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const contract = new ethers.Contract(contractAddress, DeScamABI.abi, provider);
  
  // Path to store indexed data
  const dataPath = path.join(__dirname, '../data');
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
  }
  
  // Load existing data if available
  const reportFilePath = path.join(dataPath, 'reports.json');
  let reports = {};
  if (fs.existsSync(reportFilePath)) {
    reports = JSON.parse(fs.readFileSync(reportFilePath));
  }
  
  // Listen for report submission events
  contract.on('ReportSubmitted', async (id, reporter, ipfsHash, scamType, event) => {
    console.log(`New report #${id} submitted`);
    
    // Store basic report data
    reports[id.toString()] = {
      id: id.toString(),
      reporter,
      ipfsHash,
      scamType: scamType.toString(),
      blockNumber: event.blockNumber,
      timestamp: (new Date()).toISOString()
    };
    
    // Save to file (would be database in production)
    fs.writeFileSync(reportFilePath, JSON.stringify(reports, null, 2));
  });
  
  console.log('Indexer started, listening for events...');
}

startIndexer().catch(console.error);
