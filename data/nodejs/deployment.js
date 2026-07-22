export const meta = {
  "title": "Deployment & DevOps",
  "domain": "nodejs",
  "sheet": "deployment",
  "icon": "🟢"
}

export const sections = [

  // ── Section 1: Docker & Containerization ─────────────────────────────────────────
  {
    id: "docker",
    title: "Docker & Containerization",
    entries: [
      {
        id: "dockerfile",
        fn: "Dockerfile — Multi-stage Builds & Best Practices",
        desc: "Containerize Node.js apps with optimized Dockerfiles — multi-stage builds, layer caching, and security.",
        category: "Docker",
        subtitle: "Dockerfile, multi-stage, .dockerignore, layer caching",
        signature: "FROM node:20-alpine  |  docker build -t app .  |  docker compose up",
        descLong: "Docker containers package your Node.js app with its dependencies for consistent deployment. Multi-stage builds separate build and runtime — the final image contains only production dependencies and compiled output. Alpine-based images are 5-10x smaller. Layer ordering matters: copy package.json first, install dependencies, THEN copy source — unchanged dependencies use cache. Always use .dockerignore to exclude node_modules, .git, and test files.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dockerfile — Multi-stage Builds & Best Practices — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# ── Dockerfile (multi-stage) ─────────────────────────\n# Stage 1: Install dependencies\nFROM node:20-alpine AS deps\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci --production=false"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dockerfile — Multi-stage Builds & Best Practices — common patterns you'll see in production.\n// APPROACH  - Combine Dockerfile — Multi-stage Builds & Best Practices with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n# Stage 2: Build (TypeScript, bundling, etc.)\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nRUN npm run build\nRUN npm prune --production  # remove devDependencies\n# Stage 3: Production image (minimal)\nFROM node:20-alpine AS runner\nWORKDIR /app\n# Security: don't run as root\nRUN addgroup --system app && adduser --system --ingroup app app\n# Copy only what's needed\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/package.json ./"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dockerfile — Multi-stage Builds & Best Practices — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nUSER app\nEXPOSE 3000\nENV NODE_ENV=production\n# Use node directly (not npm) for proper signal handling\nCMD [\"node\", \"dist/server.js\"]\n# ── .dockerignore ───────────────────────────────────\n# node_modules\n# .git\n# .env*\n# *.md\n# tests/\n# coverage/\n# .github/\n# Dockerfile\n# docker-compose*.yml\n# ── docker-compose.yml ──────────────────────────────\n# version: \"3.8\"\n# services:\n#   app:\n#     build: .\n#     ports:\n#       - \"3000:3000\"\n#     environment:\n#       - NODE_ENV=production\n#       - DATABASE_URL=postgres://db:5432/app\n#     depends_on:\n#       db:\n#         condition: service_healthy\n#     restart: unless-stopped\n#     healthcheck:\n#       test: [\"CMD\", \"wget\", \"-qO-\", \"http://localhost:3000/health\"]\n#       interval: 30s\n#       timeout: 5s\n#       retries: 3\n#\n#   db:\n#     image: postgres:16-alpine\n#     environment:\n#       POSTGRES_DB: app\n#       POSTGRES_PASSWORD: secret\n#     volumes:\n#       - pgdata:/var/lib/postgresql/data\n#     healthcheck:\n#       test: [\"CMD-SHELL\", \"pg_isready\"]\n#       interval: 10s\n#\n# volumes:\n#   pgdata:"
                  }
        ],
        tips: [
                  "Multi-stage builds keep images small: build stage has devDependencies, production stage has only runtime deps.",
                  "Copy package.json before source code — Docker caches the npm install layer when dependencies haven't changed.",
                  "Use CMD [\"node\", \"server.js\"] not CMD [\"npm\", \"start\"] — npm doesn't forward signals (SIGTERM), breaking graceful shutdown.",
                  "Run as non-root user in production — RUN adduser + USER prevents container escape vulnerabilities."
        ],
        mistake: "Using FROM node:20 instead of node:20-alpine — the full image is ~1GB, alpine is ~150MB. Also avoid node:latest — pin the major version for reproducible builds.",
        shorthand: {
          verbose: "FROM node:20\nCOPY . .\nRUN npm install\nRUN npm run build\nCMD [\"npm\", \"start\"]",
          concise: "Multi-stage: deps → builder (with npm run build + npm prune) → runner (copy dist + node_modules, USER non-root, CMD [\"node\", \"server.js\"])",
        },
      },
    ],
  },

  // ── Section 2: PM2 & Process Management ─────────────────────────────────────────
  {
    id: "pm2",
    title: "PM2 & Process Management",
    entries: [
      {
        id: "pm2-config",
        fn: "PM2 — Process Manager for Production",
        desc: "Keep Node.js running with PM2 — clustering, auto-restart, log management, and zero-downtime deploys.",
        category: "PM2",
        subtitle: "pm2 start, ecosystem.config.js, cluster mode, reload",
        signature: "pm2 start ecosystem.config.js  |  pm2 reload app  |  pm2 monit",
        descLong: "PM2 is a production process manager for Node.js. It restarts crashed processes, runs multiple instances (cluster mode) to use all CPU cores, manages logs, and supports zero-downtime deployments with pm2 reload. The ecosystem.config.js file defines app configuration: instances, env variables, log paths, watch mode. PM2 integrates with systemd for server boot startup.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of PM2 — Process Manager for Production — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nmodule.exports = {\n  apps: [\n    {\n      name: \"api\",\n      script: \"./dist/server.js\",\n      instances: \"max\",           // one per CPU core\n      exec_mode: \"cluster\",       // cluster mode for load balancing\n      max_memory_restart: \"500M\", // restart if memory exceeds\n      // Environment variables\n      env: {\n        NODE_ENV: \"development\",\n        PORT: 3000,\n      },\n      env_production: {\n        NODE_ENV: \"production\",\n        PORT: 3000,\n      },\n      // Logging\n      error_file: \"./logs/error.log\",\n      out_file: \"./logs/output.log\",\n      log_date_format: \"YYYY-MM-DD HH:mm:ss Z\",\n      merge_logs: true,           // combine cluster logs\n      // Auto-restart\n      watch: false,               // true for dev, false for prod\n      max_restarts: 10,\n      min_uptime: \"5s\",           // consider started after 5s\n      restart_delay: 4000,        // 4s between restarts\n      // Graceful shutdown\n      kill_timeout: 10000,        // 10s to finish requests\n      listen_timeout: 5000,       // 5s to start listening\n    },\n  ],\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of PM2 — Process Manager for Production — common patterns you'll see in production.\n// APPROACH  - Combine PM2 — Process Manager for Production with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// pm2 start ecosystem.config.js --env production\n// pm2 reload api              # zero-downtime restart\n// pm2 stop api                # stop all instances\n// pm2 delete api              # remove from PM2\n// pm2 logs api                # tail logs\n// pm2 logs api --lines 100    # last 100 lines\n// pm2 monit                   # real-time monitoring dashboard\n// pm2 list                    # show all processes\n// pm2 save                    # save process list\n// pm2 startup                 # generate systemd startup script"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of PM2 — Process Manager for Production — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst server = app.listen(PORT);\nprocess.on(\"SIGINT\", gracefulShutdown);\nprocess.on(\"SIGTERM\", gracefulShutdown);\nasync function gracefulShutdown(signal) {\n  console.log(\"Received \" + signal + \", shutting down gracefully...\");\n  // Stop accepting new connections\n  server.close(async () => {\n    // Close database connections\n    await db.end();\n    // Close Redis\n    await redis.quit();\n    // Exit\n    process.exit(0);\n  });\n  // Force exit after timeout\n  setTimeout(() => {\n    console.error(\"Forced shutdown after timeout\");\n    process.exit(1);\n  }, 10000);\n}"
                  }
        ],
        tips: [
                  "pm2 reload does zero-downtime restarts — it starts new instances before killing old ones.",
                  "cluster mode + instances: \"max\" uses all CPU cores — Node.js is single-threaded but PM2 runs N processes.",
                  "pm2 startup + pm2 save ensures your app restarts after server reboot — generates a systemd service.",
                  "Handle SIGTERM in your app for graceful shutdown — finish in-flight requests before exiting."
        ],
        mistake: "Using pm2 restart instead of pm2 reload — restart kills all instances then starts new ones (downtime). reload does rolling restarts with zero downtime.",
        shorthand: {
          verbose: "pm2 start ecosystem.config.js\npm2 stop app\npm2 start app",
          concise: "ecosystem.config.js with instances: \"max\" + exec_mode: \"cluster\"; pm2 reload for zero-downtime",
        },
      },
    ],
  },

  // ── Section 3: Environment Config & Monitoring ─────────────────────────────────────────
  {
    id: "env-monitoring",
    title: "Environment Config & Monitoring",
    entries: [
      {
        id: "env-config",
        fn: "Environment Configuration — dotenv, Validation & Secrets",
        desc: "Manage configuration across environments — .env files, validation, required variables, and secret handling.",
        category: "Configuration",
        subtitle: "dotenv, env validation, config module, secrets",
        signature: "process.env.PORT  |  dotenv.config()  |  config validation at startup",
        descLong: "Configuration should come from environment variables (12-factor app). dotenv loads .env files in development. Always validate env vars at startup — fail fast with clear errors instead of crashing at runtime. Create a typed config module that validates, coerces types, and provides defaults. Never commit .env files or hardcode secrets. Use secrets managers (AWS Secrets Manager, Vault) in production.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Environment Configuration — dotenv, Validation & Secrets — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport dotenv from \"dotenv\";\ndotenv.config();  // loads .env file in development\n// Validate and export typed config\nfunction required(name) {\n  const value = process.env[name];\n  if (!value) {\n    throw new Error(\"Missing required env var: \" + name);\n  }\n  return value;\n}\nfunction optional(name, defaultValue) {\n  return process.env[name] || defaultValue;\n}\nexport const config = Object.freeze({\n  // Server\n  port:     parseInt(optional(\"PORT\", \"3000\"), 10),\n  nodeEnv:  optional(\"NODE_ENV\", \"development\"),\n  logLevel: optional(\"LOG_LEVEL\", \"info\"),\n  // Database\n  databaseUrl: required(\"DATABASE_URL\"),\n  dbPoolMin:   parseInt(optional(\"DB_POOL_MIN\", \"2\"), 10),\n  dbPoolMax:   parseInt(optional(\"DB_POOL_MAX\", \"10\"), 10),\n  // Auth\n  jwtSecret:    required(\"JWT_SECRET\"),\n  jwtExpiresIn: optional(\"JWT_EXPIRES_IN\", \"7d\"),\n  // External services\n  redisUrl:     optional(\"REDIS_URL\", \"redis://localhost:6379\"),\n  smtpHost:     optional(\"SMTP_HOST\", \"\"),\n  // Feature flags\n  enableMetrics: optional(\"ENABLE_METRICS\", \"true\") === \"true\",\n  // Computed\n  get isDev()  { return this.nodeEnv === \"development\"; },\n  get isProd() { return this.nodeEnv === \"production\"; },\n});\n// Validate at import time — fail fast\nconsole.log(\"Config loaded: port=\" + config.port + \" env=\" + config.nodeEnv);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Environment Configuration — dotenv, Validation & Secrets — common patterns you'll see in production.\n// APPROACH  - Combine Environment Configuration — dotenv, Validation & Secrets with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// PORT=3000\n// NODE_ENV=development\n// DATABASE_URL=postgres://localhost:5432/myapp\n// JWT_SECRET=dev-secret-change-in-production\n// REDIS_URL=redis://localhost:6379\n// PORT=3000\n// NODE_ENV=development\n// DATABASE_URL=postgres://user:pass@host:5432/db\n// JWT_SECRET=your-secret-here\n// REDIS_URL=redis://localhost:6379"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Environment Configuration — dotenv, Validation & Secrets — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nimport { config } from \"./config.js\";\napp.listen(config.port, () => {\n  console.log(\"Server running on port \" + config.port);\n});\nif (config.enableMetrics) {\n  setupPrometheus(app);\n}"
                  }
        ],
        tips: [
                  "Validate ALL required env vars at startup — a clear \"Missing DATABASE_URL\" is better than a crash 2 hours later.",
                  "Commit .env.example with placeholder values — new developers know which variables to set.",
                  "Object.freeze(config) prevents accidental mutation — config is read-only after initialization.",
                  "Use parseInt/parseFloat explicitly — process.env values are always strings."
        ],
        mistake: "Committing .env files to git — secrets end up in version history forever. Add .env* to .gitignore and use .env.example for documentation.",
        shorthand: {
          verbose: "function getEnv(name) {\n  const val = process.env[name];\n  if (!val) throw new Error('Missing: ' + name);\n  return val;\n}\nconst port = process.env.PORT || 3000;",
          concise: "dotenv.config(); export const config = Object.freeze({ port: parseInt(optional('PORT', '3000')), ... }); validate at startup",
        },
      },
      {
        id: "health-monitoring",
        fn: "Health Checks & Monitoring",
        desc: "Production health endpoints, Prometheus metrics, structured logging, and error tracking.",
        category: "Monitoring",
        subtitle: "health endpoint, prom-client, pino, error tracking",
        signature: "/health  |  /metrics  |  pino logger  |  Sentry.init()",
        descLong: "Production apps need observability: health checks for load balancers, metrics for dashboards, structured logs for debugging, and error tracking for alerts. Health endpoints check database, Redis, and external service connectivity. Prometheus metrics track request rate, latency, error rate, and business metrics. Pino produces fast JSON logs. Sentry or similar captures and groups errors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Health Checks & Monitoring — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from \"express\";\nimport pino from \"pino\";\nimport client from \"prom-client\";\nconst app = express();\nconst logger = pino({ level: \"info\" });"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Health Checks & Monitoring — common patterns you'll see in production.\n// APPROACH  - Combine Health Checks & Monitoring with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\napp.get(\"/health\", async (req, res) => {\n  const checks = {\n    status: \"ok\",\n    uptime: process.uptime(),\n    timestamp: new Date().toISOString(),\n    checks: {},\n  };\n  // Database check\n  try {\n    await db.query(\"SELECT 1\");\n    checks.checks.database = { status: \"ok\" };\n  } catch (err) {\n    checks.status = \"degraded\";\n    checks.checks.database = { status: \"error\", message: err.message };\n  }\n  // Redis check\n  try {\n    await redis.ping();\n    checks.checks.redis = { status: \"ok\" };\n  } catch (err) {\n    checks.status = \"degraded\";\n    checks.checks.redis = { status: \"error\", message: err.message };\n  }\n  // Memory check\n  const mem = process.memoryUsage();\n  checks.checks.memory = {\n    rss: Math.round(mem.rss / 1024 / 1024) + \"MB\",\n    heap: Math.round(mem.heapUsed / 1024 / 1024) + \"MB\",\n  };\n  const status = checks.status === \"ok\" ? 200 : 503;\n  res.status(status).json(checks);\n});\n// Collect default Node.js metrics (CPU, memory, event loop)\nclient.collectDefaultMetrics();\n// Custom metrics\nconst httpRequests = new client.Counter({\n  name: \"http_requests_total\",\n  help: \"Total HTTP requests\",\n  labelNames: [\"method\", \"path\", \"status\"],\n});\nconst httpDuration = new client.Histogram({\n  name: \"http_request_duration_seconds\",\n  help: \"HTTP request duration in seconds\",\n  labelNames: [\"method\", \"path\"],\n  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],\n});\n// Metrics middleware\napp.use((req, res, next) => {\n  const end = httpDuration.startTimer({ method: req.method, path: req.route?.path || req.path });\n  res.on(\"finish\", () => {\n    end();\n    httpRequests.inc({ method: req.method, path: req.route?.path || req.path, status: res.statusCode });\n  });\n  next();\n});\n// Metrics endpoint (for Prometheus scraping)\napp.get(\"/metrics\", async (req, res) => {\n  res.set(\"Content-Type\", client.register.contentType);\n  res.end(await client.register.metrics());\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Health Checks & Monitoring — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Request logging middleware\napp.use((req, res, next) => {\n  const start = Date.now();\n  res.on(\"finish\", () => {\n    logger.info({\n      method: req.method,\n      url: req.url,\n      status: res.statusCode,\n      duration: Date.now() - start,\n      ip: req.ip,\n    }, \"request completed\");\n  });\n  next();\n});\n// Error logging\napp.use((err, req, res, next) => {\n  logger.error({ err, method: req.method, url: req.url }, \"unhandled error\");\n  res.status(500).json({ error: \"Internal Server Error\" });\n});"
                  }
        ],
        tips: [
                  "Health endpoints should check all dependencies (DB, Redis, external APIs) — load balancers use this to route traffic.",
                  "Return 503 for degraded health — load balancers will stop sending traffic to unhealthy instances.",
                  "Prometheus histograms with buckets give you p50/p95/p99 latency — essential for SLA monitoring.",
                  "Pino is 5x faster than Winston for logging — it outputs JSON that log aggregators (ELK, Datadog) can parse."
        ],
        mistake: "Using console.log in production — no structure, no levels, no timestamps. Use pino or winston for structured JSON logs that log aggregators can index and search.",
        shorthand: {
          verbose: "console.log('request', method, url, status);\nconst mem = process.memoryUsage();\nconsole.log('memory', mem.heapUsed);",
          concise: "app.get('/health') check DB+Redis return 200/503; prom-client histograms + /metrics; pino logger with structured fields",
        },
      },
      {
        id: "docker-node",
        fn: "Docker for Node.js — Multi-Stage Builds",
        desc: "Containerize Node.js with optimized Dockerfiles — multi-stage, Alpine, non-root user, .dockerignore.",
        category: "Docker",
        subtitle: "multi-stage Dockerfile, Alpine images, layer caching, .dockerignore",
        signature: "FROM node:20-alpine  |  COPY --from=builder  |  USER non-root",
        descLong: "Docker packages your app consistently. Multi-stage builds keep images small: deps in stage 1, build in stage 2, minimal runtime in stage 3. Alpine Linux is 5-10x smaller than full Node. Never run as root. Use .dockerignore to exclude node_modules, tests, and git. Layer order matters for cache efficiency.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Docker for Node.js — Multi-Stage Builds — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# ── Dockerfile (multi-stage) ─────────────────────\n# Stage 1: Install dependencies\nFROM node:20-alpine AS deps\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci --production=false"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Docker for Node.js — Multi-Stage Builds — common patterns you'll see in production.\n// APPROACH  - Combine Docker for Node.js — Multi-Stage Builds with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n# Stage 2: Build (TypeScript, bundling, etc.)\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nRUN npm run build\nRUN npm prune --production  # remove devDependencies\n# Stage 3: Production image (minimal)\nFROM node:20-alpine AS runner\nWORKDIR /app\n# Security: don't run as root\nRUN addgroup --system app && adduser --system --ingroup app app\n# Copy only what's needed\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/package.json ./"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Docker for Node.js — Multi-Stage Builds — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nUSER app\nEXPOSE 3000\nENV NODE_ENV=production\n# Use node directly (not npm) for proper signal handling\nCMD [\"node\", \"dist/server.js\"]\n# ── .dockerignore ───────────────────────────────────\nnode_modules\n.git\n.env*\n*.md\ntests/\ncoverage/\n.github/\nDockerfile\ndocker-compose*.yml"
                  }
        ],
        tips: [
                  "Alpine images are 150MB vs 1GB for full Node — use alpine in production.",
                  "Copy package.json before source code — Docker caches dependency layer.",
                  "Use USER non-root for security — prevents container escape.",
                  "node dist/server.js not npm start — properly forwards SIGTERM for graceful shutdown."
        ],
        mistake: "Using single-stage Dockerfile — final image includes devDependencies, test files, and build artifacts.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "docker-compose-node",
        fn: "Docker Compose — Node + Postgres + Redis",
        desc: "Multi-service setup with Docker Compose — health checks, networking, volumes.",
        category: "Docker",
        subtitle: "docker-compose.yml, services, health checks, networks, volumes",
        signature: "docker-compose up  |  depends_on with healthcheck  |  volumes for persistence",
        descLong: "Docker Compose orchestrates multiple containers. Define Node app, Postgres DB, Redis cache in one file. Health checks prevent starting dependent services before dependencies are ready. Networks connect services. Volumes persist data. Environment variables per service.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Docker Compose — Node + Postgres + Redis — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# ── docker-compose.yml ──────────────────────────\nversion: \"3.8\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Docker Compose — Node + Postgres + Redis — common patterns you'll see in production.\n// APPROACH  - Combine Docker Compose — Node + Postgres + Redis with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nservices:\n  app:\n    build: .\n    ports:\n      - \"3000:3000\"\n    environment:\n      NODE_ENV: production\n      DATABASE_URL: postgres://postgres:password@db:5432/myapp\n      REDIS_URL: redis://cache:6379\n    depends_on:\n      db:\n        condition: service_healthy\n      cache:\n        condition: service_healthy\n    restart: unless-stopped\n    healthcheck:\n      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:3000/health\"]\n      interval: 30s\n      timeout: 5s\n      retries: 3\n      start_period: 40s\n    volumes:\n      - ./logs:/app/logs\n    networks:\n      - backend\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_DB: myapp\n      POSTGRES_PASSWORD: password\n    ports:\n      - \"5432:5432\"\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n      - ./init.sql:/docker-entrypoint-initdb.d/init.sql\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]\n      interval: 10s\n      timeout: 5s\n      retries: 5\n    networks:\n      - backend\n    restart: unless-stopped\n  cache:\n    image: redis:7-alpine\n    ports:\n      - \"6379:6379\"\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 10s\n      timeout: 5s\n      retries: 5\n    volumes:\n      - redisdata:/data\n    networks:\n      - backend\n    restart: unless-stopped"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Docker Compose — Node + Postgres + Redis — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nvolumes:\n  pgdata:\n  redisdata:\nnetworks:\n  backend:\n    driver: bridge\n# ── Usage ──────────────────────────────────────────\n# docker-compose up -d           # start all services\n# docker-compose logs -f app     # tail app logs\n# docker-compose exec db psql    # connect to database\n# docker-compose down            # stop all services"
                  }
        ],
        tips: [
                  "Health checks prevent race conditions — services wait for dependencies.",
                  "depends_on with condition: service_healthy ensures startup order.",
                  "Volumes persist data across container restarts.",
                  "Networks isolate services — app connects to db:5432 not localhost:5432."
        ],
        mistake: "Not using health checks — services start before DB is ready, causing connection errors.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "github-actions-node",
        fn: "GitHub Actions for Node.js CI/CD",
        desc: "Automate testing, building, and deployment with GitHub Actions.",
        category: "CI/CD",
        subtitle: "actions/setup-node, npm ci, caching, test + build + deploy",
        signature: "actions/setup-node@v4  |  npm ci  |  npm run test && npm run build",
        descLong: "GitHub Actions runs workflows on every push. Setup Node version, install deps with npm ci (clean install, faster). Cache node_modules for speed. Run tests, lint, build. Deploy to staging or production. Secrets for API keys.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of GitHub Actions for Node.js CI/CD — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# ── .github/workflows/ci.yml ──────────────────\nname: CI/CD"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of GitHub Actions for Node.js CI/CD — common patterns you'll see in production.\n// APPROACH  - Combine GitHub Actions for Node.js CI/CD with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\non:\n  push:\n    branches: [main, develop]\n  pull_request:\n    branches: [main, develop]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    services:\n      postgres:\n        image: postgres:16-alpine\n        env:\n          POSTGRES_PASSWORD: test\n          POSTGRES_DB: test\n        options: >-\n          --health-cmd pg_isready\n          --health-interval 10s\n          --health-timeout 5s\n          --health-retries 5\n        ports:\n          - 5432:5432\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: npm\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run test:coverage\n      - uses: codecov/codecov-action@v4\n        with:\n          files: ./coverage/lcov.info\n          fail_ci_if_error: true\n      - run: npm run build"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of GitHub Actions for Node.js CI/CD — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ndeploy:\n    needs: test\n    runs-on: ubuntu-latest\n    if: github.ref == 'refs/heads/main' && github.event_name == 'push'\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: npm\n      - run: npm ci\n      - run: npm run build\n      - name: Deploy to production\n        env:\n          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}\n          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}\n        run: |\n          mkdir -p ~/.ssh\n          echo \"$DEPLOY_KEY\" > ~/.ssh/deploy_key\n          chmod 600 ~/.ssh/deploy_key\n          ssh -i ~/.ssh/deploy_key user@$DEPLOY_HOST \"cd /app && git pull && npm ci && npm run build && pm2 reload ecosystem.config.js\"\n# ── .github/workflows/security.yml ─────────────────\nname: Security\non: [push, pull_request]\njobs:\n  audit:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm audit --audit-level=moderate\n      - uses: snyk/actions/node@master\n        env:\n          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}"
                  }
        ],
        tips: [
                  "cache: npm caches node_modules — saves 30s+ per run.",
                  "npm ci instead of npm install in CI — exact versions, faster.",
                  "services: define test databases — GitHub starts them automatically.",
                  "Secrets are masked in logs — use ${{ secrets.NAME }} for sensitive data."
        ],
        mistake: "Using npm install in CI — it updates versions, different from lock file.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "pm2-production",
        fn: "PM2 Production Setup — Cluster Mode & Zero-Downtime",
        desc: "PM2 process manager — cluster mode, ecosystem.config.js, zero-downtime reload.",
        category: "Process Management",
        subtitle: "ecosystem.config.js, cluster mode, pm2 reload, graceful shutdown",
        signature: "pm2 start ecosystem.config.js --env production  |  pm2 reload app",
        descLong: "PM2 restarts crashed processes, runs multiple instances (cluster mode) to use all CPU cores, manages logs, and supports zero-downtime deployments. ecosystem.config.js defines configuration. Graceful shutdown handles SIGTERM to finish requests. pm2 reload does rolling restarts with zero downtime.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of PM2 Production Setup — Cluster Mode & Zero-Downtime — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nmodule.exports = {\n  apps: [\n    {\n      name: \"api\",\n      script: \"./dist/server.js\",\n      instances: \"max\",           // one per CPU core\n      exec_mode: \"cluster\",       // cluster mode for load balancing\n      max_memory_restart: \"500M\", // restart if memory exceeds\n      // Environment variables\n      env: {\n        NODE_ENV: \"development\",\n        PORT: 3000,\n      },\n      env_production: {\n        NODE_ENV: \"production\",\n        PORT: 3000,\n      },\n      // Logging\n      error_file: \"./logs/error.log\",\n      out_file: \"./logs/output.log\",\n      log_date_format: \"YYYY-MM-DD HH:mm:ss Z\",\n      merge_logs: true,           // combine cluster logs\n      // Auto-restart\n      watch: false,               // true for dev, false for prod\n      max_restarts: 10,\n      min_uptime: \"5s\",           // consider started after 5s\n      restart_delay: 4000,        // 4s between restarts\n      // Graceful shutdown\n      kill_timeout: 10000,        // 10s to finish requests\n      listen_timeout: 5000,       // 5s to start listening\n    },\n  ],\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of PM2 Production Setup — Cluster Mode & Zero-Downtime — common patterns you'll see in production.\n// APPROACH  - Combine PM2 Production Setup — Cluster Mode & Zero-Downtime with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst server = app.listen(PORT);\nprocess.on(\"SIGINT\", gracefulShutdown);\nprocess.on(\"SIGTERM\", gracefulShutdown);\nasync function gracefulShutdown(signal) {\n  console.log(\"Received \" + signal + \", shutting down gracefully...\");\n  // Stop accepting new connections\n  server.close(async () => {\n    // Close database connections\n    await db.end();\n    // Close Redis\n    await redis.quit();\n    // Exit\n    process.exit(0);\n  });\n  // Force exit after timeout\n  setTimeout(() => {\n    console.error(\"Forced shutdown after timeout\");\n    process.exit(1);\n  }, 10000);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of PM2 Production Setup — Cluster Mode & Zero-Downtime — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// pm2 start ecosystem.config.js --env production\n// pm2 reload api              # zero-downtime restart\n// pm2 stop api                # stop all instances\n// pm2 delete api              # remove from PM2\n// pm2 logs api                # tail logs\n// pm2 logs api --lines 100    # last 100 lines\n// pm2 monit                   # real-time monitoring dashboard\n// pm2 list                    # show all processes\n// pm2 save                    # save process list\n// pm2 startup                 # generate systemd startup script"
                  }
        ],
        tips: [
                  "pm2 reload does zero-downtime restarts — starts new instances before killing old.",
                  "cluster mode + instances: \"max\" uses all CPU cores — PM2 handles load balancing.",
                  "pm2 startup + pm2 save ensures restart after server reboot.",
                  "Handle SIGTERM in app for graceful shutdown — finish in-flight requests."
        ],
        mistake: "Using pm2 restart instead of pm2 reload — causes downtime.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "kubernetes-node",
        fn: "Kubernetes Deployment for Node.js",
        desc: "Kubernetes manifests for Node.js — Deployment, Service, ConfigMap, liveness probes.",
        category: "Kubernetes",
        subtitle: "kubectl, Deployment, Service, ConfigMap, liveness/readiness probes",
        signature: "kubectl apply -f deployment.yaml  |  spec.replicas, livenessProbe, readinessProbe",
        descLong: "Kubernetes orchestrates containers at scale. Deployment defines app replicas and rolling updates. Service exposes the app. ConfigMap stores configuration. Liveness probes restart crashed pods. Readiness probes mark pods as ready. Environment variables from secrets.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Kubernetes Deployment for Node.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# ── deployment.yaml ──────────────────────────────\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: node-app\n  namespace: default\nspec:\n  replicas: 3\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0  # zero downtime\n  selector:\n    matchLabels:\n      app: node-app\n  template:\n    metadata:\n      labels:\n        app: node-app\n    spec:\n      containers:\n      - name: app\n        image: myregistry.azurecr.io/node-app:v1.0.0\n        imagePullPolicy: IfNotPresent\n        ports:\n        - containerPort: 3000\n          name: http"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Kubernetes Deployment for Node.js — common patterns you'll see in production.\n// APPROACH  - Combine Kubernetes Deployment for Node.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nenv:\n        - name: NODE_ENV\n          value: \"production\"\n        - name: PORT\n          value: \"3000\"\n        - name: DATABASE_URL\n          valueFrom:\n            secretKeyRef:\n              name: app-secrets\n              key: database-url\n        - name: JWT_SECRET\n          valueFrom:\n            secretKeyRef:\n              name: app-secrets\n              key: jwt-secret\n        # Health checks\n        livenessProbe:\n          httpGet:\n            path: /health\n            port: 3000\n          initialDelaySeconds: 30\n          periodSeconds: 10\n          timeoutSeconds: 5\n          failureThreshold: 3\n        readinessProbe:\n          httpGet:\n            path: /ready\n            port: 3000\n          initialDelaySeconds: 10\n          periodSeconds: 5\n          timeoutSeconds: 2\n          failureThreshold: 2\n        # Resource limits\n        resources:\n          requests:\n            cpu: 100m\n            memory: 128Mi\n          limits:\n            cpu: 500m\n            memory: 512Mi\n        # Graceful shutdown\n        lifecycle:\n          preStop:\n            exec:\n              command: [\"/bin/sh\", \"-c\", \"sleep 15\"]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Kubernetes Deployment for Node.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: node-app-service\nspec:\n  type: LoadBalancer\n  selector:\n    app: node-app\n  ports:\n  - port: 80\n    targetPort: 3000\n    protocol: TCP\n---\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\ndata:\n  LOG_LEVEL: \"info\"\n  ENABLE_METRICS: \"true\"\n---\napiVersion: v1\nkind: Secret\nmetadata:\n  name: app-secrets\ntype: Opaque\nstringData:\n  database-url: postgres://user:pass@db.example.com:5432/myapp\n  jwt-secret: your-secret-key-here\n# ── kubectl commands ───────────────────────────────\n# kubectl apply -f deployment.yaml          # deploy\n# kubectl get pods                           # list pods\n# kubectl logs pod-name                      # view logs\n# kubectl exec -it pod-name -- /bin/sh      # shell access\n# kubectl scale deployment node-app --replicas=5  # scale\n# kubectl rollout status deployment/node-app     # rolling status\n# kubectl rollout undo deployment/node-app       # rollback"
                  }
        ],
        tips: [
                  "Liveness probes restart dead containers. Readiness probes remove pods from traffic.",
                  "maxUnavailable: 0 ensures zero-downtime rolling updates.",
                  "Resource requests/limits prevent resource starvation.",
                  "preStop delay allows graceful shutdown before SIGTERM."
        ],
        mistake: "Not setting readiness/liveness probes — broken pods stay in load balancer.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "serverless-node",
        fn: "Serverless Framework & AWS Lambda",
        desc: "Serverless Node.js deployment — Lambda handlers, cold starts, serverless.yml config.",
        category: "Serverless",
        subtitle: "Serverless Framework, AWS Lambda, cold starts, environment variables",
        signature: "serverless deploy  |  handler function  |  API Gateway integration",
        descLong: "Serverless Framework packages Node.js code for AWS Lambda. Handler functions respond to HTTP requests via API Gateway. Cold starts add latency on first invocation. Manage environment variables per stage. CloudFormation creates infrastructure. Faster deployment than traditional VMs, pay per invocation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Serverless Framework & AWS Lambda — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# ── serverless.yml ────────────────────────────\nservice: my-api"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Serverless Framework & AWS Lambda — common patterns you'll see in production.\n// APPROACH  - Combine Serverless Framework & AWS Lambda with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nframeworkVersion: \"3\"\nprovider:\n  name: aws\n  runtime: nodejs20.x\n  region: us-east-1\n  stage: ${opt:stage, 'dev'}\n  environment:\n    NODE_ENV: ${self:provider.stage}\n    DATABASE_URL: ${ssm:/my-api/${self:provider.stage}/database-url}\n    JWT_SECRET: ${ssm:/my-api/${self:provider.stage}/jwt-secret~true}\n  iam:\n    role:\n      statements:\n        - Effect: Allow\n          Action: ssm:GetParameter\n          Resource: \"arn:aws:ssm:us-east-1:*:parameter/my-api/*\"\nfunctions:\n  listUsers:\n    handler: src/handlers/users.list\n    events:\n      - http:\n          path: users\n          method: get\n          cors: true\n    timeout: 30\n    memorySize: 256\n  getUser:\n    handler: src/handlers/users.get\n    events:\n      - http:\n          path: users/{id}\n          method: get\n          cors: true\n          request:\n            parameters:\n              paths:\n                id: true\n  createUser:\n    handler: src/handlers/users.create\n    events:\n      - http:\n          path: users\n          method: post\n          cors: true\n    timeout: 30\nplugins:\n  - serverless-plugin-tracing\n# ── Handler function (src/handlers/users.js) ──────\nexport const list = async (event, context) => {\n  try {\n    const users = await db.users.findAll();\n    return {\n      statusCode: 200,\n      headers: {\n        'Content-Type': 'application/json',\n      },\n      body: JSON.stringify({\n        users,\n        requestId: context.requestId,\n      }),\n    };\n  } catch (error) {\n    console.error('Error:', error);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Serverless Framework & AWS Lambda — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn {\n      statusCode: 500,\n      body: JSON.stringify({ error: 'Internal Server Error' }),\n    };\n  }\n};\nexport const get = async (event, context) => {\n  const { id } = event.pathParameters;\n  try {\n    const user = await db.users.findById(id);\n    if (!user) {\n      return {\n        statusCode: 404,\n        body: JSON.stringify({ error: 'User not found' }),\n      };\n    }\n    return {\n      statusCode: 200,\n      body: JSON.stringify(user),\n    };\n  } catch (error) {\n    return {\n      statusCode: 500,\n      body: JSON.stringify({ error: error.message }),\n    };\n  }\n};\nexport const create = async (event, context) => {\n  const { name, email } = JSON.parse(event.body);\n  try {\n    const user = await db.users.create({ name, email });\n    return {\n      statusCode: 201,\n      body: JSON.stringify(user),\n    };\n  } catch (error) {\n    return {\n      statusCode: 400,\n      body: JSON.stringify({ error: error.message }),\n    };\n  }\n};\n# ── Deployment commands ────────────────────────────\n# npm install -g serverless\n# serverless deploy --stage prod\n# serverless logs -f listUsers --stage prod\n# serverless remove --stage prod  # delete stack"
                  }
        ],
        tips: [
                  "Use AWS Systems Manager Parameter Store for secrets (serverless handles decryption).",
                  "Enable X-Ray tracing to diagnose cold starts and performance issues.",
                  "Set timeout appropriately — Lambda defaults to 6 seconds.",
                  "Cold starts: first invocation takes 1-3 seconds; provisioned concurrency prevents this."
        ],
        mistake: "Not handling Lambda cold starts — app may timeout on first request.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "fly-railway",
        fn: "Fly.io & Railway Deployment",
        desc: "Deploy Node.js to Fly.io or Railway — simple, fast, globally distributed.",
        category: "Hosting",
        subtitle: "fly.toml, railway.toml, secrets management, volumes",
        signature: "flyctl deploy  |  railway up  |  fly secrets set KEY=value",
        descLong: "Fly.io and Railway simplify deployment compared to AWS. Docker containers run globally on Fly, or in Railway regions. Environment variables and secrets stored securely. Automatic scaling and health checks. Railway has simpler interface; Fly has more features and better global distribution.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Fly.io & Railway Deployment — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# ── fly.toml (Fly.io) ────────────────────────────\napp = \"my-app\"\nprimary_region = \"iad\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Fly.io & Railway Deployment — common patterns you'll see in production.\n// APPROACH  - Combine Fly.io & Railway Deployment with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n[build]\n  builder = \"paketobuildpacks\"\n  buildpacks = [\"gcr.io/paketo-buildpacks/nodejs\"]\n[env]\n  NODE_ENV = \"production\"\n[[services]]\n  protocol = \"tcp\"\n  internal_port = 3000\n  [[services.ports]]\n    port = 80\n    handlers = [\"http\"]\n  [[services.ports]]\n    port = 443\n    handlers = [\"tls\", \"http\"]\n[checks]\n  [checks.status]\n    type = \"http\"\n    interval = \"30s\"\n    timeout = \"5s\"\n    grace_period = \"30s\"\n    path = \"/health\"\n[[vm]]\n  memory = \"256mb\"\n  cpus = 1\n[build.args]\n  NODE_ENV = \"production\"\n# ── railway.toml (Railway) ────────────────────────\n[build]\n  builder = \"nixpacks\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Fly.io & Railway Deployment — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n[deploy]\n  startCommand = \"node dist/server.js\"\n  healthcheckPath = \"/health\"\n  healthcheckTimeout = 30\n[[services]]\n  name = \"api\"\n  buildCommand = \"npm ci && npm run build\"\n  startCommand = \"node dist/server.js\"\n  port = 3000\n# ── Deployment commands ────────────────────────────\n# Fly.io:\nflyctl launch                # initialize project\nflyctl deploy                # deploy to Fly\nflyctl secrets set JWT_SECRET=value  # set env var\nflyctl scale vm=2            # scale to 2 instances\nflyctl logs                  # tail logs\n# Railway:\nrailway login                # authenticate\nrailway init                 # initialize project\nrailway up                   # deploy\nrailway variables set JWT_SECRET=value\nrailway logs                 # view logs\n# ── database & volumes ────────────────────────────\n# Fly: create persistent volume\nflyctl volumes create pgdata --size 10\n# Railway: attach Postgres service\n# Use Railway UI to add Postgres database\n# ── environment variables from .env ────────────────\n# Fly:\ncat .env | flyctl secrets set -\n# Railway:\nrailway variables set --from .env"
                  }
        ],
        tips: [
                  "Fly.io better for global distribution; Railway simpler interface.",
                  "Both auto-scale and handle SSL — no manual cert management.",
                  "Secrets stored securely — never in code or .env files.",
                  "Health checks ensure only healthy instances receive traffic."
        ],
        mistake: "Committing .env or secrets to git — use managed secrets.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "observability",
        fn: "Observability — OpenTelemetry for Node.js",
        desc: "Distributed tracing and metrics with OpenTelemetry SDK.",
        category: "Monitoring",
        subtitle: "OpenTelemetry, traces, metrics, spans, exporters",
        signature: "NodeSDK  |  tracer.startSpan()  |  exports to Jaeger/Datadog",
        descLong: "OpenTelemetry collects traces (request flows) and metrics (counters, histograms). Traces show latency bottlenecks across services. Metrics track business KPIs and system health. Exporters send data to Jaeger, Datadog, Honeycomb, etc. Automatic instrumentation for Express, database drivers, HTTP clients.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Observability — OpenTelemetry for Node.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { NodeSDK } from '@opentelemetry/sdk-node';\nimport { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';\nimport { JaegerExporter } from '@opentelemetry/exporter-trace-jaeger';\nimport { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';\nconst jaegerExporter = new JaegerExporter({\n  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',\n});\nconst sdk = new NodeSDK({\n  autoDetectResources: true,\n  instrumentations: [getNodeAutoInstrumentations()],\n  traceExporter: jaegerExporter,\n  metricReader: new PeriodicExportingMetricReader({\n    exporter: new OTLPMetricExporter({\n      url: 'http://localhost:4318/v1/metrics',\n    }),\n  }),\n});\nsdk.start();\nconsole.log('Telemetry started');\nprocess.on('SIGTERM', () => {\n  sdk.shutdown()\n    .then(() => console.log('Telemetry shut down'))\n    .catch((err) => console.error('Telemetry shutdown error:', err));\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Observability — OpenTelemetry for Node.js — common patterns you'll see in production.\n// APPROACH  - Combine Observability — OpenTelemetry for Node.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nimport { trace } from '@opentelemetry/api';\nconst tracer = trace.getTracer('my-app');\nasync function processRequest(userId) {\n  const span = tracer.startSpan('processRequest', {\n    attributes: {\n      'user.id': userId,\n    },\n  });\n  try {\n    const user = await db.users.findById(userId);\n    span.addEvent('user_found', {\n      'user.name': user.name,\n    });\n    // Child span\n    const dbSpan = tracer.startSpan('database_query', {\n      parent: span,\n    });\n    const posts = await db.posts.findByUserId(userId);\n    dbSpan.end();\n    return { user, posts };\n  } catch (error) {\n    span.recordException(error);\n    span.setStatus({ code: SpanStatusCode.ERROR });\n    throw error;\n  } finally {\n    span.end();\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Observability — OpenTelemetry for Node.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nimport { metrics } from '@opentelemetry/api';\nconst meter = metrics.getMeter('my-app');\nconst requestCounter = meter.createCounter('http_requests', {\n  description: 'Total HTTP requests',\n});\nconst requestDuration = meter.createHistogram('http_request_duration_ms', {\n  description: 'HTTP request duration in ms',\n});\napp.use((req, res, next) => {\n  const start = Date.now();\n  res.on('finish', () => {\n    const duration = Date.now() - start;\n    requestCounter.add(1, {\n      method: req.method,\n      path: req.path,\n      status: res.statusCode,\n    });\n    requestDuration.record(duration, {\n      method: req.method,\n      path: req.path,\n    });\n  });\n  next();\n});"
                  }
        ],
        tips: [
                  "Jaeger UI visualizes traces — see request paths and latency.",
                  "Auto-instrumentation captures Express, HTTP, database calls automatically.",
                  "Custom spans for business logic — track domain-specific operations.",
                  "Export to managed services (Datadog, New Relic) for production monitoring."
        ],
        mistake: "Only logging, not tracing — logs are reactive, traces are proactive.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "health-checks",
        fn: "Health Check Endpoints & Graceful Shutdown",
        desc: "Production health endpoints — /health, /ready, SIGTERM handling.",
        category: "Operations",
        subtitle: "/health, /ready, liveness, readiness, graceful shutdown",
        signature: "app.get(\"/health\")  |  process.on(\"SIGTERM\", gracefulShutdown)",
        descLong: "Health endpoints tell load balancers if the app is alive. /health checks dependencies (DB, Redis). /ready checks if ready to receive requests. Graceful shutdown closes server, finishes in-flight requests, closes connections.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Health Check Endpoints & Graceful Shutdown — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\napp.get('/health', async (req, res) => {\n  const checks = {\n    status: 'ok',\n    uptime: process.uptime(),\n    timestamp: new Date().toISOString(),\n    checks: {},\n  };\n  // Database check\n  try {\n    await db.query('SELECT 1');\n    checks.checks.database = { status: 'ok' };\n  } catch (err) {\n    checks.status = 'degraded';\n    checks.checks.database = { status: 'error', message: err.message };\n  }\n  // Redis check\n  try {\n    await redis.ping();\n    checks.checks.redis = { status: 'ok' };\n  } catch (err) {\n    checks.status = 'degraded';\n    checks.checks.redis = { status: 'error' };\n  }\n  const statusCode = checks.status === 'ok' ? 200 : 503;\n  res.status(statusCode).json(checks);\n});\napp.get('/ready', (req, res) => {\n  // Simple readiness check\n  const ready = server && server.listening;\n  const status = ready ? 200 : 503;\n  res.status(status).json({ ready });\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Health Check Endpoints & Graceful Shutdown — common patterns you'll see in production.\n// APPROACH  - Combine Health Check Endpoints & Graceful Shutdown with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nlet isShuttingDown = false;\nconst server = app.listen(PORT);\nprocess.on('SIGTERM', gracefulShutdown);\nprocess.on('SIGINT', gracefulShutdown);\nasync function gracefulShutdown(signal) {\n  if (isShuttingDown) return;\n  isShuttingDown = true;\n  console.log(`Received ${signal}, shutting down gracefully...`);\n  // Stop accepting new connections\n  server.close(async () => {\n    console.log('HTTP server closed');\n    try {\n      // Close database connection pool\n      if (db) {\n        await db.end();\n        console.log('Database closed');\n      }\n      // Close Redis\n      if (redis) {\n        await redis.quit();\n        console.log('Redis closed');\n      }\n      // Close any other resources\n      console.log('All resources closed, exiting');\n      process.exit(0);\n    } catch (err) {\n      console.error('Error during shutdown:', err);\n      process.exit(1);\n    }\n  });\n  // Force exit if shutdown takes too long\n  setTimeout(() => {\n    console.error('Forced shutdown after 30 seconds');\n    process.exit(1);\n  }, 30000);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Health Check Endpoints & Graceful Shutdown — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Make sure Node process receives SIGTERM (not through npm):\n// CMD [\"node\", \"dist/server.js\"]  not  CMD [\"npm\", \"start\"]\n// npm doesn't forward signals"
                  }
        ],
        tips: [
                  "Load balancers check /health to route traffic — return 200/503.",
                  "Return degraded status (503) if dependencies are down — allows graceful recovery.",
                  "Server.close() stops accepting connections but finishes in-flight requests.",
                  "Set grace period in Kubernetes (terminationGracePeriodSeconds) for shutdown time."
        ],
        mistake: "Process.exit(0) immediately — doesn't finish in-flight requests.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "zero-downtime",
        fn: "Zero-Downtime Deployment Strategies",
        desc: "Deploy without traffic loss — rolling updates, blue-green, feature flags.",
        category: "Deployment",
        subtitle: "rolling updates, blue-green deployment, feature flags, canary",
        signature: "maxUnavailable: 0  |  feature flags  |  rolling update strategy",
        descLong: "Rolling updates gradually replace old instances with new ones. Blue-green deploys to separate environment, then switch traffic. Feature flags decouple deployment from release. Canary deploys send small traffic % to new version before full rollout.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Zero-Downtime Deployment Strategies — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# In deployment.yaml:\nspec:\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1           # one extra pod during update\n      maxUnavailable: 0     # zero pods unavailable\n# kubectl apply -f deployment.yaml\n# Kubernetes gradually replaces old pods with new ones\n# Traffic shifts as new pods become ready"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Zero-Downtime Deployment Strategies — common patterns you'll see in production.\n// APPROACH  - Combine Zero-Downtime Deployment Strategies with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n#!/bin/bash\n# Deploy new version to green environment\ndocker pull myregistry/app:v2.0\ndocker run -d --name green myregistry/app:v2.0\n# Run smoke tests on green\ncurl http://green-instance:3000/health\n# Switch load balancer from blue to green\naws elbv2 modify-target-group-attachment \\\n  --target-group-arn arn:... \\\n  --targets Id=green-instance\n# Keep blue running for quick rollback\ndocker stop blue\nimport { getFeatureFlag } from './features.js';\napp.get('/api/new-feature', (req, res) => {\n  const newFeatureEnabled = getFeatureFlag('new-feature');\n  if (newFeatureEnabled) {\n    // New implementation\n    res.json({ data: 'new version' });\n  } else {\n    // Old implementation\n    res.json({ data: 'old version' });\n  }\n});\n// Enable/disable feature without redeploy:\n// Update feature flag in database or config service\n// Restart not needed for dynamic flags"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Zero-Downtime Deployment Strategies — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n# Route 5% of traffic to new version\n# Monitor error rates and latency\n# If good, gradually increase to 10%, 25%, 50%, 100%\n# Using Kubernetes with Istio:\napiVersion: networking.istio.io/v1alpha3\nkind: VirtualService\nmetadata:\n  name: app\nspec:\n  hosts:\n  - app.example.com\n  http:\n  - match:\n    - headers:\n        user-agent:\n          regex: \".*chrome.*\"\n    route:\n    - destination:\n        host: app-v2\n      weight: 100\n  - route:\n    - destination:\n        host: app-v1\n      weight: 95\n    - destination:\n        host: app-v2\n      weight: 5"
                  }
        ],
        tips: [
                  "Rolling updates (maxUnavailable: 0) safest for most apps — no downtime.",
                  "Blue-green best for large, risky changes — easy instant rollback.",
                  "Feature flags decouple deploy from release — release at any time.",
                  "Canary catches bugs before full rollout — monitor metrics closely."
        ],
        mistake: "Direct replacement (kill all old, start new) — causes downtime.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
    ],
  },
]

export default { meta, sections }
