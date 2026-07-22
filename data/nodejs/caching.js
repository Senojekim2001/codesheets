export const meta = {
  "title": "Caching",
  "domain": "nodejs",
  "sheet": "caching",
  "icon": "⚡"
}

export const sections = [

  // ── Section 1: In-Memory Caching — Map, LRU, request-scoped ─────────────────────────────────────────
  {
    id: "in-memory",
    title: "In-Memory Caching — Map, LRU, request-scoped",
    entries: [
      {
        id: "lru-cache",
        fn: "lru-cache — memoize with eviction",
        desc: "npm lru-cache provides a bounded LRU cache with TTL support. The standard choice for in-process caching in Node.js.",
        category: "In-Memory Caching",
        subtitle: "new LRUCache({ max, ttl }), get, set, purgeStale, allowStale",
        signature: "const cache = new LRUCache({ max: 1000, ttl: 60_000 }); cache.set(key, val); cache.get(key)",
        descLong: "lru-cache (v10+) is the de facto in-memory cache for Node.js. It provides O(1) get/set, max-size eviction (LRU), per-entry TTL, stale-while-revalidate semantics, and size calculation for byte-aware caching. Unlike a plain Map, it evicts the least-recently-used entries when full, preventing unbounded memory growth. Use it for memoizing expensive pure functions, API response caching, and as an L1 layer in front of Redis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - An expensive computeScore(userId, snapshotTs) is called\n//             repeatedly with the same args; cache it in-process.\n// APPROACH  - lru-cache with max=128 entries; first call computes,\n//             repeats hit the cache.\n// STRENGTHS - Zero deps beyond lru-cache; microsecond lookups; auto-eviction.\n// WEAKNESSES- Lost on process restart; not shared across instances.\n//\nimport { LRUCache } from 'lru-cache';\n\nconst scoreCache = new LRUCache({ max: 128 });\n\nfunction computeScore(userId, snapshotTs) {\n  return userId * snapshotTs;\n}\n\nfunction cachedScore(userId, snapshotTs) {\n  const key = `${userId}:${snapshotTs}`;\n  if (scoreCache.has(key)) return scoreCache.get(key);\n  const result = computeScore(userId, snapshotTs);\n  scoreCache.set(key, result);\n  return result;\n}\n\ncachedScore(42, 100);  // MISS -> computes\ncachedScore(42, 100);  // HIT  -> ~50ns\ncachedScore(43, 100);  // MISS -> different args\ncachedScore(42, 100);  // HIT"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Add TTL, track hit ratio, clear on demand, use sizeCalculation.\n// APPROACH  - ttl for auto-expiry; cache.has() for tracking; sizeCalculation\n//             for byte-aware memory budget.\n// STRENGTHS - TTL prevents stale data; hit ratio measurable; memory-bounded.\n// WEAKNESSES- TTL is per-entry — set on each .set() call.\n//\nimport { LRUCache } from 'lru-cache';\n\nconst cache = new LRUCache({\n  max: 10_000,\n  ttl: 60_000,\n  sizeCalculation: (v) => JSON.stringify(v).length,\n  maxSize: 50_000_000,\n});\n\nlet hits = 0, misses = 0;\n\nfunction cachedScore(userId, snapshotTs) {\n  const key = `${userId}:${snapshotTs}`;\n  if (cache.has(key)) { hits++; return cache.get(key); }\n  misses++;\n  const result = computeScore(userId, snapshotTs);\n  cache.set(key, result, { ttl: 30_000 });\n  return result;\n}\n\nconst hitRatio = hits / (hits + misses);\ncache.clear();\n\n// WARNING — non-serializable values store fine but callers can mutate them:\nconst objCache = new LRUCache({ max: 10 });\nconst shared = { count: 0 };\nobjCache.set('key', shared);\nobjCache.get('key').count++;  // mutates the cached object!"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Production-grade: async support, stale-while-revalidate,\n//             DataLoader for request-scoped batch+cache.\n// APPROACH  - lru-cache with allowStale + updateAgeOnGet for SWR;\n//             DataLoader for request-scoped batching + caching.\n// STRENGTHS - SWR hides latency; DataLoader dedupes concurrent requests.\n// WEAKNESSES- SWR serves stale data briefly — not for strict consistency.\n//\nimport { LRUCache } from 'lru-cache';\nimport DataLoader from 'dataloader';\n\nconst swrCache = new LRUCache({\n  max: 5000, ttl: 60_000, allowStale: true, updateAgeOnGet: true,\n});\n\nasync function cachedFetch(url) {\n  if (swrCache.has(url)) {\n    const cached = swrCache.get(url);\n    if (swrCache.ttlRemaining(url) < 10_000) {\n      fetch(url).then(r => r.json()).then(data => swrCache.set(url, data));\n    }\n    return cached;\n  }\n  const res = await fetch(url);\n  const data = await res.json();\n  swrCache.set(url, data);\n  return data;\n}\n\n// DataLoader — request-scoped batch + cache\nfunction createLoaders() {\n  return {\n    userLoader: new DataLoader(async (userIds) => {\n      const rows = await db.users.findMany({ where: { id: { in: userIds } } });\n      return userIds.map(id => rows.find(r => r.id === id) ?? null);\n    }, { cacheMap: new LRUCache({ max: 1000, ttl: 30_000 }) }),\n  };\n}"
                  }
        ],
        tips: [
                  "Use lru-cache over plain Map — Map grows unbounded and will OOM your process.",
                  "Set maxSize + sizeCalculation for byte-aware eviction, not just entry count.",
                  "allowStale + updateAgeOnGet gives stale-while-revalidate without extra deps.",
                  "DataLoader is request-scoped — create a new instance per request, not global."
        ],
        mistake: "Using a plain Map for caching without eviction — it grows forever and causes OOM kills in production. Always use lru-cache with a max or maxSize.",
        shorthand: {
          verbose: "import { LRUCache } from 'lru-cache';\nconst cache = new LRUCache({ max: 1000, ttl: 60_000 });\nif (cache.has(key)) return cache.get(key);\nconst val = await expensive(key);\ncache.set(key, val);\nreturn val;",
          concise: "const c = new LRUCache({ max: 1e3, ttl: 6e4 });\nreturn c.get(k) ?? c.set(k, await fn(k)).get(k);",
        },
      },
    ],
  },

  // ── Section 2: Redis — distributed cache, patterns, invalidation ─────────────────────────────────────────
  {
    id: "redis",
    title: "Redis — distributed cache, patterns, invalidation",
    entries: [
      {
        id: "ioredis-basics",
        fn: "ioredis — connect, get/set, pipelines, clustering",
        desc: "ioredis is the recommended Redis client for Node.js — supports pipelines, clustering, sentinel, and Lua scripting. Use it for distributed caches shared across multiple Node.js instances.",
        category: "Redis Caching",
        subtitle: "new Redis(), get/set, pipeline, mget/mset, EX/EXAT, clustering",
        signature: "const redis = new Redis('redis://localhost:6379'); await redis.set('key', 'val', 'EX', 60)",
        descLong: "ioredis provides a Promise-based API to Redis. Key features for caching: SET with EX (expire in seconds) or EXAT (expire at timestamp), pipeline for batching multiple commands in one round-trip, MGET/MSET for bulk operations, and cluster support for sharded Redis. Unlike node-redis, ioredis auto-reconnects with exponential backoff and supports transparent cluster slot routing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Cache an API response in Redis with a 60s TTL.\n// APPROACH  - ioredis set with EX flag; JSON.stringify for objects.\n// STRENGTHS - Shared across instances; survives restarts; atomic operations.\n// WEAKNESSES- Network round-trip (~0.5ms); serialization overhead.\n//\nimport Redis from 'ioredis';\n\nconst redis = new Redis('redis://localhost:6379');\n\nawait redis.set('user:42', JSON.stringify({ name: 'Alice' }), 'EX', 60);\n\nconst raw = await redis.get('user:42');\nconst user = raw ? JSON.parse(raw) : null;\n\nawait redis.del('user:42');\n\nconst ttl = await redis.ttl('user:42');  // seconds remaining, -2 if expired"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Batch operations with pipeline; MGET for bulk reads;\n//             handle connection errors gracefully.\n// APPROACH  - pipeline() for atomic multi-command; MGET for parallel reads;\n//             auto-reconnect with exponential backoff.\n// STRENGTHS - Pipeline reduces round-trips; MGET is O(n) not O(n×RTT).\n// WEAKNESSES- Pipeline is not transactional — use MULTI for atomicity.\n//\nimport Redis from 'ioredis';\n\nconst redis = new Redis({\n  host: 'localhost', port: 6379,\n  retryStrategy(times) { return Math.min(times * 100, 2000); },\n});\n\n// Pipeline — batch commands, single round-trip\nconst results = await redis.pipeline()\n  .set('a', '1', 'EX', 60)\n  .set('b', '2', 'EX', 60)\n  .set('c', '3', 'EX', 60)\n  .exec();\n\n// MGET — bulk read\nconst [a, b, c] = await redis.mget('a', 'b', 'c');\n\n// SET NX — only if not exists (useful for locks)\nconst acquired = await redis.set('lock:job:1', 'worker-1', 'EX', 30, 'NX');\n\n// INCR — atomic counter (rate limiting)\nawait redis.incr('rate:api:192.168.1.1');\n\n// Scan with pattern (don't use KEYS in production!)\nlet cursor = '0';\nconst keys = [];\ndo {\n  [cursor, keys] = await redis.scan(cursor, 'MATCH', 'user:*', 'COUNT', 100);\n} while (cursor !== '0');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Redis cluster with sharding; Lua scripts for atomic\n//             check-and-set; pub/sub for cache invalidation.\n// APPROACH  - Redis.Cluster for horizontal scaling; EVAL for atomic ops;\n//             separate subscriber connection for pub/sub.\n// STRENGTHS - Cluster scales horizontally; Lua is atomic; pub/sub for invalidation.\n// WEAKNESSES- Cluster has no cross-slot multi-key ops; Lua blocks Redis.\n//\nimport Redis from 'ioredis';\n\nconst cluster = new Redis.Cluster([\n  { host: 'redis-1.local', port: 6379 },\n  { host: 'redis-2.local', port: 6379 },\n  { host: 'redis-3.local', port: 6379 },\n], { scaleReads: 'slave' });\n\n// Lua script — atomic compare-and-swap\nconst CAS_SCRIPT = `\n  local current = redis.call('GET', KEYS[1])\n  if current == ARGV[1] then\n    redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])\n    return 1\n  end\n  return 0\n`;\n\nconst updated = await cluster.eval(\n  CAS_SCRIPT, 1, 'user:42',\n  JSON.stringify(oldVal), JSON.stringify(newVal), '60'\n);\n\n// Pub/sub for cache invalidation across instances\nconst subscriber = new Redis('redis://localhost:6379');\nsubscriber.subscribe('cache:invalidate');\nsubscriber.on('message', (channel, message) => {\n  const { key } = JSON.parse(message);\n  localCache.delete(key);\n});\n\nawait redis.publish('cache:invalidate', JSON.stringify({ key: 'user:42' }));"
                  }
        ],
        tips: [
                  "Always set EX or EXAT on cached keys — unbounded keys cause OOM.",
                  "Use SCAN instead of KEYS in production — KEYS blocks Redis.",
                  "Pipeline batches commands but is NOT atomic — use MULTI/EVAL for transactions.",
                  "Separate pub/sub connection from command connection — ioredis blocks during subscriptions."
        ],
        mistake: "Using KEYS pattern in production — it scans the entire keyspace and blocks Redis. Always use SCAN with COUNT batches.",
        shorthand: {
          verbose: "import Redis from 'ioredis';\nconst r = new Redis('redis://localhost:6379');\nawait r.set('key', JSON.stringify(val), 'EX', 60);\nconst cached = await r.get('key');",
          concise: "const r = new Redis();\nawait r.set(k, JSON.stringify(v), 'EX', 60);\nJSON.parse(await r.get(k));",
        },
      },
      {
        id: "cache-aside",
        fn: "Cache-aside — read-through with fallback to source",
        desc: "The cache-aside pattern: check cache first, on miss fetch from source and populate cache. The most common caching pattern in Node.js APIs.",
        category: "Cache Patterns",
        subtitle: "cache-aside, read-through, write-through, write-behind, refresh-ahead",
        signature: "const val = await cache.get(key) ?? await fetchAndCache(key)",
        descLong: "Cache-aside (aka lazy loading) puts the application in charge of cache reads and writes. On a cache hit, return immediately. On a miss, fetch from the database/API, write to cache, then return. Variants: write-through (write to cache + DB simultaneously), write-behind (write to cache, async write to DB), refresh-ahead (proactively refresh before expiry). Cache-aside is simple but vulnerable to stampede — guard with single-flight or request coalescing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Cache user lookups: check Redis first, fall back to DB.\n// APPROACH  - cache-aside: get -> miss -> fetch -> set -> return.\n// STRENGTHS - Simple; cache only holds what's requested; resilient to cache failure.\n// WEAKNESSES- First request always misses; stale data until TTL expires.\n//\nimport Redis from 'ioredis';\nconst redis = new Redis();\n\nasync function getUser(id) {\n  const key = `user:${id}`;\n  const cached = await redis.get(key);\n  if (cached) return JSON.parse(cached);\n\n  const user = await db.users.findById(id);\n  if (user) {\n    await redis.set(key, JSON.stringify(user), 'EX', 300);\n  }\n  return user;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Add negative caching, error fallback, and TTL jitter.\n// APPROACH  - Cache null for 30s (prevents thundering herd on missing keys);\n//             jitter TTL ±10% to avoid mass expiry; return stale on DB error.\n// STRENGTHS - Negative caching absorbs lookups for non-existent keys;\n//             jitter prevents cache stampede from synchronized expiry.\n// WEAKNESSES- Negative caching delays detection of newly created records.\n//\nimport Redis from 'ioredis';\nconst redis = new Redis();\n\nasync function getUser(id) {\n  const key = `user:${id}`;\n  const cached = await redis.get(key);\n  if (cached !== null) {\n    const val = JSON.parse(cached);\n    return val.__null ? null : val;\n  }\n\n  try {\n    const user = await db.users.findById(id);\n    const ttl = 300 + Math.floor(Math.random() * 30);\n    if (user) {\n      await redis.set(key, JSON.stringify(user), 'EX', ttl);\n    } else {\n      await redis.set(key, JSON.stringify({ __null: true }), 'EX', 30);\n    }\n    return user;\n  } catch (err) {\n    console.error('DB error, serving stale:', err);\n    throw err;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - L1+L2 multi-tier with stampede protection and write-through.\n// APPROACH  - L1 (lru-cache) + L2 (Redis); SET NX lock for stampede;\n//             write-through on updates (invalidate L1, update L2 + DB).\n// STRENGTHS - L1 absorbs hot-key reads (zero network); stampede lock\n//             prevents N parallel DB hits for same key.\n// WEAKNESSES- L1 is per-instance — each instance may have different data\n//             briefly; use pub/sub invalidation to sync.\n//\nimport { LRUCache } from 'lru-cache';\nimport Redis from 'ioredis';\n\nconst l1 = new LRUCache({ max: 1000, ttl: 30_000 });\nconst l2 = new Redis();\n\nasync function getUser(id) {\n  const key = `user:${id}`;\n  if (l1.has(key)) return l1.get(key);\n\n  const cached = await l2.get(key);\n  if (cached) {\n    const val = JSON.parse(cached);\n    l1.set(key, val);\n    return val;\n  }\n\n  // Stampede protection\n  const lockKey = `lock:${key}`;\n  const acquired = await l2.set(lockKey, '1', 'EX', 10, 'NX');\n  if (!acquired) {\n    await new Promise(r => setTimeout(r, 100));\n    return getUser(id);\n  }\n\n  try {\n    const user = await db.users.findById(id);\n    if (user) {\n      const ttl = 300 + Math.floor(Math.random() * 30);\n      await l2.set(key, JSON.stringify(user), 'EX', ttl);\n      l1.set(key, user);\n    }\n    return user;\n  } finally {\n    await l2.del(lockKey);\n  }\n}\n\nasync function updateUser(id, data) {\n  const user = await db.users.update(id, data);\n  const key = `user:${id}`;\n  l1.delete(key);\n  await l2.del(key);\n  await l2.publish('cache:invalidate', JSON.stringify({ key }));\n  return user;\n}"
                  }
        ],
        tips: [
                  "Always use TTL jitter (±10%) to prevent synchronized cache expiry causing stampedes.",
                  "Cache negative results (null) with a short TTL to prevent repeated DB lookups for missing keys.",
                  "Use SET NX as a cheap lock for stampede protection — no extra dependency needed.",
                  "Write-through is simplest for consistency; write-behind is faster but risks data loss on crash."
        ],
        mistake: "Forgetting to invalidate cache after writes — users see stale data until TTL expires. Always delete or update cache in the same code path as the DB write.",
        shorthand: {
          verbose: "const cached = await redis.get(key);\nif (cached) return JSON.parse(cached);\nconst val = await db.find(id);\nawait redis.set(key, JSON.stringify(val), 'EX', 300);\nreturn val;",
          concise: "return JSON.parse(await redis.get(key)) ?? await redis.set(key, JSON.stringify(await db.find(id)), 'EX', 300).then(() => db.find(id));",
        },
      },
      {
        id: "cache-invalidation",
        fn: "Cache invalidation — delete, version, tag, pub/sub",
        desc: "Strategies for keeping cached data fresh: TTL expiry, explicit delete, versioned keys, tag-based bulk invalidation, and pub/sub fanout across instances.",
        category: "Cache Patterns",
        subtitle: "redis.del, key versioning, tag-based invalidation, pub/sub fanout, cache flush",
        signature: "await redis.del('user:42')  |  await redis.srem('tag:users', 'user:42')",
        descLong: "Cache invalidation is the hard part of caching. Strategies: (1) TTL — let entries expire naturally; (2) Explicit delete — call del() after writes; (3) Versioned keys — include a version number in the key and bump version on writes; (4) Tag-based — maintain a set of keys per tag and delete all keys in a tag; (5) Pub/sub — broadcast invalidation to all instances to clear L1 caches.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Invalidate a user's cache after updating their profile.\n// APPROACH  - Explicit redis.del() on the specific key.\n// STRENGTHS - Simple; precise; immediate.\n// WEAKNESSES- Must know all affected keys; easy to miss related caches.\n//\nimport Redis from 'ioredis';\nconst redis = new Redis();\n\nasync function updateUser(id, data) {\n  await db.users.update(id, data);\n  await redis.del(`user:${id}`);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Invalidate all caches related to a user (profile, posts, feed).\n// APPROACH  - Tag-based: maintain a Redis SET of keys per tag; delete all\n//             keys in the tag set on invalidation.\n// STRENGTHS - Bulk invalidation by domain; don't need to track individual keys.\n// WEAKNESSES- Extra SADD/SREM on every cache.set; tag set grows.\n//\nimport Redis from 'ioredis';\nconst redis = new Redis();\n\nasync function cacheWithTag(tag, key, value, ttl = 300) {\n  const pipeline = redis.pipeline();\n  pipeline.set(key, JSON.stringify(value), 'EX', ttl);\n  pipeline.sadd(`tag:${tag}`, key);\n  pipeline.expire(`tag:${tag}`, ttl + 60);\n  await pipeline.exec();\n}\n\nasync function invalidateTag(tag) {\n  const keys = await redis.smembers(`tag:${tag}`);\n  if (keys.length === 0) return;\n  const pipeline = redis.pipeline();\n  keys.forEach(k => pipeline.del(k));\n  pipeline.del(`tag:${tag}`);\n  await pipeline.exec();\n}\n\nawait cacheWithTag('user:42', 'user:42:profile', profile);\nawait cacheWithTag('user:42', 'user:42:posts', posts);\nawait invalidateTag('user:42');  // deletes all keys"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Cross-instance L1 invalidation via pub/sub; versioned keys\n//             for zero-downtime deploys; event-driven invalidation.\n// APPROACH  - Pub/sub fanout to clear L1 on all instances; key versioning\n//             via a Redis counter bumped on writes.\n// STRENGTHS - L1 stays coherent; versioned keys make deploys instant.\n// WEAKNESSES- Pub/sub is fire-and-forget (no delivery guarantee).\n//\nimport Redis from 'ioredis';\nimport { LRUCache } from 'lru-cache';\n\nconst l1 = new LRUCache({ max: 5000, ttl: 30_000 });\nconst redis = new Redis();\nconst subscriber = new Redis();\n\nsubscriber.subscribe('cache:invalidate');\nsubscriber.on('message', (channel, msg) => {\n  const { keys, tags } = JSON.parse(msg);\n  (keys || []).forEach(k => l1.delete(k));\n  if (tags) {\n    for (const tag of tags) {\n      for (const k of l1.keys()) {\n        if (k.includes(tag)) l1.delete(k);\n      }\n    }\n  }\n});\n\nasync function bumpVersion(namespace) {\n  await redis.incr(`version:${namespace}`);\n  await redis.publish('cache:invalidate', JSON.stringify({\n    tags: [namespace],\n  }));\n}\n\n// On deploy: bump all versions — old cache keys become unreachable\n// and expire via TTL. New requests populate fresh cache.\n// await bumpVersion('user');"
                  }
        ],
        tips: [
                  "Versioned keys (user:42:v3) make deploys instant — old keys expire naturally, no flush needed.",
                  "Pub/sub invalidation is fire-and-forget — if an instance is down, it misses the event. Use TTL as a safety net.",
                  "Tag-based invalidation is powerful but adds overhead to every cache.set — use only for complex invalidation graphs.",
                  "MongoDB change streams or Postgres LISTEN/NOTIFY can drive event-based invalidation automatically."
        ],
        mistake: "Relying solely on pub/sub for invalidation without a TTL safety net — if a subscriber is temporarily disconnected, it serves stale data forever. Always pair pub/sub with TTL.",
        shorthand: {
          verbose: "// Manual invalidation — delete each key, then notify subscribers\nconst key = `user:${id}`;\nawait redis.del(key);\nawait redis.publish('cache:invalidate', JSON.stringify({ keys: [key] }));\n// Subscribers must listen and delete their local L1 cache",
          concise: "redis.del(k); redis.publish('cache:invalidate', JSON.stringify({ keys: [k] }));",
        },
      },
    ],
  },

  // ── Section 3: HTTP & CDN Caching — headers, edge, Service Worker ─────────────────────────────────────────
  {
    id: "http-cdn",
    title: "HTTP & CDN Caching — headers, edge, Service Worker",
    entries: [
      {
        id: "http-cache-headers",
        fn: "HTTP cache headers — Cache-Control, ETag, conditional GETs",
        desc: "Control browser and CDN caching with HTTP headers. Cache-Control directives, ETag/If-None-Match, and Last-Modified/If-Modified-Since enable efficient revalidation.",
        category: "HTTP Caching",
        subtitle: "Cache-Control, ETag, If-None-Match, Last-Modified, stale-while-revalidate, s-maxage",
        signature: "res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400')",
        descLong: "HTTP caching headers control how browsers, CDNs, and proxies cache responses. Cache-Control directives: max-age (browser cache seconds), s-maxage (CDN/shared cache seconds), public/private, no-cache (revalidate every time), no-store (never cache), stale-while-revalidate (serve stale while fetching fresh). ETag provides content-based revalidation — if the ETag matches, return 304 Not Modified.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Set cache headers on an Express API response.\n// APPROACH  - Cache-Control with max-age for browser; ETag for revalidation.\n// STRENGTHS - Browser caches reduce repeat requests; ETag enables 304s.\n// WEAKNESSES- No CDN directive yet; no stale-while-revalidate.\n//\nimport express from 'express';\nconst app = express();\n\napp.get('/api/users/:id', async (req, res) => {\n  const user = await db.users.findById(req.params.id);\n  res.setHeader('Cache-Control', 'public, max-age=300');\n  res.json(user);\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Differentiate browser TTL vs CDN TTL; add SWR; manual ETag.\n// APPROACH  - s-maxage for CDN, max-age for browser; stale-while-revalidate\n//             for instant response while refreshing in background.\n// STRENGTHS - CDN serves fresh for longer; browser gets instant stale-then-fresh.\n// WEAKNESSES- stale-while-revalidate support varies by CDN/browser.\n//\nimport express from 'express';\nimport crypto from 'crypto';\nconst app = express();\n\n// Static assets — long CDN cache, immutable\napp.use('/static', express.static('public', {\n  maxAge: '1y', immutable: true,\n  setHeaders(res) {\n    res.setHeader('Cache-Control',\n      'public, max-age=31536000, s-maxage=31536000, immutable');\n  },\n}));\n\n// API responses — short browser, longer CDN, SWR\napp.get('/api/products', async (req, res) => {\n  const products = await db.products.findAll();\n  res.setHeader('Cache-Control',\n    'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');\n  res.json(products);\n});\n\n// Manual ETag for dynamic content\napp.get('/api/feed/:userId', async (req, res) => {\n  const feed = await buildFeed(req.params.userId);\n  const etag = `\"${crypto.createHash('sha1').update(JSON.stringify(feed)).digest('hex')}\"`;\n  if (req.headers['if-none-match'] === etag) {\n    return res.status(304).end();\n  }\n  res.setHeader('ETag', etag);\n  res.setHeader('Cache-Control', 'private, max-age=30, stale-while-revalidate=600');\n  res.json(feed);\n});\n\n// No-cache for authenticated endpoints\napp.get('/api/me', authMiddleware, (req, res) => {\n  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');\n  res.json(req.user);\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Surrogate keys for CDN bulk invalidation; Vary header;\n//             structured cache policy per resource type.\n// APPROACH  - Surrogate-Keys header (Fastly/Cloudflare) for tag-based CDN\n//             invalidation; Vary to prevent cache poisoning.\n// STRENGTHS - Surrogate keys enable precise CDN purges; Vary prevents\n//             serving wrong content variant; structured policy is auditable.\n// WEAKNESSES- Surrogate-Keys are CDN-specific; Vary increases cache key cardinality.\n//\nimport express from 'express';\nimport crypto from 'crypto';\nconst app = express();\n\nconst cachePolicy = {\n  static:  'public, max-age=31536000, s-maxage=31536000, immutable',\n  apiList: 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',\n  apiItem: 'public, max-age=120, s-maxage=600, stale-while-revalidate=3600',\n  auth:    'no-cache, no-store, must-revalidate',\n};\n\napp.get('/api/products/:id', async (req, res) => {\n  const product = await db.products.findById(req.params.id);\n  const etag = `W/\"${crypto.createHash('sha1').update(JSON.stringify(product)).digest('hex').slice(0, 16)}\"`;\n\n  if (req.headers['if-none-match'] === etag) {\n    res.setHeader('Cache-Control', cachePolicy.apiItem);\n    return res.status(304).end();\n  }\n\n  res.setHeader('Surrogate-Key', `products product:${req.params.id}`);\n  res.setHeader('Surrogate-Control', 'max-age=600, stale-while-revalidate=3600');\n  res.setHeader('Cache-Control', cachePolicy.apiItem);\n  res.setHeader('ETag', etag);\n  res.setHeader('Vary', 'Accept-Encoding');\n  res.json(product);\n});"
                  }
        ],
        tips: [
                  "Use s-maxage for CDN TTL and max-age for browser TTL — they can differ.",
                  "stale-while-revalidate gives instant responses while refreshing — great for APIs.",
                  "Always set Vary: Accept-Encoding to prevent serving gzipped content to non-gzip clients.",
                  "Use no-store (not no-cache) for sensitive data — no-cache still stores, it just revalidates."
        ],
        mistake: "Using no-cache when you mean no-store — no-cache allows storage but forces revalidation; no-store prevents storage entirely. For auth tokens and PII, use no-store.",
        shorthand: {
          verbose: "// Manual cache headers — set each one individually\nres.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');\nres.setHeader('ETag', `\"${hash}\"`);\nres.setHeader('Vary', 'Accept-Encoding');",
          concise: "res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');",
        },
      },
      {
        id: "service-worker-cache",
        fn: "Service Worker Cache API — browser-side caching",
        desc: "The Cache API (available in Service Workers and browser contexts) provides a programmatic key-value store for Response objects. Enables offline-first PWAs and fine-grained runtime caching.",
        category: "HTTP Caching",
        subtitle: "caches.open, cache.match, cache.put, cache.delete, Workbox strategies",
        signature: "const cache = await caches.open('api-v1'); await cache.put(request, response.clone())",
        descLong: "The Cache API is a browser-native storage for HTTP Response objects, accessible from Service Workers and window context. Unlike HTTP cache headers (which are declarative), the Cache API is imperative. Strategies: cache-first, network-first, stale-while-revalidate, cache-only, network-only. Use Workbox for production-grade caching strategies without boilerplate.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Cache API responses in a Service Worker for offline access.\n// APPROACH  - cache-first strategy: check cache, fall back to network.\n// STRENGTHS - Works offline; instant responses from cache.\n// WEAKNESSES- May serve stale data; cache can grow unbounded.\n//\n// sw.js (Service Worker)\nconst CACHE = 'api-v1';\n\nself.addEventListener('fetch', (event) => {\n  if (!event.request.url.includes('/api/')) return;\n\n  event.respondWith(\n    caches.open(CACHE).then(async (cache) => {\n      const cached = await cache.match(event.request);\n      if (cached) return cached;\n\n      const response = await fetch(event.request);\n      cache.put(event.request, response.clone());\n      return response;\n    })\n  );\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Implement stale-while-revalidate in a Service Worker;\n//             clean up old caches on activate.\n// APPROACH  - Serve cached response immediately, fetch fresh in background;\n//             delete old cache versions on activate event.\n// STRENGTHS - Instant response + fresh data on next visit; clean cache lifecycle.\n// WEAKNESSES- First visit is still a network miss; background fetch uses bandwidth.\n//\nconst CACHE = 'app-v2';\n\nself.addEventListener('fetch', (event) => {\n  if (event.request.method !== 'GET') return;\n\n  event.respondWith(async () => {\n    const cache = await caches.open(CACHE);\n    const cached = await cache.match(event.request);\n\n    const networkFetch = fetch(event.request).then((response) => {\n      if (response.ok) cache.put(event.request, response.clone());\n      return response;\n    });\n\n    if (cached) {\n      event.waitUntil(networkFetch);\n      return cached;\n    }\n    return networkFetch;\n  })();\n});\n\nself.addEventListener('activate', (event) => {\n  event.waitUntil(\n    caches.keys().then((keys) =>\n      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))\n    )\n  );\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Use Workbox for production caching strategies; route-based\n//             caching; background sync for failed requests.\n// APPROACH  - workbox-routing + workbox-strategies for declarative caching;\n//             different strategies per route type; background sync queue.\n// STRENGTHS - Battle-tested; configurable; handles edge cases.\n// WEAKNESSES- Adds ~50KB to SW bundle; abstraction hides debugging.\n//\nimport { registerRoute } from 'workbox-routing';\nimport { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';\nimport { ExpirationPlugin } from 'workbox-expiration';\nimport { CacheableResponsePlugin } from 'workbox-cacheable-response';\nimport { BackgroundSyncPlugin } from 'workbox-background-sync';\n\n// Static assets — cache-first, long expiry\nregisterRoute(\n  ({ request }) => ['style', 'script', 'image'].includes(request.destination),\n  new CacheFirst({\n    cacheName: 'static-assets',\n    plugins: [\n      new CacheableResponsePlugin({ statuses: [200] }),\n      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),\n    ],\n  })\n);\n\n// API GETs — stale-while-revalidate\nregisterRoute(\n  ({ url }) => url.pathname.startsWith('/api/'),\n  new StaleWhileRevalidate({\n    cacheName: 'api-cache',\n    plugins: [\n      new CacheableResponsePlugin({ statuses: [200] }),\n      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }),\n    ],\n  })\n);\n\n// Navigation (HTML) — network-first, fall back to cache for offline\nregisterRoute(\n  ({ request }) => request.mode === 'navigate',\n  new NetworkFirst({\n    cacheName: 'pages',\n    plugins: [\n      new CacheableResponsePlugin({ statuses: [200] }),\n      new ExpirationPlugin({ maxEntries: 10 }),\n    ],\n  })\n);\n\n// Background sync — retry failed POSTs when connection restored\nconst bgSync = new BackgroundSyncPlugin('apiQueue', { maxRetentionTime: 24 * 60 });\nregisterRoute(\n  ({ url, request }) => url.pathname.startsWith('/api/') && request.method === 'POST',\n  new NetworkOnly({ plugins: [bgSync] }),\n  'POST'\n);"
                  }
        ],
        tips: [
                  "Always cache response.clone() — the original response can only be consumed once.",
                  "Use caches.keys() on activate to clean up old cache versions from previous deploys.",
                  "Opaque responses (cross-origin without CORS) have status 0 — use CacheableResponsePlugin.",
                  "Workbox is the production standard — don't hand-roll SW caching for real apps."
        ],
        mistake: "Forgetting to clone the response before caching — cache.put() consumes the response body, leaving nothing to return to the client. Always use response.clone().",
        shorthand: {
          verbose: "const cache = await caches.open('api-v1');\nconst cached = await cache.match(request);\nif (cached) return cached;\nconst res = await fetch(request);\ncache.put(request, res.clone());\nreturn res;",
          concise: "const c = await caches.open('v1'); return c.match(r) || fetch(r).then(res => (c.put(r, res.clone()), res));",
        },
      },
    ],
  },

  // ── Section 4: Cache Patterns — stampede, keys, warmup, multi-tier ─────────────────────────────────────────
  {
    id: "patterns",
    title: "Cache Patterns — stampede, keys, warmup, multi-tier",
    entries: [
      {
        id: "cache-stampede",
        fn: "Cache stampede — single-flight, request coalescing",
        desc: "When a popular cache key expires, N concurrent requests all miss and hit the database simultaneously. Prevent this with single-flight or probabilistic early expiration.",
        category: "Cache Patterns",
        subtitle: "single-flight, SET NX lock, probabilistic early expiration, request coalescing",
        signature: "const lock = await redis.set('lock:key', '1', 'EX', 10, 'NX')",
        descLong: "Cache stampede (aka thundering herd) occurs when a cached value expires and multiple concurrent requests simultaneously attempt to fetch from the source. Solutions: (1) Single-flight — use SET NX as a lock; only the lock holder fetches, others poll the cache. (2) Request coalescing — use a Promise dedupe map in-process. (3) Probabilistic early expiration (XFETCH) — randomly refresh slightly before TTL expires, distributing the load.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Prevent N concurrent requests from all hitting the DB.\n// APPROACH  - In-process Promise dedupe: first request starts the fetch,\n//             subsequent callers await the same Promise.\n// STRENGTHS - Zero deps; simple; effective within a single process.\n// WEAKNESSES- Only works within one Node.js process.\n//\nconst inflight = new Map();\n\nasync function cachedFetch(key, fetchFn, ttl = 300) {\n  const cached = await redis.get(key);\n  if (cached) return JSON.parse(cached);\n\n  if (inflight.has(key)) return inflight.get(key);\n\n  const promise = fetchFn().then(async (val) => {\n    await redis.set(key, JSON.stringify(val), 'EX', ttl);\n    inflight.delete(key);\n    return val;\n  });\n  inflight.set(key, promise);\n  return promise;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Cross-instance stampede protection using Redis SET NX lock.\n// APPROACH  - Only one instance acquires the lock and fetches; others\n//             poll the cache with backoff.\n// STRENGTHS - Works across instances; lock auto-expires (no deadlock).\n// WEAKNESSES- Polling adds latency for waiters; lock holder crash = wait TTL.\n//\nimport Redis from 'ioredis';\nconst redis = new Redis();\n\nasync function cachedWithLock(key, fetchFn, ttl = 300, lockTtl = 10) {\n  const cached = await redis.get(key);\n  if (cached) return JSON.parse(cached);\n\n  const lockKey = `lock:${key}`;\n  const acquired = await redis.set(lockKey, process.pid, 'EX', lockTtl, 'NX');\n\n  if (acquired) {\n    try {\n      const val = await fetchFn();\n      await redis.set(key, JSON.stringify(val), 'EX', ttl);\n      return val;\n    } finally {\n      const lockVal = await redis.get(lockKey);\n      if (lockVal === String(process.pid)) await redis.del(lockKey);\n    }\n  }\n\n  // Poll with backoff\n  for (let i = 0; i < 10; i++) {\n    await new Promise(r => setTimeout(r, 50 * (i + 1)));\n    const cached = await redis.get(key);\n    if (cached) return JSON.parse(cached);\n  }\n\n  // Fallback — lock holder may have crashed\n  const val = await fetchFn();\n  await redis.set(key, JSON.stringify(val), 'EX', ttl);\n  return val;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Probabilistic early expiration (XFETCH algorithm) — distribute\n//             refresh load by randomly refreshing before TTL expires.\n// APPROACH  - Each request computes a probability of early refresh based on\n//             remaining TTL and a beta distribution.\n// STRENGTHS - No locks; no polling; distributes load smoothly.\n// WEAKNESSES- Requires tracking fetch time vs TTL; beta parameter tuning.\n//\nimport Redis from 'ioredis';\nconst redis = new Redis();\n\nasync function xfetch(key, fetchFn, ttl, beta = 1) {\n  const cached = await redis.get(key);\n  if (!cached) return fetchAndCache(key, fetchFn, ttl);\n\n  const { value, delta, expiry } = JSON.parse(cached);\n  const now = Date.now();\n\n  // XFETCH: P(refresh) = 1 - exp(-(now - expiry) * beta / delta)\n  if (now > expiry - delta * beta * Math.log(Math.random())) {\n    fetchAndCache(key, fetchFn, ttl).catch(console.error);\n  }\n\n  return value;\n\n  async function fetchAndCache(key, fn, ttl) {\n    const start = Date.now();\n    const val = await fn();\n    const delta = Date.now() - start;\n    const expiry = Date.now() + ttl * 1000;\n    await redis.set(key, JSON.stringify({ value: val, delta, expiry }), 'EX', ttl);\n    return val;\n  }\n}"
                  }
        ],
        tips: [
                  "In-process Promise dedupe is the cheapest stampede protection — always use it as a first layer.",
                  "SET NX lock TTL should be slightly longer than the expected fetch time.",
                  "XFETCH (probabilistic early expiration) is elegant but requires storing fetch duration.",
                  "Combine layers: in-process dedupe > Redis lock > XFETCH > plain cache-aside."
        ],
        mistake: "Using a lock without a TTL — if the lock holder crashes, the key is locked forever and all requests fall back to direct DB hits. Always use SET NX with EX.",
        shorthand: {
          verbose: "// Stampede protection — single-flight with Redis SETNX lock\nconst lock = await redis.set(`lock:${key}`, '1', 'EX', 10, 'NX');\nif (lock) {\n  const v = await fetch();\n  await redis.set(key, JSON.stringify(v), 'EX', 300);\n} else {\n  await new Promise(r => setTimeout(r, 100));\n  return JSON.parse(await redis.get(key));\n}",
          concise: "if (await redis.set('lock:'+k,'1','EX',10,'NX')) redis.set(k,JSON.stringify(await fn()),'EX',300);",
        },
      },
      {
        id: "cache-key-design",
        fn: "Cache key design — namespace, version, tenant, hash",
        desc: "Good cache keys are deterministic, namespaced, and include version/tenant isolation. Bad keys cause collisions, cross-tenant data leaks, and debugging nightmares.",
        category: "Cache Patterns",
        subtitle: "namespace:entity:id:version, tenant isolation, hash long keys, avoid special chars",
        signature: "const key = `v2:user:${tenantId}:${userId}:${fieldsHash}`",
        descLong: "Cache key design is critical: keys must be deterministic (same inputs → same key), namespaced (avoid collisions between features), versioned (bump on schema changes), tenant-isolated (prevent cross-tenant data leaks in multi-tenant apps), and reasonably short. Use a consistent delimiter (colon is conventional). Hash complex parameters with a short hash. Avoid spaces, newlines, and special characters.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Build a cache key for a user lookup.\n// APPROACH  - namespace:entity:id pattern with version prefix.\n// STRENGTHS - Readable in Redis CLI; deterministic; no collisions.\n// WEAKNESSES- No tenant isolation; no parameter hashing.\n//\nfunction userKey(userId) {\n  return `v1:user:${userId}`;\n}\n\n// v1:user:42\nawait redis.set(userKey(42), JSON.stringify(user), 'EX', 300);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Cache a filtered, paginated query with tenant isolation.\n// APPROACH  - namespace:tenant:entity:id:paramsHash; hash complex params.\n// STRENGTHS - Tenant isolation; parameterized queries cached separately.\n// WEAKNESSES- Hash obscures the params in Redis CLI — log the mapping.\n//\nimport { createHash } from 'crypto';\n\nfunction queryKey(tenantId, entity, params) {\n  const paramHash = createHash('sha1')\n    .update(JSON.stringify(params))\n    .digest('hex')\n    .slice(0, 12);\n  return `v2:${tenantId}:${entity}:${paramHash}`;\n}\n\n// v2:acme:products:a1b2c3d4e5f6\nconst key = queryKey('acme', 'products', {\n  filter: { category: 'electronics', price: { gte: 100 } },\n  sort: { price: 'asc' },\n  page: 1, limit: 20,\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Key builder utility with schema versioning, automatic\n//             tenant scoping, and key length limits.\n// APPROACH  - Class-based key builder with fluent API; auto-prefix\n//             version and tenant; truncate long keys with hash suffix.\n// STRENGTHS - Consistent across codebase; impossible to forget version/tenant;\n//             keys stay under Redis memory limits.\n// WEAKNESSES- Abstraction overhead; debugging requires the builder.\n//\nimport { createHash } from 'crypto';\n\nclass CacheKeyBuilder {\n  constructor(version = 'v1', maxLen = 250) {\n    this.parts = [version];\n    this.maxLen = maxLen;\n  }\n\n  tenant(id) { this.parts.push(`t:${id}`); return this; }\n  ns(name) { this.parts.push(name); return this; }\n  id(val) { this.parts.push(String(val)); return this; }\n\n  params(obj) {\n    const hash = createHash('sha1')\n      .update(JSON.stringify(obj))\n      .digest('hex').slice(0, 16);\n    this.parts.push(`p:${hash}`);\n    return this;\n  }\n\n  build() {\n    let key = this.parts.join(':');\n    if (key.length > this.maxLen) {\n      const hash = createHash('sha1').update(key).digest('hex').slice(0, 16);\n      key = key.slice(0, this.maxLen - 20) + ':h:' + hash;\n    }\n    return key;\n  }\n}\n\n// v2:t:acme:products:42:p:a1b2c3d4e5f6a1b2\nconst key = new CacheKeyBuilder('v2')\n  .tenant('acme')\n  .ns('products')\n  .id(42)\n  .params({ fields: ['name', 'price'], expand: 'category' })\n  .build();"
                  }
        ],
        tips: [
                  "Always include a version prefix (v1, v2) — bump on schema changes to invalidate all old keys.",
                  "Use colon (:) as delimiter — it's the Redis convention and shows up nicely in CLI tools.",
                  "Hash complex params (filters, sort objects) — don't put raw JSON in keys.",
                  "For multi-tenant apps, always include tenantId in the key — a missing tenant prefix is a data leak."
        ],
        mistake: "Using unstructured keys like JSON.stringify(params) — contains special characters, varies in length, and is not human-readable in Redis CLI. Use a structured key builder instead.",
        shorthand: {
          verbose: "// Structured key with version, entity, tenant, and ID\nconst key = `v2:user:${tenantId}:${userId}`;\nawait redis.set(key, JSON.stringify(val), 'EX', 300);\n// Version prefix allows schema migrations without stale reads",
          concise: "redis.set(`v2:u:${t}:${id}`, JSON.stringify(v), 'EX', 300);",
        },
      },
      {
        id: "cache-warmup",
        fn: "Cache warmup — pre-populate after deploy / restart",
        desc: "Pre-populate the cache with hot keys before serving traffic. Eliminates the cold-start penalty where every request misses after a deploy or restart.",
        category: "Cache Patterns",
        subtitle: "pre-populate, hot keys, deploy hook, graceful reload, staggered warmup",
        signature: "await Promise.all(hotKeys.map(k => cache.set(k, await fetch(k))))",
        descLong: "Cache warmup runs after a deploy or process restart to pre-fill the cache with known hot keys before traffic arrives. Strategies: (1) Warmup script — run after deploy, before health check passes. (2) Graceful reload — cluster mode sends new worker a warmup signal before accepting connections. (3) Staggered warmup — warm in batches to avoid overwhelming the DB. (4) Shadow traffic — replay production traffic against the new instance to naturally fill the cache.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Pre-populate cache for top 100 users after restart.\n// APPROACH  - Fetch hot keys and set in Redis before accepting traffic.\n// STRENGTHS - Eliminates cold-start misses; simple to implement.\n// WEAKNESSES- Needs a known list of hot keys; warmup delays startup.\n//\nimport Redis from 'ioredis';\nconst redis = new Redis();\n\nasync function warmup() {\n  const hotUserIds = await db.users.findHotUsers(100);\n  await Promise.all(hotUserIds.map(async (id) => {\n    const user = await db.users.findById(id);\n    await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 300);\n  }));\n  console.log(`Warmed ${hotUserIds.length} user caches`);\n}\n\n// Call before starting the HTTP server\nawait warmup();\napp.listen(3000);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Staggered warmup with concurrency control; warm multiple\n//             cache types (users, products, config).\n// APPROACH  - Batch with p-limit concurrency; warm in priority order;\n//             log progress and timing.\n// STRENGTHS - Doesn't overwhelm DB; prioritized warmup; observable.\n// WEAKNESSES- Still blocks startup; needs tuning of batch size.\n//\nimport Redis from 'ioredis';\nimport pLimit from 'p-limit';\nconst redis = new Redis();\nconst limit = pLimit(10);  // max 10 concurrent DB queries\n\nasync function warmupBatch(keys, fetchFn, cacheTtl) {\n  const start = Date.now();\n  let count = 0;\n  await Promise.all(keys.map(key => limit(async () => {\n    const val = await fetchFn(key);\n    if (val) {\n      await redis.set(key, JSON.stringify(val), 'EX', cacheTtl);\n      count++;\n    }\n  })));\n  console.log(`Warmed ${count} keys in ${Date.now() - start}ms`);\n}\n\nasync function warmupAll() {\n  // Priority 1: config (small, high-traffic)\n  const configs = await db.config.findAll();\n  await warmupBatch(\n    configs.map(c => `config:${c.key}`),\n    (k) => db.config.findByKey(k.split(':')[1]),\n    3600\n  );\n\n  // Priority 2: top products\n  const products = await db.products.findTopSellers(500);\n  await warmupBatch(\n    products.map(p => `product:${p.id}`),\n    (k) => db.products.findById(k.split(':')[1]),\n    600\n  );\n\n  // Priority 3: active users\n  const users = await db.users.findActiveUsers(1000);\n  await warmupBatch(\n    users.map(u => `user:${u.id}`),\n    (k) => db.users.findById(k.split(':')[1]),\n    300\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Graceful reload with cluster mode; warmup before accepting\n//             connections; health check gated on warmup completion.\n// APPROACH  - cluster.on('online') triggers warmup; worker sends\n//             'ready' message before listening; health check returns\n//             503 until warmup completes.\n// STRENGTHS - Zero cold-start misses; no downtime; health-check gated.\n// WEAKNESSES- Complex orchestration; warmup time extends deploy window.\n//\nimport cluster from 'cluster';\nimport Redis from 'ioredis';\n\nif (cluster.isPrimary) {\n  for (let i = 0; i < 4; i++) cluster.fork();\n\n  cluster.on('online', (worker) => {\n    console.log(`Worker ${worker.id} online — sending warmup signal`);\n    worker.send('warmup');\n  });\n\n  cluster.on('exit', (worker) => {\n    console.log(`Worker ${worker.id} died — restarting`);\n    cluster.fork();\n  });\n\n} else {\n  // Worker process\n  let warmed = false;\n\n  process.on('message', async (msg) => {\n    if (msg !== 'warmup') return;\n\n    const redis = new Redis();\n    await warmupAll(redis);\n\n    warmed = true;\n    process.send('ready');  // tell master we're ready\n  });\n\n  // Health check endpoint — 503 until warmup completes\n  app.get('/health', (req, res) => {\n    if (!warmed) return res.status(503).json({ status: 'warming up' });\n    res.status(200).json({ status: 'ok' });\n  });\n\n  // Don't listen until warmed\n  process.on('message', (msg) => {\n    if (msg === 'ready') app.listen(3000);\n  });\n}"
                  }
        ],
        tips: [
                  "Gate health checks on warmup completion — load balancers will keep traffic off the instance until ready.",
                  "Use p-limit or similar to control warmup concurrency — too many parallel DB queries will cause spikes.",
                  "Warm in priority order: config > hot entities > secondary caches.",
                  "Consider shadow traffic (replay production reads) for natural warmup without guessing hot keys."
        ],
        mistake: "Starting the HTTP server before warmup completes — the first burst of traffic all misses and hammers the DB. Always await warmup before app.listen().",
        shorthand: {
          verbose: "const hotKeys = await db.findHotKeys(100);\nawait Promise.all(hotKeys.map(k => redis.set(k, JSON.stringify(await fetch(k)), 'EX', 300)));\napp.listen(3000);",
          concise: "await Promise.all((await db.hot(100)).map(k => redis.set(k, JSON.stringify(await fn(k)), 'EX', 300)));",
        },
      },
    ],
  },
]

export default { meta, sections }
