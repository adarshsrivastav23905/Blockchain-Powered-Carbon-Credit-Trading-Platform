# 4️⃣ Blockchain Concepts Used

## Core Concepts

### 1. Blockchain
A **distributed, immutable ledger** that records transactions across a network of computers. Once data is written, it cannot be altered or deleted.

**Why used**: Carbon credits need a tamper-proof record of issuance, ownership changes, and retirement. Blockchain guarantees no one can secretly modify credit records.

---

### 2. Ethereum
An open-source blockchain platform that supports **smart contracts** — self-executing programs that run on every node in the network.

**Why used**: Ethereum provides the infrastructure to deploy our carbon credit trading logic as a smart contract that anyone can interact with.

---

### 3. Smart Contract
A **self-executing program** stored on the blockchain that automatically enforces rules and executes transactions when conditions are met.

**Why used**: Our entire carbon credit lifecycle (issuance, trading, retirement) is governed by smart contract code — no human intermediary needed.

---

### 4. Solidity
The **programming language** for writing Ethereum smart contracts. It's statically typed and supports inheritance, libraries, and complex user-defined types.

**Why used**: It's the dominant language for Ethereum development with extensive tooling and community support.

---

### 5. Wallet Address
A **unique identifier** (42-character hexadecimal string starting with `0x`) that represents an account on Ethereum. It's derived from a public key.

**Why used**: Every participant (admin, issuer, buyer, seller) is identified by their wallet address. Ownership is tied to addresses.

---

### 6. Tokenization
The process of converting a real-world asset into a **digital representation** on the blockchain.

**Why used**: We tokenize carbon credits — converting "1 tonne of CO₂ reduction" into an on-chain data structure with a unique ID, owner, and metadata.

---

### 7. Carbon Credit Token
Our custom digital representation of a carbon credit, stored as a `CarbonCredit` struct in the smart contract.

**Why used**: Each credit has a unique ID, project metadata, owner, status, and lifecycle — all managed on-chain.

---

## Solidity Concepts

### 8. `mapping`
A **key-value data structure** in Solidity (like a dictionary/hash map).

```solidity
mapping(uint256 => CarbonCredit) public carbonCredits;
mapping(address => bool) public authorizedIssuers;
```

**Why used**: To efficiently look up credits by ID, check if an address is an authorized issuer, and track ownership.

---

### 9. `struct`
A **custom data type** that groups related variables together.

```solidity
struct CarbonCredit {
    uint256 creditId;
    string projectName;
    address owner;
    CreditStatus status;
    // ...
}
```

**Why used**: To represent a carbon credit with all its properties as a single entity.

---

### 10. `enum`
A **user-defined type** with a fixed set of named values.

```solidity
enum CreditStatus { ACTIVE, LISTED, RETIRED }
```

**Why used**: To clearly define and restrict the possible states of a carbon credit throughout its lifecycle.

---

### 11. `modifier`
A **reusable condition check** that can be applied to functions.

```solidity
modifier onlyAdmin() {
    require(msg.sender == admin, "Only admin can perform this action");
    _;
}
```

**Why used**: To implement access control — ensuring only authorized users can perform sensitive actions.

---

### 12. `event`
A **logging mechanism** that records data on the blockchain for external applications to read.

```solidity
event CreditIssued(uint256 indexed creditId, string projectName, ...);
```

**Why used**: To create an immutable audit trail of every action: issuance, transfers, purchases, and retirements.

---

### 13. `require()`
A **guard function** that checks a condition and reverts the transaction if it's false.

```solidity
require(_tonnesCO2e > 0, "Tonnes CO2e must be greater than zero");
```

**Why used**: To validate inputs, enforce business rules, and prevent invalid state transitions.

---

### 14. `msg.sender`
A **global variable** that holds the address of the account that called the current function.

**Why used**: To determine who is performing an action and verify they have permission (e.g., only the credit owner can retire it).

---

### 15. `payable` (optional)
A keyword that allows a function to **receive ETH** (cryptocurrency).

```solidity
function buyCredit(uint256 _listingId) external payable { ... }
```

**Why used**: The `buyCredit` function needs to receive test ETH from the buyer to pay the seller.

---

## Platform Concepts

### 16. Ownership
The concept that each carbon credit has **exactly one owner** at any given time, identified by their wallet address.

**Why used**: Prevents double counting — a credit can only offset emissions for the entity that currently owns it.

---

### 17. Transfer
Moving ownership of a credit from one address to another, either through **direct transfer** or **marketplace purchase**.

**Why used**: Credits need to be tradable to function as a market instrument.

---

### 18. Retirement
**Permanently removing** a credit from circulation to claim the carbon offset.

**Why used**: Without irreversible retirement, credits could be endlessly re-sold, undermining market integrity.

---

### 19. Immutable Ledger
Once a transaction is recorded on the blockchain, it **cannot be modified or deleted**.

**Why used**: Ensures the entire history of a credit (who issued it, who owned it, when it was retired) is permanently preserved.

---

### 20. Transaction Hash
A **unique identifier** for every transaction on the blockchain (a 66-character hexadecimal string).

**Why used**: Provides a receipt for every action — users can look up any transaction to verify what happened.

---

### 21. Gas
The **computational fee** paid to execute transactions on Ethereum. Measured in "gas units" and paid in ETH.

**Why used**: In testing, gas is free (Hardhat provides 10,000 ETH to each test account). Understanding gas helps design efficient contracts.

---

### 22. Testnet
A **test blockchain** that mimics the real Ethereum network but uses valueless test ETH.

**Why used**: We develop and test on Hardhat's local testnet — no real money is ever used.

---

### 23. Smart Contract Access Control
A **security pattern** that restricts who can call certain functions based on their role.

**Why used**: Only admins can register issuers. Only issuers can create credits. Only owners can retire their credits.

---

### 24. Marketplace
An on-chain **listing and trading system** where credits can be bought and sold.

**Why used**: Simulates a real carbon credit marketplace where supply meets demand.

---

### 25. Decentralized Application (DApp)
A **web application** that interacts with a smart contract through a blockchain wallet (MetaMask).

**Why used**: The React frontend allows users to interact with the smart contract through a visual interface instead of raw function calls.
