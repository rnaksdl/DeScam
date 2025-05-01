import { create } from 'ipfs-http-client';

// Simple IPFS service for storing and retrieving report data
export const ipfsService = {
  client: create({
    url: 'https://ipfs.infura.io:5001' // Or your preferred IPFS provider
  }),

  // Upload JSON data to IPFS (report content)
  async uploadReport(reportData) {
    const { path } = await this.client.add(JSON.stringify(reportData));
    return path; // Returns IPFS CID
  },

  // Upload file to IPFS (evidence files)
  async uploadFile(file) {
    const { path } = await this.client.add(file);
    return path;
  },

  // Get report data from IPFS
  async getReport(cid) {
    const stream = this.client.cat(cid);
    const data = [];
    
    for await (const chunk of stream) {
      data.push(chunk);
    }
    
    return JSON.parse(Buffer.concat(data).toString());
  }
};
