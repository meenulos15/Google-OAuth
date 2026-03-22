const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('./passport');
const session = require('express-session');
const db = require('./db');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken, 
  cookieConfig 
} = require('./auth');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.REFRESH_TOKEN_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

const { authenticate, authorize } = require('./middleware');
const bcrypt = require('bcryptjs');

// --- Auth Routes ---

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  if (db.findUserByEmail(email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = db.createUser({ email, password: hashedPassword, name });

  const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify?id=${user.id}`;
  console.log(`[MOCK EMAIL] Verification link for ${email}: ${verificationLink}`);

  res.status(201).json({ 
    message: 'User registered. Please click the link to verify your account.',
    verificationLink
  });
});

app.get('/api/auth/verify', (req, res) => {
  const { id } = req.query;
  const user = db.findUserById(id);
  if (!user) return res.status(404).send('Invalid verification link');

  db.updateUser(id, { isVerified: true });
  res.send('Email verified successfully! You can now log in.');
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.isVerified) {
    return res.status(401).json({ message: 'Please verify your email first' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  db.addRefreshToken(user.id, refreshToken, Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  res.cookie('refreshToken', refreshToken, cookieConfig);
  res.json({ accessToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.post('/api/auth/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  const payload = verifyRefreshToken(token);
  if (!payload) return res.status(401).json({ message: 'Invalid refresh token' });

  const storedToken = db.findRefreshToken(token);
  if (!storedToken) {
    db.invalidateTokenLineage(token);
    return res.status(401).json({ message: 'Refresh token recycled or invalid' });
  }

  const user = db.findUserById(payload.id);
  if (!user) return res.status(401).json({ message: 'User not found' });

  db.revokeToken(token);
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  db.addRefreshToken(user.id, newRefreshToken, Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  res.cookie('refreshToken', newRefreshToken, cookieConfig);
  res.json({ accessToken: newAccessToken });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) db.revokeToken(token);
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

// --- Google OAuth ---
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const user = req.user;
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    db.addRefreshToken(user.id, refreshToken, Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    res.cookie('refreshToken', refreshToken, cookieConfig);
    res.redirect(`${FRONTEND_URL}/?token=${accessToken}`);
  }
);

app.get('/api/user/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/admin/dashboard', authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard', usersCount: db.users.length });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
