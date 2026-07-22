export const meta = {
  "title": "Runtime Validation & Type Testing",
  "domain": "typescript",
  "sheet": "validation",
  "icon": "✅"
}

export const sections = [

  // ── Section 1: Runtime Validation ─────────────────────────────────────────
  {
    id: "runtime-validation",
    title: "Runtime Validation",
    entries: [
      {
        id: "zod-objects",
        fn: "Zod Objects — Schema Composition",
        desc: "Build complex schemas with object composition — pick, omit, extend, merge, and partial for flexible schema reuse.",
        category: "Validation",
        subtitle: "z.object(), .pick(), .omit(), .extend(), .merge(), .partial()",
        signature: "const schema = z.object({...}); schema.pick({...})  |  schema.omit({...})  |  schema.extend({...})",
        descLong: "Zod schemas are composable. Start with a base schema, then use pick/omit to select fields, extend to add new fields, merge to combine schemas, or partial to make all fields optional. This DRY approach prevents duplicating type definitions across create/update/public variants.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Zod Objects — Schema Composition — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Zod Objects — Schema Composition — common patterns you'll see in production.\n// APPROACH  - Combine Zod Objects — Schema Composition with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst UserSchema = z.object({\n  id: z.string().uuid(),\n  name: z.string().min(2).max(100),\n  email: z.string().email(),\n  password: z.string().min(8),\n  role: z.enum(['admin', 'user', 'viewer']),\n  isActive: z.boolean().default(true),\n  createdAt: z.date(),\n  updatedAt: z.date(),\n});\nconst PublicUserSchema = UserSchema.pick({\n  id: true,\n  name: true,\n  role: true,\n  createdAt: true,\n});\n// { id, name, role, createdAt }\nconst CreateUserSchema = UserSchema.omit({\n  id: true,\n  createdAt: true,\n  updatedAt: true,\n});\n// Requires: name, email, password, role, isActive\nconst UpdateUserSchema = UserSchema.partial();\n// All fields become optional"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Zod Objects — Schema Composition — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst UpdateUserWithIdSchema = UserSchema.partial().required({ id: true });\n// Only id is required, everything else optional\nconst UserWithTimestampsSchema = UserSchema.extend({\n  lastLogin: z.date().optional(),\n  loginCount: z.number().default(0),\n});\nconst BaseEntity = z.object({\n  id: z.string().uuid(),\n  createdAt: z.date(),\n  updatedAt: z.date(),\n});\nconst UserWithEntity = BaseEntity.merge(\n  UserSchema.omit({ id: true, createdAt: true, updatedAt: true })\n);\n// Usage in APIs\nconst createUserData = CreateUserSchema.parse(req.body);\nconst updateData = UpdateUserWithIdSchema.parse(req.body);\nconst publicData = PublicUserSchema.parse(user);"
                  }
        ],
        tips: [
                  "pick() is safer than manually retyping fields — reduces errors.",
                  "omit() automatically prevents clients from setting id/timestamps — enforce server-only fields.",
                  "extend() adds fields to a schema — useful for adding optional metadata.",
                  "Compose schemas to DRY — define once, reuse for create/update/list variants."
        ],
        mistake: "Duplicating base schema properties when creating create/update schemas. Use pick/omit instead.",
        shorthand: {
          verbose: "const CreateUserSchema = z.object({\n  name: z.string(),\n  email: z.string(),\n  password: z.string(),\n  role: z.enum(['admin', 'user']),\n}); // Duplicated from UserSchema",
          concise: "const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true, updatedAt: true });",
        },
      },
      {
        id: "zod-transforms",
        fn: "Zod Transforms — Data Coercion & Transformation",
        desc: "Transform input data during parsing — coerce types, normalize strings, and convert raw data to expected formats.",
        category: "Validation",
        subtitle: ".transform(), .pipe(), .preprocess(), z.coerce",
        signature: "schema.transform(val => ...)  |  z.coerce.number()  |  z.preprocess(val => ...)",
        descLong: "Transforms modify data during validation. z.coerce.number() converts strings to numbers (essential for query params). transform() applies functions to valid data. preprocess() runs before validation. pipe() chains multiple transformations. Use these to normalize form inputs, convert dates, trim strings, and handle type mismatches from APIs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Zod Transforms — Data Coercion & Transformation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Zod Transforms — Data Coercion & Transformation — common patterns you'll see in production.\n// APPROACH  - Combine Zod Transforms — Data Coercion & Transformation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst QuerySchema = z.object({\n  page: z.coerce.number().int().positive(),\n  limit: z.coerce.number().int().default(10),\n  active: z.coerce.boolean(), // \"true\", \"1\", true all work\n});\n// Valid: ?page=1&limit=20&active=true\nconst query = QuerySchema.parse(req.query);\n// { page: 1, limit: 20, active: true }\nconst EmailSchema = z.string().email().transform(email => email.toLowerCase());\nconst result = EmailSchema.parse('ALICE@EXAMPLE.COM');\nconsole.log(result); // \"alice@example.com\"\nconst TrimmedStringSchema = z.string().transform(s => s.trim());\nconst TextSchema = z.object({\n  title: TrimmedStringSchema,\n  description: TrimmedStringSchema,\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Zod Transforms — Data Coercion & Transformation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst DateSchema = z.preprocess(\n  arg => typeof arg === 'string' ? new Date(arg) : arg,\n  z.date()\n);\nDateSchema.parse('2024-01-15'); // ✓ Valid\nDateSchema.parse(new Date()); // ✓ Valid\nconst PasswordSchema = z.string()\n  .min(8, 'Password too short')\n  .transform(pwd => pwd.trim())\n  .transform(pwd => pwd.toLowerCase())\n  .refine(pwd => /[0-9]/.test(pwd), {\n    message: 'Password must contain at least one number',\n  });\nconst UserInputSchema = z.object({\n  email: z.string().email().transform(e => e.toLowerCase()),\n  name: z.string().transform(n => n.trim()),\n  age: z.coerce.number().int().positive(),\n  birthDate: z.preprocess(\n    arg => typeof arg === 'string' ? new Date(arg) : arg,\n    z.date()\n  ),\n  bio: z.string().transform(b => b.trim()).optional(),\n});\n// Accepts: { email: \" ALICE@EX.COM \", name: \"  Alice  \", age: \"30\", birthDate: \"1994-01-15\", bio: \"  Dev  \" }\n// Returns: { email: \"alice@ex.com\", name: \"Alice\", age: 30, birthDate: Date, bio: \"Dev\" }"
                  }
        ],
        tips: [
                  "z.coerce is essential for query params and form data — always strings in URLs.",
                  "transform() runs AFTER validation — perfect for normalization.",
                  "preprocess() runs BEFORE validation — use to convert types.",
                  "Use pipe() to apply multiple transformations in sequence."
        ],
        mistake: "Forgetting z.coerce for numeric query params — they're always strings from the URL.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst age = req.query.age; const ageNum = parseInt(age, 10); // Manual conversion\n// More explicit but longer",
          concise: "const AgeSchema = z.coerce.number(); const ageNum = AgeSchema.parse(req.query.age);",
        },
      },
      {
        id: "zod-refinements",
        fn: "Zod Refinements — Custom Validation Logic",
        desc: "Add custom validation beyond built-in checks — refine() for single fields, superRefine() for cross-field validation.",
        category: "Validation",
        subtitle: ".refine(), .superRefine(), custom validators, cross-field checks",
        signature: "schema.refine(val => boolean, \"error message\")  |  schema.superRefine((val, ctx) => { ctx.addIssue(...) })",
        descLong: "refine() adds a predicate that returns true/false. superRefine() gives full control over validation context — add multiple issues, customize error paths, and validate across fields. Use for business logic validation that doesn't fit standard type checks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Zod Refinements — Custom Validation Logic — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Zod Refinements — Custom Validation Logic — common patterns you'll see in production.\n// APPROACH  - Combine Zod Refinements — Custom Validation Logic with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst PasswordSchema = z.string().min(8).refine(\n  pwd => /[A-Z]/.test(pwd),\n  \"Password must contain at least one uppercase letter\"\n).refine(\n  pwd => /[0-9]/.test(pwd),\n  \"Password must contain at least one number\"\n).refine(\n  pwd => /[!@#$%^&*]/.test(pwd),\n  \"Password must contain a special character\"\n);\nconst UserRegistrationSchema = z.object({\n  email: z.string().email(),\n  password: z.string().min(8),\n  confirmPassword: z.string(),\n}).superRefine((data, ctx) => {\n  // Cross-field validation\n  if (data.password !== data.confirmPassword) {\n    ctx.addIssue({\n      code: z.ZodIssueCode.custom,\n      path: ['confirmPassword'],\n      message: 'Passwords do not match',\n    });\n  }\n  // Business logic validation\n  if (data.email.endsWith('.test')) {\n    ctx.addIssue({\n      code: z.ZodIssueCode.custom,\n      path: ['email'],\n      message: 'Test emails are not allowed',\n    });\n  }\n});\nconst FormSchema = z.object({\n  type: z.enum(['business', 'personal']),\n  companyName: z.string().optional(),\n  personalBio: z.string().optional(),\n}).superRefine((data, ctx) => {\n  if (data.type === 'business' && !data.companyName) {\n    ctx.addIssue({\n      code: z.ZodIssueCode.custom,\n      path: ['companyName'],\n      message: 'Company name is required for business accounts',\n    });\n  }\n  if (data.type === 'personal' && !data.personalBio) {\n    ctx.addIssue({\n      code: z.ZodIssueCode.custom,\n      path: ['personalBio'],\n      message: 'Bio is required for personal accounts',\n    });\n  }\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Zod Refinements — Custom Validation Logic — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst EventSchema = z.object({\n  startDate: z.date(),\n  endDate: z.date(),\n}).superRefine((data, ctx) => {\n  if (data.endDate < data.startDate) {\n    ctx.addIssue({\n      code: z.ZodIssueCode.custom,\n      path: ['endDate'],\n      message: 'End date must be after start date',\n    });\n  }\n});\nconst EmailUniquenessSchema = z.string().email().refine(\n  async (email) => {\n    const existing = await db.users.findUnique({ where: { email } });\n    return !existing; // true if unique\n  },\n  \"Email already registered\"\n);\n// Must use parseAsync or safeParseAsync\nconst result = await EmailUniquenessSchema.parseAsync('alice@example.com');"
                  }
        ],
        tips: [
                  "refine() is simple for single-field validation — one issue per check.",
                  "superRefine() for cross-field validation — add issues to specific paths.",
                  "Async refinements query the database — perfect for uniqueness checks.",
                  "Add multiple issues in one superRefine call — better error reporting."
        ],
        mistake: "Using refine() for cross-field validation — it adds issues to the root, not specific paths. Use superRefine() instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nschema.refine(val => val.length > 5, \"Too short\").refine(val => val[0] === val[0].toUpperCase(), \"Must start with uppercase\")\n// More explicit but longer",
          concise: "schema.superRefine((val, ctx) => { if (val.length <= 5) ctx.addIssue(...); if (val[0] !== val[0].toUpperCase()) ctx.addIssue(...); })",
        },
      },
      {
        id: "zod-discriminated-union",
        fn: "Zod Discriminated Unions — Tagged Unions with Type Narrowing",
        desc: "Validate discriminated/tagged unions with z.discriminatedUnion() — better error messages, type-safe narrowing.",
        category: "Validation",
        subtitle: "z.discriminatedUnion(), tagged unions, type narrowing",
        signature: "z.discriminatedUnion(\"type\", [schema1, schema2, ...])",
        descLong: "Discriminated unions are the TypeScript way to model variants. z.discriminatedUnion() validates them efficiently with a discriminant field (type, kind, status). Errors are specific to the matching variant. TypeScript narrows the type perfectly based on the discriminant.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Zod Discriminated Unions — Tagged Unions with Type Narrowing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Zod Discriminated Unions — Tagged Unions with Type Narrowing — common patterns you'll see in production.\n// APPROACH  - Combine Zod Discriminated Unions — Tagged Unions with Type Narrowing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst MouseEvent = z.object({\n  type: z.literal('mouse'),\n  x: z.number(),\n  y: z.number(),\n  button: z.enum(['left', 'right', 'middle']),\n});\nconst KeyboardEvent = z.object({\n  type: z.literal('keyboard'),\n  key: z.string(),\n  ctrlKey: z.boolean(),\n  shiftKey: z.boolean(),\n});\nconst ScrollEvent = z.object({\n  type: z.literal('scroll'),\n  deltaY: z.number(),\n});\nconst EventSchema = z.discriminatedUnion('type', [\n  MouseEvent,\n  KeyboardEvent,\n  ScrollEvent,\n]);\ntype Event = z.infer<typeof EventSchema>;\nfunction handleEvent(event: Event) {\n  switch (event.type) {\n    case 'mouse':\n      console.log(event.button); // ✓ available\n      break;\n    case 'keyboard':\n      console.log(event.key); // ✓ available\n      break;\n    case 'scroll':\n      console.log(event.deltaY); // ✓ available\n  }\n}\nconst SuccessResponse = z.object({\n  status: z.literal('success'),\n  data: z.any(),\n  statusCode: z.literal(200),\n});\nconst ErrorResponse = z.object({\n  status: z.literal('error'),\n  error: z.string(),\n  statusCode: z.number().min(400),\n});\nconst PendingResponse = z.object({\n  status: z.literal('pending'),\n  retryAfter: z.number(),\n});\nconst ApiResponse = z.discriminatedUnion('status', [\n  SuccessResponse,\n  ErrorResponse,\n  PendingResponse,\n]);\ntype ApiResponse = z.infer<typeof ApiResponse>;\nfunction handleResponse(response: ApiResponse) {\n  if (response.status === 'success') {\n    return response.data; // Only success has data\n  } else if (response.status === 'error') {\n    throw new Error(response.error); // Only error has error message\n  } else {\n    console.log(`Retry after ${response.retryAfter}ms`);\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Zod Discriminated Unions — Tagged Unions with Type Narrowing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst result = ApiResponse.safeParse({\n  status: 'error',\n  data: 'some data', // Wrong for error variant\n  statusCode: 404,\n});\nif (!result.success) {\n  console.log(result.error.issues);\n  // Zod knows the specific variant and reports errors in context\n}\nconst UrgentOrder = z.object({\n  type: z.literal('urgent'),\n  expeditedShipping: z.boolean().default(true),\n  surcharge: z.number().positive(),\n});\nconst StandardOrder = z.object({\n  type: z.literal('standard'),\n  estimatedDays: z.number().int().positive(),\n});\nconst OrderSchema = z.discriminatedUnion('type', [\n  UrgentOrder,\n  StandardOrder,\n]);"
                  }
        ],
        tips: [
                  "Discriminant field (type, status, kind) must be a literal for each variant.",
                  "z.discriminatedUnion() is more efficient than z.union() — it uses the discriminant to pick the right schema.",
                  "TypeScript automatically narrows types in switch statements based on discriminant.",
                  "Each variant can have completely different properties — no undefined checks needed."
        ],
        mistake: "Using optional properties instead of discriminated unions: {type?: \"a\" | \"b\"; propA?: T; propB?: U}. Creates impossible states.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Event = ({type: 'mouse'; x: number; y: number} | {type: 'keyboard'; key: string}); // Manual union\n// More explicit but longer",
          concise: "const EventSchema = z.discriminatedUnion('type', [MouseEvent, KeyboardEvent]); type Event = z.infer<typeof EventSchema>;",
        },
      },
      {
        id: "zod-valibot",
        fn: "Zod & Valibot — Schema Validation with Type Inference",
        desc: "Validate data at runtime and infer TypeScript types: Zod schemas, Valibot (tree-shakeable), transforms, and API validation.",
        category: "Validation",
        subtitle: "z.object(), z.string(), z.infer, parse, safeParse, transform, v.object, v.pipe",
        signature: "const schema = z.object({ name: z.string() })  |  type T = z.infer<typeof schema>  |  schema.parse(data)",
        descLong: "TypeScript types disappear at runtime — Zod and Valibot bridge this gap by validating data and inferring types simultaneously. Zod is the most popular: define a schema once, get both runtime validation and TypeScript types. safeParse returns a discriminated union instead of throwing. transform() modifies data during parsing. Zod integrates with React Hook Form, tRPC, and most API frameworks. Valibot is the tree-shakeable alternative (90% smaller bundle) with a functional API. This is the main entry covering basic usage across both libraries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Zod & Valibot — Schema Validation with Type Inference — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Zod & Valibot — Schema Validation with Type Inference — common patterns you'll see in production.\n// APPROACH  - Combine Zod & Valibot — Schema Validation with Type Inference with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst UserSchema = z.object({\n  id: z.number().int().positive(),\n  name: z.string().min(2).max(100),\n  email: z.string().email(),\n  role: z.enum(['admin', 'user', 'viewer']),\n  age: z.number().min(13).max(150).optional(),\n  tags: z.array(z.string()).default([]),\n  metadata: z.record(z.string(), z.unknown()).optional(),\n  createdAt: z.string().datetime().transform(s => new Date(s)),\n});\n// Infer TypeScript type from schema\ntype User = z.infer<typeof UserSchema>;\n// { id: number; name: string; email: string; role: \"admin\" | \"user\" | \"viewer\"; \n//   age?: number; tags: string[]; metadata?: Record<string, unknown>; createdAt: Date }\ntry {\n  const user = UserSchema.parse(apiResponse);\n  // user is fully typed as User\n  console.log(user.name.toUpperCase());\n} catch (err) {\n  if (err instanceof z.ZodError) {\n    console.log(err.issues);\n    // [{ path: [\"email\"], message: \"Invalid email\", code: \"invalid_string\" }]\n  }\n}\nconst result = UserSchema.safeParse(apiResponse);\nif (result.success) {\n  const user = result.data;  // typed as User\n} else {\n  const errors = result.error.flatten();\n  // { fieldErrors: { email: [\"Invalid email\"], name: [\"Too short\"] } }\n}\nconst CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });\nconst UpdateUserSchema = UserSchema.partial().required({ id: true });\nconst PublicUserSchema = UserSchema.pick({ id: true, name: true, role: true });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Zod & Valibot — Schema Validation with Type Inference — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst EventSchema = z.discriminatedUnion('type', [\n  z.object({ type: z.literal('click'), x: z.number(), y: z.number() }),\n  z.object({ type: z.literal('keypress'), key: z.string() }),\n  z.object({ type: z.literal('scroll'), delta: z.number() }),\n]);\nconst ApiResponseSchema = z.object({\n  data: z.array(UserSchema),\n  pagination: z.object({\n    page: z.number(),\n    totalPages: z.number(),\n    totalItems: z.number(),\n  }),\n});\nasync function fetchUsers(): Promise<z.infer<typeof ApiResponseSchema>> {\n  const res = await fetch('/api/users');\n  const json = await res.json();\n  return ApiResponseSchema.parse(json);  // validated + typed\n}\nconst EnvSchema = z.object({\n  DATABASE_URL: z.string().url(),\n  API_KEY: z.string().min(10),\n  PORT: z.coerce.number().int().default(3000),\n  NODE_ENV: z.enum(['development', 'production', 'test']),\n});\nexport const env = EnvSchema.parse(process.env);\n// import * as v from 'valibot';\n// const UserSchema = v.object({\n//   name: v.pipe(v.string(), v.minLength(2)),\n//   email: v.pipe(v.string(), v.email()),\n//   role: v.picklist(['admin', 'user']),\n// });\n// type User = v.InferOutput<typeof UserSchema>;\n// const result = v.safeParse(UserSchema, data);"
                  }
        ],
        tips: [
                  "z.infer<typeof Schema> gives you the TypeScript type — define the schema once, never write the type manually.",
                  "safeParse() is preferred over parse() in API handlers — it returns { success, data, error } instead of throwing.",
                  ".flatten() on ZodError gives { fieldErrors: { field: [\"messages\"] } } — perfect for form error display.",
                  "z.coerce.number() converts strings to numbers — essential for env vars and query params which are always strings."
        ],
        mistake: "Defining TypeScript types AND Zod schemas separately — they drift apart over time. Define the Zod schema first, then infer the type with z.infer. Single source of truth.",
        shorthand: {
          verbose: "interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n// Later, schema doesn't match type... oops!",
          concise: "const UserSchema = z.object({ id: z.number(), name: z.string(), ... }); type User = z.infer<typeof UserSchema>",
        },
      },
      {
        id: "valibot-basics",
        fn: "Valibot — Lightweight Schema Validation",
        desc: "Tree-shakeable Zod alternative with a functional API — 90% smaller bundle, same validation patterns, pipe-based composition.",
        category: "Validation",
        subtitle: "v.object(), v.string(), parse/safeParse, v.pipe(), Valibot validators",
        signature: "const schema = v.object({...}); v.parse(schema, data)  |  v.safeParse(schema, data)",
        descLong: "Valibot is like Zod but with a functional, pipe-based API. Each validator is a pure function. Only import what you use — tree-shakeable by design. Bundle is ~4KB vs Zod's ~30KB. Perfect for libraries and bundle-size-conscious apps. Validation patterns are the same as Zod, just syntax changes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Valibot — Lightweight Schema Validation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport * as v from 'valibot';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Valibot — Lightweight Schema Validation — common patterns you'll see in production.\n// APPROACH  - Combine Valibot — Lightweight Schema Validation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst UserSchema = v.object({\n  id: v.pipe(v.string(), v.uuid()),\n  name: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),\n  email: v.pipe(v.string(), v.email()),\n  age: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(150))),\n  role: v.picklist(['admin', 'user', 'viewer']),\n  tags: v.optional(v.array(v.string()), []),\n});\ntype User = v.InferOutput<typeof UserSchema>;\ntry {\n  const user = v.parse(UserSchema, apiResponse);\n} catch (err) {\n  console.error(v.flatten(err));\n}\nconst result = v.safeParse(UserSchema, apiResponse);\nif (result.success) {\n  const user = result.output;\n} else {\n  const issues = v.flatten(result.issues);\n  // { nested: { email: [\"Invalid email\"] } }\n}\nconst TrimmedEmail = v.pipe(\n  v.string(),\n  v.trim(),\n  v.toLowerCase(),\n  v.email()\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Valibot — Lightweight Schema Validation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst EventSchema = v.union([\n  v.object({ type: v.literal('click'), x: v.number(), y: v.number() }),\n  v.object({ type: v.literal('keypress'), key: v.string() }),\n  v.object({ type: v.literal('scroll'), delta: v.number() }),\n]);\ntype Event = v.InferOutput<typeof EventSchema>;\nconst PasswordSchema = v.pipe(\n  v.string(),\n  v.minLength(8),\n  v.check(pwd => /[A-Z]/.test(pwd), 'Must have uppercase'),\n  v.check(pwd => /[0-9]/.test(pwd), 'Must have number')\n);\n// If migrating from Zod, you can use the same concepts:\n// z.object({...}) → v.object({...})\n// z.string().min(2) → v.pipe(v.string(), v.minLength(2))\n// z.infer<T> → v.InferOutput<T>"
                  }
        ],
        tips: [
                  "Valibot is pure functional — no methods, all composed with v.pipe().",
                  "v.pipe() chains validators left to right — same as composition.",
                  "Only ~4KB gzipped vs 30KB for Zod — major bundle savings.",
                  "v.InferOutput<typeof schema> gives the validated output type (vs z.infer)."
        ],
        mistake: "Using method chains like Zod when Valibot uses pipes — every validator must be in v.pipe().",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst schema = v.object({ email: v.pipe(v.string(), v.email(), v.trim()) }); type T = v.InferOutput<typeof schema>\n// More explicit but longer",
          concise: "// Valibot: functional pipe-based validators, tree-shakeable, ~4KB bundle",
        },
      },
      {
        id: "typebox-basics",
        fn: "TypeBox — JSON Schema Validation",
        desc: "TypeScript schemas that compile to JSON Schema — runtime validation + OpenAPI/TypeScript schema generation.",
        category: "Validation",
        subtitle: "Type<T>, Static<T>, TypeBox validators, JSON Schema generation",
        signature: "const schema = Type.Object({...}); type T = Static<typeof schema>; const validate = TypeCompile(schema)",
        descLong: "TypeBox generates JSON Schema from TypeScript types. Schemas are portable (JSON), work with OpenAPI/Swagger, and validate at runtime. Compile a schema to a fast validator function. Perfect for APIs that need to expose their schemas, or when you need both JSON Schema and TypeScript types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of TypeBox — JSON Schema Validation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { Type, Static, TypeCompile, TypeCheck } from '@sinclair/typebox';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of TypeBox — JSON Schema Validation — common patterns you'll see in production.\n// APPROACH  - Combine TypeBox — JSON Schema Validation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst UserType = Type.Object({\n  id: Type.String({ format: 'uuid' }),\n  name: Type.String({ minLength: 2, maxLength: 100 }),\n  email: Type.String({ format: 'email' }),\n  age: Type.Optional(Type.Integer({ minimum: 0, maximum: 150 })),\n  role: Type.Union([\n    Type.Literal('admin'),\n    Type.Literal('user'),\n    Type.Literal('viewer'),\n  ]),\n  isActive: Type.Boolean({ default: true }),\n  tags: Type.Array(Type.String(), { default: [] }),\n});\ntype User = Static<typeof UserType>;\n// Perfect alignment with JSON Schema\nconst ValidateUser = TypeCompile(UserType);\nconst data = { id: '...', name: 'Alice', email: 'alice@example.com', role: 'user' };\nconst valid = ValidateUser(data);\nif (!valid) {\n  const errors = ValidateUser.errors;\n  console.log([...errors]); // Full error details\n}\nconst SuccessResponse = Type.Object({\n  status: Type.Literal('success'),\n  data: Type.Unknown(),\n});\nconst ErrorResponse = Type.Object({\n  status: Type.Literal('error'),\n  message: Type.String(),\n});\nconst ApiResponse = Type.Union([SuccessResponse, ErrorResponse], { discriminantKey: 'status' });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of TypeBox — JSON Schema Validation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst schema = UserType; // Can be serialized to JSON\nconst jsonSchema = JSON.stringify(schema);\n// Perfect for:\n// - OpenAPI documentation\n// - JSON Schema repositories\n// - Runtime validation in APIs\n// - Contract-first development\nconst CreateUserType = Type.Omit(UserType, ['id']);\nconst UpdateUserType = Type.Partial(UserType);\nconst UsersType = Type.Array(UserType);\nconst UserMapType = Type.Record(Type.String(), UserType);\n// Validate at runtime\nconst ValidateUsers = TypeCompile(UsersType);\nconst users = [...];\nif (ValidateUsers(users)) {\n  // Type safe and validated\n}"
                  }
        ],
        tips: [
                  "JSON Schema is portable — use with OpenAPI, swagger, other tools.",
                  "TypeCompile() creates a fast validator — much faster than parsing.",
                  "Static<T> extracts TypeScript type from JSON Schema definition.",
                  "Schemas are JSON-serializable — perfect for documenting APIs."
        ],
        mistake: "Maintaining separate TypeScript types and JSON schemas — TypeBox generates both from one definition.",
        shorthand: {
          verbose: "// Manual / verbose approach\ninterface User { id: string; name: string; } // TypeScript\nconst userJsonSchema = { type: \"object\", properties: {...} }; // JSON Schema (duplicated!)\n// More explicit but longer",
          concise: "const UserType = Type.Object({...}); type User = Static<typeof UserType>;",
        },
      },
      {
        id: "type-assertions",
        fn: "Type Assertion Functions — Asserts Pattern",
        desc: "Runtime guard functions with asserts keyword — throw on bad data, narrow types for following code.",
        category: "Validation",
        subtitle: "asserts x is T, type predicates, narrowing, throw pattern",
        signature: "function assertIsUser(data: unknown): asserts data is User { ... }",
        descLong: "Type assertion functions (asserts x is T) validate data and narrow types. Throw if invalid, return normally if valid. TypeScript knows the type is narrowed after the assertion. Cleaner than try-catch for APIs that expect validation to succeed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type Assertion Functions — Asserts Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nfunction assertIsString(value: unknown): asserts value is string {\n  if (typeof value !== 'string') {\n    throw new TypeError(`Expected string, got ${typeof value}`);\n  }\n}\nfunction processString(input: unknown) {\n  assertIsString(input); // If throws, function exits\n  console.log(input.toUpperCase()); // input is now string\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type Assertion Functions — Asserts Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Type Assertion Functions — Asserts Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction isUser(obj: unknown): obj is User {\n  return (\n    typeof obj === 'object' &&\n    obj !== null &&\n    'id' in obj &&\n    'name' in obj &&\n    'email' in obj &&\n    typeof (obj as any).id === 'string' &&\n    typeof (obj as any).name === 'string' &&\n    typeof (obj as any).email === 'string'\n  );\n}\nfunction assertIsUser(data: unknown): asserts data is User {\n  if (!isUser(data)) {\n    throw new Error('Invalid user object');\n  }\n}\nfunction getUser(id: string) {\n  const apiResponse = await fetch(`/api/users/${id}`);\n  const data = await apiResponse.json(); // unknown type\n  assertIsUser(data); // Throws if invalid\n  // From here, data is User\n  console.log(data.email); // ✓ TypeScript knows email exists\n}\nfunction processUserData(raw: unknown) {\n  assertIsObject(raw);\n  assertHasProperty(raw, 'user');\n  assertIsUser(raw.user);\n  // Now raw is { user: User } with full type safety\n}\nfunction assertIsObject(value: unknown): asserts value is Record<string, unknown> {\n  if (typeof value !== 'object' || value === null) {\n    throw new TypeError('Expected object');\n  }\n}\nfunction assertHasProperty<K extends PropertyKey>(\n  obj: unknown,\n  prop: K\n): asserts obj is Record<K, unknown> {\n  if (!(prop in (obj as any))) {\n    throw new Error(`Missing property: ${String(prop)}`);\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type Assertion Functions — Asserts Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype Result = { success: true; data: string } | { success: false; error: Error };\nfunction assertSuccess(result: Result): asserts result is { success: true; data: string } {\n  if (!result.success) {\n    throw result.error;\n  }\n}\nfunction handleResult(result: Result) {\n  assertSuccess(result); // Throws if not success\n  console.log(result.data); // result.success is narrowed to true\n}\nclass ValidationError extends Error {\n  constructor(public violations: string[]) {\n    super(`Validation failed: ${violations.join(', ')}`);\n  }\n}\nfunction assertValidUser(data: unknown): asserts data is User {\n  const errors: string[] = [];\n  if (typeof (data as any)?.email !== 'string' || !(data as any).email.includes('@')) {\n    errors.push('Invalid email');\n  }\n  if (typeof (data as any)?.name !== 'string' || (data as any).name.length < 2) {\n    errors.push('Name too short');\n  }\n  if (errors.length > 0) {\n    throw new ValidationError(errors);\n  }\n}"
                  }
        ],
        tips: [
                  "asserts x is T narrows the type for code after the assertion.",
                  "Throw immediately if validation fails — don't return anything.",
                  "Use with APIs where you expect data to be valid — simpler than try-catch.",
                  "Combine multiple assertions for step-by-step narrowing."
        ],
        mistake: "Returning a boolean instead of throwing — use asserts, not type predicates, for runtime validation.",
        shorthand: {
          verbose: "function processString(input: unknown) {\n  if (typeof input !== 'string') throw new Error('Not a string');\n  const upper = input.toUpperCase();\n}",
          concise: "function assertIsString(value: unknown): asserts value is string { if (typeof value !== 'string') throw new Error('Not a string'); }\nfunction processString(input: unknown) { assertIsString(input); input.toUpperCase(); }",
        },
      },
      {
        id: "class-validator",
        fn: "class-validator — Decorator-Based Validation",
        desc: "Validate objects with decorators — @IsEmail, @Length, @ValidateNested for complex nested objects.",
        category: "Validation",
        subtitle: "@IsEmail, @IsNotEmpty, @Length, @ValidateNested, @IsEnum, validate()",
        signature: "@IsEmail() email: string;  |  await validate(object)",
        descLong: "class-validator uses decorators to define validation rules on class properties. Works with class-transformer for serialization. Popular in NestJS and other frameworks. Excellent for DTOs (Data Transfer Objects). Async validators and cross-property validation with custom decorators.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of class-validator — Decorator-Based Validation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { validate, IsEmail, IsNotEmpty, Length, ValidateNested, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';\nimport { Type } from 'class-transformer';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of class-validator — Decorator-Based Validation — common patterns you'll see in production.\n// APPROACH  - Combine class-validator — Decorator-Based Validation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass CreateUserDto {\n  @IsNotEmpty()\n  @Length(2, 100)\n  name: string;\n  @IsEmail()\n  email: string;\n  @IsNotEmpty()\n  @Length(8, 50)\n  password: string;\n  @IsEnum(['admin', 'user', 'viewer'])\n  role: 'admin' | 'user' | 'viewer';\n  @IsOptional()\n  @IsInt()\n  @Min(0)\n  @Max(150)\n  age?: number;\n}\nclass AddressDto {\n  @IsNotEmpty()\n  street: string;\n  @IsNotEmpty()\n  city: string;\n  @IsNotEmpty()\n  country: string;\n}\nclass CreateUserWithAddressDto {\n  @IsNotEmpty()\n  name: string;\n  @IsEmail()\n  email: string;\n  @ValidateNested()\n  @Type(() => AddressDto)\n  address: AddressDto;\n}\nasync function validateUser(data: unknown) {\n  const dto = Object.assign(new CreateUserDto(), data);\n  const errors = await validate(dto);\n  if (errors.length > 0) {\n    console.log('Validation failed:', errors);\n    // [ValidationError {\n    //   property: 'email',\n    //   constraints: { isEmail: 'email must be an email' }\n    // }]\n    return null;\n  }\n  return dto; // Valid and typed\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of class-validator — Decorator-Based Validation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nimport { ValidatorConstraint, ValidatorOptions, registerDecorator } from 'class-validator';\n@ValidatorConstraint({ name: 'isPasswordStrong', async: false })\nexport class IsPasswordStrongConstraint {\n  validate(password: string): boolean {\n    return /[A-Z]/.test(password) && /[0-9]/.test(password);\n  }\n  defaultMessage(): string {\n    return 'Password must contain uppercase and number';\n  }\n}\nfunction IsPasswordStrong(options?: ValidatorOptions) {\n  return function(target: Object, propertyName: string) {\n    registerDecorator({\n      target: target.constructor,\n      propertyName: propertyName,\n      constraints: [],\n      options: options,\n      validator: IsPasswordStrongConstraint,\n    });\n  };\n}\nclass UserWithStrongPassword {\n  @IsPasswordStrong()\n  password: string;\n}\n// @Post('/users')\n// async createUser(@Body() createUserDto: CreateUserDto) {\n//   const errors = await validate(createUserDto);\n//   if (errors.length > 0) {\n//     throw new BadRequestException('Validation failed');\n//   }\n//   return this.userService.create(createUserDto);\n// }"
                  }
        ],
        tips: [
                  "@Type() from class-transformer is needed to transform nested objects.",
                  "@ValidateNested() recursively validates nested objects.",
                  "await validate(dto) returns all errors — handle them in one place.",
                  "Custom decorators let you enforce business logic validation."
        ],
        mistake: "Forgetting @Type(() => NestedDto) on nested properties — transforms won't work.",
        shorthand: {
          verbose: "// Manual / verbose approach\nclass UserDto { email: string; name: string; } // No validation\nconst user = plainToClass(UserDto, data);\n// More explicit but longer",
          concise: "class UserDto { @IsEmail() email: string; @IsNotEmpty() name: string; } const errors = await validate(user);",
        },
      },
      {
        id: "io-ts-basics",
        fn: "io-ts — Codec-Based Runtime Type Checking",
        desc: "Functional approach to validation — codecs define encode/decode, composable, functional error handling with Either.",
        category: "Validation",
        subtitle: "t.type(), t.union(), decode(), Either, codec composition",
        signature: "const schema = t.type({...}); schema.decode(data)",
        descLong: "io-ts uses codecs — bidirectional serializers. Each codec knows how to decode (validate) and encode (serialize). Heavily functional with Either for error handling. More powerful than Zod for complex transformations and serialization. Popular in fp-ts ecosystem.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of io-ts — Codec-Based Runtime Type Checking — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport * as t from 'io-ts';\nimport * as E from 'fp-ts/Either';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of io-ts — Codec-Based Runtime Type Checking — common patterns you'll see in production.\n// APPROACH  - Combine io-ts — Codec-Based Runtime Type Checking with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst User = t.type({\n  id: t.string,\n  name: t.string,\n  email: t.string,\n  age: t.optional(t.number),\n  role: t.union([\n    t.literal('admin'),\n    t.literal('user'),\n    t.literal('viewer'),\n  ]),\n});\ntype User = t.TypeOf<typeof User>;\nconst data = { id: '1', name: 'Alice', email: 'alice@example.com', role: 'user' };\nconst result = User.decode(data);\nif (E.isRight(result)) {\n  const user = result.right; // Valid user\n} else {\n  const errors = result.left; // Validation errors\n}\nfunction getUserFromApi(url: string): Promise<E.Either<Error, User>> {\n  return fetch(url)\n    .then(r => r.json())\n    .then(data => User.decode(data))\n    .then(result => {\n      if (E.isRight(result)) {\n        return E.right(result.right);\n      } else {\n        return E.left(new Error('Invalid user data'));\n      }\n    });\n}\nconst Address = t.type({\n  street: t.string,\n  city: t.string,\n  country: t.string,\n});\nconst UserWithAddress = t.intersection([User, t.type({ address: Address })]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of io-ts — Codec-Based Runtime Type Checking — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst PositiveNumber = t.refinement(t.number, (n): n is number => n > 0, 'positive');\nconst Product = t.type({\n  id: t.string,\n  name: t.string,\n  price: PositiveNumber,\n});\nconst DateFromString = new t.Type<Date, string, string>(\n  'DateFromString',\n  (u): u is Date => u instanceof Date,\n  (u, c) =>\n    typeof u === 'string'\n      ? E.tryCatch(() => new Date(u), () => t.failure(u, c))\n      : t.failure(u, c),\n  (a) => a.toISOString()\n);\nconst Event = t.type({\n  name: t.string,\n  date: DateFromString,\n});\nconst Users = t.array(User);\nconst Response = t.union([\n  t.type({ status: t.literal('success'), data: User }),\n  t.type({ status: t.literal('error'), message: t.string }),\n]);\nasync function handleUserRequest(json: unknown): Promise<E.Either<string, User>> {\n  return E.chainW(\n    (data) => User.decode(data),\n    (err) => E.left(`Validation error: ${JSON.stringify(err)}`)\n  )(E.right(json));\n}"
                  }
        ],
        tips: [
                  "Either<E, T> is Either error or success — functional error handling.",
                  "E.isRight() checks if decode succeeded — pattern match on Either.",
                  "Codecs are composable — build complex validators from simpler ones.",
                  "Perfect for APIs where encoding/decoding are important (JSON-LD, HAL, etc)."
        ],
        mistake: "Not using Either — decode returns Either, must pattern match on it.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst result = User.decode(data); const user = result.right; // Unsafe, might be left!\n// More explicit but longer",
          concise: "const result = User.decode(data); if (E.isRight(result)) { const user = result.right; }",
        },
      },
      {
        id: "branded-types",
        fn: "Branded Types — Nominal Type Safety",
        desc: "Prevent mixing different types — UserId vs string, Email vs string with compile-time checks.",
        category: "Validation",
        subtitle: "type Brand = T & {__brand: ...}, nominal typing, type safety",
        signature: "type UserId = string & { readonly __brand: \"UserId\" }",
        descLong: "Branded types (nominal types) prevent invalid type substitutions. A UserId can't be passed where a string is expected. The __brand field is never at runtime but exists at compile time. Essential for making invalid states unrepresentable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Branded Types — Nominal Type Safety — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype UserId = string & { readonly __brand: 'UserId' };\ntype Email = string & { readonly __brand: 'Email' };\ntype ProductId = string & { readonly __brand: 'ProductId' };"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Branded Types — Nominal Type Safety — common patterns you'll see in production.\n// APPROACH  - Combine Branded Types — Nominal Type Safety with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction UserId(id: string): UserId {\n  // Validate if needed\n  if (!id || id.length === 0) {\n    throw new Error('Invalid UserId');\n  }\n  return id as UserId;\n}\nfunction Email(email: string): Email {\n  if (!email.includes('@')) {\n    throw new Error('Invalid email');\n  }\n  return email as Email;\n}\nfunction deleteUser(id: UserId): Promise<void> {\n  // id is definitely a UserId, not any string\n  return fetch(`/api/users/${id}`, { method: 'DELETE' });\n}\nfunction sendEmail(email: Email, subject: string): Promise<void> {\n  return fetch('/api/email', {\n    method: 'POST',\n    body: JSON.stringify({ to: email, subject }),\n  });\n}\nconst userId = UserId('user-123');\nconst email = Email('alice@example.com');\nconst randomString = 'some-random-id';\ndeleteUser(userId); // ✓ OK\n// deleteUser(randomString); // ✗ Error: string is not UserId\n// deleteUser(email); // ✗ Error: Email is not UserId\nsendEmail(email, 'Hello'); // ✓ OK\n// sendEmail(randomString, 'Hello'); // ✗ Error: string is not Email\ntype Port = number & { readonly __brand: 'Port' };\nfunction Port(num: number): Port {\n  if (num < 0 || num > 65535) {\n    throw new Error('Invalid port number');\n  }\n  return num as Port;\n}\nfunction startServer(port: Port): void {\n  // Port is guaranteed to be 0-65535\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Branded Types — Nominal Type Safety — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype UserIdSet = Set<UserId>;\ntype EmailList = Email[];\nfunction notifyUsers(emails: EmailList): Promise<void> {\n  return Promise.all(\n    emails.map(email => sendEmail(email, 'Notification'))\n  ).then(() => {});\n}\nfunction getUserIdValue(id: UserId): string {\n  // Just extract, no conversion needed\n  return id;\n}\nimport { z } from 'zod';\nconst UserIdSchema = z.string().transform((id): UserId => UserId(id));\nconst EmailSchema = z.string().email().transform((e): Email => Email(e));\nconst UserSchema = z.object({\n  id: UserIdSchema,\n  email: EmailSchema,\n  name: z.string(),\n});\ntype User = z.infer<typeof UserSchema>;\n// { id: UserId, email: Email, name: string }\ntype Tagged<T, Brand extends string> = T & { readonly __brand: Brand };\ntype Url = Tagged<string, 'Url'>;\ntype Uuid = Tagged<string, 'Uuid'>;\ntype Json = Tagged<string, 'Json'>;\nfunction parseJson(json: Json): any {\n  return JSON.parse(json);\n}"
                  }
        ],
        tips: [
                  "Constructor function validates and brands the value — make it throw or return null.",
                  "Branded types are zero-cost — the __brand exists only in types, not runtime.",
                  "Use with Zod/Valibot .transform() to create validated branded values.",
                  "Generic branded types reduce duplication — Tag<string, \"MyType\">."
        ],
        mistake: "Using string everywhere, manually tracking which strings are what — use branded types instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nfunction deleteUser(userId: string) { // Could be any string, risky }\nfunction createPost(userId: string, authorId: string) { // Easy to pass wrong string }\n// More explicit but longer",
          concise: "type UserId = string & { readonly __brand: 'UserId' };\nfunction deleteUser(userId: UserId) { }\nfunction createPost(userId: UserId, authorId: UserId) { } // Type-safe",
        },
      },
    ],
  },

  // ── Section 2: Type-Level Testing & Performance ─────────────────────────────────────────
  {
    id: "type-testing",
    title: "Type-Level Testing & Performance",
    entries: [
      {
        id: "type-tests",
        fn: "Type-Level Testing & Avoiding Slow Types",
        desc: "Test that types are correct at compile time, benchmark type performance, and avoid common type system pitfalls.",
        category: "Testing",
        subtitle: "expectTypeOf, Expect, Equal, tsd, @ts-expect-error, type performance",
        signature: "expectTypeOf(fn).toBeCallableWith(args)  |  type Assert = Expect<Equal<A, B>>",
        descLong: "Type-level tests verify that your types behave correctly — essential for libraries and shared type utilities. vitest has built-in expectTypeOf() for asserting types. tsd is a standalone type-testing tool. @ts-expect-error documents expected type errors. For type performance: avoid deep recursive types, prefer interfaces over type intersections for objects, and use --generateTrace to identify slow types. The TypeScript compiler slows down with deeply nested conditional types, large unions (>25 members), and excessive mapped types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type-Level Testing & Avoiding Slow Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { expectTypeOf, describe, it } from 'vitest';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type-Level Testing & Avoiding Slow Types — common patterns you'll see in production.\n// APPROACH  - Combine Type-Level Testing & Avoiding Slow Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ndescribe('API types', () => {\n  it('fetchUser returns correct type', () => {\n    expectTypeOf(fetchUser).toBeCallableWith(123);\n    expectTypeOf(fetchUser).returns.resolves.toEqualTypeOf<User>();\n    // Parameter types\n    expectTypeOf(fetchUser).parameter(0).toBeNumber();\n    // Not callable with wrong types\n    // @ts-expect-error — string id should fail\n    expectTypeOf(fetchUser).toBeCallableWith('abc');\n  });\n  it('UserSchema infers correct type', () => {\n    type Inferred = z.infer<typeof UserSchema>;\n    expectTypeOf<Inferred>().toHaveProperty('name');\n    expectTypeOf<Inferred['role']>().toEqualTypeOf<'admin' | 'user' | 'viewer'>();\n    expectTypeOf<Inferred['age']>().toEqualTypeOf<number | undefined>();\n  });\n});\n// For non-Vitest projects, use these type-level assertions:\ntype Expect<T extends true> = T;\ntype Equal<X, Y> =\n  (<T>() => T extends X ? 1 : 2) extends\n  (<T>() => T extends Y ? 1 : 2) ? true : false;\n// Compile-time assertions (no runtime code)\ntype _test1 = Expect<Equal<ReturnType<typeof add>, number>>;\ntype _test2 = Expect<Equal<Parameters<typeof greet>, [string, boolean?]>>;\ntype _test3 = Expect<Equal<User['role'], 'admin' | 'user' | 'viewer'>>;\n// @ts-expect-error documents intentional type errors\n// @ts-expect-error — readonly should prevent mutation\nconst config: Readonly<Config> = {};\nconfig.port = 3000;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type-Level Testing & Avoiding Slow Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// BAD: Deep recursive type (slows compiler)\n// type DeepPartial<T> = T extends object\n//   ? { [K in keyof T]?: DeepPartial<T[K]> }\n//   : T;\n// GOOD: Use interface extends (faster than intersections)\ninterface UserWithPosts extends User {\n  posts: Post[];\n}\n// BAD: Large intersection chains (slow)\n// type Big = A & B & C & D & E & F & G & H;\n// GOOD: Single interface (merged at definition)\n// interface Big extends A, B, C, D, E, F, G, H {}\n// tsconfig.json (root)\n// {\n//   \"references\": [\n//     { \"path\": \"packages/shared\" },\n//     { \"path\": \"packages/web\" },\n//     { \"path\": \"packages/api\" }\n//   ]\n// }\n//\n// packages/shared/tsconfig.json\n// {\n//   \"compilerOptions\": { \"composite\": true, \"outDir\": \"dist\" },\n//   \"include\": [\"src\"]\n// }\n//\n// packages/web/tsconfig.json\n// {\n//   \"compilerOptions\": { \"outDir\": \"dist\" },\n//   \"references\": [{ \"path\": \"../shared\" }]\n// }\n// Build: tsc --build (incremental, only recompiles changed packages)"
                  }
        ],
        tips: [
                  "expectTypeOf() in Vitest is the easiest way to test types — no extra setup, runs alongside your regular tests.",
                  "@ts-expect-error on the line ABOVE documents that a type error is intentional — useful for testing that invalid inputs are rejected.",
                  "Prefer interface over type for object shapes — interfaces are faster for the compiler and produce better error messages.",
                  "tsc --generateTrace outputs a Chrome trace file showing where the compiler spends time — essential for debugging slow builds."
        ],
        mistake: "Using // @ts-ignore instead of // @ts-expect-error — ts-ignore silently suppresses any error forever. @ts-expect-error fails if the error is FIXED, catching stale suppressions.",
        shorthand: {
          verbose: "// Suppresses error silently forever\n// @ts-ignore\nconst x: string = 123;",
          concise: "// @ts-expect-error: type error description; expectTypeOf<T>().toEqual<U>(); Vitest tests types",
        },
      },
    ],
  },
]

export default { meta, sections }
