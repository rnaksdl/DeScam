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
    await descam.deployed();
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

    it("Should revert when submitting an empty IPFS hash", async function () {
      await expect(
        descam.connect(addr1).submitReport("", 0)
      ).to.be.revertedWith("IPFS hash required");
    });

    it("Should revert on out-of-bounds scam type", async function () {
      await expect(
        descam.connect(addr1).submitReport("QmTest", 99)
      ).to.be.revertedWith("Invalid scam type");
    });
  });

  describe("Report Verification", function () {
    beforeEach(async function () {
      // Submit a report before each verification test
      const ipfsHash = "QmTest1234567890";
      await descam.connect(addr1).submitReport(ipfsHash, 0);
    });

    it("Should allow users to verify reports with stake", async function () {
      const verificationAmount = ethers.utils.parseEther("0.01");
      await expect(descam.connect(addr2).verifyReport(1, { value: verificationAmount }))
        .to.emit(descam, "ReportVerified")
        .withArgs(1, addr2.address, verificationAmount);

      const report = await descam.getReport(1);
      expect(report.verificationCount).to.equal(1);
    });

    it("Should revert when verifying non-existent report", async function () {
      const stake = ethers.utils.parseEther("0.01");
      await expect(
        descam.connect(addr2).verifyReport(42, { value: stake })
      ).to.be.revertedWith("Report does not exist");
    });

    it("Should revert when verifying with zero ETH", async function () {
      await expect(
        descam.connect(addr2).verifyReport(1, { value: 0 })
      ).to.be.revertedWith("Minimum stake required");
    });

    it("Should allow multiple verifications and increment count", async function () {
      const stake = ethers.utils.parseEther("0.01");
      await descam.connect(addr2).verifyReport(1, { value: stake });
      await descam.connect(owner).verifyReport(1, { value: stake });

      const report = await descam.getReport(1);
      expect(report.verificationCount).to.equal(2);
    });
  });

  describe("Multiple Reports & Retrieval", function () {
    it("Should isolate data between multiple reports", async function () {
      await descam.connect(addr1).submitReport("Qm1", 0);
      await descam.connect(addr2).submitReport("Qm2", 1);

      const r1 = await descam.getReport(1);
      const r2 = await descam.getReport(2);

      expect(r1.ipfsHash).to.equal("Qm1");
      expect(r2.ipfsHash).to.equal("Qm2");
    });

    it("Should return correct report count", async function () {
      expect(await descam.getReportCount()).to.equal(0);
      await descam.connect(addr1).submitReport("Qm", 0);
      expect(await descam.getReportCount()).to.equal(1);
    });

    it("Should revert when retrieving a non-existent report", async function () {
      await expect(
        descam.getReport(999)
      ).to.be.revertedWith("Report does not exist");
    });
  });
});
