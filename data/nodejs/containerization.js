export const meta = {
  "title": "Containerization",
  "domain": "nodejs",
  "sheet": "containerization",
  "icon": "📦"
}

export const sections = [

  // ── Section 1: Dockerfile — multi-stage, caching, production images ─────────────────────────────────────────
  {
    id: "dockerfile",
    title: "Dockerfile — multi-stage, caching, production images",
    entries: [
      {
        id: "dockerfile-basics",
        fn: "Dockerfile — basic Node.js image",
        desc: "A Dockerfile defines how to build a Docker image for your Node.js app. The basic pattern: install deps, copy source, expose port, start app.",
        category: "Dockerfile",
        subtitle: "FROM, WORKDIR, COPY, RUN, EXPOSE, CMD, .dockerignore",
        signature: "FROM node:20-slim\\nWORKDIR /app\\nCOPY . .\\nRUN npm ci\\nCMD [\"node\", \"server.js\"]",
        descLong: "A Dockerfile is a set of instructions for building a container image. Key directives: FROM (base image), WORKDIR (working directory), COPY (copy files from host), RUN (execute commands during build), EXPOSE (document ports), CMD (default command). Use .dockerignore to exclude node_modules, .git, and test files from the build context — this speeds up builds and reduces image size.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Containerize a basic Node.js Express app.\n// APPROACH  - Single-stage Dockerfile: copy source, install deps, run.\n// STRENGTHS - Simple; works for dev and small apps.\n// WEAKNESSES- Large image (~1GB); no layer caching; includes dev deps.\n//\n// Dockerfile\nFROM node:20-slim\n\nWORKDIR /app\n\n# Copy package files first for better caching\nCOPY package*.json ./\nRUN npm ci\n\n# Copy source\nCOPY . .\n\nEXPOSE 3000\n\nCMD [\"node\", \"server.js\"]\n\n// .dockerignore\nnode_modules\nnpm-debug.log\n.git\n.env\ncoverage\n*.md\n\n// Build and run:\n// docker build -t myapp .\n// docker run -p 3000:3000 myapp"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Multi-stage build: separate build deps from runtime;\n//             only install production deps in final image.\n// APPROACH  - Stage 1: install all deps + build; Stage 2: copy built\n//             artifacts + prod deps only.\n// STRENGTHS - Smaller image (~200MB vs ~1GB); no dev deps in prod.\n// WEAKNESSES- More complex Dockerfile; must know which artifacts to copy.\n//\n// Dockerfile\n# Stage 1 — Build\nFROM node:20-slim AS builder\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm ci                    # install ALL deps (including dev)\n\nCOPY . .\nRUN npm run build             # build TypeScript / bundle\n\n# Stage 2 — Production\nFROM node:20-slim AS production\nWORKDIR /app\n\n# Install ONLY production deps\nCOPY package*.json ./\nRUN npm ci --omit=dev && npm cache clean --force\n\n# Copy built artifacts from builder stage\nCOPY --from=builder /app/dist ./dist\n\n# Run as non-root user for security\nUSER node\n\nENV NODE_ENV=production\nEXPOSE 3000\n\n# Health check\nHEALTHCHECK --interval=30s --timeout=3s --retries=3 \\\n  CMD node -e \"fetch('http://localhost:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\"\n\nCMD [\"node\", \"dist/server.js\"]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Distroless/minimal images, BuildKit caching, .npmrc for\n//             private registries, and SBOM generation.\n// APPROACH  - gcr.io/distroless for minimal runtime; BuildKit cache mounts\n//             for npm; multi-arch builds; SBOM annotation.\n// STRENGTHS - ~120MB image; no shell (attack surface); cached builds;\n//             multi-arch (amd64 + arm64).\n// WEAKNESSES- Distroless has no shell — debugging requires kubectl exec\n//             with a debug sidecar or nsenter.\n//\n// Dockerfile\n# syntax=docker/dockerfile:1.6\n\n# Stage 1 — Build with cache mounts\nFROM node:20-slim AS builder\nWORKDIR /app\n\n# Cache npm downloads across builds (BuildKit)\nCOPY package*.json ./\nRUN --mount=type=cache,target=/root/.npm \\\n    npm ci\n\nCOPY . .\nRUN --mount=type=cache,target=/root/.npm \\\n    npm run build\n\n# Stage 2 — Distroless runtime (no shell, no package manager)\nFROM gcr.io/distroless/nodejs20-debian12 AS production\n\nWORKDIR /app\n\n# Copy production deps from a separate stage\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY --from=builder /app/dist ./dist\nCOPY package*.json ./\n\nUSER nonroot:nonroot\n\nENV NODE_ENV=production\nEXPOSE 3000\n\nCMD [\"dist/server.js\"]\n\n// Build with BuildKit + SBOM:\n// DOCKER_BUILDKIT=1 docker build \\\n//   --build-arg BUILDKIT_CACHE_MOUNT_NS=/root/.npm \\\n//   --sbom=true \\\n//   --platform linux/amd64,linux/arm64 \\\n//   -t myapp:latest .\n\n// docker-compose.yml with healthcheck + resource limits:\n// services:\n//   app:\n//     image: myapp:latest\n//     deploy:\n//       resources:\n//         limits: { cpus: '2', memory: 512M }\n//         reservations: { memory: 256M }\n//     healthcheck:\n//       test: [\"CMD\", \"node\", \"-e\", \"fetch('http://localhost:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\"]\n//       interval: 30s\n//       timeout: 3s\n//       retries: 3\n//     restart: unless-stopped"
                  }
        ],
        tips: [
                  "Always use npm ci (not npm install) in Docker — it's deterministic and faster.",
                  "Copy package*.json before source code — enables layer caching for npm install.",
                  "Use --omit=dev (npm) or --production (yarn) for production deps.",
                  "Run as non-root user (USER node) — containers run as root by default, which is a security risk.",
                  "Use .dockerignore to exclude node_modules — without it, Docker copies your local node_modules into the image."
        ],
        mistake: "Using npm install instead of npm ci in Docker — npm install resolves versions dynamically, producing different images across builds. npm ci uses the lockfile for reproducible builds.",
        shorthand: {
          verbose: "FROM node:20\nWORKDIR /app\nCOPY . .\nRUN npm install\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]",
          concise: "FROM node:20-slim\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nCMD [\"node\", \"server.js\"]",
        },
      },
      {
        id: "docker-compose",
        fn: "docker-compose — multi-container orchestration",
        desc: "docker-compose defines and runs multi-container Docker applications. Define your app, database, cache, and other services in a single YAML file.",
        category: "Docker Compose",
        subtitle: "services, volumes, networks, depends_on, environment, profiles",
        signature: "docker compose up -d  |  docker compose down  |  docker compose logs -f",
        descLong: "docker-compose.yml defines services (containers), volumes (persistent storage), networks (inter-container communication), and their configuration. Key features: depends_on for startup order, environment for config, volumes for data persistence, healthcheck for readiness, profiles for selective service groups (e.g., dev vs test). Use docker compose up -d for detached mode, docker compose logs -f for tailing, docker compose down for cleanup.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Run Node.js app + PostgreSQL + Redis with docker-compose.\n// APPROACH  - Define services with ports, environment, and depends_on.\n// STRENGTHS - One command starts everything; reproducible dev environment.\n// WEAKNESSES- Not for production — use Kubernetes or Swarm for that.\n//\n// docker-compose.yml\nversion: '3.9'\n\nservices:\n  app:\n    build: .\n    ports:\n      - \"3000:3000\"\n    environment:\n      DATABASE_URL: postgresql://user:pass@db:5432/myapp\n      REDIS_URL: redis://redis:6379\n    depends_on:\n      - db\n      - redis\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: user\n      POSTGRES_PASSWORD: pass\n      POSTGRES_DB: myapp\n    volumes:\n      - db-data:/var/lib/postgresql/data\n    ports:\n      - \"5432:5432\"\n\n  redis:\n    image: redis:7-alpine\n    ports:\n      - \"6379:6379\"\n\nvolumes:\n  db-data:\n\n// Start: docker compose up -d\n// Logs:  docker compose logs -f app\n// Stop:  docker compose down\n// Wipe:  docker compose down -v  (also removes volumes)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Add healthchecks, wait-for-it dependency ordering, dev/prod\n//             profiles, and hot-reload for development.\n// APPROACH  - healthcheck on each service; depends_on with condition:\n//             service_healthy; volumes for hot-reload; profiles for env.\n// STRENGTHS - Proper startup ordering; hot-reload in dev; isolated configs.\n// WEAKNESSES- healthcheck adds startup latency; profiles need explicit --profile.\n//\n// docker-compose.yml\nversion: '3.9'\n\nservices:\n  app:\n    build:\n      target: development  # use dev stage from Dockerfile\n    ports:\n      - \"3000:3000\"\n      - \"9229:9229\"  # Node.js debugger\n    environment:\n      DATABASE_URL: postgresql://user:pass@db:5432/myapp\n      REDIS_URL: redis://redis:6379\n      NODE_ENV: development\n    volumes:\n      - .:/app           # hot-reload: mount source\n      - /app/node_modules  # don't overwrite container node_modules\n    depends_on:\n      db:\n        condition: service_healthy\n      redis:\n        condition: service_started\n    command: npm run dev  # nodemon for hot-reload\n    profiles: [dev]\n\n  app-prod:\n    build:\n      target: production\n    ports:\n      - \"3000:3000\"\n    environment:\n      DATABASE_URL: postgresql://user:pass@db:5432/myapp\n      REDIS_URL: redis://redis:6379\n      NODE_ENV: production\n    depends_on:\n      db:\n        condition: service_healthy\n    restart: unless-stopped\n    profiles: [prod]\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: user\n      POSTGRES_PASSWORD: pass\n      POSTGRES_DB: myapp\n    volumes:\n      - db-data:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U user -d myapp\"]\n      interval: 5s\n      timeout: 3s\n      retries: 5\n    ports:\n      - \"5432:5432\"\n\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 5s\n      timeout: 3s\n      retries: 5\n\nvolumes:\n  db-data:\n\n// Dev:  docker compose --profile dev up -d\n// Prod: docker compose --profile prod up -d"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Multi-environment compose: base + override files; resource\n//             limits; logging drivers; network isolation; secrets.\n// APPROACH  - docker-compose.yml as base; docker-compose.prod.yml override;\n//             deploy.resources for CPU/memory limits; logging for log\n//             rotation; internal networks for DB isolation; secrets for\n//             sensitive values.\n// STRENGTHS - DRY config across environments; resource-bounded; log-rotation\n//             built in; DB not exposed externally; secrets not in env vars.\n// WEAKNESSES- Secrets require Docker Swarm or external secret store.\n//\n// docker-compose.yml (base)\nversion: '3.9'\n\nservices:\n  app:\n    build: .\n    networks:\n      - frontend\n      - backend\n    logging:\n      driver: json-file\n      options:\n        max-size: \"10m\"\n        max-file: \"3\"\n    deploy:\n      resources:\n        limits:\n          cpus: '2'\n          memory: 512M\n        reservations:\n          memory: 256M\n\n  db:\n    image: postgres:16-alpine\n    networks:\n      - backend  # NOT on frontend — isolated\n    volumes:\n      - db-data:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U user\"]\n      interval: 5s\n      retries: 5\n    # No ports exposed — only accessible from backend network\n\n  redis:\n    image: redis:7-alpine\n    networks:\n      - backend\n\nnetworks:\n  frontend:\n    driver: bridge\n  backend:\n    driver: bridge\n    internal: true  # isolated from host network\n\nvolumes:\n  db-data:\n\n// docker-compose.prod.yml (override)\nservices:\n  app:\n    environment:\n      NODE_ENV: production\n    deploy:\n      replicas: 3\n      resources:\n        limits:\n          cpus: '4'\n          memory: 1G\n      restart_policy:\n        condition: any\n        max_attempts: 3\n    secrets:\n      - db-password\n      - redis-password\n\nsecrets:\n  db-password:\n    file: ./secrets/db-password.txt\n  redis-password:\n    file: ./secrets/redis-password.txt\n\n// Run: docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
                  }
        ],
        tips: [
                  "Use depends_on with condition: service_healthy — ensures DB is ready before app starts.",
                  "Use volumes for hot-reload in dev: mount source code, exclude node_modules with anonymous volume.",
                  "Use profiles to separate dev/prod configs in one file — cleaner than multiple files for small projects.",
                  "Set logging max-size and max-file — without limits, Docker logs fill the disk.",
                  "Use internal: true on backend networks — DB and Redis should not be accessible from the host."
        ],
        mistake: "Exposing database ports to the host in production — `ports: - \"5432:5432\"` makes the DB accessible externally. Remove ports and use internal networks instead.",
        shorthand: {
          verbose: "// docker-compose.yml\nservices:\n  app: { build: ., ports: [\"3000:3000\"], depends_on: [db] }\n  db: { image: postgres:16-alpine, volumes: [db-data:/var/lib/postgresql/data] }\nvolumes: { db-data: }",
          concise: "services: { app: { build: ., ports: [\"3000:3000\"] }, db: { image: postgres:16-alpine } }",
        },
      },
    ],
  },

  // ── Section 2: Image Optimization — size, caching, security ─────────────────────────────────────────
  {
    id: "optimization",
    title: "Image Optimization — size, caching, security",
    entries: [
      {
        id: "image-size",
        fn: "Image size optimization — slim, alpine, distroless",
        desc: "Reducing Docker image size improves build time, deploy speed, and security surface area. Choose the smallest base image that meets your needs.",
        category: "Image Optimization",
        subtitle: "node:20-slim vs node:20-alpine vs distroless, multi-stage, .dockerignore, prune",
        signature: "docker images | head  |  docker history myapp  |  dive myapp",
        descLong: "Node.js Docker images come in several flavors: node:20 (~1GB, full Debian), node:20-slim (~250MB, Debian without docs/man), node:20-alpine (~180MB, musl libc, may have native module issues), gcr.io/distroless/nodejs20 (~120MB, no shell, no package manager). Use multi-stage builds to exclude build tools from the final image. Use npm prune --production or npm ci --omit=dev to exclude dev dependencies. Use dive to inspect layer contents and find waste.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Compare image sizes and pick the right base.\n// APPROACH  - node:20-slim for compatibility; alpine for smallest compat;\n//             distroless for maximum security.\n// STRENGTHS - slim is 4x smaller than full; alpine is 5x; distroless is 8x.\n// WEAKNESSES- alpine uses musl libc — some native modules (bcrypt, sharp)\n//             may need recompilation; distroless has no shell for debugging.\n//\n// Image size comparison (node:20):\n// node:20              ~1.0 GB  (full Debian + build tools)\n// node:20-slim         ~250 MB  (Debian, no build tools)\n// node:20-alpine       ~180 MB  (Alpine Linux, musl libc)\n// distroless/nodejs20  ~120 MB  (no shell, no package manager)\n\n// Recommendation:\n// - Development:  node:20-slim (compatibility + debugging)\n// - Production:   distroless/nodejs20 (smallest + most secure)\n// - CI/CD:        node:20-alpine (fast pulls, may need --build-arg for native modules)\n\n// Check image size:\n// docker images myapp\n\n// Inspect layers:\n// docker history myapp\n\n// Deep inspection (install dive):\n// dive myapp  — shows each layer's added/removed files"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Optimize a Dockerfile for minimal image size with multi-stage\n//             and production-only deps.\n// APPROACH  - Stage 1: build with full image; Stage 2: slim runtime with\n//             only prod deps + built artifacts.\n// STRENGTHS - Final image ~150MB instead of ~1GB; no dev deps, no build tools.\n// WEAKNESSES- Must correctly identify which files to copy from builder.\n//\n// Dockerfile\n# Build stage — full image with build tools\nFROM node:20-slim AS builder\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm ci                    # all deps including dev\n\nCOPY tsconfig.json ./\nCOPY src/ ./src/\nRUN npm run build             # tsc -> dist/\n\n# Prune dev dependencies\nRUN npm prune --omit=dev\n\n# Runtime stage — slim image\nFROM node:20-slim\nWORKDIR /app\n\n# Copy only what we need from builder\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/package.json ./\n\nUSER node\nENV NODE_ENV=production\nCMD [\"node\", \"dist/server.js\"]\n\n// Result: ~150MB image (vs ~1GB single-stage)\n// Verify: docker images myapp"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Distroless with native modules; SBOM; cosign image signing;\n//             and BuildKit for reproducible builds.\n// APPROACH  - Build native modules in alpine, copy to distroless; use\n//             --sbom for supply chain; cosign for image signing.\n// STRENGTHS - Smallest possible secure image; signed and attested.\n// WEAKNESSES- Native module compilation requires matching libc; distroless\n//             debugging requires debug sidecar.\n//\n// Dockerfile\n# syntax=docker/dockerfile:1.6\n\n# Stage 1: Build native modules in Debian (matches distroless libc)\nFROM node:20-slim AS builder\nWORKDIR /app\n\nCOPY package*.json ./\nRUN --mount=type=cache,target=/root/.npm \\\n    npm ci\n\nCOPY . .\nRUN npm run build\nRUN npm prune --omit=dev\n\n# Stage 2: Distroless — no shell, no package manager\nFROM gcr.io/distroless/nodejs20-debian12\nWORKDIR /app\n\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/package.json ./\n\nUSER nonroot:nonroot\nENV NODE_ENV=production\n\nCMD [\"dist/server.js\"]\n\n// Build with SBOM and attestation:\n// DOCKER_BUILDKIT=1 docker build \\\n//   --sbom=true \\\n//   --label org.opencontainers.image.source=https://github.com/me/app \\\n//   --label org.opencontainers.image.version=1.0.0 \\\n//   -t myapp:1.0.0 .\n\n// Sign with cosign:\n// cosign sign --key cosign.key myapp:1.0.0\n// cosign verify --key cosign.pub myapp:1.0.0\n\n// Debug distroless image (no shell):\n// kubectl debug -it pod/myapp --image=busybox --target=myapp\n// (or) docker run --rm -it --entrypoint=sh gcr.io/distroless/nodejs20-debian12:debug"
                  }
        ],
        tips: [
                  "Use node:20-slim as the default — alpine has musl libc issues with native modules like bcrypt and sharp.",
                  "Run `dive myapp` to find wasted space — it shows each layer and what files were added.",
                  "Use npm prune --omit=dev after build to remove dev deps from node_modules.",
                  "For distroless debugging, use the :debug tag which includes a busybox shell.",
                  "Always set NODE_ENV=production — Express and other frameworks optimize when this is set."
        ],
        mistake: "Using node:20 (full image) in production — it includes build tools, man pages, and a shell that increase the attack surface by 8x. Use node:20-slim or distroless.",
        shorthand: {
          verbose: "FROM node:20-slim AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci && npm run build && npm prune --omit=dev\n\nFROM gcr.io/distroless/nodejs20-debian12\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCMD [\"dist/server.js\"]",
          concise: "FROM node:20-slim AS b\nRUN npm ci && npm run build && npm prune --omit=dev\nFROM gcr.io/distroless/nodejs20-debian12\nCOPY --from=b /app/dist ./dist\nCMD [\"dist/server.js\"]",
        },
      },
    ],
  },
]

export default { meta, sections }
