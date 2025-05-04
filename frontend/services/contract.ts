// src/services/contract.ts
import { ethers } from "ethers";
import DeScamABI from "@/src/abis/DeScam.json";

// Type for a scam report (adjust fields as needed)
export type ScamReport = {
  id: number;
  reporter: string;
  ipfsHash: string;
  scamType: number;
  timestamp: number;
  verified: boolean;
};

class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  private readonly contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

  async connect() {
    if (typeof window === "undefined") return false;
    if (!window.ethereum) return false;

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(
        this.contractAddress,
        DeScamABI.abi,
        this.signer
      );
      return true;
    } catch (error) {
      console.error("Failed to connect to contract:", error);
      return false;
    }
  }

  async submitReport(ipfsHash: string, scamType: number) {
    if (!this.contract) await this.connect();
    if (!this.contract) throw new Error("Contract not connected");
    const tx = await this.contract.submitReport(ipfsHash, scamType);
    return await tx.wait();
  }

  async getReportCount(): Promise<number> {
    if (!this.contract) await this.connect();
    if (!this.contract) throw new Error("Contract not connected");
    return Number(await this.contract.reportCount());
  }

  async getReport(id: number): Promise<ScamReport> {
    if (!this.contract) await this.connect();
    if (!this.contract) throw new Error("Contract not connected");
    const report = await this.contract.getReport(id);
    return {
      id: Number(report.id),
      reporter: report.reporter,
      ipfsHash: report.ipfsHash,
      scamType: Number(report.scamType),
      timestamp: Number(report.timestamp),
      verified: report.verified,
    };
  }

  async getReports(limit = 10): Promise<ScamReport[]> {
    const reportCount = await this.getReportCount();
    const count = Math.min(reportCount, limit);
    const reports: ScamReport[] = [];
    for (let i = reportCount; i > reportCount - count && i > 0; i--) {
      reports.push(await this.getReport(i));
    }
    return reports;
  }
}

export const contractService = new ContractService();
