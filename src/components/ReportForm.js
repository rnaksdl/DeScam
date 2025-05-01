import React, { useState } from 'react';

/**
 * ReportForm handles IPFS hash input and scam-type selection,
 * then calls onSubmit(ipfsHash, scamType) when the form is submitted.
 */
export default function ReportForm({ onSubmit }) {
  const [ipfsHash, setIpfsHash] = useState('');
  const [scamType, setScamType] = useState(0);

  const handleSubmit = e => {
    e.preventDefault();
    if (!ipfsHash) {
      alert('Please enter an IPFS hash.');
      return;
    }
    onSubmit(ipfsHash, scamType);
    setIpfsHash('');
    setScamType(0);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="IPFS Hash"
        value={ipfsHash}
        onChange={e => setIpfsHash(e.target.value)}
      />
      <select
        value={scamType}
        onChange={e => setScamType(parseInt(e.target.value, 10))}
      >
        <option value={0}>Phishing</option>
        <option value={1}>Ponzi</option>
        <option value={2}>FakeICO</option>
        <option value={3}>Impersonation</option>
        <option value={4}>Rugpull</option>
        <option value={5}>Other</option>
      </select>
      <button type="submit">Submit Report</button>
    </form>
  );
}
