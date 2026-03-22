# 🔐 SecureAuth — Full-Stack Authentication System

A modern full-stack authentication application built with **React + Vite** (frontend) and **Express.js** (backend), featuring JWT-based auth with refresh token rotation, role-based access control, and **Google OAuth 2.0** social login.

---

## 📁 Project Structure

```
task/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx           # Main app with Login, Register & Dashboard components
│   │   ├── authStore.jsx     # AuthProvider with context, login/logout/register logic
│   │   ├── AuthContext.js    # React Context for auth state
│   │   ├── api.js            # Axios instance with interceptors (auto token refresh)
│   │   ├── index.css         # Full styling (glassmorphism dark theme)
│   │   └── main.jsx          # App entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/           # Express.js backend API
│   ├── src/
│   │   ├── server.js         # Express server, all API routes
│   │   ├── auth.js           # JWT token generation & verification
│   │   ├── passport.js       # Google OAuth strategy (Passport.js)
│   │   ├── middleware.js      # authenticate & authorize middleware
│   │   └── db.js             # In-memory database with user & token management
│   ├── .env                  # Environment variables (secrets, Google credentials)
│   └── package.json
│
└── README.md          # This file
```

---

## 🛠️ Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- A **Google Cloud Console** account — [console.cloud.google.com](https://console.cloud.google.com)

---

## 🚀 Step-by-Step Build Guide

### Step 1: Clone or Create the Project Directory

```bash
mkdir task
cd task
```

---

## 📦 Part A: Backend Setup

### Step 2: Initialize the Backend

```bash
mkdir backend
cd backend
npm init -y
```

### Step 3: Install Backend Dependencies

```bash
npm install express cors cookie-parser bcryptjs jsonwebtoken dotenv express-session passport passport-google-oauth20
npm install -D nodemon
```

| Package | Purpose |
|---------|---------|
| `express` | Web server framework |
| `cors` | Cross-origin resource sharing (frontend ↔ backend) |
| `cookie-parser` | Parse cookies (for refresh tokens) |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT token generation & verification |
| `dotenv` | Load environment variables from `.env` |
| `express-session` | Session support (required by Passport) |
| `passport` | Authentication middleware |
| `passport-google-oauth20` | Google OAuth 2.0 strategy for Passport |
| `nodemon` | Auto-restart server on file changes (dev only) |

### Step 4: Create the `.env` File

Create `backend/.env`:

```env
PORT=5000
ACCESS_TOKEN_SECRET=<generate-a-random-64-char-hex-string>
REFRESH_TOKEN_SECRET=<generate-a-random-64-char-hex-string>
NODE_ENV=development
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

> **💡 Tip:** Generate random secrets using Node.js:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Step 5: Configure `package.json` Scripts

Update `backend/package.json` scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "type": "commonjs"
}
```

### Step 6: Create Backend Source Files

Create the `backend/src/` directory and add the following files:

#### 6a. `src/db.js` — In-Memory Database

This file creates a simple in-memory database with:
- **Users array** — stores registered users
- **Refresh tokens array** — stores active refresh tokens with expiration
- **Seed data** — pre-creates an admin user (`admin@example.com` / `admin123`)
- **Token management** — add, find, revoke tokens; invalidate token lineage for security

#### 6b. `src/auth.js` — JWT Token Utilities

This file handles:
- **`generateAccessToken(user)`** — creates a short-lived JWT (15 minutes) containing `id`, `email`, `role`
- **`generateRefreshToken(user)`** — creates a long-lived JWT (7 days) containing only `id`
- **`verifyAccessToken(token)`** / **`verifyRefreshToken(token)`** — validate and decode tokens
- **`cookieConfig`** — secure cookie settings (`httpOnly`, `sameSite: Strict`, 7-day expiry)

#### 6c. `src/middleware.js` — Auth Middleware

Two middleware functions:
- **`authenticate`** — extracts the Bearer token from `Authorization` header, verifies it, attaches `req.user`
- **`authorize(roles)`** — checks if `req.user.role` is in the allowed roles list (e.g., `'ADMIN'`)

#### 6d. `src/passport.js` — Google OAuth Strategy

Configures Passport with the Google OAuth 2.0 strategy:
- Uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from `.env`
- **Callback URL:** `http://localhost:5000/api/auth/google/callback`
- On successful Google auth, either finds an existing user by `googleId`/`email` or creates a new one
- If an email account already existed, it links the Google account to it

#### 6e. `src/server.js` — Express Server & API Routes

The main server file that sets up:

**Middleware:**
- `express.json()` — parse JSON body
- `cookie-parser` — parse cookies
- `express-session` — session support for Passport
- `cors` — allow requests from `http://localhost:5173` with credentials
- `passport.initialize()` / `passport.session()`

**API Routes:**

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/register` | Register a new user (email + password + name) |
| `GET` | `/api/auth/verify?id=` | Verify email (mock — link returned directly to UI) |
| `POST` | `/api/auth/login` | Login with email & password, returns access token + sets refresh token cookie |
| `POST` | `/api/auth/refresh` | Rotate refresh token — returns new access token + new refresh cookie |
| `POST` | `/api/auth/logout` | Revoke refresh token & clear cookie |
| `GET` | `/api/auth/google` | Initiate Google OAuth flow |
| `GET` | `/api/auth/google/callback` | Google OAuth callback — generates tokens & redirects to frontend |
| `GET` | `/api/user/profile` | Get current user profile (requires auth) |
| `GET` | `/api/admin/dashboard` | Admin-only route (requires auth + `ADMIN` role) |

### Step 7: Run the Backend

```bash
cd backend
npm run dev
```

You should see:
```
Database seeded with admin user: admin@example.com / admin123
Server running on http://localhost:5000
```

---

## 🎨 Part B: Frontend Setup

### Step 8: Create the Frontend with Vite

From the project root (`task/`):

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Step 9: Install Frontend Dependencies

```bash
npm install axios
```

| Package | Purpose |
|---------|---------|
| `react` | UI library |
| `react-dom` | React DOM renderer |
| `axios` | HTTP client for API calls |

### Step 10: Create Frontend Source Files

#### 10a. `src/AuthContext.js` — React Context

Creates a simple React context to share auth state (`user`, `login`, `logout`, `register`) across all components.

```js
import { createContext, useContext } from 'react';
export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
```

#### 10b. `src/api.js` — Axios Instance with Interceptors

Creates a configured Axios instance pointing to `http://localhost:5000/api`:

- **Request interceptor:** Automatically attaches the `Authorization: Bearer <token>` header from localStorage
- **Response interceptor:** On `401` errors, automatically tries to refresh the token by calling `/auth/refresh`, and if successful, retries the original request. On refresh failure, clears the token silently (the React app shows the login form automatically).

> **⚠️ Important:** The refresh failure handler does NOT use `window.location.href` — that would cause an infinite reload loop. Instead, it simply removes the token and lets React re-render the login form.

#### 10c. `src/authStore.jsx` — Auth Provider

The `AuthProvider` component that wraps the entire app:

- **State:** `user` (current user data) and `loading` (auth check in progress)
- **`login(email, password)`** — POSTs to `/auth/login`, stores access token, sets user state
- **`register(email, password, name)`** — POSTs to `/auth/register`
- **`logout()`** — POSTs to `/auth/logout`, clears token and user state
- **`checkAuth()`** — on mount, calls `/user/profile` to restore session
- **Google OAuth token handling:** On mount, checks `window.location.search` for a `?token=` parameter (set by the backend after Google OAuth redirect), saves it to localStorage, and cleans the URL

#### 10d. `src/App.jsx` — Main Application

Contains all the UI components:

- **`Navbar`** — fixed top navbar with app brand, login/register links (or user name + logout when authenticated)
- **`LoginForm`** — email/password login form with Google OAuth button, wrapped in a full-height centered `page-wrapper`
- **`RegisterForm`** — registration form with name, email, password, also wrapped in `page-wrapper`
- **`Dashboard`** — post-login dashboard showing user info, stats cards, and account details
- **`Main`** — routing logic (shows login/register when not authenticated, dashboard when authenticated)

#### 10e. `src/index.css` — Full Styling

A complete dark-theme design system using:

- **CSS custom properties** for colors, gradients, glass effects
- **Inter font** from Google Fonts
- **Glassmorphism** — translucent containers with backdrop blur
- **Animations** — fade-in on page load
- **Responsive design** — mobile-friendly dashboard layout
- **`.page-wrapper`** — flexbox-based full-viewport centering with `padding-top` to clear the fixed navbar

### Step 11: Run the Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready
➜ Local: http://localhost:5173/
```

---

## 🔑 Part C: Google OAuth 2.0 Setup (Detailed)

This is the most involved part. Follow each step carefully.

### Step 12: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name it (e.g., `SecureAuth`) → Click **Create**
4. Select the project

### Step 13: Configure the OAuth Consent Screen

1. In the left sidebar, go to **"APIs & Services"** → **"OAuth consent screen"**
   *(or navigate to **Google Auth Platform** → **Branding** if the new UI is shown)*
2. Select **"External"** user type → Click **Create**
3. Fill in required fields:
   - **App name:** `SecureAuth`
   - **User support email:** your Gmail
   - **Developer contact email:** your Gmail
4. Click **"Save and Continue"**
5. On the **Scopes** step, click **"Add or Remove Scopes"** and add:
   - `email`
   - `profile`
   - `openid`
6. Click **Save and Continue** through the remaining steps

### Step 14: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
   *(or **Google Auth Platform** → **Clients**)*
2. Click **"+ Create Credentials"** → **"OAuth Client ID"**
3. Select **"Web application"** as application type
4. Set the name (e.g., `SecureAuth Web Client`)
5. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:5000
   http://localhost:5173
   ```
6. Under **"Authorized redirect URIs"**, add **exactly**:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
   > ⚠️ **This MUST match byte-for-byte** with the `callbackURL` in `passport.js`. Notice the `/api/` in the path — missing it will cause `redirect_uri_mismatch`.
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### Step 15: Add Credentials to `.env`

Update `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here
```

### Step 16: Publish the App (Allow All Users)

By default, Google OAuth is in **"Testing"** mode — only manually added test users can sign in.

To allow anyone:

1. Go to **"OAuth consent screen"** → **"Audience"** (left sidebar)
2. Find **"Publishing status"** — it says **"Testing"**
3. Click **"Publish App"** → Confirm
4. Status changes to **"In Production"**

> **Note:** With basic scopes (`email`, `profile`), no Google verification is needed. Users may see an "unverified app" warning but can click through.

### Step 17: Restart Backend & Test

```bash
# Restart the backend to pick up .env changes
cd backend
npm run dev
```

Then go to `http://localhost:5173`, click **"Continue with Google"**, select your Google account, and you should be redirected back to the dashboard!

---

## 🔄 How the Auth Flow Works

### Email/Password Login Flow
```
Frontend                          Backend
────────                          ───────
1. User fills form
2. POST /api/auth/login ──────►  3. Validate credentials
                                  4. Generate access token (15min)
                                  5. Generate refresh token (7 days)
                                  6. Set refresh token in httpOnly cookie
7. Store access token  ◄────────  8. Return { accessToken, user }
   in localStorage
9. Show Dashboard
```

### Google OAuth Flow
```
Frontend                     Backend                     Google
────────                     ───────                     ──────
1. Click "Google" btn
2. Redirect to ──────►  3. GET /api/auth/google
                              4. Redirect to ──────────►  5. Google login page
                                                           6. User authorizes
                              7. GET /callback  ◄────────  8. Google sends auth code
                              9. Passport exchanges code for profile
                             10. Find/create user in DB
                             11. Generate JWT tokens
                             12. Set refresh cookie
13. Frontend receives  ◄──── 13. Redirect to /?token=<accessToken>
    token from URL
14. Save to localStorage
15. Clean URL
16. checkAuth() → Show Dashboard
```

### Token Refresh Flow
```
Frontend (api.js interceptor)        Backend
─────────────────────────────        ───────
1. API call returns 401
2. POST /api/auth/refresh ────────►  3. Read refresh cookie
   (with httpOnly cookie)             4. Verify token
                                      5. Revoke old refresh token
                                      6. Generate new token pair
                                      7. Set new refresh cookie
8. Save new access token  ◄────────  8. Return { accessToken }
9. Retry original request
```

---

## 🧪 Testing the Application

### Default Admin Account
```
Email:    admin@example.com
Password: admin123
```

### Test Registration
1. Go to `http://localhost:5173`
2. Click **"Sign Up"**
3. Fill in name, email, password → Click **Sign Up**
4. A success message will appear in the UI with a clickable verification link
5. Click the link to instantly verify your simulated email
6. Now log in with the registered credentials

### Test Google OAuth
1. Click **"Continue with Google"**
2. Select/sign in with your Google account
3. You should be redirected to the dashboard

---

## 🚨 Common Issues & Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `redirect_uri_mismatch` | Redirect URI in Google Console doesn't match backend | Ensure it's exactly `http://localhost:5000/api/auth/google/callback` (with `/api/`) |
| Page keeps refreshing | `window.location.href` redirect in api.js interceptor | Already fixed — interceptor now just clears the token silently |
| Login container not visible / cut off | No vertical centering; navbar overlaps content | Already fixed — `.page-wrapper` with flexbox centering and `padding-top: 6rem` |
| `Access blocked: invalid request` | OAuth app in "Testing" mode | Add your email as test user, or publish the app |
| CORS errors | Frontend and backend on different ports | Backend CORS is configured for `http://localhost:5173` with `credentials: true` |
| Backend not starting | Missing `.env` file or dependencies | Run `npm install` and create `.env` with all variables |

---

## 🧩 Front-End & Back-End Components Used

Our system is broken down into highly specialized modules to enforce separation of concerns:

### Frontend Components (`src/`)
- **`App.jsx`**: The core application shell. Handles complex dynamic routing and selectively mounts the layout components depending on the user's authentication status. The views include:
  - **`LoginForm`**: An interactive, split-screen UI capturing user credentials and triggering Google OAuth flows.
  - **`RegisterForm`**: A centralized glassmorphism form for user onboarding.
  - **`Dashboard`**: The post-authentication view offering an administrative bento-box grid displaying telemetry, user stats, and session intel.
  - **`InteractiveVisuals`**: A reusable, highly-animated background component utilizing a 3D CSS perspective bounding box tied to user mouse coordinate tracking.
- **`api.js`**: An Axios client utilizing sophisticated HTTP interceptors to silently intercept 401 Unauthorized errors from protected API routes, automatically request new tokens from the `/refresh` endpoint, and retry the failed requests.
- **`authStore.jsx`**: A React Context Provider exposing global state functions (login, logout, checkAuth) so disparate components can access and mutate the auth lifecycle without prop-drilling.

### Backend Modules (`src/`)
- **`server.js`**: The foundational application scaffolding. It mounts middleware, initializes security boundaries, parses cookies, and mounts the API routing tree (Register, Login, Google OAuth webhooks).
- **`auth.js`**: The cryptographic engine. Manages JSON Web Token signing (Access + Refresh tokens), expiration configuration, and security schemas for HTTP-Only cookies.
- **`passport.js`**: The Google OAuth 2.0 bridge. It establishes the secure handshake with Google servers and parses Google-provided scopes (profiles, emails) into standard application users.
- **`db.js`**: The persistence layer. Currently utilizing runtime server memory collections to mimic a full SQL database. Features lineage checking to defend against refresh token reuse vulnerabilities.
- **`middleware.js`**: In-flight request guards. Ensures endpoints are blocked from unauthenticated actors (`authenticate`) and unauthorized operational roles (`authorize`).

---

## 🏗️ Detailed Architecture & Design System

### Client-Server Architecture
The architecture strictly enforces a stateless REST framework where the backend stores zero localized session tokens in the database, dramatically boosting scalability. 
- The React Frontend (Client) uses a component-driven pattern, making localized asynchronous queries (`axios`) to manipulate the views reactively.
- The Express Backend (Server) acts purely as an API gateway, verifying JWTs per request.

### Security Architecture (Stateless JWT + Refresh Token Rotation)
1. **Access Tokens**: Short-lived (15 min) JWTs stored purely in React's memory (or localStorage) and appended to the `Authorization: Bearer` headers of API requests.
2. **Refresh Tokens**: Long-lived (7 days) JWTs stored in a tightly sealed `httpOnly` secure browser cookie. By design, JavaScript (and attackers initiating Cross-Site Scripting) cannot read them.
3. **Token Rotation / Lineage Constraints**: Every time a user requests a new Access Token via `/refresh`, the prior Refresh Token is invalidated. If a stolen refresh token attempts to re-authenticate, the system flags a breach and unilaterally revokes *all* tokens assigned to that user.

### UI & UX Design Language
- **Glassmorphism**: Heavy use of translucent panels (`rgba(255, 255, 255, 0.03)` with `backdrop-filter: blur(12px)`) sitting atop infinite spatial dark gradients (`linear-gradient(135deg, #020617 0%, #0f172a 100%)`).
- **Interactive Spatial Perspective**: Utilizes `transform-style: preserve-3d` where visual depths (brand logo at `translateZ(20px)`, text at `translateZ(40px)`) pivot based on the precise X/Y bounding box mouse coordinates of the user.
- **Data Visualization**: A dashboard leveraging CSS Grids for a modern `bento-box` layout, compartmentalizing dense analytics into universally legible, high-contrast panels.

---

## 📋 Detailed Technology Stack

We've selected an opinionated technology stack to optimize for developer experience, runtime speed, and impenetrable security.

### 1. React.js (Frontend UI)
- **What:** A component-based JavaScript library engineered by Meta.
- **Why:** Used to build our fluid, non-blocking single page application interfaces without full-page reloads.
- **Advantages:** Unrivaled third-party ecosystem; high-performance Virtual DOM diffing; intuitive component architecture scaling.
- **Disadvantages:** Significant boilerplate overhead for complex implementations; lacks built-in core routing or state managers out of the box.

### 2. Vite (Build Engine)
- **What:** A next-generation native-ESM frontend build server.
- **Why:** Chosen to replace heavy legacy bundlers (like Webpack) for serving local development and bundling production minified code.
- **Advantages:** Instant server starts (measured in milliseconds) and blazing fast Hot Module Replacement (HMR) leading to massive dev lifecycle speedups.
- **Disadvantages:** Slightly newer ecosystem, potentially yielding compatibility hurdles with older, obscure node modules.

### 3. Express.js (Backend Framework)
- **What:** A minimalist and highly scalable web application routing framework for Node.js.
- **Why:** Essential for building the RESTful API corridors and piping middleware for authentication and header verification.
- **Advantages:** Exceedingly simple to spin up; immense flexibility; supported by universal middleware tooling.
- **Disadvantages:** Unopinionated logic means the framework doesn't enforce structural best practices, requiring developers to manually build modular architectures.

### 4. JSON Web Tokens (JWT)
- **What:** An open industry standard (RFC 7519) for cryptographically securing strings passed between isolated apps.
- **Why:** Utilized to lock down the platform via Access and Refresh Tokens statically linked to our hashing algorithms.
- **Advantages:** Completely stateless logic mapping (servers don't query a database to verify a signature), exceptionally horizontally scalable.
- **Disadvantages:** Standard tokens cannot be forcibly invalidated before the expiration window simply, demanding the intricate Refresh Token rotation mechanisms we employed.

### 5. Passport.js & Google OAuth 2.0
- **What:** An authentication routing middleware for Node coupled with a social connectivity plugin.
- **Why:** To allow frictionless, one-click authorization without forcing end-users to invent and verify a new password.
- **Advantages:** Drastically increases application conversion rates; delegates massive password security responsibilities mathematically to Google's engineering team.
- **Disadvantages:** Strict requirements for accurate Redirect URI configurations; ties a portion of the application uptime to a third-party service provider's health.

### 6. Node Array / In-Memory Storage (`db.js`)
- **What:** An array-based execution environment runtime state mirroring standard database constructs.
- **Why:** To allow for high-speed prototyping and testing of authentication pipelines independent of rigid SQL container constraints.
- **Advantages:** Absolutely zero infrastructure overhead or environment connections required; perfectly portable local deployments.
- **Disadvantages:** Complete data volatility; the moment the Node terminal crashes or cycles, the entire "database" vanishes.

### 7. Axios (HTTP Client & Interceptors)
- **What:** A promise-based HTTP client for the browser and Node.js.
- **Why:** Chosen to establish asynchronous communication between the React frontend and the Express backend API.
- **Advantages:** Automatically transforms JSON data, features incredibly powerful request/response interceptors (which we use for intercepting 401s and executing silent token refresh), and cleanly handles secure cookie credentials across domains via `withCredentials: true`.
- **Disadvantages:** Adds a slight footprint to the bundle size compared to utilizing the native browser `fetch` API.

### 8. CORS (Cross-Origin Resource Sharing)
- **What:** An HTTP-header based security mechanism enforced natively by modern web browsers.
- **Why:** Implemented via Express middleware to explicitly authorize and trust API requests arriving from the completely isolated Vite development server (`http://localhost:5173`).
- **Advantages:** A non-negotiable security layer to protect the backend API from unauthorized cross-site scripts attempting to hijack user sessions. Allows for strict domain origin whitelisting.
- **Disadvantages:** Can be frustratingly tricky to configure properly when coordinating `httpOnly` secure cookies and external OAuth redirects across varying development ports.

### 9. Nodemon (Development Utility)
- **What:** A utility tool that continuously monitors the backend directory for file changes.
- **Why:** Configured as our backend `dev` script to automatically restart the Express server whenever any source code is modified.
- **Advantages:** Drastically speeds up the backend development workflow by entirely eliminating the need to manually stop and restart the Node process after every single code update.
- **Disadvantages:** Strictly intended for active development environments only; running it in production is an anti-pattern (where tools like PM2 or Docker compose are standard).

### 10. `bcryptjs` (Password Cryptography)
- **What:** A highly resilient password hashing and encryption library written in pure JavaScript.
- **Why:** Used to mathematically scramble users' plaintext input passwords before storing them in the database, ensuring that even if the database system is breached, actual user passwords remain secure.
- **Advantages:** Implements an automatically generated randomized "salt" (we utilized 10 heavy computation rounds) which fundamentally protects against powerful brute-force algorithms and pre-computed rainbow table attacks.
- **Disadvantages:** By design, the hashing process is intentionally computationally expensive and blocks the event loop for a few milliseconds, adding a tiny increment of processing time during user login and registration flows.

---

## 🔐 Security Features

- ✅ **JWT Access Tokens** — short-lived (15 min), stored safely inside client memory state.
- ✅ **Refresh Token Rotation** — new refresh token on every refresh call.
- ✅ **httpOnly Cookies** — refresh tokens can't be accessed by XSS.
- ✅ **Token Reuse Detection** — if a refresh token is used twice, all tokens for that user are revoked.
- ✅ **Password Hashing** — bcrypt with 10 heavy salt rounds.
- ✅ **Role-Based Access Control** — ADMIN/USER hierarchies protected by hardcoded API pathway guards.
- ✅ **CORS Protection** — strict origin whitelisting natively protects against cross-origin spoofing.
- ✅ **Email Verification** — dynamic mock implementation (returns clickable verification links directly to the UI).

---

## 📄 License

ISC
