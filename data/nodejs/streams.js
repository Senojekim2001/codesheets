export const meta = {
  "title": "Streams & Buffers",
  "domain": "nodejs",
  "sheet": "streams",
  "icon": "🌊"
}

export const sections = [

  // ── Section 1: Streams & Buffers ─────────────────────────────────────────
  {
    id: "streams-buffers",
    title: "Streams & Buffers",
    entries: [
      {
        id: "readable-stream",
        fn: "Readable Streams",
        desc: "Process data chunk-by-chunk without loading the entire source into memory.",
        category: "Streams",
        subtitle: "Memory-efficient data sources",
        signature: "stream.on(\"data\", chunk => ...)  |  for await (const chunk of stream)",
        descLong: "Readable streams emit data in chunks. Use for...await (async iteration) as the modern approach — it handles backpressure and errors correctly. Classic event-driven API uses \"data\" and \"end\" events. Streams are the foundation of file I/O, HTTP requests, and network sockets in Node.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Readable Streams — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createReadStream } from 'fs';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Readable Streams — common patterns you'll see in production.\n// APPROACH  - Combine Readable Streams with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Modern: async iteration (preferred)\nasync function processFile(path) {\n  const stream = createReadStream(path, { encoding: 'utf-8' });\n  for await (const chunk of stream) {\n    process.stdout.write(chunk);\n  }\n}\n// Classic: event-driven\nfunction readFile(path) {\n  return new Promise((resolve, reject) => {\n    const chunks = [];\n    const stream = createReadStream(path);\n    stream.on('data', chunk => chunks.push(chunk));\n    stream.on('end',  () => resolve(Buffer.concat(chunks)));\n    stream.on('error', reject);\n  });\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Readable Streams — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Custom Readable\nimport { Readable } from 'stream';\nconst readable = new Readable({\n  read() {\n    this.push('Hello');\n    this.push(' World');\n    this.push(null); // signals end\n  }\n});"
                  }
        ],
        tips: [
                  "for await...of is the modern way to consume streams — simpler than event listeners.",
                  "Always handle the \"error\" event or use pipeline() — unhandled stream errors crash the process.",
                  "createReadStream with highWaterMark controls chunk size — default is 64KB.",
                  "Readable.from(array) creates a Readable from an array or async iterable."
        ],
        mistake: "Reading an entire large file with fs.readFile() when streaming would avoid memory issues. Use createReadStream() for files over a few MB.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "pipeline",
        fn: "pipeline()",
        desc: "Pipes a series of streams together and handles cleanup when any stream errors or ends.",
        category: "Streams",
        subtitle: "Safe stream composition with cleanup",
        signature: "await pipeline(source, ...transforms, destination)",
        descLong: "pipeline() (from stream/promises) is the safe way to pipe streams. Unlike stream.pipe(), it automatically destroys all streams on error and handles cleanup. Use it whenever you chain more than one stream. Pass a Transform stream in the middle for transformations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of pipeline() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';\nimport { pipeline } from 'stream/promises';\nimport { createReadStream, createWriteStream } from 'fs';\nimport { createGzip } from 'zlib';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of pipeline() — common patterns you'll see in production.\n// APPROACH  - Combine pipeline() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Compress a file\nasync function compress(input, output) {\n  await pipeline(\n    createReadStream(input),\n    createGzip(),\n    createWriteStream(output)\n  );\n  console.log('Compressed!');\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of pipeline() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// HTTP response streaming\nimport { pipeline as pipelineCallback } from 'stream';\napp.get('/download', (req, res) => {\n  res.setHeader('Content-Type', 'application/octet-stream');\n  pipelineCallback(\n    createReadStream('./large-file.zip'),\n    res,\n    err => { if (err) console.error('Stream error:', err); }\n  );\n});"
                  }
        ],
        tips: [
                  "Always use pipeline() over stream.pipe() — .pipe() doesn't clean up properly on errors.",
                  "pipeline() from \"stream/promises\" returns a Promise — use await for clean async control.",
                  "Transform streams sit in the middle of a pipeline — they receive data and emit transformed data.",
                  "PassThrough is a special Transform that emits its input unchanged — useful for tapping a pipeline."
        ],
        mistake: "Using stream.pipe(dest) in production — if the source errors, the destination isn't automatically destroyed, potentially leaking file descriptors. Use pipeline().",
        shorthand: {
          verbose: "createReadStream(input)\n  .pipe(createGzip())\n  .pipe(createWriteStream(output))\n  .on('error', err => console.error(err));",
          concise: "await pipeline(\n  createReadStream(input),\n  createGzip(),\n  createWriteStream(output)\n);  // Auto-cleanup on error",
        },
      },
      {
        id: "transform-stream",
        fn: "Transform Streams",
        desc: "Readable/Writable streams that transform data passing through them — encryption, compression, parsing.",
        category: "Streams",
        subtitle: "In-flight data transformation",
        signature: "new Transform({ transform(chunk, encoding, callback) { this.push(output); callback(); } })",
        descLong: "Transform streams implement both Readable and Writable interfaces. Data written in comes out transformed. The transform() method receives chunks and must call this.push() to emit output and callback() (or callback(err)) to signal readiness for more data. The flush() method runs once after all input is consumed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Transform Streams — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport fs from 'fs';\nimport { Transform } from 'stream';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Transform Streams — common patterns you'll see in production.\n// APPROACH  - Combine Transform Streams with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Uppercase transform\nconst upperCase = new Transform({\n  transform(chunk, encoding, callback) {\n    this.push(chunk.toString().toUpperCase());\n    callback(); // ready for next chunk\n  }\n});\n// JSON line parser (newline-delimited JSON)\nconst jsonParser = new Transform({\n  objectMode: true,\n  transform(chunk, encoding, callback) {\n    const lines = chunk.toString().split('\\n').filter(Boolean);\n    for (const line of lines) {\n      try { this.push(JSON.parse(line)); } catch {}\n    }\n    callback();\n  }\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Transform Streams — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nawait pipeline(\n  createReadStream('./data.ndjson'),\n  jsonParser,\n  new Writable({\n    objectMode: true,\n    write(obj, enc, cb) { console.log(obj); cb(); }\n  })\n);"
                  }
        ],
        tips: [
                  "Set objectMode: true to push/receive JS objects instead of Buffers.",
                  "callback(new Error(...)) signals an error and destroys the pipeline.",
                  "Implement flush() to emit any remaining buffered data after input ends.",
                  "zlib.createGzip() and zlib.createGunzip() are built-in Transform streams."
        ],
        mistake: "Forgetting to call callback() in the transform method — the stream stalls because Node is waiting for the signal that the transform is done processing.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "buffer",
        fn: "Buffer",
        desc: "Fixed-size chunk of memory for binary data — used throughout Node for file I/O, networking, and crypto.",
        category: "Buffers",
        subtitle: "Raw binary data handling",
        signature: "Buffer.from(data)  |  Buffer.alloc(size)  |  buf.toString(encoding)",
        descLong: "Buffers represent raw binary data. Buffer.from() creates from strings, arrays, or ArrayBuffers. Buffer.alloc() creates a zero-filled buffer of a given byte length. Convert to string with buf.toString(encoding) — supports utf8, base64, hex, latin1. Buffers are instances of Uint8Array.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Buffer — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Create\nconst buf1 = Buffer.from('Hello World', 'utf8');\nconst buf2 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);\nconst buf3 = Buffer.alloc(10);        // 10 zero bytes\nconst buf4 = Buffer.allocUnsafe(10);  // faster, uninitialized"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Buffer — common patterns you'll see in production.\n// APPROACH  - Combine Buffer with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Convert\nbuf1.toString('utf8');    // 'Hello World'\nbuf1.toString('base64'); // 'SGVsbG8gV29ybGQ='\nbuf1.toString('hex');    // '48656c6c6f...'\n// Concatenate\nconst combined = Buffer.concat([buf1, buf2]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Buffer — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Compare\nBuffer.from('abc').equals(Buffer.from('abc')); // true\n// Encoding/decoding\nconst b64 = Buffer.from('hello').toString('base64');\nBuffer.from(b64, 'base64').toString('utf8'); // 'hello'"
                  }
        ],
        tips: [
                  "Buffer.alloc(n) zero-fills — always prefer it over allocUnsafe() unless performance is critical.",
                  "Buffers are Uint8Arrays — spread into an array with [...buf] or use buf.toJSON().data.",
                  "Use Buffer.byteLength(str) to get byte count, not str.length (which gives character count).",
                  "For base64url encoding (URL-safe), replace +/= with -/_ after encoding."
        ],
        mistake: "Using Buffer() constructor directly — it's deprecated. Use Buffer.from(), Buffer.alloc(), or Buffer.allocUnsafe() instead.",
        shorthand: {
          verbose: "const buf = Buffer.alloc(10);\nbuf.write('hello', 'utf8');\nconsole.log(buf.toString('utf8'));\nconst b64 = buf.toString('base64');",
          concise: "const buf = Buffer.from('hello', 'utf8');\nconst b64 = buf.toString('base64');  // Conversions\nconst decoded = Buffer.from(b64, 'base64');",
        },
      },
      {
        id: "readline",
        fn: "readline",
        desc: "Process a file or stream line by line — memory efficient for large text files.",
        category: "Stream Patterns",
        subtitle: "Line-by-line processing with async iteration",
        signature: "readline.createInterface({ input: stream })  →  for await (const line of rl)",
        descLong: "readline.createInterface wraps a Readable stream and emits lines. The async iteration pattern (for await...of) is the modern approach — it handles backpressure and cleanup automatically. Essential for processing large CSV, NDJSON, or log files without loading them into memory.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of readline — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createReadStream } from 'fs';\nimport { createInterface } from 'readline';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of readline — common patterns you'll see in production.\n// APPROACH  - Combine readline with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nasync function processLines(filePath) {\n  const fileStream = createReadStream(filePath);\n  const rl = createInterface({\n    input: fileStream,\n    crlfDelay: Infinity, // handle Windows line endings\n  });\n  let lineCount = 0;\n  for await (const line of rl) {\n    if (!line.trim()) continue; // skip blank lines\n    const record = JSON.parse(line); // parse NDJSON\n    await processRecord(record);\n    lineCount++;\n  }\n  return lineCount;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of readline — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Interactive CLI input\nconst rl = createInterface({\n  input: process.stdin,\n  output: process.stdout,\n});\nrl.question('Enter your name: ', (name) => {\n  console.log(`Hello, ${name}`);\n  rl.close();\n});"
                  }
        ],
        tips: [
                  "crlfDelay: Infinity correctly handles Windows (CRLF) and Unix (LF) line endings.",
                  "for await...of on a readline interface is cleaner than the \"line\" event pattern.",
                  "rl.close() releases the underlying stream — always call it when done.",
                  "Use readline for NDJSON (newline-delimited JSON) — parse each line individually."
        ],
        mistake: "Loading an entire file into memory with readFile just to split by newlines — use readline + a stream for files larger than a few MB.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "line-by-line",
        fn: "line-by-line",
        desc: "Read a file line by line using the line-by-line npm package.",
        category: "Stream Patterns",
        subtitle: "Simple line-by-line reading with event emitters",
        signature: "new LineByLine(stream)  |  rl.on(\"line\", line => {...})",
        descLong: "The line-by-line npm package provides a simpler alternative to Node's readline module. It reads a stream or file line by line and emits \"line\" and \"end\" events. Useful for straightforward line processing without async/await complexity, though readline with for await is now the modern standard.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of line-by-line — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport LineByLine from 'line-by-line';\nimport { createReadStream } from 'fs';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of line-by-line — common patterns you'll see in production.\n// APPROACH  - Combine line-by-line with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Event-based processing:\nconst lineReader = new LineByLine('./data.txt');\nlet lineCount = 0;\nlineReader.on('line', (line) => {\n  if (!line.trim()) return;\n  const record = JSON.parse(line); // parse NDJSON\n  processRecord(record);\n  lineCount++;\n});\nlineReader.on('end', () => {\n  console.log(`Processed ${lineCount} lines`);\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of line-by-line — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nlineReader.on('error', (err) => {\n  console.error('Read error:', err);\n});\n// With a custom stream:\nconst fileStream = createReadStream('./large-file.ndjson');\nconst lr = new LineByLine(fileStream);\nlr.on('line', (line) => {\n  const obj = JSON.parse(line);\n  console.log(obj);\n});"
                  }
        ],
        tips: [
                  "line-by-line is event-based — similar to readline's \"line\" event pattern.",
                  "Modern code should prefer readline with for await...of — it's built-in and cleaner.",
                  "line-by-line still useful in legacy codebases or when event pattern is preferred.",
                  "Always handle the \"error\" event to catch stream read errors."
        ],
        mistake: "Choosing line-by-line over Node's built-in readline module — readline is now the standard and works with async/await, avoiding an extra dependency.",
        shorthand: {
          verbose: "const lr = new LineByLine('./file.txt');\nlr.on('line', line => {\n  const obj = JSON.parse(line);\n  processRecord(obj);\n});\nlr.on('end', () => console.log('Done'));",
          concise: "const rl = createInterface({ input: createReadStream('./file.txt') });\nfor await (const line of rl) {\n  const obj = JSON.parse(line);\n  await processRecord(obj);  // Modern & built-in\n}",
        },
      },
      {
        id: "writable-streams",
        fn: "Writable Streams",
        desc: "Write data to a destination in chunks — files, HTTP responses, sockets, and custom sinks.",
        category: "Stream Patterns",
        subtitle: "Streaming writes to any destination",
        signature: "createWriteStream(path)  |  new Writable({ write(chunk, enc, cb) {} })",
        descLong: "Writable streams accept chunks of data and write them to a destination. createWriteStream() is the most common — it writes to a file and handles buffering automatically. Implement custom Writables by extending Writable or passing options to the constructor. The drain event signals the write buffer is empty after a full backpressure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Writable Streams — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createWriteStream } from 'fs';\nimport { Writable } from 'stream';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Writable Streams — common patterns you'll see in production.\n// APPROACH  - Combine Writable Streams with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// File write stream\nconst writer = createWriteStream('./output.csv', { encoding: 'utf8' });\nwriter.write('name,age\n');\nwriter.write('Alice,30\n');\nwriter.end(); // flush and close\nwriter.on('finish', () => console.log('File written'));\nwriter.on('error', err => console.error(err));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Writable Streams — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Custom Writable — collect to array\nclass CollectorStream extends Writable {\n  constructor() {\n    super({ objectMode: true });\n    this.items = [];\n  }\n  _write(chunk, encoding, callback) {\n    this.items.push(chunk);\n    callback(); // signal ready for more\n  }\n}\n// Backpressure — check write() return value\nfunction writeWithBackpressure(writable, chunks) {\n  function write(index) {\n    if (index >= chunks.length) { writable.end(); return; }\n    const ok = writable.write(chunks[index]);\n    if (ok) write(index + 1);\n    else writable.once('drain', () => write(index + 1));\n  }\n  write(0);\n}"
                  }
        ],
        tips: [
                  "write() returns false when the internal buffer is full — stop writing and wait for \"drain\".",
                  "Use pipeline() to handle backpressure automatically between Readable and Writable.",
                  "Always handle the \"error\" event — unhandled stream errors crash the process.",
                  "objectMode: true lets Writables receive JS objects instead of Buffers/strings."
        ],
        mistake: "Ignoring the return value of write() — if it returns false, you must wait for \"drain\" before writing more to avoid unbounded memory growth.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "stream-backpressure-advanced",
        fn: "Stream Backpressure Handling",
        desc: "Manage backpressure when writing faster than reading — prevent memory bloat by respecting write() return values.",
        category: "Streams",
        subtitle: "Memory-efficient streaming with flow control",
        signature: "if (!writable.write(chunk)) { readable.pause(); writable.once(\"drain\", () => readable.resume()); }",
        descLong: "When a Writable's internal buffer fills, write() returns false. Ignore this and memory grows unbounded. The correct pattern: stop writing, wait for the \"drain\" event (buffer emptied), then resume. pipeline() handles this automatically, but manual pipe chains need explicit backpressure handling.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Stream Backpressure Handling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createReadStream, createWriteStream } from 'fs';\nimport { Readable, Writable } from 'stream';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Stream Backpressure Handling — common patterns you'll see in production.\n// APPROACH  - Combine Stream Backpressure Handling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// BAD: ignores backpressure\nfunction badPipe(readable, writable) {\n  readable.on('data', (chunk) => {\n    writable.write(chunk); // Ignores return value!\n    // Buffer grows indefinitely if reader is faster than writer\n  });\n}\n// GOOD: respects backpressure\nfunction goodPipe(readable, writable) {\n  function write() {\n    let chunk;\n    while (null !== (chunk = readable.read())) {\n      const ok = writable.write(chunk);\n      if (!ok) {\n        console.log('Backpressure detected, pausing read');\n        return; // Stop reading\n      }\n    }\n  }\n  readable.on('readable', write);\n  readable.on('end', () => writable.end());\n  writable.on('drain', () => {\n    console.log('Drain event, resuming read');\n    write(); // Resume reading\n  });\n  writable.on('error', (err) => {\n    readable.destroy(err);\n  });\n}\n// BEST: use pipeline (handles backpressure automatically)\nimport { pipeline } from 'stream/promises';\nasync function streamWithPipeline() {\n  const src = createReadStream('./large-file.bin');\n  const dst = createWriteStream('./copy.bin');\n  try {\n    await pipeline(src, dst);\n    console.log('Streamed without backpressure issues');\n  } catch (err) {\n    console.error('Pipeline error:', err);\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Stream Backpressure Handling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Custom Readable that respects backpressure\nclass SlowCounter extends Readable {\n  constructor(limit = 10) {\n    super();\n    this.current = 0;\n    this.limit = limit;\n  }\n  read() {\n    if (this.current >= this.limit) {\n      this.push(null); // EOF\n      return;\n    }\n    const data = `${++this.current}\\n`;\n    this.push(data);\n  }\n}\n// Custom Writable that has slow processing (causes backpressure)\nclass SlowWriter extends Writable {\n  write(chunk, encoding, callback) {\n    // Simulate slow I/O\n    setTimeout(() => {\n      process.stdout.write(`Processed: ${chunk}`);\n      callback(); // Signal ready for next chunk\n    }, 100);\n  }\n}\n// Demonstrate backpressure\nconst reader = new SlowCounter(50);\nconst writer = new SlowWriter();\nreader.on('data', (chunk) => {\n  const ok = writer.write(chunk);\n  if (!ok) {\n    console.log('Backpressure, pausing source');\n    reader.pause();\n  }\n});\nwriter.on('drain', () => {\n  console.log('Drain, resuming source');\n  reader.resume();\n});\nreader.on('end', () => writer.end());"
                  }
        ],
        tips: [
                  "Always use pipeline() for stream chains — it handles backpressure automatically.",
                  "If manually piping, check write() return value and pause/resume the source.",
                  "Monitor process.memoryUsage() while streaming large files — backpressure misses cause memory to balloon.",
                  "highWaterMark option controls the threshold for backpressure — lower values mean earlier pause signals."
        ],
        mistake: "Ignoring write() return value and pushing data indefinitely — causes unbounded memory growth and eventual crash.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "stream-from-readable",
        fn: "Readable.from() / stream.Readable.from()",
        desc: "Convert arrays, iterables, and async iterables into Readable streams.",
        category: "Streams",
        subtitle: "Convert iterables to streams",
        signature: "Readable.from(iterable)  |  Readable.from(asyncGenerator)",
        descLong: "Readable.from() transforms arrays, iterables, and async iterables into Readable streams. Useful for converting in-memory data to stream format for consistent pipeline handling. Pairs well with pipeline() and Transform for processing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Readable.from() / stream.Readable.from() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport fs from 'fs';\nimport { Readable, Transform, Writable } from 'stream';\nimport { pipeline } from 'stream/promises';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Readable.from() / stream.Readable.from() — common patterns you'll see in production.\n// APPROACH  - Combine Readable.from() / stream.Readable.from() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Convert array to Readable\nconst data = ['apple', 'banana', 'cherry', 'date'];\nconst readable = Readable.from(data);\n// Consume via async iteration\nfor await (const item of readable) {\n  console.log(item);\n}\n// Convert generator to Readable\nfunction* numberGenerator(max) {\n  for (let i = 1; i <= max; i++) {\n    yield i;\n  }\n}\nconst numberStream = Readable.from(numberGenerator(5));\n// Async generator (simulates data fetching)\nasync function* fetchUserIds() {\n  const userIds = [1, 2, 3, 4, 5];\n  for (const id of userIds) {\n    await new Promise(r => setTimeout(r, 100)); // Simulate API call\n    yield id;\n  }\n}\nconst userIdStream = Readable.from(fetchUserIds());\n// Pipeline example: fetch → transform → output\nconst userTransform = new Transform({\n  objectMode: true,\n  async transform(userId, encoding, callback) {\n    // Simulate fetching user data\n    const user = { id: userId, name: `User ${userId}` };\n    this.push(JSON.stringify(user) + '\\n');\n    callback();\n  },\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Readable.from() / stream.Readable.from() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst outputWriter = new Writable({\n  objectMode: true,\n  write(chunk, encoding, callback) {\n    console.log('Output:', chunk.toString());\n    callback();\n  },\n});\n// Use in pipeline\nawait pipeline(\n  Readable.from(fetchUserIds()),\n  userTransform,\n  outputWriter\n);\n// CSV processing example\nasync function* csvRecords(filePath) {\n  const { createReadStream } = await import('fs');\n  const { createInterface } = await import('readline');\n  const fileStream = createReadStream(filePath);\n  const rl = createInterface({ input: fileStream });\n  for await (const line of rl) {\n    const [name, email, age] = line.split(',');\n    yield { name, email, age: Number(age) };\n  }\n}\nconst csvStream = Readable.from(csvRecords('./data.csv'));\nconst processRecords = new Transform({\n  objectMode: true,\n  transform(record, enc, cb) {\n    if (record.age > 18) {\n      this.push(record);\n    }\n    cb();\n  },\n});\nawait pipeline(csvStream, processRecords, outputWriter);"
                  }
        ],
        tips: [
                  "Readable.from(iterable) is the modern way to convert data sources to streams.",
                  "Use objectMode: true when working with JavaScript objects instead of Buffers.",
                  "Async generators are perfect for simulating streamed data (API calls, database cursors).",
                  "Readable.from() is lazy — iteration only happens when data is requested, respecting backpressure."
        ],
        mistake: "Converting large arrays to streams at construction time — the array still exists in memory. Use generators to lazily generate data.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "duplex-passthrough",
        fn: "Duplex & PassThrough Streams",
        desc: "Duplex: simultaneously readable and writable. PassThrough: forwards data unchanged.",
        category: "Streams",
        subtitle: "Bidirectional and pass-through streaming",
        signature: "new Duplex({ read() { }, write() { } })  |  new PassThrough()",
        descLong: "Duplex streams are both readable and writable (e.g., TCP sockets, TLS connections). PassThrough passes data through unchanged — useful for tapping pipelines to inspect data. Both support objectMode and backpressure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Duplex & PassThrough Streams — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { Duplex, PassThrough, Transform, pipeline } from 'stream';\nimport { pipeline as pipelineAsync } from 'stream/promises';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Duplex & PassThrough Streams — common patterns you'll see in production.\n// APPROACH  - Combine Duplex & PassThrough Streams with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Duplex: echo server (reads input, writes it back)\nconst echoServer = new Duplex({\n  read() {\n    // Implementation if needed\n  },\n  write(chunk, encoding, callback) {\n    console.log('Server received:', chunk.toString());\n    this.push(chunk); // Echo back\n    callback();\n  },\n});\n// PassThrough for tapping pipeline data\nconst tap = new PassThrough();\ntap.on('data', (chunk) => {\n  console.log('Tap observed:', chunk.toString());\n});\n// Use PassThrough in middle of pipeline to inspect data\nconst readable = require('fs').createReadStream('./data.txt');\nconst transform = new Transform({\n  transform(chunk, enc, cb) {\n    this.push(chunk.toString().toUpperCase());\n    cb();\n  },\n});\nconst writable = require('fs').createWriteStream('./output.txt');\n// Tap the pipeline\nawait pipelineAsync(\n  readable,\n  tap, // PassThrough for inspection\n  transform,\n  writable\n);\n// Custom Duplex: simple multiplexer\nclass Echo extends Duplex {\n  constructor() {\n    super({ objectMode: true });\n    this.inputBuffer = [];\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Duplex & PassThrough Streams — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n_read() {\n    if (this.inputBuffer.length > 0) {\n      const item = this.inputBuffer.shift();\n      this.push(item);\n    }\n  }\n  _write(chunk, encoding, callback) {\n    // Echo: push immediately\n    this.inputBuffer.push(chunk);\n    this._read(); // Try to flush buffer\n    callback();\n  }\n}\nconst echo = new Echo();\necho.write('Hello');\necho.write('World');\nfor await (const data of echo) {\n  console.log('Echo:', data);\n}\n// Net socket is a built-in Duplex\nimport net from 'net';\nconst socket = new net.Socket();\nsocket.write('request');     // Write\nsocket.on('data', (chunk) => {  // Read\n  console.log('Response:', chunk);\n});"
                  }
        ],
        tips: [
                  "Duplex is used for bidirectional communication — TCP sockets, TLS, WebSockets.",
                  "PassThrough is perfect for debugging pipelines — add it anywhere to tap the flow.",
                  "Both support objectMode for non-Buffer data.",
                  "Implement _read() and _write() methods, not read() and write() (underscore prefix for internals)."
        ],
        mistake: "Implementing read() and write() directly instead of _read() and _write() — the public methods are for consumers.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "zlib-compression",
        fn: "zlib (Compression)",
        desc: "Gzip and deflate compression streams — compress files and HTTP responses with pipeline.",
        category: "Stream Patterns",
        subtitle: "Stream-based compression and decompression",
        signature: "createGzip()  |  createBrotliCompress()  |  createInflate()  |  createBrotliDecompress()",
        descLong: "zlib provides Transform streams for compression. createGzip() compresses, createInflate() decompresses. createBrotliCompress() uses better Brotli algorithm. All integrate seamlessly with pipeline(). Set level (0-9) for compression-speed tradeoff.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of zlib (Compression) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createGzip, createBrotliCompress, createInflate } from 'zlib';\nimport { createReadStream, createWriteStream } from 'fs';\nimport { pipeline } from 'stream/promises';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of zlib (Compression) — common patterns you'll see in production.\n// APPROACH  - Combine zlib (Compression) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Compress file with gzip\nasync function gzipFile(inputPath, outputPath) {\n  const input = createReadStream(inputPath);\n  const output = createWriteStream(outputPath);\n  const gzip = createGzip({ level: 9 }); // Max compression\n  try {\n    await pipeline(input, gzip, output);\n    console.log('File compressed');\n  } catch (err) {\n    console.error('Compression error:', err);\n  }\n}\n// Decompress gzipped file\nasync function gunzipFile(inputPath, outputPath) {\n  const input = createReadStream(inputPath);\n  const output = createWriteStream(outputPath);\n  const gunzip = createInflate(); // or createGunzip()\n  await pipeline(input, gunzip, output);\n  console.log('File decompressed');\n}\n// HTTP response compression\nimport express from 'express';\nimport { createBrotliCompress } from 'zlib';\nconst app = express();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of zlib (Compression) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\napp.get('/large-response', (req, res) => {\n  const largeData = JSON.stringify({\n    items: Array.from({ length: 10000 }, (_, i) => ({\n      id: i,\n      name: `Item ${i}`,\n      description: 'Lorem ipsum dolor sit amet...',\n    })),\n  });\n  // Check if client accepts brotli\n  const acceptEncoding = req.headers['accept-encoding'] || '';\n  if (acceptEncoding.includes('br')) {\n    res.setHeader('Content-Encoding', 'br');\n    pipeline(\n      async function* () { yield largeData; }(),\n      createBrotliCompress(),\n      res,\n      (err) => {\n        if (err) console.error('Pipe error:', err);\n      }\n    );\n  } else if (acceptEncoding.includes('gzip')) {\n    res.setHeader('Content-Encoding', 'gzip');\n    pipeline(\n      async function* () { yield largeData; }(),\n      createGzip({ level: 6 }),\n      res,\n      (err) => {\n        if (err) console.error('Pipe error:', err);\n      }\n    );\n  } else {\n    res.send(largeData);\n  }\n});\n// Compress tar archive\nimport { exec } from 'child_process';\nimport { promisify } from 'util';\nasync function compressArchive(inputTar, outputTarGz) {\n  const input = createReadStream(inputTar);\n  const output = createWriteStream(outputTarGz);\n  const gzip = createGzip({ level: 9 });\n  await pipeline(input, gzip, output);\n}\napp.listen(3000);"
                  }
        ],
        tips: [
                  "Brotli (createBrotliCompress) provides 15-20% better compression than gzip — use if client supports it.",
                  "compression level 0=fastest, 9=best — default 6 is usually good balance.",
                  "Always check Accept-Encoding header before compressing HTTP responses.",
                  "Uncompress in pipeline too: pipeline(createReadStream(gz), createInflate(), outputStream)."
        ],
        mistake: "Compressing already-compressed formats (JPEG, MP3, ZIP) — wastes CPU with no benefit.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "object-mode-streams",
        fn: "Object Mode Streams",
        desc: "Stream JavaScript objects instead of Buffers — use objectMode for data processing pipelines.",
        category: "Stream Patterns",
        subtitle: "Non-binary streaming",
        signature: "new Transform({ objectMode: true, transform(obj, enc, cb) { } })",
        descLong: "By default streams handle Buffers and strings. objectMode: true allows pushing/receiving any JavaScript value — objects, arrays, primitives. Perfect for data transformation pipelines (JSON parsing, CSV rows, database records).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object Mode Streams — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport fs from 'fs';\nimport { Readable, Transform, Writable, pipeline } from 'stream';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object Mode Streams — common patterns you'll see in production.\n// APPROACH  - Combine Object Mode Streams with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Readable that emits objects\nconst objectReader = new Readable({\n  objectMode: true,\n  read() {\n    const users = [\n      { id: 1, name: 'Alice', age: 30 },\n      { id: 2, name: 'Bob', age: 25 },\n      { id: 3, name: 'Charlie', age: 35 },\n    ];\n    if (users.length === 0) {\n      this.push(null); // EOF\n    } else {\n      this.push(users.shift());\n    }\n  },\n});\n// Transform: filter by age\nconst ageFilter = new Transform({\n  objectMode: true,\n  transform(user, encoding, callback) {\n    if (user.age >= 30) {\n      this.push(user);\n    }\n    callback();\n  },\n});\n// Transform: map to different structure\nconst userMapper = new Transform({\n  objectMode: true,\n  transform(user, encoding, callback) {\n    const mapped = {\n      userId: user.id,\n      displayName: user.name.toUpperCase(),\n    };\n    this.push(mapped);\n    callback();\n  },\n});\n// Writable: collect objects\nclass Collector extends Writable {\n  constructor() {\n    super({ objectMode: true });\n    this.collected = [];\n  }\n  _write(chunk, encoding, callback) {\n    this.collected.push(chunk);\n    callback();\n  }\n}\nconst collector = new Collector();\n// Pipeline\npipeline(\n  objectReader,\n  ageFilter,\n  userMapper,\n  collector,\n  (err) => {\n    if (err) {\n      console.error('Pipeline error:', err);\n    } else {\n      console.log('Collected:', collector.collected);\n    }\n  }\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object Mode Streams — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// JSON lines parser (NDJSON)\nconst { createReadStream } = await import('fs');\nconst { createInterface } = await import('readline');\nconst ndjsonParser = new Transform({\n  objectMode: true,\n  transform(line, encoding, callback) {\n    try {\n      const obj = JSON.parse(line);\n      this.push(obj);\n    } catch (err) {\n      // Skip invalid lines\n    }\n    callback();\n  },\n});\nconst fileStream = createReadStream('./data.ndjson');\nconst rl = createInterface({ input: fileStream });\nconst reader = Readable.from(rl);\nconst csvFormatter = new Transform({\n  objectMode: true,\n  transform(obj, encoding, callback) {\n    const csv = `${obj.name},${obj.email},${obj.age}\\n`;\n    this.push(csv);\n    callback();\n  },\n});\nconst output = createWriteStream('./output.csv');\nawait pipeline(\n  reader,\n  ndjsonParser,\n  csvFormatter,\n  output\n);"
                  }
        ],
        tips: [
                  "objectMode is essential for data transformation pipelines — don't fight it with string encoding.",
                  "NDJSON (newline-delimited JSON) is perfect for objectMode streams.",
                  "Always set objectMode: true on both the Readable and Writable if using objects.",
                  "Backpressure still applies in objectMode — respect write() return values."
        ],
        mistake: "Trying to push objects in default mode (will convert to string \"[object Object]\"). Always use objectMode: true.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
    ],
  },
]

export default { meta, sections }
