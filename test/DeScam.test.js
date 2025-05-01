const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeScam Contract", function () {
  let DeScam;
  let descam;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Deploy the contract before each test
    DeScam = await ethers.getContractFactory("DeScam");
    [owner, addr1, addr2] = await ethers.getSigners();
    descam = await DeScam.deploy();
  });

  describe("Report Submission", function () {
    it("Should allow users to submit reports", async function () {
      const ipfsHash = "QmTest1234567890";
      const scamType = 0; // Phishing
      
      await expect(descam.connect(addr1).submitReport(ipfsHash, scamType))
        .to.emit(descam, "ReportSubmitted")
        .withArgs(1, addr1.address, ipfsHash, scamType);
        
      const report = await descam.getReport(1);
      expect(report.reporter).to.equal(addr1.address);
      expect(report.ipfsHash).to.equal(ipfsHash);
    });
  });

  describe("Report Verification", function () {
    it("Should allow users to verify reports with stake", async function () {
      // Submit a report first
      const ipfsHash = "QmTest1234567890";
      await descam.connect(addr1).submitReport(ipfsHash, 0);
      
      // Verify the report
      const verificationAmount = ethers.utils.parseEther("0.01");
      await expect(descam.connect(addr2).verifyReport(1, { value: verificationAmount }))
        .to.emit(descam, "ReportVerified");
        
      const report = await descam.getReport(1);
      expect(report.verificationCount).to.equal(1);
    });
  });
});
