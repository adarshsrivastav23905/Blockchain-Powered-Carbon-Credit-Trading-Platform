// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CarbonCreditTrading
 * @author Student Project — Blockchain-Powered Carbon Credit Trading Platform
 * @notice A simulated carbon credit trading platform for educational purposes.
 *         This contract does NOT create legally recognized or officially verified carbon credits.
 *         All carbon credits are simulated for demonstration of blockchain concepts.
 * @dev Implements role-based access control, credit lifecycle management,
 *      marketplace trading, and irreversible retirement.
 */
contract CarbonCreditTrading {

    // =========================================================================
    //                              ENUMS
    // =========================================================================

    /**
     * @notice Represents the lifecycle status of a carbon credit.
     * @dev Status transitions:
     *      ACTIVE → LISTED (when listed for sale)
     *      LISTED → ACTIVE (when listing cancelled or purchased)
     *      ACTIVE → TRANSFERRED (intermediate state during transfer, then back to ACTIVE for new owner)
     *      ACTIVE → RETIRED (irreversible — credit is permanently retired)
     */
    enum CreditStatus {
        ACTIVE,       // Credit is active and held by owner
        LISTED,       // Credit is listed on the marketplace for sale
        RETIRED       // Credit is permanently retired — cannot be traded or transferred
    }

    // =========================================================================
    //                              STRUCTS
    // =========================================================================

    /**
     * @notice Represents a single carbon credit token with full metadata.
     * @dev Each credit has a unique ID and tracks its lifecycle from issuance to retirement.
     *
     * Fields:
     * - creditId:     Unique identifier for this carbon credit
     * - projectName:  Name of the carbon reduction project (e.g., "Solar Energy Farm")
     * - projectType:  Type of project (e.g., "Renewable Energy", "Reforestation")
     * - country:      Country/location where the project is based
     * - vintageYear:  The year the carbon reduction occurred
     * - tonnesCO2e:   Amount of CO2 equivalent in tonnes this credit represents
     * - issuer:       Address of the authorized issuer who created this credit
     * - owner:        Current owner's wallet address
     * - metadataHash: Hash/reference to off-chain metadata (e.g., IPFS hash)
     * - status:       Current lifecycle status (ACTIVE, LISTED, RETIRED)
     * - createdAt:    Timestamp when the credit was issued
     * - retiredAt:    Timestamp when the credit was retired (0 if not retired)
     * - retirementReason: Purpose or beneficiary for retirement (empty if not retired)
     */
    struct CarbonCredit {
        uint256 creditId;
        string projectName;
        string projectType;
        string country;
        uint256 vintageYear;
        uint256 tonnesCO2e;
        address issuer;
        address owner;
        string metadataHash;
        CreditStatus status;
        uint256 createdAt;
        uint256 retiredAt;
        string retirementReason;
    }

    /**
     * @notice Represents a marketplace listing for a carbon credit.
     * @dev A listing ties a credit to a seller and price. Only one active listing per credit.
     *
     * Fields:
     * - creditId: The credit being sold
     * - seller:   Address of the seller (must be the credit owner)
     * - price:    Sale price in wei (test ETH)
     * - isActive: Whether this listing is currently active
     */
    struct Listing {
        uint256 creditId;
        address seller;
        uint256 price;
        bool isActive;
    }

    // =========================================================================
    //                           STATE VARIABLES
    // =========================================================================

    /// @notice The admin address (deployer) who can register issuers
    address public admin;

    /// @notice Counter for generating unique credit IDs
    uint256 public nextCreditId;

    /// @notice Counter for generating unique listing IDs
    uint256 public nextListingId;

    /// @notice Reentrancy guard state variable
    bool private _locked;

    /// @notice Mapping of address → whether they are an authorized issuer
    mapping(address => bool) public authorizedIssuers;

    /// @notice Mapping of creditId → CarbonCredit struct (private to avoid 13-element stack-too-deep getter; use getCreditDetails)
    mapping(uint256 => CarbonCredit) private carbonCredits;

    /// @notice Mapping of listingId → Listing struct
    mapping(uint256 => Listing) public listings;

    /// @notice Mapping of creditId → active listingId (0 means not listed)
    mapping(uint256 => uint256) public creditToListing;

    /// @notice Mapping of owner address → array of credit IDs they own
    mapping(address => uint256[]) private ownerCredits;

    // =========================================================================
    //                              EVENTS
    // =========================================================================

    /// @notice Emitted when a new issuer is registered by the admin
    event IssuerRegistered(address indexed issuer, uint256 timestamp);

    /// @notice Emitted when a new carbon credit is issued
    event CreditIssued(
        uint256 indexed creditId,
        string projectName,
        uint256 tonnesCO2e,
        address indexed issuer,
        address indexed owner,
        uint256 timestamp
    );

    /// @notice Emitted when a credit is listed for sale on the marketplace
    event CreditListed(
        uint256 indexed creditId,
        uint256 indexed listingId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    /// @notice Emitted when a marketplace listing is cancelled
    event ListingCancelled(
        uint256 indexed creditId,
        uint256 indexed listingId,
        address indexed seller,
        uint256 timestamp
    );

    /// @notice Emitted when a credit is purchased from the marketplace
    event CreditPurchased(
        uint256 indexed creditId,
        uint256 indexed listingId,
        address indexed buyer,
        address seller,
        uint256 price,
        uint256 timestamp
    );

    /// @notice Emitted when a credit is transferred between addresses
    event CreditTransferred(
        uint256 indexed creditId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    /// @notice Emitted when a credit is permanently retired
    event CreditRetired(
        uint256 indexed creditId,
        address indexed owner,
        uint256 tonnesCO2e,
        string reason,
        uint256 timestamp
    );

    // =========================================================================
    //                             MODIFIERS
    // =========================================================================

    /// @notice Restricts function access to the contract admin (deployer)
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    /// @notice Restricts function access to authorized issuers
    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender], "Only authorized issuers can perform this action");
        _;
    }

    /// @notice Restricts function access to the current owner of a specific credit
    modifier onlyCreditOwner(uint256 _creditId) {
        require(_creditId < nextCreditId, "Credit does not exist");
        require(carbonCredits[_creditId].owner == msg.sender, "Only credit owner can perform this action");
        _;
    }

    /// @notice Prevents reentrancy attacks on functions that transfer ETH
    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    // =========================================================================
    //                            CONSTRUCTOR
    // =========================================================================

    /**
     * @notice Deploys the contract and sets the deployer as admin.
     * @dev The admin is the only address that can register issuers.
     *      Credit ID and listing ID counters start at 0.
     */
    constructor() {
        admin = msg.sender;
        nextCreditId = 0;
        nextListingId = 0;
    }

    // =========================================================================
    //                        ISSUER MANAGEMENT
    // =========================================================================

    /**
     * @notice Registers a new authorized issuer.
     * @dev Only the admin can call this function.
     *      An issuer is an address authorized to create new carbon credits.
     *
     * @param _issuer The address to register as an authorized issuer.
     *
     * Requirements:
     * - Caller must be admin
     * - Issuer address must not be the zero address
     * - Issuer must not already be registered
     *
     * Emits an {IssuerRegistered} event.
     */
    function registerIssuer(address _issuer) external onlyAdmin {
        require(_issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[_issuer], "Issuer already registered");

        authorizedIssuers[_issuer] = true;

        emit IssuerRegistered(_issuer, block.timestamp);
    }

    // =========================================================================
    //                        CREDIT ISSUANCE
    // =========================================================================

    /**
     * @notice Issues a new simulated carbon credit.
     * @dev Only authorized issuers can call this function.
     *      Creates a new CarbonCredit struct and assigns it to the specified owner.
     *      The credit starts in ACTIVE status.
     *
     * @param _projectName  Name of the carbon reduction project
     * @param _projectType  Type of project (e.g., "Renewable Energy")
     * @param _country      Country where the project is located
     * @param _vintageYear  Year of the carbon reduction
     * @param _tonnesCO2e   Amount of CO2e in tonnes
     * @param _owner        Initial owner of the credit
     * @param _metadataHash Hash/reference to off-chain project metadata
     *
     * Requirements:
     * - Caller must be an authorized issuer
     * - tonnesCO2e must be greater than zero
     * - Owner address must not be the zero address
     *
     * Emits a {CreditIssued} event.
     */
    function issueCarbonCredit(
        string memory _projectName,
        string memory _projectType,
        string memory _country,
        uint256 _vintageYear,
        uint256 _tonnesCO2e,
        address _owner,
        string memory _metadataHash
    ) external onlyIssuer {
        require(_tonnesCO2e > 0, "Tonnes CO2e must be greater than zero");
        require(_owner != address(0), "Invalid owner address");

        uint256 creditId = nextCreditId;

        CarbonCredit storage credit = carbonCredits[creditId];
        credit.creditId = creditId;
        credit.projectName = _projectName;
        credit.projectType = _projectType;
        credit.country = _country;
        credit.vintageYear = _vintageYear;
        credit.tonnesCO2e = _tonnesCO2e;
        credit.issuer = msg.sender;
        credit.owner = _owner;
        credit.metadataHash = _metadataHash;
        credit.status = CreditStatus.ACTIVE;
        credit.createdAt = block.timestamp;
        credit.retiredAt = 0;
        credit.retirementReason = "";

        ownerCredits[_owner].push(creditId);
        nextCreditId++;

        emit CreditIssued(creditId, _projectName, _tonnesCO2e, msg.sender, _owner, block.timestamp);
    }

    // =========================================================================
    //                         CREDIT QUERIES
    // =========================================================================

    /**
     * @notice Retrieves full details of a carbon credit.
     * @param _creditId The ID of the credit to query
     * @return The CarbonCredit struct with all fields
     */
    function getCreditDetails(uint256 _creditId) external view returns (CarbonCredit memory) {
        require(_creditId < nextCreditId, "Credit does not exist");
        return carbonCredits[_creditId];
    }

    /**
     * @notice Retrieves all credit IDs owned by a specific address.
     * @param _owner The address to query
     * @return Array of credit IDs owned by the address
     */
    function getOwnerCredits(address _owner) external view returns (uint256[] memory) {
        return ownerCredits[_owner];
    }

    /**
     * @notice Returns the total number of credits issued.
     * @return The total count of carbon credits
     */
    function getTotalCredits() external view returns (uint256) {
        return nextCreditId;
    }

    // =========================================================================
    //                        MARKETPLACE LOGIC
    // =========================================================================

    /**
     * @notice Lists a carbon credit for sale on the marketplace.
     * @dev Only the credit owner can list. Retired credits cannot be listed.
     *
     * @param _creditId The ID of the credit to list
     * @param _price    The sale price in wei (must be > 0)
     *
     * Requirements:
     * - Caller must be the credit owner
     * - Credit must not be RETIRED
     * - Credit must not already be LISTED
     * - Price must be greater than zero
     *
     * Emits a {CreditListed} event.
     */
    function listCreditForSale(uint256 _creditId, uint256 _price)
        external
        onlyCreditOwner(_creditId)
    {
        CarbonCredit storage credit = carbonCredits[_creditId];

        require(credit.status != CreditStatus.RETIRED, "Cannot list a retired credit");
        require(credit.status != CreditStatus.LISTED, "Credit is already listed");
        require(_price > 0, "Price must be greater than zero");

        uint256 listingId = nextListingId;

        listings[listingId] = Listing({
            creditId: _creditId,
            seller: msg.sender,
            price: _price,
            isActive: true
        });

        creditToListing[_creditId] = listingId;
        credit.status = CreditStatus.LISTED;
        nextListingId++;

        emit CreditListed(_creditId, listingId, msg.sender, _price, block.timestamp);
    }

    /**
     * @notice Cancels an active marketplace listing.
     * @dev Only the seller (credit owner) can cancel their listing.
     *      Restores the credit status to ACTIVE.
     *
     * @param _listingId The ID of the listing to cancel
     *
     * Requirements:
     * - Listing must exist and be active
     * - Caller must be the seller
     *
     * Emits a {ListingCancelled} event.
     */
    function cancelListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];

        require(listing.isActive, "Listing is not active");
        require(listing.seller == msg.sender, "Only the seller can cancel the listing");

        listing.isActive = false;
        carbonCredits[listing.creditId].status = CreditStatus.ACTIVE;

        emit ListingCancelled(listing.creditId, _listingId, msg.sender, block.timestamp);
    }

    /**
     * @notice Purchases a listed carbon credit from the marketplace.
     * @dev Transfers ownership from seller to buyer. Sends payment to seller.
     *      Uses checks-effects-interactions pattern and reentrancy guard.
     *
     * @param _listingId The ID of the listing to purchase
     *
     * Requirements:
     * - Listing must be active
     * - Buyer must send exact price in msg.value
     * - Buyer cannot be the seller
     * - Credit must not be RETIRED
     *
     * Emits a {CreditPurchased} event.
     */
    function buyCredit(uint256 _listingId) external payable nonReentrant {
        Listing storage listing = listings[_listingId];

        require(listing.isActive, "Listing is not active");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(msg.sender != listing.seller, "Seller cannot buy their own credit");

        uint256 creditId = listing.creditId;
        CarbonCredit storage credit = carbonCredits[creditId];

        require(credit.status != CreditStatus.RETIRED, "Cannot buy a retired credit");

        // --- Effects: Update state BEFORE external call ---
        address seller = listing.seller;
        uint256 price = listing.price;

        listing.isActive = false;
        credit.owner = msg.sender;
        credit.status = CreditStatus.ACTIVE;

        // Update ownership tracking
        _removeFromOwnerCredits(seller, creditId);
        ownerCredits[msg.sender].push(creditId);

        // --- Interaction: Transfer funds to seller ---
        (bool success, ) = payable(seller).call{value: price}("");
        require(success, "Payment transfer failed");

        emit CreditPurchased(creditId, _listingId, msg.sender, seller, price, block.timestamp);
    }

    // =========================================================================
    //                        TRANSFER LOGIC
    // =========================================================================

    /**
     * @notice Transfers a carbon credit to another address.
     * @dev Direct transfer without marketplace — useful for gifting or internal transfers.
     *
     * @param _creditId The ID of the credit to transfer
     * @param _to       The recipient's address
     *
     * Requirements:
     * - Caller must be the credit owner
     * - Credit must not be RETIRED
     * - Credit must not be LISTED (cancel listing first)
     * - Recipient must not be the zero address
     * - Recipient must not be the current owner
     *
     * Emits a {CreditTransferred} event.
     */
    function transferCredit(uint256 _creditId, address _to)
        external
        onlyCreditOwner(_creditId)
    {
        require(_to != address(0), "Invalid recipient address");
        require(_to != msg.sender, "Cannot transfer to yourself");

        CarbonCredit storage credit = carbonCredits[_creditId];

        require(credit.status != CreditStatus.RETIRED, "Cannot transfer a retired credit");
        require(credit.status != CreditStatus.LISTED, "Cancel listing before transferring");

        address from = credit.owner;
        credit.owner = _to;

        // Update ownership tracking
        _removeFromOwnerCredits(from, _creditId);
        ownerCredits[_to].push(_creditId);

        emit CreditTransferred(_creditId, from, _to, block.timestamp);
    }

    // =========================================================================
    //                        RETIREMENT LOGIC
    // =========================================================================

    /**
     * @notice Permanently retires a carbon credit.
     * @dev Retirement is IRREVERSIBLE. Once retired, a credit cannot be traded,
     *      transferred, or listed again. This simulates the real-world process
     *      where retiring a carbon credit means it has been "used" to offset
     *      emissions and must be removed from circulation.
     *
     * @param _creditId The ID of the credit to retire
     * @param _reason   Purpose or beneficiary of the retirement (e.g., "Offset Q1 2026 emissions")
     *
     * Requirements:
     * - Caller must be the credit owner
     * - Credit must not already be RETIRED
     * - Credit must not be LISTED (cancel listing first)
     *
     * Emits a {CreditRetired} event.
     */
    function retireCredit(uint256 _creditId, string memory _reason)
        external
        onlyCreditOwner(_creditId)
    {
        CarbonCredit storage credit = carbonCredits[_creditId];

        require(credit.status != CreditStatus.RETIRED, "Credit is already retired");
        require(credit.status != CreditStatus.LISTED, "Cancel listing before retiring");

        credit.status = CreditStatus.RETIRED;
        credit.retiredAt = block.timestamp;
        credit.retirementReason = _reason;

        emit CreditRetired(_creditId, msg.sender, credit.tonnesCO2e, _reason, block.timestamp);
    }

    // =========================================================================
    //                      INTERNAL HELPER FUNCTIONS
    // =========================================================================

    /**
     * @notice Removes a credit ID from the owner's credit array.
     * @dev Swaps the target element with the last element and pops.
     *      This is gas-efficient but does not preserve order.
     *
     * @param _owner    The owner address to update
     * @param _creditId The credit ID to remove
     */
    function _removeFromOwnerCredits(address _owner, uint256 _creditId) internal {
        uint256[] storage credits = ownerCredits[_owner];
        for (uint256 i = 0; i < credits.length; i++) {
            if (credits[i] == _creditId) {
                credits[i] = credits[credits.length - 1];
                credits.pop();
                break;
            }
        }
    }
}
