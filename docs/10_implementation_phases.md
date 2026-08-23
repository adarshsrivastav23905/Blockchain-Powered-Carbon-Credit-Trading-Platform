# 11️⃣ Implementation Phases

## Phase 1: Environment Setup

**Objective**: Install and configure all development tools.

**Steps**:
1. Install Node.js (v18+ recommended) from https://nodejs.org
2. Create project directory
3. Initialize npm project: `npm init -y`
4. Install Hardhat: `npm install --save-dev hardhat`
5. Install toolbox: `npm install --save-dev @nomicfoundation/hardhat-toolbox`
6. Create `hardhat.config.js`

**Expected Output**: `node_modules/` folder created, `package.json` and `package-lock.json` present.

**Common Errors**:
- `npm not found` → Node.js not installed or not in PATH
- Permission errors → Run terminal as administrator on Windows

**Proof to Capture**: Screenshot of `npm install` output showing packages installed.

---

## Phase 2: Architecture Planning

**Objective**: Define the system architecture before writing code.

**Steps**:
1. Identify actors (Admin, Issuer, Seller, Buyer)
2. Define data structures (CarbonCredit, Listing)
3. Design state machine (ACTIVE → LISTED → ACTIVE → RETIRED)
4. Plan functions and access control
5. Document in `docs/` folder

**Expected Output**: Architecture documents in `docs/` folder.

**Proof to Capture**: Architecture diagrams and data model documentation.

---

## Phase 3: Actor/Role Design

**Objective**: Define permissions for each user type.

**Steps**:
1. Define Admin role (deployer)
2. Define Issuer role (authorized by admin)
3. Define Owner role (credit holder)
4. Write permission modifiers

**Code Involved**: `onlyAdmin`, `onlyIssuer`, `onlyCreditOwner` modifiers

**Expected Output**: Modifiers that enforce role-based access.

---

## Phase 4: Carbon Credit Struct

**Objective**: Define the data model for carbon credits.

**Steps**:
1. Create `CreditStatus` enum
2. Create `CarbonCredit` struct with all fields
3. Create `Listing` struct
4. Set up state variables (mappings, counters)

**Code Involved**: Struct and enum definitions, state variable declarations

**Expected Output**: Data structures ready for functions to use.

---

## Phase 5: Issuer Registration

**Objective**: Implement admin's ability to authorize issuers.

**Steps**:
1. Implement `registerIssuer()` function
2. Add `onlyAdmin` modifier
3. Add input validation (zero address, duplicate)
4. Emit `IssuerRegistered` event

**Expected Output**: Admin can authorize addresses to issue credits.

**Common Errors**:
- Forgetting to check for zero address
- Not emitting the event

---

## Phase 6: Credit Issuance

**Objective**: Implement carbon credit creation.

**Steps**:
1. Implement `issueCarbonCredit()` function
2. Add `onlyIssuer` modifier
3. Validate inputs (tonnesCO2e > 0, valid owner)
4. Create CarbonCredit struct and store in mapping
5. Track owner credits
6. Emit `CreditIssued` event

**Expected Output**: Authorized issuers can create credits with metadata.

**Common Errors**:
- Setting wrong initial status (should be ACTIVE)
- Forgetting to increment `nextCreditId`

---

## Phase 7: Marketplace Listing

**Objective**: Allow credit owners to list credits for sale.

**Steps**:
1. Implement `listCreditForSale()` function
2. Add `onlyCreditOwner` modifier
3. Validate: not retired, not already listed, price > 0
4. Create Listing struct
5. Update credit status to LISTED
6. Emit `CreditListed` event

**Expected Output**: Credits appear as marketplace listings with prices.

**Common Errors**:
- Forgetting to check if credit is already listed
- Not linking credit to listing via `creditToListing` mapping

---

## Phase 8: Purchase and Ownership Transfer

**Objective**: Implement buying credits from the marketplace.

**Steps**:
1. Implement `buyCredit()` function with `payable`
2. Add `nonReentrant` modifier
3. Validate: listing active, exact payment, not self-buy
4. Update state BEFORE transferring ETH (checks-effects-interactions)
5. Transfer ownership and payment
6. Emit `CreditPurchased` event

**Expected Output**: Buyer sends ETH, becomes new owner, seller receives payment.

**Common Errors**:
- Sending ETH before updating state (reentrancy risk)
- Forgetting to update `ownerCredits` mapping
- Not setting `listing.isActive = false`

**Debugging Tips**:
- Check that `msg.value` matches `listing.price` exactly
- Verify the buyer isn't the seller

---

## Phase 9: Credit Retirement

**Objective**: Implement irreversible credit retirement.

**Steps**:
1. Implement `retireCredit()` function
2. Add `onlyCreditOwner` modifier
3. Validate: not already retired, not listed
4. Set status to RETIRED
5. Record `retiredAt` timestamp and `retirementReason`
6. Emit `CreditRetired` event

**Expected Output**: Credits can be permanently retired with a reason.

**Common Errors**:
- Allowing retirement of listed credits (should cancel listing first)
- Not recording the timestamp

---

## Phase 10: Event/Audit Logging

**Objective**: Verify all events are emitted correctly.

**Steps**:
1. Review all 7 events are defined
2. Verify each function emits the correct event
3. Check `indexed` parameters for efficient filtering
4. Test event emission in Hardhat tests

**Expected Output**: Complete audit trail via events.

---

## Phase 11: Testing

**Objective**: Write and run automated tests for all functionality.

**Steps**:
1. Create test file: `test/CarbonCreditTrading.test.js`
2. Write 17+ test cases covering all functions
3. Test success cases and failure cases
4. Test event emissions
5. Run: `npx hardhat test`

**Expected Output**: All tests passing (green checkmarks).

**Proof to Capture**: Screenshot of `npx hardhat test` output showing all tests pass.

---

## Phase 12: Remix Simulation

**Objective**: Demonstrate the contract visually in Remix IDE.

**Steps**: Follow `docs/09_remix_simulation.md` guide.

**Expected Output**: 13 screenshots proving complete lifecycle.

---

## Phase 13: Hardhat Testing

**Objective**: Run automated tests using Hardhat.

**Steps**:
1. `npx hardhat compile` — compile contract
2. `npx hardhat test` — run all tests
3. Capture output showing passing tests

**Expected Output**: All 17+ test cases pass.

---

## Phase 14: Optional Frontend

**Objective**: Build a React DApp for visual interaction.

**Steps**:
1. Initialize React app with Vite
2. Install ethers.js
3. Create components: IssuerDashboard, Marketplace, Portfolio, Retirement
4. Connect to MetaMask
5. Interact with deployed contract

**Expected Output**: Working frontend connecting to local Hardhat node.

---

## Phase 15: GitHub Documentation

**Objective**: Prepare the project for GitHub showcase.

**Steps**:
1. Write comprehensive README.md
2. Organize all documentation in `docs/`
3. Create meaningful commit history
4. Add topics and description to repository
5. Push to GitHub

**Expected Output**: Professional GitHub repository ready for portfolio.

**Proof to Capture**: GitHub repository page screenshot.
