export const meta = {
  "title": "Testing & Quality",
  "domain": "nodejs",
  "sheet": "testing",
  "icon": "✅"
}

export const sections = [

  // ── Section 1: Testing & Quality ─────────────────────────────────────────
  {
    id: "testing-quality",
    title: "Testing & Quality",
    entries: [
      {
        id: "vitest-unit-testing",
        fn: "vitest Unit Testing",
        desc: "Write unit tests with vitest — Jest-compatible, ESM-native, fast.",
        category: "Testing",
        subtitle: "Fast unit testing framework",
        signature: "describe(\"suite\", () => { it(\"test\", () => { expect(...).toBe(...) }) })",
        descLong: "vitest is Vite-native and much faster than Jest for ESM projects. API is Jest-compatible so migration is trivial. Built-in coverage, snapshot testing, and watch mode. Excellent TypeScript support.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of vitest Unit Testing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// math.test.ts\nimport { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';\nimport { add, multiply, fetchUser } from './math';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of vitest Unit Testing — common patterns you'll see in production.\n// APPROACH  - Combine vitest Unit Testing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ndescribe('Calculator', () => {\n  describe('add', () => {\n    it('adds two positive numbers', () => {\n      expect(add(2, 3)).toBe(5);\n    });\n    it('adds negative numbers', () => {\n      expect(add(-1, 1)).toBe(0);\n      expect(add(-5, -3)).toBe(-8);\n    });\n    it('adds zero', () => {\n      expect(add(0, 5)).toBe(5);\n    });\n  });\n  describe('multiply', () => {\n    it('multiplies two numbers', () => {\n      expect(multiply(3, 4)).toBe(12);\n    });\n    it('returns 0 when multiplying by 0', () => {\n      expect(multiply(5, 0)).toBe(0);\n    });\n  });\n});\n// Async tests\ndescribe('fetchUser', () => {\n  it('fetches user data', async () => {\n    const user = await fetchUser(1);\n    expect(user).toEqual({\n      id: 1,\n      name: 'Alice',\n      email: 'alice@example.com',\n    });\n  });\n  it('throws on invalid ID', async () => {\n    await expect(fetchUser(-1)).rejects.toThrow('Invalid ID');\n  });\n});\n// Setup/teardown\ndescribe('with lifecycle', () => {\n  let testValue = 0;\n  beforeEach(() => {\n    testValue = 0;\n    console.log('Before each test');\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of vitest Unit Testing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nafterEach(() => {\n    console.log('After each test');\n  });\n  it('increments testValue', () => {\n    testValue++;\n    expect(testValue).toBe(1);\n  });\n});\n// Snapshots\ndescribe('snapshots', () => {\n  it('snapshot test', () => {\n    const user = { id: 1, name: 'Alice', age: 30 };\n    expect(user).toMatchSnapshot();\n    // Stores snapshot in __snapshots__/math.test.ts.snap\n  });\n});\n// Test data\ndescribe('fixtures', () => {\n  const mockUser = {\n    id: 1,\n    name: 'Test User',\n    email: 'test@example.com',\n  };\n  it('uses fixture data', () => {\n    expect(mockUser.email).toBe('test@example.com');\n  });\n});\n// vitest.config.ts\nimport { defineConfig } from 'vitest/config';\nimport vue from '@vitejs/plugin-vue';\nexport default defineConfig({\n  plugins: [vue()],\n  test: {\n    globals: true,          // Use global test functions (describe, it, etc)\n    environment: 'node',    // 'jsdom' for DOM tests\n    coverage: {\n      provider: 'v8',\n      reporter: ['text', 'json', 'html'],\n      exclude: ['node_modules/', 'dist/'],\n    },\n  },\n});\n// package.json\n{\n  \"scripts\": {\n    \"test\": \"vitest\",\n    \"test:ui\": \"vitest --ui\",\n    \"test:run\": \"vitest run\",\n    \"coverage\": \"vitest run --coverage\"\n  }\n}"
                  }
        ],
        tips: [
                  "vitest --ui opens a browser UI for test results — great for visualization.",
                  "vitest --coverage generates HTML coverage reports in coverage/ directory.",
                  "Snapshot tests are useful for UI but can be brittle — use sparingly.",
                  "Use describe() to group related tests — improves readability and organization."
        ],
        mistake: "Writing too many assertion per test — one assertion per test is clearer (arrange-act-assert).",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "mocking-vi-mock",
        fn: "Mocking with vi.mock()",
        desc: "Mock modules, functions, and APIs — isolate unit tests from dependencies.",
        category: "Testing",
        subtitle: "Dependency mocking for unit tests",
        signature: "vi.mock(\"./api\")  →  vi.fn().mockResolvedValue(data)",
        descLong: "vi.mock() replaces modules with mocks. vi.fn() creates spy functions with manual control. mockResolvedValue for Promises. mockImplementation for custom behavior. Reset mocks between tests to prevent contamination.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mocking with vi.mock() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { describe, it, expect, vi, beforeEach } from 'vitest';\nimport { createUser, fetchUsers } from './users';\nimport * as api from './api';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mocking with vi.mock() — common patterns you'll see in production.\n// APPROACH  - Combine Mocking with vi.mock() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Mock entire module\nvi.mock('./api');\ndescribe('User Service', () => {\n  beforeEach(() => {\n    // Clear mock call history between tests\n    vi.clearAllMocks();\n  });\n  it('creates a user via API', async () => {\n    // Setup mock return value\n    const mockUser = { id: 1, name: 'Alice' };\n    vi.mocked(api.post).mockResolvedValue(mockUser);\n    const result = await createUser({ name: 'Alice' });\n    // Verify the API was called correctly\n    expect(api.post).toHaveBeenCalledWith('/users', { name: 'Alice' });\n    expect(result).toEqual(mockUser);\n  });\n  it('retries on network error', async () => {\n    // Mock to fail first, succeed on retry\n    vi.mocked(api.post)\n      .mockRejectedValueOnce(new Error('Network error'))\n      .mockResolvedValueOnce({ id: 1, name: 'Alice' });\n    const result = await createUser({ name: 'Alice' });\n    expect(result).toEqual({ id: 1, name: 'Alice' });\n    expect(api.post).toHaveBeenCalledTimes(2);\n  });\n});\n// Mock specific function\ndescribe('with partial mocks', () => {\n  it('mocks function behavior', () => {\n    const processFn = vi.fn((x) => x * 2);\n    expect(processFn(5)).toBe(10);\n    expect(processFn).toHaveBeenCalledWith(5);\n  });\n  it('mocks with side effects', () => {\n    const logger = vi.fn();\n    const mockFn = vi.fn((x) => {\n      logger('Processing:', x);\n      return x * 2;\n    });\n    mockFn(5);\n    expect(logger).toHaveBeenCalledWith('Processing:', 5);\n    expect(mockFn).toReturnWith(10);\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mocking with vi.mock() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nit('mocks implementation', () => {\n    const greet = vi.fn();\n    greet.mockImplementation((name) => `Hello, ${name}!`);\n    expect(greet('Alice')).toBe('Hello, Alice!');\n  });\n});\n// Spying on existing module\ndescribe('spying', () => {\n  it('spies on module function', () => {\n    const spy = vi.spyOn(api, 'post');\n    // Code calls api.post\n    api.post('/test', {});\n    expect(spy).toHaveBeenCalledWith('/test', {});\n    spy.mockRestore(); // Remove spy\n  });\n});\n// Mock timers\ndescribe('timers', () => {\n  beforeEach(() => {\n    vi.useFakeTimers();\n  });\n  afterEach(() => {\n    vi.restoreAllMocks();\n  });\n  it('handles setTimeout', () => {\n    const callback = vi.fn();\n    setTimeout(callback, 1000);\n    // Fast-forward time\n    vi.advanceTimersByTime(1000);\n    expect(callback).toHaveBeenCalled();\n  });\n  it('handles setInterval', () => {\n    const callback = vi.fn();\n    setInterval(callback, 100);\n    vi.advanceTimersByTime(250);\n    expect(callback).toHaveBeenCalledTimes(2);\n    vi.clearAllTimers();\n  });\n});"
                  }
        ],
        tips: [
                  "Always clear mocks between tests — cached mock state causes test pollution.",
                  "Use vi.mocked() to get type information for mocks in TypeScript.",
                  "Mock external APIs, not your own code — mock the boundary, not the internals.",
                  "Use fake timers sparingly — they can hide timing bugs."
        ],
        mistake: "Not clearing mocks between tests — state from one test affects the next.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "supertest-integration",
        fn: "supertest (Integration Tests)",
        desc: "Test Express/HTTP endpoints — make requests, assert responses and status codes.",
        category: "Integration Testing",
        subtitle: "HTTP endpoint testing",
        signature: "request(app).get(\"/api/users\").expect(200)",
        descLong: "supertest makes HTTP requests to your app in tests. Assert status, headers, JSON response. Test Express routes without spinning up a server. Perfect for integration tests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of supertest (Integration Tests) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { describe, it, expect } from 'vitest';\nimport request from 'supertest';\nimport app from '../src/app';\nimport * as db from '../src/db';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of supertest (Integration Tests) — common patterns you'll see in production.\n// APPROACH  - Combine supertest (Integration Tests) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Mock database\nvi.mock('../src/db');\ndescribe('Users API', () => {\n  it('GET /api/users returns user list', async () => {\n    // Setup mock\n    vi.mocked(db.findUsers).mockResolvedValue([\n      { id: 1, name: 'Alice', email: 'alice@example.com' },\n      { id: 2, name: 'Bob', email: 'bob@example.com' },\n    ]);\n    const response = await request(app)\n      .get('/api/users')\n      .expect(200)\n      .expect('Content-Type', /json/);\n    expect(response.body).toHaveLength(2);\n    expect(response.body[0].name).toBe('Alice');\n  });\n  it('GET /api/users/:id returns single user', async () => {\n    vi.mocked(db.findUserById).mockResolvedValue({\n      id: 1,\n      name: 'Alice',\n      email: 'alice@example.com',\n    });\n    await request(app)\n      .get('/api/users/1')\n      .expect(200)\n      .expect((res) => {\n        expect(res.body.name).toBe('Alice');\n      });\n  });\n  it('GET /api/users/:id returns 404 if not found', async () => {\n    vi.mocked(db.findUserById).mockResolvedValue(null);\n    await request(app)\n      .get('/api/users/999')\n      .expect(404);\n  });\n  it('POST /api/users creates user', async () => {\n    const newUser = { name: 'Charlie', email: 'charlie@example.com' };\n    vi.mocked(db.createUser).mockResolvedValue({\n      id: 3,\n      ...newUser,\n    });\n    const response = await request(app)\n      .post('/api/users')\n      .send(newUser)\n      .expect(201)\n      .expect((res) => {\n        expect(res.body.id).toBe(3);\n      });\n  });\n  it('POST /api/users validates email', async () => {\n    await request(app)\n      .post('/api/users')\n      .send({ name: 'Dave', email: 'invalid-email' })\n      .expect(400)\n      .expect((res) => {\n        expect(res.body.error).toContain('Invalid email');\n      });\n  });\n  it('PUT /api/users/:id updates user', async () => {\n    vi.mocked(db.updateUser).mockResolvedValue({\n      id: 1,\n      name: 'Alice Updated',\n      email: 'alice@example.com',\n    });\n    await request(app)\n      .put('/api/users/1')\n      .send({ name: 'Alice Updated' })\n      .expect(200)\n      .expect((res) => {\n        expect(res.body.name).toBe('Alice Updated');\n      });\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of supertest (Integration Tests) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nit('DELETE /api/users/:id deletes user', async () => {\n    vi.mocked(db.deleteUser).mockResolvedValue(true);\n    await request(app)\n      .delete('/api/users/1')\n      .expect(204);\n  });\n});\n// Authentication tests\ndescribe('Auth API', () => {\n  it('POST /auth/login returns JWT token', async () => {\n    vi.mocked(db.findUserByEmail).mockResolvedValue({\n      id: 1,\n      email: 'alice@example.com',\n      passwordHash: await bcrypt.hash('password123', 12),\n    });\n    const response = await request(app)\n      .post('/auth/login')\n      .send({ email: 'alice@example.com', password: 'password123' })\n      .expect(200);\n    expect(response.body).toHaveProperty('token');\n    expect(response.body.token).toMatch(/^eyJ/); // JWT format\n  });\n  it('POST /auth/login returns 401 with wrong password', async () => {\n    vi.mocked(db.findUserByEmail).mockResolvedValue({\n      id: 1,\n      email: 'alice@example.com',\n      passwordHash: await bcrypt.hash('password123', 12),\n    });\n    await request(app)\n      .post('/auth/login')\n      .send({ email: 'alice@example.com', password: 'wrong' })\n      .expect(401);\n  });\n  it('GET /profile requires authentication', async () => {\n    // No token\n    await request(app)\n      .get('/profile')\n      .expect(401);\n    // With token\n    await request(app)\n      .get('/profile')\n      .set('Authorization', 'Bearer valid.jwt.token')\n      .expect(200);\n  });\n});\n// File upload tests\ndescribe('Upload API', () => {\n  it('POST /upload accepts file', async () => {\n    await request(app)\n      .post('/upload')\n      .attach('file', 'test/fixtures/image.jpg')\n      .expect(200)\n      .expect((res) => {\n        expect(res.body.url).toMatch(/\\/images\\//);\n      });\n  });\n  it('POST /upload rejects large files', async () => {\n    // Create a large buffer\n    const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB\n    await request(app)\n      .post('/upload')\n      .attach('file', largeFile, 'large.bin')\n      .expect(413); // Payload Too Large\n  });\n});"
                  }
        ],
        tips: [
                  "supertest auto-closes connections — no need to manually clean up.",
                  "Use .expect() for assertions — more readable than manual assertions.",
                  "Mock the database layer in integration tests to avoid hitting real DB.",
                  "Test error cases: 404, 401, 400 with invalid input."
        ],
        mistake: "Integration tests that hit the real database — use mocks to isolate tests.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "test-fixtures-factories",
        fn: "Test Fixtures & Factories",
        desc: "Create consistent test data with factories — avoid repetitive test setup.",
        category: "Testing",
        subtitle: "Reusable test data generation",
        signature: "const user = userFactory.build({ email: \"custom@example.com\" })",
        descLong: "Factories generate test data programmatically. Define defaults, override as needed. Much cleaner than hardcoding test data everywhere. Use faker.js for realistic data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Test Fixtures & Factories — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { faker } from '@faker-js/faker';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Test Fixtures & Factories — common patterns you'll see in production.\n// APPROACH  - Combine Test Fixtures & Factories with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Factory pattern for test data\nclass UserFactory {\n  static build(overrides = {}) {\n    return {\n      id: faker.datatype.number(),\n      name: faker.person.fullName(),\n      email: faker.internet.email(),\n      password: 'password123',\n      createdAt: faker.date.past(),\n      ...overrides, // Override defaults\n    };\n  }\n  static buildMany(count, overrides = {}) {\n    return Array.from({ length: count }, () =>\n      this.build(overrides)\n    );\n  }\n  static buildAdmin(overrides = {}) {\n    return this.build({\n      role: 'admin',\n      ...overrides,\n    });\n  }\n}\nclass PostFactory {\n  static build(overrides = {}) {\n    return {\n      id: faker.datatype.number(),\n      title: faker.lorem.sentence(),\n      content: faker.lorem.paragraphs(3),\n      userId: faker.datatype.number(),\n      createdAt: faker.date.past(),\n      ...overrides,\n    };\n  }\n}\n// Usage in tests\ndescribe('User Service', () => {\n  it('creates a user', async () => {\n    const userData = UserFactory.build({\n      email: 'custom@example.com',\n    });\n    const user = await createUser(userData);\n    expect(user.email).toBe('custom@example.com');\n  });\n  it('lists multiple users', async () => {\n    const users = UserFactory.buildMany(5);\n    // All have different names, emails, etc.\n  });\n  it('admin users have special permissions', async () => {\n    const admin = UserFactory.buildAdmin();\n    expect(admin.role).toBe('admin');\n  });\n  it('associates posts with users', async () => {\n    const user = UserFactory.build();\n    const post = PostFactory.build({\n      userId: user.id,\n    });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Test Fixtures & Factories — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexpect(post.userId).toBe(user.id);\n  });\n});\n// Database fixtures for integration tests\nasync function seedDatabase() {\n  const users = UserFactory.buildMany(10);\n  const posts = users.flatMap((user) =>\n    PostFactory.buildMany(3, { userId: user.id })\n  );\n  // Insert into test database\n  await db.users.insertMany(users);\n  await db.posts.insertMany(posts);\n  return { users, posts };\n}\ndescribe('User API Integration', () => {\n  beforeEach(async () => {\n    await db.clear(); // Clear between tests\n    await seedDatabase();\n  });\n  it('GET /api/users returns 10 users', async () => {\n    const res = await request(app).get('/api/users');\n    expect(res.body).toHaveLength(10);\n  });\n});\n// Custom matchers\nimport { expect } from 'vitest';\n// Add custom expectation\nexpect.extend({\n  toBeValidEmail(received) {\n    const pass = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(received);\n    return {\n      pass,\n      message: () =>\n        pass\n          ? `expected ${received} not to be a valid email`\n          : `expected ${received} to be a valid email`,\n    };\n  },\n});\nit('validates email format', () => {\n  expect('user@example.com').toBeValidEmail();\n  expect('invalid-email').not.toBeValidEmail();\n});"
                  }
        ],
        tips: [
                  "Factories reduce test setup boilerplate — define once, reuse everywhere.",
                  "Use faker.js for realistic data that catches edge cases.",
                  "Override only what matters in the test — keep defaults for unrelated fields.",
                  "Create specialized factory methods for common scenarios (admin, banned user, etc)."
        ],
        mistake: "Hardcoding test data in every test — factories are cleaner and catch inconsistencies.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "integration-testing-supertest",
        fn: "Integration Testing with Supertest",
        desc: "Test Express routes end-to-end — HTTP requests, responses, status codes, and headers without a running server.",
        category: "Testing",
        subtitle: "HTTP endpoint testing",
        signature: "request(app).get(\"/path\").expect(200).expect(\"Content-Type\", /json/)",
        descLong: "Supertest binds your Express app to an ephemeral port and makes real HTTP requests against it. No need to start the server manually. Tests the full middleware stack: auth, validation, business logic, and response formatting. Combine with a test database for true integration tests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Integration Testing with Supertest — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { describe, it, expect, beforeAll, afterAll } from 'vitest';\nimport request from 'supertest';\nimport app from '../src/app.js';\nimport { setupTestDB, teardownTestDB, seedUsers } from './helpers/db.js';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Integration Testing with Supertest — common patterns you'll see in production.\n// APPROACH  - Combine Integration Testing with Supertest with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ndescribe('Users API', () => {\n  let authToken;\n  beforeAll(async () => {\n    await setupTestDB();\n    await seedUsers();\n    // Get auth token for protected routes\n    const res = await request(app)\n      .post('/api/login')\n      .send({ email: 'test@example.com', password: 'password123' });\n    authToken = res.body.token;\n  });\n  afterAll(async () => {\n    await teardownTestDB();\n  });\n  it('GET /api/users returns user list', async () => {\n    const res = await request(app)\n      .get('/api/users')\n      .set('Authorization', `Bearer ${authToken}`)\n      .expect(200)\n      .expect('Content-Type', /json/);\n    expect(res.body.users).toHaveLength(3);\n    expect(res.body.users[0]).toHaveProperty('email');\n    expect(res.body.users[0]).not.toHaveProperty('password'); // never leak\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Integration Testing with Supertest — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nit('POST /api/users validates input', async () => {\n    const res = await request(app)\n      .post('/api/users')\n      .set('Authorization', `Bearer ${authToken}`)\n      .send({ email: 'invalid' })  // missing required fields\n      .expect(400);\n    expect(res.body.errors).toBeDefined();\n  });\n  it('GET /api/users/:id returns 404 for missing user', async () => {\n    await request(app)\n      .get('/api/users/nonexistent-id')\n      .set('Authorization', `Bearer ${authToken}`)\n      .expect(404);\n  });\n  it('rejects unauthenticated requests', async () => {\n    await request(app)\n      .get('/api/users')\n      .expect(401);\n  });\n});"
                  }
        ],
        tips: [
                  "Export your Express app without calling .listen() — supertest handles binding to a port.",
                  "Use beforeAll/afterAll for database setup — beforeEach/afterEach for per-test cleanup.",
                  "Test both happy path AND error cases: 400, 401, 403, 404, 409, 500.",
                  "Check response headers (Content-Type, Set-Cookie) not just the body."
        ],
        mistake: "Testing against a shared development database — tests modify data and interfere with each other. Use a separate test database that gets reset before each test suite.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "test-coverage-ci",
        fn: "Test Coverage & CI Integration",
        desc: "Measure code coverage with c8/istanbul and integrate tests into CI/CD pipelines.",
        category: "Testing",
        subtitle: "Coverage reports, thresholds, and GitHub Actions",
        signature: "vitest --coverage  |  c8 node test.js  |  nyc mocha",
        descLong: "Code coverage measures which lines, branches, functions, and statements your tests execute. Use coverage thresholds to prevent regressions. Integrate with CI (GitHub Actions, GitLab CI) to run tests on every push. Coverage is a metric, not a goal — 100% coverage does not mean bug-free code, but low coverage indicates untested paths.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Test Coverage & CI Integration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// vitest.config.ts — coverage configuration\nimport { defineConfig } from 'vitest/config';\nexport default defineConfig({\n  test: {\n    coverage: {\n      provider: 'v8',            // or 'istanbul'\n      reporter: ['text', 'html', 'lcov'],\n      reportsDirectory: './coverage',\n      include: ['src/**/*.{ts,js}'],\n      exclude: [\n        'src/**/*.test.ts',\n        'src/**/*.d.ts',\n        'src/types/**',\n      ],\n      thresholds: {\n        lines: 80,\n        branches: 75,\n        functions: 80,\n        statements: 80,\n      },\n    },\n    // Test configuration\n    globals: true,\n    environment: 'node',\n    testTimeout: 10000,\n    hookTimeout: 30000,\n  },\n});\n// package.json scripts\n// \"test\": \"vitest\",\n// \"test:run\": \"vitest run\",\n// \"test:coverage\": \"vitest run --coverage\",\n// \"test:watch\": \"vitest --watch\",\n// \"test:ui\": \"vitest --ui\","
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Test Coverage & CI Integration — common patterns you'll see in production.\n// APPROACH  - Combine Test Coverage & CI Integration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// .github/workflows/test.yml\n// name: Tests\n// on: [push, pull_request]\n// jobs:\n//   test:\n//     runs-on: ubuntu-latest\n//     services:\n//       postgres:\n//         image: postgres:16\n//         env:\n//           POSTGRES_PASSWORD: test"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Test Coverage & CI Integration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n//         ports: ['5432:5432']\n//     steps:\n//       - uses: actions/checkout@v4\n//       - uses: actions/setup-node@v4\n//         with: { node-version: 20 }\n//       - run: npm ci\n//       - run: npm run test:coverage\n//       - uses: codecov/codecov-action@v4\n//         with:\n//           files: ./coverage/lcov.info"
                  }
        ],
        tips: [
                  "Set coverage thresholds to prevent regressions — CI fails if coverage drops below the threshold.",
                  "80% line coverage is a reasonable target — diminishing returns above 90% for most projects.",
                  "Use --coverage.include to focus on src/ — exclude test files, types, and generated code.",
                  "Upload lcov reports to Codecov or Coveralls for PR-level coverage diffs."
        ],
        mistake: "Chasing 100% coverage by writing meaningless tests (testing getters/setters, mocking everything). Focus coverage on business logic, edge cases, and error paths — not boilerplate.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "node-test-runner",
        fn: "Node.js Built-in Test Runner",
        desc: "Native test runner in Node v18+ — no dependencies, import from node:test.",
        category: "Testing",
        subtitle: "node:test, describe, it, assert module",
        signature: "import { test, describe } from \"node:test\"  |  assert.equal(a, b)",
        descLong: "Node.js v18+ includes a built-in test runner in the node:test module. No need for external frameworks. Supports describe/it syntax, assertions via node:assert, async tests, hooks. Lighter weight than vitest/jest. Good for simple projects or when dependencies are limited. TAP (Test Anything Protocol) reporter output.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Node.js Built-in Test Runner — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { test, describe, before, after, beforeEach, afterEach } from 'node:test';\nimport assert from 'node:assert';\nimport { sum, multiply } from './math.js';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Node.js Built-in Test Runner — common patterns you'll see in production.\n// APPROACH  - Combine Node.js Built-in Test Runner with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ndescribe('Math operations', () => {\n  describe('sum', () => {\n    test('adds two numbers', () => {\n      assert.equal(sum(2, 3), 5);\n    });\n    test('adds negative numbers', () => {\n      assert.equal(sum(-1, 1), 0);\n    });\n    test('adds zero', () => {\n      assert.equal(sum(0, 5), 5);\n    });\n  });\n  describe('multiply', () => {\n    test('multiplies two numbers', () => {\n      assert.equal(multiply(3, 4), 12);\n    });\n    test('returns 0 when multiplying by 0', () => {\n      assert.equal(multiply(5, 0), 0);\n    });\n  });\n});\n// Async tests\ndescribe('async operations', () => {\n  test('fetches data asynchronously', async () => {\n    const result = await fetchData();\n    assert.ok(result);\n    assert.equal(result.id, 1);\n  });\n  test('handles errors', async () => {\n    await assert.rejects(\n      () => fetchData(-1),\n      /Invalid ID/\n    );\n  });\n});\n// Setup and teardown\nlet testValue = 0;\nbefore(() => {\n  console.log('Before all tests');\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Node.js Built-in Test Runner — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nafter(() => {\n  console.log('After all tests');\n});\nbeforeEach(() => {\n  testValue = 0;\n  console.log('Before each test');\n});\nafterEach(() => {\n  console.log('After each test');\n});\ndescribe('with lifecycle', () => {\n  test('increments test value', () => {\n    testValue++;\n    assert.equal(testValue, 1);\n  });\n  test('uses fresh value', () => {\n    assert.equal(testValue, 0); // reset by beforeEach\n  });\n});\n// Skipped/only tests\ntest.skip('skipped test', () => {\n  assert.fail('should not run');\n});\ntest.only('only test', () => {\n  assert.ok(true); // only this test runs\n});\n// Subtests\ntest('parent test', async (t) => {\n  await t.test('subtest 1', () => {\n    assert.ok(true);\n  });\n  await t.test('subtest 2', () => {\n    assert.ok(true);\n  });\n});"
                  }
        ],
        tips: [
                  "Run with: node --test test/**/*.test.js",
                  "No setup required — zero external dependencies.",
                  "TAP reporter output — simple format for CI parsing.",
                  "Use node:assert for assertions — no extra libraries needed."
        ],
        mistake: "Using node:test for complex projects requiring mocking/snapshots — consider vitest instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "vitest-node",
        fn: "Vitest for Node.js — Setup & Configuration",
        desc: "Vitest configuration for Node.js projects — mocking, spies, fake timers.",
        category: "Testing",
        subtitle: "vitest.config.js, vi.spyOn, vi.useFakeTimers, environment setup",
        signature: "defineConfig({ test: { environment: \"node\" } })  |  vi.spyOn()  |  vi.useFakeTimers()",
        descLong: "Vitest is a modern test runner built on Vite. Zero-config for Vite projects. Supports mocking (vi.mock), spying (vi.spyOn), and fake timers (vi.useFakeTimers). Watch mode with file watching. Excellent TypeScript support. Much faster than Jest due to ESM and Vite integration.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Vitest for Node.js — Setup & Configuration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// vitest.config.ts\nimport { defineConfig } from 'vitest/config';\nimport path from 'path';\nexport default defineConfig({\n  resolve: {\n    alias: {\n      '@': path.resolve(__dirname, './src'),\n    },\n  },\n  test: {\n    globals: true,           // use global test() instead of importing\n    environment: 'node',     // or 'jsdom' for DOM tests\n    coverage: {\n      provider: 'v8',\n      reporter: ['text', 'html'],\n    },\n    testTimeout: 10000,\n    hookTimeout: 30000,\n  },\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Vitest for Node.js — Setup & Configuration — common patterns you'll see in production.\n// APPROACH  - Combine Vitest for Node.js — Setup & Configuration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nimport { describe, it, expect, vi } from 'vitest';\ndescribe('Spying', () => {\n  it('spies on function calls', () => {\n    const obj = {\n      method: () => 'result',\n    };\n    const spy = vi.spyOn(obj, 'method');\n    obj.method();\n    obj.method();\n    expect(spy).toHaveBeenCalledTimes(2);\n    expect(spy).toHaveBeenReturnedWith('result');\n    spy.mockRestore();\n  });\n  it('spies and changes return value', () => {\n    const obj = {\n      getData: () => ({ id: 1 }),\n    };\n    const spy = vi.spyOn(obj, 'getData').mockReturnValue({ id: 999 });\n    const result = obj.getData();\n    expect(result.id).toBe(999);\n    expect(spy).toHaveBeenCalled();\n  });\n});\ndescribe('Timers', () => {\n  it('advances time with fake timers', () => {\n    vi.useFakeTimers();\n    const callback = vi.fn();\n    setTimeout(callback, 1000);\n    // Fast-forward time\n    vi.advanceTimersByTime(1000);\n    expect(callback).toHaveBeenCalled();\n    vi.useRealTimers(); // restore real timers\n  });\n  it('runs all timers to completion', () => {\n    vi.useFakeTimers();\n    const calls = [];\n    setTimeout(() => calls.push(1), 100);\n    setTimeout(() => calls.push(2), 200);\n    vi.runAllTimers();\n    expect(calls).toEqual([1, 2]);\n    vi.useRealTimers();\n  });\n});\n// math.test.ts\nvi.mock('./db', () => ({\n  query: vi.fn(),\n  close: vi.fn(),\n}));\nimport { query, close } from './db';\ndescribe('with mocked modules', () => {\n  it('mocks database calls', async () => {\n    vi.mocked(query).mockResolvedValue([{ id: 1 }]);\n    const result = await query('SELECT *');\n    expect(result).toEqual([{ id: 1 }]);\n    expect(query).toHaveBeenCalledWith('SELECT *');\n  });\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Vitest for Node.js — Setup & Configuration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nimport { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';\ndescribe('with setup/teardown', () => {\n  let db;\n  beforeAll(async () => {\n    db = await connectDB();\n  });\n  afterAll(async () => {\n    await db.close();\n  });\n  beforeEach(async () => {\n    await db.clear();\n  });\n  it('uses clean database state', async () => {\n    await db.insert('users', { id: 1, name: 'Alice' });\n    const users = await db.query('SELECT * FROM users');\n    expect(users).toHaveLength(1);\n  });\n});\n// vitest              # watch mode\n// vitest run          # single run\n// vitest run --ui     # UI dashboard\n// vitest --coverage   # coverage report\n// vitest --reporter=tap  # TAP reporter"
                  }
        ],
        tips: [
                  "globals: true imports test functions globally — no need to import describe/it.",
                  "vi.useFakeTimers() — mock time for testing delays/intervals.",
                  "vi.mock() happens at module load time — must be at top level.",
                  "Vitest UI (--ui) shows test results in browser — great for debugging."
        ],
        mistake: "Mixing real and fake timers — always restore with vi.useRealTimers().",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "database-testing",
        fn: "Database Testing Patterns",
        desc: "Test database interactions — test databases, cleanup, testcontainers for isolation.",
        category: "Integration Testing",
        subtitle: "test database setup, beforeEach cleanup, testcontainers, fixtures",
        signature: "setupTestDB()  |  testcontainers.GenericContainer()  |  beforeEach cleanup",
        descLong: "Integration tests need real database connections. Use a separate test database. Clean data before each test to isolate tests. testcontainers spin up Docker containers for databases on demand. Seed test data with factories. Transaction rollback per test for speed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Database Testing Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { describe, it, beforeAll, beforeEach, afterAll } from 'vitest';\nimport { Pool } from 'pg';\nimport { GenericContainer, StartedTestContainer } from 'testcontainers';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Database Testing Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Database Testing Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nlet container;\nlet db;\ndescribe('Database Integration Tests', () => {\n  beforeAll(async () => {\n    // Start Postgres container\n    container = await new GenericContainer('postgres:16-alpine')\n      .withEnvironment('POSTGRES_PASSWORD', 'test')\n      .withEnvironment('POSTGRES_DB', 'testdb')\n      .withExposedPorts(5432)\n      .start();\n    const port = container.getMappedPort(5432);\n    // Connect to test database\n    db = new Pool({\n      host: 'localhost',\n      port,\n      database: 'testdb',\n      user: 'postgres',\n      password: 'test',\n    });\n    // Run migrations\n    await db.query(`\n      CREATE TABLE users (\n        id SERIAL PRIMARY KEY,\n        email VARCHAR(255) NOT NULL UNIQUE,\n        name VARCHAR(255),\n        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n      );\n    `);\n  });\n  afterAll(async () => {\n    await db.end();\n    await container.stop();\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Database Testing Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nbeforeEach(async () => {\n    // Clear all tables\n    await db.query('DELETE FROM users');\n  });\n  it('inserts and retrieves user', async () => {\n    await db.query(\n      'INSERT INTO users (email, name) VALUES ($1, $2)',\n      ['alice@example.com', 'Alice']\n    );\n    const result = await db.query(\n      'SELECT * FROM users WHERE email = $1',\n      ['alice@example.com']\n    );\n    expect(result.rows).toHaveLength(1);\n    expect(result.rows[0].name).toBe('Alice');\n  });\n  it('enforces unique email constraint', async () => {\n    await db.query(\n      'INSERT INTO users (email, name) VALUES ($1, $2)',\n      ['alice@example.com', 'Alice']\n    );\n    // Insert duplicate email\n    await expect(\n      db.query(\n        'INSERT INTO users (email, name) VALUES ($1, $2)',\n        ['alice@example.com', 'Alice 2']\n      )\n    ).rejects.toThrow('duplicate key');\n  });\n});"
                  }
        ],
        tips: [
                  "testcontainers runs Docker containers — no manual database setup.",
                  "Transaction rollback is 10x faster than DELETE + TRUNCATE.",
                  "Test against production schema — migrations must be applied.",
                  "Parallel tests need isolation — each test gets its own transaction or database."
        ],
        mistake: "Sharing test database across tests — modifications from one test affect the next. Use transactions or fresh data per test.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "mock-fs",
        fn: "Mocking Filesystem in Tests",
        desc: "Mock filesystem operations — memfs, mock-fs for in-memory file system testing.",
        category: "Testing",
        subtitle: "memfs, mock-fs, virtual file system, avoiding real disk I/O",
        signature: "memfs, mock-fs, vi.mock(\"fs\")",
        descLong: "Tests should not write to real filesystem — slow, leave artifacts, cause CI failures. memfs and mock-fs create virtual in-memory filesystems. Mock fs module to use them. Test file operations without disk I/O. Especially useful for testing file-heavy logic (config parsing, file validation, etc).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mocking Filesystem in Tests — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { describe, it, expect, beforeEach, vi } from 'vitest';\nimport { vol } from 'memfs';\nimport * as fs from 'fs';\n// Mock the fs module to use memfs\nvi.mock('fs', () => {\n  return {\n    ...vol,\n    promises: vol.promises,\n  };\n});\ndescribe('File operations', () => {\n  beforeEach(() => {\n    // Clear the virtual filesystem\n    vol.reset();\n  });\n  it('reads file from virtual filesystem', () => {\n    vol.fromJSON({\n      '/tmp/config.json': JSON.stringify({ port: 3000 }),\n    });\n    const content = fs.readFileSync('/tmp/config.json', 'utf8');\n    expect(JSON.parse(content).port).toBe(3000);\n  });\n  it('writes file to virtual filesystem', () => {\n    fs.writeFileSync('/tmp/output.txt', 'Hello World');\n    const content = fs.readFileSync('/tmp/output.txt', 'utf8');\n    expect(content).toBe('Hello World');\n  });\n  it('creates directories', () => {\n    fs.mkdirSync('/tmp/mydir', { recursive: true });\n    expect(fs.existsSync('/tmp/mydir')).toBe(true);\n  });\n  it('lists directory contents', () => {\n    vol.fromJSON({\n      '/app/src/file1.js': 'code',\n      '/app/src/file2.js': 'code',\n      '/app/src/index.ts': 'code',\n    });\n    const files = fs.readdirSync('/app/src');\n    expect(files).toContain('file1.js');\n    expect(files).toContain('file2.js');\n  });\n  it('handles errors gracefully', () => {\n    expect(() => {\n      fs.readFileSync('/nonexistent.txt');\n    }).toThrow('ENOENT');\n  });\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mocking Filesystem in Tests — common patterns you'll see in production.\n// APPROACH  - Combine Mocking Filesystem in Tests with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction parseConfigFile(path) {\n  const content = fs.readFileSync(path, 'utf8');\n  return JSON.parse(content);\n}\ndescribe('Config parsing', () => {\n  it('parses valid config', () => {\n    vol.fromJSON({\n      '/etc/config.json': JSON.stringify({ debug: true, port: 8080 }),\n    });\n    const config = parseConfigFile('/etc/config.json');\n    expect(config.port).toBe(8080);\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mocking Filesystem in Tests — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nit('throws on invalid JSON', () => {\n    vol.fromJSON({\n      '/etc/config.json': 'invalid json',\n    });\n    expect(() => parseConfigFile('/etc/config.json')).toThrow();\n  });\n  it('throws on missing file', () => {\n    expect(() => parseConfigFile('/etc/missing.json')).toThrow('ENOENT');\n  });\n});"
                  }
        ],
        tips: [
                  "memfs is faster and cleaner than creating real temp files.",
                  "Reset filesystem before each test with vol.reset().",
                  "Mock at module level, before imports — affects all module loads.",
                  "Test error paths: missing files, permission errors, invalid formats."
        ],
        mistake: "Testing with real files in /tmp — leaves artifacts, fails on CI, slower.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "snapshot-node",
        fn: "Snapshot Testing in Node.js",
        desc: "Snapshot testing for complex outputs — toMatchSnapshot, inline snapshots, updating.",
        category: "Testing",
        subtitle: "toMatchSnapshot, inline snapshots, snapshot review, updating",
        signature: "expect(output).toMatchSnapshot()  |  expect(output).toMatchInlineSnapshot()",
        descLong: "Snapshots capture expected output and detect regressions. Useful for complex objects, generated code, error messages. Inline snapshots store expected values in test files. Review snapshot changes in git diffs. Update snapshots with --update flag when intentional changes happen.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Snapshot Testing in Node.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { describe, it, expect } from 'vitest';\ndescribe('Snapshot Testing', () => {\n  it('captures object snapshot', () => {\n    const user = {\n      id: 1,\n      name: 'Alice',\n      email: 'alice@example.com',\n      createdAt: '2024-01-15T10:00:00Z',\n    };\n    expect(user).toMatchSnapshot();\n    // Stores in __snapshots__/test.test.ts.snap\n  });\n  it('captures array snapshot', () => {\n    const users = [\n      { id: 1, name: 'Alice' },\n      { id: 2, name: 'Bob' },\n      { id: 3, name: 'Charlie' },\n    ];\n    expect(users).toMatchSnapshot();\n  });\n  it('captures formatted output', () => {\n    const html = '<div><p>Hello</p></div>';\n    expect(html).toMatchSnapshot();\n  });\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Snapshot Testing in Node.js — common patterns you'll see in production.\n// APPROACH  - Combine Snapshot Testing in Node.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ndescribe('Inline Snapshots', () => {\n  it('matches inline snapshot', () => {\n    const result = { status: 'ok', data: [1, 2, 3] };\n    expect(result).toMatchInlineSnapshot(`\n{\n  \"status\": \"ok\",\n  \"data\": [\n    1,\n    2,\n    3,\n  ],\n}\n`);\n  });\n  it('auto-generates snapshot if missing', () => {\n    const result = { name: 'test' };\n    // First run: generates inline snapshot\n    // Subsequent runs: compares against stored snapshot\n    expect(result).toMatchInlineSnapshot(`\n{\n  \"name\": \"test\",\n}\n`);\n  });\n});\nfunction generateComponent(name, props) {\n  return `export function ${name}({ ${Object.keys(props).join(', ')} }) {\n  return (\n    <div>\n      ${Object.entries(props)\n        .map(([key, value]) => `<span>{${key}}</span>`)\n        .join('\\n      ')}\n    </div>\n  );\n}`;\n}\ndescribe('Code generation', () => {\n  it('generates React component correctly', () => {\n    const code = generateComponent('Card', { title: '', content: '' });\n    expect(code).toMatchSnapshot();\n  });\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Snapshot Testing in Node.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ndescribe('Snapshots with dynamic values', () => {\n  it('ignores dynamic fields', () => {\n    const response = {\n      id: 123,\n      timestamp: new Date().toISOString(),\n      message: 'success',\n    };\n    expect(response).toMatchSnapshot({\n      id: expect.any(Number),\n      timestamp: expect.any(String),\n    });\n    // Only 'message' is snapshot-matched, others are type-checked\n  });\n});\n// vitest run --update      # update all snapshots\n// vitest run -u            # short form\n// vitest run --reporter=verbose  # see what changed"
                  }
        ],
        tips: [
                  "Review snapshot diffs carefully before committing — they should reflect intentional changes.",
                  "Avoid snapshots for trivial values (use exact assertions instead).",
                  "Inline snapshots are better than file-based — easier to see expected values.",
                  "Use expect.any(Type) to ignore dynamic fields (timestamps, IDs)."
        ],
        mistake: "Blindly updating snapshots without reviewing diffs — you might snapshot a bug.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "load-testing",
        fn: "Load Testing for Node.js APIs",
        desc: "Load test HTTP endpoints — autocannon, k6, measuring throughput and latency.",
        category: "Performance Testing",
        subtitle: "autocannon, k6 scripts, throughput, latency percentiles",
        signature: "autocannon({ url })  |  k6 run script.js",
        descLong: "Load testing measures how many requests your API handles under load. autocannon is Node.js native. k6 is more powerful with scripting. Measure throughput (requests/sec), latency (p50/p95/p99), and error rate. Identify bottlenecks and capacity limits.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Load Testing for Node.js APIs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// ── autocannon (Node.js native) ───────────────────\nimport autocannon from 'autocannon';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Load Testing for Node.js APIs — common patterns you'll see in production.\n// APPROACH  - Combine Load Testing for Node.js APIs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nasync function loadTest() {\n  const result = await autocannon({\n    url: 'http://localhost:3000/api/users',\n    connections: 100,        // concurrent connections\n    pipelining: 10,          // requests per connection\n    duration: 30,            // test duration in seconds\n    requests: [\n      {\n        path: '/api/users',\n        method: 'GET',\n      },\n      {\n        path: '/api/users',\n        method: 'POST',\n        body: JSON.stringify({ name: 'Test' }),\n      },\n    ],\n  });\n  // Print results\n  console.log(`Throughput: ${result.requests.average} req/s`);\n  console.log(`Latency: p50=${result.latency.p50}ms, p95=${result.latency.p95}ms, p99=${result.latency.p99}ms`);\n  console.log(`Errors: ${result.errors}`);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Load Testing for Node.js APIs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nloadTest();"
                  }
        ],
        tips: [
                  "Start with low concurrency (10 connections), gradually increase.",
                  "Test realistic scenarios — include both read and write requests.",
                  "p95 and p99 latencies matter more than average (p50) for SLAs.",
                  "Run load tests in production-like environment, not shared dev machines."
        ],
        mistake: "Only testing happy path — test error scenarios, slow endpoints, and high concurrency.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "contract-testing",
        fn: "Contract Testing with Pact",
        desc: "Contract testing for API integrations — consumer-driven contracts, provider verification.",
        category: "Integration Testing",
        subtitle: "Pact framework, consumer/provider tests, contract verification",
        signature: "new PactV3()  |  .upon(provider)  |  verify()",
        descLong: "Contract tests ensure consumer (frontend) and provider (API) expectations match. Consumer writes tests expecting certain API responses. Provider verifies it returns matching responses. Catches integration issues early. Pact stores contracts as JSON, verified by both sides.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Contract Testing with Pact — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// ── Consumer side (frontend) ──────────────────────\nimport { PactV3 } from '@pact-foundation/pact';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Contract Testing with Pact — common patterns you'll see in production.\n// APPROACH  - Combine Contract Testing with Pact with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst pact = new PactV3({\n  consumer: 'web-app',\n  provider: 'user-api',\n});\ndescribe('User API Contract (Consumer)', () => {\n  it('returns user by ID', async () => {\n    await pact\n      .upon('a request for user 123')\n      .withRequest('GET', '/users/123')\n      .willRespondWith(200, {\n        body: {\n          id: 123,\n          name: 'Alice',\n          email: 'alice@example.com',\n        },\n      })\n      .executeTest(async (mockServer) => {\n        const response = await fetch(`${mockServer.url}/users/123`);\n        const user = await response.json();\n        expect(user.id).toBe(123);\n        expect(user.name).toBe('Alice');\n      });\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Contract Testing with Pact — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nit('creates user', async () => {\n    await pact\n      .upon('a request to create user')\n      .withRequest('POST', '/users', {\n        body: { name: 'Bob', email: 'bob@example.com' },\n      })\n      .willRespondWith(201, {\n        body: {\n          id: expect.any(Number),\n          name: 'Bob',\n          email: 'bob@example.com',\n        },\n      })\n      .executeTest(async (mockServer) => {\n        const response = await fetch(`${mockServer.url}/users`, {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json' },\n          body: JSON.stringify({ name: 'Bob', email: 'bob@example.com' }),\n        });\n        expect(response.status).toBe(201);\n      });\n  });\n  // Export contract for provider verification\n  afterAll(() => pact.write());\n});"
                  }
        ],
        tips: [
                  "Contracts live in version control — both consumer and provider reference them.",
                  "Consumer tests run against mock — fast and isolated.",
                  "Provider tests verify real API — catch breaking changes before deployment.",
                  "Pact Broker (central repository) coordinates contract sharing between services."
        ],
        mistake: "Contract tests only on consumer side — provider must also verify it meets contracts.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "e2e-api-testing",
        fn: "E2E API Testing — Hurl, Bruno, HTTP Files",
        desc: "Declarative API testing — .http files, Hurl scripts, Bruno for collaborative testing.",
        category: "E2E Testing",
        subtitle: "Hurl, Bruno, .http files, HTTP clients, declarative tests",
        signature: "hurl test.hurl  |  @http GET /api/users",
        descLong: "E2E tests exercise full API flows including auth, state, and errors. HTTP files (.hurl, .http) define requests in plain text. Hurl is a command-line tool for testing APIs. Bruno is a desktop app similar to Postman but using .http files. These are version-control friendly and shareable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of E2E API Testing — Hurl, Bruno, HTTP Files — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# Test user flow\nPOST http://localhost:3000/api/login\nContent-Type: application/json\n{\n  \"email\": \"alice@example.com\",\n  \"password\": \"password123\"\n}\n# Save token from response\n[Captures]\ntoken: jsonpath(\"$.token\")\n# Use token in next request\nGET http://localhost:3000/api/profile\nAuthorization: Bearer {{token}}\nHTTP 200\n[Asserts]\njsonpath(\"$.user.email\") == \"alice@example.com\"\n# Test error case\nPOST http://localhost:3000/api/users\nContent-Type: application/json\n{\n  \"email\": \"invalid-email\"\n}\nHTTP 400\n[Asserts]\njsonpath(\"$.error\") contains \"invalid\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of E2E API Testing — Hurl, Bruno, HTTP Files — common patterns you'll see in production.\n// APPROACH  - Combine E2E API Testing — Hurl, Bruno, HTTP Files with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n@baseUrl = http://localhost:3000\n### Get all users (public)\nGET {{baseUrl}}/api/users HTTP/1.1\n### Login\nPOST {{baseUrl}}/api/login HTTP/1.1\nContent-Type: application/json\n{\n  \"email\": \"alice@example.com\",\n  \"password\": \"password123\"\n}\n### Create user (requires auth token from previous request)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of E2E API Testing — Hurl, Bruno, HTTP Files — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n@token = {{login.response.body.token}}\nPOST {{baseUrl}}/api/users HTTP/1.1\nAuthorization: Bearer {{token}}\nContent-Type: application/json\n{\n  \"email\": \"bob@example.com\",\n  \"name\": \"Bob\"\n}\n### Delete user\nDELETE {{baseUrl}}/api/users/1 HTTP/1.1\nAuthorization: Bearer {{token}}"
                  }
        ],
        tips: [
                  "HTTP files are version-control friendly — ideal for documentation and CI.",
                  "Hurl supports complex flows — capture values from responses, use in next request.",
                  "Bruno UI similar to Postman but saves as plain text — better for teams.",
                  "Use environment files for different configs (localhost vs staging vs prod)."
        ],
        mistake: "Using GUI-only tools (Postman) where collections can't be version-controlled.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
    ],
  },
]

export default { meta, sections }
