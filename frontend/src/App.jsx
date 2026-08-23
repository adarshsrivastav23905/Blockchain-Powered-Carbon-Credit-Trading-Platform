import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import ContractABI from './contracts/CarbonCreditTrading.json'
import './App.css'

// Update this after deploying with: npx hardhat run scripts/deploy.js --network localhost
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const STATUS_MAP = { 0: 'ACTIVE', 1: 'LISTED', 2: 'RETIRED' }
const STATUS_COLORS = { 0: '#10b981', 1: '#f59e0b', 2: '#ef4444' }

function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState('')
  const [activeTab, setActiveTab] = useState('marketplace')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isIssuer, setIsIssuer] = useState(false)

  // Issuer Dashboard State
  const [issuerAddr, setIssuerAddr] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectType, setProjectType] = useState('')
  const [country, setCountry] = useState('')
  const [vintageYear, setVintageYear] = useState('2026')
  const [tonnesCO2e, setTonnesCO2e] = useState('')
  const [ownerAddr, setOwnerAddr] = useState('')
  const [metadataHash, setMetadataHash] = useState('')

  // Marketplace State
  const [listings, setListings] = useState([])

  // Portfolio State
  const [ownedCredits, setOwnedCredits] = useState([])
  const [listPrice, setListPrice] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [retireReason, setRetireReason] = useState('')

  // Notification
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })

  const showNotif = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000)
  }

  // ── Connect Wallet ──────────────────────────────────────────────
  async function connectWallet() {
    try {
      if (!window.ethereum) {
        showNotif('Please install MetaMask!', 'error')
        return
      }
      const prov = new ethers.BrowserProvider(window.ethereum)
      await prov.send('eth_requestAccounts', [])
      const sign = await prov.getSigner()
      const addr = await sign.getAddress()
      const cont = new ethers.Contract(CONTRACT_ADDRESS, ContractABI.abi, sign)

      setProvider(prov)
      setSigner(sign)
      setContract(cont)
      setAccount(addr)

      // Check roles
      const admin = await cont.admin()
      setIsAdmin(admin.toLowerCase() === addr.toLowerCase())
      const issuerStatus = await cont.authorizedIssuers(addr)
      setIsIssuer(issuerStatus)

      showNotif(`Connected: ${addr.slice(0, 6)}...${addr.slice(-4)}`)
    } catch (err) {
      showNotif(err.message || 'Connection failed', 'error')
    }
  }

  // ── Register Issuer ─────────────────────────────────────────────
  async function registerIssuer() {
    try {
      const tx = await contract.registerIssuer(issuerAddr)
      await tx.wait()
      showNotif('Issuer registered successfully!')
      setIssuerAddr('')
    } catch (err) {
      showNotif(err.reason || err.message, 'error')
    }
  }

  // ── Issue Carbon Credit ─────────────────────────────────────────
  async function issueCarbonCredit() {
    try {
      const tx = await contract.issueCarbonCredit(
        projectName, projectType, country,
        parseInt(vintageYear), parseInt(tonnesCO2e),
        ownerAddr, metadataHash || 'QmSimulated'
      )
      await tx.wait()
      showNotif('Carbon credit issued successfully!')
      setProjectName(''); setProjectType(''); setCountry('')
      setTonnesCO2e(''); setOwnerAddr(''); setMetadataHash('')
    } catch (err) {
      showNotif(err.reason || err.message, 'error')
    }
  }

  // ── Load Marketplace Listings ───────────────────────────────────
  async function loadListings() {
    if (!contract) return
    try {
      const nextListing = await contract.nextListingId()
      const items = []
      for (let i = 0; i < Number(nextListing); i++) {
        const listing = await contract.listings(i)
        if (listing.isActive) {
          const credit = await contract.getCreditDetails(Number(listing.creditId))
          items.push({
            listingId: i,
            creditId: Number(listing.creditId),
            seller: listing.seller,
            price: listing.price,
            projectName: credit.projectName,
            projectType: credit.projectType,
            country: credit.country,
            vintageYear: Number(credit.vintageYear),
            tonnesCO2e: Number(credit.tonnesCO2e),
          })
        }
      }
      setListings(items)
    } catch (err) {
      console.error('Error loading listings:', err)
    }
  }

  // ── Load Portfolio ──────────────────────────────────────────────
  async function loadPortfolio() {
    if (!contract || !account) return
    try {
      const creditIds = await contract.getOwnerCredits(account)
      const items = []
      for (const id of creditIds) {
        const credit = await contract.getCreditDetails(Number(id))
        items.push({
          creditId: Number(id),
          projectName: credit.projectName,
          projectType: credit.projectType,
          country: credit.country,
          vintageYear: Number(credit.vintageYear),
          tonnesCO2e: Number(credit.tonnesCO2e),
          status: Number(credit.status),
          retirementReason: credit.retirementReason,
          retiredAt: Number(credit.retiredAt),
        })
      }
      setOwnedCredits(items)
    } catch (err) {
      console.error('Error loading portfolio:', err)
    }
  }

  // ── Buy Credit ──────────────────────────────────────────────────
  async function buyCredit(listingId, price) {
    try {
      const tx = await contract.buyCredit(listingId, { value: price })
      await tx.wait()
      showNotif('Credit purchased successfully!')
      loadListings()
      loadPortfolio()
    } catch (err) {
      showNotif(err.reason || err.message, 'error')
    }
  }

  // ── List Credit for Sale ────────────────────────────────────────
  async function listForSale(creditId) {
    try {
      const priceWei = ethers.parseEther(listPrice)
      const tx = await contract.listCreditForSale(creditId, priceWei)
      await tx.wait()
      showNotif('Credit listed for sale!')
      setListPrice('')
      loadPortfolio()
      loadListings()
    } catch (err) {
      showNotif(err.reason || err.message, 'error')
    }
  }

  // ── Transfer Credit ─────────────────────────────────────────────
  async function transferCredit(creditId) {
    try {
      const tx = await contract.transferCredit(creditId, transferTo)
      await tx.wait()
      showNotif('Credit transferred successfully!')
      setTransferTo('')
      loadPortfolio()
    } catch (err) {
      showNotif(err.reason || err.message, 'error')
    }
  }

  // ── Retire Credit ───────────────────────────────────────────────
  async function retireCredit(creditId) {
    try {
      const tx = await contract.retireCredit(creditId, retireReason || 'Carbon offset')
      await tx.wait()
      showNotif('Credit retired permanently!')
      setRetireReason('')
      loadPortfolio()
    } catch (err) {
      showNotif(err.reason || err.message, 'error')
    }
  }

  // ── Cancel Listing ──────────────────────────────────────────────
  async function cancelListing(creditId) {
    try {
      const listingId = await contract.creditToListing(creditId)
      const tx = await contract.cancelListing(Number(listingId))
      await tx.wait()
      showNotif('Listing cancelled!')
      loadPortfolio()
      loadListings()
    } catch (err) {
      showNotif(err.reason || err.message, 'error')
    }
  }

  useEffect(() => {
    if (contract && activeTab === 'marketplace') loadListings()
    if (contract && activeTab === 'portfolio') loadPortfolio()
  }, [contract, activeTab])

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🌍</span>
            <div>
              <h1>Carbon Credit Trading</h1>
              <p className="subtitle">Blockchain-Powered Platform</p>
            </div>
          </div>
          <div className="wallet-section">
            {account ? (
              <div className="wallet-info">
                <span className="wallet-dot"></span>
                <span className="wallet-addr">{account.slice(0, 6)}...{account.slice(-4)}</span>
                {isAdmin && <span className="badge admin">Admin</span>}
                {isIssuer && <span className="badge issuer">Issuer</span>}
              </div>
            ) : (
              <button className="btn-connect" onClick={connectWallet}>
                🔗 Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav-tabs">
        {[
          { id: 'issuer', label: '🏭 Issuer Dashboard', show: isAdmin || isIssuer },
          { id: 'marketplace', label: '🏪 Marketplace', show: true },
          { id: 'portfolio', label: '📂 Portfolio', show: true },
          { id: 'retirement', label: '♻️ Retirement', show: true },
        ].filter(t => t.show).map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main">
        {!account && (
          <div className="connect-prompt">
            <h2>🔗 Connect Your Wallet</h2>
            <p>Connect MetaMask to interact with the Carbon Credit Trading Platform</p>
            <button className="btn-connect large" onClick={connectWallet}>
              Connect MetaMask
            </button>
          </div>
        )}

        {/* ── ISSUER DASHBOARD ── */}
        {account && activeTab === 'issuer' && (
          <div className="tab-content">
            <h2>🏭 Issuer Dashboard</h2>

            {isAdmin && (
              <div className="card">
                <h3>Register New Issuer</h3>
                <div className="form-row">
                  <input
                    placeholder="Issuer wallet address (0x...)"
                    value={issuerAddr}
                    onChange={e => setIssuerAddr(e.target.value)}
                  />
                  <button className="btn-primary" onClick={registerIssuer}>Register Issuer</button>
                </div>
              </div>
            )}

            {isIssuer && (
              <div className="card">
                <h3>Issue New Carbon Credit</h3>
                <p className="disclaimer">⚠️ Simulated credits — not officially verified</p>
                <div className="form-grid">
                  <input placeholder="Project Name" value={projectName} onChange={e => setProjectName(e.target.value)} />
                  <input placeholder="Project Type (e.g., Renewable Energy)" value={projectType} onChange={e => setProjectType(e.target.value)} />
                  <input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
                  <input type="number" placeholder="Vintage Year" value={vintageYear} onChange={e => setVintageYear(e.target.value)} />
                  <input type="number" placeholder="Tonnes CO₂e" value={tonnesCO2e} onChange={e => setTonnesCO2e(e.target.value)} />
                  <input placeholder="Owner Address (0x...)" value={ownerAddr} onChange={e => setOwnerAddr(e.target.value)} />
                  <input placeholder="Metadata Hash (optional)" value={metadataHash} onChange={e => setMetadataHash(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={issueCarbonCredit} style={{ marginTop: '1rem' }}>
                  🌱 Issue Carbon Credit
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MARKETPLACE ── */}
        {account && activeTab === 'marketplace' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>🏪 Carbon Credit Marketplace</h2>
              <button className="btn-secondary" onClick={loadListings}>🔄 Refresh</button>
            </div>
            {listings.length === 0 ? (
              <div className="empty-state">
                <p>No credits listed for sale. Check back later!</p>
              </div>
            ) : (
              <div className="credits-grid">
                {listings.map(item => (
                  <div key={item.listingId} className="credit-card">
                    <div className="credit-header">
                      <span className="credit-id">#{item.creditId}</span>
                      <span className="credit-badge listed">FOR SALE</span>
                    </div>
                    <h3>{item.projectName}</h3>
                    <div className="credit-details">
                      <div className="detail"><span>Type</span><span>{item.projectType}</span></div>
                      <div className="detail"><span>Country</span><span>{item.country}</span></div>
                      <div className="detail"><span>Vintage</span><span>{item.vintageYear}</span></div>
                      <div className="detail"><span>CO₂e</span><span>{item.tonnesCO2e} tonnes</span></div>
                      <div className="detail price"><span>Price</span><span>{ethers.formatEther(item.price)} ETH</span></div>
                    </div>
                    <p className="seller">Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}</p>
                    {item.seller.toLowerCase() !== account.toLowerCase() && (
                      <button className="btn-buy" onClick={() => buyCredit(item.listingId, item.price)}>
                        🛒 Buy Credit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PORTFOLIO ── */}
        {account && activeTab === 'portfolio' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>📂 My Carbon Credits</h2>
              <button className="btn-secondary" onClick={loadPortfolio}>🔄 Refresh</button>
            </div>
            {ownedCredits.length === 0 ? (
              <div className="empty-state">
                <p>You don't own any carbon credits yet. Buy some from the Marketplace!</p>
              </div>
            ) : (
              <div className="credits-grid">
                {ownedCredits.map(credit => (
                  <div key={credit.creditId} className="credit-card">
                    <div className="credit-header">
                      <span className="credit-id">#{credit.creditId}</span>
                      <span className="credit-badge" style={{ background: STATUS_COLORS[credit.status] }}>
                        {STATUS_MAP[credit.status]}
                      </span>
                    </div>
                    <h3>{credit.projectName}</h3>
                    <div className="credit-details">
                      <div className="detail"><span>Type</span><span>{credit.projectType}</span></div>
                      <div className="detail"><span>Country</span><span>{credit.country}</span></div>
                      <div className="detail"><span>Vintage</span><span>{credit.vintageYear}</span></div>
                      <div className="detail"><span>CO₂e</span><span>{credit.tonnesCO2e} tonnes</span></div>
                    </div>

                    {credit.status === 0 && ( /* ACTIVE */
                      <div className="credit-actions">
                        <div className="action-group">
                          <input placeholder="Price (ETH)" value={listPrice} onChange={e => setListPrice(e.target.value)} />
                          <button className="btn-action list" onClick={() => listForSale(credit.creditId)}>📋 List</button>
                        </div>
                        <div className="action-group">
                          <input placeholder="To address (0x...)" value={transferTo} onChange={e => setTransferTo(e.target.value)} />
                          <button className="btn-action transfer" onClick={() => transferCredit(credit.creditId)}>📤 Transfer</button>
                        </div>
                        <div className="action-group">
                          <input placeholder="Retirement reason" value={retireReason} onChange={e => setRetireReason(e.target.value)} />
                          <button className="btn-action retire" onClick={() => retireCredit(credit.creditId)}>♻️ Retire</button>
                        </div>
                      </div>
                    )}

                    {credit.status === 1 && ( /* LISTED */
                      <button className="btn-action cancel" onClick={() => cancelListing(credit.creditId)}>
                        ❌ Cancel Listing
                      </button>
                    )}

                    {credit.status === 2 && ( /* RETIRED */
                      <div className="retired-info">
                        <p>🔒 Permanently Retired</p>
                        {credit.retirementReason && <p className="reason">Reason: {credit.retirementReason}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RETIREMENT PAGE ── */}
        {account && activeTab === 'retirement' && (
          <div className="tab-content">
            <h2>♻️ Retired Carbon Credits</h2>
            <p className="section-desc">Credits permanently retired from circulation — used to offset emissions.</p>
            {ownedCredits.filter(c => c.status === 2).length === 0 ? (
              <div className="empty-state">
                <p>No retired credits. Retire credits from your Portfolio to offset emissions.</p>
              </div>
            ) : (
              <div className="credits-grid">
                {ownedCredits.filter(c => c.status === 2).map(credit => (
                  <div key={credit.creditId} className="credit-card retired-card">
                    <div className="credit-header">
                      <span className="credit-id">#{credit.creditId}</span>
                      <span className="credit-badge" style={{ background: '#ef4444' }}>RETIRED</span>
                    </div>
                    <h3>{credit.projectName}</h3>
                    <div className="credit-details">
                      <div className="detail"><span>Type</span><span>{credit.projectType}</span></div>
                      <div className="detail"><span>Country</span><span>{credit.country}</span></div>
                      <div className="detail"><span>CO₂e</span><span>{credit.tonnesCO2e} tonnes</span></div>
                      <div className="detail"><span>Retired</span><span>{credit.retiredAt > 0 ? new Date(credit.retiredAt * 1000).toLocaleDateString() : '—'}</span></div>
                      {credit.retirementReason && (
                        <div className="detail"><span>Reason</span><span>{credit.retirementReason}</span></div>
                      )}
                    </div>
                    <div className="retired-badge-large">🔒 Cannot be traded or transferred</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>🌍 Blockchain-Powered Carbon Credit Trading Platform — Student Project</p>
        <p className="footer-disclaimer">All carbon credits are simulated for educational purposes only.</p>
      </footer>
    </div>
  )
}

export default App
