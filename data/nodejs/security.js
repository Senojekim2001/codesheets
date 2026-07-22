export const meta = {
  "title": "Security & Authentication",
  "domain": "nodejs",
  "sheet": "security",
  "icon": "🔒"
}

export const sections = [

  // ── Section 1: Security & Authentication ─────────────────────────────────────────
  {
    id: "security-auth",
    title: "Security & Authentication",
    entries: [
      {
        id: "input-validation-sanitization",
        fn: "Input Validation & Sanitization",
        desc: "Validate and sanitize user input — prevent injection attacks, XSS, and malformed data.",
        category: "Security",
        subtitle: "User input safety",
        signature: "zod.parse(data)  |  xss(htmlString)  |  validator.isEmail(email)",
        descLong: "Always validate input: check type, format, length. Sanitize HTML to prevent XSS. Use schemas (zod, joi) for validation and coercion. Never trust client input. Distinguish between validation (correctness) and sanitization (safety).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Input Validation & Sanitization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';\nimport path from 'path';\nimport { z } from 'zod';\nimport xss from 'xss';\nimport validator from 'validator';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Input Validation & Sanitization — common patterns you'll see in production.\n// APPROACH  - Combine Input Validation & Sanitization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\n// Schema validation with zod\nconst userSchema = z.object({\n  email: z.string().email('Invalid email'),\n  username: z.string().min(3).max(20),\n  password: z.string().min(8, 'Must be at least 8 characters'),\n  bio: z.string().max(500).optional(),\n  age: z.number().int().min(0).max(150).optional(),\n});\n// Safe parsing (doesn't throw)\nfunction registerUser(req, res) {\n  const result = userSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({ errors: result.error.flatten() });\n  }\n  const validatedData = result.data;\n  // Process validatedData...\n}\n// HTML sanitization (prevent XSS)\napp.post('/comments', (req, res) => {\n  const rawComment = req.body.text;\n  // Remove dangerous tags but keep safe formatting\n  const cleanComment = xss(rawComment, {\n    whiteList: {\n      b: [],\n      i: [],\n      em: [],\n      strong: [],\n      a: ['href'],\n    },\n    onTagAttr: (tag, name, value) => {\n      // Additional validation for attributes\n      if (tag === 'a' && name === 'href') {\n        // Only allow safe URLs\n        if (!/^(https?:|/|#)/.test(value)) {\n          return '';\n        }\n      }\n      return;\n    },\n  });\n  // Store sanitized comment\n  db.comments.create({ text: cleanComment });\n  res.json({ comment: cleanComment });\n});\n// Manual validation for complex logic\nfunction validateFileUpload(file) {\n  const errors = [];"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Input Validation & Sanitization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Check size\n  if (file.size > 5 * 1024 * 1024) {\n    errors.push('File too large (max 5MB)');\n  }\n  // Check MIME type (server-side, not just client)\n  const allowed = ['image/jpeg', 'image/png', 'image/webp'];\n  if (!allowed.includes(file.mimetype)) {\n    errors.push('Invalid file type');\n  }\n  // Check extension (redundant but defensive)\n  const ext = path.extname(file.filename).toLowerCase();\n  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {\n    errors.push('Invalid file extension');\n  }\n  return errors;\n}\n// SQL injection prevention (use parameterized queries)\n// BAD: vulnerable to SQL injection\napp.get('/users/:id', (req, res) => {\n  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;\n  db.execute(query); // UNSAFE!\n});\n// GOOD: parameterized query\napp.get('/users/:id', (req, res) => {\n  const query = 'SELECT * FROM users WHERE id = ?';\n  db.execute(query, [req.params.id]); // SAFE\n});\n// Brute force protection on sensitive inputs\nconst bruteForceValidator = z.object({\n  email: z.string().email(),\n  password: z.string().min(8),\n}).strict(); // Reject unknown fields\napp.post('/login', rateLimiter, (req, res) => {\n  const result = bruteForceValidator.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({ error: 'Invalid input' });\n  }\n  // Authenticate...\n});"
                  }
        ],
        tips: [
                  "Use zod or joi for schema validation — automates type checking and coercion.",
                  "Sanitize HTML with xss npm package when displaying user-generated content.",
                  "Always use parameterized queries to prevent SQL injection.",
                  "Validate file uploads: MIME type, size, and extension (server-side, not client)."
        ],
        mistake: "Trusting the client to validate input — attackers can send malformed requests directly. Validate server-side always.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "password-hashing-bcrypt",
        fn: "Password Hashing with bcrypt",
        desc: "Hash passwords with bcrypt — one-way hashing with salt and adaptive cost.",
        category: "Authentication",
        subtitle: "Secure password storage",
        signature: "await bcrypt.hash(password, rounds)  |  await bcrypt.compare(password, hash)",
        descLong: "Never store plaintext passwords. Hash with bcrypt, which includes salt and adapts to increasing computational power (rounds). Use 12-13 rounds (slower but secure). argon2 and scrypt are alternatives. Always compare hashes with timing-safe comparison.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Password Hashing with bcrypt — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';\nimport bcrypt from 'bcrypt';\nimport crypto from 'crypto';\nimport jwt from 'jsonwebtoken';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Password Hashing with bcrypt — common patterns you'll see in production.\n// APPROACH  - Combine Password Hashing with bcrypt with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\n// Register user\napp.post('/register', async (req, res) => {\n  const { email, password } = req.body;\n  // Validate password strength\n  if (password.length < 8) {\n    return res.status(400).json({ error: 'Password too short' });\n  }\n  try {\n    // Hash password with 12 rounds (good balance of security/speed)\n    const hash = await bcrypt.hash(password, 12);\n    // Store hash in database (not the password!)\n    const user = await db.users.create({\n      email,\n      passwordHash: hash,\n    });\n    res.status(201).json({ userId: user.id });\n  } catch (err) {\n    res.status(500).json({ error: 'Registration failed' });\n  }\n});\n// Login/authenticate\napp.post('/login', async (req, res) => {\n  const { email, password } = req.body;\n  try {\n    const user = await db.users.findByEmail(email);\n    if (!user) {\n      // DON'T reveal if email exists — say \"invalid credentials\"\n      return res.status(401).json({ error: 'Invalid credentials' });\n    }\n    // Compare provided password with stored hash\n    const isValid = await bcrypt.compare(password, user.passwordHash);\n    if (!isValid) {\n      return res.status(401).json({ error: 'Invalid credentials' });\n    }\n    // Password is correct, issue token\n    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);\n    res.json({ token });\n  } catch (err) {\n    res.status(500).json({ error: 'Login failed' });\n  }\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Password Hashing with bcrypt — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Password reset flow\napp.post('/request-reset', async (req, res) => {\n  const { email } = req.body;\n  const user = await db.users.findByEmail(email);\n  if (!user) {\n    // Still send success to avoid email enumeration\n    return res.json({ message: 'Check your email' });\n  }\n  // Generate reset token (random, expires in 1 hour)\n  const resetToken = crypto.randomBytes(32).toString('hex');\n  const hashedToken = await bcrypt.hash(resetToken, 10);\n  const expiresAt = Date.now() + 60 * 60 * 1000;\n  await db.users.update(user.id, {\n    resetToken: hashedToken,\n    resetTokenExpiresAt: expiresAt,\n  });\n  // Send reset link (token in plaintext, stored as hash)\n  await mailer.send(email, 'Password Reset', {\n    link: `https://app.com/reset?token=${resetToken}&email=${email}`,\n  });\n  res.json({ message: 'Check your email' });\n});\n// Verify reset token and update password\napp.post('/reset-password', async (req, res) => {\n  const { token, email, newPassword } = req.body;\n  const user = await db.users.findByEmail(email);\n  if (!user || !user.resetToken) {\n    return res.status(400).json({ error: 'Invalid reset token' });\n  }\n  // Check expiration\n  if (user.resetTokenExpiresAt < Date.now()) {\n    return res.status(400).json({ error: 'Reset token expired' });\n  }\n  // Verify token (compare plaintext with hash)\n  const isValid = await bcrypt.compare(token, user.resetToken);\n  if (!isValid) {\n    return res.status(400).json({ error: 'Invalid reset token' });\n  }\n  // Hash new password and clear reset token\n  const newHash = await bcrypt.hash(newPassword, 12);\n  await db.users.update(user.id, {\n    passwordHash: newHash,\n    resetToken: null,\n    resetTokenExpiresAt: null,\n  });\n  res.json({ message: 'Password updated' });\n});"
                  }
        ],
        tips: [
                  "Use 12-13 bcrypt rounds — slower is more secure, but 13+ takes >1 second per hash.",
                  "Never reveal if an email is registered — attackers can enumerate users. Always say \"Check your email.\"",
                  "Reset tokens: hash and store them like passwords. Verify with bcrypt.compare().",
                  "Implement rate limiting on password reset endpoints to prevent brute force."
        ],
        mistake: "Using low bcrypt rounds (< 10) or hardcoding a constant salt — both compromise security.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "https-tls-ssl",
        fn: "HTTPS/TLS Setup",
        desc: "Enable HTTPS with SSL/TLS certificates — encrypt traffic and enable HTTP/2.",
        category: "Network Security",
        subtitle: "Secure communication",
        signature: "https.createServer({ key, cert }, handler)",
        descLong: "HTTPS encrypts traffic. Use Let's Encrypt for free certificates (or buy from CA). In production, use a reverse proxy (nginx, HAProxy) to terminate TLS. In development, self-signed certs work. HTTP/2 is automatically enabled over HTTPS.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of HTTPS/TLS Setup — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport https from 'https';\nimport fs from 'fs';\nimport express from 'express';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of HTTPS/TLS Setup — common patterns you'll see in production.\n// APPROACH  - Combine HTTPS/TLS Setup with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\n// Production: use reverse proxy (nginx) to handle TLS\n// Development: self-signed cert\nconst privateKey = fs.readFileSync('./private.key', 'utf8');\nconst certificate = fs.readFileSync('./certificate.crt', 'utf8');\nconst credentials = { key: privateKey, cert: certificate };\nconst httpsServer = https.createServer(credentials, app);\n// Redirect HTTP to HTTPS\nimport http from 'http';\nhttp.createServer((req, res) => {\n  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });\n  res.end();\n}).listen(80);\nhttpsServer.listen(443, () => console.log('HTTPS on :443'));\n// Helmet: set security headers\nimport helmet from 'helmet';\napp.use(helmet({\n  hsts: {\n    maxAge: 31536000,      // 1 year\n    includeSubDomains: true,\n    preload: true,         // Add to HSTS preload list\n  },\n  contentSecurityPolicy: {\n    directives: {\n      defaultSrc: [\"'self'\"],\n      scriptSrc: [\"'self'\", \"cdn.example.com\"],\n    },\n  },\n}));\n// Generate self-signed cert (development only)\n// openssl req -x509 -newkey rsa:4096 -nodes -out certificate.crt -keyout private.key -days 365"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of HTTPS/TLS Setup — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Let's Encrypt setup (with certbot)\n// certbot certonly --standalone -d example.com\n// Creates: /etc/letsencrypt/live/example.com/fullchain.pem (public key)\n//          /etc/letsencrypt/live/example.com/privkey.pem (private key)\n// Nginx reverse proxy (recommended for production)\n/*\nserver {\n    listen 80;\n    server_name example.com;\n    return 301 https://$server_name$request_uri;  // Redirect to HTTPS\n}\nserver {\n    listen 443 ssl http2;\n    server_name example.com;\n    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;\n    # Strong TLS config\n    ssl_protocols TLSv1.2 TLSv1.3;\n    ssl_ciphers HIGH:!aNULL:!MD5;\n    ssl_prefer_server_ciphers on;\n    ssl_session_timeout 1d;\n    ssl_session_cache shared:SSL:50m;\n    # HSTS header\n    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;\n    location / {\n        proxy_pass http://localhost:3000;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto https;\n    }\n}\n*/"
                  }
        ],
        tips: [
                  "Use Let's Encrypt (free) with certbot — no reason to use paid certs.",
                  "HSTS preload header tells browsers to always use HTTPS — improves security.",
                  "Deploy TLS termination at a reverse proxy (nginx, HAProxy) not in Node — better performance.",
                  "Certificate renewal: Let's Encrypt expires every 90 days. Set up automated renewal with certbot."
        ],
        mistake: "Redirecting HTTP to HTTPS in Node instead of a reverse proxy — slower and means unencrypted traffic reaches your server.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "oauth2-google-github",
        fn: "OAuth 2.0 Integration (Google, GitHub)",
        desc: "Delegate authentication to OAuth providers — OAuth2 flow, tokens, and user profiles.",
        category: "Authentication",
        subtitle: "Third-party authentication",
        signature: "passport.authenticate(\"google\")  |  GET /auth/google/callback",
        descLong: "OAuth2 lets users log in with existing accounts (Google, GitHub, etc). Avoid storing passwords. Use passport.js middleware for implementation. Handle state tokens to prevent CSRF. Exchange authorization code for access token.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of OAuth 2.0 Integration (Google, GitHub) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport passport from 'passport';\nimport LocalStrategy from 'passport-local';\nimport GoogleStrategy from 'passport-google-oauth20';\nimport GitHubStrategy from 'passport-github2';\nimport express from 'express';\nimport session from 'express-session';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of OAuth 2.0 Integration (Google, GitHub) — common patterns you'll see in production.\n// APPROACH  - Combine OAuth 2.0 Integration (Google, GitHub) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\n// Session middleware\napp.use(session({\n  secret: process.env.SESSION_SECRET,\n  resave: false,\n  saveUninitialized: false,\n  cookie: { secure: true, httpOnly: true, sameSite: 'Lax' },\n}));\napp.use(passport.initialize());\napp.use(passport.session());\n// Google OAuth\npassport.use(\n  new GoogleStrategy(\n    {\n      clientID: process.env.GOOGLE_CLIENT_ID,\n      clientSecret: process.env.GOOGLE_CLIENT_SECRET,\n      callbackURL: 'https://example.com/auth/google/callback',\n    },\n    async (accessToken, refreshToken, profile, done) => {\n      try {\n        // Find or create user\n        let user = await db.users.findByEmail(profile.emails[0].value);\n        if (!user) {\n          user = await db.users.create({\n            email: profile.emails[0].value,\n            name: profile.displayName,\n            googleId: profile.id,\n            avatar: profile.photos[0].value,\n          });\n        }\n        return done(null, user);\n      } catch (err) {\n        return done(err);\n      }\n    }\n  )\n);\n// GitHub OAuth\npassport.use(\n  new GitHubStrategy(\n    {\n      clientID: process.env.GITHUB_CLIENT_ID,\n      clientSecret: process.env.GITHUB_CLIENT_SECRET,\n      callbackURL: 'https://example.com/auth/github/callback',\n    },\n    async (accessToken, refreshToken, profile, done) => {\n      try {\n        let user = await db.users.findByGithubId(profile.id);\n        if (!user) {\n          user = await db.users.create({\n            email: profile._json.email || `${profile.username}@github`,\n            name: profile.displayName,\n            githubId: profile.id,\n            username: profile.username,\n          });\n        }\n        return done(null, user);\n      } catch (err) {\n        return done(err);\n      }\n    }\n  )\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of OAuth 2.0 Integration (Google, GitHub) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Serialize/deserialize for sessions\npassport.serializeUser((user, done) => done(null, user.id));\npassport.deserializeUser(async (id, done) => {\n  const user = await db.users.findById(id);\n  done(null, user);\n});\n// Routes\napp.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));\napp.get('/auth/google/callback',\n  passport.authenticate('google', { failureRedirect: '/login' }),\n  (req, res) => {\n    // Successful authentication\n    res.redirect('/dashboard');\n  }\n);\napp.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));\napp.get('/auth/github/callback',\n  passport.authenticate('github', { failureRedirect: '/login' }),\n  (req, res) => {\n    res.redirect('/dashboard');\n  }\n);\n// Logout\napp.post('/logout', (req, res, next) => {\n  req.logout((err) => {\n    if (err) return next(err);\n    res.redirect('/');\n  });\n});\n// Protected route middleware\nfunction requireLogin(req, res, next) {\n  if (!req.isAuthenticated()) {\n    return res.status(401).json({ error: 'Not authenticated' });\n  }\n  next();\n}\napp.get('/profile', requireLogin, (req, res) => {\n  res.json({ user: req.user });\n});"
                  }
        ],
        tips: [
                  "Store provider ID (googleId, githubId) alongside email — users might change emails.",
                  "Always request minimal scopes — \"profile\" and \"email\" are usually enough.",
                  "Handle cases where email is missing (GitHub allows private emails).",
                  "Use passReqToCallback for more control over user creation logic."
        ],
        mistake: "Storing access tokens without refresh tokens — tokens expire and you can't refresh.",
        shorthand: {
          verbose: "passport.use(new GoogleStrategy({ clientID, clientSecret, callbackURL },\n  (accessToken, refreshToken, profile, done) => {\n    db.users.create({ googleId: profile.id, email: profile.emails[0].value });\n    return done(null, user);\n  }));",
          concise: "passport.authenticate('google', { scope: ['profile', 'email'] });\napp.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),\n  (req, res) => res.redirect('/dashboard'));",
        },
      },
      {
        id: "helmet-security-headers",
        fn: "Helmet & Security Headers",
        desc: "Set HTTP security headers to protect against clickjacking, XSS, MIME sniffing, and other browser-based attacks.",
        category: "Security",
        subtitle: "HTTP header hardening with Helmet",
        signature: "app.use(helmet())  |  Content-Security-Policy  |  Strict-Transport-Security",
        descLong: "Helmet sets 15+ HTTP response headers that mitigate common web vulnerabilities. Content-Security-Policy prevents XSS by controlling which scripts/styles can load. Strict-Transport-Security forces HTTPS. X-Frame-Options prevents clickjacking. These are defense-in-depth — they complement (not replace) server-side validation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Helmet & Security Headers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';\nimport helmet from 'helmet';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Helmet & Security Headers — common patterns you'll see in production.\n// APPROACH  - Combine Helmet & Security Headers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\n// Apply all defaults — good baseline\napp.use(helmet());\n// Customize Content-Security-Policy\napp.use(\n  helmet.contentSecurityPolicy({\n    directives: {\n      defaultSrc: [\"'self'\"],\n      scriptSrc: [\"'self'\", \"https://cdn.example.com\"],\n      styleSrc: [\"'self'\", \"'unsafe-inline'\"],  // needed for some CSS frameworks\n      imgSrc: [\"'self'\", \"data:\", \"https:\"],\n      connectSrc: [\"'self'\", \"https://api.example.com\"],\n      fontSrc: [\"'self'\", \"https://fonts.gstatic.com\"],\n      objectSrc: [\"'none'\"],\n      upgradeInsecureRequests: [],\n    },\n  })\n);\n// HSTS — force HTTPS for 1 year\napp.use(\n  helmet.hsts({\n    maxAge: 31536000,        // 1 year in seconds\n    includeSubDomains: true,\n    preload: true,\n  })\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Helmet & Security Headers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Prevent clickjacking\napp.use(helmet.frameguard({ action: 'deny' }));\n// Disable X-Powered-By (hides Express)\napp.disable('x-powered-by');  // helmet also does this\n// CORS — separate from helmet\nimport cors from 'cors';\napp.use(cors({\n  origin: ['https://myapp.com', 'https://admin.myapp.com'],\n  methods: ['GET', 'POST', 'PUT', 'DELETE'],\n  credentials: true,           // allow cookies\n  maxAge: 86400,               // preflight cache 24h\n}));\n// Headers set by helmet():\n// Content-Security-Policy     — controls allowed resources\n// Strict-Transport-Security   — forces HTTPS\n// X-Content-Type-Options      — prevents MIME sniffing\n// X-Frame-Options             — prevents clickjacking\n// X-XSS-Protection            — legacy XSS filter\n// Referrer-Policy              — controls referer header\n// Cross-Origin-Opener-Policy  — isolates browsing context"
                  }
        ],
        tips: [
                  "Start with helmet() defaults and customize only what you need — the defaults are very sensible.",
                  "CSP report-only mode lets you test policies without breaking anything: helmet.contentSecurityPolicy({ reportOnly: true }).",
                  "HSTS preload requires submission to hstspreload.org — once listed, browsers force HTTPS even on first visit.",
                  "CORS is NOT a security measure for your API — it only restricts browser requests. Server-to-server calls bypass CORS entirely."
        ],
        mistake: "Setting Access-Control-Allow-Origin to \"*\" with credentials: true — browsers reject this combination. Specify exact origins when using cookies/auth headers.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "rate-limiting-ddos",
        fn: "Rate Limiting & DDoS Protection",
        desc: "Throttle request rates per IP or user to prevent abuse, brute-force attacks, and resource exhaustion.",
        category: "Security",
        subtitle: "express-rate-limit, sliding windows, Redis-backed stores",
        signature: "rateLimit({ windowMs, max, store })  |  slowDown()",
        descLong: "Rate limiting caps how many requests a client can make in a time window. In-memory stores work for single-server deployments; Redis stores are required for multi-server. Combine with express-slow-down for progressive delays. Apply stricter limits to auth endpoints. Always rate-limit login, signup, and password reset routes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Rate Limiting & DDoS Protection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport rateLimit from 'express-rate-limit';\nimport RedisStore from 'rate-limit-redis';\nimport slowDown from 'express-slow-down';\nimport { createClient } from 'redis';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Rate Limiting & DDoS Protection — common patterns you'll see in production.\n// APPROACH  - Combine Rate Limiting & DDoS Protection with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Basic rate limiter (in-memory)\nconst generalLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000,  // 15 minutes\n  max: 100,                    // 100 requests per window\n  standardHeaders: true,       // Return RateLimit-* headers\n  legacyHeaders: false,\n  message: { error: 'Too many requests, try again later' },\n});\napp.use(generalLimiter);\n// Strict limiter for auth routes\nconst authLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000,\n  max: 5,                      // only 5 login attempts\n  skipSuccessfulRequests: true, // don't count successful logins\n  message: { error: 'Too many login attempts' },\n});\napp.use('/api/login', authLimiter);\napp.use('/api/signup', authLimiter);\napp.use('/api/reset-password', authLimiter);\n// Redis store for multi-server deployments\nconst redisClient = createClient({ url: process.env.REDIS_URL });\nawait redisClient.connect();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Rate Limiting & DDoS Protection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst redisLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000,\n  max: 100,\n  store: new RedisStore({\n    sendCommand: (...args) => redisClient.sendCommand(args),\n  }),\n});\n// Progressive slowdown (delay before blocking)\nconst speedLimiter = slowDown({\n  windowMs: 15 * 60 * 1000,\n  delayAfter: 50,              // start delaying after 50 requests\n  delayMs: (hits) => hits * 100, // add 100ms per request over limit\n  maxDelayMs: 5000,            // cap at 5 second delay\n});\napp.use(speedLimiter);\n// Per-user rate limiting (by API key or user ID)\nconst apiKeyLimiter = rateLimit({\n  windowMs: 60 * 1000,\n  max: 30,\n  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,\n});"
                  }
        ],
        tips: [
                  "Use Redis store in production with multiple servers — in-memory stores are per-process and reset on restart.",
                  "Combine rate-limit (hard block) with slow-down (progressive delay) — delays discourage bots without blocking legit users.",
                  "Set different limits for different endpoints: generous for reads, strict for writes and auth.",
                  "Return Retry-After header so clients know when to retry: standardHeaders: true."
        ],
        mistake: "Using only in-memory rate limiting behind a load balancer — each server has its own counter, so attackers get N × limit requests across N servers. Use a Redis-backed store.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "jwt-auth",
        fn: "JWT Authentication with jose",
        desc: "Implement JWT tokens with RS256/HS256 algorithms — issue and verify JWTs, handle refresh tokens.",
        category: "Authentication",
        subtitle: "jose library, RS256, HS256, refresh tokens",
        signature: "new SignJWT({ userId }).sign(privateKey)  |  jwtVerify(token, publicKey)",
        descLong: "JWTs are self-contained tokens containing claims (user ID, roles, expiry). jose is the standard Node.js library for JWT operations. RS256 uses public/private keys (asymmetric, for verification without secrets). HS256 uses a shared secret (symmetric, simpler but requires secret sharing). Implement refresh tokens to issue new access tokens without re-authentication. Always validate expiry and signature. Store JWTs in httpOnly cookies or Authorization headers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of JWT Authentication with jose — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { SignJWT, jwtVerify } from 'jose';\nimport crypto from 'crypto';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of JWT Authentication with jose — common patterns you'll see in production.\n// APPROACH  - Combine JWT Authentication with jose with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Keys (RS256 — asymmetric)\nconst publicKey = crypto.createPublicKey(process.env.JWT_PUBLIC_KEY);\nconst privateKey = crypto.createPrivateKey(process.env.JWT_PRIVATE_KEY);\n// Or use HS256 with shared secret (symmetric)\nconst secret = new TextEncoder().encode(process.env.JWT_SECRET);\n// Issue access token (short-lived)\nasync function issueAccessToken(userId, roles = []) {\n  const token = await new SignJWT({\n    userId,\n    roles,\n    type: 'access',\n  })\n    .setProtectedHeader({ alg: 'RS256' })\n    .setIssuedAt()\n    .setExpirationTime('15m')  // 15 minutes\n    .sign(privateKey);\n  return token;\n}\n// Issue refresh token (long-lived)\nasync function issueRefreshToken(userId) {\n  const token = await new SignJWT({\n    userId,\n    type: 'refresh',\n  })\n    .setProtectedHeader({ alg: 'RS256' })\n    .setIssuedAt()\n    .setExpirationTime('7d')   // 7 days\n    .sign(privateKey);\n  return token;\n}\n// Verify token\nasync function verifyToken(token) {\n  try {\n    const payload = await jwtVerify(token, publicKey);\n    return payload.payload;\n  } catch (err) {\n    throw new Error('Invalid token: ' + err.message);\n  }\n}\n// Refresh token endpoint\napp.post('/auth/refresh', async (req, res) => {\n  const { refreshToken } = req.body;\n  try {\n    const payload = await verifyToken(refreshToken);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of JWT Authentication with jose — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nif (payload.type !== 'refresh') {\n      return res.status(401).json({ error: 'Invalid token type' });\n    }\n    // Issue new access token\n    const newAccessToken = await issueAccessToken(payload.userId, payload.roles);\n    res.json({\n      accessToken: newAccessToken,\n      expiresIn: 900, // 15 minutes in seconds\n    });\n  } catch (err) {\n    res.status(401).json({ error: 'Invalid refresh token' });\n  }\n});\n// Protected route middleware\nasync function verifyAuth(req, res, next) {\n  const authHeader = req.headers.authorization;\n  if (!authHeader?.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Missing token' });\n  }\n  const token = authHeader.substring(7);\n  try {\n    const payload = await verifyToken(token);\n    req.user = payload;\n    next();\n  } catch (err) {\n    res.status(401).json({ error: 'Invalid token' });\n  }\n}\napp.get('/profile', verifyAuth, (req, res) => {\n  res.json({ user: req.user });\n});\n// RS256 key generation (one-time)\n// openssl genrsa -out private.key 2048\n// openssl rsa -in private.key -pubout -out public.key"
                  }
        ],
        tips: [
                  "Use RS256 for public verification — private key only needed on auth server.",
                  "HS256 requires sharing the secret — simpler but higher risk if secret leaks.",
                  "Separate access tokens (short, 15m) from refresh tokens (long, 7d) — revoke access by invalidating refresh token list.",
                  "Store JWTs in httpOnly cookies to prevent XSS theft — or use Authorization header for APIs."
        ],
        mistake: "Not checking token expiry or type — verify both. Use type claim (access vs refresh) to prevent using a refresh token as an access token.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "oauth2-basics",
        fn: "OAuth 2.0 Fundamentals",
        desc: "OAuth 2.0 authorization flow — PKCE, state parameter, token exchange, and delegation.",
        category: "Authentication",
        subtitle: "authorization code flow, PKCE, state, token exchange",
        signature: "authorize?client_id&redirect_uri&state&code_challenge  |  POST /token with code + code_verifier",
        descLong: "OAuth 2.0 lets users delegate access without sharing passwords. Authorization code flow: user authorizes on provider, gets code, exchange code for token. PKCE (Proof Key for Code Exchange) prevents authorization code interception attacks. Always send state parameter to prevent CSRF. Validate state and code on backend before issuing tokens. Public clients (SPAs, mobile) use PKCE. Confidential clients (backends) use client secret.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of OAuth 2.0 Fundamentals — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport crypto from 'crypto';\nimport { URLSearchParams } from 'url';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of OAuth 2.0 Fundamentals — common patterns you'll see in production.\n// APPROACH  - Combine OAuth 2.0 Fundamentals with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Step 1: Generate PKCE code challenge\nfunction generatePKCE() {\n  const codeVerifier = crypto.randomBytes(32).toString('base64url');\n  const codeChallenge = crypto\n    .createHash('sha256')\n    .update(codeVerifier)\n    .digest('base64url');\n  return { codeVerifier, codeChallenge };\n}\n// Step 2: Redirect user to authorization server\napp.get('/auth/oauth/authorize', (req, res) => {\n  const { codeVerifier, codeChallenge } = generatePKCE();\n  const state = crypto.randomBytes(16).toString('hex');\n  // Store in session (PKCE, state)\n  req.session.pkce = { codeVerifier, codeChallenge };\n  req.session.oauth = { state };\n  const authUrl = new URL('https://provider.com/oauth/authorize');\n  authUrl.searchParams.set('client_id', process.env.OAUTH_CLIENT_ID);\n  authUrl.searchParams.set('redirect_uri', 'https://myapp.com/auth/oauth/callback');\n  authUrl.searchParams.set('response_type', 'code');\n  authUrl.searchParams.set('scope', 'openid profile email');\n  authUrl.searchParams.set('state', state);\n  authUrl.searchParams.set('code_challenge', codeChallenge);\n  authUrl.searchParams.set('code_challenge_method', 'S256');\n  res.redirect(authUrl.toString());\n});\n// Step 3: Handle callback with authorization code\napp.get('/auth/oauth/callback', async (req, res) => {\n  const { code, state } = req.query;\n  // Verify state (prevent CSRF)\n  if (state !== req.session.oauth.state) {\n    return res.status(400).json({ error: 'State mismatch' });\n  }\n  const { codeVerifier } = req.session.pkce;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of OAuth 2.0 Fundamentals — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntry {\n    // Step 4: Exchange code for token (backend request, not browser)\n    const params = new URLSearchParams({\n      grant_type: 'authorization_code',\n      code,\n      client_id: process.env.OAUTH_CLIENT_ID,\n      client_secret: process.env.OAUTH_CLIENT_SECRET,\n      redirect_uri: 'https://myapp.com/auth/oauth/callback',\n      code_verifier: codeVerifier,\n    });\n    const tokenResponse = await fetch('https://provider.com/oauth/token', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },\n      body: params.toString(),\n    });\n    const { access_token, refresh_token, id_token } = await tokenResponse.json();\n    // Step 5: Get user info with access token\n    const userResponse = await fetch('https://provider.com/oauth/userinfo', {\n      headers: { Authorization: `Bearer ${access_token}` },\n    });\n    const profile = await userResponse.json();\n    // Find or create user\n    let user = await db.users.findByOAuthId(profile.sub);\n    if (!user) {\n      user = await db.users.create({\n        email: profile.email,\n        name: profile.name,\n        oauthId: profile.sub,\n        avatar: profile.picture,\n      });\n    }\n    // Store tokens securely\n    req.session.user = user;\n    req.session.tokens = { access_token, refresh_token, id_token };\n    res.redirect('/dashboard');\n  } catch (err) {\n    res.status(400).json({ error: 'Token exchange failed' });\n  }\n});"
                  }
        ],
        tips: [
                  "Always use PKCE in production — prevents authorization code interception even on https.",
                  "Validate state parameter — prevents CSRF attacks during OAuth flow.",
                  "Exchange code on backend, not frontend — client secret must stay private.",
                  "Store refresh tokens securely (database) — only send access token to frontend."
        ],
        mistake: "Sending client_secret from frontend — it will be visible to users. Token exchange must happen on backend.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "session-management",
        fn: "Session Management with express-session",
        desc: "Server-side sessions — express-session, connect-redis, session fixation prevention.",
        category: "Authentication",
        subtitle: "express-session, Redis store, secure cookies, session fixation",
        signature: "app.use(session({ store: new RedisStore() }))  |  regenerate on login",
        descLong: "Sessions store user state on server, identified by cookie. express-session manages session lifecycle. In-memory store works for development; Redis store for production. Regenerate session ID after login (prevent session fixation). Set secure, httpOnly, sameSite cookies. Configure session timeout and inactivity cleanup. Logout destroys session.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Session Management with express-session — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport session from 'express-session';\nimport RedisStore from 'connect-redis';\nimport { createClient } from 'redis';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Session Management with express-session — common patterns you'll see in production.\n// APPROACH  - Combine Session Management with express-session with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst redisClient = createClient({ url: process.env.REDIS_URL });\nredisClient.connect();\napp.use(session({\n  store: new RedisStore({ client: redisClient }),\n  secret: process.env.SESSION_SECRET,\n  resave: false,\n  saveUninitialized: false,\n  cookie: {\n    secure: true,            // HTTPS only\n    httpOnly: true,          // no JavaScript access\n    sameSite: 'strict',      // prevent CSRF\n    maxAge: 24 * 60 * 60 * 1000, // 24 hours\n  },\n}));\n// Login — regenerate session to prevent fixation\napp.post('/login', async (req, res) => {\n  const { email, password } = req.body;\n  try {\n    const user = await db.users.findByEmail(email);\n    const valid = await bcrypt.compare(password, user.passwordHash);\n    if (!valid) {\n      return res.status(401).json({ error: 'Invalid credentials' });\n    }\n    // Regenerate session ID (prevent session fixation)\n    req.session.regenerate((err) => {\n      if (err) return res.status(500).json({ error: 'Session error' });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Session Management with express-session — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Store user in session\n      req.session.userId = user.id;\n      req.session.user = {\n        id: user.id,\n        email: user.email,\n        roles: user.roles,\n      };\n      // Save session\n      req.session.save((err) => {\n        if (err) return res.status(500).json({ error: 'Session error' });\n        res.json({ message: 'Logged in' });\n      });\n    });\n  } catch (err) {\n    res.status(500).json({ error: 'Login failed' });\n  }\n});\n// Logout — destroy session\napp.post('/logout', (req, res) => {\n  req.session.destroy((err) => {\n    if (err) return res.status(500).json({ error: 'Logout failed' });\n    res.json({ message: 'Logged out' });\n  });\n});\n// Protected route middleware\nfunction requireLogin(req, res, next) {\n  if (!req.session.userId) {\n    return res.status(401).json({ error: 'Not authenticated' });\n  }\n  next();\n}\napp.get('/profile', requireLogin, (req, res) => {\n  res.json({ user: req.session.user });\n});"
                  }
        ],
        tips: [
                  "Always regenerate session ID after login — prevents session fixation attacks.",
                  "Use Redis store in production — in-memory sessions are lost on restart and don't scale.",
                  "Set httpOnly: true and secure: true — prevents XSS and insecure transmission.",
                  "Set sameSite: strict or lax — prevents CSRF token submission."
        ],
        mistake: "Not regenerating session ID on login — attacker can fix session ID before login, then log in with victim credentials.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "bcrypt-argon2",
        fn: "Password Hashing — bcrypt vs Argon2",
        desc: "Compare password hashing algorithms — bcrypt, Argon2, timing attacks, and best practices.",
        category: "Authentication",
        subtitle: "bcrypt, argon2, timing attacks, algorithm comparison",
        signature: "bcrypt.hash(password, 12)  |  argon2.hash(password)  |  timing-safe compare",
        descLong: "Password hashing must be slow to resist brute force. bcrypt is proven and widely used. Argon2 is newer, memory-hard (resists GPU attacks). Both include salt. Never use fast hashes (SHA256, MD5) for passwords. Compare hashes with timing-safe functions to prevent timing attacks (use bcrypt.compare, never ===). Key metrics: rounds (bcrypt), memory/time costs (Argon2).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Password Hashing — bcrypt vs Argon2 — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport bcrypt from 'bcrypt';\nimport * as argon2 from 'argon2';\nimport crypto from 'crypto';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Password Hashing — bcrypt vs Argon2 — common patterns you'll see in production.\n// APPROACH  - Combine Password Hashing — bcrypt vs Argon2 with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nasync function hashPasswordBcrypt(password) {\n  // 12 rounds: good security + reasonable speed (~100ms)\n  const hash = await bcrypt.hash(password, 12);\n  return hash;\n}\nasync function verifyBcrypt(password, hash) {\n  // Timing-safe comparison built in\n  const isValid = await bcrypt.compare(password, hash);\n  return isValid;\n}\nasync function hashPasswordArgon2(password) {\n  const hash = await argon2.hash(password, {\n    type: argon2.argon2id,      // resistant to GPU attacks\n    memoryCost: 65536,          // 64 MB\n    timeCost: 3,                // 3 iterations\n    parallelism: 4,             // 4 threads\n  });\n  return hash;\n}\nasync function verifyArgon2(password, hash) {\n  const isValid = await argon2.verify(hash, password);\n  return isValid;\n}\nfunction insecureCompare(password, hash) {\n  // WRONG: === comparison leaks timing info\n  return password === hash; // ❌ Timing leak\n}\nfunction timingSafeCompare(password, hash) {\n  // RIGHT: use timing-safe comparison\n  return crypto.timingSafeEqual(\n    Buffer.from(password),\n    Buffer.from(hash)\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Password Hashing — bcrypt vs Argon2 — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nasync function hashPasswordWithMigration(password, useArgon2 = false) {\n  if (useArgon2) {\n    return hashPasswordArgon2(password);\n  } else {\n    return hashPasswordBcrypt(password);\n  }\n}\nasync function verifyAnyHash(password, hash) {\n  try {\n    // Try Argon2 first\n    return await argon2.verify(hash, password);\n  } catch {\n    // Fall back to bcrypt\n    return bcrypt.compare(password, hash);\n  }\n}\n// Usage in login\napp.post('/login', async (req, res) => {\n  const { email, password } = req.body;\n  const user = await db.users.findByEmail(email);\n  // Use timing-safe comparison\n  const isValid = await verifyBcrypt(password, user.passwordHash);\n  if (!isValid) {\n    return res.status(401).json({ error: 'Invalid credentials' });\n  }\n  res.json({ token: jwt.sign({ userId: user.id }) });\n});\n// bcrypt:\n//   + Proven, widely supported\n//   + Slow hash by design (adaptive cost)\n//   - Slower than Argon2 for legitimate users\n//\n// Argon2:\n//   + Faster than bcrypt (80ms vs 100ms at 12 rounds)\n//   + Memory-hard (resists GPU/ASIC attacks)\n//   + Newer, recommended by OWASP\n//   - Slightly less deployed than bcrypt"
                  }
        ],
        tips: [
                  "Use bcrypt.compare() or argon2.verify() — never === for hashes (timing attack).",
                  "Increase rounds/iterations as hardware improves — currently: bcrypt 12-13 rounds, Argon2 timeCost=3.",
                  "Argon2id is recommended over Argon2i or Argon2d — hybrid approach.",
                  "Hash migration: verify with both algorithms during transition period, rehash on successful verify."
        ],
        mistake: "Using simple string comparison (===) for hash verification — leaks timing information allowing attackers to guess the hash one byte at a time.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "input-sanitization",
        fn: "Input Sanitization — HTML & SQL",
        desc: "Sanitize inputs to prevent XSS, HTML injection, and SQL injection.",
        category: "Security",
        subtitle: "DOMPurify, sanitize-html, parameterized queries",
        signature: "sanitizeHtml(input)  |  db.query(sql, [params])",
        descLong: "Separate validation (is data correct format?) from sanitization (is data safe to use?). Sanitize HTML to allow safe markup while removing scripts. Use parameterized queries for SQL to prevent injection. For APIs returning JSON, escape/encode dangerous characters. Never trust user input; always sanitize on server.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Input Sanitization — HTML & SQL — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport sanitizeHtml from 'sanitize-html';\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Input Sanitization — HTML & SQL — common patterns you'll see in production.\n// APPROACH  - Combine Input Sanitization — HTML & SQL with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst safeHtml = sanitizeHtml(userInput, {\n  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],\n  allowedAttributes: {\n    'a': ['href', 'title'],\n  },\n  allowedIframeHostnames: [],  // never allow iframes from users\n});\napp.post('/comments', (req, res) => {\n  const { text } = req.body;\n  // Sanitize HTML\n  const clean = sanitizeHtml(text, {\n    allowedTags: ['b', 'i', 'strong', 'em'],\n    allowedAttributes: {},\n  });\n  // Store sanitized version\n  db.comments.create({ text: clean });\n  res.json({ comment: clean });\n});\napp.get('/users/:id', async (req, res) => {\n  const { id } = req.params;\n  // BAD: string concatenation\n  // const query = `SELECT * FROM users WHERE id = ${id}`;\n  // db.query(query); // VULNERABLE!\n  // GOOD: parameterized query\n  const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);\n  res.json(user);\n});\napp.get('/api/search', (req, res) => {\n  const { q } = req.query;\n  // Escape dangerous characters\n  const escaped = JSON.stringify({ query: q }); // JSON escaping\n  res.json({ results: [], escaped_query: escaped });\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Input Sanitization — HTML & SQL — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst commentSchema = z.object({\n  text: z.string()\n    .min(1)\n    .max(1000)\n    .transform(val => sanitizeHtml(val, {\n      allowedTags: ['b', 'i', 'strong'],\n    })),\n  email: z.string().email(),\n});\napp.post('/api/comments', (req, res) => {\n  const result = commentSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({ errors: result.error.flatten() });\n  }\n  // result.data.text is now sanitized\n  db.comments.create(result.data);\n  res.json(result.data);\n});\napp.post('/api/users', (req, res) => {\n  const { name, bio } = req.body;\n  // Validate fields\n  if (typeof name !== 'string' || name.length > 100) {\n    return res.status(400).json({ error: 'Invalid name' });\n  }\n  // Sanitize bio (remove scripts)\n  const cleanBio = sanitizeHtml(bio, {\n    allowedTags: ['b', 'i', 'a'],\n    allowedAttributes: { 'a': ['href'] },\n  });\n  db.users.create({ name, bio: cleanBio });\n  res.json({ name, bio: cleanBio });\n});"
                  }
        ],
        tips: [
                  "Sanitize at output time, not input time — you may need the original data later.",
                  "Never store unsanitized data for display — always sanitize when rendering.",
                  "Use parameterized queries for ALL database queries — concatenation is always wrong.",
                  "JSON.stringify() escapes dangerous characters — use it for JSON responses."
        ],
        mistake: "Storing unsanitized HTML and sanitizing only when displaying — if display logic changes, old data may be unsafe.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "rate-limiting",
        fn: "Rate Limiting Advanced — Per-User, Custom Keys",
        desc: "Advanced rate limiting strategies — per-user limits, custom key generators, sliding windows with Redis.",
        category: "Security",
        subtitle: "express-rate-limit, custom keyGenerator, per-user limits",
        signature: "keyGenerator: (req) => req.user.id  |  RedisStore with sliding window",
        descLong: "Basic rate limiting uses client IP; advanced strategies rate-limit by user ID, API key, or custom identifier. Custom keyGenerator allows flexible key selection. Redis-backed sliding window stores handle distributed systems. Skip successful requests (e.g., successful logins) to not penalize legitimate users. Combine with custom handlers for partial rate limiting or alerting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Rate Limiting Advanced — Per-User, Custom Keys — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport rateLimit from 'express-rate-limit';\nimport RedisStore from 'rate-limit-redis';\nimport { createClient } from 'redis';\nconst redisClient = createClient({ url: process.env.REDIS_URL });\nredisClient.connect();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Rate Limiting Advanced — Per-User, Custom Keys — common patterns you'll see in production.\n// APPROACH  - Combine Rate Limiting Advanced — Per-User, Custom Keys with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst perUserLimiter = rateLimit({\n  store: new RedisStore({\n    sendCommand: (...args) => redisClient.sendCommand(args),\n  }),\n  windowMs: 60 * 60 * 1000,     // 1 hour\n  max: 100,                      // 100 requests per user per hour\n  keyGenerator: (req) => {\n    // Rate limit by authenticated user ID\n    return req.user?.id || req.ip;\n  },\n  skip: (req) => !req.user,      // skip if not authenticated\n});\napp.use('/api/protected', perUserLimiter);\nconst apiKeyLimiter = rateLimit({\n  store: new RedisStore({\n    sendCommand: (...args) => redisClient.sendCommand(args),\n  }),\n  windowMs: 60 * 1000,           // 1 minute\n  max: (req, res) => {\n    // Different limits for different tiers\n    const tier = req.apiKeyTier || 'free';\n    const limits = {\n      free: 10,\n      pro: 100,\n      enterprise: 10000,\n    };\n    return limits[tier] || 10;\n  },\n  keyGenerator: (req) => {\n    // Rate limit by API key\n    return req.headers['x-api-key'] || req.ip;\n  },\n});\napp.use('/api/v1/', apiKeyLimiter);\nconst strictLimiter = rateLimit({\n  store: new RedisStore({\n    sendCommand: (...args) => redisClient.sendCommand(args),\n  }),\n  windowMs: 15 * 60 * 1000,      // 15 minutes\n  max: 5,\n  keyGenerator: (req) => req.user?.id || req.ip,\n  skip: (req) => !req.user,\n  handler: (req, res) => {\n    // Custom handler — log, alert, etc.\n    logger.warn({\n      userId: req.user?.id,\n      ip: req.ip,\n      path: req.path,\n    }, 'Rate limit exceeded');\n    // Alert on suspicious activity\n    if (req.user?.id) {\n      notifySecurityTeam({\n        event: 'rate_limit_exceeded',\n        userId: req.user.id,\n        attempts: req.rateLimit.current,\n      });\n    }\n    res.status(429).json({\n      error: 'Too many requests',\n      retryAfter: req.rateLimit.resetTime,\n    });\n  },\n});\napp.post('/api/login', strictLimiter, async (req, res) => {\n  // Login logic\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Rate Limiting Advanced — Per-User, Custom Keys — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst loginLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000,\n  max: 5,\n  skipSuccessfulRequests: true,  // don't count successful logins\n  keyGenerator: (req) => req.body.email || req.ip,\n});\nconst globalLimiter = rateLimit({\n  windowMs: 60 * 1000,\n  max: 1000,\n  keyGenerator: (req) => req.ip,\n});\nconst endpointLimiter = rateLimit({\n  windowMs: 60 * 1000,\n  max: 50,\n  keyGenerator: (req) => req.user?.id || req.ip,\n});\n// Global limit first, then endpoint-specific\napp.use(globalLimiter);\napp.post('/api/expensive-operation', endpointLimiter, async (req, res) => {\n  // Logic\n});"
                  }
        ],
        tips: [
                  "Use user ID for authenticated endpoints, IP for public — avoids penalizing shared IP addresses.",
                  "skipSuccessfulRequests for login/signup — reduces friction for legitimate users.",
                  "Custom handler for security alerts — log rate limit events for suspicious patterns.",
                  "Different limits for different API tiers — free users get fewer requests than paid."
        ],
        mistake: "Rate limiting only by IP — shared IPs (corporate networks, VPNs) get blocked unfairly. Use user ID for authenticated requests.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "cors-config",
        fn: "CORS Configuration & Security",
        desc: "Configure CORS properly — origin whitelist, credentials, preflight handling.",
        category: "Security",
        subtitle: "cors middleware, origin whitelist, credentials, preflight",
        signature: "cors({ origin: [...], credentials: true, methods: [...] })",
        descLong: "CORS (Cross-Origin Resource Sharing) allows controlled cross-origin requests from browsers. Specify exact origins, never \"*\". With credentials: true, specific origins required. Preflight requests (OPTIONS) are automatic. CORS is browser-enforced only; server-to-server requests bypass it. Set maxAge for preflight caching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CORS Configuration & Security — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport cors from 'cors';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CORS Configuration & Security — common patterns you'll see in production.\n// APPROACH  - Combine CORS Configuration & Security with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst whitelist = [\n  'https://myapp.com',\n  'https://app.myapp.com',\n  'https://admin.myapp.com',\n];\nconst corsOptions = {\n  origin: (origin, callback) => {\n    if (!origin || whitelist.includes(origin)) {\n      callback(null, true);\n    } else {\n      callback(new Error('Not allowed by CORS'));\n    }\n  },\n  credentials: true,           // allow cookies/auth headers\n  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],\n  allowedHeaders: ['Content-Type', 'Authorization'],\n  exposedHeaders: ['X-Total-Count'],\n  maxAge: 3600,               // preflight cache 1 hour\n};\napp.use(cors(corsOptions));\nconst publicCors = cors({\n  origin: '*',\n  methods: ['GET'],\n});\nconst authCors = cors({\n  origin: whitelist,\n  credentials: true,\n  methods: ['GET', 'POST', 'PUT', 'DELETE'],\n});\napp.use('/api/public', publicCors);\napp.use('/api/protected', authCors);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CORS Configuration & Security — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst corsConfig = process.env.NODE_ENV === 'production'\n  ? corsOptions\n  : {\n      origin: true,           // allow all origins in dev\n      credentials: true,\n    };\napp.use(cors(corsConfig));\n// Server-to-server requests bypass CORS entirely:\n// curl -H \"Origin: http://evil.com\" http://api.myapp.com\n//   → Server MUST validate authorization headers\n//   → CORS only restricts browser requests\n//\n// Always validate API tokens/sessions server-side"
                  }
        ],
        tips: [
                  "Never use origin: \"*\" with credentials: true — browsers reject this combination.",
                  "CORS is browser enforcement only — doesn't protect from server-to-server attacks.",
                  "Whitelist exact origins — avoid wildcards like \"https://*.myapp.com\".",
                  "Preflight caching (maxAge) reduces OPTIONS requests — increases performance."
        ],
        mistake: "Setting origin: \"*\" assuming it protects API — it only restricts browser requests. Server-side authorization is still required.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "tls-https",
        fn: "TLS/HTTPS — Certificate Pinning & HSTS",
        desc: "Advanced HTTPS — certificate pinning, HSTS preload, cert rotation strategies.",
        category: "Network Security",
        subtitle: "TLS 1.3, certificate pinning, HSTS preload, cert renewal",
        signature: "https.createServer({ key, cert })  |  pin public key hash  |  HSTS preload",
        descLong: "TLS encrypts traffic end-to-end. TLS 1.3 is the latest and most secure. Certificate pinning verifies the server certificate matches a known hash — prevents MITM via fake CAs. HSTS preload tells browsers to always use HTTPS, even on first visit. Automate certificate renewal (Let's Encrypt expires every 90 days). Forward secrecy ensures old traffic remains encrypted even if private key compromises.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of TLS/HTTPS — Certificate Pinning & HSTS — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport https from 'https';\nimport fs from 'fs';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of TLS/HTTPS — Certificate Pinning & HSTS — common patterns you'll see in production.\n// APPROACH  - Combine TLS/HTTPS — Certificate Pinning & HSTS with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst options = {\n  key: fs.readFileSync('./private.key'),\n  cert: fs.readFileSync('./certificate.crt'),\n  minVersion: 'TLSv1.3',           // require TLS 1.3\n};\nconst httpsServer = https.createServer(options, app);\nimport http from 'http';\nhttp.createServer((req, res) => {\n  res.writeHead(301, {\n    Location: `https://${req.headers.host}${req.url}`\n  });\n  res.end();\n}).listen(80);\nimport crypto from 'crypto';\n// Calculate hash of certificate public key\nfunction getCertHash(certPath) {\n  const cert = fs.readFileSync(certPath, 'utf8');\n  const publicKey = crypto\n    .createPublicKey(cert)\n    .export({ format: 'der' });\n  const hash = crypto\n    .createHash('sha256')\n    .update(publicKey)\n    .digest('base64');\n  return hash;\n}\nconst pinned = getCertHash('./certificate.crt');\nconsole.log(`Pin public key: ${pinned}`);\nimport helmet from 'helmet';\napp.use(helmet.hsts({\n  maxAge: 31536000,              // 1 year in seconds\n  includeSubDomains: true,\n  preload: true,                 // submit to hstspreload.org\n}));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of TLS/HTTPS — Certificate Pinning & HSTS — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Install certbot:\n// sudo apt-get install certbot python3-certbot-nginx\n// Generate certificate:\n// certbot certonly --standalone -d example.com\n// Auto-renewal (runs daily via cron):\n// certbot renew --quiet\nimport { spawn } from 'child_process';\nimport schedule from 'node-schedule';\n// Renew cert every 30 days\nschedule.scheduleJob('0 0 * * 0', async () => {\n  console.log('Running cert renewal...');\n  const certbot = spawn('certbot', ['renew', '--quiet']);\n  certbot.on('close', (code) => {\n    if (code === 0) {\n      console.log('Cert renewed successfully');\n      // Graceful reload (PM2 or systemd handles this)\n      process.kill(process.pid, 'SIGHUP');\n    }\n  });\n});\n// Modern, secure cipher suites (TLS 1.3 handles most):\n// ECDHE-RSA-AES128-GCM-SHA256  (DHE for forward secrecy)\n// ECDHE-ECDSA-AES256-GCM-SHA384\n//\n// Avoid:\n// RC4, MD5, DES, 3DES (broken)\n// NULL ciphers (no encryption)\n// EXPORT ciphers (weak)"
                  }
        ],
        tips: [
                  "Use Let's Encrypt for free certs — no reason for self-signed in production.",
                  "HSTS preload requires submission to hstspreload.org — blocks downgrade attacks.",
                  "Automate cert renewal 30+ days before expiry — Let's Encrypt certs expire every 90 days.",
                  "Require TLS 1.3 in production — TLS 1.2 has known attacks."
        ],
        mistake: "Using self-signed certs in production — users will get security warnings. Let's Encrypt is free and trustworthy.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "dependency-audit",
        fn: "Dependency Security Auditing",
        desc: "Audit dependencies for vulnerabilities — npm audit, snyk, dependabot, SBOM generation.",
        category: "Security",
        subtitle: "npm audit, snyk, dependabot, SBOM, vulnerability tracking",
        signature: "npm audit  |  snyk test  |  dependabot in GitHub  |  cyclonedx SBOM",
        descLong: "Dependencies contain vulnerabilities. npm audit scans local packages. Snyk provides ongoing monitoring. GitHub Dependabot auto-creates PRs for updates. SBOMs (Software Bill of Materials) list all dependencies for compliance. Automate dependency updates in CI. Pin major versions for stability; patch/minor updates can auto-merge if tests pass.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dependency Security Auditing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// npm audit              # scan and report\n// npm audit --json      # machine-readable output\n// npm audit fix         # auto-fix where possible\n// npm audit fix --force # force newer versions (risky)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dependency Security Auditing — common patterns you'll see in production.\n// APPROACH  - Combine Dependency Security Auditing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nversion: 2\nupdates:\n  - package-ecosystem: \"npm\"\n    directory: \"/\"\n    schedule:\n      interval: \"weekly\"\n    allow:\n      - dependency-type: \"production\"\n      - dependency-type: \"direct\"\n    reviewers:\n      - \"security-team\"\n    commit-message:\n      prefix: \"chore(deps):\"\n    pull-request-branch-name:\n      separator: \"/\"\n{\n  \"scripts\": {\n    \"audit\": \"npm audit\",\n    \"audit:fix\": \"npm audit fix\",\n    \"snyk\": \"snyk test\",\n    \"sbom\": \"cyclonedx-npm --output-json sbom.json\"\n  }\n}\nname: Dependency Audit\non: [push, pull_request]\njobs:\n  audit:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm audit --audit-level=moderate\n      - name: Run Snyk\n        uses: snyk/actions/node@master\n        env:\n          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}\n// npm install -g snyk\n// snyk auth                   # login with GitHub/GitLab\n// snyk test                   # scan local packages\n// snyk monitor                # continuous monitoring\n// snyk protect                # apply patches locally"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dependency Security Auditing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// npm install -g @cyclonedx/npm\n// cyclonedx-npm -o sbom.json  # generate SBOM in CycloneDX format\n// Always commit package-lock.json:\n// - Reproduces exact versions across all machines\n// - Prevents dependency confusion attacks\n// - Required for npm ci (clean install)\n// renovate.json\n{\n  \"extends\": [\"config:base\"],\n  \"automerge\": true,\n  \"major\": {\n    \"enabled\": false  // don't auto-merge major versions\n  },\n  \"patch\": {\n    \"automerge\": true  // auto-merge patch updates\n  }\n}"
                  }
        ],
        tips: [
                  "npm audit --audit-level=moderate catches important vulnerabilities, not false positives.",
                  "Use npm ci instead of npm install in CI — ensures exact lock file versions.",
                  "Snyk provides more context than npm audit — integration with GitHub for auto-PRs.",
                  "Keep npm/yarn updated — npm audit improves with new vulnerability data."
        ],
        mistake: "Ignoring npm audit warnings — outdated packages accumulate security debt.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "secrets-management",
        fn: "Secrets Management — Environment Variables & Vault",
        desc: "Manage sensitive data securely — dotenv-vault, AWS Secrets Manager, HashiCorp Vault.",
        category: "Configuration",
        subtitle: "dotenv-vault, AWS Secrets Manager, Vault, encryption",
        signature: "dotenv.config()  |  aws.secretsmanager.getSecretValue()  |  vault.read()",
        descLong: "Never hardcode secrets (API keys, DB passwords, JWT secrets) in code. Environment variables are standard. dotenv-vault encrypts .env files. AWS Secrets Manager rotates secrets automatically. HashiCorp Vault is enterprise-grade secret management with audit logs. Load secrets at startup, validate required ones. Use different secrets per environment (dev vs prod). Rotate secrets regularly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Secrets Management — Environment Variables & Vault — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport dotenv from 'dotenv';\nimport { DotenvConfigOptions } from 'dotenv';\ndotenv.config();\n// Or use vault with encryption:\n// npm install dotenv-vault\n// npx dotenv-vault new local\n// npx dotenv-vault new production\n// npx dotenv-vault push     # encrypt and upload\n// npx dotenv-vault pull     # download and decrypt\nexport const secrets = Object.freeze({\n  databasePassword: process.env.DATABASE_PASSWORD,\n  jwtSecret: process.env.JWT_SECRET,\n  apiKey: process.env.API_KEY,\n  slackWebhook: process.env.SLACK_WEBHOOK,\n});\n// Validate at startup\nObject.entries(secrets).forEach(([key, value]) => {\n  if (!value) {\n    throw new Error(`Missing required secret: ${key}`);\n  }\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Secrets Management — Environment Variables & Vault — common patterns you'll see in production.\n// APPROACH  - Combine Secrets Management — Environment Variables & Vault with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nimport { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';\nconst secretsManagerClient = new SecretsManagerClient({\n  region: process.env.AWS_REGION,\n});\nasync function getSecret(secretName) {\n  try {\n    const command = new GetSecretValueCommand({ SecretId: secretName });\n    const response = await secretsManagerClient.send(command);\n    if ('SecretString' in response) {\n      return JSON.parse(response.SecretString);\n    } else {\n      return response.SecretBinary;\n    }\n  } catch (err) {\n    console.error(`Failed to get secret ${secretName}:`, err);\n    throw err;\n  }\n}\n// Usage\nconst dbSecret = await getSecret('prod/database');\nconst apiSecret = await getSecret('prod/api-keys');\nconst config = Object.freeze({\n  databaseUrl: dbSecret.url,\n  databasePassword: dbSecret.password,\n  apiKey: apiSecret.key,\n});\nimport vault from 'node-vault';\nconst vaultClient = vault({\n  endpoint: process.env.VAULT_ADDR,\n  token: process.env.VAULT_TOKEN,\n});\nasync function getVaultSecret(path) {\n  const secret = await vaultClient.read(path);\n  return secret.data.data;\n}\n// Usage\nconst dbCreds = await getVaultSecret('secret/data/database');\nconst apiKeys = await getVaultSecret('secret/data/api');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Secrets Management — Environment Variables & Vault — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconsole.log(secrets.jwtSecret);  // ❌ WRONG — logs secret to stdout\n// Redact in error messages\ntry {\n  await db.connect(secrets.databasePassword);\n} catch (err) {\n  // Redact password from error logs\n  const message = err.message.replace(secrets.databasePassword, '***');\n  logger.error({ error: message });\n}\n// Automatically rotate secrets every 30 days:\n// AWS Lambda function triggered on schedule\n// Generates new password\n// Updates database\n// Stores new secret in Secrets Manager\n// Old secret still works during grace period"
                  }
        ],
        tips: [
                  "Never commit .env files — add to .gitignore. Use .env.example with placeholders.",
                  "Different secrets per environment — prod secrets never in dev .env.",
                  "Rotate secrets regularly — database passwords every 90 days, API keys yearly.",
                  "Use AWS KMS encryption or Vault to encrypt secrets at rest."
        ],
        mistake: "Storing secrets in environment variables without encryption — anyone with server access gets them. Use encrypted vaults.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
    ],
  },
]

export default { meta, sections }
