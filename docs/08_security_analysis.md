# 19️⃣ Security & Market Integrity Analysis

## Threat Model

### 1. Double Counting
**Threat**: The same carbon credit is used to offset emissions by multiple entities.

**Mitigation**: Each credit has a unique `creditId` and a single `owner` at any time. When transferred or sold, the previous owner loses all rights. Once retired, the credit's status is permanently set to `RETIRED`.

---

### 2. Fake Credit Issuance
**Threat**: An unauthorized party creates fraudulent carbon credits.

**Mitigation**: The `onlyIssuer` modifier ensures only admin-authorized addresses can call `issueCarbonCredit()`. Unauthorized addresses get a revert:
```solidity
require(authorizedIssuers[msg.sender], "Only authorized issuers can perform this action");
```

---

### 3. Unauthorized Issuers
**Threat**: Someone registers themselves as an issuer without admin approval.

**Mitigation**: `registerIssuer()` uses the `onlyAdmin` modifier. Only the contract deployer can authorize new issuers.

---

### 4. Double Selling
**Threat**: A credit is sold to multiple buyers simultaneously.

**Mitigation**:
- A listed credit's status changes to `LISTED`, preventing re-listing
- Upon purchase, `listing.isActive = false` prevents a second purchase of the same listing
- Ownership transfers atomically — the credit has a single owner at all times

---

### 5. Replay / State Issues
**Threat**: A previous transaction is replayed or the contract reaches an inconsistent state.

**Mitigation**:
- Each listing has a unique `listingId` — old listings can't be reused
- Status checks (`ACTIVE`, `LISTED`, `RETIRED`) prevent invalid state transitions
- The `require()` statements enforce valid preconditions before any state change

---

### 6. Reentrancy
**Threat**: A malicious contract re-enters `buyCredit()` during ETH transfer to drain funds.

**Mitigation**:
- **Checks-Effects-Interactions pattern**: All state changes (ownership, listing status) happen BEFORE the ETH transfer
- **`nonReentrant` modifier**: Uses a boolean lock to prevent recursive calls
```solidity
modifier nonReentrant() {
    require(!_locked, "ReentrancyGuard: reentrant call");
    _locked = true;
    _;
    _locked = false;
}
```

---

### 7. Immutable Retirement
**Design Goal**: Once a credit is retired, it must NEVER be tradable again.

**Implementation**:
- `retireCredit()` sets `status = RETIRED` and records `retiredAt` timestamp
- Every function that trades/transfers/lists checks: `require(credit.status != CreditStatus.RETIRED, ...)`
- There is NO function to "unretire" a credit
- Even the admin cannot reverse a retirement

---

### 8. Marketplace Manipulation
**Threat**: Price manipulation, front-running, or self-dealing.

**Mitigation**:
- `require(msg.sender != listing.seller)` prevents self-purchase
- `require(msg.value == listing.price)` enforces exact payment
- Listing price is set by the seller and cannot be changed (must cancel and re-list)

---

### 9. Off-Chain Verification Dependence
**Limitation**: The smart contract stores a `metadataHash` but cannot verify the actual content.

**Reality**: The contract trusts that the issuer has provided accurate metadata. It cannot independently verify that a reforestation project actually planted trees or that a solar farm generates the claimed electricity.

---

### 10. Oracle Problem
**Limitation**: Smart contracts cannot access off-chain data without an oracle.

**Reality**: Our contract cannot verify:
- That a carbon project actually reduced emissions
- Current carbon credit market prices
- Real-world measurement data

This is a fundamental limitation of blockchain — it can only enforce rules on data that is already on-chain.

---

## ⚠️ Critical Limitation

> **Blockchain can preserve transaction history and ownership, but it cannot by itself prove that a carbon-reduction project actually removed or avoided the stated amount of CO₂. Real systems still need trusted Measurement, Reporting, and Verification (MRV) processes.**

This means:
- Our smart contract guarantees **ownership integrity** and **retirement immutability**
- It does NOT guarantee that the underlying emission reductions are real
- Real-world carbon credit systems (Verra, Gold Standard) use human verifiers, satellite imagery, sensor data, and site visits to validate projects
- Bridging this gap requires oracles, IoT integration, and trusted third-party verification — areas of active research in climate-tech

---

## Security Patterns Used

| Pattern | Where Applied |
|---------|--------------|
| **Access Control (Role-Based)** | `onlyAdmin`, `onlyIssuer`, `onlyCreditOwner` modifiers |
| **Checks-Effects-Interactions** | `buyCredit()` — state updated before ETH transfer |
| **Reentrancy Guard** | `nonReentrant` modifier on `buyCredit()` |
| **Input Validation** | `require()` checks on addresses, amounts, status |
| **State Machine** | `CreditStatus` enum enforces valid lifecycle transitions |
| **Pull-over-Push** | ETH sent via `call{value}` with success check |
