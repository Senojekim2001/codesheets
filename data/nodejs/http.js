export const meta = {
  "title": "Express & HTTP",
  "domain": "nodejs",
  "sheet": "http",
  "icon": "🌐"
}

export const sections = [

  // ── Section 1: Express & HTTP ─────────────────────────────────────────
  {
    id: "express-http",
    title: "Express & HTTP",
    entries: [
      {
        id: "express-basics",
        fn: "Express App",
        desc: "Create an Express server with routing, JSON parsing, and graceful shutdown.",
        category: "Express Setup",
        subtitle: "Production-ready Express boilerplate",
        signature: "const app = express()  →  app.use() / app.get() / app.listen()",
        descLong: "Express is the most widely used Node.js web framework. app.use() registers middleware. Route methods (get, post, put, delete) register route handlers. Always call app.listen() on a stored server reference so you can close it gracefully.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Express App — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Express App — common patterns you'll see in production.\n// APPROACH  - Combine Express App with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\n// Built-in middleware\napp.use(express.json());                    // parse JSON bodies\napp.use(express.urlencoded({ extended: true })); // parse form data\n// CORS — using the cors package\nimport cors from 'cors';\napp.use(cors({ origin: process.env.CLIENT_URL }));\n// Routes\napp.get('/health', (req, res) => res.json({ status: 'ok' }));\napp.use('/api/users', userRouter);\napp.use('/api/posts', postRouter);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Express App — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// 404 handler (after all routes)\napp.use((req, res) => res.status(404).json({ error: 'Not found' }));\n// Graceful shutdown\nconst server = app.listen(process.env.PORT ?? 3000, () => {\n  console.log(`Server running on port ${server.address().port}`);\n});\nprocess.on('SIGTERM', () => {\n  server.close(() => process.exit(0));\n});"
                  }
        ],
        tips: [
                  "Always store the return value of app.listen() — you need it for graceful shutdown.",
                  "express.json() has a default 100kb limit — increase with express.json({ limit: \"10mb\" }).",
                  "Register routes in order: specific before wildcard, 404 handler last, error handler after that.",
                  "Use express-async-errors or wrap handlers to catch async errors and pass to next()."
        ],
        mistake: "Not calling express.json() middleware before routes that read req.body — req.body will be undefined without it.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "express-router",
        fn: "express.Router()",
        desc: "Creates a mini Express app for modular route definitions — mount on the main app with app.use().",
        category: "Express Setup",
        subtitle: "Modular route grouping",
        signature: "const router = express.Router()  →  router.get() / router.post()",
        descLong: "Router instances let you organize routes into separate files. Each router is a mini-app with its own middleware. Mount it on the main app with a prefix using app.use(\"/prefix\", router). Routers support params via router.param() for centralized param resolution.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of express.Router() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// routes/users.js\nimport { Router } from 'express';\nimport { authenticate } from '../middleware/auth.js';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of express.Router() — common patterns you'll see in production.\n// APPROACH  - Combine express.Router() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst router = Router();\n// All routes in this file are under /api/users\nrouter.use(authenticate); // applies to all routes in this router\nrouter.get('/', async (req, res, next) => {\n  try {\n    const users = await User.findAll();\n    res.json(users);\n  } catch (err) {\n    next(err); // pass to error handler\n  }\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of express.Router() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nrouter.get('/:id', async (req, res, next) => {\n  try {\n    const user = await User.findById(req.params.id);\n    if (!user) return res.status(404).json({ error: 'Not found' });\n    res.json(user);\n  } catch (err) {\n    next(err);\n  }\n});\nexport default router;\n// app.js\napp.use('/api/users', userRouter);"
                  }
        ],
        tips: [
                  "Always pass errors to next(err) in async route handlers — Express's error handler won't catch thrown errors.",
                  "Router-level middleware only applies to routes in that router — great for auth on specific routes.",
                  "Use router.route(\"/path\").get(fn).post(fn) to chain methods on the same path.",
                  "The express-async-handler wrapper eliminates repetitive try/catch: router.get(\"/\", asyncHandler(fn))."
        ],
        mistake: "Throwing errors in async route handlers instead of calling next(err) — Express won't catch async throws without the express-async-errors package.",
        shorthand: {
          verbose: "const router = express.Router();\nrouter.get('/users', (req, res) => {\n  res.json({ users: [] });\n});\napp.use('/api', router);",
          concise: "const userRouter = Router();\nuserRouter.get('/:id', (req, res) => res.json({ id: req.params.id }));\napp.use('/api/users', userRouter);",
        },
      },
      {
        id: "custom-middleware",
        fn: "Custom Middleware",
        desc: "Middleware functions receive (req, res, next) — call next() to pass control to the next middleware.",
        category: "Middleware",
        subtitle: "Writing and chaining middleware",
        signature: "(req, res, next) => { /* modify req/res or call next() */ }",
        descLong: "Middleware is a function with signature (req, res, next). It can modify req and res, end the response, or call next() to continue the chain. Error-handling middleware has four arguments: (err, req, res, next). Register error middleware last, after all routes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';\nimport jwt from 'jsonwebtoken';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Middleware — common patterns you'll see in production.\n// APPROACH  - Combine Custom Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Request logging\nfunction requestLogger(req, res, next) {\n  const start = Date.now();\n  res.on('finish', () => {\n    console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);\n  });\n  next(); // must call next or request hangs\n}\n// Auth middleware\nfunction authenticate(req, res, next) {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  try {\n    req.user = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch {\n    res.status(401).json({ error: 'Invalid token' });\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Error handler — 4 params, registered last\nfunction errorHandler(err, req, res, next) {\n  console.error(err);\n  res.status(err.status ?? 500).json({ error: err.message });\n}\napp.use(requestLogger);\napp.use('/api', authenticate);\napp.use(errorHandler); // after all routes"
                  }
        ],
        tips: [
                  "Always call next() if you don't end the response — otherwise the request hangs.",
                  "Error middleware must have exactly 4 parameters — Express detects it by arity.",
                  "Attach data to req (req.user, req.requestId) for downstream handlers to consume.",
                  "Use helmet() middleware to set security headers automatically in production."
        ],
        mistake: "Forgetting to call next() in middleware that doesn't send a response — the request will hang indefinitely with no error.",
        shorthand: {
          verbose: "function myMiddleware(req, res, next) {\n  console.log('Processing...');\n  // forgot next()\n}\napp.use(myMiddleware);  // Request hangs!",
          concise: "app.use((req, res, next) => {\n  req.startTime = Date.now();\n  next();  // Always call next()\n});",
        },
      },
      {
        id: "http-module",
        fn: "http.createServer()",
        desc: "Create a raw HTTP server without any framework — the foundation Express is built on.",
        category: "Native HTTP",
        subtitle: "Framework-free HTTP server",
        signature: "const server = http.createServer((req, res) => { })",
        descLong: "The built-in http module lets you create HTTP servers without Express. req is an IncomingMessage (stream); res is a ServerResponse. You must read req body manually via stream events. Useful for understanding how Node HTTP works or for ultra-minimal services.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of http.createServer() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport http from 'http';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of http.createServer() — common patterns you'll see in production.\n// APPROACH  - Combine http.createServer() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst server = http.createServer(async (req, res) => {\n  // Read body\n  const body = await new Promise((resolve) => {\n    const chunks = [];\n    req.on('data', chunk => chunks.push(chunk));\n    req.on('end', () => resolve(Buffer.concat(chunks).toString()));\n  });\n  if (req.method === 'GET' && req.url === '/health') {\n    res.writeHead(200, { 'Content-Type': 'application/json' });\n    res.end(JSON.stringify({ status: 'ok' }));\n    return;\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of http.createServer() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nres.writeHead(404, { 'Content-Type': 'application/json' });\n  res.end(JSON.stringify({ error: 'Not found' }));\n});\nserver.listen(3000, () => console.log('Listening on :3000'));"
                  }
        ],
        tips: [
                  "Always set Content-Type header before calling res.end().",
                  "req.url includes the query string — use new URL(req.url, \"http://x\") to parse it.",
                  "Use Express, Fastify, or Hono for real apps — the native http module requires too much boilerplate.",
                  "http.createServer returns the same Server object as https.createServer — they share the interface."
        ],
        mistake: "Forgetting to call res.end() — the client will hang waiting for the response to complete.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "express-security",
        fn: "Express Security Middleware",
        desc: "helmet, cors, express-rate-limit — essential security middleware for production Express apps.",
        category: "Express Patterns",
        subtitle: "Production security hardening",
        signature: "app.use(helmet())  |  app.use(cors(options))  |  app.use(rateLimit(options))",
        descLong: "Every production Express app needs at minimum: helmet (secure headers), cors (cross-origin control), and rate limiting. Helmet sets 14 security headers by default. CORS must be configured before route handlers. Rate limiting prevents brute-force and DoS attacks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Express Security Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport helmet from 'helmet';\nimport cors from 'cors';\nimport rateLimit from 'express-rate-limit';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Express Security Middleware — common patterns you'll see in production.\n// APPROACH  - Combine Express Security Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Helmet — sets secure headers\napp.use(helmet());\n// Customise: app.use(helmet({ contentSecurityPolicy: { ... } }))\n// CORS — restrict to known origins\napp.use(cors({\n  origin: ['https://app.example.com', 'https://admin.example.com'],\n  methods: ['GET', 'POST', 'PUT', 'DELETE'],\n  credentials: true,\n}));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Express Security Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Rate limiting — global\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 100,\n  standardHeaders: true,\n  legacyHeaders: false,\n});\napp.use(limiter);\n// Stricter limit for auth routes\nconst authLimiter = rateLimit({ windowMs: 60_000, max: 5 });\napp.post('/auth/login', authLimiter, loginHandler);"
                  }
        ],
        tips: [
                  "Apply CORS before all route definitions — order matters in Express middleware.",
                  "helmet() enables all security headers — check each before disabling any.",
                  "Rate limiting should be applied at the load balancer level too for full protection.",
                  "Use compression middleware (import compression from \"compression\") to gzip responses."
        ],
        mistake: "Applying CORS after defining routes — CORS headers must be set before the browser's preflight OPTIONS request is handled. Put cors() before your routes.",
        shorthand: {
          verbose: "app.use(helmet());\napp.use(cors());\nconst limiter = rateLimit({ windowMs: 900000, max: 100 });\napp.use(limiter);\napp.get('/data', (req, res) => res.json({}));",
          concise: "app.use(helmet());  // Headers first\napp.use(cors({ origin: 'https://example.com' }));\napp.use(rateLimit({ windowMs: 900000, max: 100 }));\napp.get('/data', handler);  // Routes after",
        },
      },
      {
        id: "multer-uploads",
        fn: "multer (File Uploads)",
        desc: "Handle multipart/form-data file uploads in Express — store to disk or memory.",
        category: "Express Patterns",
        subtitle: "Multipart form-data file handling",
        signature: "const upload = multer({ dest: \"uploads/\" })  →  upload.single(\"file\")",
        descLong: "multer is the standard middleware for handling file uploads in Express. It parses multipart/form-data and makes files available on req.file (single) or req.files (multiple). Store to disk with diskStorage or process in memory with memoryStorage for direct upload to cloud storage.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of multer (File Uploads) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';\nimport multer from 'multer';\nimport path from 'path';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of multer (File Uploads) — common patterns you'll see in production.\n// APPROACH  - Combine multer (File Uploads) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Disk storage with validation\nconst storage = multer.diskStorage({\n  destination: (req, file, cb) => cb(null, 'uploads/'),\n  filename: (req, file, cb) => {\n    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;\n    cb(null, unique + path.extname(file.originalname));\n  },\n});\nconst upload = multer({\n  storage,\n  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB\n  fileFilter: (req, file, cb) => {\n    const allowed = /jpeg|jpg|png|webp/;\n    const isValid = allowed.test(file.mimetype);\n    cb(isValid ? null : new Error('Images only'), isValid);\n  },\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of multer (File Uploads) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Routes\napp.post('/avatar', upload.single('avatar'), (req, res) => {\n  res.json({ path: req.file.path });\n});\n// Memory storage — stream directly to S3\nconst memUpload = multer({ storage: multer.memoryStorage() });\napp.post('/upload', memUpload.single('file'), async (req, res) => {\n  await s3.putObject({ Body: req.file.buffer, ... });\n});"
                  }
        ],
        tips: [
                  "Always validate file type via mimetype AND file extension — never trust the client.",
                  "memoryStorage keeps files in req.file.buffer — ideal for direct-to-cloud uploads.",
                  "Set fileSize limits to prevent disk exhaustion attacks.",
                  "multer does not handle the actual storage to cloud — use AWS SDK or similar after multer."
        ],
        mistake: "Storing user-uploaded files in a public directory served by Express — uploaded files may be executable. Use a private directory and serve files via signed URLs.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "jwt-auth",
        fn: "JWT Authentication",
        desc: "Issue and verify JSON Web Tokens for stateless authentication in Express APIs.",
        category: "Express Patterns",
        subtitle: "Stateless API authentication with JWTs",
        signature: "jwt.sign(payload, secret, options)  |  jwt.verify(token, secret)",
        descLong: "JWTs encode claims in a signed, base64-encoded token. jsonwebtoken is the standard Node library. Sign tokens at login; verify them in an auth middleware. Always set an expiry (expiresIn). Refresh tokens require a separate long-lived token stored in an httpOnly cookie.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of JWT Authentication — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';\nimport jwt from 'jsonwebtoken';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of JWT Authentication — common patterns you'll see in production.\n// APPROACH  - Combine JWT Authentication with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst JWT_SECRET = process.env.JWT_SECRET;\n// Sign at login\nfunction issueToken(userId, role) {\n  return jwt.sign(\n    { sub: userId, role },\n    JWT_SECRET,\n    { expiresIn: '15m', algorithm: 'HS256' }\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of JWT Authentication — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Auth middleware\nfunction authenticate(req, res, next) {\n  const header = req.headers.authorization;\n  if (!header?.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Missing token' });\n  }\n  try {\n    const token = header.slice(7);\n    req.user = jwt.verify(token, JWT_SECRET);\n    next();\n  } catch (err) {\n    if (err.name === 'TokenExpiredError') {\n      return res.status(401).json({ error: 'Token expired' });\n    }\n    res.status(401).json({ error: 'Invalid token' });\n  }\n}\napp.get('/protected', authenticate, (req, res) => {\n  res.json({ userId: req.user.sub });\n});"
                  }
        ],
        tips: [
                  "Short expiry (15m) for access tokens; longer (7d) for refresh tokens in httpOnly cookies.",
                  "Always specify the algorithm explicitly — never accept algorithm: \"none\".",
                  "Store sensitive data server-side — JWTs are base64 encoded, not encrypted.",
                  "Use RS256 (asymmetric) for distributed systems — verify without sharing the secret."
        ],
        mistake: "Setting expiresIn: \"never\" or a very long expiry — compromised tokens can't be invalidated. Use short access tokens + refresh token rotation.",
        shorthand: {
          verbose: "const token = jwt.sign({ id: 123 }, SECRET, { expiresIn: '365d' });\nconst decoded = jwt.verify(token, SECRET);\nres.json({ token });",
          concise: "const token = jwt.sign({ sub: userId }, SECRET, { expiresIn: '15m' });\nres.cookie('refresh', refreshToken, { httpOnly: true, maxAge: 604800000 });\njwt.verify(token, SECRET);",
        },
      },
      {
        id: "websocket-server",
        fn: "WebSocket Server",
        desc: "Real-time bidirectional communication between client and server via WebSocket protocol.",
        category: "Advanced HTTP",
        subtitle: "Persistent bidirectional connections",
        signature: "const ws = new WebSocket(url)  |  ws.on(\"message\", data => { })",
        descLong: "WebSockets upgrade HTTP to a persistent TCP connection for real-time data. The ws npm package is the standard. Server sends data to clients without polling. Useful for chat, notifications, collaborative editing. Always handle close and error events. Implement heartbeat/ping to detect dead connections.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WebSocket Server — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport WebSocket from 'ws';\nimport http from 'http';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WebSocket Server — common patterns you'll see in production.\n// APPROACH  - Combine WebSocket Server with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst server = http.createServer();\nconst wss = new WebSocket.Server({ server });\n// Track connected clients\nconst clients = new Set();\nwss.on('connection', (ws) => {\n  console.log('Client connected');\n  clients.add(ws);\n  // Handle incoming messages\n  ws.on('message', (data) => {\n    try {\n      const message = JSON.parse(data.toString());\n      // Broadcast to all clients\n      for (const client of clients) {\n        if (client.readyState === WebSocket.OPEN) {\n          client.send(JSON.stringify({\n            type: 'message',\n            user: message.user,\n            text: message.text,\n            timestamp: Date.now(),\n          }));\n        }\n      }\n    } catch (err) {\n      ws.send(JSON.stringify({ error: 'Invalid message format' }));\n    }\n  });\n  // Handle disconnection\n  ws.on('close', () => {\n    console.log('Client disconnected');\n    clients.delete(ws);\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WebSocket Server — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nws.on('error', (err) => {\n    console.error('WebSocket error:', err.message);\n    clients.delete(ws);\n  });\n  // Send initial welcome\n  ws.send(JSON.stringify({\n    type: 'welcome',\n    message: 'Connected to chat server',\n    clientCount: clients.size,\n  }));\n  // Heartbeat to detect stale connections\n  ws.isAlive = true;\n  ws.on('pong', () => {\n    ws.isAlive = true;\n  });\n});\n// Ping all clients periodically\nsetInterval(() => {\n  wss.clients.forEach((ws) => {\n    if (!ws.isAlive) {\n      return ws.terminate();\n    }\n    ws.isAlive = false;\n    ws.ping();\n  });\n}, 30_000);\nserver.listen(3000, () => console.log('WebSocket server on :3000'));"
                  }
        ],
        tips: [
                  "Check readyState before sending — OPEN=1, CONNECTING=0, CLOSING=2, CLOSED=3.",
                  "Implement heartbeat/ping every 30s to detect stale connections and close them.",
                  "Always parse incoming messages carefully — malformed JSON can crash if not wrapped in try/catch.",
                  "Use a message broker (Redis, RabbitMQ) for multi-server deployments — WebSockets are per-connection."
        ],
        mistake: "Sending data to all connected WebSockets without checking readyState — causes \"send() called in CLOSING or CLOSED state\" errors.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "server-sent-events",
        fn: "Server-Sent Events (SSE)",
        desc: "One-way streaming from server to client — simpler alternative to WebSockets for notifications.",
        category: "Advanced HTTP",
        subtitle: "Unidirectional server-to-client streaming",
        signature: "res.writeHead(200, { \"Content-Type\": \"text/event-stream\" })  →  res.write(\"data: ...\")",
        descLong: "SSE is an HTTP connection where the server streams newline-delimited events to the client. Simpler than WebSockets (no handshake), works through proxies, and auto-reconnects via browser. Use for notifications, live updates, progress streams. Limited to server→client only (unlike WebSockets).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Server-Sent Events (SSE) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Server-Sent Events (SSE) — common patterns you'll see in production.\n// APPROACH  - Combine Server-Sent Events (SSE) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\nconst clients = new Set();\n// SSE endpoint\napp.get('/events', (req, res) => {\n  // Set SSE headers\n  res.writeHead(200, {\n    'Content-Type': 'text/event-stream',\n    'Cache-Control': 'no-cache',\n    'Connection': 'keep-alive',\n    'Access-Control-Allow-Origin': '*',\n  });\n  // Send initial comment (keeps connection alive)\n  res.write(': heartbeat\\n\\n');\n  // Store client\n  clients.add(res);\n  // Send welcome event\n  res.write('event: welcome\\n');\n  res.write(`data: ${JSON.stringify({ connected: true })}\\n\\n`);\n  // Send updates every 3 seconds\n  const interval = setInterval(() => {\n    res.write('event: update\\n');\n    res.write(`data: ${JSON.stringify({ timestamp: Date.now() })}\\n\\n`);\n  }, 3000);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Server-Sent Events (SSE) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Cleanup on disconnect\n  res.on('close', () => {\n    clearInterval(interval);\n    clients.delete(res);\n    console.log(`Client disconnected. ${clients.size} remaining`);\n  });\n});\n// Broadcast to all connected clients\napp.post('/notify', (req, res) => {\n  const notification = { message: 'Notification!', time: Date.now() };\n  for (const client of clients) {\n    client.write('event: notification\\n');\n    client.write(`data: ${JSON.stringify(notification)}\\n\\n`);\n  }\n  res.json({ sent: clients.size });\n});\napp.listen(3000);\n// Client-side\n// const eventSource = new EventSource('/events');\n// eventSource.addEventListener('update', (e) => {\n//   const data = JSON.parse(e.data);\n//   console.log('Update:', data);\n// });"
                  }
        ],
        tips: [
                  "SSE auto-reconnects with exponential backoff — no manual reconnection logic needed.",
                  "Send a colon comment (: heartbeat) periodically to keep the connection open through proxies.",
                  "Always include event type (event: name) and newline-delimited data.",
                  "SSE only works for server→client — use WebSockets if you need bidirectional communication."
        ],
        mistake: "Forgetting to send \"event:\" and \"data:\" prefixes — the browser event parser requires the exact format.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "compression-middleware",
        fn: "Compression Middleware",
        desc: "Gzip/brotli compress HTTP responses to reduce bandwidth — use compression package.",
        category: "HTTP Optimization",
        subtitle: "Response compression for efficient transfer",
        signature: "app.use(compression())  // gzips responses > 1KB by default",
        descLong: "The compression npm package automatically gzips HTTP responses. Enable it early in middleware chain. Works transparently — Content-Encoding header is set automatically. Brotli (better compression) requires brotli-wasm or native library. Set threshold to avoid compressing tiny responses.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Compression Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport compression from 'compression';\nimport express from 'express';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Compression Middleware — common patterns you'll see in production.\n// APPROACH  - Combine Compression Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\n// Gzip with custom threshold (default 1KB)\napp.use(compression({\n  threshold: 512,        // Compress responses > 512 bytes\n  level: 6,              // Compression level (0-9, default 6)\n}));\n// Custom compression logic\napp.use(compression({\n  filter: (req, res) => {\n    // Don't compress images/video\n    if (req.headers['x-no-compression']) {\n      return false;\n    }\n    return compression.filter(req, res);\n  },\n}));\n// Brotli compression (if available)\n// Install: npm install brotli\n// app.use(compression({ brotli: { quality: 11 } }));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Compression Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\napp.get('/large-json', (req, res) => {\n  const data = {\n    items: Array.from({ length: 1000 }, (_, i) => ({\n      id: i,\n      name: `Item ${i}`,\n      description: 'Lorem ipsum dolor sit amet...',\n    })),\n  };\n  res.json(data);\n  // Automatically gzipped by compression middleware\n  // Original size: ~50KB → Compressed: ~5KB\n});\napp.listen(3000);\nconsole.log('Server with compression on :3000');"
                  }
        ],
        tips: [
                  "Enable compression early in the middleware chain, before routes.",
                  "Brotli offers 15-20% better compression than gzip — prefer it if available.",
                  "Don't compress already-compressed formats (images, video, zip) — waste of CPU.",
                  "Measure content-length header in browser DevTools to verify compression is working."
        ],
        mistake: "Applying compression middleware after routes — it won't compress responses sent before its registration.",
        shorthand: {
          verbose: "app.get('/api/users', (req, res) => {\n  res.json({ users: [...] });\n});\napp.use(compression());",
          concise: "app.use(compression({ threshold: 512 }));  // Before routes\napp.get('/api/users', (req, res) => res.json({ users }));",
        },
      },
      {
        id: "helmet-security-headers",
        fn: "helmet - Security Headers",
        desc: "Set security headers (CSP, X-Frame-Options, HSTS, etc.) to protect against common attacks.",
        category: "HTTP Security",
        subtitle: "Comprehensive HTTP security hardening",
        signature: "app.use(helmet())",
        descLong: "helmet sets 14 security headers by default: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, etc. Each header mitigates a class of attacks (XSS, clickjacking, MIME sniffing). Customize individual headers as needed. Always use helmet in production.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of helmet - Security Headers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport helmet from 'helmet';\nimport express from 'express';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of helmet - Security Headers — common patterns you'll see in production.\n// APPROACH  - Combine helmet - Security Headers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\n// Default: all security headers enabled\napp.use(helmet());\n// Customize specific headers\napp.use(helmet({\n  contentSecurityPolicy: {\n    directives: {\n      defaultSrc: [\"'self'\"],\n      scriptSrc: [\"'self'\", \"cdn.example.com\"],\n      styleSrc: [\"'self'\", \"'unsafe-inline'\"],\n      imgSrc: [\"'self'\", 'data:', 'https:'],\n    },\n  },\n  frameguard: {\n    action: 'deny', // X-Frame-Options: DENY (prevent clickjacking)\n  },\n  hsts: {\n    maxAge: 31536000, // 1 year in seconds\n    includeSubDomains: true,\n    preload: true,\n  },\n  noSniff: true,        // X-Content-Type-Options: nosniff\n  xssFilter: true,      // X-XSS-Protection (legacy, mostly obsolete)\n  referrerPolicy: {\n    policy: 'strict-no-referrer',\n  },\n}));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of helmet - Security Headers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Bypass helmet for specific routes if needed\napp.get('/frame-allowed', (req, res) => {\n  res.set('X-Frame-Options', 'SAMEORIGIN');\n  res.send('<h1>Can be framed</h1>');\n});\napp.listen(3000);"
                  }
        ],
        tips: [
                  "helmet() sets reasonable defaults — customize only if you understand the implications.",
                  "Content-Security-Policy is the most important — prevents XSS by restricting script sources.",
                  "HSTS (HTTP Strict-Transport-Security) forces HTTPS — include in HSTS preload list for browsers to enforce it.",
                  "X-Frame-Options: DENY prevents clickjacking — only set to SAMEORIGIN or ALLOW-FROM if framing is intentional."
        ],
        mistake: "Not using helmet or disabling critical headers like CSP — leaves app vulnerable to common web attacks.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "cookie-session-management",
        fn: "Cookie & Session Management",
        desc: "Store and validate session data securely with httpOnly cookies — prevent XSS/CSRF attacks.",
        category: "HTTP Security",
        subtitle: "Secure session handling with cookies",
        signature: "res.cookie(name, value, { httpOnly: true, secure: true, sameSite: \"Strict\" })",
        descLong: "Cookies store session identifiers (not sensitive data directly). httpOnly prevents JavaScript access (XSS protection). secure flag only sends over HTTPS. sameSite prevents CSRF attacks. Store actual session data server-side (Redis, database) keyed by session ID. Always validate CSRF tokens on POST/PUT/DELETE.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Cookie & Session Management — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';\nimport session from 'express-session';\nimport RedisStore from 'connect-redis';\nimport redis from 'redis';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Cookie & Session Management — common patterns you'll see in production.\n// APPROACH  - Combine Cookie & Session Management with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\nconst redisClient = redis.createClient();\n// Session middleware with Redis store\napp.use(session({\n  store: new RedisStore({ client: redisClient }),\n  secret: process.env.SESSION_SECRET,\n  resave: false,\n  saveUninitialized: false,\n  cookie: {\n    httpOnly: true,           // No JavaScript access (XSS protection)\n    secure: true,             // HTTPS only\n    sameSite: 'Strict',       // CSRF protection\n    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms\n    domain: '.example.com',   // Cookie sent only to this domain\n  },\n}));\n// Login route\napp.post('/login', async (req, res) => {\n  const user = await authenticate(req.body.email, req.body.password);\n  if (!user) return res.status(401).json({ error: 'Invalid credentials' });\n  // Session data is stored server-side\n  req.session.userId = user.id;\n  req.session.role = user.role;\n  res.json({ message: 'Logged in' });\n  // Browser automatically receives Set-Cookie header with session ID\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Cookie & Session Management — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Protected route\napp.get('/profile', (req, res) => {\n  if (!req.session.userId) {\n    return res.status(401).json({ error: 'Not authenticated' });\n  }\n  res.json({ userId: req.session.userId, role: req.session.role });\n});\n// Logout\napp.post('/logout', (req, res) => {\n  req.session.destroy((err) => {\n    if (err) return res.status(500).json({ error: 'Logout failed' });\n    res.clearCookie('connect.sid'); // Match the cookie name\n    res.json({ message: 'Logged out' });\n  });\n});\n// Manual cookie setting (not recommended for sessions)\napp.get('/set-cookie', (req, res) => {\n  res.cookie('preference', 'dark-mode', {\n    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year\n    httpOnly: false, // Can be read by JS (non-sensitive)\n  });\n  res.send('Cookie set');\n});"
                  }
        ],
        tips: [
                  "Store sensitive data in req.session (server-side), not in cookies — cookies are visible to the user.",
                  "Always use httpOnly, secure, and sameSite flags for session cookies.",
                  "Use a session store (Redis, PostgreSQL) — in-memory sessions are lost on restart.",
                  "Implement CSRF token validation for state-changing requests (POST, PUT, DELETE)."
        ],
        mistake: "Storing passwords or tokens directly in cookies — they're visible in the browser. Store only a session ID.",
        shorthand: {
          verbose: "// Manual / verbose approach\nres.cookie('token', jwtToken, { maxAge: 86400000 });\nres.cookie('password', 'secret123');  // UNSAFE!\n// More explicit but longer",
          concise: "req.session.userId = user.id;\nres.cookie('sessionId', sessionId, { httpOnly: true, secure: true, sameSite: 'Strict' });\n// Sensitive data server-side only",
        },
      },
      {
        id: "rate-limiter-advanced",
        fn: "Advanced Rate Limiting",
        desc: "Implement sophisticated rate limiting: per-IP, per-user, sliding windows, queue limiting.",
        category: "HTTP Security",
        subtitle: "Granular request throttling and quotas",
        signature: "const limiter = rateLimit({ windowMs, max, keyGenerator, skip, handler })",
        descLong: "express-rate-limit allows custom key generation (user ID, IP, path), skip conditions, and custom handlers. Sliding window (vs fixed window) is more accurate. For distributed apps, use Redis store. Queue limiting prevents request pile-up under high load.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Advanced Rate Limiting — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport rateLimit from 'express-rate-limit';\nimport RedisStore from 'rate-limit-redis';\nimport redis from 'redis';\nimport express from 'express';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Advanced Rate Limiting — common patterns you'll see in production.\n// APPROACH  - Combine Advanced Rate Limiting with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\nconst redisClient = redis.createClient();\n// Global rate limit: 100 requests per 15 minutes per IP\nconst globalLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000,\n  max: 100,\n  standardHeaders: true,\n  legacyHeaders: false,\n  skip: (req) => req.user?.role === 'admin', // Skip for admins\n  handler: (req, res) => {\n    res.status(429).json({\n      error: 'Too many requests',\n      retryAfter: req.rateLimit.resetTime,\n    });\n  },\n});\n// Auth route: 5 attempts per minute per IP (brute force protection)\nconst authLimiter = rateLimit({\n  windowMs: 60 * 1000,\n  max: 5,\n  skipSuccessfulRequests: true, // Don't count successful logins\n  skipFailedRequests: false,\n  keyGenerator: (req) => req.ip, // Limit by IP\n});\n// Per-user rate limit: 10 requests per minute per authenticated user\nconst userLimiter = rateLimit({\n  windowMs: 60 * 1000,\n  max: 10,\n  keyGenerator: (req) => req.user?.id || req.ip,\n  store: new RedisStore({\n    client: redisClient,\n    prefix: 'rl:user:',\n  }),\n});\n// API rate limit: 1000 per hour per user (generous for APIs)\nconst apiLimiter = rateLimit({\n  windowMs: 60 * 60 * 1000,\n  max: 1000,\n  keyGenerator: (req) => req.user?.id || req.ip,\n  store: new RedisStore({\n    client: redisClient,\n    prefix: 'rl:api:',\n  }),\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Advanced Rate Limiting — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\napp.use(globalLimiter);\napp.post('/auth/login', authLimiter, async (req, res) => {\n  // Login handler\n});\napp.get('/api/data', userLimiter, (req, res) => {\n  res.json({ data: [] });\n});\n// Custom limiter for expensive operations\napp.post('/export', rateLimit({\n  windowMs: 24 * 60 * 60 * 1000,\n  max: (req) => req.user?.role === 'premium' ? 100 : 5,\n  keyGenerator: (req) => req.user?.id || req.ip,\n  message: 'Export limit exceeded',\n}), (req, res) => {\n  // Handle export\n});\napp.listen(3000);"
                  }
        ],
        tips: [
                  "Use Redis for rate limiting in multi-server deployments — in-memory stores don't sync across processes.",
                  "skipSuccessfulRequests is useful for auth routes — only count failed login attempts.",
                  "Tiered limits based on user role (admin, premium, free) provide flexibility.",
                  "Return 429 status and Retry-After header — clients can retry appropriately."
        ],
        mistake: "Global rate limit only without per-route customization — auth routes and APIs have different requirements.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
    ],
  },
]

export default { meta, sections }
