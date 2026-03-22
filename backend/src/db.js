// e:/task/backend/src/db.js
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.users = [];
    this.refreshTokens = []; // [{ userId, token, expiresAt, replacedByToken }]
    
    // Seed an admin user for testing
    this.seed();
  }

  async seed() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    this.users.push({
      id: '1',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      name: 'Admin User'
    });
    console.log('Database seeded with admin user: admin@example.com / admin123');
  }

  findUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  createUser(userData) {
    const newUser = {
      id: Date.now().toString(),
      isVerified: false,
      role: 'USER',
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id, updates) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      return this.users[index];
    }
    return null;
  }

  // Token management
  addRefreshToken(userId, token, expiresAt) {
    this.refreshTokens.push({ userId, token, expiresAt, replacedByToken: null });
  }

  findRefreshToken(token) {
    return this.refreshTokens.find(t => t.token === token);
  }

  invalidateTokenLineage(token) {
    // Basic implementation: remove tokens for the user if a token is reused (security)
    const tokenObj = this.findRefreshToken(token);
    if (tokenObj) {
      this.refreshTokens = this.refreshTokens.filter(t => t.userId !== tokenObj.userId);
    }
  }

  revokeToken(token) {
    this.refreshTokens = this.refreshTokens.filter(t => t.token !== token);
  }
}

module.exports = new Database();
