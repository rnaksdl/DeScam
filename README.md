# DeScam

## Prerequisites
- Node.js ≥ v14
- npm
- dotenv for `.env` support

## Smart Contract Setup
Install dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```
Initialize Hardhat:
```bash
npx hardhat
# Create a JavaScript project
# Add .gitignore
# Skip crash reports
# Install sample dependencies
```
Compile contracts:
```bash
npx hardhat compile
```
Run a local node:
```bash
npx hardhat node
```
Deploy to localhost:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Add contract address to `.env`:
```env
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

## Frontend Setup
From `my-app` directory, install:
```bash
npm install react react-dom react-scripts web-vitals
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install ipfs-http-client@56.0.2
```
Start React server:
```bash
npm start
```

## Full Build from Scratch
Initialize project:
```bash
npm init -y
npm install --save-dev hardhat
npx hardhat
```
Install contracts and IPFS client:
```bash
npm install @openzeppelin/contracts
npm install ipfs-http-client
```
Compile and run:
```bash
npx hardhat compile
npx hardhat node
```
Deploy contracts:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
