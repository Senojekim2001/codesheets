export const meta = {
  "title": "Observability",
  "domain": "nodejs",
  "sheet": "observability",
  "icon": "🔭"
}

export const sections = [

  // ── Section 1: Structured Logging — Pino, Winston, log levels ─────────────────────────────────────────
  {
    id: "structured-logging",
    title: "Structured Logging — Pino, Winston, log levels",
    entries: [
      {
        id: "pino-logging",
        fn: "pino — fast structured logging",
        desc: "pino is the fastest Node.js logger — outputs newline-delimited JSON with minimal overhead. Use it for structured logs that log aggregators (Loki, ELK, Datadog) can parse without regex.",
        category: "Structured Logging",
        subtitle: "pino({ level }), logger.info(), child loggers, serializers, transports, pretty-print",
        signature: "const pino = require('pino'); const logger = pino({ level: 'info' }); logger.info({ userId: 42 }, 'user logged in')",
        descLong: "pino produces JSON log lines at ~2x the speed of Winston. Each log entry is a single JSON object with timestamp, level, message, and custom fields. Child loggers bind context (requestId, userId) that appears in every downstream log line — no manual merging. Transports run in a worker thread to avoid blocking the event loop. Use serializers to control how complex objects (req, res, err) are stringified.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Log structured JSON with pino instead of console.log.\n// APPROACH  - pino({ level }) creates a logger; .info/.error/.warn emit JSON.\n// STRENGTHS - JSON output; fast; child loggers for context.\n// WEAKNESSES- Raw JSON is hard to read in dev — use pino-pretty for that.\n//\nimport pino from 'pino';\n\nconst logger = pino({ level: 'info' });\n\nlogger.info('server started');\n// {\"level\":30,\"time\":1700000000000,\"pid\":1,\"hostname\":\"app-1\",\"msg\":\"server started\"}\n\nlogger.info({ userId: 42, action: 'login' }, 'user logged in');\n// {\"level\":30,\"time\":...,\"userId\":42,\"action\":\"login\",\"msg\":\"user logged in\"}\n\nlogger.error({ err }, 'database connection failed');\n// {\"level\":50,\"time\":...,\"err\":{\"type\":\"ConnectionError\",\"message\":\"...\",\"stack\":\"...\"},\"msg\":\"...\"}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Per-request child loggers with request ID; serializers for\n//             req/res/err; pretty-print in dev, JSON in prod.\n// APPROACH  - logger.child() binds requestId; serializers control object output;\n//             pino-pretty only in development.\n// STRENGTHS - Every log line includes requestId — traceable in log aggregator.\n// WEAKNESSES- Child logger holds references — don't store in long-lived objects.\n//\nimport pino from 'pino';\n\nconst logger = pino({\n  level: process.env.LOG_LEVEL || 'info',\n  transport: process.env.NODE_ENV === 'development'\n    ? { target: 'pino-pretty', options: { colorize: true } }\n    : undefined,\n  serializers: {\n    req(req) {\n      return { method: req.method, url: req.url, headers: { 'user-agent': req.headers['user-agent'] } };\n    },\n    err(err) {\n      return { type: err.constructor.name, message: err.message, stack: err.stack };\n    },\n  },\n});\n\n// Express middleware — child logger per request\nfunction requestLogger(req, res, next) {\n  const requestId = req.headers['x-request-id'] || crypto.randomUUID();\n  req.log = logger.child({ requestId, userId: req.user?.id });\n  req.log.info({ req }, 'incoming request');\n  res.on('finish', () => {\n    req.log.info({ res: { statusCode: res.statusCode } }, 'request completed');\n  });\n  next();\n}\n\n// Usage in a route\napp.get('/api/users/:id', requestLogger, async (req, res) => {\n  req.log.info('fetching user');\n  const user = await db.users.findById(req.params.id);\n  req.log.info({ userFound: !!user }, 'user lookup result');\n  res.json(user);\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Production logging: async transports, log sampling, redaction\n//             of sensitive fields, and correlation with distributed tracing.\n// APPROACH  - pino.transport() for non-blocking file/HTTP output; redact paths\n//             for PII; sampling for high-frequency logs; trace context injection.\n// STRENGTHS - Non-blocking; PII-safe; traceable; sampled to control volume.\n// WEAKNESSES- Transport worker adds complexity; sampling loses some logs.\n//\nimport pino from 'pino';\n\nconst logger = pino({\n  level: 'info',\n  redact: {\n    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token', '*.ssn'],\n    censor: '[REDACTED]',\n  },\n  transport: {\n    pipeline: [\n      // Sample debug logs at 10% in production\n      { target: 'pino-sampling', options: { rate: 0.1, levels: ['debug'] } },\n      // Write to file + send to Loki\n      { target: 'pino/file', options: { destination: '/var/log/app.log' } },\n      { target: 'pino-loki', options: { host: 'http://loki:3100', labels: { app: 'api' } } },\n    ],\n  },\n  formatters: {\n    level(name) {\n      return { level: name };  // use string levels instead of numbers\n    },\n    log(object) {\n      // Inject OpenTelemetry trace context\n      const span = api.trace.getSpan(api.context.active());\n      if (span) {\n        const ctx = span.spanContext();\n        return { ...object, traceId: ctx.traceId, spanId: ctx.spanId };\n      }\n      return object;\n    },\n  },\n});\n\n// Structured error logging with full context\nfunction logError(err, req, extra = {}) {\n  logger.error({\n    err: { type: err.constructor.name, message: err.message, stack: err.stack },\n    req: { method: req.method, url: req.url, requestId: req.requestId },\n    ...extra,\n  }, 'unhandled error');\n}"
                  }
        ],
        tips: [
                  "Use child loggers for request-scoped context — every log line gets requestId automatically.",
                  "Always use serializers for req/res/err — prevents huge circular objects in logs.",
                  "Use pino-pretty in dev only — it adds overhead and breaks JSON parsing in prod.",
                  "Redact sensitive fields (authorization, cookie, password) at the logger level, not per-call.",
                  "Log levels: trace < debug < info < warn < error < fatal — set LOG_LEVEL via env var."
        ],
        mistake: "Using console.log in production — it writes to stdout without structure, timestamps, or levels. Log aggregators can't parse it. Always use pino or Winston.",
        shorthand: {
          verbose: "import pino from 'pino';\nconst log = pino({ level: 'info' });\nlog.info({ userId: 42 }, 'user logged in');",
          concise: "const log = pino(); log.info({ userId: 42 }, 'login');",
        },
      },
      {
        id: "winston-logging",
        fn: "winston — transports, formats, log rotation",
        desc: "winston is the most popular Node.js logger — supports multiple transports (console, file, HTTP), custom formats, and log rotation. More feature-rich than pino but slower.",
        category: "Structured Logging",
        subtitle: "winston.createLogger(), transports, format.combine, DailyRotateFile, levels",
        signature: "const logger = winston.createLogger({ level: 'info', format: format.json(), transports: [...] })",
        descLong: "winston uses a transport-based architecture: each log entry is sent to all configured transports (console, file, HTTP, database). Formats control how entries are rendered (JSON, printf, colorize). DailyRotateFile transport handles log rotation by date/size. winston is more flexible than pino for multi-transport setups but 2-3x slower due to its synchronous formatting pipeline.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Log to console and file with winston.\n// APPROACH  - createLogger with Console + File transports; JSON format.\n// STRENGTHS - Multi-transport; familiar API; large ecosystem.\n// WEAKNESSES- Slower than pino; format pipeline is synchronous.\n//\nimport winston from 'winston';\n\nconst logger = winston.createLogger({\n  level: 'info',\n  format: winston.format.json(),\n  transports: [\n    new winston.transports.Console(),\n    new winston.transports.File({ filename: 'app.log' }),\n  ],\n});\n\nlogger.info('server started');\nlogger.error({ message: 'DB error', code: 'ECONNREFUSED' });"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Log rotation by date/size; different levels per transport;\n//             custom format with timestamp and colorize.\n// APPROACH  - DailyRotateFile for rotation; error-only file transport;\n//             format.combine for timestamp + printf.\n// STRENGTHS - Automatic rotation; level-based routing; readable format.\n// WEAKNESSES- DailyRotateFile is a separate dep; format pipeline overhead.\n//\nimport winston from 'winston';\nimport DailyRotateFile from 'winston-daily-rotate-file';\n\nconst logger = winston.createLogger({\n  level: 'info',\n  format: winston.format.combine(\n    winston.format.timestamp(),\n    winston.format.errors({ stack: true }),\n    winston.format.json(),\n  ),\n  transports: [\n    // Console: colorized in dev\n    new winston.transports.Console({\n      format: winston.format.combine(\n        winston.format.colorize(),\n        winston.format.simple(),\n      ),\n    }),\n    // All logs: rotate daily, keep 14 days\n    new DailyRotateFile({\n      filename: 'app-%DATE%.log',\n      datePattern: 'YYYY-MM-DD',\n      maxSize: '50m',\n      maxFiles: '14d',\n    }),\n    // Errors only: separate file\n    new DailyRotateFile({\n      level: 'error',\n      filename: 'error-%DATE%.log',\n      datePattern: 'YYYY-MM-DD',\n      maxSize: '20m',\n      maxFiles: '30d',\n    }),\n  ],\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Production winston: child loggers, profiling, streaming,\n//             and HTTP transport for remote log aggregation.\n// APPROACH  - logger.child() for context; startTimer() for profiling;\n//             HTTP transport to send logs to Logstash/Datadog.\n// STRENGTHS - Profiling built in; streaming for real-time dashboards.\n// WEAKNESSES- HTTP transport adds latency; no built-in async (use pino for that).\n//\nimport winston from 'winston';\n\nconst logger = winston.createLogger({\n  level: 'info',\n  format: winston.format.combine(\n    winston.format.timestamp(),\n    winston.format.errors({ stack: true }),\n    winston.format.json(),\n  ),\n  defaultMeta: { service: 'api', version: process.env.APP_VERSION },\n  transports: [\n    new winston.transports.Console(),\n    new winston.transports.Http({\n      host: 'logs.internal',\n      port: 8080,\n      path: '/logs',\n      ssl: true,\n    }),\n  ],\n});\n\n// Child logger with request context\nfunction requestLogger(req, res, next) {\n  req.log = logger.child({ requestId: crypto.randomUUID(), userId: req.user?.id });\n  next();\n}\n\n// Built-in profiling\napp.get('/api/expensive', async (req, res) => {\n  const profiler = req.log.startTimer();\n  const result = await expensiveComputation();\n  profiler.done({ message: 'expensive computation completed' });\n  // Logs: { duration_ms: 1234, message: 'expensive computation completed' }\n  res.json(result);\n});\n\n// Stream logs to a websocket for real-time dashboard\nconst logStream = logger.stream({ level: 'info' });\nlogStream.on('data', (chunk) => {\n  websocket.broadcast(JSON.parse(chunk));\n});"
                  }
        ],
        tips: [
                  "Use DailyRotateFile for file logs — prevents disk fills from ever-growing log files.",
                  "Separate error logs into their own file — easier to alert and triage.",
                  "Use format.errors({ stack: true }) to capture stack traces in JSON.",
                  "Set defaultMeta for service name and version — every log line includes it.",
                  "Use pino instead if you need maximum throughput — winston is 2-3x slower."
        ],
        mistake: "Creating a new logger instance per request instead of using child() — each instance creates new transports and file handles, exhausting resources. Always use logger.child().",
        shorthand: {
          verbose: "import winston from 'winston';\nconst log = winston.createLogger({ level: 'info', format: winston.format.json(), transports: [new winston.transports.Console()] });\nlog.info({ userId: 42 }, 'login');",
          concise: "const log = winston.createLogger({ transports: [new winston.transports.Console()] }); log.info('login');",
        },
      },
    ],
  },

  // ── Section 2: Error Tracking — Sentry, error boundaries, source maps ─────────────────────────────────────────
  {
    id: "error-tracking",
    title: "Error Tracking — Sentry, error boundaries, source maps",
    entries: [
      {
        id: "sentry-setup",
        fn: "sentry — error tracking, release tracking, performance",
        desc: "Sentry captures unhandled errors, exceptions, and performance issues in production. Provides stack traces with source maps, breadcrumb trails, and release-based issue tracking.",
        category: "Error Tracking",
        subtitle: "Sentry.init(), captureException, breadcrumbs, beforeSend, release tracking, profiling",
        signature: "Sentry.init({ dsn: '...', environment: 'production', release: 'app@1.0.0' })",
        descLong: "Sentry SDK hooks into Node.js process events (uncaughtException, unhandledRejection) and Express middleware to capture errors automatically. Key features: source map upload for readable stack traces, breadcrumbs (previous events leading to the error), release tracking (know which deploy introduced a bug), performance monitoring (transaction tracing), and beforeSend hook for PII redaction. Use Sentry's request handler middleware to auto-capture Express errors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Capture unhandled errors in a Node.js app with Sentry.\n// APPROACH  - Sentry.init() with DSN; Express handlers capture route errors.\n// STRENGTHS - Auto-captures unhandled errors; stack traces with source maps.\n// WEAKNESSES- Requires DSN and Sentry account; adds ~2ms per request.\n//\nimport Sentry from '@sentry/node';\nimport express from 'express';\n\nSentry.init({\n  dsn: process.env.SENTRY_DSN,\n  environment: process.env.NODE_ENV,\n});\n\nconst app = express();\n\n// Request handler must be first middleware\napp.use(Sentry.Handlers.requestHandler());\n\napp.get('/api/users/:id', async (req, res) => {\n  const user = await db.users.findById(req.params.id);\n  if (!user) throw new Error('User not found');\n  res.json(user);\n});\n\n// Error handler must be last middleware\napp.use(Sentry.Handlers.errorHandler());\n\napp.listen(3000);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Release tracking, PII redaction, manual error capture,\n//             and breadcrumb trails for debugging.\n// APPROACH  - release field links errors to deploys; beforeSend redacts\n//             sensitive data; addBreadcrumb for context; captureException\n//             for manual error reporting.\n// STRENGTHS - Know which deploy caused the bug; PII-safe; rich context.\n// WEAKNESSES- beforeSend runs on every event — keep it fast.\n//\nimport Sentry from '@sentry/node';\n\nSentry.init({\n  dsn: process.env.SENTRY_DSN,\n  release: `api@${process.env.APP_VERSION}`,\n  environment: process.env.NODE_ENV,\n  tracesSampleRate: 0.1,  // 10% of transactions traced\n  beforeSend(event) {\n    // Redact PII from request bodies\n    if (event.request?.data) {\n      const data = JSON.parse(event.request.data);\n      delete data.password;\n      delete data.creditCard;\n      event.request.data = JSON.stringify(data);\n    }\n    return event;\n  },\n});\n\n// Manual error capture with context\ntry {\n  await riskyOperation();\n} catch (err) {\n  Sentry.captureException(err, {\n    tags: { feature: 'payments' },\n    extra: { userId: 42, amount: 100 },\n    level: 'error',\n  });\n}\n\n// Breadcrumbs — trail of events leading to an error\nSentry.addBreadcrumb({\n  category: 'auth',\n  message: 'User logged in',\n  level: 'info',\n  data: { userId: 42 },\n});\n\nSentry.addBreadcrumb({\n  category: 'db',\n  message: 'Query executed',\n  level: 'debug',\n  data: { query: 'SELECT * FROM users WHERE id = 42', duration: 15 },\n});\n\n// Later when an error occurs, breadcrumbs are included in the report\nthrow new Error('Payment failed');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Source map upload, performance profiling, custom spans,\n//             and integration with OpenTelemetry.\n// APPROACH  - sentry-cli uploads source maps on deploy; startSpan for\n//             custom tracing; configureScope for user context.\n// STRENGTHS - Readable stack traces in production; granular performance data.\n// WEAKNESSES- Source map upload is a CI step; profiling adds overhead.\n//\nimport Sentry from '@sentry/node';\nimport { ProfilingIntegration } from '@sentry/profiling-node';\n\nSentry.init({\n  dsn: process.env.SENTRY_DSN,\n  release: `api@${process.env.APP_VERSION}`,\n  integrations: [\n    new ProfilingIntegration(),\n    new Sentry.Integrations.Http({ tracing: true }),\n    new Sentry.Integrations.Postgres(),\n  ],\n  tracesSampleRate: 0.1,\n  profilesSampleRate: 0.1,\n});\n\n// Set user context for all subsequent events\nSentry.configureScope((scope) => {\n  scope.setUser({ id: '42', email: 'alice@example.com' });\n  scope.setTag('tenant', 'acme');\n  scope.setContext('feature_flags', { newUI: true, beta: false });\n});\n\n// Custom spans for performance tracing\nasync function processPayment(userId, amount) {\n  return Sentry.startSpan(\n    { op: 'payment.process', name: 'Process Payment' },\n    async (span) => {\n      span.setAttribute('userId', userId);\n      span.setAttribute('amount', amount);\n\n      const validation = await Sentry.startSpan(\n        { op: 'payment.validate', name: 'Validate Payment' },\n        () => validatePayment(userId, amount)\n      );\n\n      const charge = await Sentry.startSpan(\n        { op: 'payment.charge', name: 'Charge Card' },\n        () => chargeCard(userId, amount)\n      );\n\n      span.setAttribute('chargeId', charge.id);\n      return charge;\n    }\n  );\n}\n\n// Source map upload (CI/CD script):\n// sentry-cli sourcemaps upload --release api@1.0.0 dist/"
                  }
        ],
        tips: [
                  "Always set the release tag — Sentry groups errors by release and can identify which deploy caused a regression.",
                  "Use tracesSampleRate (0.1) in production — 100% tracing is too expensive; 10% is usually enough.",
                  "Upload source maps with sentry-cli after build — without them, stack traces show minified code.",
                  "Use beforeSend to redact PII — Sentry sends full request bodies by default.",
                  "Put Sentry.Handlers.requestHandler() first and errorHandler() last — order matters."
        ],
        mistake: "Forgetting to upload source maps — production stack traces show minified code like \"at a.b.c (main.js:1:2345)\" making debugging impossible. Always upload source maps in CI.",
        shorthand: {
          verbose: "import Sentry from '@sentry/node';\nSentry.init({ dsn: process.env.SENTRY_DSN, release: 'api@1.0.0' });\ntry { await fn(); } catch (e) { Sentry.captureException(e); }",
          concise: "Sentry.init({ dsn: process.env.SENTRY_DSN }); try { fn(); } catch(e) { Sentry.captureException(e); }",
        },
      },
    ],
  },

  // ── Section 3: Distributed Tracing — OpenTelemetry, spans, context ─────────────────────────────────────────
  {
    id: "opentelemetry",
    title: "Distributed Tracing — OpenTelemetry, spans, context",
    entries: [
      {
        id: "otel-setup",
        fn: "OpenTelemetry — traces, spans, context propagation",
        desc: "OpenTelemetry (OTel) is the CNCF standard for distributed tracing. It instruments your code with spans (units of work) that form traces across service boundaries.",
        category: "Distributed Tracing",
        subtitle: "NodeSDK, tracer, span, context, baggage, W3C trace context, exporters",
        signature: "const span = tracer.startSpan('operation'); span.setAttribute('key', 'val'); span.end()",
        descLong: "OpenTelemetry provides a vendor-neutral API for distributed tracing. A trace is a tree of spans — each span represents a unit of work (HTTP request, DB query, internal function). Context propagation (W3C Trace Context headers) carries trace IDs across HTTP/gRPC boundaries so you can see a request flow through multiple services. Exporters send spans to backends (Jaeger, Zipkin, Datadog, Honeycomb). Auto-instrumentation packages hook into Express, HTTP, DB drivers automatically.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Trace an Express request with OpenTelemetry.\n// APPROACH  - NodeSDK with auto-instrumentation; Express + HTTP auto-traced.\n// STRENGTHS - Auto-instruments Express, HTTP, DB; vendor-neutral.\n// WEAKNESSES- Setup is verbose; SDK must start before app imports.\n//\nimport { NodeSDK } from '@opentelemetry/sdk-node';\nimport { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';\nimport { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';\nimport { HttpInstrumentation } from '@opentelemetry/instrumentation-http';\n\n// SDK must be initialized BEFORE app code\nconst sdk = new NodeSDK({\n  traceExporter: new OTLPTraceExporter({\n    url: 'http://otel-collector:4318/v1/traces',\n  }),\n  instrumentations: [\n    new HttpInstrumentation(),\n    new ExpressInstrumentation(),\n  ],\n});\n\nsdk.start();\n\n// Now import app code\nimport express from 'express';\nconst app = express();\n\napp.get('/api/users/:id', async (req, res) => {\n  const user = await db.users.findById(req.params.id);\n  res.json(user);\n});\n\napp.listen(3000);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Add custom spans for business logic; propagate context\n//             across async operations; add span attributes.\n// APPROACH  - tracer.startSpan() for custom spans; span.setAttribute()\n//             for searchable fields; context.with() for async propagation.\n// STRENGTHS - Granular tracing of business logic; searchable in Jaeger/Tempo.\n// WEAKNESSES- Manual span management is verbose; must remember to .end().\n//\nimport { trace, context } from '@opentelemetry/api';\n\nconst tracer = trace.getTracer('api-service');\n\napp.get('/api/orders/:id', async (req, res) => {\n  const span = tracer.startSpan('getOrder', {\n    attributes: { 'order.id': req.params.id, 'user.id': req.user?.id },\n  });\n\n  try {\n    // Create child spans for sub-operations\n    const order = await tracer.startActiveSpan('db.fetchOrder', async (childSpan) => {\n      const result = await db.orders.findById(req.params.id);\n      childSpan.setAttribute('order.found', !!result);\n      childSpan.end();\n      return result;\n    });\n\n    const items = await tracer.startActiveSpan('db.fetchItems', async (childSpan) => {\n      const result = await db.items.findByOrderId(req.params.id);\n      childSpan.setAttribute('items.count', result.length);\n      childSpan.end();\n      return result;\n    });\n\n    span.setAttribute('response.items', items.length);\n    span.setStatus({ code: 1 });  // OK\n    res.json({ ...order, items });\n  } catch (err) {\n    span.setStatus({ code: 2, message: err.message });  // ERROR\n    span.recordException(err);\n    res.status(500).json({ error: 'Internal error' });\n  } finally {\n    span.end();  // ALWAYS end the span\n  }\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Context propagation across HTTP calls; baggage for\n//             cross-service metadata; custom exporters; sampling.\n// APPROACH  - propagation.inject/extract for W3C trace context; Baggage\n//             for tenant/request metadata; custom sampler for cost control.\n// STRENGTHS - Full distributed traces across services; baggage carries\n//             business context; sampling controls costs.\n// WEAKNESSES- Complex setup; baggage is not encrypted — don't put secrets in it.\n//\nimport { trace, context, propagation, baggage } from '@opentelemetry/api';\n\n// Inject trace context into outgoing HTTP requests\nasync function callPaymentService(orderId, amount) {\n  const span = tracer.startSpan('payment-service.call');\n\n  // Add baggage for cross-service metadata\n  const ctx = baggage.setActive(context.active(), {\n    'tenant.id': 'acme',\n    'request.priority': 'high',\n  });\n\n  const headers = {};\n  propagation.inject(ctx, headers);  // adds traceparent + baggage headers\n\n  try {\n    const response = await fetch('http://payment-service/charge', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json', ...headers },\n      body: JSON.stringify({ orderId, amount }),\n    });\n    span.setAttribute('http.status_code', response.status);\n    return response.json();\n  } catch (err) {\n    span.recordException(err);\n    throw err;\n  } finally {\n    span.end();\n  }\n}\n\n// Custom sampler — sample 100% of errors, 10% of success\nimport { Sampler, SamplingDecision } from '@opentelemetry/sdk-trace-base';\n\nclass ErrorAwareSampler {\n  shouldSample(ctx, traceId, name, kind, attributes) {\n    // Always sample if parent span had an error\n    const parentSpan = trace.getSpan(ctx);\n    if (parentSpan && parentSpan.status.code === 2) {\n      return { decision: SamplingDecision.RECORD_AND_SAMPLE };\n    }\n    // Sample 10% of everything else\n    return Math.random() < 0.1\n      ? { decision: SamplingDecision.RECORD_AND_SAMPLE }\n      : { decision: SamplingDecision.NOT_RECORD };\n  }\n  toString() { return 'ErrorAwareSampler'; }\n}"
                  }
        ],
        tips: [
                  "Initialize the SDK BEFORE importing app code — auto-instrumentation hooks must be registered first.",
                  "Always call span.end() — unclosed spans cause memory leaks and incomplete traces.",
                  "Use span attributes for searchable fields — Jaeger/Tempo can filter by attributes.",
                  "Use baggage for cross-service business context (tenant, priority) — not for secrets.",
                  "Set tracesSampleRate based on traffic — 1.0 for dev, 0.1 for high-traffic prod."
        ],
        mistake: "Importing app code before SDK initialization — auto-instrumentation won't hook into Express/HTTP. The SDK must start first, before any other imports.",
        shorthand: {
          verbose: "import { trace } from '@opentelemetry/api';\nconst tracer = trace.getTracer('app');\nconst span = tracer.startSpan('operation');\ntry { /* work */ } finally { span.end(); }",
          concise: "const s = trace.getTracer('app').startSpan('op'); try { /* */ } finally { s.end(); }",
        },
      },
    ],
  },

  // ── Section 4: Metrics — Prometheus, custom metrics, dashboards ─────────────────────────────────────────
  {
    id: "metrics",
    title: "Metrics — Prometheus, custom metrics, dashboards",
    entries: [
      {
        id: "prom-client",
        fn: "prom-client — Prometheus metrics for Node.js",
        desc: "prom-client implements Prometheus metrics in Node.js — counters, gauges, histograms, and summaries. Expose a /metrics endpoint for Prometheus to scrape.",
        category: "Metrics",
        subtitle: "Counter, Gauge, Histogram, Summary, register, /metrics endpoint, defaultMetrics",
        signature: "const counter = new Counter({ name: 'http_requests_total', help: '...', labelNames: ['method', 'status'] })",
        descLong: "prom-client provides four metric types: Counter (monotonically increasing — request count, error count), Gauge (can go up or down — memory usage, active connections), Histogram (distribution — request latency buckets), and Summary (quantiles — p50, p90, p99). Labels enable dimensional querying (method, status, route). The /metrics endpoint exposes all metrics in Prometheus text format for scraping. Enable defaultMetrics() to collect Node.js runtime metrics (event loop lag, GC, heap).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Track HTTP request count and expose /metrics endpoint.\n// APPROACH  - Counter for requests; prom-client register; Express endpoint.\n// STRENGTHS - Standard Prometheus format; auto-scrape ready.\n// WEAKNESSES- High-cardinality labels (userId) explode memory — avoid.\n//\nimport express from 'express';\nimport { Counter, collectDefaultMetrics, register } from 'prom-client';\n\ncollectDefaultMetrics();  // Node.js runtime metrics\n\nconst httpRequestTotal = new Counter({\n  name: 'http_requests_total',\n  help: 'Total HTTP requests',\n  labelNames: ['method', 'route', 'status'],\n});\n\nconst app = express();\n\napp.use((req, res, next) => {\n  res.on('finish', () => {\n    httpRequestTotal.inc({\n      method: req.method,\n      route: req.route?.path || 'unknown',\n      status: res.statusCode,\n    });\n  });\n  next();\n});\n\napp.get('/metrics', async (req, res) => {\n  res.set('Content-Type', register.contentType);\n  res.end(await register.metrics());\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Track request latency with histograms; gauge for active\n//             connections; business metrics (orders processed).\n// APPROACH  - Histogram with buckets for latency; Gauge for connections;\n//             Counter for business events.\n// STRENGTHS - Latency percentiles in Grafana; real-time connection count.\n// WEAKNESSES- Histogram buckets must be chosen carefully for your latency profile.\n//\nimport { Counter, Gauge, Histogram, collectDefaultMetrics, register } from 'prom-client';\n\ncollectDefaultMetrics();\n\n// Histogram — request latency\nconst httpRequestDuration = new Histogram({\n  name: 'http_request_duration_seconds',\n  help: 'HTTP request duration in seconds',\n  labelNames: ['method', 'route', 'status'],\n  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],\n});\n\n// Gauge — active connections (goes up and down)\nconst activeConnections = new Gauge({\n  name: 'active_connections',\n  help: 'Current active connections',\n});\n\n// Counter — business metric\nconst ordersProcessed = new Counter({\n  name: 'orders_processed_total',\n  help: 'Total orders processed',\n  labelNames: ['status', 'payment_method'],\n});\n\n// Middleware to track latency\napp.use((req, res, next) => {\n  const start = process.hrtime.bigint();\n  activeConnections.inc();\n\n  res.on('finish', () => {\n    const duration = Number(process.hrtime.bigint() - start) / 1e9;\n    httpRequestDuration.observe(\n      { method: req.method, route: req.route?.path || 'unknown', status: res.statusCode },\n      duration,\n    );\n    activeConnections.dec();\n  });\n  next();\n});\n\n// Business metric in route handler\napp.post('/api/orders', async (req, res) => {\n  const order = await processOrder(req.body);\n  ordersProcessed.inc({ status: 'success', payment_method: order.paymentMethod });\n  res.json(order);\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Custom registry, Pushgateway for batch jobs, content-type\n//             negotiation, and metric naming conventions.\n// APPROACH  - Separate Registry for push metrics; Pushgateway for cron jobs;\n//             follow Prometheus naming conventions (snake_case, _total for\n//             counters, _seconds for time, _bytes for size).\n// STRENGTHS - Clean separation of scrape vs push metrics; naming conventions\n//             make Grafana queries predictable.\n// WEAKNESSES- Pushgateway requires cleanup of stale metrics.\n//\nimport { Counter, Histogram, Registry, Pushgateway, collectDefaultMetrics } from 'prom-client';\n\n// Scrape registry (for long-running HTTP services)\nconst scrapeRegistry = new Registry();\ncollectDefaultMetrics({ register: scrapeRegistry });\n\nconst httpRequestDuration = new Histogram({\n  name: 'http_request_duration_seconds',\n  help: 'HTTP request duration',\n  labelNames: ['method', 'route'],\n  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 5],\n  registers: [scrapeRegistry],\n});\n\n// Push registry (for batch/cron jobs)\nconst pushRegistry = new Registry();\n\nconst jobProcessedTotal = new Counter({\n  name: 'job_processed_total',\n  help: 'Total items processed by batch job',\n  labelNames: ['job_name', 'status'],\n  registers: [pushRegistry],\n});\n\nconst pushgateway = new Pushgateway('http://pushgateway:9091');\n\nasync function runBatchJob() {\n  const items = await fetchWork();\n  for (const item of items) {\n    try {\n      await processItem(item);\n      jobProcessedTotal.inc({ job_name: 'email-digest', status: 'success' });\n    } catch (err) {\n      jobProcessedTotal.inc({ job_name: 'email-digest', status: 'error' });\n    }\n  }\n  // Push metrics to Pushgateway after job completes\n  await pushgateway.pushAdd({ jobName: 'email-digest', register: pushRegistry });\n}\n\n// Expose scrape metrics\napp.get('/metrics', async (req, res) => {\n  res.set('Content-Type', scrapeRegistry.contentType);\n  res.end(await scrapeRegistry.metrics());\n});"
                  }
        ],
        tips: [
                  "Never use high-cardinality labels (userId, requestId) — each unique label combination creates a new time series.",
                  "Choose histogram buckets that match your SLO (e.g., 100ms, 500ms, 1s, 5s for API latency).",
                  "Use _total suffix for counters, _seconds for time, _bytes for size — Prometheus naming conventions.",
                  "Call collectDefaultMetrics() to get event loop lag, GC duration, and heap stats for free.",
                  "Use Pushgateway for batch/cron jobs — Prometheus can't scrape a process that exits."
        ],
        mistake: "Using userId as a label — each unique user creates a new time series. With 100K users, Prometheus runs out of memory. Use low-cardinality labels (method, route, status).",
        shorthand: {
          verbose: "import { Counter, register } from 'prom-client';\nconst c = new Counter({ name: 'requests_total', help: 'Requests', labelNames: ['status'] });\nc.inc({ status: '200' });\napp.get('/metrics', async (req, res) => res.end(await register.metrics()));",
          concise: "const c = new Counter({ name: 'req_total', help: '' }); c.inc(); app.get('/metrics', (q,s) => s.end(register.metrics()));",
        },
      },
    ],
  },

  // ── Section 5: Health & Readiness — probes, graceful shutdown ─────────────────────────────────────────
  {
    id: "health-readiness",
    title: "Health & Readiness — probes, graceful shutdown",
    entries: [
      {
        id: "health-probes",
        fn: "Health & readiness probes — liveness, readiness, startup",
        desc: "Kubernetes-style health probes: liveness (is the process alive?), readiness (can I serve traffic?), and startup (is the app initialized?). Essential for zero-downtime deploys.",
        category: "Health & Readiness",
        subtitle: "liveness, readiness, startup probes, graceful shutdown, signal handling",
        signature: "app.get('/health', (req, res) => res.json({ status: 'ok' }))",
        descLong: "Health probes tell the orchestrator (K8s, ECS, Nomad) when to route traffic, restart, or wait. Liveness: is the process alive? (if fails, restart the pod). Readiness: can I serve traffic? (if fails, remove from load balancer but don't restart). Startup: is the app initialized? (if fails, don't start liveness/readiness checks yet). Graceful shutdown: on SIGTERM, stop accepting new connections, finish in-flight requests, then exit.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Add health and readiness endpoints to an Express app.\n// APPROACH  - /healthz for liveness (always 200 if process is running);\n//             /readyz for readiness (check DB connection).\n// STRENGTHS - Simple; orchestrator can route traffic correctly.\n// WEAKNESSES- No startup probe; no graceful shutdown yet.\n//\nimport express from 'express';\nconst app = express();\n\n// Liveness — process is alive\napp.get('/healthz', (req, res) => {\n  res.status(200).json({ status: 'ok' });\n});\n\n// Readiness — can serve traffic (DB is connected)\napp.get('/readyz', async (req, res) => {\n  try {\n    await db.ping();\n    res.status(200).json({ status: 'ready' });\n  } catch {\n    res.status(503).json({ status: 'not ready' });\n  }\n});\n\napp.listen(3000);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Add graceful shutdown: stop accepting new connections,\n//             finish in-flight requests, close DB, then exit.\n// APPROACH  - Listen for SIGTERM/SIGINT; server.close() to stop accepting;\n//             drain connections with timeout; then process.exit(0).\n// STRENGTHS - Zero-downtime deploys; no dropped requests.\n// WEAKNESSES- Must handle long-running connections (WebSockets, SSE).\n//\nimport express from 'express';\nimport http from 'http';\n\nconst app = express();\nconst server = http.createServer(app);\n\nlet isShuttingDown = false;\n\n// Readiness reflects shutdown state\napp.get('/readyz', (req, res) => {\n  if (isShuttingDown) return res.status(503).json({ status: 'shutting down' });\n  // Check DB\n  db.ping().then(() => res.status(200).json({ status: 'ready' }))\n    .catch(() => res.status(503).json({ status: 'not ready' }));\n});\n\n// Graceful shutdown\nasync function gracefulShutdown(signal) {\n  console.log(`Received ${signal}, shutting down gracefully`);\n  isShuttingDown = true;\n\n  // Stop accepting new connections\n  server.close(async () => {\n    console.log('HTTP server closed');\n\n    // Close DB connections\n    try {\n      await db.close();\n      console.log('DB connections closed');\n    } catch (err) {\n      console.error('Error closing DB:', err);\n    }\n\n    process.exit(0);\n  });\n\n  // Force exit after 30s if connections don't drain\n  setTimeout(() => {\n    console.error('Forcing exit after 30s timeout');\n    process.exit(1);\n  }, 30_000).unref();\n}\n\nprocess.on('SIGTERM', () => gracefulShutdown('SIGTERM'));\nprocess.on('SIGINT', () => gracefulShutdown('SIGINT'));\n\nserver.listen(3000);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Full production health checks: startup probe, dependency\n//             checks, readiness with timeout, and structured shutdown\n//             with connection draining.\n// APPROACH  - /startupz for initialization; /readyz checks all deps with\n//             timeout; SIGTERM triggers drain; track in-flight requests.\n// STRENGTHS - Handles slow startup; checks all dependencies; tracks\n//             in-flight requests for clean drain.\n// WEAKNESSES- Complexity; must maintain dependency list.\n//\nimport express from 'express';\n\nconst app = express();\nlet isReady = false;\nlet isShuttingDown = false;\nlet inflightRequests = 0;\n\n// Track in-flight requests\napp.use((req, res, next) => {\n  if (isShuttingDown) {\n    return res.status(503).setHeader('Connection', 'close').json({ error: 'shutting down' });\n  }\n  inflightRequests++;\n  res.on('finish', () => inflightRequests--);\n  next();\n});\n\n// Startup probe — is the app initialized?\napp.get('/startupz', async (req, res) => {\n  if (!isReady) {\n    // Run initialization checks\n    try {\n      await Promise.race([\n        Promise.all([db.ping(), redis.ping(), elastic.ping()]),\n        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5_000)),\n      ]);\n      isReady = true;\n    } catch (err) {\n      return res.status(503).json({ status: 'starting', error: err.message });\n    }\n  }\n  res.status(200).json({ status: 'started' });\n});\n\n// Readiness probe — can serve traffic?\napp.get('/readyz', async (req, res) => {\n  if (isShuttingDown) return res.status(503).json({ status: 'shutting down' });\n  if (!isReady) return res.status(503).json({ status: 'not started' });\n\n  try {\n    const checks = await Promise.race([\n      Promise.all([\n        db.ping().then(() => ['db', 'ok']).catch(() => ['db', 'fail']),\n        redis.ping().then(() => ['redis', 'ok']).catch(() => ['redis', 'fail']),\n      ]),\n      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3_000)),\n    ]);\n\n    const allOk = checks.every(([, status]) => status === 'ok');\n    res.status(allOk ? 200 : 503).json({\n      status: allOk ? 'ready' : 'degraded',\n      checks: Object.fromEntries(checks),\n      inflight: inflightRequests,\n    });\n  } catch {\n    res.status(503).json({ status: 'timeout' });\n  }\n});\n\n// Graceful shutdown with connection draining\nasync function gracefulShutdown(signal) {\n  console.log(`[${signal}] starting graceful shutdown`);\n  isShuttingDown = true;\n\n  // Wait for in-flight requests to complete (max 20s)\n  const drainStart = Date.now();\n  while (inflightRequests > 0 && Date.now() - drainStart < 20_000) {\n    console.log(`Waiting for ${inflightRequests} in-flight requests`);\n    await new Promise(r => setTimeout(r, 500));\n  }\n\n  // Close server\n  server.close();\n\n  // Close connections\n  await Promise.allSettled([db.close(), redis.quit(), elastic.close()]);\n\n  console.log('Shutdown complete');\n  process.exit(0);\n}\n\nprocess.on('SIGTERM', () => gracefulShutdown('SIGTERM'));\nprocess.on('SIGINT', () => gracefulShutdown('SIGINT'));"
                  }
        ],
        tips: [
                  "Use /healthz for liveness (process alive) and /readyz for readiness (can serve) — they have different semantics.",
                  "Set isShuttingDown flag on SIGTERM — readiness probe returns 503, load balancer removes the pod.",
                  "Always set a force-exit timeout — some connections (WebSocket, SSE) never close on their own.",
                  "Track in-flight requests — don't exit until they're done (or timeout).",
                  "Use Connection: close header during shutdown — tells clients to not reuse the connection."
        ],
        mistake: "Using the same endpoint for liveness and readiness — if the DB is down, liveness fails and K8s restarts the pod, but the new pod also can't connect to the DB, causing a restart loop. Liveness should only check if the process is alive.",
        shorthand: {
          verbose: "// Separate liveness and readiness endpoints\napp.get('/healthz', (req, res) => {\n  res.json({ status: 'ok' });\n});\napp.get('/readyz', async (req, res) => {\n  try { await db.ping(); res.json({ status: 'ready' }); }\n  catch { res.status(503).json({ status: 'not ready' }); }\n});",
          concise: "app.get('/healthz', (q,s) => s.json({ok:1})); app.get('/readyz', async (q,s) => { try{await db.ping();s.json({ready:1})}catch{s.status(503).json({ready:0})} });",
        },
      },
    ],
  },
]

export default { meta, sections }
