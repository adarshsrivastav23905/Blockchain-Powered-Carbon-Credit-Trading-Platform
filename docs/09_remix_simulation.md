# 9️⃣ Remix IDE Simulation Guide

## Overview
This guide walks you through a complete simulation of the carbon credit lifecycle using **Remix IDE** — a browser-based Solidity development environment that requires zero setup.

---

## Account Setup

| Account | Remix Address | Role |
|---------|--------------|------|
| Account 1 | First account in dropdown | **Admin** (deploys the contract) |
| Account 2 | Second account | **Issuer** (authorized to create credits) |
| Account 3 | Third account | **Seller / Initial Credit Owner** |
| Account 4 | Fourth account | **Buyer** |

---

## Step-by-Step Simulation

### Step 1: Open Remix
1. Go to [https://remix.ethereum.org](https://remix.ethereum.org)
2. In the File Explorer (left panel), create a new file: `CarbonCreditTrading.sol`

### Step 2: Paste the Contract
Copy the entire contents of `contracts/CarbonCreditTrading.sol` into the Remix editor.

### Step 3: Compile
1. Click the **Solidity Compiler** tab (left sidebar, 2nd icon)
2. Set compiler version to `0.8.20`
3. Click **Compile CarbonCreditTrading.sol**
4. ✅ Green checkmark = successful compilation

📸 **Screenshot 1**: Successful compilation screen

### Step 4: Deploy
1. Click the **Deploy & Run Transactions** tab (left sidebar, 3rd icon)
2. Environment: Select **Remix VM (Cancun)** or **Remix VM (Shanghai)**
3. Account: Select **Account 1** (this will be the Admin)
4. Click **Deploy**
5. The contract appears under "Deployed Contracts"

📸 **Screenshot 2**: Contract deployment with Admin account

### Step 5: Admin Registers Issuer
1. Keep Account 1 (Admin) selected
2. Expand the deployed contract
3. Find `registerIssuer` function
4. Paste **Account 2's address** as the `_issuer` parameter
5. Click **transact**
6. ✅ Transaction should succeed

📸 **Screenshot 3**: Issuer registration transaction

### Step 6: Issuer Creates a Carbon Credit
1. Switch to **Account 2** (Issuer) in the Account dropdown
2. Find `issueCarbonCredit` function
3. Enter parameters:
   - `_projectName`: `"Solar Energy Farm"`
   - `_projectType`: `"Renewable Energy"`
   - `_country`: `"India"`
   - `_vintageYear`: `2026`
   - `_tonnesCO2e`: `10`
   - `_owner`: **Account 3's address** (Seller)
   - `_metadataHash`: `"QmSimulatedHash123"`
4. Click **transact**
5. ✅ Credit ID 0 is created

📸 **Screenshot 4**: Carbon credit issuance

### Step 7: Verify Credit Details
1. Find `getCreditDetails` function
2. Enter `_creditId`: `0`
3. Click **call**
4. Verify:
   - `projectName` = "Solar Energy Farm"
   - `tonnesCO2e` = 10
   - `owner` = Account 3's address
   - `status` = 0 (ACTIVE)

📸 **Screenshot 5**: Credit details showing correct data

### Step 8: Owner Lists Credit for Sale
1. Switch to **Account 3** (Seller/Owner)
2. Find `listCreditForSale` function
3. Enter:
   - `_creditId`: `0`
   - `_price`: `1000000000000000000` (1 ETH in wei)
4. Click **transact**
5. ✅ Credit status changes to LISTED

📸 **Screenshot 6**: Credit listed for sale

### Step 9: Buyer Purchases Credit
1. Switch to **Account 4** (Buyer)
2. In the **VALUE** field at the top, enter `1` and select `Ether`
3. Find `buyCredit` function
4. Enter `_listingId`: `0`
5. Click **transact**
6. ✅ Purchase succeeds

📸 **Screenshot 7**: Successful purchase transaction

### Step 10: Verify Ownership Changed
1. Call `getCreditDetails` with `_creditId`: `0`
2. Verify:
   - `owner` = Account 4's address (Buyer)
   - `status` = 0 (ACTIVE)

📸 **Screenshot 8**: Ownership verification showing new owner

### Step 11: Buyer Retires Credit
1. Keep **Account 4** (Buyer/New Owner) selected
2. Find `retireCredit` function
3. Enter:
   - `_creditId`: `0`
   - `_reason`: `"Offset Q1 2026 company emissions"`
4. Click **transact**
5. ✅ Credit is retired

📸 **Screenshot 9**: Credit retirement transaction

### Step 12: Verify Retired Status
1. Call `getCreditDetails` with `_creditId`: `0`
2. Verify:
   - `status` = 2 (RETIRED)
   - `retirementReason` = "Offset Q1 2026 company emissions"
   - `retiredAt` > 0

📸 **Screenshot 10**: Credit details showing RETIRED status

### Step 13: Attempt to Transfer Retired Credit (Should FAIL)
1. Keep **Account 4** selected
2. Call `transferCredit` with:
   - `_creditId`: `0`
   - `_to`: Account 3's address
3. ❌ **Expected**: Transaction REVERTS with "Cannot transfer a retired credit"

📸 **Screenshot 11**: Failed transfer showing revert message

### Step 14: Attempt to List Retired Credit (Should FAIL)
1. Keep **Account 4** selected
2. Call `listCreditForSale` with:
   - `_creditId`: `0`
   - `_price`: `1000000000000000000`
3. ❌ **Expected**: Transaction REVERTS with "Cannot list a retired credit"

📸 **Screenshot 12**: Failed listing showing revert message

### Step 15: Check Event Logs
1. Scroll down to the **transaction log** area in Remix
2. Click on each successful transaction to expand it
3. Look for the `logs` section — each event is recorded here
4. You should see:
   - `IssuerRegistered`
   - `CreditIssued`
   - `CreditListed`
   - `CreditPurchased`
   - `CreditRetired`

📸 **Screenshot 13**: Event logs showing audit trail

---

## Screenshot Checklist for Remix Simulation

| # | Screenshot | Filename | What It Proves |
|---|-----------|----------|----------------|
| 1 | Successful compilation | `01_compilation.png` | Contract compiles without errors |
| 2 | Contract deployment | `02_deployment.png` | Contract deployed to Remix VM |
| 3 | Issuer registration | `03_issuer_registered.png` | Admin can authorize issuers |
| 4 | Credit issuance | `04_credit_issued.png` | Issuer creates carbon credit |
| 5 | Credit details | `05_credit_details.png` | Correct metadata stored on-chain |
| 6 | Credit listed | `06_credit_listed.png` | Owner can list credit for sale |
| 7 | Credit purchased | `07_credit_purchased.png` | Buyer purchases with test ETH |
| 8 | Ownership changed | `08_ownership_changed.png` | Buyer is new owner |
| 9 | Credit retired | `09_credit_retired.png` | Owner retires credit |
| 10 | Retired status | `10_retired_status.png` | Status = RETIRED confirmed |
| 11 | Transfer blocked | `11_transfer_blocked.png` | Retired credit cannot transfer |
| 12 | Listing blocked | `12_listing_blocked.png` | Retired credit cannot be listed |
| 13 | Event logs | `13_event_logs.png` | Complete audit trail visible |
