import { ethers } from 'ethers';
import DeScamABI from '../../../artifacts/contracts/DeScam.sol/DeScam.json';

// Contract address will be set after deployment
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export const contractUtils = {
  // Get contract instance
  getContract() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      return new ethers.Contract(
        CONTRACT_ADDRESS,
        DeScamABI.abi,
        signer
      );
    }
    return null;
  },

  // Submit report to blockchain
  async submitReport(ipfsHash, scamType) {
    const contract = this.getContract();
    if (!contract) return null;
    
    const tx = await contract.submitReport(ipfsHash, scamType);
    return await tx.wait();
  },

  // Get report from blockchain
  async getReport(reportId) {
    const contract = this.getContract();
    if (!contract) return null;
    
    return await contract.getReport(reportId);
  }
};
