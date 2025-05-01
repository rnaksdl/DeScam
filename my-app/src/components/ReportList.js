import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

/**
 * ReportList component fetches and displays all scam reports
 * @param {Object} props
 * @param {ethers.Contract} props.contract - Instance of the DeScam contract
 */
export default function ReportList({ contract }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reports from contract
  async function loadReports() {
    setError(null);
    setLoading(true);
    try {
      const count = await contract.reportCount();
      const reportPromises = [];
      for (let i = 1; i <= count.toNumber(); i++) {
        reportPromises.push(contract.getReport(i));
      }
      const rawReports = await Promise.all(reportPromises);

      const formatted = rawReports.map(r => ({
        id: r.id.toNumber(),
        reporter: r.reporter,
        contentHash: ethers.utils.parseBytes32String(r.contentHash),
        timestamp: new Date(r.timestamp.toNumber() * 1000).toLocaleString(),
        verified: r.verified,
        verificationCount: r.verificationCount,
        disputed: r.disputed,
        disputeCount: r.disputeCount,
      }));
      setReports(formatted);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (contract) {
      loadReports();

      // Optional: subscribe to ReportSubmitted events to refresh list
      const filter = contract.filters.ReportSubmitted();
      contract.on(filter, () => loadReports());
      return () => {
        contract.removeAllListeners(filter);
      };
    }
  }, [contract]);

  if (loading) return <p>Loading reports...</p>;
  if (error)   return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Scam Reports</h2>
      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Reporter</th>
              <th className="border p-2">Content Hash</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Verified</th>
              <th className="border p-2">Verifications</th>
              <th className="border p-2">Disputed</th>
              <th className="border p-2">Disputes</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border p-2 text-center">{r.id}</td>
                <td className="border p-2 text-sm truncate" title={r.reporter}>{r.reporter}</td>
                <td className="border p-2 text-sm truncate" title={r.contentHash}>{r.contentHash}</td>
                <td className="border p-2 text-sm">{r.timestamp}</td>
                <td className={`border p-2 text-center ${r.verified ? 'text-green-600' : 'text-gray-600'}`}>{r.verified ? 'Yes' : 'No'}</td>
                <td className="border p-2 text-center">{r.verificationCount}</td>
                <td className={`border p-2 text-center ${r.disputed ? 'text-red-600' : 'text-gray-600'}`}>{r.disputed ? 'Yes' : 'No'}</td>
                <td className="border p-2 text-center">{r.disputeCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button
        onClick={loadReports}
        className="mt-4 p-2 bg-blue-600 text-white rounded"
      >
        Refresh
      </button>
    </div>
  );
}
