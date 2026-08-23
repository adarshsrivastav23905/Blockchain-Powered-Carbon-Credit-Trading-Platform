# 📸 Screenshots Guide — What to Take & How

> This guide walks you through **exactly** what screenshots to capture, **how** to take them, and **what each one proves**.

---

## 🛠️ Tool: Remix IDE (Browser-Based — No Setup Required)

**Open**: [https://remix.ethereum.org](https://remix.ethereum.org)

**How to take a screenshot on Windows**:
- Press `Win + Shift + S` → select the area → paste into Paint → Save as PNG
- Or press `PrtSc` → open Paint → `Ctrl + V` → Save

---

## 📝 Initial Setup in Remix

### Before you begin, note down these 4 accounts:

1. Open Remix → Click the **Deploy & Run Transactions** tab (3rd icon on left sidebar)
2. You'll see an **ACCOUNT** dropdown at the top — it has multiple test accounts
3. Copy down the **first 4 addresses** — they will be:

| Role | Account | How to Identify |
|------|---------|-----------------|
| **Admin** | 1st account in dropdown | Deployer of the contract |
| **Issuer** | 2nd account in dropdown | Will be registered by Admin |
| **Seller/Owner** | 3rd account in dropdown | Will receive the issued credit |
| **Buyer** | 4th account in dropdown | Will purchase the credit |

> 💡 **Tip**: Copy each address to a Notepad file for easy reference. You'll paste them into function inputs.

---

## 📸 Screenshot 1: Project Folder Structure

**What**: Your project folder in VS Code or File Explorer

**How**:
1. Open VS Code with your project
2. Expand the file explorer to show all folders: `contracts/`, `scripts/`, `test/`, `frontend/`, `docs/`, `reports/`, `sample_metadata/`, `screenshots/`
3. Take a screenshot showing the complete folder tree

**What it proves**: You have a properly organized project structure

**Save as**: `screenshots/01_folder_structure.png`

---

## 📸 Screenshot 2: Solidity Contract Code

**What**: The smart contract open in an editor

**How**:
1. Open `contracts/CarbonCreditTrading.sol` in VS Code or Remix
2. Show the top portion with the contract name, enums, and structs visible
3. Take a screenshot

**What it proves**: You wrote a complete Solidity smart contract

**Save as**: `screenshots/02_solidity_contract.png`

---

## 📸 Screenshot 3: Successful Compilation

**What**: Remix showing green checkmark after compilation

**How**:
1. In Remix, create a new file called `CarbonCreditTrading.sol`
2. Copy-paste the entire content from your `contracts/CarbonCreditTrading.sol`
3. Click the **Solidity Compiler** tab (2nd icon on left sidebar)
4. Set compiler version to **0.8.20**
5. Click **Compile CarbonCreditTrading.sol**
6. ✅ You should see a **green checkmark** next to the tab icon
7. Take a screenshot showing the green checkmark and "Compilation Details" area

**What it proves**: Contract has no syntax or compilation errors

**Save as**: `screenshots/03_compilation_success.png`

---

## 📸 Screenshot 4: Contract Deployment

**What**: Remix showing the deployed contract

**How**:
1. Click the **Deploy & Run Transactions** tab (3rd icon on left sidebar)
2. **Environment**: Select `Remix VM (Cancun)` or `Remix VM (Shanghai)`
3. **Account**: Make sure the **1st account** (Admin) is selected
4. Click the orange **Deploy** button
5. You'll see the contract appear under **Deployed Contracts** at the bottom
6. Take a screenshot showing:
   - The selected account (Admin)
   - The "Deploy" button area
   - The deployed contract below with its address

**What it proves**: Contract deployed successfully, and deployer becomes Admin

**Save as**: `screenshots/04_contract_deployed.png`

---

## 📸 Screenshot 5: Issuer Registration

**What**: Admin registering Account 2 as an authorized issuer

**How**:
1. Keep **Account 1 (Admin)** selected in the ACCOUNT dropdown
2. Expand the deployed contract (click the arrow ▶)
3. Find the `registerIssuer` function (orange button)
4. Paste **Account 2's address** into the `_issuer` field
5. Click **transact**
6. ✅ In the terminal at the bottom, you'll see a green checkmark with transaction details
7. Take a screenshot showing:
   - The `registerIssuer` function with the issuer address
   - The green checkmark transaction in the terminal

**What it proves**: Role-based access control — Admin can authorize issuers

**Save as**: `screenshots/05_issuer_registered.png`

---

## 📸 Screenshot 6: Carbon Credit Issuance

**What**: Issuer creating a simulated carbon credit

**How**:
1. **Switch account** to **Account 2 (Issuer)** in the ACCOUNT dropdown
2. Find the `issueCarbonCredit` function and expand it
3. Fill in these **exact values**:

   ```
   _projectName:   "Solar Energy Farm"
   _projectType:   "Renewable Energy"
   _country:       "India"
   _vintageYear:   2026
   _tonnesCO2e:    10
   _owner:         [paste Account 3's address here]
   _metadataHash:  "QmSimulatedHash123"
   ```

4. Click **transact**
5. ✅ Green checkmark in terminal
6. Take a screenshot showing:
   - Account 2 (Issuer) selected
   - All the filled-in parameters
   - The successful transaction in the terminal

**What it proves**: Authorized issuers can create carbon credits with metadata

**Save as**: `screenshots/06_credit_issued.png`

---

## 📸 Screenshot 7: Credit Details Verification

**What**: Viewing the created credit's full details

**How**:
1. Find the `getCreditDetails` function (blue button — it's a view function)
2. Enter `_creditId`: `0`
3. Click **call** (not transact — this is a read-only function)
4. The result will expand below showing all fields:
   - `creditId: 0`
   - `projectName: Solar Energy Farm`
   - `tonnesCO2e: 10`
   - `owner: [Account 3's address]`
   - `status: 0` (which means ACTIVE)
5. Take a screenshot showing **all the returned fields**

**What it proves**: Credit data is correctly stored on the blockchain

**Save as**: `screenshots/07_credit_details.png`

---

## 📸 Screenshot 8: Credit Listed for Sale

**What**: Owner listing the credit on the marketplace

**How**:
1. **Switch account** to **Account 3 (Seller/Owner)** in the ACCOUNT dropdown
2. Find the `listCreditForSale` function
3. Enter:
   ```
   _creditId: 0
   _price:    1000000000000000000
   ```
   > ☝️ That long number = **1 ETH in wei** (1 followed by 18 zeros)
   
4. Click **transact**
5. ✅ Green checkmark in terminal
6. Take a screenshot showing the function inputs and successful transaction

**What it proves**: Credit owners can list their credits for sale with a price

**Save as**: `screenshots/08_credit_listed.png`

---

## 📸 Screenshot 9: Buyer Purchases Credit

**What**: Buyer purchasing the listed credit with test ETH

**How**:
1. **Switch account** to **Account 4 (Buyer)** in the ACCOUNT dropdown
2. **IMPORTANT**: At the top of the Deploy panel, find the **VALUE** field
   - Enter `1` in the number box
   - Change the dropdown from `Wei` to `Ether`
   - This sets `msg.value` to 1 ETH
3. Find the `buyCredit` function
4. Enter `_listingId`: `0`
5. Click **transact**
6. ✅ Green checkmark in terminal
7. Take a screenshot showing:
   - Account 4 (Buyer) selected
   - VALUE set to 1 Ether
   - The successful transaction

**What it proves**: Marketplace purchase works — payment and ownership transfer happen atomically

**Save as**: `screenshots/09_credit_purchased.png`

> ⚠️ **After this step**: Set the VALUE field back to `0` to avoid accidentally sending ETH in subsequent calls.

---

## 📸 Screenshot 10: Ownership Verification (New Owner)

**What**: Confirming the buyer is now the owner

**How**:
1. Call `getCreditDetails` with `_creditId`: `0`
2. Check the output:
   - `owner` should now be **Account 4's address** (the Buyer)
   - `status` should be `0` (ACTIVE — back from LISTED)
3. Take a screenshot showing the updated owner and status

**What it proves**: Ownership successfully transferred to the buyer after purchase

**Save as**: `screenshots/10_ownership_changed.png`

---

## 📸 Screenshot 11: Credit Retirement

**What**: New owner permanently retiring the credit

**How**:
1. Keep **Account 4 (Buyer/New Owner)** selected
2. Find the `retireCredit` function
3. Enter:
   ```
   _creditId: 0
   _reason:   "Offset Q1 2026 company emissions"
   ```
4. Click **transact**
5. ✅ Green checkmark in terminal
6. Take a screenshot showing the function inputs and transaction

**What it proves**: Credit owners can retire credits permanently

**Save as**: `screenshots/11_credit_retired.png`

---

## 📸 Screenshot 12: RETIRED Status Confirmed

**What**: Verifying the credit's status is now RETIRED

**How**:
1. Call `getCreditDetails` with `_creditId`: `0`
2. Check the output:
   - `status` = `2` (which means **RETIRED**)
   - `retirementReason` = `"Offset Q1 2026 company emissions"`
   - `retiredAt` = a non-zero timestamp
3. Take a screenshot showing these fields

**What it proves**: Retirement is recorded permanently on-chain with timestamp and reason

**Save as**: `screenshots/12_retired_status.png`

---

## 📸 Screenshot 13: Failed Transfer After Retirement

**What**: Proving that a retired credit CANNOT be transferred

**How**:
1. Keep **Account 4** selected
2. Find the `transferCredit` function
3. Enter:
   ```
   _creditId: 0
   _to:       [paste Account 3's address]
   ```
4. Click **transact**
5. ❌ **EXPECTED FAILURE**: You'll see a **red error** in the terminal:
   `"Cannot transfer a retired credit"`
6. Take a screenshot showing the **red error message** in the terminal

**What it proves**: Retired credits are truly immutable — they cannot be re-entered into circulation

**Save as**: `screenshots/13_transfer_blocked.png`

---

## 📸 Screenshot 14: Failed Listing After Retirement

**What**: Proving that a retired credit CANNOT be listed for sale

**How**:
1. Keep **Account 4** selected
2. Find the `listCreditForSale` function
3. Enter:
   ```
   _creditId: 0
   _price:    1000000000000000000
   ```
4. Click **transact**
5. ❌ **EXPECTED FAILURE**: Red error:
   `"Cannot list a retired credit"`
6. Take a screenshot showing the **red error message**

**What it proves**: Retired credits can never be sold again — prevents double counting

**Save as**: `screenshots/14_listing_blocked.png`

---

## 📸 Screenshot 15: Event Logs (Audit Trail)

**What**: Viewing the emitted events in the transaction log

**How**:
1. Scroll down to the **terminal** at the bottom of Remix
2. Click on any **green checkmark transaction** to expand it
3. Look for the **logs** section — it shows the emitted event with its parameters
4. Try expanding the **CreditIssued** transaction and the **CreditRetired** transaction
5. Take a screenshot showing at least 2-3 expanded event logs

**What it proves**: Complete audit trail is maintained through blockchain events

**Save as**: `screenshots/15_event_logs.png`

---

## 📸 Screenshot 16: Hardhat Test Results

**What**: Terminal output showing all 27 tests passing

**How**:
1. Open a terminal in your project directory
2. Run:
   ```bash
   npx hardhat test
   ```
3. Wait for all tests to complete
4. You should see all green checkmarks (✓) with "27 passing"
5. Take a screenshot of the **entire test output**

**What it proves**: Comprehensive automated testing validates all contract functionality

**Save as**: `screenshots/16_hardhat_tests.png`

---

## 📸 Screenshot 17 & 18: Frontend (Optional)

**What**: The React DApp running in a browser

**How**:
1. Open **Terminal 1** and run: `npx hardhat node`
2. Open **Terminal 2** and run: `npx hardhat run scripts/deploy.js --network localhost`
3. Open **Terminal 3**, navigate to `frontend/`, and run: `npm run dev`
4. Open `http://localhost:5173` in your browser
5. Install MetaMask browser extension if not already installed
6. In MetaMask: Add a custom network → RPC URL: `http://127.0.0.1:8545`, Chain ID: `31337`
7. Import a Hardhat test account private key into MetaMask (shown when you ran `npx hardhat node`)
8. Connect wallet on the DApp
9. Take screenshots of:
   - **Marketplace page** → Save as `screenshots/17_frontend_marketplace.png`
   - **Portfolio page** → Save as `screenshots/18_frontend_portfolio.png`

**What it proves**: Full-stack blockchain development with a working frontend

---

## 📸 Screenshot 19 & 20: GitHub Repository

**What**: Your published GitHub repository

**How**:
1. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Blockchain-Powered-Carbon-Credit-Trading-Platform.git
   git push -u origin main
   ```
2. Open your repository on GitHub in a browser
3. Take screenshots of:
   - **Repository main page** (shows file list + beginning of README) → `screenshots/19_github_repo.png`
   - **README rendered** (scroll down to show the full README) → `screenshots/20_readme_preview.png`

**What it proves**: Professional GitHub presence with documented code

---

## ✅ Quick Summary Checklist

| # | Screenshot | Where to Take | Required? |
|---|-----------|--------------|-----------|
| 1 | Folder structure | VS Code / File Explorer | ✅ Yes |
| 2 | Solidity contract | VS Code / Remix | ✅ Yes |
| 3 | Compilation success | Remix | ✅ Yes |
| 4 | Contract deployment | Remix | ✅ Yes |
| 5 | Issuer registration | Remix | ✅ Yes |
| 6 | Credit issuance | Remix | ✅ Yes |
| 7 | Credit details | Remix | ✅ Yes |
| 8 | Credit listed | Remix | ✅ Yes |
| 9 | Buyer purchase | Remix | ✅ Yes |
| 10 | Ownership changed | Remix | ✅ Yes |
| 11 | Credit retirement | Remix | ✅ Yes |
| 12 | RETIRED status | Remix | ✅ Yes |
| 13 | Transfer blocked | Remix | ✅ Yes |
| 14 | Listing blocked | Remix | ✅ Yes |
| 15 | Event logs | Remix | ✅ Yes |
| 16 | Hardhat test results | Terminal | ✅ Yes |
| 17 | Frontend marketplace | Browser | ⭐ Optional |
| 18 | Frontend portfolio | Browser | ⭐ Optional |
| 19 | GitHub repo | Browser | ✅ Yes |
| 20 | README preview | Browser | ✅ Yes |

> 💡 **Tip**: After taking all screenshots, commit them to git:
> ```bash
> git add screenshots/
> git commit -m "Add Remix simulation and testing proof screenshots"
> git push
> ```
