import { useState } from 'react';
import { useAuth } from './AuthContext';
import { AuthProvider } from './authStore.jsx';
import './index.css';

const InteractiveVisuals = () => {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
    
    const content = e.currentTarget.querySelector('.visuals-content');
    if (content) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      content.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  };

  const handleMouseLeave = (e) => {
    const content = e.currentTarget.querySelector('.visuals-content');
    if (content) {
      content.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  };

  return (
    <div className="login-visuals" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="visuals-content">
        <div className="brand-logo">Lynx.</div>
        <h1 className="hero-text">The premium<br/>workspace<br/>for visionaries.</h1>
      </div>
      <div className="abstract-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </div>
  );
};

const LoginForm = ({ setView }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-layout">
      <InteractiveVisuals />
      <div className="login-form-container">
        <div className="login-box">
          <div className="brand-mobile">Lynx.</div>
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to your intelligent workspace.</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-actions">
               <button type="submit" className="btn-primary">Sign In</button>
            </div>
          </form>

          <div className="divider"><span>OR</span></div>

          <button className="btn-google" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}>
            <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
            Continue with Google
          </button>
          
          <div className="toggle-auth">
            New here? <button className="text-link" onClick={() => setView('register')}>Create an account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterForm = ({ setView }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verificationLink, setVerificationLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setVerificationLink('');
    try {
      const data = await register(email, password, name);
      setMessage(data.message);
      if (data.verificationLink) setVerificationLink(data.verificationLink);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-layout">
      <InteractiveVisuals />
      <div className="login-form-container">
        <div className="login-box">
          <div className="brand-mobile">Lynx.</div>
          <h2>Join the Elite</h2>
          <p className="subtitle">Unlock the full potential of your team today.</p>
          
          {error && <div className="error-message">{error}</div>}
          {message && (
            <div className="success-message">
              {message}
              {verificationLink && (
                <div style={{ marginTop: '0.75rem' }}>
                  <a href={verificationLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>
                    Click here to instantly verify your account
                  </a>
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" placeholder="Name abc" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="name@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-actions">
               <button type="submit" className="btn-primary register-btn">Create Account</button>
            </div>
          </form>

          <div className="divider"><span>OR</span></div>

          <button className="btn-google" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}>
            <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
            Continue with Google
          </button>
          
          <div className="toggle-auth">
            Already have an account? <button className="text-link" onClick={() => setView('login')}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">Lynx.</div>
        <nav className="sidebar-nav">
           <button className="nav-item active">
             <span className="icon">⊞</span> Overview
           </button>
           <button className="nav-item">
             <span className="icon">📊</span> Analytics
           </button>
           <button className="nav-item">
             <span className="icon">🛡️</span> Security
           </button>
           <button className="nav-item">
             <span className="icon">⚙️</span> Settings
           </button>
        </nav>
        <div className="sidebar-footer">
           <button className="logout-btn" onClick={logout}>
             <span className="icon">↪️</span> Sign Out
           </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
           <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search resources, users, or settings..." />
           </div>
           <div className="user-profile">
              <div className="profile-text">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <div className="avatar-circle">{user.name.charAt(0)}</div>
           </div>
        </header>
        <div className="dashboard-scroll">
           <div className="greeting-card">
              <h1>Welcome back, {user.name}</h1>
              <p>Your workspace is running at peak performance. Here is what's happening today.</p>
           </div>
           
           <div className="metrics-grid">
              <div className="metric-box">
                 <div className="metric-header">
                   <h4>Activity Score</h4>
                   <div className="metric-icon purple">📈</div>
                 </div>
                 <h2>98%</h2>
                 <span className="trend positive">↑ 2.4% this week</span>
              </div>
              <div className="metric-box">
                 <div className="metric-header">
                   <h4>Security Status</h4>
                   <div className="metric-icon green">🛡️</div>
                 </div>
                 <h2>Optimal</h2>
                 <span className="trend neutral">System secure</span>
              </div>
              <div className="metric-box">
                 <div className="metric-header">
                   <h4>API Usage</h4>
                   <div className="metric-icon blue">⚡</div>
                 </div>
                 <h2>14.2k</h2>
                 <span className="trend negative">↓ 5% remaining capacity</span>
              </div>
           </div>

           <div className="bento-grid">
              <div className="bento-box large">
                 <div className="box-header">
                   <h3>Recent Activity</h3>
                   <button className="btn-ghost">View All</button>
                 </div>
                 <ul className="activity-list">
                    <li>
                      <div className="activity-icon blue">💻</div>
                      <div className="activity-details">
                        <span className="activity-title">Logged in via Mac</span>
                        <span className="activity-sub">IP: 192.168.1.45 • Mumbai, India</span>
                      </div>
                      <span className="time">Just now</span>
                    </li>
                    <li>
                      <div className="activity-icon green">🔐</div>
                      <div className="activity-details">
                        <span className="activity-title">Updated security settings</span>
                        <span className="activity-sub">2FA reconfigured successfully</span>
                      </div>
                      <span className="time">2h ago</span>
                    </li>
                    <li>
                      <div className="activity-icon orange">🔗</div>
                      <div className="activity-details">
                        <span className="activity-title">Connected Google Account</span>
                        <span className="activity-sub">OAuth integration enabled</span>
                      </div>
                      <span className="time">Yesterday</span>
                    </li>
                 </ul>
              </div>
              <div className="bento-box small">
                 <h3>Quick Actions</h3>
                 <div className="action-buttons">
                    <button className="action-btn primary-action">
                      <span className="icon">✉️</span> Invite Team Member
                    </button>
                    <button className="action-btn">
                      <span className="icon">📄</span> Generate Detailed Report
                    </button>
                    <button className="action-btn">
                      <span className="icon">🔍</span> Review Audit Logs
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

const Main = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState('login');

  if (loading) return (
    <div className="loading-wrapper">
      <div className="spinner"></div>
      <p>Authenticating your secure session...</p>
    </div>
  );

  if (!user) {
    return view === 'login' ? <LoginForm setView={setView} /> : <RegisterForm setView={setView} />;
  }

  return <Dashboard />;
};

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
