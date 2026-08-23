# 7️⃣ Project Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React DApp)                        │
│                                                                     │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────┐ ┌──────────────┐  │
│  │   Issuer    │ │  Marketplace │ │ Portfolio │ │  Retirement  │  │
│  │  Dashboard  │ │    Page      │ │   Page    │ │    Page      │  │
│  └──────┬──────┘ └──────┬───────┘ └─────┬─────┘ └──────┬───────┘  │
│         │               │               │              │           │
│         └───────────────┴───────┬───────┴──────────────┘           │
│                                 │                                   │
│                          ┌──────┴──────┐                           │
│                          │  Ethers.js  │                           │
│                          └──────┬──────┘                           │
│                                 │                                   │
│                          ┌──────┴──────┐                           │
│                          │  MetaMask   │                           │
│                          └──────┬──────┘                           │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
                                  │ JSON-RPC
                                  │
┌─────────────────────────────────┼───────────────────────────────────┐
│                    BLOCKCHAIN (Hardhat Local / Testnet)              │
│                                 │                                   │
│                    ┌────────────┴────────────┐                     │
│                    │  CarbonCreditTrading.sol │                     │
│                    │                          │                     │
│                    │  ┌────────────────────┐  │                     │
│                    │  │ Issuer Registry    │  │                     │
│                    │  ├────────────────────┤  │                     │
│                    │  │ Credit Registry    │  │                     │
│                    │  ├────────────────────┤  │                     │
│                    │  │ Marketplace Logic  │  │                     │
│                    │  ├────────────────────┤  │                     │
│                    │  │ Transfer Logic     │  │                     │
│                    │  ├────────────────────┤  │                     │
│                    │  │ Retirement Registry│  │                     │
│                    │  └────────────────────┘  │                     │
│                    └─────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Reference (metadataHash)
                                  │
┌─────────────────────────────────┼───────────────────────────────────┐
│                    OFF-CHAIN (Optional / Future)                     │
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────────────┐  │
│  │   Project    │ │ Verification │ │   Methodology Documents    │  │
│  │  Documents   │ │   Evidence   │ │   Images & Media           │  │
│  └──────────────┘ └──────────────┘ └────────────────────────────┘  │
│                                                                     │
│        Currently: sample_metadata/ folder (JSON files)             │
│        Future: IPFS / Pinata / Arweave                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Pages

| Page | Purpose | Key Components |
|------|---------|---------------|
| **Issuer Dashboard** | Issue new carbon credits | Wallet connect, project form, issue button |
| **Marketplace** | Browse and buy listed credits | Credit cards, price display, buy button |
| **Portfolio** | View and manage owned credits | Credit list, transfer/list/retire actions |
| **Retirement Page** | View retired credits | Retired credit details, timestamp, reason |

---

## Smart Contract Modules

| Module | Responsibility |
|--------|---------------|
| **Issuer Registry** | Manages authorized issuers — admin can add issuers |
| **Credit Registry** | Stores all carbon credits with metadata, tracks ownership |
| **Marketplace** | Handles listing, cancellation, and purchase of credits |
| **Transfer Logic** | Direct credit transfers between addresses |
| **Retirement Registry** | Permanent retirement with timestamp and reason |

---

## Data Stored On-Chain vs Off-Chain

### On-Chain (Smart Contract State)
| Data | Purpose |
|------|---------|
| Credit ID | Unique identifier |
| Owner wallet address | Current ownership |
| Tonnes CO₂e | Credit quantity |
| Project metadata hash | Reference to off-chain details |
| Credit status | ACTIVE / LISTED / RETIRED |
| Transfer history (via events) | Immutable audit trail |
| Retirement state & timestamp | Proof of retirement |

### Off-Chain (Sample Metadata Folder / Future IPFS)
| Data | Purpose |
|------|---------|
| Project documents (PDFs) | Detailed project description |
| Verification evidence | Simulated verification reports |
| Methodology details | How emission reductions were calculated |
| Project images | Visual documentation |
| Full project metadata (JSON) | Comprehensive project information |

---

## Ownership Flow

```
┌─────────┐          ┌─────────┐          ┌─────────┐
│ Issuer  │ ──issue──►│ Owner A │ ─transfer─►│ Owner B │
└─────────┘          └─────────┘          └─────────┘

Credit created ──► Assigned to Owner A ──► Transferred to Owner B
Status: ACTIVE      Status: ACTIVE         Status: ACTIVE
```

## Trading Flow

```
┌─────────┐    list     ┌─────────────┐    buy      ┌─────────┐
│ Seller  │ ──────────► │ Marketplace │ ──────────► │  Buyer  │
└─────────┘             └─────────────┘             └─────────┘
                              │
   ◄──── ETH payment ────────┘

1. Seller lists credit with price      → Status: LISTED
2. Buyer sends exact ETH amount         → Payment sent
3. Smart contract transfers ownership   → Status: ACTIVE (new owner)
4. Seller receives ETH                  → Listing closed
```

## Retirement Flow

```
┌─────────┐    retire    ┌──────────────┐
│  Owner  │ ────────────►│   RETIRED    │ ───► Cannot trade/transfer
└─────────┘              │  (permanent) │      Cannot re-list
                         └──────────────┘      Cannot undo

1. Owner calls retireCredit() with reason
2. Status changes to RETIRED
3. retiredAt timestamp recorded
4. CreditRetired event emitted
5. All future trade/transfer attempts REVERT
```
