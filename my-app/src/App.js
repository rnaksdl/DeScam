import React, { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { create } from 'ipfs-http-client';
import DeScam from './abis/DeScam.json';

const ipfsClient = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

function App() {
  const [ipfsHash, setIpfsHash]     = useState('');
  const [scamType, setScamType]     = useState(0);
  const [reports, setReports]       = useState([]);
  const [contract, setContract]     = useState(null);

  const connectContract = async () => {
    const provider = new BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    setContract(new Contract(CONTRACT_ADDRESS, DeScam.abi, signer));
  };

  const submitReport = async () => {
    try {
      const { path } = await ipfsClient.add(ipfsHash);
      const tx = await contract.submitReport(path, scamType);
      await tx.wait();
      alert('✅ Report submitted!');
    } catch (e) {
      console.error(e);
      alert('🚨 ' + (e.error?.message || e.message));
    }
  };

  const fetchReports = async () => {
    try {
      const count = await contract.reportCount();
      const list  = [];
      for (let i = 1; i <= count; i++) {
        const rpt = await contract.getReport(i);
        list.push({
          id:       rpt.id.toString(),
          reporter: rpt.reporter,
          verified: rpt.verified.toString(),
          type:     rpt.scamType.toString(),
          hash:     rpt.ipfsHash
        });
      }
      setReports(list);
    } catch (e) {
      console.error(e);
      alert('🚨 ' + (e.error?.message || e.message));
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>DeScam Reporting System</h1>
      <button onClick={connectContract}>Connect to Contract</button>
      <div style={{ marginTop: '1rem' }}>
        <input
          placeholder="IPFS Hash"
          value={ipfsHash}
          onChange={e => setIpfsHash(e.target.value)}
        />
        <select
          value={scamType}
          onChange={e => setScamType(parseInt(e.target.value))}
        >
          <option value={0}>Phishing</option>
          <option value={1}>Ponzi</option>
          <option value={2}>FakeICO</option>
          <option value={3}>Impersonation</option>
          <option value={4}>Rugpull</option>
          <option value={5}>Other</option>
        </select>
        <button onClick={submitReport}>Submit Report</button>
        <button onClick={fetchReports}>Fetch Reports</button>
      </div>
      <ul style={{ marginTop: '1rem' }}>
        {reports.map(r => (
          <li key={r.id}>
            <strong>ID:</strong> {r.id} | <strong>Reporter:</strong> {r.reporter} | 
            <strong> Verified:</strong> {r.verified} | <strong>Type:</strong> {r.type} | 
            <strong>IPFS:</strong> {r.hash}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
