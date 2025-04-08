import React, { useState } from 'react';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import DeScam from './artifacts/contracts/DeScam.sol/DeScam.json';

const ipfsClient = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

function App() {
    const [ipfsHash, setIpfsHash] = useState('');
    const [reportId, setReportId] = useState('');
    const [reports, setReports] = useState([]);
    const [contract, setContract] = useState(null);

    const connectContract = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Replace with your deployed contract address
        const descamContract = new ethers.Contract(contractAddress, DeScam.abi, signer);
        setContract(descamContract);
    };

    const submitReport = async () => {
        const result = await ipfsClient.add(ipfsHash);
        await contract.submitReport(result.path);
        alert('Report submitted!');
    };

    const fetchReports = async () => {
        const reportCount = await contract.reportCount();
        const fetchedReports = [];
        for (let i = 1; i <= reportCount; i++) {
            const report = await contract.getReport(i);
            fetchedReports.push(report);
        }
        setReports(fetchedReports);
    };

    return (
        <div>
            <h1>DeScam Reporting System</h1>
            <button onClick={connectContract}>Connect to Contract</button>
            <input
                type="text"
                placeholder="IPFS Hash"
                value={ipfsHash}
                onChange={(e) => setIpfsHash(e.target.value)}
            />
            <button onClick={submitReport}>Submit Report</button>
            <button onClick={fetchReports}>Fetch Reports</button>
            <ul>
                {reports.map((report) => (
                    <li key={report.id}>
                        ID: {report.id}, Reporter: {report.reporter}, Verified: {report.verified.toString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;