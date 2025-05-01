import React, { useState } from 'react';
import { ethers } from 'ethers';

/**
 * ReportForm component allows users to submit a new scam report
 * @param {Object} props
 * @param {ethers.Contract} props.contract - Instance of the DeScam contract
 */
export default function ReportForm({ contract }) {
  const [ipfsHash, setIpfsHash] = useState('');
  const [scamType, setScamType] = useState('Phishing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const scamTypes = [
    'Phishing',
    'Ponzi',
    'FakeICO',
    'Impersonation',
    'Rugpull',
    'Other',
  ];

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setTxHash(null);

    if (!ipfsHash) {
      setError('IPFS hash is required');
      return;
    }

    try {
      setLoading(true);
      // Convert IPFS string to bytes32 hash; adjust as needed for CID format
      const contentHash = ethers.utils.formatBytes32String(ipfsHash);
      const typeIndex = scamTypes.indexOf(scamType);

      const tx = await contract.submitReport(contentHash, typeIndex, {
        gasLimit: 200000,
      });
      const receipt = await tx.wait();
      setTxHash(receipt.transactionHash);
      setIpfsHash('');
      setScamType('Phishing');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Submit a Scam Report</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {txHash && (
        <p className="text-green-600 mb-2">
          Report submitted! TX Hash: <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">{txHash}</a>
        </p>
      )}

      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="ipfsHash">
          IPFS Content Hash
        </label>
        <input
          id="ipfsHash"
          type="text"
          value={ipfsHash}
          onChange={(e) => setIpfsHash(e.target.value)}
          placeholder="Qm..."
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor="scamType">
          Scam Type
        </label>
        <select
          id="scamType"
          value={scamType}
          onChange={(e) => setScamType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {scamTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 font-bold rounded ${loading ? 'bg-gray-400' : 'bg-blue-600 text-white'}`}
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
}
