export const meta = {
  "title": "Databases & ORMs",
  "domain": "nodejs",
  "sheet": "database",
  "icon": "💾"
}

export const sections = [

  // ── Section 1: Databases & ORMs ─────────────────────────────────────────
  {
    id: "databases-orms",
    title: "Databases & ORMs",
    entries: [
      {
        id: "postgres-node-pg",
        fn: "PostgreSQL with node-pg",
        desc: "Query PostgreSQL database using the pg library — parameterized queries, connection pooling.",
        category: "SQL Databases",
        subtitle: "PostgreSQL driver for Node.js",
        signature: "const pool = new Pool(config)  →  pool.query(sql, [params])",
        descLong: "The pg library is the Node PostgreSQL driver. Use connection pooling (Pool) for production, not single connections. Parameterized queries (with $1, $2) prevent SQL injection. Handle errors properly. Connection pooling reuses connections for efficiency.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of PostgreSQL with node-pg — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport pg from 'pg';\nconst { Pool } = pg;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of PostgreSQL with node-pg — common patterns you'll see in production.\n// APPROACH  - Combine PostgreSQL with node-pg with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Connection pool (reuses connections)\nconst pool = new Pool({\n  user: process.env.DB_USER,\n  password: process.env.DB_PASSWORD,\n  host: process.env.DB_HOST,\n  port: process.env.DB_PORT,\n  database: process.env.DB_NAME,\n  max: 20,                    // Max connections in pool\n  idleTimeoutMillis: 30000,\n  connectionTimeoutMillis: 2000,\n});\n// Handle pool errors\npool.on('error', (err) => {\n  console.error('Unexpected error on idle client', err);\n});\n// Query with parameterized values (prevents SQL injection)\nasync function getUser(userId) {\n  try {\n    const result = await pool.query(\n      'SELECT id, email, name FROM users WHERE id = $1',\n      [userId]\n    );\n    return result.rows[0];\n  } catch (err) {\n    console.error('Query error:', err);\n    throw err;\n  }\n}\n// Insert with RETURNING\nasync function createUser(email, name) {\n  const result = await pool.query(\n    'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id, email, name',\n    [email, name]\n  );\n  return result.rows[0];\n}\n// Transaction\nasync function transferFunds(fromId, toId, amount) {\n  const client = await pool.connect();\n  try {\n    await client.query('BEGIN');\n    // Deduct from source\n    await client.query(\n      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',\n      [amount, fromId]\n    );\n    // Add to destination\n    await client.query(\n      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',\n      [amount, toId]\n    );"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of PostgreSQL with node-pg — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Log transfer\n    await client.query(\n      'INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3)',\n      [fromId, toId, amount]\n    );\n    await client.query('COMMIT');\n  } catch (err) {\n    await client.query('ROLLBACK');\n    throw err;\n  } finally {\n    client.release();\n  }\n}\n// Batch inserts\nasync function createUsers(users) {\n  const placeholders = users\n    .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)\n    .join(',');\n  const values = users.flatMap(u => [u.email, u.name]);\n  const query = `INSERT INTO users (email, name) VALUES ${placeholders} RETURNING *`;\n  const result = await pool.query(query, values);\n  return result.rows;\n}\n// Graceful shutdown\nprocess.on('SIGTERM', async () => {\n  await pool.end();\n  process.exit(0);\n});"
                  }
        ],
        tips: [
                  "Always use Pool for production, not single connections — connection pooling is essential.",
                  "Use parameterized queries ($1, $2) — never string concatenate user input into SQL.",
                  "Set reasonable pool sizes: max: 20 works for most apps, tune based on load.",
                  "Handle client release properly in transactions — always call client.release() in finally."
        ],
        mistake: "Creating a new connection for each query — connection pooling reuse is critical for performance.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "prisma-orm",
        fn: "Prisma ORM",
        desc: "Modern ORM with type safety, migrations, and intuitive API — define schemas, generate migrations.",
        category: "ORMs",
        subtitle: "Type-safe database access",
        signature: "await prisma.user.findUnique({ where: { id } })  |  await prisma.user.create({ data })",
        descLong: "Prisma provides type-safe database queries with auto-completion. prisma.schema defines the database schema. prisma migrate generates SQL migrations. Supports PostgreSQL, MySQL, SQLite. Includes a visual studio (Prisma Studio) for browsing data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Prisma ORM — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// prisma/schema.prisma\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Prisma ORM — common patterns you'll see in production.\n// APPROACH  - Combine Prisma ORM with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ngenerator client {\n  provider = \"prisma-client-js\"\n}\nmodel User {\n  id    Int     @id @default(autoincrement())\n  email String  @unique\n  name  String?\n  posts Post[]\n  @@index([email])\n}\nmodel Post {\n  id    Int     @id @default(autoincrement())\n  title String\n  content String\n  userId Int\n  user   User    @relation(fields: [userId], references: [id])\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n// src/db.ts\nimport { PrismaClient } from '@prisma/client';\nconst prisma = new PrismaClient();\nexport default prisma;\n// src/users.ts\nimport prisma from './db';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Prisma ORM — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Find by ID (type-safe!)\nasync function getUser(id: number) {\n  const user = await prisma.user.findUnique({\n    where: { id },\n    include: { posts: true }, // Join posts\n  });\n  return user;\n}\n// Find with filtering\nasync function searchUsers(email: string) {\n  return await prisma.user.findMany({\n    where: {\n      email: {\n        contains: email,\n        mode: 'insensitive', // Case-insensitive search\n      },\n    },\n    orderBy: { name: 'asc' },\n    take: 10, // LIMIT\n  });\n}\n// Create with nested data\nasync function createUserWithPosts(userData: any) {\n  return await prisma.user.create({\n    data: {\n      email: userData.email,\n      name: userData.name,\n      posts: {\n        create: [\n          { title: 'First Post', content: '...' },\n          { title: 'Second Post', content: '...' },\n        ],\n      },\n    },\n    include: { posts: true },\n  });\n}\n// Update\nasync function updateUser(id: number, data: any) {\n  return await prisma.user.update({\n    where: { id },\n    data: {\n      name: data.name,\n      // posts: { connect: [{ id: 1 }] } // Relation updates\n    },\n  });\n}\n// Delete\nasync function deleteUser(id: number) {\n  return await prisma.user.delete({\n    where: { id },\n  });\n}\n// Transaction\nasync function createUserAndPost(userData: any, postData: any) {\n  return await prisma.$transaction(async (tx) => {\n    const user = await tx.user.create({ data: userData });\n    const post = await tx.post.create({\n      data: { ...postData, userId: user.id },\n    });\n    return { user, post };\n  });\n}\n// Migrations\n// npx prisma migrate dev --name add_users\n// npx prisma migrate deploy (production)\n// npx prisma studio (browse data graphically)\n// Disconnect gracefully\nprocess.on('SIGTERM', async () => {\n  await prisma.$disconnect();\n  process.exit(0);\n});"
                  }
        ],
        tips: [
                  "Define schema in prisma/schema.prisma — clear, generates migrations automatically.",
                  "Use include for relations, not join — Prisma handles the query optimization.",
                  "Migrations are version-controlled SQL — safe for team collaboration.",
                  "Prisma Studio (npx prisma studio) is great for testing queries and browsing data."
        ],
        mistake: "Modifying the database directly instead of via Prisma migrations — migrations drift from the schema.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "drizzle-orm",
        fn: "Drizzle ORM",
        desc: "Lightweight, type-safe ORM with SQL-like API — better performance than Prisma for some use cases.",
        category: "ORMs",
        subtitle: "Lightweight type-safe ORM",
        signature: "db.select().from(users).where(eq(users.id, 1))",
        descLong: "Drizzle is a lightweight ORM emphasizing SQL control and TypeScript safety. Less abstraction than Prisma, more SQL-like. Excellent for complex queries. Faster than Prisma in benchmarks. Supports PostgreSQL, MySQL, SQLite.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Drizzle ORM — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// drizzle/schema.ts\nimport { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Drizzle ORM — common patterns you'll see in production.\n// APPROACH  - Combine Drizzle ORM with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport const users = pgTable('users', {\n  id: serial('id').primaryKey(),\n  email: varchar('email').unique().notNull(),\n  name: varchar('name'),\n  createdAt: timestamp('created_at').defaultNow(),\n});\nexport const posts = pgTable('posts', {\n  id: serial('id').primaryKey(),\n  title: varchar('title').notNull(),\n  content: text('content'),\n  userId: serial('user_id')\n    .references(() => users.id)\n    .notNull(),\n  createdAt: timestamp('created_at').defaultNow(),\n});\n// src/db.ts\nimport { drizzle } from 'drizzle-orm/postgres-js';\nimport postgres from 'postgres';\nimport * as schema from './schema';\nconst client = postgres(process.env.DATABASE_URL);\nexport const db = drizzle(client, { schema });\n// src/queries.ts\nimport { eq, like, desc } from 'drizzle-orm';\nimport { db } from './db';\nimport { users, posts } from './schema';\n// Select\nasync function getUser(id: number) {\n  return await db.query.users.findFirst({\n    where: eq(users.id, id),\n    with: { posts: true }, // Relation\n  });\n}\n// Search\nasync function searchUsers(email: string) {\n  return await db\n    .select()\n    .from(users)\n    .where(like(users.email, `%${email}%`))\n    .orderBy(users.name)\n    .limit(10);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Drizzle ORM — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Insert\nasync function createUser(email: string, name: string) {\n  const [user] = await db\n    .insert(users)\n    .values({ email, name })\n    .returning();\n  return user;\n}\n// Update\nasync function updateUser(id: number, data: { name?: string }) {\n  return await db\n    .update(users)\n    .set(data)\n    .where(eq(users.id, id))\n    .returning();\n}\n// Join\nasync function getUsersWithPostCount() {\n  return await db\n    .select({\n      id: users.id,\n      email: users.email,\n      postCount: db.raw('COUNT(posts.id)'),\n    })\n    .from(users)\n    .leftJoin(posts, eq(users.id, posts.userId))\n    .groupBy(users.id)\n    .orderBy(desc(users.id));\n}\n// Delete\nasync function deleteUser(id: number) {\n  return await db\n    .delete(users)\n    .where(eq(users.id, id))\n    .returning();\n}\n// Transaction\nasync function createUserWithPost(userData: any, postData: any) {\n  return await db.transaction(async (tx) => {\n    const [user] = await tx\n      .insert(users)\n      .values(userData)\n      .returning();\n    const [post] = await tx\n      .insert(posts)\n      .values({ ...postData, userId: user.id })\n      .returning();\n    return { user, post };\n  });\n}"
                  }
        ],
        tips: [
                  "Drizzle is closer to SQL — better for complex queries with fine-grained control.",
                  "Migrations are hand-written SQL (or use drizzle-kit for generation).",
                  "Excellent TypeScript support — schema is defined in TS, not a separate file.",
                  "Choose Drizzle if you need raw SQL control; Prisma if you prefer abstraction."
        ],
        mistake: "Using Drizzle for simple CRUD when Prisma would be simpler — Drizzle shines with complex queries.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "redis-caching",
        fn: "Redis Caching",
        desc: "Use Redis for caching, sessions, rate limiting, and queues — in-memory data store.",
        category: "Caching & Sessions",
        subtitle: "Fast in-memory caching layer",
        signature: "const redis = new Redis()  →  redis.set(key, value, \"EX\", seconds)",
        descLong: "Redis is an in-memory key-value store for caching, sessions, and queues. Much faster than database queries. Set expiration times (TTL) for cache invalidation. Use hashes for structured data. Pub/Sub for real-time messaging.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Redis Caching — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport Redis from 'ioredis';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Redis Caching — common patterns you'll see in production.\n// APPROACH  - Combine Redis Caching with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst redis = new Redis({\n  host: process.env.REDIS_HOST || 'localhost',\n  port: process.env.REDIS_PORT || 6379,\n  password: process.env.REDIS_PASSWORD,\n  db: 0,\n  retryStrategy: (times) => Math.min(times * 50, 2000),\n});\n// Handle errors\nredis.on('error', (err) => console.error('Redis error:', err));\nredis.on('connect', () => console.log('Redis connected'));\n// Cache-aside pattern\nasync function getUserWithCache(userId: number) {\n  // Check cache first\n  const cached = await redis.get(`user:${userId}`);\n  if (cached) {\n    return JSON.parse(cached);\n  }\n  // Cache miss: fetch from DB\n  const user = await db.users.findById(userId);\n  if (user) {\n    // Store in cache for 1 hour\n    await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));\n  }\n  return user;\n}\n// Hash for structured data\nasync function storeUserProfile(userId: number, profile: any) {\n  await redis.hset(`profile:${userId}`, profile);\n  await redis.expire(`profile:${userId}`, 3600);\n}\nasync function getUserProfile(userId: number) {\n  return await redis.hgetall(`profile:${userId}`);\n}\n// List for queues\nasync function enqueueJob(job: any) {\n  await redis.rpush('job_queue', JSON.stringify(job));\n}\nasync function dequeueJob() {\n  const job = await redis.lpop('job_queue');\n  return job ? JSON.parse(job) : null;\n}\n// Pub/Sub for real-time messaging\nconst subscriber = redis.duplicate();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Redis Caching — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Publish\nasync function notifyUser(userId: number, message: string) {\n  await redis.publish(`user:${userId}:notifications`, message);\n}\n// Subscribe\nsubscriber.subscribe(`user:123:notifications`, (err, count) => {\n  if (err) {\n    console.error('Subscription error:', err);\n  } else {\n    console.log(`Subscribed to ${count} channel(s)`);\n  }\n});\nsubscriber.on('message', (channel, message) => {\n  console.log(`Received on ${channel}: ${message}`);\n  // Send to WebSocket client\n});\n// Session store (with express-session)\nimport session from 'express-session';\nimport RedisStore from 'connect-redis';\napp.use(\n  session({\n    store: new RedisStore({ client: redis }),\n    secret: process.env.SESSION_SECRET,\n    resave: false,\n    saveUninitialized: false,\n    cookie: {\n      httpOnly: true,\n      secure: true,\n      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days\n    },\n  })\n);\n// Rate limiting with Redis\nimport rateLimit from 'express-rate-limit';\nimport RedisStore from 'rate-limit-redis';\nconst limiter = rateLimit({\n  store: new RedisStore({\n    client: redis,\n    prefix: 'rl:',\n  }),\n  windowMs: 15 * 60 * 1000,\n  max: 100,\n});\napp.use(limiter);\n// Distributed counter\nasync function incrementCounter(key: string) {\n  const count = await redis.incr(key);\n  // Expire after 1 minute\n  if (count === 1) {\n    await redis.expire(key, 60);\n  }\n  return count;\n}\n// Graceful shutdown\nprocess.on('SIGTERM', async () => {\n  await redis.quit();\n  process.exit(0);\n});"
                  }
        ],
        tips: [
                  "Use cache-aside pattern: check cache, fetch from DB on miss, populate cache.",
                  "Set TTL (time-to-live) on all cache keys — prevents stale data accumulation.",
                  "Use hashes (HSET, HGETALL) for structured data instead of storing JSON strings.",
                  "Pub/Sub is great for real-time features but data doesn't persist — use a stream for durability."
        ],
        mistake: "Caching without TTL — cache grows infinitely and becomes stale.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "mongodb-mongoose",
        fn: "MongoDB with Mongoose",
        desc: "NoSQL database queries with Mongoose ODM — schemas, validation, and relationships.",
        category: "NoSQL Databases",
        subtitle: "MongoDB document modeling",
        signature: "const schema = new Schema(...)  →  const Model = mongoose.model(\"User\", schema)",
        descLong: "Mongoose provides schemas and validation for MongoDB. Define models with fields and types. Supports middleware hooks (pre, post). Query builder for fluent API. Relationships via references or embedding.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of MongoDB with Mongoose — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport mongoose from 'mongoose';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of MongoDB with Mongoose — common patterns you'll see in production.\n// APPROACH  - Combine MongoDB with Mongoose with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Connect to MongoDB\nmongoose.connect(process.env.MONGODB_URL, {\n  useNewUrlParser: true,\n  useUnifiedTopology: true,\n});\n// Define schema\nconst userSchema = new mongoose.Schema({\n  email: {\n    type: String,\n    required: true,\n    unique: true,\n    lowercase: true,\n  },\n  name: String,\n  passwordHash: String,\n  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],\n  createdAt: { type: Date, default: Date.now },\n});\n// Add methods\nuserSchema.methods.addPost = function (postId) {\n  this.posts.push(postId);\n  return this.save();\n};\n// Pre/post hooks\nuserSchema.pre('save', async function (next) {\n  if (!this.isModified('password')) return next();\n  // Hash password before saving\n  this.passwordHash = await bcrypt.hash(this.password, 12);\n  next();\n});\nuserSchema.post('save', function (doc, next) {\n  console.log('User saved:', doc.email);\n  next();\n});\nconst User = mongoose.model('User', userSchema);\n// Post schema with population\nconst postSchema = new mongoose.Schema({\n  title: String,\n  content: String,\n  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },\n  comments: [\n    {\n      text: String,\n      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },\n      createdAt: { type: Date, default: Date.now },\n    },\n  ],\n  createdAt: { type: Date, default: Date.now },\n});\nconst Post = mongoose.model('Post', postSchema);\n// Queries\nasync function getUser(id) {\n  return await User.findById(id).populate('posts');\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of MongoDB with Mongoose — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nasync function getUserByEmail(email) {\n  return await User.findOne({ email });\n}\n// Query with filtering and sorting\nasync function searchUsers(query) {\n  return await User.find({ name: new RegExp(query, 'i') })\n    .limit(10)\n    .sort({ createdAt: -1 });\n}\n// Create\nasync function createUser(data) {\n  const user = new User(data);\n  return await user.save();\n}\n// Update\nasync function updateUser(id, data) {\n  return await User.findByIdAndUpdate(id, data, { new: true });\n}\n// Delete\nasync function deleteUser(id) {\n  return await User.findByIdAndDelete(id);\n}\n// Aggregate pipeline (complex queries)\nasync function getUserPostStats() {\n  return await Post.aggregate([\n    { $group: { _id: '$author', postCount: { $sum: 1 } } },\n    { $sort: { postCount: -1 } },\n    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'author' } },\n  ]);\n}\n// Transaction\nasync function createUserWithPost(userData, postData) {\n  const session = await mongoose.startSession();\n  session.startTransaction();\n  try {\n    const user = await User.create([userData], { session });\n    const post = await Post.create([{ ...postData, author: user[0]._id }], { session });\n    await session.commitTransaction();\n    return { user: user[0], post: post[0] };\n  } catch (err) {\n    await session.abortTransaction();\n    throw err;\n  } finally {\n    session.endSession();\n  }\n}"
                  }
        ],
        tips: [
                  "Mongoose schemas enforce structure — useful for validation and type safety.",
                  "Use populate() to fetch related documents — cleaner than manual lookups.",
                  "Aggregate pipeline for complex queries — more powerful than simple find().",
                  "Transactions (sessions) for multi-document consistency."
        ],
        mistake: "Deep nesting in documents — MongoDB works better with normalized schemas like relational DBs.",
        shorthand: {
          verbose: "const mongoose = require('mongoose');\nawait mongoose.connect('mongodb://localhost/mydb');\nconst userSchema = new mongoose.Schema({\n  name: { type: String, required: true },\n  email: String,\n  createdAt: { type: Date, default: Date.now }\n});\nconst User = mongoose.model('User', userSchema);\nconst user = new User({ name: 'Alice', email: 'alice@example.com' });\nawait user.save();",
          concise: "const User = mongoose.model('User', new mongoose.Schema({\n  name: { type: String, required: true },\n  email: String,\n  createdAt: { type: Date, default: Date.now }\n}));\nawait User.create({ name: 'Alice', email: 'alice@example.com' });",
        },
      },
      {
        id: "prisma-orm",
        fn: "Prisma ORM",
        desc: "Type-safe database client with schema-first design, migrations, and auto-generated queries.",
        category: "ORMs",
        subtitle: "Schema → migrate → query with full TypeScript safety",
        signature: "prisma.user.findMany()  |  prisma.user.create({ data })  |  prisma.$transaction()",
        descLong: "Prisma is a next-gen ORM with three parts: Prisma Schema (data model), Prisma Migrate (schema migrations), and Prisma Client (auto-generated, type-safe query builder). It supports PostgreSQL, MySQL, SQLite, MongoDB, and SQL Server. The generated client provides full TypeScript autocompletion for all queries, relations, and filters.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Prisma ORM — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// prisma/schema.prisma\n// generator client {\n//   provider = \"prisma-client-js\"\n// }\n// datasource db {\n//   provider = \"postgresql\"\n//   url      = env(\"DATABASE_URL\")\n// }\n// model User {\n//   id        String   @id @default(cuid())\n//   email     String   @unique\n//   name      String?\n//   posts     Post[]\n//   createdAt DateTime @default(now())\n//   updatedAt DateTime @updatedAt\n//   @@index([email])\n// }\n// model Post {\n//   id        String   @id @default(cuid())\n//   title     String\n//   content   String?\n//   published Boolean  @default(false)\n//   author    User     @relation(fields: [authorId], references: [id])\n//   authorId  String\n//   tags      Tag[]\n//   @@index([authorId])\n// }\nimport { PrismaClient } from '@prisma/client';\n// Singleton pattern (important for serverless/hot reload)\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new PrismaClient({\n  log: process.env.NODE_ENV === 'development' ? ['query'] : [],\n});\nif (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Prisma ORM — common patterns you'll see in production.\n// APPROACH  - Combine Prisma ORM with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Create\nconst user = await prisma.user.create({\n  data: {\n    email: 'alice@example.com',\n    name: 'Alice',\n    posts: {\n      create: [\n        { title: 'First Post', content: 'Hello world' },\n        { title: 'Second Post', published: true },\n      ],\n    },\n  },\n  include: { posts: true },  // return created posts too\n});\n// Read with filters and relations\nconst users = await prisma.user.findMany({\n  where: {\n    email: { contains: '@example.com' },\n    posts: { some: { published: true } },\n  },\n  include: { posts: { where: { published: true } } },\n  orderBy: { createdAt: 'desc' },\n  take: 10,\n  skip: 0,\n});\n// Update\nawait prisma.user.update({\n  where: { email: 'alice@example.com' },\n  data: { name: 'Alice Smith' },\n});\n// Upsert (create or update)\nawait prisma.user.upsert({\n  where: { email: 'alice@example.com' },\n  update: { name: 'Alice Smith' },\n  create: { email: 'alice@example.com', name: 'Alice Smith' },\n});\n// Delete\nawait prisma.user.delete({ where: { id: userId } });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Prisma ORM — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst [post, user2] = await prisma.$transaction([\n  prisma.post.create({ data: { title: 'New', authorId: id } }),\n  prisma.user.update({ where: { id }, data: { name: 'Updated' } }),\n]);\n// Interactive transaction\nawait prisma.$transaction(async (tx) => {\n  const sender = await tx.user.update({\n    where: { id: senderId },\n    data: { balance: { decrement: amount } },\n  });\n  if (sender.balance < 0) throw new Error('Insufficient funds');\n  await tx.user.update({\n    where: { id: receiverId },\n    data: { balance: { increment: amount } },\n  });\n});"
                  }
        ],
        tips: [
                  "Use the Prisma singleton pattern in development — prevents \"too many connections\" from hot reload.",
                  "npx prisma migrate dev creates and applies migrations; npx prisma db push for prototyping without migrations.",
                  "include: loads relations eagerly; select: picks specific fields — use select for performance.",
                  "npx prisma studio opens a visual database browser at localhost:5555."
        ],
        mistake: "Creating a new PrismaClient() on every request or in every file — this exhausts database connections. Use a singleton pattern, especially in serverless environments.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "redis-caching",
        fn: "Redis Caching & Sessions",
        desc: "Use Redis for in-memory caching, session storage, rate limiting, and pub/sub messaging.",
        category: "Caching",
        subtitle: "Fast key-value store for sessions, cache, and queues",
        signature: "client.set(key, value, { EX: ttl })  |  client.get(key)",
        descLong: "Redis is an in-memory data store used as a cache, session store, message broker, and rate limiter. The ioredis and redis (node-redis) packages are the two main Node.js clients. Common patterns: cache-aside (check cache, fetch on miss, populate cache), session storage (connect-redis with express-session), and pub/sub for real-time features.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Redis Caching & Sessions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createClient } from 'redis';\n// Connect\nconst redis = createClient({ url: process.env.REDIS_URL });\nredis.on('error', (err) => console.error('Redis error:', err));\nawait redis.connect();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Redis Caching & Sessions — common patterns you'll see in production.\n// APPROACH  - Combine Redis Caching & Sessions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nawait redis.set('user:1:name', 'Alice');\nawait redis.set('session:abc', JSON.stringify({ userId: 1 }), {\n  EX: 3600,  // expire in 1 hour\n});\nconst name = await redis.get('user:1:name');       // 'Alice'\nconst session = JSON.parse(await redis.get('session:abc'));\nawait redis.del('user:1:name');\nconst exists = await redis.exists('user:1:name');  // 0\nasync function getUser(id) {\n  const cacheKey = `user:${id}`;\n  // Check cache first\n  const cached = await redis.get(cacheKey);\n  if (cached) return JSON.parse(cached);\n  // Cache miss — fetch from DB\n  const user = await prisma.user.findUnique({ where: { id } });\n  if (user) {\n    await redis.set(cacheKey, JSON.stringify(user), { EX: 300 }); // 5 min TTL\n  }\n  return user;\n}\n// Invalidate on update\nasync function updateUser(id, data) {\n  const user = await prisma.user.update({ where: { id }, data });\n  await redis.del(`user:${id}`);  // bust cache\n  return user;\n}\nimport session from 'express-session';\nimport RedisStore from 'connect-redis';\napp.use(session({\n  store: new RedisStore({ client: redis }),\n  secret: process.env.SESSION_SECRET,\n  resave: false,\n  saveUninitialized: false,\n  cookie: {\n    secure: process.env.NODE_ENV === 'production',\n    httpOnly: true,\n    maxAge: 24 * 60 * 60 * 1000,  // 24 hours\n    sameSite: 'lax',\n  },\n}));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Redis Caching & Sessions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nawait redis.hSet('user:1', { name: 'Alice', email: 'a@b.com', role: 'admin' });\nconst user = await redis.hGetAll('user:1');\n// { name: 'Alice', email: 'a@b.com', role: 'admin' }\nprocess.on('SIGTERM', async () => {\n  await redis.quit();\n  process.exit(0);\n});"
                  }
        ],
        tips: [
                  "Always set TTL (expiry) on cache keys — unbounded caches grow forever and cause OOM.",
                  "Use JSON.stringify/parse for objects — Redis stores strings. Consider msgpack for large payloads.",
                  "Cache invalidation on write: delete the cache key after updating the database, not before.",
                  "Use Redis MULTI/EXEC for atomic operations on multiple keys."
        ],
        mistake: "Caching without invalidation — stale data persists until TTL expires. Always delete/update cache keys when the underlying data changes. Write-through or cache-aside patterns prevent stale reads.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
    ],
  },
]

export default { meta, sections }
