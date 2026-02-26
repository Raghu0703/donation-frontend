import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// Base64 images will be injected below
const DONATION_IMG = "https://www.wikihow.com/images/thumb/0/01/Help-the-People-in-Need-Step-1-Version-3.jpg/v4-460px-Help-the-People-in-Need-Step-1-Version-3.jpg";

const LINK2_IMG = "https://www.2moda.com/cdn/shop/articles/2Moda-211499-Items-Donate-Charities-Blogbanner1.jpg?v=1675273009";

const items = [
  { id: 1, name: 'Clothing Items', category: 'clothing', needed: 250, donated: 120 },
  { id: 2, name: 'Food Supplies', category: 'food', needed: 800, donated: 450 },
  { id: 3, name: 'Medical Kits', category: 'medical', needed: 350, donated: 200 },
  { id: 4, name: 'School Books', category: 'education', needed: 500, donated: 320 },
  { id: 5, name: 'Baby Products', category: 'baby', needed: 180, donated: 90 },
  { id: 6, name: 'Household Items', category: 'household', needed: 420, donated: 280 },
  { id: 7, name: 'Electronics', category: 'electronics', needed: 75, donated: 45 },
  { id: 8, name: 'Personal Care', category: 'personal', needed: 300, donated: 210 }
];

const mockUsers = {
  donor: [{ name: 'Alice', email: 'alice@donor.com', password: 'donor123' }],
  receiver: [{ name: 'Bob', email: 'bob@receiver.com', password: 'receiver123' }],
  admin: [{ name: 'Admin', email: 'admin@donatehub.com', password: 'admin123' }],
};

const today = () => new Date().toISOString().split('T')[0];

function LoginModal({ role, onSuccess, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const roleLabel = role === 'donor' ? '💝 Donor' : role === 'receiver' ? '📋 Receiver' : '👨‍💼 Admin';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const users = mockUsers[role];
    if (isRegister) {
      if (!form.name || !form.email || !form.password) { setError('Please fill all fields.'); return; }
      if (role === 'admin') { setError('Admin registration is not allowed.'); return; }
      onSuccess({ name: form.name, email: form.email, role });
    } else {
      const found = users.find(u => u.email === form.email && u.password === form.password);
      if (!found) { setError('Invalid email or password.'); return; }
      onSuccess({ name: found.name, email: found.email, role });
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
        <h2 style={styles.modalTitle}>{roleLabel} Login</h2>
        <p style={styles.modalSub}>
          {isRegister ? 'Create your account to get started' : 'Sign in to access your portal'}
        </p>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {isRegister && (
            <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} style={styles.input} required />
          )}
          <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} style={styles.input} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} style={styles.input} required />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.loginBtn}>
            {isRegister ? 'Create Account 🚀' : 'Login →'}
          </button>
        </form>
        {role !== 'admin' && (
          <p style={styles.switchText}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span style={styles.switchLink} onClick={() => { setIsRegister(!isRegister); setError(''); }}>
              {isRegister ? 'Sign In' : 'Register'}
            </span>
          </p>
        )}
        <p style={styles.demoHint}>
          Demo — Email: <b>{mockUsers[role][0].email}</b> | Pass: <b>{mockUsers[role][0].password}</b>
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive activePortal from URL path
  const pathToPortal = {
    '/': 'home',
    '/donor': 'donor',
    '/receiver': 'receiver',
    '/admin': 'admin',
  };
  const activePortal = pathToPortal[location.pathname] || 'home';

  const [loginTarget, setLoginTarget] = useState(null);
  const [loggedIn, setLoggedIn] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', quantity: '', address: '', phone: '' });
  const [requestData, setRequestData] = useState({ name: '', quantity: '', reason: '', phone: '' });

  const [donorLog, setDonorLog] = useState([]);
  const [receiverLog, setReceiverLog] = useState([]);

  const totalDonated = donorLog.reduce((s, r) => s + Number(r.qty), 0);
  const totalRequested = receiverLog.reduce((s, r) => s + Number(r.qty), 0);

  const handleNavClick = (portal) => {
    if (portal === 'home') { navigate('/'); return; }
    if (loggedIn[portal]) { navigate(`/${portal}`); } else { setLoginTarget(portal); }
  };

  const handleLoginSuccess = (user) => {
    setLoggedIn({ ...loggedIn, [user.role]: user });
    setLoginTarget(null);
    navigate(`/${user.role}`);
  };

  const handleLogout = (role) => {
    const updated = { ...loggedIn };
    delete updated[role];
    setLoggedIn(updated);
    navigate('/');
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRequestChange = (e) => setRequestData({ ...requestData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(formData.quantity) > 0) {
      const newEntry = {
        donor: formData.name,
        item: selectedItem.name,
        qty: Number(formData.quantity),
        phone: formData.phone,
        address: formData.address,
        date: today(),
        id: Date.now(),
      };
      setDonorLog(prev => [newEntry, ...prev]);
      alert(`✅ Thank you ${formData.name}! Your donation of ${formData.quantity} ${selectedItem.name} has been recorded.`);
      setFormData({ name: '', quantity: '', address: '', phone: '' });
      setSelectedItem(null);
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (Number(requestData.quantity) > 0) {
      const newEntry = {
        receiver: requestData.name,
        item: formatCategory(selectedCategory),
        qty: Number(requestData.quantity),
        phone: requestData.phone,
        reason: requestData.reason,
        date: today(),
        id: Date.now(),
      };
      setReceiverLog(prev => [newEntry, ...prev]);
      alert(`✅ Request submitted! Your request for ${requestData.quantity} ${formatCategory(selectedCategory)} item(s) has been recorded.`);
      setRequestData({ name: '', quantity: '', reason: '', phone: '' });
      setSelectedCategory(null);
    }
  };

  const getProgress = (item) => ((item.donated / item.needed) * 100).toFixed(1);

  return (
    <div className="App">
      {loginTarget && (
        <LoginModal role={loginTarget} onSuccess={handleLoginSuccess} onClose={() => setLoginTarget(null)} />
      )}

      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">🤝</span>
            <span>DonateHub Pro</span>
          </div>
          <div className="nav-links">
            <button className={`nav-btn ${activePortal === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>🏠 Home</button>
            <button className={`nav-btn ${activePortal === 'donor' ? 'active' : ''}`} onClick={() => handleNavClick('donor')}>
              💝 Donor Portal {loggedIn.donor ? `(${loggedIn.donor.name})` : ''}
            </button>
            <button className={`nav-btn ${activePortal === 'receiver' ? 'active' : ''}`} onClick={() => handleNavClick('receiver')}>
              📋 Receiver Portal {loggedIn.receiver ? `(${loggedIn.receiver.name})` : ''}
            </button>
            <button className={`nav-btn ${activePortal === 'admin' ? 'active' : ''}`} onClick={() => handleNavClick('admin')}>
              👨‍💼 Admin Dashboard {loggedIn.admin ? `(${loggedIn.admin.name})` : ''}
            </button>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <section className="hero-section">
            <div className="hero-bg-left">
              <img src={`${DONATION_IMG}`} alt="Donation boxes" className="hero-bg-img" />
              <div className="hero-bg-overlay" />
            </div>
            <div className="hero-bg-right">
              <img src={`${LINK2_IMG}`} alt="Serving with heart" className="hero-bg-img" />
              <div className="hero-bg-overlay" />
            </div>

            <div className="hero-content">
              <h1 className="hero-title">Transform Lives Through Generosity</h1>
              <p className="hero-subtitle">
                Join thousands of donors making a real difference. Choose your portal to start helping today.
              </p>

              <div className="hero-image-showcase">
                <div className="showcase-card">
                  <img src={`${DONATION_IMG}`} alt="Donate Items" className="showcase-img" />
                  <div className="showcase-label">📦 Donate Items</div>
                </div>
                <div className="showcase-divider">
                  <div className="divider-heart">❤️</div>
                </div>
                <div className="showcase-card">
                  <img src={`${LINK2_IMG}`} alt="Serving With Heart" className="showcase-img" />
                  <div className="showcase-label">🌟 Serving With Heart</div>
                </div>
              </div>

              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">{totalDonated.toLocaleString()}</div>
                  <div className="stat-label">Items Donated</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{new Set(donorLog.map(r => r.donor)).size}</div>
                  <div className="stat-label">Active Donors</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{receiverLog.length}</div>
                  <div className="stat-label">Requests Fulfilled</div>
                </div>
              </div>
              <div className="hero-buttons">
                <button className="cta-primary" onClick={() => handleNavClick('donor')}>Start Donating Now</button>
                <button className="cta-secondary" onClick={() => handleNavClick('receiver')}>Request Assistance</button>
              </div>
            </div>
          </section>
        } />

        <Route path="/donor" element={
          loggedIn.donor ? (
            <main className="main-content">
              <div className="portal-container">
                <div className="portal-header">
                  <h2>Donor Portal</h2>
                  <p>Welcome back, {loggedIn.donor.name}! Choose items to donate and make a difference today.</p>
                  <button onClick={() => handleLogout('donor')} style={styles.logoutBtn}>Logout</button>
                </div>
                <div className="items-grid">
                  {items.map((item) => (
                    <div key={item.id} className="item-card" onClick={() => setSelectedItem(item)}>
                      <div className="card-header">
                        <div className="category-badge">{item.category}</div>
                        <div className="item-icon">{getCategoryIcon(item.category)}</div>
                      </div>
                      <div className="card-body">
                        <h3>{item.name}</h3>
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${getProgress(item)}%` }} />
                          </div>
                          <div className="progress-text">{getProgress(item)}% Complete ({item.donated}/{item.needed})</div>
                        </div>
                      </div>
                      <button className="select-btn">Select to Donate →</button>
                    </div>
                  ))}
                </div>
                {selectedItem && (
                  <div className="donation-form-container" style={{ marginTop: '2rem' }}>
                    <form onSubmit={handleSubmit} className="premium-form">
                      <h3>{selectedItem.name} Donation</h3>
                      <div className="form-row">
                        <input className="form-input" name="name" placeholder="Your Full Name" value={formData.name} onChange={handleInputChange} required />
                        <input className="form-input" name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} required />
                      </div>
                      <input className="form-input" name="quantity" type="number" placeholder="Quantity to Donate" value={formData.quantity} onChange={handleInputChange} min="1" required style={{ marginBottom: '1.5rem' }} />
                      <textarea className="form-input" name="address" placeholder="Pickup Address (Full address with landmark)" value={formData.address} onChange={handleInputChange} rows="4" required />
                      <button type="submit" className="form-submit">Confirm Donation 🚀</button>
                    </form>
                  </div>
                )}
                {donorLog.length > 0 && (
                  <div className="donation-form-container" style={{ marginTop: '2rem' }}>
                    <h3 style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>📜 Your Donation History</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={styles.table}>
                        <thead>
                          <tr>{['Item', 'Qty', 'Phone', 'Address', 'Date'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {donorLog.map((row, i) => (
                            <tr key={row.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                              <td style={styles.td}>{row.item}</td>
                              <td style={styles.td}><span style={styles.badge}>{row.qty}</span></td>
                              <td style={styles.td}>{row.phone}</td>
                              <td style={styles.td}>{row.address}</td>
                              <td style={styles.td}>{row.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </main>
          ) : (
            <main className="main-content">
              <div className="portal-container">
                <div className="portal-header">
                  <h2>Donor Portal</h2>
                  <p>Please log in to access the Donor Portal.</p>
                  <button onClick={() => setLoginTarget('donor')} style={styles.loginBtn}>Login as Donor</button>
                </div>
              </div>
            </main>
          )
        } />

        <Route path="/receiver" element={
          loggedIn.receiver ? (
            <main className="main-content">
              <div className="portal-container">
                <div className="portal-header">
                  <h2>Receiver Portal</h2>
                  <p>Welcome, {loggedIn.receiver.name}! Request essential items for your needs.</p>
                  <button onClick={() => handleLogout('receiver')} style={styles.logoutBtn}>Logout</button>
                </div>
                <div className="category-panels">
                  {Object.entries(groupByCategory(items)).map(([category, categoryItems]) => (
                    <div key={category} className="category-panel">
                      <div className="panel-header">
                        <div className="category-icon">{getCategoryIcon(category)}</div>
                        <h3>{formatCategory(category)}</h3>
                      </div>
                      <div className="panel-items">
                        {categoryItems.map(item => (
                          <div key={item.id} className="panel-item">
                            {item.name}
                            <span className="availability">{item.donated < item.needed ? 'Available' : 'Limited'}</span>
                          </div>
                        ))}
                      </div>
                      <button className="panel-action" onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}>
                        {selectedCategory === category ? 'Cancel Request ✕' : 'Request Items'}
                      </button>
                    </div>
                  ))}
                </div>
                {selectedCategory && (
                  <div className="donation-form-container" style={{ marginTop: '2rem' }}>
                    <form onSubmit={handleRequestSubmit} className="premium-form">
                      <h3>{formatCategory(selectedCategory)} {getCategoryIcon(selectedCategory)} Request</h3>
                      <div className="form-row">
                        <input className="form-input" name="name" placeholder="Your Full Name" value={requestData.name} onChange={handleRequestChange} required />
                        <input className="form-input" name="phone" type="tel" placeholder="Phone Number" value={requestData.phone} onChange={handleRequestChange} required />
                      </div>
                      <input className="form-input" name="quantity" type="number" placeholder="Quantity Needed" value={requestData.quantity} onChange={handleRequestChange} min="1" required style={{ marginBottom: '1.5rem' }} />
                      <textarea className="form-input" name="reason" placeholder="Reason for request / Delivery Address" value={requestData.reason} onChange={handleRequestChange} rows="4" required />
                      <button type="submit" className="form-submit" style={{ background: 'linear-gradient(45deg, #4285f4, #1a73e8)' }}>Submit Request 📋</button>
                    </form>
                  </div>
                )}
                {receiverLog.length > 0 && (
                  <div className="donation-form-container" style={{ marginTop: '2rem' }}>
                    <h3 style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>📜 Your Request History</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={styles.table}>
                        <thead>
                          <tr>{['Item', 'Qty', 'Phone', 'Reason/Address', 'Date'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {receiverLog.map((row, i) => (
                            <tr key={row.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                              <td style={styles.td}>{row.item}</td>
                              <td style={styles.td}><span style={{ ...styles.badge, background: 'linear-gradient(45deg,#4285f4,#1a73e8)' }}>{row.qty}</span></td>
                              <td style={styles.td}>{row.phone}</td>
                              <td style={styles.td}>{row.reason}</td>
                              <td style={styles.td}>{row.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </main>
          ) : (
            <main className="main-content">
              <div className="portal-container">
                <div className="portal-header">
                  <h2>Receiver Portal</h2>
                  <p>Please log in to access the Receiver Portal.</p>
                  <button onClick={() => setLoginTarget('receiver')} style={styles.loginBtn}>Login as Receiver</button>
                </div>
              </div>
            </main>
          )
        } />

        <Route path="/admin" element={
          loggedIn.admin ? (
            <main className="main-content">
              <div className="portal-container">
                <div className="portal-header">
                  <h2>Admin Dashboard</h2>
                  <p>Welcome, {loggedIn.admin.name}! Live overview of all submissions.</p>
                  <button onClick={() => handleLogout('admin')} style={styles.logoutBtn}>Logout</button>
                </div>
                <div className="dashboard-stats">
                  <div className="stat-card large">
                    <div className="stat-value">{totalDonated}</div>
                    <div className="stat-label">Total Units Donated</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{new Set(donorLog.map(r => r.donor)).size}</div>
                    <div className="stat-label">Unique Donors</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{receiverLog.length}</div>
                    <div className="stat-label">Requests Received</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{totalRequested}</div>
                    <div className="stat-label">Total Units Requested</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{new Set(receiverLog.map(r => r.receiver)).size}</div>
                    <div className="stat-label">Unique Receivers</div>
                  </div>
                </div>
                <div className="dashboard-charts" style={{ marginBottom: '2rem' }}>
                  <div className="chart-card">
                    <h3>Top Categories by Progress</h3>
                    {items.slice(0, 5).map((item, idx) => (
                      <div key={item.id} className="top-item">
                        <span className="rank">{idx + 1}</span>
                        <span className="item-name">{item.name}</span>
                        <span className="item-progress">{getProgress(item)}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-card">
                    <h3>All Items Progress</h3>
                    {items.map(item => (
                      <div key={item.id} style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontWeight: 600, marginBottom: '0.3rem' }}>
                          <span>{getCategoryIcon(item.category)} {item.name}</span>
                          <span style={{ color: '#00ff88' }}>{item.donated}/{item.needed}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${getProgress(item)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chart-card" style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0 }}>📊 Live Donation Submissions</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={styles.miniStat}><span style={styles.miniVal}>{totalDonated}</span><span style={styles.miniLabel}>Total Units</span></div>
                      <div style={styles.miniStat}><span style={styles.miniVal}>{new Set(donorLog.map(r => r.donor)).size}</span><span style={styles.miniLabel}>Donors</span></div>
                      <div style={styles.miniStat}><span style={styles.miniVal}>{donorLog.length}</span><span style={styles.miniLabel}>Submissions</span></div>
                    </div>
                  </div>
                  {donorLog.length === 0 ? (
                    <div style={styles.emptyState}><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div><p>No donations submitted yet.</p></div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={styles.table}>
                        <thead><tr>{['#', 'Donor Name', 'Item', 'Qty', 'Phone', 'Pickup Address', 'Date'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                        <tbody>
                          {donorLog.map((row, i) => (
                            <tr key={row.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                              <td style={styles.td}><span style={{ color: '#ffd700', fontWeight: 700 }}>{donorLog.length - i}</span></td>
                              <td style={styles.td}><span style={{ fontWeight: 700, color: 'white' }}>{row.donor}</span></td>
                              <td style={styles.td}>{row.item}</td>
                              <td style={styles.td}><span style={styles.badge}>{row.qty}</span></td>
                              <td style={styles.td}>{row.phone}</td>
                              <td style={styles.td}>{row.address}</td>
                              <td style={styles.td}>{row.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="chart-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0 }}>📋 Live Receiver Requests</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={styles.miniStat}><span style={styles.miniVal}>{totalRequested}</span><span style={styles.miniLabel}>Total Units</span></div>
                      <div style={styles.miniStat}><span style={styles.miniVal}>{new Set(receiverLog.map(r => r.receiver)).size}</span><span style={styles.miniLabel}>Receivers</span></div>
                      <div style={styles.miniStat}><span style={styles.miniVal}>{receiverLog.length}</span><span style={styles.miniLabel}>Requests</span></div>
                    </div>
                  </div>
                  {receiverLog.length === 0 ? (
                    <div style={styles.emptyState}><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div><p>No requests submitted yet.</p></div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={styles.table}>
                        <thead><tr>{['#', 'Receiver Name', 'Category', 'Qty', 'Phone', 'Reason / Address', 'Date'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                        <tbody>
                          {receiverLog.map((row, i) => (
                            <tr key={row.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                              <td style={styles.td}><span style={{ color: '#ffd700', fontWeight: 700 }}>{receiverLog.length - i}</span></td>
                              <td style={styles.td}><span style={{ fontWeight: 700, color: 'white' }}>{row.receiver}</span></td>
                              <td style={styles.td}>{row.item}</td>
                              <td style={styles.td}><span style={{ ...styles.badge, background: 'linear-gradient(45deg,#4285f4,#1a73e8)' }}>{row.qty}</span></td>
                              <td style={styles.td}>{row.phone}</td>
                              <td style={styles.td}>{row.reason}</td>
                              <td style={styles.td}>{row.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </main>
          ) : (
            <main className="main-content">
              <div className="portal-container">
                <div className="portal-header">
                  <h2>Admin Dashboard</h2>
                  <p>Please log in to access the Admin Dashboard.</p>
                  <button onClick={() => setLoginTarget('admin')} style={styles.loginBtn}>Login as Admin</button>
                </div>
              </div>
            </main>
          )
        } />
      </Routes>

      <footer className="footer">
        <p>&copy; 2026 DonateHub Pro. Making a difference together.</p>
      </footer>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'linear-gradient(135deg, rgba(102,126,234,0.95), rgba(118,75,162,0.95))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '24px', padding: '3rem', width: '100%', maxWidth: '440px', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: '1rem', right: '1.25rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '1.2rem', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer' },
  modalTitle: { fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', textAlign: 'center' },
  modalSub: { color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', textAlign: 'center', fontSize: '1rem' },
  input: { width: '100%', padding: '1rem 1.25rem', marginBottom: '1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' },
  loginBtn: { width: '100%', padding: '1.1rem', background: 'linear-gradient(45deg, #00c851, #007e33)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem', letterSpacing: '0.5px', boxShadow: '0 8px 24px rgba(0,200,81,0.4)' },
  switchText: { color: 'rgba(255,255,255,0.8)', marginTop: '1.5rem', fontSize: '0.95rem' },
  switchLink: { color: '#00ff88', cursor: 'pointer', fontWeight: 700 },
  error: { color: '#ff6b6b', marginBottom: '0.75rem', textAlign: 'center', fontWeight: 600 },
  demoHint: { marginTop: '1.25rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', textAlign: 'center' },
  logoutBtn: { marginTop: '1rem', padding: '0.6rem 1.5rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  table: { width: '100%', borderCollapse: 'collapse', color: 'white' },
  th: { padding: '0.8rem 1rem', textAlign: 'left', background: 'rgba(255,255,255,0.15)', fontWeight: 700, fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.2)' },
  td: { padding: '0.75rem 1rem', fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  badge: { background: 'linear-gradient(45deg,#00c851,#007e33)', color: 'white', padding: '0.2rem 0.75rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem' },
  miniStat: { background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' },
  miniVal: { fontSize: '1.6rem', fontWeight: 900, color: '#00ff88', textShadow: '0 0 15px rgba(0,255,136,0.5)' },
  miniLabel: { color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', marginTop: '0.2rem', textAlign: 'center' },
  emptyState: { textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '2px dashed rgba(255,255,255,0.2)', fontSize: '1.1rem' },
};

const groupByCategory = (items) =>
  items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

const formatCategory = (category) => ({
  clothing: 'Clothing', food: 'Food', medical: 'Medical', education: 'Education',
  baby: 'Baby Care', household: 'Household', electronics: 'Electronics', personal: 'Personal Care'
}[category] || category);

const getCategoryIcon = (category) => ({
  clothing: '👕', food: '🍚', medical: '💊', education: '📚',
  baby: '🍼', household: '🏠', electronics: '📱', personal: '🧴'
}[category] || '📦');

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;