/**
 * @title CarbonCreditTrading — Automated Test Suite
 * @description Comprehensive tests covering all smart contract functionality:
 *   - Role management (admin, issuer)
 *   - Carbon credit issuance
 *   - Marketplace operations (list, cancel, buy)
 *   - Ownership transfer
 *   - Credit retirement
 *   - Security checks and edge cases
 *   - Event emission verification
 *
 * Test Accounts:
 *   Account 0 = Admin (deployer)
 *   Account 1 = Issuer (authorized by admin)
 *   Account 2 = Seller / Initial Credit Owner
 *   Account 3 = Buyer
 *   Account 4 = Unauthorized User
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCreditTrading", function () {
  let contract;
  let admin, issuer, seller, buyer, unauthorized;

  // Deploy a fresh contract before each test
  beforeEach(async function () {
    [admin, issuer, seller, buyer, unauthorized] = await ethers.getSigners();

    const CarbonCreditTrading = await ethers.getContractFactory("CarbonCreditTrading");
    contract = await CarbonCreditTrading.deploy();
    await contract.waitForDeployment();
  });

  // =========================================================================
  //  HELPER: Register issuer and issue a credit for tests that need one
  // =========================================================================
  async function setupIssuerAndCredit() {
    // Admin registers issuer
    await contract.connect(admin).registerIssuer(issuer.address);

    // Issuer creates a carbon credit owned by seller
    await contract.connect(issuer).issueCarbonCredit(
      "Solar Energy Farm",       // projectName
      "Renewable Energy",        // projectType
      "India",                   // country
      2026,                      // vintageYear
      10,                        // tonnesCO2e
      seller.address,            // owner
      "QmSimulatedHash123"       // metadataHash
    );
  }

  // =========================================================================
  //  1. ISSUER REGISTRATION
  // =========================================================================

  describe("Issuer Registration", function () {

    it("1. Admin should register an issuer successfully", async function () {
      // Action: Admin registers a new issuer
      const tx = await contract.connect(admin).registerIssuer(issuer.address);

      // Verify: Issuer is now authorized
      expect(await contract.authorizedIssuers(issuer.address)).to.equal(true);

      // Verify: Event emitted
      await expect(tx)
        .to.emit(contract, "IssuerRegistered")
        .withArgs(issuer.address, await getBlockTimestamp(tx));
    });

    it("2. Unauthorized user should NOT be able to register an issuer", async function () {
      // Action + Expected: Revert when non-admin tries to register
      await expect(
        contract.connect(unauthorized).registerIssuer(issuer.address)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should not register zero address as issuer", async function () {
      await expect(
        contract.connect(admin).registerIssuer(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid issuer address");
    });

    it("Should not register an already registered issuer", async function () {
      await contract.connect(admin).registerIssuer(issuer.address);
      await expect(
        contract.connect(admin).registerIssuer(issuer.address)
      ).to.be.revertedWith("Issuer already registered");
    });
  });

  // =========================================================================
  //  2. CARBON CREDIT ISSUANCE
  // =========================================================================

  describe("Carbon Credit Issuance", function () {

    beforeEach(async function () {
      // Register issuer before each issuance test
      await contract.connect(admin).registerIssuer(issuer.address);
    });

    it("3. Authorized issuer should create a carbon credit", async function () {
      // Action: Issuer creates a carbon credit
      const tx = await contract.connect(issuer).issueCarbonCredit(
        "Solar Energy Farm",
        "Renewable Energy",
        "India",
        2026,
        10,
        seller.address,
        "QmSimulatedHash123"
      );

      // Verify: Credit exists with correct details
      const credit = await contract.getCreditDetails(0);
      expect(credit.creditId).to.equal(0);
      expect(credit.projectName).to.equal("Solar Energy Farm");
      expect(credit.projectType).to.equal("Renewable Energy");
      expect(credit.country).to.equal("India");
      expect(credit.vintageYear).to.equal(2026);
      expect(credit.tonnesCO2e).to.equal(10);
      expect(credit.issuer).to.equal(issuer.address);
      expect(credit.owner).to.equal(seller.address);
      expect(credit.status).to.equal(0); // ACTIVE = 0

      // Verify: Event emitted
      await expect(tx).to.emit(contract, "CreditIssued");
    });

    it("4. Unauthorized address should NOT be able to issue credits", async function () {
      await expect(
        contract.connect(unauthorized).issueCarbonCredit(
          "Fake Project", "Unknown", "Nowhere", 2026, 10,
          seller.address, "QmFakeHash"
        )
      ).to.be.revertedWith("Only authorized issuers can perform this action");
    });

    it("5. Zero-tonne credit should be rejected", async function () {
      await expect(
        contract.connect(issuer).issueCarbonCredit(
          "Solar Farm", "Renewable Energy", "India", 2026,
          0, // zero tonnes
          seller.address, "QmHash"
        )
      ).to.be.revertedWith("Tonnes CO2e must be greater than zero");
    });

    it("Should reject issuance to zero address", async function () {
      await expect(
        contract.connect(issuer).issueCarbonCredit(
          "Solar Farm", "Renewable Energy", "India", 2026,
          10, ethers.ZeroAddress, "QmHash"
        )
      ).to.be.revertedWith("Invalid owner address");
    });
  });

  // =========================================================================
  //  3. MARKETPLACE LISTING
  // =========================================================================

  describe("Marketplace Listing", function () {

    beforeEach(async function () {
      await setupIssuerAndCredit();
    });

    it("6. Owner should list credit for sale", async function () {
      const price = ethers.parseEther("1.0"); // 1 ETH

      const tx = await contract.connect(seller).listCreditForSale(0, price);

      // Verify: Credit status is LISTED
      const credit = await contract.getCreditDetails(0);
      expect(credit.status).to.equal(1); // LISTED = 1

      // Verify: Listing exists
      const listing = await contract.listings(0);
      expect(listing.creditId).to.equal(0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.isActive).to.equal(true);

      // Verify: Event emitted
      await expect(tx).to.emit(contract, "CreditListed");
    });

    it("7. Non-owner should NOT be able to list a credit", async function () {
      await expect(
        contract.connect(buyer).listCreditForSale(0, ethers.parseEther("1.0"))
      ).to.be.revertedWith("Only credit owner can perform this action");
    });

    it("Should reject listing with zero price", async function () {
      await expect(
        contract.connect(seller).listCreditForSale(0, 0)
      ).to.be.revertedWith("Price must be greater than zero");
    });

    it("Should cancel listing successfully", async function () {
      await contract.connect(seller).listCreditForSale(0, ethers.parseEther("1.0"));

      const tx = await contract.connect(seller).cancelListing(0);

      // Verify: Credit status is back to ACTIVE
      const credit = await contract.getCreditDetails(0);
      expect(credit.status).to.equal(0); // ACTIVE = 0

      // Verify: Listing is inactive
      const listing = await contract.listings(0);
      expect(listing.isActive).to.equal(false);

      await expect(tx).to.emit(contract, "ListingCancelled");
    });
  });

  // =========================================================================
  //  4. PURCHASING
  // =========================================================================

  describe("Credit Purchase", function () {

    beforeEach(async function () {
      await setupIssuerAndCredit();
      // List credit for 1 ETH
      await contract.connect(seller).listCreditForSale(0, ethers.parseEther("1.0"));
    });

    it("8. Buyer should purchase a listed credit", async function () {
      const price = ethers.parseEther("1.0");

      const tx = await contract.connect(buyer).buyCredit(0, { value: price });

      // Verify: Event emitted
      await expect(tx).to.emit(contract, "CreditPurchased");
    });

    it("9. Ownership should change after purchase", async function () {
      const price = ethers.parseEther("1.0");

      await contract.connect(buyer).buyCredit(0, { value: price });

      // Verify: New owner is buyer
      const credit = await contract.getCreditDetails(0);
      expect(credit.owner).to.equal(buyer.address);
      expect(credit.status).to.equal(0); // ACTIVE = 0
    });

    it("10. Seller should receive test payment", async function () {
      const price = ethers.parseEther("1.0");

      // Record seller balance before purchase
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await contract.connect(buyer).buyCredit(0, { value: price });

      // Record seller balance after purchase
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);

      // Verify: Seller received the payment
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(price);
    });

    it("11. Listing should close after successful purchase", async function () {
      const price = ethers.parseEther("1.0");

      await contract.connect(buyer).buyCredit(0, { value: price });

      // Verify: Listing is no longer active
      const listing = await contract.listings(0);
      expect(listing.isActive).to.equal(false);
    });

    it("Should reject purchase with incorrect payment", async function () {
      await expect(
        contract.connect(buyer).buyCredit(0, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("17. Double purchase should be prevented", async function () {
      const price = ethers.parseEther("1.0");

      // First purchase succeeds
      await contract.connect(buyer).buyCredit(0, { value: price });

      // Second purchase fails — listing is no longer active
      await expect(
        contract.connect(unauthorized).buyCredit(0, { value: price })
      ).to.be.revertedWith("Listing is not active");
    });
  });

  // =========================================================================
  //  5. TRANSFER
  // =========================================================================

  describe("Credit Transfer", function () {

    beforeEach(async function () {
      await setupIssuerAndCredit();
    });

    it("12. Owner should transfer an active credit", async function () {
      const tx = await contract.connect(seller).transferCredit(0, buyer.address);

      // Verify: New owner is buyer
      const credit = await contract.getCreditDetails(0);
      expect(credit.owner).to.equal(buyer.address);

      // Verify: Event emitted
      await expect(tx)
        .to.emit(contract, "CreditTransferred")
        .withArgs(0, seller.address, buyer.address, await getBlockTimestamp(tx));
    });

    it("Should reject transfer of listed credit", async function () {
      await contract.connect(seller).listCreditForSale(0, ethers.parseEther("1.0"));

      await expect(
        contract.connect(seller).transferCredit(0, buyer.address)
      ).to.be.revertedWith("Cancel listing before transferring");
    });
  });

  // =========================================================================
  //  6. RETIREMENT
  // =========================================================================

  describe("Credit Retirement", function () {

    beforeEach(async function () {
      await setupIssuerAndCredit();
    });

    it("13. Owner should retire a credit successfully", async function () {
      const tx = await contract.connect(seller).retireCredit(0, "Offset Q1 2026 emissions");

      // Verify: Credit is retired
      const credit = await contract.getCreditDetails(0);
      expect(credit.status).to.equal(2); // RETIRED = 2
      expect(credit.retirementReason).to.equal("Offset Q1 2026 emissions");
      expect(credit.retiredAt).to.be.greaterThan(0);

      // Verify: Event emitted
      await expect(tx).to.emit(contract, "CreditRetired");
    });

    it("14. Non-owner should NOT be able to retire a credit", async function () {
      await expect(
        contract.connect(buyer).retireCredit(0, "Unauthorized retirement")
      ).to.be.revertedWith("Only credit owner can perform this action");
    });

    it("15. Retired credit should NOT be transferable", async function () {
      // Retire the credit
      await contract.connect(seller).retireCredit(0, "Testing retirement");

      // Attempt transfer — should fail
      await expect(
        contract.connect(seller).transferCredit(0, buyer.address)
      ).to.be.revertedWith("Cannot transfer a retired credit");
    });

    it("16. Retired credit should NOT be listable", async function () {
      // Retire the credit
      await contract.connect(seller).retireCredit(0, "Testing retirement");

      // Attempt listing — should fail
      await expect(
        contract.connect(seller).listCreditForSale(0, ethers.parseEther("1.0"))
      ).to.be.revertedWith("Cannot list a retired credit");
    });

    it("Should not retire an already retired credit", async function () {
      await contract.connect(seller).retireCredit(0, "First retirement");

      await expect(
        contract.connect(seller).retireCredit(0, "Double retirement attempt")
      ).to.be.revertedWith("Credit is already retired");
    });
  });

  // =========================================================================
  //  7. EVENT EMISSION
  // =========================================================================

  describe("Event Emission Verification", function () {

    it("18. All events should be emitted correctly throughout lifecycle", async function () {
      // Step 1: Register issuer — emits IssuerRegistered
      const tx1 = await contract.connect(admin).registerIssuer(issuer.address);
      await expect(tx1).to.emit(contract, "IssuerRegistered");

      // Step 2: Issue credit — emits CreditIssued
      const tx2 = await contract.connect(issuer).issueCarbonCredit(
        "Wind Farm", "Renewable Energy", "Germany", 2026,
        50, seller.address, "QmWindFarmHash"
      );
      await expect(tx2).to.emit(contract, "CreditIssued");

      // Step 3: List credit — emits CreditListed
      const tx3 = await contract.connect(seller).listCreditForSale(0, ethers.parseEther("2.0"));
      await expect(tx3).to.emit(contract, "CreditListed");

      // Step 4: Cancel listing — emits ListingCancelled
      const tx4 = await contract.connect(seller).cancelListing(0);
      await expect(tx4).to.emit(contract, "ListingCancelled");

      // Step 5: Re-list and buy — emits CreditPurchased
      await contract.connect(seller).listCreditForSale(0, ethers.parseEther("2.0"));
      const tx5 = await contract.connect(buyer).buyCredit(1, { value: ethers.parseEther("2.0") });
      await expect(tx5).to.emit(contract, "CreditPurchased");

      // Step 6: Transfer — emits CreditTransferred
      // Issue another credit for transfer test
      await contract.connect(issuer).issueCarbonCredit(
        "Reforestation", "Nature-Based", "Brazil", 2025,
        25, seller.address, "QmReforestHash"
      );
      const tx6 = await contract.connect(seller).transferCredit(1, buyer.address);
      await expect(tx6).to.emit(contract, "CreditTransferred");

      // Step 7: Retire — emits CreditRetired
      const tx7 = await contract.connect(buyer).retireCredit(0, "Annual carbon offset");
      await expect(tx7).to.emit(contract, "CreditRetired");
    });
  });

  // =========================================================================
  //  8. OWNERSHIP TRACKING
  // =========================================================================

  describe("Ownership Tracking", function () {

    it("Should track owner credits correctly", async function () {
      await setupIssuerAndCredit();

      // Seller should own credit 0
      const sellerCredits = await contract.getOwnerCredits(seller.address);
      expect(sellerCredits.length).to.equal(1);
      expect(sellerCredits[0]).to.equal(0);

      // After transfer, buyer should own it
      await contract.connect(seller).transferCredit(0, buyer.address);

      const sellerCreditsAfter = await contract.getOwnerCredits(seller.address);
      expect(sellerCreditsAfter.length).to.equal(0);

      const buyerCredits = await contract.getOwnerCredits(buyer.address);
      expect(buyerCredits.length).to.equal(1);
      expect(buyerCredits[0]).to.equal(0);
    });
  });

  // =========================================================================
  //  UTILITY FUNCTIONS
  // =========================================================================

  /**
   * Helper: Get the block timestamp from a transaction receipt
   */
  async function getBlockTimestamp(tx) {
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);
    return block.timestamp;
  }
});
