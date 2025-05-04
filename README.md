# DeScam

A decentralized platform for reporting and scanning crypto scams, powered by Ethereum smart contracts.


---

## 🚀 Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/rnaksdl/DeScam.git
cd DeScam
```

---

### 2. **Install Dependencies**

**Frontend:**
```bash
cd frontend
npm install
```

**Smart Contracts:**
```bash
cd ../contracts
npm install
```

---

### 3. **Set Up Environment Variables**

Create a `.env.local` file in the `frontend` directory:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xPutYourContractAddressHereInNextStep
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

---

### 4. **Compile & Deploy the Smart Contract (Hardhat)**

```bash
cd ../contracts
npx hardhat compile
npx hardhat node
```

In a **new terminal**, deploy your contract to the local node:
```bash
npx hardhat run ../scripts/deploy.js --network localhost
```

Copy the deployed contract address and update your `.env.local` file.


---


### 5. **Start the Indexer**
```bash
node ../scripts/indexer
```

---



### 6. **Start the Frontend**
In a **new terminal**, start the frontend
Make sure you're in frontend directory

```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

### 7. **Connect MetaMask**

- Add a new network in MetaMask:
    - **Network Name:** Localhost 8545
    - **RPC URL:** http://127.0.0.1:8545
    - **Chain ID:** 31337
- Import one of the private keys from your Hardhat node output to get test ETH.

---

### 8. **Using the App**

- **Connect your wallet** using the Connect Wallet button.
- **Report scams** using the Report page.
- **Scan addresses/URLs** using the Scan page.
- **View all reports** on the Dashboard.

---

### 9. **Deploying to a Testnet (Optional)**

- Configure Hardhat for Sepolia or another testnet.
- Deploy your contract (`npx hardhat run scripts/deploy.js --network sepolia`)
- Update `.env.local` with the new contract address and RPC URL.
- Add the testnet to MetaMask and fund with test ETH.

---

## 🛠 Tech Stack

- **Smart Contracts:** Solidity, Hardhat, OpenZeppelin
- **Frontend:** Next.js, React, TypeScript, Ethers.js, Tailwind CSS

---

## 🙏 Contributing

Pull requests welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 🛡️ Disclaimer

This project is for educational/demo purposes.  
**Do not use on mainnet with real funds unless you have fully audited the code.**

---

## 📄 License

This project does **not** currently specify an open source license.  
If you intend to share, modify, or use this code, please contact the repository owner for permissions or licensing terms.

---

**Happy scanning and reporting!**
