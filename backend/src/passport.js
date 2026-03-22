// e:/task/backend/src/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user
      let user = db.users.find(u => u.googleId === profile.id || u.email === profile.emails[0].value);
      
      if (!user) {
        user = db.createUser({
          email: profile.emails[0].value,
          name: profile.displayName,
          googleId: profile.id,
          isVerified: true, // Google emails are already verified
          role: 'USER'
        });
      } else if (!user.googleId) {
        // Link existing email account to Google
        user.googleId = profile.id;
        user.isVerified = true;
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Session handling (minimal, since we use JWT for the app, but passport needs this)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = db.findUserById(id);
  done(null, user);
});

module.exports = passport;
