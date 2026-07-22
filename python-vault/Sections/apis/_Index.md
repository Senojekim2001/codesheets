---
type: "file-index"
domain: "python"
file: "apis"
title: "APIs & Frameworks"
tags:
  - "python"
  - "python/apis"
  - "index"
---

# APIs & Frameworks

> 17 entries across 3 sections.

## FastAPI · 7

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes]] — Define HTTP endpoints with automatic validation and OpenAPI docs.
- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection]] — Share logic across routes with Depends() — DB sessions, auth, config.
- [[Sections/apis/fastapi/pydantic-models|Pydantic models]] — Define validated, typed data schemas for request and response bodies.
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators]] — Add custom validation logic to Pydantic model fields.
- [[Sections/apis/fastapi/pydantic-settings|Pydantic BaseSettings]] — Load typed configuration from environment variables and .env files.
- [[Sections/apis/fastapi/sqlalchemy-models|SQLAlchemy models]] — Define database tables as Python classes with the ORM.
- [[Sections/apis/fastapi/sqlalchemy-session-apis|SQLAlchemy session]] — Perform CRUD operations using a database session.

## Async & Concurrency · 6

- [[Sections/apis/async/async-def|async def]] — Define an asynchronous coroutine function.
- [[Sections/apis/async/await|await]] — Suspend a coroutine until an awaitable completes.
- [[Sections/apis/async/asyncio-gather|asyncio.gather()]] — Run multiple coroutines concurrently and collect all results.
- [[Sections/apis/async/asyncio-queue|asyncio.Queue()]] — Thread-safe async FIFO queue for producer/consumer patterns.
- [[Sections/apis/async/thread-pool|ThreadPoolExecutor]] — Run I/O-bound blocking functions concurrently in a thread pool.
- [[Sections/apis/async/process-pool|ProcessPoolExecutor]] — Run CPU-bound functions in parallel across multiple processes.

## HTTP & Standard Library · 4

- [[Sections/apis/http-stdlib/logging-apis|logging]] — Production-grade application logging with levels and handlers.
- [[Sections/apis/http-stdlib/os-environ|os.environ]] — Read configuration and secrets from environment variables.
- [[Sections/apis/http-stdlib/requests|requests]] — Synchronous HTTP client — the standard library for REST API calls.
- [[Sections/apis/http-stdlib/httpx|httpx]] — Async-capable HTTP client — drop-in replacement for requests.
