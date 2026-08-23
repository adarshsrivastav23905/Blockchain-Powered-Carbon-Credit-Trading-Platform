# 5️⃣ Project Actors & Roles

## Actor Definitions

### 🔑 Admin (Contract Deployer)
- The address that **deploys** the smart contract
- Can **register** new authorized issuers
- Cannot arbitrarily modify credits or retired records
- Acts as a governance layer for issuer management

### 🏭 Issuer / Verifier
- An address **authorized by the admin** to issue new carbon credits
- Creates simulated carbon credits with project metadata
- Assigns initial ownership to a specified address
- Cannot issue credits without admin authorization

### 💰 Seller (Credit Owner)
- Owns one or more **active** carbon credits
- Can **list** credits for sale on the marketplace with a price
- Can **cancel** their listings
- Can **transfer** credits directly to another address
- Can **retire** credits to claim the carbon offset

### 🛒 Buyer
- Any address that **purchases** a listed credit from the marketplace
- Sends test ETH equal to the listing price
- Becomes the **new owner** after purchase
- Can then list, transfer, or retire the purchased credit

### 👤 Credit Owner
- The current holder of any carbon credit
- Has exclusive rights to transfer, list, or retire their credits
- Ownership is tracked on-chain via the `owner` field

---

## Permissions Table

| Action | Admin | Issuer | Owner | Buyer | Unauthorized |
|--------|:-----:|:------:|:-----:|:-----:|:------------:|
| Deploy Contract | ✅ | ❌ | ❌ | ❌ | ❌ |
| Register Issuer | ✅ | ❌ | ❌ | ❌ | ❌ |
| Issue Carbon Credit | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Credit Details | ✅ | ✅ | ✅ | ✅ | ✅ |
| List Credit for Sale | ❌ | ❌ | ✅ | ❌ | ❌ |
| Cancel Listing | ❌ | ❌ | ✅ | ❌ | ❌ |
| Buy Credit | ✅ | ✅ | ❌* | ✅ | ✅ |
| Transfer Credit | ❌ | ❌ | ✅ | ❌ | ❌ |
| Retire Credit | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Owner Credits | ✅ | ✅ | ✅ | ✅ | ✅ |

\* Owner cannot buy their own listed credit (self-purchase prevention)

---

## Role Flow

```
┌──────────┐     registers     ┌──────────┐     issues credit     ┌──────────┐
│  ADMIN   │ ────────────────► │  ISSUER  │ ───────────────────► │  OWNER   │
└──────────┘                   └──────────┘                       └─────┬────┘
                                                                        │
                                            ┌───────────────────────────┤
                                            │                           │
                                            ▼                           ▼
                                     ┌────────────┐             ┌────────────┐
                                     │ LIST/SELL  │             │  TRANSFER  │
                                     └─────┬──────┘             └────────────┘
                                           │
                                           ▼
                                     ┌────────────┐
                                     │   BUYER    │ ────► New OWNER
                                     └────────────┘
                                                          │
                                                          ▼
                                                   ┌────────────┐
                                                   │   RETIRE   │
                                                   └────────────┘
```

---

## Access Control Implementation

The smart contract uses **Solidity modifiers** to enforce permissions:

```solidity
modifier onlyAdmin()                    // Restricts to contract deployer
modifier onlyIssuer()                   // Restricts to authorized issuers
modifier onlyCreditOwner(uint256 _id)   // Restricts to owner of specific credit
```

These modifiers are applied to functions:
- `registerIssuer()` → `onlyAdmin`
- `issueCarbonCredit()` → `onlyIssuer`
- `listCreditForSale()` → `onlyCreditOwner`
- `transferCredit()` → `onlyCreditOwner`
- `retireCredit()` → `onlyCreditOwner`
