# 🌍 Blockchain-Powered Carbon Credit Trading Platform

> A blockchain-based carbon credit trading prototype using Solidity for simulated credit issuance, marketplace trading, transparent ownership transfer, and irreversible credit retirement.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Framework-FFF100?logo=hardhat)](https://hardhat.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-27%20Passing-brightgreen)]()

> ⚠️ **Disclaimer**: All carbon credits in this project are **simulated** for educational purposes. This project does **not** create legally recognized or officially verified carbon credits. Real systems require trusted Measurement, Reporting, and Verification (MRV) processes.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Industry Relevance](#industry-relevance)
- [Carbon Credit Concept](#carbon-credit-concept)
- [Blockchain Concepts Used](#blockchain-concepts-used)
- [Actors & Roles](#actors--roles)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Carbon Credit Data Model](#carbon-credit-data-model)
- [Issuance Workflow](#issuance-workflow)
- [Trading Workflow](#trading-workflow)
- [Retirement Workflow](#retirement-workflow)
- [Smart Contract Functions](#smart-contract-functions)
- [Events & Audit Trail](#events--audit-trail)
- [Security Features](#security-features)
- [Folder Structure](#folder-structure)
- [Installation & Setup](#installation--setup)
- [Remix Simulation](#remix-simulation)
- [Hardhat Testing](#hardhat-testing)
- [Optional DApp](#optional-dapp)
- [Sample Transactions](#sample-transactions)
- [Results](#results)
- [Limitations](#limitations)
- [Market Integrity](#market-integrity)
- [Future Improvements](#future-improvements)
- [Learning Outcomes](#learning-outcomes)
- [Author](#author)

---

## Overview

This project implements a complete **carbon credit lifecycle** on the Ethereum blockchain:

```
Simulated Carbon Project → Credit Issuance → Tokenized Credit → Owner Wallet
→ Marketplace Listing → Buyer Purchase → Ownership Transfer → Credit Retirement
→ Immutable Retirement Record
```

The platform demonstrates how blockchain technology can bring **transparency**, **traceability**, and **integrity** to carbon credit markets.

---

## Problem Statement

Traditional carbon credit markets suffer from:

| Problem | Impact |
|---------|--------|
| **Double Counting** | Same credit offsets multiple entities' emissions |
| **Lack of Transparency** | Opaque ownership and transfer history |
| **Fraud** | Fake credits from non-existent projects |
| **Slow Settlement** | Manual verification and bank transfers |
| **Greenwashing** | Unverifiable retirement claims |

---

## Objectives

1. ✅ Implement role-based access control (Admin, Issuer, Owner)
2. ✅ Create carbon credits with project metadata
3. ✅ Build an on-chain marketplace for trading
4. ✅ Enable transparent ownership transfer
5. ✅ Implement irreversible credit retirement
6. ✅ Create a complete event-based audit trail
7. ✅ Build automated tests (27 passing)
8. ✅ Develop a React frontend (optional)

---

## Industry Relevance

This platform architecture is applicable to:
- 🌱 **Sustainability Platforms** — Verified carbon offset tracking
- 📊 **ESG Reporting** — Auditable proof of carbon offsets
- 🏪 **Carbon Marketplaces** — Transparent trading infrastructure
- ⚡ **Renewable Energy** — Monetize emission reductions
- 🏭 **Manufacturing** — Track and offset industrial emissions
- ✈️ **Aviation** — Per-flight carbon offsetting (CORSIA)
- 🚚 **Logistics** — Per-shipment offset tracking
- 🎯 **Corporate Net-Zero** — Verifiable progress tracking

---

## Carbon Credit Concept

A **carbon credit** = 1 tonne of CO₂ equivalent reduced/removed from the atmosphere.

- **Issuance**: Created by authorized entities after emission reduction is verified
- **Trading**: Bought and sold in marketplaces
- **Retirement**: Permanently removed from circulation to claim the offset
- **Immutability**: Once retired, cannot be re-traded (prevents double counting)

---

## Blockchain Concepts Used

| Concept | Application in Project |
|---------|----------------------|
| Smart Contract | Manages entire credit lifecycle |
| Tokenization | Credits as on-chain data structures |
| Immutability | Retired credits can't be changed |
| Access Control | Role-based modifiers |
| Events | Complete audit trail |
| Mappings | Efficient credit/owner lookups |
| Structs | Carbon credit data model |
| Enums | Status state machine |
| Payable Functions | Marketplace ETH payments |

---

## Actors & Roles

| Actor | Can Do | Cannot Do |
|-------|--------|-----------|
| **Admin** | Register issuers | Modify credits, undo retirements |
| **Issuer** | Create credits with metadata | Buy/sell credits |
| **Owner** | List, transfer, retire credits | Issue new credits |
| **Buyer** | Purchase listed credits | Retire others' credits |

---

## Technology Stack

| Tool | Purpose |
|------|---------|
| **Solidity 0.8.20** | Smart contract language |
| **Hardhat** | Development, testing, deployment framework |
| **Ethers.js** | JavaScript blockchain interaction library |
| **React + Vite** | Frontend user interface |
| **MetaMask** | Browser wallet for DApp interaction |
| **Chai** | Assertion library for testing |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (React DApp)               │
│  Issuer Dashboard │ Marketplace │ Portfolio      │
└────────────────────────┬────────────────────────┘
                         │ Ethers.js + MetaMask
┌────────────────────────┼────────────────────────┐
│         Smart Contract │(Solidity)               │
│  ┌──────────┬──────────┴──┬──────────┬────────┐ │
│  │ Issuer   │ Credit      │ Market   │Retire  │ │
│  │ Registry │ Registry    │ place    │ment    │ │
│  └──────────┴─────────────┴──────────┴────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Carbon Credit Data Model

```solidity
struct CarbonCredit {
    uint256 creditId;        // Unique ID
    string projectName;      // "Solar Energy Farm"
    string projectType;      // "Renewable Energy"
    string country;          // "India"
    uint256 vintageYear;     // 2026
    uint256 tonnesCO2e;      // 10
    address issuer;          // Authorized issuer address
    address owner;           // Current owner address
    string metadataHash;     // Off-chain metadata reference
    CreditStatus status;     // ACTIVE | LISTED | RETIRED
    uint256 createdAt;       // Issuance timestamp
    uint256 retiredAt;       // Retirement timestamp
    string retirementReason; // "Offset Q1 emissions"
}
```

---

## Issuance Workflow

1. Admin registers an issuer via `registerIssuer()`
2. Issuer calls `issueCarbonCredit()` with project metadata
3. Credit is created with status `ACTIVE`
4. Initial owner receives the credit
5. `CreditIssued` event is emitted

---

## Trading Workflow

1. Owner lists credit via `listCreditForSale(creditId, price)`
2. Credit status changes to `LISTED`
3. Buyer calls `buyCredit(listingId)` with exact ETH amount
4. Smart contract atomically: transfers ownership + sends payment to seller
5. Credit status returns to `ACTIVE` (new owner)
6. `CreditPurchased` event is emitted

---

## Retirement Workflow

1. Owner calls `retireCredit(creditId, reason)`
2. Credit status changes to `RETIRED` (irreversible)
3. Retirement timestamp and reason are recorded
4. Credit can **never** be traded or transferred again
5. `CreditRetired` event is emitted

---

## Smart Contract Functions

| Function | Access | Description |
|----------|--------|-------------|
| `registerIssuer(address)` | Admin | Authorize a new issuer |
| `issueCarbonCredit(...)` | Issuer | Create a new carbon credit |
| `getCreditDetails(id)` | Anyone | View credit information |
| `getOwnerCredits(address)` | Anyone | List credits owned by address |
| `listCreditForSale(id, price)` | Owner | List credit on marketplace |
| `cancelListing(listingId)` | Seller | Cancel marketplace listing |
| `buyCredit(listingId)` | Buyer | Purchase a listed credit |
| `transferCredit(id, to)` | Owner | Direct credit transfer |
| `retireCredit(id, reason)` | Owner | Permanently retire credit |

---

## Events & Audit Trail

| Event | When Emitted |
|-------|-------------|
| `IssuerRegistered` | New issuer authorized |
| `CreditIssued` | New credit created |
| `CreditListed` | Credit listed for sale |
| `ListingCancelled` | Listing cancelled |
| `CreditPurchased` | Credit bought from marketplace |
| `CreditTransferred` | Credit transferred directly |
| `CreditRetired` | Credit permanently retired |

---

## Security Features

- ✅ **Role-Based Access Control** — `onlyAdmin`, `onlyIssuer`, `onlyCreditOwner` modifiers
- ✅ **Reentrancy Guard** — Boolean lock on `buyCredit()`
- ✅ **Checks-Effects-Interactions** — State updated before ETH transfer
- ✅ **Input Validation** — Zero address, zero price, invalid ID checks
- ✅ **State Machine** — Enum prevents invalid status transitions
- ✅ **Self-Purchase Prevention** — Seller cannot buy own listing

---

## Folder Structure

```
Blockchain-Powered-Carbon-Credit-Trading-Platform/
├── contracts/
│   └── CarbonCreditTrading.sol      # Main smart contract
├── scripts/
│   └── deploy.js                     # Deployment script
├── test/
│   └── CarbonCreditTrading.test.js  # 27 automated tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main React component
│   │   ├── App.css                  # Styling
│   │   └── main.jsx                 # Entry point
│   └── package.json
├── sample_metadata/
│   ├── project_001.json             # Solar farm metadata
│   └── project_002.json             # Reforestation metadata
├── docs/                            # Documentation (13 files)
├── reports/
│   └── project_report.md            # Professional report
├── screenshots/                     # Proof screenshots
├── README.md                        # This file
├── hardhat.config.js                # Hardhat configuration
├── package.json                     # Dependencies
└── .gitignore                       # Git exclusions
```

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Blockchain-Powered-Carbon-Credit-Trading-Platform.git
cd Blockchain-Powered-Carbon-Credit-Trading-Platform

# 2. Install dependencies
npm install

# 3. Compile the smart contract
npx hardhat compile

# 4. Run tests
npx hardhat test

# 5. Start local blockchain (in a separate terminal)
npx hardhat node

# 6. Deploy contract
npx hardhat run scripts/deploy.js --network localhost
```

---

## Remix Simulation

For a visual simulation without any setup:

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create `CarbonCreditTrading.sol` and paste the contract code
3. Compile with Solidity 0.8.20
4. Deploy using Remix VM
5. Follow the step-by-step guide in [`docs/09_remix_simulation.md`](docs/09_remix_simulation.md)

Key simulation steps:
- Admin registers Issuer ✅
- Issuer creates "Solar Energy Farm" credit (10 tonnes CO₂e) ✅
- Owner lists credit for 1 ETH ✅
- Buyer purchases credit ✅
- Buyer retires credit ✅
- Transfer of retired credit FAILS ✅
- Listing of retired credit FAILS ✅

---

## Hardhat Testing

```bash
npx hardhat test
```

### Test Results: 27 Passing ✅

```
  CarbonCreditTrading
    Issuer Registration
      ✓ Admin should register an issuer successfully
      ✓ Unauthorized user should NOT be able to register an issuer
      ✓ Should not register zero address as issuer
      ✓ Should not register an already registered issuer
    Carbon Credit Issuance
      ✓ Authorized issuer should create a carbon credit
      ✓ Unauthorized address should NOT be able to issue credits
      ✓ Zero-tonne credit should be rejected
      ✓ Should reject issuance to zero address
    Marketplace Listing
      ✓ Owner should list credit for sale
      ✓ Non-owner should NOT be able to list a credit
      ✓ Should reject listing with zero price
      ✓ Should cancel listing successfully
    Credit Purchase
      ✓ Buyer should purchase a listed credit
      ✓ Ownership should change after purchase
      ✓ Seller should receive test payment
      ✓ Listing should close after successful purchase
      ✓ Should reject purchase with incorrect payment
      ✓ Double purchase should be prevented
    Credit Transfer
      ✓ Owner should transfer an active credit
      ✓ Should reject transfer of listed credit
    Credit Retirement
      ✓ Owner should retire a credit successfully
      ✓ Non-owner should NOT be able to retire a credit
      ✓ Retired credit should NOT be transferable
      ✓ Retired credit should NOT be listable
      ✓ Should not retire an already retired credit
    Event Emission Verification
      ✓ All events should be emitted correctly throughout lifecycle
    Ownership Tracking
      ✓ Should track owner credits correctly

  27 passing
```

---

## Optional DApp

The frontend is built with React + Vite + Ethers.js:

```bash
cd frontend
npm install
npm run dev
```

Features:
- 🏭 **Issuer Dashboard** — Issue new carbon credits
- 🏪 **Marketplace** — Browse and buy listed credits
- 📂 **Portfolio** — View owned credits, transfer/list/retire
- ♻️ **Retirement** — View retired credits with timestamps

---

## Sample Transactions

| Action | From | To | Credit ID | Details |
|--------|------|----|-----------|---------|
| Register Issuer | Admin | — | — | Authorize Account 2 |
| Issue Credit | Issuer | Account 3 | 0 | Solar Farm, 10 tCO₂e |
| List for Sale | Account 3 | Marketplace | 0 | Price: 1 ETH |
| Purchase | Account 4 | Account 3 | 0 | 1 ETH transferred |
| Retire | Account 4 | — | 0 | "Offset Q1 emissions" |

---

## Results

- ✅ Smart contract compiles successfully (Solidity 0.8.20)
- ✅ All 27 automated tests pass
- ✅ Complete lifecycle simulated in Remix IDE
- ✅ Reentrancy protection verified
- ✅ Retired credits cannot be traded or transferred
- ✅ Events emitted for complete audit trail
- ✅ Frontend connects to local blockchain

---

## Limitations

1. **Cannot verify real emissions**: Blockchain tracks ownership but can't prove actual CO₂ reduction occurred
2. **Simulated data**: All credits are simulated — not connected to real registries
3. **Simple marketplace**: Fixed-price listings only, no order books or auctions
4. **No oracle integration**: Cannot bring real-world monitoring data on-chain
5. **Single contract**: Not scalable for production use
6. **No fractional credits**: Each credit is a whole unit

---

## Market Integrity

> **Important**: Blockchain can preserve transaction history and ownership, but it **cannot by itself prove** that a carbon-reduction project actually removed or avoided the stated amount of CO₂. Real systems still need trusted Measurement, Reporting, and Verification (MRV) processes.

Our contract ensures:
- ✅ No double counting (unique IDs, single ownership)
- ✅ No unauthorized issuance (role-based access)
- ✅ Irreversible retirement (cannot unretire)
- ✅ Complete audit trail (events)

---

## Future Improvements

- 🔗 ERC-1155/ERC-721 token standards
- 📦 IPFS for decentralized metadata storage
- 🔮 Oracle integration (Chainlink) for real-world data
- ✅ Multi-step verification workflow
- 📊 Analytics dashboard
- 🎫 Retirement certificates as NFTs
- ⚡ Batch operations
- 🔄 Upgradeable proxy contracts
- 🌐 Cross-chain interoperability

---

## Learning Outcomes

Through this project, I learned:
1. Solidity smart contract development
2. Ethereum blockchain concepts (gas, transactions, events)
3. Role-based access control patterns
4. Checks-effects-interactions security pattern
5. Reentrancy protection
6. State machine design with enums
7. Hardhat testing framework
8. Web3 frontend development with Ethers.js
9. Carbon credit market mechanics
10. Real-world blockchain application architecture

---

## Author

**Student Project** — Blockchain Course

Built as part of a Blockchain course to demonstrate practical blockchain application development.

---

## License

This project is licensed under the MIT License.
