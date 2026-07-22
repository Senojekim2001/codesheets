export const meta = {
  "title": "AI & ML in Node.js",
  "domain": "nodejs",
  "sheet": "ai-ml",
  "icon": "🤖"
}

export const sections = [

  // ── Section 1: LLM SDKs & AI Integration ─────────────────────────────────────────
  {
    id: "llm-sdks",
    title: "LLM SDKs & AI Integration",
    entries: [
      {
        id: "openai-vercel-sdk",
        fn: "OpenAI SDK & Vercel AI SDK — Streaming Chat & Structured Output",
        desc: "Build AI features in Node.js: OpenAI chat completions, Vercel AI SDK streaming, structured outputs, and multi-provider support.",
        category: "LLM SDKs",
        subtitle: "openai, @ai-sdk/openai, streamText, generateObject, tool calling",
        signature: "openai.chat.completions.create()  |  streamText({ model, messages })  |  generateObject()",
        descLong: "The OpenAI Node.js SDK provides typed access to GPT-4o, o1, and other models. The Vercel AI SDK (ai package) adds framework-agnostic streaming, structured output, and multi-provider support (OpenAI, Anthropic, Google, Mistral) with a unified API. streamText() streams tokens for real-time UIs. generateObject() returns typed, validated objects using Zod schemas. Tool calling lets LLMs invoke your functions. Both SDKs support Edge Runtime, making them ideal for serverless AI features.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of OpenAI SDK & Vercel AI SDK — Streaming Chat & Structured Output — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport OpenAI from 'openai';\nconst openai = new OpenAI(); // uses OPENAI_API_KEY env var\nconst response = await openai.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [\n    { role: 'system', content: 'You are a helpful assistant.' },\n    { role: 'user', content: 'Explain async/await in 2 sentences.' },\n  ],\n  temperature: 0.7,\n  max_tokens: 200,\n});\nconsole.log(response.choices[0].message.content);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of OpenAI SDK & Vercel AI SDK — Streaming Chat & Structured Output — common patterns you'll see in production.\n// APPROACH  - Combine OpenAI SDK & Vercel AI SDK — Streaming Chat & Structured Output with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst stream = await openai.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: 'Write a poem about Node.js' }],\n  stream: true,\n});\nfor await (const chunk of stream) {\n  const text = chunk.choices[0]?.delta?.content || '';\n  process.stdout.write(text);\n}\nimport { streamText, generateText, generateObject } from 'ai';\nimport { openai } from '@ai-sdk/openai';\nimport { anthropic } from '@ai-sdk/anthropic';\nimport { z } from 'zod';\n// Stream text (works with any provider)\nconst result = await streamText({\n  model: openai('gpt-4o'),  // or anthropic('claude-3-opus')\n  messages: [{ role: 'user', content: 'Explain React hooks' }],\n});\nfor await (const text of result.textStream) {\n  process.stdout.write(text);\n}\nconst { object } = await generateObject({\n  model: openai('gpt-4o'),\n  schema: z.object({\n    recipe: z.object({\n      name: z.string(),\n      ingredients: z.array(z.object({\n        item: z.string(),\n        amount: z.string(),\n      })),\n      steps: z.array(z.string()),\n      prepTime: z.number().describe('Prep time in minutes'),\n    }),\n  }),\n  prompt: 'Generate a recipe for chocolate chip cookies.',\n});\nconsole.log(object.recipe.name);        // \"Classic Chocolate Chip Cookies\"\nconsole.log(object.recipe.ingredients);  // [{item: \"flour\", amount: \"2 cups\"}, ...]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of OpenAI SDK & Vercel AI SDK — Streaming Chat & Structured Output — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nimport { tool } from 'ai';\nconst result2 = await generateText({\n  model: openai('gpt-4o'),\n  tools: {\n    getWeather: tool({\n      description: 'Get weather for a location',\n      parameters: z.object({\n        city: z.string(),\n        unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),\n      }),\n      execute: async ({ city, unit }) => {\n        // Call weather API\n        return { city, temp: 22, unit, condition: 'sunny' };\n      },\n    }),\n  },\n  prompt: 'What is the weather in Tokyo?',\n});\nimport express from 'express';\nconst app = express();\napp.post('/api/chat', async (req, res) => {\n  const { messages } = req.body;\n  const result = await streamText({\n    model: openai('gpt-4o-mini'),\n    messages,\n  });\n  result.pipeTextStreamToResponse(res);\n});"
                  }
        ],
        tips: [
                  "Vercel AI SDK provides a unified API across OpenAI, Anthropic, Google, and Mistral — switch providers by changing one line.",
                  "generateObject() with Zod schemas guarantees valid typed output — no JSON parsing errors or prompt engineering for format.",
                  "Use gpt-4o-mini for cost-sensitive endpoints (10x cheaper) — it handles most tasks well enough for production.",
                  "pipeTextStreamToResponse() handles SSE streaming to the client automatically — pairs with useChat() on the React side."
        ],
        mistake: "Not using streaming for chat UIs — waiting for the full response feels slow (5-15s). Streaming shows tokens in real-time (first token in ~200ms), making the app feel instant.",
        shorthand: {
          verbose: "const response = await openai.chat.completions.create({\n  model: 'gpt-4o',\n  messages,\n});\nconsole.log(response.choices[0].message.content);",
          concise: "const stream = await openai.chat.completions.create({ stream: true, ... }); for await (const chunk of stream) process.stdout.write(chunk.choices[0]?.delta?.content || '')",
        },
      },
      {
        id: "langchain-node",
        fn: "LangChain.js — RAG, Agents & Chains in Node.js",
        desc: "Build LLM applications in Node.js with LangChain.js: RAG pipelines, agents with tools, memory, and streaming.",
        category: "LangChain",
        subtitle: "@langchain/openai, ChatPromptTemplate, RunnableSequence, AgentExecutor, vectorstore",
        signature: "prompt.pipe(model).pipe(parser)  |  AgentExecutor  |  vectorStore.similaritySearch()",
        descLong: "LangChain.js is the JavaScript/TypeScript port of LangChain for building LLM applications. It provides the same abstractions: ChatModels, PromptTemplates, OutputParsers, Retrievers, Agents, and Tools. LCEL (pipe syntax) composes chains. Vector stores (Chroma, Pinecone, pgvector) enable RAG. Agents use tools to interact with the world. LangChain.js works in Node.js, Edge Runtime, and browsers. Use it for complex multi-step LLM pipelines; use the Vercel AI SDK for simpler streaming chat.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of LangChain.js — RAG, Agents & Chains in Node.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { ChatOpenAI } from '@langchain/openai';\nimport { ChatPromptTemplate } from '@langchain/core/prompts';\nimport { StringOutputParser } from '@langchain/core/output_parsers';\nimport { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';\nconst model = new ChatOpenAI({ model: 'gpt-4o', temperature: 0 });"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of LangChain.js — RAG, Agents & Chains in Node.js — common patterns you'll see in production.\n// APPROACH  - Combine LangChain.js — RAG, Agents & Chains in Node.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst prompt = ChatPromptTemplate.fromMessages([\n  ['system', 'You are a {role}. Be concise.'],\n  ['user', '{question}'],\n]);\nconst chain = prompt.pipe(model).pipe(new StringOutputParser());\nconst answer = await chain.invoke({\n  role: 'Node.js expert',\n  question: 'What are streams?',\n});\nimport { OpenAIEmbeddings } from '@langchain/openai';\nimport { MemoryVectorStore } from 'langchain/vectorstores/memory';\nimport { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';\n// Load and chunk documents\nconst splitter = new RecursiveCharacterTextSplitter({\n  chunkSize: 500,\n  chunkOverlap: 50,\n});\nconst docs = await splitter.createDocuments([documentText]);\n// Store in vector DB\nconst vectorStore = await MemoryVectorStore.fromDocuments(\n  docs,\n  new OpenAIEmbeddings()\n);\nconst retriever = vectorStore.asRetriever({ k: 5 });\n// RAG chain\nconst ragPrompt = ChatPromptTemplate.fromTemplate(\n  'Answer based on context:\\n{context}\\n\\nQuestion: {question}'\n);\nconst ragChain = RunnableSequence.from([\n  {\n    context: async (input) => {\n      const docs = await retriever.invoke(input.question);\n      return docs.map(d => d.pageContent).join('\\n\\n');\n    },\n    question: (input) => input.question,\n  },\n  ragPrompt,\n  model,\n  new StringOutputParser(),\n]);\nconst ragAnswer = await ragChain.invoke({\n  question: 'How do I configure the database?',\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of LangChain.js — RAG, Agents & Chains in Node.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst stream = await ragChain.stream({\n  question: 'How does authentication work?',\n});\nfor await (const chunk of stream) {\n  process.stdout.write(chunk);\n}\nimport { DynamicStructuredTool } from '@langchain/core/tools';\nimport { createToolCallingAgent, AgentExecutor } from 'langchain/agents';\nimport { z } from 'zod';\nconst searchTool = new DynamicStructuredTool({\n  name: 'search_docs',\n  description: 'Search documentation for relevant information',\n  schema: z.object({ query: z.string() }),\n  func: async ({ query }) => {\n    const docs = await retriever.invoke(query);\n    return docs.map(d => d.pageContent).join('\\n');\n  },\n});\nconst agentPrompt = ChatPromptTemplate.fromMessages([\n  ['system', 'You are a helpful assistant with access to tools.'],\n  ['placeholder', '{chat_history}'],\n  ['user', '{input}'],\n  ['placeholder', '{agent_scratchpad}'],\n]);\nconst agent = createToolCallingAgent({\n  llm: model,\n  tools: [searchTool],\n  prompt: agentPrompt,\n});\nconst executor = new AgentExecutor({ agent, tools: [searchTool] });\nconst result = await executor.invoke({ input: 'How do I set up auth?' });"
                  }
        ],
        tips: [
                  "Use Vercel AI SDK for simple streaming chat + structured output. Use LangChain.js for complex multi-step pipelines and agents.",
                  "MemoryVectorStore is great for prototyping. Switch to Chroma, Pinecone, or pgvector for production persistence.",
                  "LangChain.js LCEL (.pipe()) works identically to Python LangChain — knowledge transfers directly between languages.",
                  "All LangChain.js chains support .stream() — use it for real-time UIs in Express, Next.js, or any Node.js framework."
        ],
        mistake: "Using LangChain.js for simple LLM calls — if you just need a chat completion or streaming, the OpenAI SDK or Vercel AI SDK is simpler with less abstraction. LangChain adds value only for RAG, agents, and complex chains.",
        shorthand: {
          verbose: "const prompt = new ChatPromptTemplate({\n  messages: [\n    { variable_names: ['question'] }\n  ]\n});\nconst chain = new LLMChain({ prompt, llm: model });\nconst result = await chain.call({ question });",
          concise: "prompt.pipe(model).pipe(parser) for composition; AgentExecutor for tools; vectorStore.similaritySearch() for RAG",
        },
      },
      {
        id: "openai-sdk",
        fn: "OpenAI SDK Basics",
        desc: "Core OpenAI Node.js SDK: initialization, chat completions, streaming, and basic API patterns.",
        category: "LLM SDKs",
        subtitle: "new OpenAI(), chat.completions.create(), streaming, API keys",
        signature: "new OpenAI()  |  openai.chat.completions.create()  |  stream: true",
        descLong: "The OpenAI Node.js SDK provides typed access to OpenAI APIs. Initialize with API key from env vars. All API calls are async/await. Chat completions can stream tokens in real-time with stream: true. Always handle errors gracefully.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of OpenAI SDK Basics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport OpenAI from 'openai';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of OpenAI SDK Basics — common patterns you'll see in production.\n// APPROACH  - Combine OpenAI SDK Basics with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst openai = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY\n});\n// Basic completion\nconst response = await openai.chat.completions.create({\n  model: 'gpt-4o-mini',\n  messages: [\n    { role: 'system', content: 'You are helpful.' },\n    { role: 'user', content: 'Hello!' }\n  ],\n  temperature: 0.7,\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of OpenAI SDK Basics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconsole.log(response.choices[0].message.content);"
                  }
        ],
        tips: [
                  "Always set OPENAI_API_KEY environment variable before running.",
                  "Use gpt-4o-mini for cost efficiency; gpt-4o for complex tasks.",
                  "Error handling: wrap in try/catch for rate limits and network errors."
        ],
        mistake: "Embedding API key in code — always use environment variables.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); const response = await client.chat.completions.create({ model: 'gpt-4o', messages });\n// More explicit but longer",
          concise: "new OpenAI() + chat.completions.create({ model, messages, temperature })",
        },
      },
      {
        id: "openai-streaming",
        fn: "OpenAI Streaming Completions",
        desc: "Stream chat completions token-by-token for real-time UI updates.",
        category: "LLM SDKs",
        subtitle: "stream: true, for await...of, chunk.choices",
        signature: "openai.chat.completions.create({ stream: true })  |  for await (const chunk of stream)",
        descLong: "Streaming sends tokens as they are generated instead of waiting for complete response. Use stream: true in create(). Iterate with for await...of. Each chunk contains choices[0].delta.content. Faster perceived performance for users.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of OpenAI Streaming Completions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nconst stream = await openai.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: 'Write a poem' }],\n  stream: true,\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of OpenAI Streaming Completions — common patterns you'll see in production.\n// APPROACH  - Combine OpenAI Streaming Completions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfor await (const chunk of stream) {\n  const text = chunk.choices[0]?.delta?.content || '';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of OpenAI Streaming Completions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nprocess.stdout.write(text);\n}"
                  }
        ],
        tips: [
                  "stream: true returns an async iterable, not a full response object.",
                  "Check choices[0]?.delta?.content — may be undefined for tool calls.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not handling undefined delta.content — causes undefined in output.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst s = await openai.chat.completions.create({ stream: true, ... }); for await (const c of s) console.log(c.choices[0]?.delta?.content);\n// More explicit but longer",
          concise: "stream: true + for await...of chunk.choices[0]?.delta?.content",
        },
      },
      {
        id: "openai-embeddings",
        fn: "OpenAI Embeddings",
        desc: "Generate vector embeddings for semantic search and similarity.",
        category: "LLM SDKs",
        subtitle: "embeddings.create(), vector similarity, cosine distance",
        signature: "openai.embeddings.create({ input, model })  |  cosineSimilarity(vec1, vec2)",
        descLong: "Embeddings convert text into dense numerical vectors. Use text-embedding-3-small for fast/cheap, text-embedding-3-large for better quality. Compare embeddings with cosine similarity. Foundation for RAG and semantic search.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of OpenAI Embeddings — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nconst embedding = await openai.embeddings.create({\n  model: 'text-embedding-3-small',\n  input: 'What is Node.js?',\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of OpenAI Embeddings — common patterns you'll see in production.\n// APPROACH  - Combine OpenAI Embeddings with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst vector = embedding.data[0].embedding; // 1536-dimensional\n// Cosine similarity\nfunction cosineSimilarity(a, b) {\n  const dot = a.reduce((s, x, i) => s + x * b[i], 0);\n  const normA = Math.sqrt(a.reduce((s, x) => s + x * x, 0));\n  const normB = Math.sqrt(b.reduce((s, x) => s + x * x, 0));\n  return dot / (normA * normB);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of OpenAI Embeddings — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst emb1 = await openai.embeddings.create({ input: 'cat' });\nconst emb2 = await openai.embeddings.create({ input: 'dog' });\nconst similarity = cosineSimilarity(\n  emb1.data[0].embedding,\n  emb2.data[0].embedding\n);\nconsole.log(similarity); // ~0.8 (high similarity)"
                  }
        ],
        tips: [
                  "Embeddings are deterministic — same input always produces same vector.",
                  "Cache embeddings in database — don't re-embed same text repeatedly.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Using large embeddings when small ones suffice — wastes tokens and cost.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst e = await openai.embeddings.create({ input: text, model: 'text-embedding-3-small' }); const v = e.data[0].embedding;\n// More explicit but longer",
          concise: "embeddings.create() + cosineSimilarity(vec1, vec2) for semantic search",
        },
      },
      {
        id: "openai-function-calling",
        fn: "OpenAI Function Calling / Tool Use",
        desc: "Let LLMs invoke your functions: define tools, call with tool_choice, parse responses.",
        category: "LLM SDKs",
        subtitle: "tools array, tool_choice, tool_calls parsing",
        signature: "messages.tools = [{ name, description, parameters }]  |  response.tool_calls",
        descLong: "Function calling lets LLMs decide which of your functions to invoke. Define tools with JSON schema. If response contains tool_calls, extract the arguments, invoke your function, then send results back to LLM. Enables AI agents.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of OpenAI Function Calling / Tool Use — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nconst tools = [\n  {\n    type: 'function',\n    function: {\n      name: 'get_weather',\n      description: 'Get weather for a city',\n      parameters: {\n        type: 'object',\n        properties: {\n          city: { type: 'string' },\n          unit: { type: 'string', enum: ['C', 'F'] }\n        },\n        required: ['city']\n      }\n    }\n  }\n];"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of OpenAI Function Calling / Tool Use — common patterns you'll see in production.\n// APPROACH  - Combine OpenAI Function Calling / Tool Use with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst response = await openai.chat.completions.create({\n  model: 'gpt-4o',\n  messages: [{ role: 'user', content: 'What is weather in Paris?' }],\n  tools,\n  tool_choice: 'auto'\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of OpenAI Function Calling / Tool Use — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nif (response.choices[0].message.tool_calls) {\n  for (const call of response.choices[0].message.tool_calls) {\n    const args = JSON.parse(call.function.arguments);\n    const result = await getWeather(args.city, args.unit);\n    console.log(result);\n  }\n}"
                  }
        ],
        tips: [
                  "tool_choice: \"auto\" lets LLM decide; use \"required\" to force tool use.",
                  "Always validate parsed arguments — JSON may be malformed.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not validating function arguments before executing.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst response = await openai.chat.completions.create({ tools: [...], ... }); const call = response.choices[0].message.tool_calls[0]; const args = JSON.parse(call.function.arguments);\n// More explicit but longer",
          concise: "tools array with function schema + tool_choice: 'auto' + parse tool_calls[0].function.arguments",
        },
      },
      {
        id: "langchain-basics",
        fn: "LangChain.js Basics",
        desc: "Quick start: ChatOpenAI model, prompts, chains, LCEL pipeline.",
        category: "LangChain",
        subtitle: "ChatOpenAI, PromptTemplate, pipe composition",
        signature: "new ChatOpenAI()  |  ChatPromptTemplate.fromTemplate()  |  prompt.pipe(model)",
        descLong: "LangChain abstracts LLM APIs. ChatOpenAI wraps OpenAI. PromptTemplate manages message formatting. LCEL (pipe operator) chains components. Simple, composable, works with many models.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of LangChain.js Basics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { ChatOpenAI } from '@langchain/openai';\nimport { ChatPromptTemplate } from '@langchain/core/prompts';\nimport { StringOutputParser } from '@langchain/core/output_parsers';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of LangChain.js Basics — common patterns you'll see in production.\n// APPROACH  - Combine LangChain.js Basics with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst model = new ChatOpenAI({ model: 'gpt-4o' });\nconst prompt = ChatPromptTemplate.fromTemplate(\n  'You are a {style} writer. Write about: {topic}'\n);\nconst chain = prompt.pipe(model).pipe(new StringOutputParser());"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of LangChain.js Basics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst result = await chain.invoke({\n  style: 'technical',\n  topic: 'Node.js streams'\n});\nconsole.log(result);"
                  }
        ],
        tips: [
                  "LCEL .pipe() is composable — easy to chain models, parsers, custom functions.",
                  "All chains support .stream() and .batch() automatically.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Importing from wrong packages — use @langchain/openai, @langchain/core.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport { ChatOpenAI } from '@langchain/openai'; const model = new ChatOpenAI(); const prompt = ChatPromptTemplate.fromTemplate(...); const chain = prompt.pipe(model).pipe(new StringOutputParser());\n// More explicit but longer",
          concise: "ChatOpenAI + ChatPromptTemplate.fromTemplate() + .pipe() composition",
        },
      },
      {
        id: "langchain-rag",
        fn: "LangChain RAG (Retrieval-Augmented Generation)",
        desc: "Build RAG: split documents, embed, store in vector DB, retrieve context for LLM.",
        category: "LangChain",
        subtitle: "RecursiveCharacterTextSplitter, embeddings, vectorstore, retriever",
        signature: "splitter.createDocuments()  |  vectorStore.fromDocuments()  |  retriever.invoke()",
        descLong: "RAG augments LLM with external knowledge. Chunk documents with RecursiveCharacterTextSplitter. Embed chunks. Store in vector DB (Memory, Chroma, Pinecone). Retriever finds similar chunks for user query. Pass as context to LLM.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of LangChain RAG (Retrieval-Augmented Generation) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';\nimport { OpenAIEmbeddings } from '@langchain/openai';\nimport { MemoryVectorStore } from 'langchain/vectorstores/memory';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of LangChain RAG (Retrieval-Augmented Generation) — common patterns you'll see in production.\n// APPROACH  - Combine LangChain RAG (Retrieval-Augmented Generation) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst splitter = new RecursiveCharacterTextSplitter({\n  chunkSize: 1000,\n  chunkOverlap: 200,\n});\nconst docs = await splitter.createDocuments([largeDocumentText]);\nconst vectorStore = await MemoryVectorStore.fromDocuments(\n  docs,\n  new OpenAIEmbeddings()\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of LangChain RAG (Retrieval-Augmented Generation) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst retriever = vectorStore.asRetriever({ k: 3 });\nconst similarDocs = await retriever.invoke('How to scale Node.js?');\nconsole.log(similarDocs.map(d => d.pageContent));"
                  }
        ],
        tips: [
                  "chunkSize ~1000, chunkOverlap ~200 works for most text.",
                  "k: 3-5 retrieves top documents — more = slower but better context.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not setting chunkOverlap — chunks lose important context at boundaries.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 }); const docs = await splitter.createDocuments([text]); const vs = await MemoryVectorStore.fromDocuments(docs, embeddings); const retriever = vs.asRetriever({ k: 3 });\n// More explicit but longer",
          concise: "RecursiveCharacterTextSplitter + MemoryVectorStore.fromDocuments() + asRetriever({ k })",
        },
      },
      {
        id: "vercel-ai-sdk",
        fn: "Vercel AI SDK",
        desc: "Unified API for multi-provider LLM: streamText, generateText, generateObject.",
        category: "LLM SDKs",
        subtitle: "streamText, generateText, generateObject, multi-provider",
        signature: "streamText({ model, messages })  |  generateText()  |  generateObject()",
        descLong: "Vercel AI SDK unifies OpenAI, Anthropic, Google, Mistral. Single API for streaming, structured output, tool calling. Framework-agnostic. Works in Node.js, Next.js, React.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Vercel AI SDK — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { streamText, generateText, generateObject } from 'ai';\nimport { openai } from '@ai-sdk/openai';\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Vercel AI SDK — common patterns you'll see in production.\n// APPROACH  - Combine Vercel AI SDK with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Stream text (real-time tokens)\nconst result = await streamText({\n  model: openai('gpt-4o'),\n  messages: [{ role: 'user', content: 'Explain async/await' }],\n});\nfor await (const text of result.textStream) {\n  process.stdout.write(text);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Vercel AI SDK — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Generate structured object\nconst { object } = await generateObject({\n  model: openai('gpt-4o'),\n  schema: z.object({\n    name: z.string(),\n    tags: z.array(z.string())\n  }),\n  prompt: 'Extract name and tags from: \"Node.js server framework\"'\n});\nconsole.log(object);"
                  }
        ],
        tips: [
                  "streamText().textStream for tokens; generateText() for full response.",
                  "generateObject() with Zod schema guarantees valid JSON.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Using both Vercel AI SDK and raw OpenAI SDK — pick one per app.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst result = await streamText({ model: openai('gpt-4o'), messages }); for await (const t of result.textStream) process.stdout.write(t);\n// More explicit but longer",
          concise: "streamText() for streaming, generateObject(schema) for structured output",
        },
      },
      {
        id: "anthropic-sdk",
        fn: "Anthropic SDK (Claude)",
        desc: "Anthropic Node.js SDK for Claude models: initialization, streaming, messages API.",
        category: "LLM SDKs",
        subtitle: "new Anthropic(), messages.create(), streaming",
        signature: "new Anthropic()  |  messages.create({ model, messages })  |  stream: true",
        descLong: "Anthropic SDK provides access to Claude models. Similar API to OpenAI. Supports streaming. Strong at analysis, coding, writing. Support longer context windows (100K+ tokens).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Anthropic SDK (Claude) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport Anthropic from '@anthropic-ai/sdk';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Anthropic SDK (Claude) — common patterns you'll see in production.\n// APPROACH  - Combine Anthropic SDK (Claude) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst client = new Anthropic({\n  apiKey: process.env.ANTHROPIC_API_KEY\n});\nconst response = await client.messages.create({\n  model: 'claude-3-5-sonnet-20241022',\n  max_tokens: 1024,\n  messages: [\n    { role: 'user', content: 'Explain monads in Haskell' }\n  ],\n});\nconsole.log(response.content[0].text);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Anthropic SDK (Claude) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Streaming\nconst stream = client.messages.stream({\n  model: 'claude-3-5-sonnet-20241022',\n  max_tokens: 1024,\n  messages: [{ role: 'user', content: 'Write a haiku' }],\n});\nfor await (const chunk of stream) {\n  if (chunk.type === 'content_block_delta') {\n    process.stdout.write(chunk.delta.text || '');\n  }\n}"
                  }
        ],
        tips: [
                  "Claude 3.5 Sonnet is best for most tasks — try it first.",
                  "Streaming chunks differ from OpenAI — check chunk.type and delta.text.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Mixing OpenAI and Anthropic API patterns — they're similar but not identical.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst client = new Anthropic(); const response = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', messages, max_tokens: 1024 });\n// More explicit but longer",
          concise: "new Anthropic() + messages.create({ model: 'claude-3-5-sonnet', messages })",
        },
      },
      {
        id: "vector-db-basics",
        fn: "Vector Database Basics",
        desc: "Vector DBs for RAG: Pinecone, Chroma, pgvector — upsert, query, namespaces.",
        category: "Databases",
        subtitle: "Pinecone, Chroma, pgvector, upsert, query, embeddings",
        signature: "index.upsert(vectors)  |  index.query(queryVector)  |  vectorStore.similaritySearch()",
        descLong: "Vector databases store and search embeddings by similarity. Pinecone is managed SaaS. Chroma is in-process. pgvector runs in Postgres. All support upsert (insert/update), query with k results, namespaces for isolation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Vector Database Basics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Pinecone example\nimport { Pinecone } from '@pinecone-database/pinecone';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Vector Database Basics — common patterns you'll see in production.\n// APPROACH  - Combine Vector Database Basics with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst pc = new Pinecone({\n  apiKey: process.env.PINECONE_API_KEY\n});\nconst index = pc.Index('documents');\n// Upsert vectors (id, values array, metadata)\nawait index.upsert([\n  {\n    id: 'doc-1',\n    values: [0.1, 0.2, 0.3, ...], // 1536-dim embedding\n    metadata: { source: 'docs.txt', page: 1 }\n  }\n]);\n// Query\nconst results = await index.query({\n  vector: queryEmbedding,\n  topK: 5,\n  includeMetadata: true,\n  namespace: 'prod'\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Vector Database Basics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nresults.matches.forEach(m => {\n  console.log(m.id, m.score, m.metadata);\n});\n// Chroma (in-memory, no setup)\nimport { Chroma } from 'langchain/vectorstores/chroma';\nconst chromaStore = await Chroma.fromDocuments(\n  docs,\n  new OpenAIEmbeddings()\n);"
                  }
        ],
        tips: [
                  "Pinecone for scalable, serverless. Chroma for local prototyping. pgvector for Postgres.",
                  "Namespaces isolate data — use for multi-tenant apps.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Storing dense embeddings in regular SQL DB — use vector DB for similarity search.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst pc = new Pinecone(); const index = pc.Index('idx'); await index.upsert([{ id, values: embedding, metadata }]); const results = await index.query({ vector: q, topK: 5 });\n// More explicit but longer",
          concise: "index.upsert(vectors) + index.query(queryVector, { topK }) + namespaces",
        },
      },
      {
        id: "ai-structured-output",
        fn: "Structured JSON Output from LLMs",
        desc: "Guarantee valid JSON/objects: response_format, Zod schemas, parsing.",
        category: "LLM SDKs",
        subtitle: "response_format: json_object, Zod schemas, generateObject",
        signature: "response_format: { type: \"json_object\" }  |  schema: z.object(...)",
        descLong: "LLMs can output structured JSON with response_format or via Zod schemas. Guarantees valid output without parsing errors. Essential for tools, APIs, databases.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Structured JSON Output from LLMs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// OpenAI response_format\nconst response = await openai.chat.completions.create({\n  model: 'gpt-4o',\n  response_format: { type: 'json_object' },\n  messages: [\n    {\n      role: 'user',\n      content: 'Generate a user object with name and email. Return as JSON.'\n    }\n  ]\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Structured JSON Output from LLMs — common patterns you'll see in production.\n// APPROACH  - Combine Structured JSON Output from LLMs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst obj = JSON.parse(response.choices[0].message.content);\nconsole.log(obj); // { name: \"...\", email: \"...\" }\n// Vercel AI SDK + Zod\nimport { generateObject } from 'ai';\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Structured JSON Output from LLMs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst { object } = await generateObject({\n  model: openai('gpt-4o'),\n  schema: z.object({\n    recipe: z.object({\n      name: z.string(),\n      ingredients: z.array(z.object({\n        item: z.string(),\n        amount: z.string()\n      })),\n      steps: z.array(z.string())\n    })\n  }),\n  prompt: 'Generate a pasta recipe'\n});\nconsole.log(object.recipe.name); // type-safe, validated"
                  }
        ],
        tips: [
                  "Zod schema with generateObject() is easiest — validation + typing.",
                  "response_format works with gpt-4o, gpt-4-turbo; not all models.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Trusting LLM to generate valid JSON without response_format.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst r = await openai.chat.completions.create({ response_format: { type: 'json_object' }, messages }); const obj = JSON.parse(r.choices[0].message.content);\n// More explicit but longer",
          concise: "response_format: json_object or generateObject(schema: z.object(...))",
        },
      },
    ],
  },
]

export default { meta, sections }
