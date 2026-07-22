export const meta = {
  "title": "Messaging & Queues",
  "domain": "nodejs",
  "sheet": "messaging-queues",
  "icon": "📬"
}

export const sections = [

  // ── Section 1: BullMQ — Redis-backed job queues ─────────────────────────────────────────
  {
    id: "bullmq",
    title: "BullMQ — Redis-backed job queues",
    entries: [
      {
        id: "bullmq-basics",
        fn: "BullMQ — create queues, producers, consumers",
        desc: "BullMQ is the leading Redis-backed job queue for Node.js. Supports retries, delays, priorities, rate limiting, scheduled jobs (cron), and job events.",
        category: "Job Queues",
        subtitle: "new Queue(), new Worker(), add(), process(), retries, delays, priorities, cron",
        signature: "const queue = new Queue('emails', { connection }); const worker = new Worker('emails', async (job) => { ... })",
        descLong: "BullMQ separates producers (Queue.add) from consumers (Worker.process). Jobs are stored in Redis and survive process restarts. Key features: automatic retries with exponential backoff, delayed jobs, priority queues, concurrency control, rate limiting, repeatable jobs (cron scheduling), and event-driven progress tracking. Use BullMQ for email sending, image processing, report generation, and any background work that needs reliability.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Queue email sending so HTTP requests respond immediately.\n// APPROACH  - Queue.add() to enqueue; Worker to process jobs.\n// STRENGTHS - Decouples work from request; survives restarts; auto-retries.\n// WEAKNESSES- Requires Redis; no built-in dashboard (use Bull Dashboard).\n//\nimport { Queue, Worker } from 'bullmq';\n\nconst connection = { host: 'localhost', port: 6379 };\n\nconst emailQueue = new Queue('emails', { connection });\n\nawait emailQueue.add('send-welcome', {\n  to: 'alice@example.com',\n  subject: 'Welcome!',\n  body: 'Thanks for signing up.',\n});\n\nconst worker = new Worker('emails', async (job) => {\n  const { to, subject, body } = job.data;\n  await sendEmail(to, subject, body);\n  return { sent: true };\n}, { connection });\n\nworker.on('completed', (job) => console.log(`Job ${job.id} completed`));\nworker.on('failed', (job, err) => console.error(`Job ${job.id} failed: ${err.message}`));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Retries with backoff, delayed jobs, priority, concurrency,\n//             and progress reporting.\n// APPROACH  - attempts + backoff for retries; delay for scheduled jobs;\n//             priority for ordering; concurrency for parallel processing.\n// STRENGTHS - Robust retry logic; priority-based ordering; observable progress.\n// WEAKNESSES- Too many retries can flood Redis; concurrency must be tuned.\n//\nimport { Queue, Worker } from 'bullmq';\n\nconst connection = { host: 'localhost', port: 6379 };\nconst queue = new Queue('reports', { connection });\n\nawait queue.add('generate-report',\n  { userId: 42, type: 'monthly' },\n  {\n    attempts: 5,\n    backoff: { type: 'exponential', delay: 5_000 },\n    removeOnComplete: 100,\n    removeOnFail: 1000,\n  }\n);\n\nawait queue.add('reminder',\n  { userId: 42, message: 'Complete your profile' },\n  { delay: 60 * 60 * 1000 }\n);\n\nawait queue.add('urgent-export',\n  { userId: 1, data: '...' },\n  { priority: 1 }\n);\n\nconst worker = new Worker('reports', async (job) => {\n  const { userId, type } = job.data;\n  const total = await countRecords(userId);\n  for (let i = 0; i < total; i += 100) {\n    const batch = await fetchBatch(userId, i, 100);\n    processBatch(batch);\n    job.updateProgress({ current: i + 100, total });\n  }\n  return { records: total };\n}, { connection, concurrency: 5 });\n\nworker.on('progress', (job, p) => console.log(`Job ${job.id}: ${p.current}/${p.total}`));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Repeatable (cron) jobs, rate limiting, job flows (parent/child),\n//             and graceful shutdown.\n// APPROACH  - repeat.pattern for cron; limiter for throughput; FlowProducer\n//             for parent-child chains; worker.close() for graceful drain.\n// STRENGTHS - Cron scheduling; rate limiting; multi-step pipelines; clean shutdown.\n// WEAKNESSES- Repeatable jobs need careful removal; FlowProducer is complex.\n//\nimport { Queue, Worker, QueueEvents, FlowProducer } from 'bullmq';\n\nconst connection = { host: 'localhost', port: 6379 };\nconst queue = new Queue('scheduled', { connection });\n\n// Repeatable job — every day at 3 AM\nawait queue.add('daily-summary', { date: new Date().toISOString() },\n  { repeat: { pattern: '0 3 * * *' }, removeOnComplete: 30 });\n\n// Rate-limited worker\nconst worker = new Worker('api-calls', async (job) => {\n  const response = await fetch(job.data.url);\n  return response.json();\n}, { connection, limiter: { max: 10, duration: 1_000 } });\n\n// Job flows — parent-child pipeline\nconst flowProducer = new FlowProducer({ connection });\nawait flowProducer.add({\n  name: 'import-pipeline', queueName: 'imports', data: { file: 'users.csv' },\n  children: [\n    { name: 'parse-csv', queueName: 'imports', data: { file: 'users.csv' } },\n    { name: 'validate-rows', queueName: 'imports', data: {} },\n    { name: 'insert-db', queueName: 'imports', data: {} },\n  ],\n});\n\n// Graceful shutdown\nasync function shutdown() {\n  await worker.close();\n  await queue.close();\n  process.exit(0);\n}\nprocess.on('SIGTERM', shutdown);\nprocess.on('SIGINT', shutdown);\n\n// Monitoring via QueueEvents\nconst queueEvents = new QueueEvents('imports', { connection });\nqueueEvents.on('completed', ({ jobId }) => metrics.jobsCompleted.inc({ queue: 'imports' }));\nqueueEvents.on('failed', ({ jobId, failedReason }) => {\n  metrics.jobsFailed.inc({ queue: 'imports' });\n  logger.error({ jobId, reason: failedReason }, 'job failed');\n});"
                  }
        ],
        tips: [
                  "Always set removeOnComplete and removeOnFail — without them, Redis fills up with job history.",
                  "Use exponential backoff for retries — linear retries flood downstream services.",
                  "Set concurrency based on your downstream capacity — not your CPU count.",
                  "Use FlowProducer for multi-step pipelines — children complete before parent runs.",
                  "Call worker.close() (not worker.stop()) on shutdown — close waits for in-flight jobs."
        ],
        mistake: "Not setting removeOnComplete — completed jobs stay in Redis forever. With 10K jobs/day, that's 300K/month of wasted Redis memory. Always set removeOnComplete: 100.",
        shorthand: {
          verbose: "import { Queue, Worker } from 'bullmq';\nconst q = new Queue('jobs', { connection: { host: 'localhost', port: 6379 } });\nawait q.add('task', { data: 1 });\nnew Worker('jobs', async (job) => { /* process */ }, { connection: { host: 'localhost', port: 6379 } });",
          concise: "const q = new Queue('jobs', { connection }); await q.add('t', d); new Worker('jobs', async j => fn(j.data), { connection });",
        },
      },
    ],
  },

  // ── Section 2: RabbitMQ — amqplib, exchanges, queues ─────────────────────────────────────────
  {
    id: "rabbitmq",
    title: "RabbitMQ — amqplib, exchanges, queues",
    entries: [
      {
        id: "amqplib-basics",
        fn: "amqplib — connect, publish, consume, exchanges",
        desc: "amqplib is the standard RabbitMQ client for Node.js. Supports exchanges (direct, topic, fanout), queues, bindings, acknowledgments, and dead letter queues.",
        category: "Message Brokers",
        subtitle: "connect, createChannel, assertExchange, assertQueue, bindQueue, publish, consume, ack",
        signature: "const conn = await amqp.connect('amqp://localhost'); const ch = await conn.createChannel()",
        descLong: "RabbitMQ is a full-featured message broker with routing capabilities. Core concepts: Exchange (receives messages from producers), Queue (stores messages for consumers), Binding (links exchange to queue with a routing key). Exchange types: direct, topic (pattern matching), fanout (broadcast). Messages are acknowledged (ack) or rejected (nack) by consumers. Dead letter queues capture failed messages.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Send and receive messages through a RabbitMQ queue.\n// APPROACH  - Connect, assert queue, publish, consume with ack.\n// STRENGTHS - Reliable delivery; message acknowledgments; survives restarts.\n// WEAKNESSES- More complex than BullMQ for simple job queues.\n//\nimport amqp from 'amqplib';\n\nconst conn = await amqp.connect('amqp://localhost');\nconst channel = await conn.createChannel();\n\nawait channel.assertQueue('tasks', { durable: true });\n\nchannel.sendToQueue('tasks', Buffer.from(JSON.stringify({\n  task: 'send-email', to: 'alice@example.com',\n})), { persistent: true });\n\nchannel.consume('tasks', (msg) => {\n  if (!msg) return;\n  const data = JSON.parse(msg.content.toString());\n  sendEmail(data.to).then(() => {\n    channel.ack(msg);\n  }).catch(() => {\n    channel.nack(msg, false, true);  // requeue on failure\n  });\n}, { noAck: false });"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Topic exchange with routing patterns; prefetch for fair dispatch;\n//             dead letter queue for failed messages.\n// APPROACH  - assertExchange (topic), assertQueue with DLX, bindQueue with\n//             routing key patterns, prefetch(1) for fair dispatch.\n// STRENGTHS - Flexible routing; dead letter captures failures; fair dispatch.\n// WEAKNESSES- Routing complexity; DLX adds infrastructure.\n//\nimport amqp from 'amqplib';\n\nconst conn = await amqp.connect('amqp://localhost');\nconst ch = await conn.createChannel();\n\n// Dead letter exchange\nawait ch.assertExchange('dlx', 'direct', { durable: true });\nawait ch.assertQueue('failed-tasks', { durable: true });\nawait ch.bindQueue('failed-tasks', 'dlx', 'task.failed');\n\n// Main exchange — topic routing\nawait ch.assertExchange('tasks', 'topic', { durable: true });\n\nawait ch.assertQueue('email-tasks', {\n  durable: true,\n  deadLetterExchange: 'dlx',\n  deadLetterRoutingKey: 'task.failed',\n  messageTtl: 60_000,\n});\nawait ch.bindQueue('email-tasks', 'tasks', 'email.*');\n\nawait ch.assertQueue('sms-tasks', {\n  durable: true,\n  deadLetterExchange: 'dlx',\n  deadLetterRoutingKey: 'task.failed',\n});\nawait ch.bindQueue('sms-tasks', 'tasks', 'sms.*');\n\nch.prefetch(1);\n\nch.publish('tasks', 'email.welcome', Buffer.from(JSON.stringify({\n  to: 'alice@example.com', type: 'welcome',\n})), { persistent: true });\n\nch.consume('email-tasks', async (msg) => {\n  if (!msg) return;\n  try {\n    const data = JSON.parse(msg.content.toString());\n    await sendEmail(data.to, data.type);\n    ch.ack(msg);\n  } catch (err) {\n    ch.nack(msg, false, false);  // don't requeue -> goes to DLX\n  }\n}, { noAck: false });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Auto-reconnection, RPC pattern (request/reply), and\n//             production-grade consumer management.\n// APPROACH  - Reconnect with backoff; replyTo + correlationId for RPC;\n//             channel pool; graceful close.\n// STRENGTHS - Resilient connections; RPC over RabbitMQ; clean shutdown.\n// WEAKNESSES- RPC over RabbitMQ adds latency vs direct HTTP.\n//\nimport amqp from 'amqplib';\n\nclass RabbitMQClient {\n  constructor(url) {\n    this.url = url;\n    this.conn = null;\n    this.reconnectDelay = 1000;\n  }\n\n  async connect() {\n    try {\n      this.conn = await amqp.connect(this.url);\n      this.reconnectDelay = 1000;\n      this.conn.on('close', () => {\n        setTimeout(() => this.connect(), this.reconnectDelay);\n        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30_000);\n      });\n    } catch (err) {\n      setTimeout(() => this.connect(), this.reconnectDelay);\n      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30_000);\n    }\n  }\n\n  async rpc(exchange, routingKey, payload, timeout = 10_000) {\n    const ch = await this.conn.createChannel();\n    const replyQueue = await ch.assertQueue('', { exclusive: true });\n    const correlationId = crypto.randomUUID();\n\n    return new Promise((resolve, reject) => {\n      const timer = setTimeout(() => { ch.close(); reject(new Error('RPC timeout')); }, timeout);\n\n      ch.consume(replyQueue.queue, (msg) => {\n        if (msg.properties.correlationId === correlationId) {\n          clearTimeout(timer);\n          ch.close();\n          resolve(JSON.parse(msg.content.toString()));\n        }\n      }, { noAck: true });\n\n      ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {\n        replyTo: replyQueue.queue,\n        correlationId,\n      });\n    });\n  }\n\n  async close() { await this.conn.close(); }\n}\n\nconst mq = new RabbitMQClient('amqp://rabbitmq:5672');\nawait mq.connect();\nconst result = await mq.rpc('rpc', 'compute.score', { userId: 42 });"
                  }
        ],
        tips: [
                  "Always set { persistent: true } on messages and { durable: true } on queues — survives broker restarts.",
                  "Use prefetch(1) for fair dispatch — without it, one fast consumer gets all messages.",
                  "Use dead letter exchanges for failed messages — inspect and reprocess without losing data.",
                  "Handle connection close events — RabbitMQ connections drop; auto-reconnect with backoff.",
                  "Use exclusive reply queues for RPC — they auto-delete when the channel closes."
        ],
        mistake: "Using noAck: true in production — if the consumer crashes mid-processing, the message is lost. Always use noAck: false and manually ack/nack.",
        shorthand: {
          verbose: "import amqp from 'amqplib';\nconst conn = await amqp.connect('amqp://localhost');\nconst ch = await conn.createChannel();\nawait ch.assertQueue('tasks', { durable: true });\nch.sendToQueue('tasks', Buffer.from('hello'), { persistent: true });\nch.consume('tasks', (msg) => { ch.ack(msg); }, { noAck: false });",
          concise: "const ch = await (await amqp.connect('amqp://localhost')).createChannel();\nch.assertQueue('q'); ch.sendToQueue('q', Buffer.from('hi')); ch.consume('q', m => ch.ack(m));",
        },
      },
    ],
  },

  // ── Section 3: Kafka — kafkajs, consumers, producers ─────────────────────────────────────────
  {
    id: "kafka",
    title: "Kafka — kafkajs, consumers, producers",
    entries: [
      {
        id: "kafkajs-basics",
        fn: "kafkajs — produce, consume, consumer groups",
        desc: "KafkaJS is the modern Kafka client for Node.js. Supports producers, consumers, consumer groups, transactions, and schema registry. Use Kafka for high-throughput event streaming.",
        category: "Event Streaming",
        subtitle: "new Kafka(), producer.send(), consumer.subscribe(), consumer.run(), consumer groups, partitions",
        signature: "const kafka = new Kafka({ clientId: 'app', brokers: ['localhost:9092'] })",
        descLong: "Kafka is a distributed event streaming platform. Key concepts: Topic, Partition (ordered subset), Consumer Group (parallel processing), Offset (position in partition). KafkaJS provides a clean Promise-based API. Producers write messages to topics; consumers read in consumer groups. Use Kafka for event sourcing, log aggregation, stream processing, and real-time data pipelines.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Produce and consume events from a Kafka topic.\n// APPROACH  - KafkaJS producer.send() and consumer.run() with auto-commit.\n// STRENGTHS - High throughput; durable; consumer groups for parallel processing.\n// WEAKNESSES- Requires Kafka cluster; more ops than Redis/BullMQ.\n//\nimport { Kafka } from 'kafkajs';\n\nconst kafka = new Kafka({ clientId: 'my-app', brokers: ['localhost:9092'] });\n\nconst producer = kafka.producer();\nawait producer.connect();\nawait producer.send({\n  topic: 'user-events',\n  messages: [{ key: 'user-42', value: JSON.stringify({ type: 'signup', userId: 42 }) }],\n});\n\nconst consumer = kafka.consumer({ groupId: 'email-service' });\nawait consumer.connect();\nawait consumer.subscribe({ topic: 'user-events', fromBeginning: true });\nawait consumer.run({\n  eachMessage: async ({ topic, partition, message }) => {\n    const event = JSON.parse(message.value.toString());\n    if (event.type === 'signup') await sendWelcomeEmail(event.userId);\n  },\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Manual offset commit, error handling, multiple topics,\n//             and key-based partitioning for ordering.\n// APPROACH  - autoCommit: false with manual commit; retry on failure;\n//             subscribe to multiple topics; key for partition ordering.\n// STRENGTHS - At-least-once delivery; ordering by key; multi-topic consumers.\n// WEAKNESSES- Manual commit requires careful error handling.\n//\nimport { Kafka, logLevel } from 'kafkajs';\n\nconst kafka = new Kafka({\n  clientId: 'order-service',\n  brokers: ['kafka-1:9092', 'kafka-2:9092', 'kafka-3:9092'],\n  logLevel: logLevel.WARN,\n});\n\nconst consumer = kafka.consumer({ groupId: 'order-processor' });\nawait consumer.connect();\nawait consumer.subscribe({ topic: 'orders' });\nawait consumer.subscribe({ topic: 'payments' });\n\nawait consumer.run({\n  autoCommit: false,\n  eachMessage: async ({ topic, partition, message }) => {\n    const data = JSON.parse(message.value.toString());\n    try {\n      if (topic === 'orders') await processOrder(data);\n      else if (topic === 'payments') await processPayment(data);\n      await consumer.commitOffsets([{\n        topic, partition, offset: (Number(message.offset) + 1).toString(),\n      }]);\n    } catch (err) {\n      logger.error({ topic, err: err.message }, 'processing failed');\n      throw err;\n    }\n  },\n});\n\n// Key-based partitioning — same key -> same partition -> ordering\nconst producer = kafka.producer();\nawait producer.connect();\nawait producer.send({\n  topic: 'orders',\n  messages: [{ key: `user-${userId}`, value: JSON.stringify(order) }],\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Transactions (exactly-once), dead letter topic, and\n//             graceful shutdown.\n// APPROACH  - producer.transaction() for atomic multi-topic writes;\n//             DLQ topic for poison pills; SIGTERM for clean stop.\n// STRENGTHS - Exactly-once with transactions; poison pill handling;\n//             zero-downtime deploys.\n// WEAKNESSES- Transactions require Kafka cluster config; DLQ adds complexity.\n//\nimport { Kafka } from 'kafkajs';\n\nconst kafka = new Kafka({ clientId: 'payment-service', brokers: ['kafka-1:9092', 'kafka-2:9092'] });\n\nconst producer = kafka.producer({\n  transactionalId: 'payment-service-tx',\n  maxInFlightRequestsPerConnection: 1,\n});\nawait producer.connect();\n\nconst consumer = kafka.consumer({ groupId: 'payment-processor' });\nawait consumer.connect();\nawait consumer.subscribe({ topic: 'payments' });\n\nconst dlqProducer = kafka.producer();\nawait dlqProducer.connect();\n\nawait consumer.run({\n  eachMessage: async ({ topic, partition, message }) => {\n    const data = JSON.parse(message.value.toString());\n    const attempt = Number(message.headers?.['x-retry'] || 0);\n    try {\n      const tx = await producer.transaction();\n      try {\n        await tx.send({ topic: 'payment-confirmed', messages: [{ key: data.orderId, value: JSON.stringify(data) }] });\n        await tx.send({ topic: 'inventory-update', messages: [{ key: data.productId, value: JSON.stringify({ action: 'decrement', qty: data.qty }) }] });\n        await tx.commit();\n      } catch (err) { await tx.abort(); throw err; }\n    } catch (err) {\n      if (attempt < 3) {\n        await producer.send({ topic: 'payments', messages: [{ key: message.key, value: message.value, headers: { 'x-retry': String(attempt + 1) } }] });\n      } else {\n        await dlqProducer.send({ topic: 'payments-dlq', messages: [{ key: message.key, value: message.value, headers: { 'x-error': err.message } }] });\n      }\n    }\n  },\n});\n\nasync function shutdown() {\n  await consumer.stop();\n  await consumer.disconnect();\n  await producer.disconnect();\n  await dlqProducer.disconnect();\n  process.exit(0);\n}\nprocess.on('SIGTERM', shutdown);\nprocess.on('SIGINT', shutdown);"
                  }
        ],
        tips: [
                  "Use key-based partitioning for ordering — same key always goes to the same partition.",
                  "Set autoCommit: false for at-least-once semantics — commit only after successful processing.",
                  "Use consumer groups for parallel processing — each partition consumed by one group member.",
                  "Use transactions (transactionalId) for exactly-once across multiple topics.",
                  "Always handle SIGTERM — call consumer.stop() before disconnect() to finish in-flight messages."
        ],
        mistake: "Using autoCommit: true with expensive processing — if the consumer crashes after committing but before finishing, the message is lost. Use manual commit after processing.",
        shorthand: {
          verbose: "import { Kafka } from 'kafkajs';\nconst k = new Kafka({ clientId: 'app', brokers: ['localhost:9092'] });\nconst p = k.producer(); await p.connect();\nawait p.send({ topic: 'events', messages: [{ value: JSON.stringify(data) }] });",
          concise: "const k = new Kafka({ brokers: ['localhost:9092'] });\nconst p = k.producer(); await p.connect(); await p.send({ topic: 't', messages: [{ value: 'd' }] });",
        },
      },
    ],
  },

  // ── Section 4: Redis Pub/Sub & SQS — lightweight messaging ─────────────────────────────────────────
  {
    id: "pubsub",
    title: "Redis Pub/Sub & SQS — lightweight messaging",
    entries: [
      {
        id: "redis-pubsub",
        fn: "Redis pub/sub — real-time event broadcasting",
        desc: "Redis pub/sub is the simplest messaging pattern — publishers send to channels, subscribers receive in real-time. No persistence, no acknowledgments. Use for real-time notifications, chat, and cache invalidation.",
        category: "Pub/Sub",
        subtitle: "publish, subscribe, psubscribe (pattern), pubsub channels, message handler",
        signature: "subscriber.subscribe('channel'); publisher.publish('channel', JSON.stringify(event))",
        descLong: "Redis pub/sub is fire-and-forget: if no subscriber is listening, the message is lost. Messages are not persisted — no replay capability. Use it for real-time notifications, chat rooms, cache invalidation signals, and WebSocket event broadcasting. Pattern subscriptions (psubscribe) match channel names with glob patterns (user.* matches user.created, user.deleted). For durability, use Redis Streams (XADD/XREAD) instead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Broadcast real-time events to multiple Node.js instances.\n// APPROACH  - Redis pub/sub: publisher sends, subscribers receive.\n// STRENGTHS - Sub-millisecond latency; simple API; no extra services.\n// WEAKNESSES- No persistence; no ack; messages lost if no subscriber.\n//\nimport Redis from 'ioredis';\n\nconst publisher = new Redis();\nconst subscriber = new Redis();\n\nsubscriber.subscribe('user-events');\nsubscriber.on('message', (channel, message) => {\n  const event = JSON.parse(message);\n  console.log(`[${channel}] ${event.type}: ${event.userId}`);\n});\n\npublisher.publish('user-events', JSON.stringify({\n  type: 'signup', userId: 42, timestamp: Date.now(),\n}));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Pattern subscriptions, WebSocket relay, typed event handlers.\n// APPROACH  - psubscribe for glob patterns; relay events to WebSocket clients;\n//             typed handlers per event type.\n// STRENGTHS - Flexible routing with patterns; real-time WebSocket push.\n// WEAKNESSES- No replay for late subscribers; no backpressure.\n//\nimport Redis from 'ioredis';\nimport { WebSocketServer } from 'ws';\n\nconst subscriber = new Redis();\nconst publisher = new Redis();\nconst wss = new WebSocketServer({ port: 8080 });\n\nconst clients = new Map();\n\nwss.on('connection', (ws, req) => {\n  const url = new URL(req.url, 'http://localhost');\n  const channel = url.searchParams.get('channel') || 'global';\n  if (!clients.has(channel)) clients.set(channel, new Set());\n  clients.get(channel).add(ws);\n  ws.on('close', () => clients.get(channel)?.delete(ws));\n});\n\nsubscriber.psubscribe('user.*');\nsubscriber.on('pmessage', (pattern, channel, message) => {\n  const event = JSON.parse(message);\n  const subs = clients.get(channel);\n  if (subs) {\n    const payload = JSON.stringify({ channel, event });\n    subs.forEach(ws => { if (ws.readyState === 1) ws.send(payload); });\n  }\n  switch (event.type) {\n    case 'created': onUserCreated(event); break;\n    case 'deleted': onUserDeleted(event); break;\n  }\n});\n\nfunction emitUserEvent(type, userId, data = {}) {\n  publisher.publish(`user.${type}`, JSON.stringify({ type, userId, ...data, timestamp: Date.now() }));\n}\nemitUserEvent('created', 42, { name: 'Alice' });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Redis Streams for durable messaging with consumer groups;\n//             transition from pub/sub to Streams when persistence is needed.\n// APPROACH  - XADD for durable events; XREADGROUP for consumer groups;\n//             XACK for acknowledgment; maxlen for bounded streams.\n// STRENGTHS - Durable; consumer groups for parallel processing; replayable.\n// WEAKNESSES- More complex than pub/sub; requires ack management.\n//\nimport Redis from 'ioredis';\nconst redis = new Redis();\n\n// Producer — add to stream (durable, replayable)\nawait redis.xadd(\n  'events', 'MAXLEN', '~', 10_000, '*',\n  'type', 'signup', 'userId', '42', 'timestamp', String(Date.now())\n);\n\n// Consumer group — parallel processing\ntry { await redis.xgroup('CREATE', 'events', 'email-service', '$'); } catch {}\n\n// Consumer — read from group\nasync function consume() {\n  while (true) {\n    const messages = await redis.xreadgroup(\n      'GROUP', 'email-service', 'consumer-1',\n      'COUNT', 10, 'BLOCK', 5000, 'STREAMS', 'events', '>'\n    );\n\n    if (!messages) continue;\n    for (const [stream, entries] of messages) {\n      for (const [id, fields] of entries) {\n        const event = Object.fromEntries(\n          fields.reduce((acc, v, i) => (i % 2 === 0 ? (acc.push([v]), acc) : (acc[acc.length - 1][1] = v, acc)), [])\n        );\n        try {\n          await processEvent(event);\n          await redis.xack('events', 'email-service', id);\n        } catch (err) {\n          logger.error({ id, err: err.message }, 'stream processing failed');\n        }\n      }\n    }\n  }\n}\nconsume();\n\n// Dead letter — after N retries, move to DLQ stream\nasync function moveToDLQ(id, fields, reason) {\n  await redis.xadd('events-dlq', '*', 'originalId', id, 'reason', reason, ...fields);\n  await redis.xack('events', 'email-service', id);\n}"
                  }
        ],
        tips: [
                  "Pub/sub is fire-and-forget — use Redis Streams (XADD/XREAD) when you need persistence or replay.",
                  "Use separate connections for publisher and subscriber — ioredis blocks the connection when subscribed.",
                  "Pattern subscriptions (psubscribe) use glob matching — user.* matches user.created, user.deleted.",
                  "Use XREADGROUP with consumer groups for parallel stream processing — each consumer gets different messages.",
                  "Set MAXLEN on streams to prevent unbounded memory growth."
        ],
        mistake: "Using the same Redis connection for pub/sub and commands — once subscribed, the connection can only receive messages. Always use separate connections.",
        shorthand: {
          verbose: "const sub = new Redis(); const pub = new Redis();\nsub.subscribe('channel'); sub.on('message', (ch, msg) => console.log(msg));\npub.publish('channel', JSON.stringify(event));",
          concise: "const s = new Redis(), p = new Redis(); s.subscribe('c'); s.on('message', (c,m) => fn(m)); p.publish('c', JSON.stringify(e));",
        },
      },
      {
        id: "sqs-consumer",
        fn: "AWS SQS — sqs-consumer, FIFO vs standard queues",
        desc: "AWS SQS is a managed message queue service. Use sqs-consumer package for Node.js consumers. Standard queues offer at-least-once delivery; FIFO queues offer exactly-once with ordering.",
        category: "Cloud Queues",
        subtitle: "sqs-consumer, sendMessage, receiveMessage, deleteMessage, FIFO, visibility timeout",
        signature: "const consumer = Consumer.create({ queueUrl, handleMessage: async (msg) => { ... } })",
        descLong: "SQS is a fully managed message queue — no infrastructure to maintain. Standard queues provide at-least-once delivery with best-effort ordering. FIFO queues provide exactly-once processing and strict ordering within a message group. Visibility timeout hides a message from other consumers while it's being processed. The sqs-consumer package handles long polling, automatic deletion on success, and error handling. Use SQS for decoupling services in AWS without managing Redis/RabbitMQ.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Process messages from an SQS queue.\n// APPROACH  - sqs-consumer with handleMessage; auto-delete on success.\n// STRENGTHS - Managed service; auto-scaling; no infrastructure.\n// WEAKNESSES- AWS-specific; latency vs Redis/RabbitMQ; cost per request.\n//\nimport { Consumer } from 'sqs-consumer';\nimport { SQSClient } from '@aws-sdk/client-sqs';\n\nconst consumer = Consumer.create({\n  queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/my-queue',\n  sqs: new SQSClient({ region: 'us-east-1' }),\n  handleMessage: async (message) => {\n    const data = JSON.parse(message.Body);\n    await processMessage(data);\n    // Message is auto-deleted on successful return\n  },\n});\n\nconsumer.on('error', (err) => {\n  console.error('SQS error:', err.message);\n});\n\nconsumer.on('processing_error', (err, message) => {\n  console.error('Processing error for message:', message.MessageId, err.message);\n});\n\nconsumer.start();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Send messages to SQS; FIFO queue with message groups;\n//             visibility timeout tuning; batch processing.\n// APPROACH  - SQSClient.sendMessage for producer; MessageGroupId for FIFO\n//             ordering; batchSize and visibilityTimeout for consumer.\n// STRENGTHS - FIFO guarantees ordering; batch processing reduces API calls.\n// WEAKNESSES- FIFO throughput limit is 300 msg/s per message group.\n//\nimport { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';\nimport { Consumer } from 'sqs-consumer';\n\nconst sqs = new SQSClient({ region: 'us-east-1' });\nconst queueUrl = 'https://sqs.us-east-1.amazonaws.com/123/my-queue.fifo';\n\n// Send to FIFO queue — MessageGroupId for ordering\nawait sqs.send(new SendMessageCommand({\n  QueueUrl: queueUrl,\n  MessageBody: JSON.stringify({ orderId: 42, action: 'process' }),\n  MessageGroupId: `user-${userId}`,      // ordering within group\n  MessageDeduplicationId: crypto.randomUUID(),  // dedup for exactly-once\n}));\n\n// Consumer with batch processing and visibility timeout\nconst consumer = Consumer.create({\n  queueUrl,\n  sqs,\n  batchSize: 10,              // process up to 10 messages at once\n  visibilityTimeout: 60,      // 60s to process before message reappears\n  waitTimeSeconds: 20,        // long polling (reduces API calls)\n  handleMessage: async (message) => {\n    const data = JSON.parse(message.Body);\n    await processOrder(data);\n  },\n  handleMessageBatch: async (messages) => {\n    // Batch processing — all must succeed or all are retried\n    await Promise.all(messages.map(async (msg) => {\n      const data = JSON.parse(msg.Body);\n      await processOrder(data);\n    }));\n  },\n});\n\nconsumer.start();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - DLQ configuration, redrive policy, partial batch failure\n//             handling, and production consumer with graceful shutdown.\n// APPROACH  - Configure redrive policy on queue; handle partial batch\n//             failures with sqs-partial-queue; graceful stop on SIGTERM.\n// STRENGTHS - DLQ captures poison pills; partial batch prevents head-of-line\n//             blocking; graceful shutdown prevents message loss.\n// WEAKNESSES- Partial batch requires custom deletion; DLQ adds AWS cost.\n//\nimport { Consumer } from 'sqs-consumer';\nimport { SQSClient, DeleteMessageCommand } from '@aws-sdk/client-sqs';\n\nconst sqs = new SQSClient({ region: 'us-east-1' });\n\nconst consumer = Consumer.create({\n  queueUrl: process.env.SQS_QUEUE_URL,\n  sqs,\n  batchSize: 10,\n  visibilityTimeout: 120,\n  shouldDeleteMessages: false,  // we'll handle deletion manually\n  handleMessage: async (message) => {\n    try {\n      const data = JSON.parse(message.Body);\n      await processWithRetry(data, 3);\n      // Delete on success\n      await sqs.send(new DeleteMessageCommand({\n        QueueUrl: process.env.SQS_QUEUE_URL,\n        ReceiptHandle: message.ReceiptHandle,\n      }));\n    } catch (err) {\n      // Don't delete — message returns to queue after visibility timeout\n      // After maxReceiveCount, SQS moves it to DLQ (configured via redrive policy)\n      logger.error({ messageId: message.MessageId, err: err.message }, 'processing failed');\n      throw err;\n    }\n  },\n});\n\nconsumer.on('error', (err) => {\n  logger.error({ err: err.message }, 'SQS consumer error');\n});\n\nconsumer.start();\n\n// Graceful shutdown\nprocess.on('SIGTERM', () => {\n  console.log('Stopping SQS consumer...');\n  consumer.stop();\n  // Wait for in-flight messages to complete\n  setTimeout(() => process.exit(0), 30_000);\n});\n\n// Terraform: configure DLQ with redrive policy\n// resource \"aws_sqs_queue\" \"dlq\" {\n//   name = \"my-queue-dlq\"\n//   message_retention_seconds = 1209600  // 14 days\n// }\n// resource \"aws_sqs_queue\" \"main\" {\n//   name = \"my-queue\"\n//   redrive_policy = jsonencode({\n//     deadLetterTargetArn = aws_sqs_queue.dlq.arn\n//     maxReceiveCount = 5\n//   })\n// }"
                  }
        ],
        tips: [
                  "Use long polling (waitTimeSeconds: 20) — reduces empty responses and API costs.",
                  "Set visibilityTimeout longer than your max processing time — prevents duplicate processing.",
                  "Configure a DLQ with redrive policy — after maxReceiveCount, poison pills move to DLQ automatically.",
                  "Use FIFO queues only when ordering matters — standard queues have higher throughput.",
                  "Use MessageGroupId for FIFO ordering within a group — different groups are processed in parallel."
        ],
        mistake: "Setting visibilityTimeout too short — if processing takes 30s and timeout is 10s, the message reappears and gets processed by another consumer (duplicate). Set timeout to 2x your max processing time.",
        shorthand: {
          verbose: "import { Consumer } from 'sqs-consumer';\nconst c = Consumer.create({ queueUrl, handleMessage: async (msg) => { await process(JSON.parse(msg.Body)); } });\nc.start();",
          concise: "Consumer.create({ queueUrl, handleMessage: async m => fn(JSON.parse(m.Body)) }).start();",
        },
      },
    ],
  },
]

export default { meta, sections }
