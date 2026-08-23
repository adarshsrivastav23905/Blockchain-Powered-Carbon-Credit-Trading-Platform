# 6️⃣ Carbon Credit Data Model

## CarbonCredit Struct

```solidity
struct CarbonCredit {
    uint256 creditId;           // Unique identifier
    string projectName;         // Name of the carbon reduction project
    string projectType;         // Type: Renewable Energy, Reforestation, etc.
    string country;             // Country/location of the project
    uint256 vintageYear;        // Year the emission reduction occurred
    uint256 tonnesCO2e;         // Amount of CO₂ equivalent in tonnes
    address issuer;             // Authorized issuer who created this credit
    address owner;              // Current owner's wallet address
    string metadataHash;        // Hash/reference to off-chain metadata
    CreditStatus status;        // Current lifecycle status
    uint256 createdAt;          // Timestamp of issuance
    uint256 retiredAt;          // Timestamp of retirement (0 if not retired)
    string retirementReason;    // Purpose/beneficiary of retirement
}
```

---

## Field Explanations

| Field | Type | Description |
|-------|------|-------------|
| `creditId` | `uint256` | Auto-incremented unique identifier starting from 0. Ensures every credit is distinguishable. |
| `projectName` | `string` | Human-readable name of the carbon project (e.g., "Solar Energy Farm — Rajasthan") |
| `projectType` | `string` | Category of the project (e.g., "Renewable Energy", "Reforestation", "Methane Capture") |
| `country` | `string` | Geographic location where the project operates |
| `vintageYear` | `uint256` | The year in which the emission reduction or removal occurred. Vintage affects credit value. |
| `tonnesCO2e` | `uint256` | Quantity of CO₂ equivalent this credit represents. Must be > 0. |
| `issuer` | `address` | The authorized issuer's wallet address who created this credit |
| `owner` | `address` | The current owner's wallet address. Updates on transfer/purchase. |
| `metadataHash` | `string` | Hash or IPFS CID linking to off-chain project documents. Provides verifiability without storing large files on-chain. |
| `status` | `CreditStatus` | Current lifecycle state of the credit (see enum below) |
| `createdAt` | `uint256` | Block timestamp when the credit was issued. Set automatically by the contract. |
| `retiredAt` | `uint256` | Block timestamp when the credit was retired. Defaults to 0 until retirement. |
| `retirementReason` | `string` | Optional field describing why the credit was retired (e.g., "Offset Q1 2026 company emissions") |

---

## CreditStatus Enum

```solidity
enum CreditStatus {
    ACTIVE,     // 0 — Credit is active, held by owner, available for trading or retirement
    LISTED,     // 1 — Credit is listed on the marketplace for sale
    RETIRED     // 2 — Credit is permanently retired — cannot be traded or transferred
}
```

### Status Transitions

```
                    ┌─────────────────┐
                    │     ACTIVE      │
                    │   (Initial)     │
                    └────┬───────┬────┘
                         │       │
              listForSale│       │retireCredit
                         │       │
                         ▼       ▼
                 ┌──────────┐  ┌──────────┐
                 │  LISTED  │  │ RETIRED  │
                 └────┬─────┘  └──────────┘
                      │             ▲
           buyCredit  │             │ (irreversible)
           or cancel  │             │
                      │             │
                      ▼             │
                 ┌──────────┐       │
                 │  ACTIVE  │───────┘
                 │(new owner│  retireCredit
                 │ or same) │
                 └──────────┘
```

### State Transition Rules

| From | To | Trigger | Who Can Do It |
|------|----|---------|---------------|
| — | ACTIVE | `issueCarbonCredit()` | Authorized Issuer |
| ACTIVE | LISTED | `listCreditForSale()` | Credit Owner |
| LISTED | ACTIVE | `cancelListing()` or `buyCredit()` | Seller (cancel) or Buyer (purchase) |
| ACTIVE | RETIRED | `retireCredit()` | Credit Owner |
| RETIRED | ❌ ANY | **Not allowed** | Nobody — retirement is final |

---

## Listing Struct

```solidity
struct Listing {
    uint256 creditId;    // The credit being sold
    address seller;      // Seller's wallet address
    uint256 price;       // Price in wei (test ETH)
    bool isActive;       // Whether the listing is still active
}
```

| Field | Description |
|-------|-------------|
| `creditId` | References the carbon credit being listed |
| `seller` | The address that listed the credit (must be current owner) |
| `price` | Amount of ETH (in wei) the buyer must pay |
| `isActive` | Set to `false` when the listing is cancelled or a purchase completes |
