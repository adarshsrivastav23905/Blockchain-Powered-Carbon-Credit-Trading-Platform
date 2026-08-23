# 15️⃣ Hardhat Setup & Usage Guide

## Installation Commands

```bash
# 1. Initialize a new npm project
npm init -y

# 2. Install Hardhat and the toolbox
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 3. Compile the smart contract
npx hardhat compile

# 4. Run automated tests
npx hardhat test

# 5. Start a local blockchain node (for frontend development)
npx hardhat node

# 6. Deploy to local blockchain (run in a separate terminal)
npx hardhat run scripts/deploy.js --network localhost
```

---

## What Each Command Does

### `npx hardhat compile`
- Reads all `.sol` files from the `contracts/` directory
- Compiles them using the Solidity compiler version specified in `hardhat.config.js`
- Generates ABI (Application Binary Interface) and bytecode in `artifacts/`
- The ABI is needed by the frontend to interact with the contract

**Expected Output**:
```
Compiled 1 Solidity file successfully (evm target: paris).
```

---

### `npx hardhat test`
- Runs all test files in the `test/` directory
- Uses Mocha test framework with Chai assertions
- Each test deploys a fresh contract instance (via `beforeEach`)
- Reports pass/fail for each test case

**Expected Output**:
```
  CarbonCreditTrading
    Issuer Registration
      ✓ 1. Admin should register an issuer successfully
      ✓ 2. Unauthorized user should NOT be able to register an issuer
      ...
    Carbon Credit Issuance
      ✓ 3. Authorized issuer should create a carbon credit
      ...

  18 passing (2s)
```

---

### `npx hardhat node`
- Starts a local Ethereum blockchain on `http://127.0.0.1:8545`
- Creates 20 test accounts, each with **10,000 ETH**
- Displays account addresses and private keys
- Runs until you stop it (Ctrl+C)

**Important**: Keep this terminal running while using the frontend or deploying contracts.

**Test Accounts**:
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (10000 ETH)
...
```

---

### `npx hardhat run scripts/deploy.js --network localhost`
- Executes the deployment script
- Deploys the `CarbonCreditTrading` contract to the local blockchain
- Outputs the deployed contract address
- The deployer (Account #0) becomes the Admin

**Expected Output**:
```
============================================================
  Deploying CarbonCreditTrading Contract
============================================================

Deployer (Admin): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployer Balance: 10000.0 ETH

Deploying contract...

✅ CarbonCreditTrading deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   Admin address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   Network: localhost

============================================================
  Deployment Complete!
============================================================
```

---

## Understanding the Config

```javascript
// hardhat.config.js
module.exports = {
  solidity: {
    version: "0.8.20",     // Compiler version
    settings: {
      optimizer: {
        enabled: true,     // Reduces gas costs
        runs: 200,         // Optimization target
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,      // Default local chain ID
    },
    localhost: {
      url: "http://127.0.0.1:8545",  // Local node URL
      chainId: 31337,
    },
  },
};
```

---

## No Real Cryptocurrency Required

| Feature | Real ETH Needed? |
|---------|:----------------:|
| Compile contracts | ❌ No |
| Run tests | ❌ No (Hardhat provides test ETH) |
| Local deployment | ❌ No (Hardhat node provides 10,000 ETH per account) |
| Frontend interaction | ❌ No (connects to local node) |
| Testnet deployment (optional) | ❌ No (free faucet ETH) |
