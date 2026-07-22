export const meta = {
  "id": "rust-web",
  "label": "Web & HTTP",
  "icon": "🦀",
  "description": "Rust web development: Axum/Actix-web, serde serialization, reqwest HTTP client, and tokio async patterns."
}

export const sections = [

  // ── Section 1: Axum Web Framework ─────────────────────────────────────────
  {
    id: "axum-server",
    title: "Axum Web Framework",
    entries: [
      {
        id: "axum-basics",
        fn: "Axum — Routes, Handlers & Extractors",
        desc: "Build async web servers with Axum — type-safe routing, extractors for request data, and shared state.",
        category: "Web",
        subtitle: "Router, get/post, Path, Query, Json, State",
        signature: "Router::new().route(\"/path\", get(handler))  |  async fn handler(Json(body): Json<T>) -> impl IntoResponse",
        descLong: "Axum is the most popular Rust web framework, built on tokio and hyper. Handlers are async functions that take extractors (typed request data) and return responses. Path<T> extracts URL parameters, Query<T> extracts query strings, Json<T> extracts/returns JSON bodies. State<T> shares application state. Axum's type system catches routing errors at compile time — no runtime surprises.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Axum — Routes, Handlers & Extractors — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse axum::{\n    extract::{Json, Path, Query, State},\n    http::StatusCode,\n    response::IntoResponse,\n    routing::{get, post, delete},\n    Router,\n};\nuse serde::{Deserialize, Serialize};\nuse std::sync::Arc;\nuse tokio::sync::RwLock;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Axum — Routes, Handlers & Extractors — common patterns you'll see in production.\n// APPROACH  - Combine Axum — Routes, Handlers & Extractors with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Shared application state ───────────────────────\ntype AppState = Arc<RwLock<Vec<User>>>;\n\n#[derive(Clone, Serialize, Deserialize)]\nstruct User {\n    id: u64,\n    name: String,\n    email: String,\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Axum — Routes, Handlers & Extractors — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Route definitions ──────────────────────────────,#[tokio::main],async fn main() {,    let state: AppState = Arc::new(RwLock::new(vec![]));,,    let app = Router::new(),        .route(\"/health\", get(health)),        .route(\"/users\", get(list_users).post(create_user)),        .route(\"/users/:id\", get(get_user).delete(delete_user)),        .with_state(state);,,    let listener = tokio::net::TcpListener::bind(\"0.0.0.0:3000\"),        .await.unwrap();,    println!(\"Listening on :3000\");,    axum::serve(listener, app).await.unwrap();,},\n\n// ── Handlers ───────────────────────────────────────,async fn health() -> &'static str {,    \"ok\",},\n\n// Json extractor for request body,async fn create_user(,    State(state): State<AppState>,,    Json(user): Json<User>,,) -> (StatusCode, Json<User>) {,    let mut users = state.write().await;,    users.push(user.clone());,    (StatusCode::CREATED, Json(user)),},\n\n// Path extractor for URL params,async fn get_user(,    State(state): State<AppState>,,    Path(id): Path<u64>,,) -> Result<Json<User>, StatusCode> {,    let users = state.read().await;,    users.iter(),        .find(|u| u.id == id),        .cloned(),        .map(Json),        .ok_or(StatusCode::NOT_FOUND),},\n\n// Query extractor for query string,#[derive(Deserialize)],struct Pagination {,    page: Option<u32>,,    per_page: Option<u32>,,},,async fn list_users(,    State(state): State<AppState>,,    Query(params): Query<Pagination>,,) -> Json<Vec<User>> {,    let users = state.read().await;,    let page = params.page.unwrap_or(1);,    let per_page = params.per_page.unwrap_or(20);,    let start = ((page - 1) * per_page) as usize;,    let slice = users.iter().skip(start).take(per_page as usize).cloned().collect();,    Json(slice),},,async fn delete_user(,    State(state): State<AppState>,,    Path(id): Path<u64>,,) -> StatusCode {,    let mut users = state.write().await;,    if let Some(pos) = users.iter().position(|u| u.id == id) {,        users.remove(pos);,        StatusCode::NO_CONTENT,    } else {,        StatusCode::NOT_FOUND,    },}"
                  }
        ],
        tips: [
                  "Extractors are type-safe — Json<CreateUser> automatically parses and validates the request body at compile time.",
                  "Use Arc<RwLock<T>> for shared mutable state — RwLock allows multiple readers OR one writer.",
                  "Return Result<T, StatusCode> from handlers to cleanly handle not-found and error cases.",
                  "Chain methods on routes: .route(\"/users\", get(list).post(create)) handles both GET and POST."
        ],
        mistake: "Using Mutex instead of RwLock for read-heavy state — Mutex blocks all readers during writes AND reads. RwLock allows concurrent reads, only blocking during writes.",
        shorthand: {
          verbose: "// Raw hyper handler (verbose, low-level)\nfn handler(req: Request<Body>) -> impl Future {\n  let status = StatusCode::OK;\n  let body = Body::from(\"...\");\n  future::ok(Response::builder().status(status).body(body).unwrap())\n}",
          concise: "async fn handler() -> impl IntoResponse {\n  Json(json!({\"key\": \"val\"}))\n}",
        },
      },
      {
        id: "axum-middleware",
        fn: "Axum Middleware — Layers, Tower & Error Handling",
        desc: "Add middleware with Tower layers — logging, CORS, auth, timeout, and structured error responses.",
        category: "Web",
        subtitle: "tower::ServiceBuilder, CorsLayer, middleware::from_fn, layers",
        signature: "Router::new().layer(middleware)  |  async fn auth(req: Request, next: Next) -> Response",
        descLong: "Axum uses Tower for middleware (called \"layers\"). Tower middleware composes: logging, CORS, timeouts, compression, auth — all stack cleanly. tower-http provides common middleware. Custom middleware uses middleware::from_fn for async functions or implement the Tower Service trait for complex cases. Error handling uses custom error types that implement IntoResponse.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Axum Middleware — Layers, Tower & Error Handling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse axum::{\n    extract::Request,\n    http::{HeaderMap, StatusCode},\n    middleware::{self, Next},\n    response::{IntoResponse, Response},\n    Json, Router,\n};\nuse serde_json::json;\nuse std::time::Duration;\nuse tower::ServiceBuilder;\nuse tower_http::{\n    cors::{Any, CorsLayer},\n    timeout::TimeoutLayer,\n    trace::TraceLayer,\n    compression::CompressionLayer,\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Axum Middleware — Layers, Tower & Error Handling — common patterns you'll see in production.\n// APPROACH  - Combine Axum Middleware — Layers, Tower & Error Handling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Apply middleware layers ─────────────────────────\nfn create_router() -> Router {\n    Router::new()\n        .route(\"/api/data\", get(get_data))\n        .route(\"/api/protected\", get(protected_handler))\n        .route_layer(middleware::from_fn(auth_middleware))\n        .layer(\n            ServiceBuilder::new()\n                .layer(TraceLayer::new_for_http())  // logging\n                .layer(TimeoutLayer::new(Duration::from_secs(30)))\n                .layer(CompressionLayer::new())\n                .layer(\n                    CorsLayer::new()\n                        .allow_origin(Any)\n                        .allow_methods(Any)\n                        .allow_headers(Any),\n                ),\n        )\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Axum Middleware — Layers, Tower & Error Handling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Custom auth middleware ──────────────────────────,async fn auth_middleware(,    headers: HeaderMap,,    request: Request,,    next: Next,,) -> Result<Response, StatusCode> {,    let token = headers,        .get(\"authorization\"),        .and_then(|v| v.to_str().ok()),        .ok_or(StatusCode::UNAUTHORIZED)?;,,    if !token.starts_with(\"Bearer \") {,        return Err(StatusCode::UNAUTHORIZED);,    },\n\n    // Validate token...,    Ok(next.run(request).await),},\n\n// ── Structured error handling ──────────────────────,#[derive(Debug)],enum AppError {,    NotFound(String),,    BadRequest(String),,    Internal(String),,},,impl IntoResponse for AppError {,    fn into_response(self) -> Response {,        let (status, message) = match self {,            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),,            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),,            AppError::Internal(msg) => (,                StatusCode::INTERNAL_SERVER_ERROR, msg,            ),,        };,        (status, Json(json!({ \"error\": message }))).into_response(),    },},\n\n// Use ? operator in handlers with AppError,async fn get_data() -> Result<Json<serde_json::Value>, AppError> {,    let data = fetch_from_db(),        .await,        .map_err(|e| AppError::Internal(e.to_string()))?;,    Ok(Json(data)),}"
                  }
        ],
        tips: [
                  "ServiceBuilder applies layers bottom-to-top — the last layer added runs first on the request.",
                  "route_layer applies middleware only to matched routes; layer applies to all requests including 404s.",
                  "Implement IntoResponse on custom error types for consistent JSON error responses across all handlers.",
                  "TraceLayer + tracing subscriber gives structured logging for every request with zero handler code."
        ],
        mistake: "Using .layer() when you want .route_layer() — .layer() runs middleware even for unmatched routes (404s), which can cause confusing auth errors on non-existent paths.",
        shorthand: {
          verbose: "// Manual middleware setup (verbose, fragile)\nlet app = router\n  .after_handler(check_auth)\n  .after_handler(log_request)\n  .after_handler(timeout)\n  .after_handler(cors);",
          concise: "let app = router\n  .layer(ServiceBuilder::new()\n    .layer(auth)\n    .layer(logger)\n    .layer(timeout));",
        },
      },
    ],
  },

  // ── Section 2: Serde & HTTP Client ─────────────────────────────────────────
  {
    id: "serde-reqwest",
    title: "Serde & HTTP Client",
    entries: [
      {
        id: "serde-patterns",
        fn: "Serde — Serialization & Deserialization",
        desc: "Type-safe JSON (de)serialization with derive macros, custom formats, and field attributes.",
        category: "Serialization",
        subtitle: "#[derive(Serialize, Deserialize)], #[serde(...)], serde_json",
        signature: "#[derive(Serialize, Deserialize)]  |  serde_json::to_string(&v)  |  serde_json::from_str(s)",
        descLong: "Serde is Rust's serialization framework — supports JSON, TOML, YAML, MessagePack, and more. #[derive(Serialize, Deserialize)] generates code at compile time (zero runtime cost). Field attributes control naming (#[serde(rename)]), defaults, skipping, and flattening. Custom serializers handle special cases. Serde catches type mismatches at compile time and malformed data at runtime with clear errors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Serde — Serialization & Deserialization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse serde::{Deserialize, Serialize};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Serde — Serialization & Deserialization — common patterns you'll see in production.\n// APPROACH  - Combine Serde — Serialization & Deserialization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic derive ───────────────────────────────────\n#[derive(Debug, Serialize, Deserialize)]\nstruct User {\n    id: u64,\n    name: String,\n    email: String,\n    #[serde(default)]              // use Default if missing\n    active: bool,\n    #[serde(skip_serializing_if = \"Option::is_none\")]\n    phone: Option<String>,         // omit from JSON if None\n    #[serde(rename = \"createdAt\")] // camelCase in JSON\n    created_at: String,\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Serde — Serialization & Deserialization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Serialize / Deserialize ────────────────────────,let user = User {,    id: 1,,    name: \"Alice\".into(),,    email: \"alice@example.com\".into(),,    active: true,,    phone: None,,    created_at: \"2024-01-01\".into(),,};,\n\n// To JSON string,let json = serde_json::to_string(&user)?;,let pretty = serde_json::to_string_pretty(&user)?;,\n\n// From JSON string,let parsed: User = serde_json::from_str(&json)?;,\n\n// From/to serde_json::Value (dynamic JSON),let value: serde_json::Value = serde_json::from_str(&json)?;,let name = value[\"name\"].as_str().unwrap();,\n\n// ── Enums in JSON ──────────────────────────────────,#[derive(Serialize, Deserialize)],#[serde(tag = \"type\")]  // internally tagged,enum Event {,    #[serde(rename = \"user_created\")],    UserCreated { user_id: u64, name: String },,    #[serde(rename = \"user_deleted\")],    UserDeleted { user_id: u64 },,},// {\"type\": \"user_created\", \"user_id\": 1, \"name\": \"Alice\"},,#[derive(Serialize, Deserialize)],#[serde(tag = \"type\", content = \"data\")]  // adjacently tagged,enum ApiResponse {,    Success(Vec<User>),,    Error { code: u16, message: String },,},\n\n// ── Rename all fields ──────────────────────────────,#[derive(Serialize, Deserialize)],#[serde(rename_all = \"camelCase\")]  // all fields → camelCase,struct Config {,    database_url: String,      // → \"databaseUrl\" in JSON,    max_connections: u32,      // → \"maxConnections\",    enable_logging: bool,      // → \"enableLogging\",},\n\n// ── Flatten nested structs ─────────────────────────,#[derive(Serialize, Deserialize)],struct Paginated {,    #[serde(flatten)],    pagination: Pagination,    // fields merged into parent,    items: Vec<User>,,}"
                  }
        ],
        tips: [
                  "#[serde(rename_all = \"camelCase\")] converts all fields — one attribute instead of renaming each field.",
                  "#[serde(tag = \"type\")] for enums produces clean JSON: {\"type\": \"variant\", \"field\": \"value\"}.",
                  "#[serde(flatten)] merges nested struct fields into the parent — great for pagination, metadata patterns.",
                  "#[serde(default)] uses Default::default() for missing fields — no need to make everything Option<T>."
        ],
        mistake: "Making all fields Option<T> to handle missing JSON keys — use #[serde(default)] for fields with sensible defaults, and only Option<T> for truly optional fields.",
        shorthand: {
          verbose: "// Manual JSON string building (verbose, error-prone)\nlet json = format!(\n  r#\"{{\\\"name\\\":\\\"{}\\\"\",\\\"age\\\":{}}}\"#,\n  name, age\n);",
          concise: "serde_json::json!({\n  \"name\": name,\n  \"age\": age\n})",
        },
      },
      {
        id: "reqwest-client",
        fn: "Reqwest — Async HTTP Client",
        desc: "Make HTTP requests with reqwest — GET, POST, JSON, headers, timeouts, and retry patterns.",
        category: "HTTP Client",
        subtitle: "reqwest::Client, get, post, json, timeout",
        signature: "Client::new().get(url).send().await?  |  .json::<T>().await?",
        descLong: "Reqwest is Rust's most popular HTTP client — async by default, built on tokio and hyper. Create a Client once and reuse it (connection pooling). Chain methods for headers, query params, JSON body, timeout. Response methods: .status(), .text(), .json::<T>(), .bytes(). Use .error_for_status()? to convert 4xx/5xx to errors. Retry with backoff for resilient services.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Reqwest — Async HTTP Client — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse reqwest::{Client, header};\nuse serde::{Deserialize, Serialize};\nuse std::time::Duration;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Reqwest — Async HTTP Client — common patterns you'll see in production.\n// APPROACH  - Combine Reqwest — Async HTTP Client with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Create a reusable client ───────────────────────\nfn create_client() -> reqwest::Result<Client> {\n    Client::builder()\n        .timeout(Duration::from_secs(30))\n        .default_headers({\n            let mut h = header::HeaderMap::new();\n            h.insert(\"User-Agent\", \"my-app/1.0\".parse().unwrap());\n            h\n        })\n        .build()\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Reqwest — Async HTTP Client — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── GET request — parse JSON response ──────────────,#[derive(Deserialize)],struct ApiUser {,    id: u64,,    name: String,,    email: String,,},,async fn get_user(client: &Client, id: u64) -> anyhow::Result<ApiUser> {,    let user = client,        .get(format!(\"https://api.example.com/users/{id}\")),        .bearer_auth(\"my-token\"),        .send(),        .await?,        .error_for_status()?   // 4xx/5xx → Error,        .json::<ApiUser>(),        .await?;,    Ok(user),},\n\n// ── POST request with JSON body ────────────────────,#[derive(Serialize)],struct CreateUser {,    name: String,,    email: String,,},,async fn create_user(client: &Client, user: &CreateUser) -> anyhow::Result<ApiUser> {,    let created = client,        .post(\"https://api.example.com/users\"),        .json(user)          // auto-serializes + sets Content-Type,        .send(),        .await?,        .error_for_status()?,        .json::<ApiUser>(),        .await?;,    Ok(created),},\n\n// ── Query parameters ───────────────────────────────,async fn search(client: &Client, query: &str) -> anyhow::Result<Vec<ApiUser>> {,    let users = client,        .get(\"https://api.example.com/users\"),        .query(&[(\"q\", query), (\"limit\", \"10\")]),        .send(),        .await?,        .json::<Vec<ApiUser>>(),        .await?;,    Ok(users),},\n\n// ── Retry with exponential backoff ─────────────────,async fn fetch_with_retry(,    client: &Client, url: &str, max_retries: u32,,) -> anyhow::Result<String> {,    let mut delay = Duration::from_millis(100);,    for attempt in 0..=max_retries {,        match client.get(url).send().await {,            Ok(resp) if resp.status().is_success() => {,                return resp.text().await.map_err(Into::into);,            },            Ok(resp) if resp.status().is_server_error() && attempt < max_retries => {,                tokio::time::sleep(delay).await;,                delay *= 2;  // exponential backoff,            },            Ok(resp) => anyhow::bail!(\"HTTP {}\", resp.status()),,            Err(e) if attempt < max_retries => {,                tokio::time::sleep(delay).await;,                delay *= 2;,            },            Err(e) => return Err(e.into()),,        },    },    unreachable!(),}"
                  }
        ],
        tips: [
                  "Create Client once, reuse everywhere — it manages a connection pool internally.",
                  ".error_for_status()? turns 4xx/5xx responses into Rust errors — no manual status code checking.",
                  ".json(body) auto-serializes and sets Content-Type — no need to manually serialize and set headers.",
                  "Use anyhow::Result for application code and thiserror for library error types."
        ],
        mistake: "Creating a new Client for every request — each Client has its own connection pool. Reuse one Client to benefit from keep-alive connections and reduce overhead.",
        shorthand: {
          verbose: "// Raw http client (verbose, low-level)\nlet body = http::Body::from(serde_json::to_string(&data)?);\nlet req = http::Request::builder()\n  .method(\"GET\")\n  .uri(url)\n  .body(body)?;\nlet body: MyType = http::decode(resp.body()).await?;",
          concise: "let body: MyType = reqwest::get(url)\n  .await?\n  .json()\n  .await?;",
        },
      },
      {
        id: "axum-extractors",
        fn: "Axum Extractors — Path, Query, Json, State, Custom",
        desc: "Build type-safe extractors: Path<T> for URL params, Query<T> for query strings, Json<T> for bodies, State<T> for app data.",
        category: "Web",
        subtitle: "Extractor trait, impl FromRequestParts, Path, Query, Json, State, custom extractors",
        signature: "async fn handler(Path(id): Path<u64>, Json(body): Json<T>) -> Json<Response>",
        descLong: "Extractors are Axum's killer feature — they parse request data into strongly-typed Rust values. Built-in extractors: Path<T> (URL params), Query<T> (query string), Json<T> (body), State<T> (app state), HeaderMap, ConnectInfo. Extractors implement FromRequestParts or FromRequest trait. If extraction fails, returns proper HTTP error automatically. Custom extractors can validate and transform data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Axum Extractors — Path, Query, Json, State, Custom — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse axum::{\n    extract::{Path, Query, Json, State, RejectionError},\n    http::StatusCode,\n    response::IntoResponse,\n    Router,\n    routing::get,\n};\nuse serde::{Deserialize, Serialize};\nuse std::sync::Arc;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Axum Extractors — Path, Query, Json, State, Custom — common patterns you'll see in production.\n// APPROACH  - Combine Axum Extractors — Path, Query, Json, State, Custom with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Application state ──────────────────────────────\n#[derive(Clone)]\npub struct AppState {\n    db_url: String,\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Axum Extractors — Path, Query, Json, State, Custom — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Serde models ────────────────────────────────────,#[derive(Deserialize)],pub struct CreateUserRequest {,    name: String,,    email: String,,},,#[derive(Serialize)],pub struct UserResponse {,    id: u64,,    name: String,,    email: String,,},\n\n// ── Path extractor ────────────────────────────────,// GET /users/:id,async fn get_user(,    Path(id): Path<u64>,,    State(state): State<AppState>,,) -> Result<Json<UserResponse>, StatusCode> {,    let user = fetch_from_db(&state.db_url, id),        .await,        .ok_or(StatusCode::NOT_FOUND)?;,    Ok(Json(user)),},\n\n// ── Query extractor ────────────────────────────────,#[derive(Deserialize)],pub struct ListQuery {,    page: Option<u32>,,    limit: Option<u32>,,    sort: Option<String>,,},\n\n// GET /users?page=1&limit=10&sort=name,async fn list_users(,    Query(params): Query<ListQuery>,,    State(state): State<AppState>,,) -> Json<Vec<UserResponse>> {,    let page = params.page.unwrap_or(1);,    let limit = params.limit.unwrap_or(20);,    let sort = params.sort.as_deref().unwrap_or(\"id\");,\n\n    // Fetch from DB,    let users = fetch_users_paginated(&state.db_url, page, limit, sort);,    Json(users),},\n\n// ── Json extractor (request body) ───────────────────,// POST /users with JSON body,async fn create_user(,    State(state): State<AppState>,,    Json(req): Json<CreateUserRequest>,,) -> (StatusCode, Json<UserResponse>) {,    let user = insert_user_db(&state.db_url, &req.name, &req.email);,    (StatusCode::CREATED, Json(user)),},\n\n// ── Multiple extractors combined ────────────────────,// PUT /users/:id,async fn update_user(,    Path(id): Path<u64>,,    State(state): State<AppState>,,    Json(req): Json<CreateUserRequest>,,) -> Result<Json<UserResponse>, StatusCode> {,    let user = update_user_db(&state.db_url, id, &req.name, &req.email),        .ok_or(StatusCode::NOT_FOUND)?;,    Ok(Json(user)),},\n\n// ── Custom extractor ───────────────────────────────,use axum::extract::FromRequestParts;,use axum::http::request::Parts;,,pub struct UserId(u64);,,#[async_trait::async_trait],impl<S> FromRequestParts<S> for UserId,where,    S: Send + Sync,,{,    type Rejection = StatusCode;,,    async fn from_request_parts(,        parts: &mut Parts,,        _state: &S,,    ) -> Result<Self, Self::Rejection> {,        let id_str = parts,            .uri,            .path(),            .split('/'),            .last(),            .ok_or(StatusCode::BAD_REQUEST)?;,,        id_str,            .parse::<u64>(),            .map(UserId),            .map_err(|_| StatusCode::BAD_REQUEST),    },},\n\n// ── Router setup ────────────────────────────────────,pub fn create_router(state: AppState) -> Router {,    Router::new(),        .route(\"/users\", get(list_users).post(create_user)),        .route(\"/users/:id\", get(get_user).put(update_user)),        .with_state(state),},\n\n// Mock DB functions,async fn fetch_from_db(db_url: &str, id: u64) -> Option<UserResponse> {,    Some(UserResponse {,        id,,        name: \"Alice\".to_string(),,        email: \"alice@example.com\".to_string(),,    }),},,fn fetch_users_paginated(db_url: &str, page: u32, limit: u32, sort: &str) -> Vec<UserResponse> {,    vec![],},,fn insert_user_db(db_url: &str, name: &str, email: &str) -> UserResponse {,    UserResponse {,        id: 1,,        name: name.to_string(),,        email: email.to_string(),,    },},,fn update_user_db(db_url: &str, id: u64, name: &str, email: &str) -> Option<UserResponse> {,    Some(UserResponse {,        id,,        name: name.to_string(),,        email: email.to_string(),,    }),}"
                  }
        ],
        tips: [
                  "Extractors are composable — combine multiple in one handler signature.",
                  "Extraction failure returns automatic HTTP error with 400 Bad Request.",
                  "Custom extractors implement FromRequestParts for headers/path, FromRequest for body.",
                  "Order matters: State must come before Json in some cases — check Axum docs."
        ],
        mistake: "Returning Result<T, E> where E is not IntoResponse — extraction errors must convert to HTTP responses.",
        shorthand: {
          verbose: "// Manual parsing (verbose, error-prone)\nlet id = req.uri().path().split('/').last().unwrap();\nlet id = id.parse::<u64>().unwrap();",
          concise: "async fn handler(Path(id): Path<u64>) { ... }",
        },
      },
      {
        id: "axum-middleware",
        fn: "Axum Middleware & Layers — Tower, tower-http, Error Handling",
        desc: "Build comprehensive middleware: logging, CORS, compression, timeout, auth, and custom error responses.",
        category: "Web",
        subtitle: "Layer, ServiceBuilder, tower-http, CorsLayer, TraceLayer, middleware::from_fn",
        signature: ".layer(middleware::from_fn(my_middleware))  |  ServiceBuilder::new().layer(...)",
        descLong: "Axum middleware uses Tower layers. Layers wrap the router and are applied in order. Built-in tower-http layers: TraceLayer (logging), CorsLayer, TimeoutLayer, CompressionLayer, ServeDir. Custom middleware via middleware::from_fn for simple async functions, or implement Service trait for complex cases. Error handling converts custom error types to HTTP responses with IntoResponse.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Axum Middleware & Layers — Tower, tower-http, Error Handling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse axum::{\n    extract::Request,\n    http::{HeaderMap, StatusCode, header},\n    middleware::{self, Next},\n    response::{IntoResponse, Response},\n    Json, Router,\n};\nuse serde_json::json;\nuse std::time::Duration;\nuse tower::ServiceBuilder;\nuse tower_http::{\n    cors::{Any, CorsLayer},\n    timeout::TimeoutLayer,\n    trace::TraceLayer,\n    compression::CompressionLayer,\n    services::ServeDir,\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Axum Middleware & Layers — Tower, tower-http, Error Handling — common patterns you'll see in production.\n// APPROACH  - Combine Axum Middleware & Layers — Tower, tower-http, Error Handling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Custom middleware ───────────────────────────────\nasync fn my_middleware(\n    headers: HeaderMap,\n    request: Request,\n    next: Next,\n) -> Response {\n    let method = request.method().clone();\n    let path = request.uri().path().to_string();\n\n    let response = next.run(request).await;\n\n    println!(\"{} {}\", method, path);\n    response\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Axum Middleware & Layers — Tower, tower-http, Error Handling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Auth middleware ────────────────────────────────,async fn auth_middleware(,    headers: HeaderMap,,    request: Request,,    next: Next,,) -> Result<Response, StatusCode> {,    let token = headers,        .get(\"authorization\"),        .and_then(|h| h.to_str().ok()),        .ok_or(StatusCode::UNAUTHORIZED)?;,,    if !is_valid_token(token) {,        return Err(StatusCode::UNAUTHORIZED);,    },,    Ok(next.run(request).await),},,fn is_valid_token(token: &str) -> bool {,    token.starts_with(\"Bearer \") && token.len() > 7,},\n\n// ── Request ID tracking ────────────────────────────,use uuid::Uuid;,,async fn request_id_middleware(,    mut request: Request,,    next: Next,,) -> Response {,    let id = Uuid::new_v4().to_string();,    request.extensions_mut().insert(id);,    next.run(request).await,},\n\n// ── Structured error handling ───────────────────────,#[derive(Debug)],enum ApiError {,    NotFound(String),,    BadRequest(String),,    Internal(String),,},,impl IntoResponse for ApiError {,    fn into_response(self) -> Response {,        let (status, message) = match self {,            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),,            ApiError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),,            ApiError::Internal(msg) => (,                StatusCode::INTERNAL_SERVER_ERROR,,                msg,,            ),,        };,,        (,            status,,            Json(json!({,                \"error\": message,,                \"status\": status.as_u16(),,            })),,        ).into_response(),    },},\n\n// ── Router with layers ─────────────────────────────,pub fn create_app() -> Router {,    Router::new(),        .route(\"/api/data\", axum::routing::get(|| async { \"data\" })),        .route_layer(middleware::from_fn(auth_middleware)),        .layer(,            ServiceBuilder::new(),                .layer(TraceLayer::new_for_http()),                .layer(TimeoutLayer::new(Duration::from_secs(30))),                .layer(CompressionLayer::new()),                .layer(,                    CorsLayer::new(),                        .allow_origin(Any),                        .allow_methods(Any),                        .allow_headers(Any),,                ),                .layer(middleware::from_fn(request_id_middleware)),        ),},\n\n// ── Rate limiting middleware ────────────────────────,use std::sync::atomic::{AtomicU32, Ordering};,,async fn rate_limit_middleware(,    request: Request,,    next: Next,,) -> Result<Response, StatusCode> {,    static REQUESTS: AtomicU32 = AtomicU32::new(0);,    let count = REQUESTS.fetch_add(1, Ordering::SeqCst);,,    if count > 1000 {,        REQUESTS.store(0, Ordering::SeqCst);,        return Err(StatusCode::TOO_MANY_REQUESTS);,    },,    Ok(next.run(request).await),}"
                  }
        ],
        tips: [
                  "Layers are applied bottom-to-top — last added runs first on request.",
                  "route_layer applies only to matched routes; layer applies to all (including 404s).",
                  "TraceLayer auto-logs all requests — pairs with tracing subscriber.",
                  "ServiceBuilder chains multiple layers cleanly — more readable than nested .layer() calls."
        ],
        mistake: "Using .layer() for auth when you need .route_layer() — auth fails on 404s with .layer().",
        shorthand: {
          verbose: "// Manual layer composition (verbose)\nlet router = router\n  .layer(LogLayer)\n  .layer(TimeoutLayer)\n  .layer(CorsLayer)\n  .layer(CompressionLayer);",
          concise: "let router = router.layer(\n  ServiceBuilder::new()\n    .layer(TraceLayer::new_for_http())\n    .layer(TimeoutLayer::new(Duration::from_secs(30)))\n);",
        },
      },
      {
        id: "actix-basics",
        fn: "Actix-web Basics — App, Routes, Handlers, Responses",
        desc: "Build web apps with Actix-web: register routes, define handlers, return JSON, and use web::Data for state.",
        category: "Web",
        subtitle: "App::new(), web::get(), HttpResponse, web::Data<T>, FromRequest",
        signature: "async fn handler() -> impl Responder  |  App::new().route(\"/\", web::get().to(handler))",
        descLong: "Actix-web is a high-performance web framework. App::new() creates an application. Routes register with .route(path, web::get().to(handler)). Handlers are async functions returning Responder (HttpResponse, Json, etc.). web::Data<T> provides shared state. HttpServer binds and runs the app. Actix is known for raw speed — faster than Axum for simple benchmarks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Actix-web Basics — App, Routes, Handlers, Responses — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse actix_web::{web, App, HttpResponse, HttpServer, Responder};\nuse serde::{Deserialize, Serialize};\nuse std::sync::Mutex;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Actix-web Basics — App, Routes, Handlers, Responses — common patterns you'll see in production.\n// APPROACH  - Combine Actix-web Basics — App, Routes, Handlers, Responses with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Shared state ────────────────────────────────────\n#[derive(Clone)]\npub struct AppState {\n    counter: web::Data<Mutex<i32>>,\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Actix-web Basics — App, Routes, Handlers, Responses — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Response types ──────────────────────────────────,#[derive(Serialize)],pub struct ApiResponse {,    status: String,,    data: Option<String>,,},\n\n// ── Simple handler ──────────────────────────────────,async fn hello() -> impl Responder {,    HttpResponse::Ok().body(\"Hello, world!\"),},\n\n// ── JSON response ───────────────────────────────────,#[derive(Serialize)],pub struct User {,    id: u64,,    name: String,,},,async fn get_user(id: web::Path<u64>) -> impl Responder {,    web::Json(User {,        id: id.into_inner(),,        name: \"Alice\".to_string(),,    }),},\n\n// ── Request body ────────────────────────────────────,#[derive(Deserialize)],pub struct CreateUserReq {,    name: String,,    email: String,,},,async fn create_user(,    body: web::Json<CreateUserReq>,,) -> impl Responder {,    HttpResponse::Created().json(User {,        id: 1,,        name: body.name.clone(),,    }),},\n\n// ── With path and query parameters ─────────────────,#[derive(Deserialize)],pub struct QueryParams {,    page: Option<u32>,,},,async fn list_users(,    id: web::Path<String>,,    query: web::Query<QueryParams>,,) -> impl Responder {,    let page = query.page.unwrap_or(1);,    HttpResponse::Ok().json(ApiResponse {,        status: \"ok\".to_string(),,        data: Some(format!(\"Page {}\", page)),,    }),},\n\n// ── Using shared state ──────────────────────────────,async fn increment_counter(,    state: web::Data<Mutex<i32>>,,) -> impl Responder {,    let mut counter = state.lock().unwrap();,    *counter += 1;,    HttpResponse::Ok().json(json!({\"count\": *counter})),},\n\n// ── Error handling ──────────────────────────────────,#[derive(Debug)],pub enum AppError {,    NotFound,,    BadRequest,,},,impl std::fmt::Display for AppError {,    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {,        write!(f, \"{:?}\", self),    },},,impl actix_web::ResponseError for AppError {,    fn error_response(&self) -> HttpResponse {,        match self {,            AppError::NotFound => HttpResponse::NotFound().json(,                json!({\"error\": \"not found\"}),            ),,            AppError::BadRequest => HttpResponse::BadRequest().json(,                json!({\"error\": \"bad request\"}),            ),,        },    },},\n\n// ── Server setup ────────────────────────────────────,#[actix_web::main],async fn main() -> std::io::Result<()> {,    let counter = web::Data::new(Mutex::new(0));,,    HttpServer::new(move || {,        App::new(),            .app_data(counter.clone()),            .route(\"/\", web::get().to(hello)),            .route(\"/users/{id}\", web::get().to(get_user)),            .route(\"/users\", web::post().to(create_user)),            .route(\"/list/{id}\", web::get().to(list_users)),            .route(\"/counter\", web::post().to(increment_counter)),    }),    .bind(\"127.0.0.1:8080\")?,    .run(),    .await,}"
                  }
        ],
        tips: [
                  "Implement ResponseError for custom error types — Actix auto-converts to HTTP responses.",
                  "web::Data<T> clones for each thread — use Mutex or Arc for shared mutable state.",
                  "Handlers can take multiple extractors: Path, Query, Json, Data, etc.",
                  "Actix is very fast — consider it for performance-critical apps."
        ],
        mistake: "Not implementing ResponseError for custom errors — they won't serialize to JSON responses.",
        shorthand: {
          verbose: "// Manual request parsing (verbose)\nlet body = String::from_utf8(req.body().to_vec())?;\nlet user: User = serde_json::from_str(&body)?;",
          concise: "async fn handler(body: web::Json<User>) { ... }",
        },
      },
      {
        id: "actix-middleware",
        fn: "Actix-web Middleware — wrap_fn, Custom Transformers, Logging",
        desc: "Build Actix middleware: wrap_fn for simple middleware, Service trait for complex cases, and logging.",
        category: "Web",
        subtitle: "wrap_fn, Transform, Service, middleware composition, actix-web::middleware",
        signature: ".wrap(middleware::Logger::default())  |  .wrap_fn(|req, srv| { ... })",
        descLong: "Actix middleware wraps handlers. Simple middleware use wrap_fn with a closure. Complex middleware implement Transform and Service traits. Built-in middleware: Logger, NormalizePath, DefaultHeaders. Middleware runs on all requests. Can modify request/response or reject with error.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Actix-web Middleware — wrap_fn, Custom Transformers, Logging — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse actix_web::{\n    web, App, HttpResponse, HttpServer, HttpRequest,\n    middleware::{self, Logger},\n    dev::{Service, ServiceRequest, ServiceResponse, Transform},\n    Error,\n};\nuse futures::future::{ok, LocalBoxFuture, Ready};\nuse std::rc::Rc;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Actix-web Middleware — wrap_fn, Custom Transformers, Logging — common patterns you'll see in production.\n// APPROACH  - Combine Actix-web Middleware — wrap_fn, Custom Transformers, Logging with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Simple middleware with wrap_fn ─────────────────\nasync fn logging_middleware(\n    req: ServiceRequest,\n    srv: Rc<impl Service<ServiceRequest, Response=ServiceResponse, Error=Error>>,\n) -> Result<ServiceResponse, Error> {\n    println!(\"{} {}\", req.method(), req.path());\n    let res = srv.call(req).await?;\n    Ok(res)\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Actix-web Middleware — wrap_fn, Custom Transformers, Logging — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Custom Transform + Service ──────────────────────,pub struct CustomMiddleware;,,impl<S, B> Transform<S, ServiceRequest> for CustomMiddleware,where,    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,,    S::Future: 'static,,    B: 'static,,{,    type Response = ServiceResponse<B>;,    type Error = Error;,    type InitError = ();,    type Transform = CustomMiddlewareService<S>;,    type Future = Ready<Result<Self::Transform, Self::InitError>>;,,    fn new_transform(&self, service: S) -> Self::Future {,        ok(CustomMiddlewareService { service }),    },},,pub struct CustomMiddlewareService<S> {,    service: S,,},,impl<S, B> Service<ServiceRequest> for CustomMiddlewareService<S>,where,    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,,    S::Future: 'static,,    B: 'static,,{,    type Response = ServiceResponse<B>;,    type Error = Error;,    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;,,    fn poll_ready(&self, cx: &mut std::task::Context<'_>) -> std::task::Poll<Result<(), Self::Error>> {,        self.service.poll_ready(cx),    },,    fn call(&self, req: ServiceRequest) -> Self::Future {,        let start = std::time::Instant::now();,        let path = req.path().to_string();,,        let fut = self.service.call(req);,,        Box::pin(async move {,            let res = fut.await?;,            let elapsed = start.elapsed().as_millis();,            println!(\"{} took {}ms\", path, elapsed);,            Ok(res),        }),    },},\n\n// ── Auth middleware ────────────────────────────────,use actix_web::error::{ErrorUnauthorized, ErrorForbidden};,,async fn auth_middleware(,    req: ServiceRequest,,    srv: Rc<impl Service<ServiceRequest, Response=ServiceResponse, Error=Error>>,,) -> Result<ServiceResponse, Error> {,    if let Some(token) = req.headers().get(\"authorization\") {,        if token.to_str().ok().map(|t| t.starts_with(\"Bearer \")).unwrap_or(false) {,            return Ok(srv.call(req).await?);,        },    },    Err(ErrorUnauthorized(\"missing or invalid token\")),},\n\n// ── Built-in middleware ────────────────────────────,#[actix_web::main],async fn main() -> std::io::Result<()> {,    env_logger::init_from_env(env_logger::Env::default().default_filter_or(\"info\"));,,    HttpServer::new(|| {,        App::new(),            .wrap(Logger::default())  // Built-in logging,            .wrap(middleware::NormalizePath::trim())  // Normalize paths,            .wrap_fn(logging_middleware)  // Custom wrap_fn,            .wrap(CustomMiddleware)  // Custom Transform,            .route(\"/\", web::get().to(|| async { HttpResponse::Ok().body(\"ok\") })),    }),    .bind(\"127.0.0.1:8080\")?,    .run(),    .await,}"
                  }
        ],
        tips: [
                  "wrap_fn is simpler for basic middleware — only use Service trait for complex cases.",
                  "Logger::default() provides automatic request logging — configure with env_logger.",
                  "Middleware order matters — wraps are applied bottom-to-top.",
                  "Return Err to reject requests — useful for auth, validation, rate limiting."
        ],
        mistake: "Implementing Service trait for simple middleware — use wrap_fn instead.",
        shorthand: {
          verbose: "// Manual request handling (verbose)\nfor req in requests {\n  process_headers(&req);\n  let res = handler(req);\n  log_response(&res);\n}",
          concise: "app.wrap(Logger::default())  // auto-logs all requests",
        },
      },
      {
        id: "sqlx-web",
        fn: "SQLx with Web Frameworks — Connection Pools & Type-Safe Queries",
        desc: "Integrate sqlx into Axum/Actix: manage connection pools, pass pools in State, execute queries with type safety.",
        category: "Database",
        subtitle: "PgPool, SqlitePool, pool.fetch_one(), pool.execute(), From State",
        signature: "let pool = PgPoolOptions::new().connect(url).await?;  |  async fn handler(State(pool): State<PgPool>)",
        descLong: "sqlx provides type-safe database queries checked at compile time. PgPool/SqlitePool manage connections. Create pool once, pass via State to all handlers. Query macros (sqlx::query_as!) check SQL at compile time against real database. No ORM overhead — raw SQL with compile-time verification. Excellent error messages when queries are invalid.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of SQLx with Web Frameworks — Connection Pools & Type-Safe Queries — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse axum::{\n    extract::State,\n    Json, Router,\n    routing::get,\n};\nuse serde::{Deserialize, Serialize};\nuse sqlx::{PgPool, postgres::PgPoolOptions, Row};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of SQLx with Web Frameworks — Connection Pools & Type-Safe Queries — common patterns you'll see in production.\n// APPROACH  - Combine SQLx with Web Frameworks — Connection Pools & Type-Safe Queries with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Database types ─────────────────────────────────\n#[derive(Serialize, Deserialize, sqlx::FromRow)]\npub struct User {\n    pub id: i64,\n    pub name: String,\n    pub email: String,\n}\n\n#[derive(Deserialize)]\npub struct CreateUserReq {\n    pub name: String,\n    pub email: String,\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of SQLx with Web Frameworks — Connection Pools & Type-Safe Queries — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Pool setup ──────────────────────────────────────,pub async fn create_pool(db_url: &str) -> Result<PgPool, sqlx::Error> {,    PgPoolOptions::new(),        .max_connections(5),        .connect(db_url),        .await,},\n\n// ── Query functions ────────────────────────────────,pub async fn get_user(pool: &PgPool, id: i64) -> Result<User, sqlx::Error> {,    sqlx::query_as::<_, User>(,        \"SELECT id, name, email FROM users WHERE id = $1\",    ),    .bind(id),    .fetch_one(pool),    .await,},,pub async fn list_users(pool: &PgPool) -> Result<Vec<User>, sqlx::Error> {,    sqlx::query_as::<_, User>(,        \"SELECT id, name, email FROM users ORDER BY id\",    ),    .fetch_all(pool),    .await,},,pub async fn create_user(,    pool: &PgPool,,    req: &CreateUserReq,,) -> Result<User, sqlx::Error> {,    sqlx::query_as::<_, User>(,        \"INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email\",    ),    .bind(&req.name),    .bind(&req.email),    .fetch_one(pool),    .await,},,pub async fn delete_user(pool: &PgPool, id: i64) -> Result<u64, sqlx::Error> {,    let result = sqlx::query(,        \"DELETE FROM users WHERE id = $1\",    ),    .bind(id),    .execute(pool),    .await?;,    Ok(result.rows_affected()),},\n\n// ── Handler integration ────────────────────────────,async fn get_user_handler(,    State(pool): State<PgPool>,,    axum::extract::Path(id): axum::extract::Path<i64>,,) -> Result<Json<User>, (axum::http::StatusCode, String)> {,    get_user(&pool, id),        .await,        .map(Json),        .map_err(|e| (,            axum::http::StatusCode::INTERNAL_SERVER_ERROR,,            e.to_string(),,        )),},,async fn list_users_handler(,    State(pool): State<PgPool>,,) -> Result<Json<Vec<User>>, (axum::http::StatusCode, String)> {,    list_users(&pool),        .await,        .map(Json),        .map_err(|e| (,            axum::http::StatusCode::INTERNAL_SERVER_ERROR,,            e.to_string(),,        )),},,async fn create_user_handler(,    State(pool): State<PgPool>,,    Json(req): Json<CreateUserReq>,,) -> Result<(axum::http::StatusCode, Json<User>), (axum::http::StatusCode, String)> {,    create_user(&pool, &req),        .await,        .map(|user| (axum::http::StatusCode::CREATED, Json(user))),        .map_err(|e| (,            axum::http::StatusCode::INTERNAL_SERVER_ERROR,,            e.to_string(),,        )),},\n\n// ── Router setup ────────────────────────────────────,pub fn create_router(pool: PgPool) -> Router {,    Router::new(),        .route(\"/users\", get(list_users_handler).post(create_user_handler)),        .route(\"/users/:id\", get(get_user_handler)),        .with_state(pool),},\n\n// ── Main setup ──────────────────────────────────────,#[tokio::main],async fn main() -> Result<(), Box<dyn std::error::Error>> {,    let pool = create_pool(\"postgres://user:password@localhost/mydb\").await?;,\n\n    // Run migrations,    sqlx::migrate!(\"./migrations\").run(&pool).await?;,,    let app = create_router(pool);,    let listener = tokio::net::TcpListener::bind(\"0.0.0.0:3000\").await?;,    axum::serve(listener, app).await?;,,    Ok(()),}"
                  }
        ],
        tips: [
                  "sqlx::query_as with #[derive(FromRow)] maps rows to structs automatically.",
                  "Bind parameters with .bind() — prevents SQL injection.",
                  "Create pool once in main() — reuse everywhere via State.",
                  "Compile-time checked queries with sqlx::query!() macro — catches errors at build time."
        ],
        mistake: "Creating a new pool per request — pools are expensive. Create once, reuse.",
        shorthand: {
          verbose: "// Manual row mapping (verbose)\nlet row = pool.query_one(\"SELECT ...\").await?;\nlet user = User {\n  id: row.get(\"id\"),\n  name: row.get(\"name\"),\n};",
          concise: "sqlx::query_as::<_, User>(\"SELECT ...\")\n  .fetch_one(&pool)\n  .await",
        },
      },
      {
        id: "diesel-basics",
        fn: "Diesel ORM — Type-Safe Query Builder & Migrations",
        desc: "Use Diesel: schema generation, type-safe select/insert/update, migrations, and compile-time safety.",
        category: "Database",
        subtitle: "diesel::prelude, select, insert_into, update, delete, #[derive(Insertable, Queryable)]",
        signature: "users::table.select(users::all_columns).load::<User>(conn)?",
        descLong: "Diesel is Rust's most mature ORM. It generates schema.rs from database at compile time. Type-safe query building with compile-time checking. Migrations manage schema. No runtime query parsing — all queries validated at build time. Slightly more verbose than other ORMs but extremely safe.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Diesel ORM — Type-Safe Query Builder & Migrations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Cargo.toml:\n// [dependencies]\n// diesel = { version = \"2\", features = [\"postgres\"] }\n// [dev-dependencies]\n// diesel_cli = { version = \"2\" }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Diesel ORM — Type-Safe Query Builder & Migrations — common patterns you'll see in production.\n// APPROACH  - Combine Diesel ORM — Type-Safe Query Builder & Migrations with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Schema generation (src/schema.rs) ───────────────\n// Generated by: diesel setup && diesel migration run\ntable! {\n    users (id) {\n        id -> Integer,\n        name -> Text,\n        email -> Text,\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Diesel ORM — Type-Safe Query Builder & Migrations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Model types ─────────────────────────────────────,use diesel::prelude::*;,,#[derive(Queryable, Selectable)],#[diesel(table_name = users)],pub struct User {,    pub id: i32,,    pub name: String,,    pub email: String,,},,#[derive(Insertable)],#[diesel(table_name = users)],pub struct NewUser {,    pub name: String,,    pub email: String,,},\n\n// ── Queries ─────────────────────────────────────────,use diesel::PgConnection;,use crate::schema::users;,,pub fn get_user(conn: &mut PgConnection, user_id: i32) -> QueryResult<User> {,    users::table,        .find(user_id),        .select(User::as_select()),        .first(conn),},,pub fn list_users(conn: &mut PgConnection) -> QueryResult<Vec<User>> {,    users::table,        .select(User::as_select()),        .load(conn),},,pub fn create_user(,    conn: &mut PgConnection,,    name: &str,,    email: &str,,) -> QueryResult<User> {,    let new_user = NewUser {,        name: name.to_string(),,        email: email.to_string(),,    };,,    diesel::insert_into(users::table),        .values(&new_user),        .get_result(conn),},,pub fn update_user(,    conn: &mut PgConnection,,    user_id: i32,,    name: &str,,) -> QueryResult<User> {,    diesel::update(users::table.find(user_id)),        .set(users::name.eq(name)),        .get_result(conn),},,pub fn delete_user(conn: &mut PgConnection, user_id: i32) -> QueryResult<usize> {,    diesel::delete(users::table.find(user_id)).execute(conn),},\n\n// ── Filters ─────────────────────────────────────────,pub fn find_by_email(conn: &mut PgConnection, email: &str) -> QueryResult<User> {,    users::table,        .filter(users::email.eq(email)),        .select(User::as_select()),        .first(conn),},,pub fn list_by_name_prefix(,    conn: &mut PgConnection,,    prefix: &str,,) -> QueryResult<Vec<User>> {,    users::table,        .filter(users::name.like(format!(\"{}%\", prefix))),        .select(User::as_select()),        .load(conn),},\n\n// ── Migrations ──────────────────────────────────────,// diesel migration generate create_users,// Edit migrations/2024-01-01-000000_create_users/up.sql:,// CREATE TABLE users (,//   id SERIAL PRIMARY KEY,,//   name TEXT NOT NULL,,//   email TEXT NOT NULL,// );,// diesel migration run"
                  }
        ],
        tips: [
                  "Diesel checks all queries at compile time — errors caught before runtime.",
                  "Migrations version your schema — pair with git for schema tracking.",
                  ".select(User::as_select()) is type-safe — compile error if columns don't match.",
                  "Prefer strongly-typed NewUser/UpdateUser types — cleaner than maps."
        ],
        mistake: "Hardcoding SQL in Diesel when the query builder is available — loses type safety.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Manual SQL (verbose, unsafe)\nconn.execute(\"INSERT INTO users (name, email) VALUES (?, ?)\", &[name, email])?;\n// More explicit but longer",
          concise: "diesel::insert_into(users::table)\n  .values(&new_user)\n  .get_result(conn)?",
        },
      },
      {
        id: "tower-http-layers",
        fn: "Tower-HTTP Layers — Tracing, Compression, CORS, ServeDir",
        desc: "Composable middleware layers: TraceLayer for logging, CorsLayer, CompressionLayer, ServeDir for static files.",
        category: "Web",
        subtitle: "TraceLayer, CorsLayer, CompressionLayer, ServeDir, DecompressionLayer, MatchedPathLayer",
        signature: ".layer(TraceLayer::new_for_http())  |  .layer(CorsLayer::permissive())",
        descLong: "tower-http provides composable, zero-copy layers for common web tasks. TraceLayer integrates with tracing crate for structured logging. CorsLayer handles CORS headers. CompressionLayer gzips responses. ServeDir serves static files. MatchedPathLayer records which route matched (for metrics). Layers compose with ServiceBuilder for clean code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Tower-HTTP Layers — Tracing, Compression, CORS, ServeDir — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse axum::{Router, routing::get};\nuse tower_http::{\n    cors::{CorsLayer, Any},\n    trace::TraceLayer,\n    compression::CompressionLayer,\n    services::ServeDir,\n    set_header::SetResponseHeaderLayer,\n};\nuse std::time::Duration;\nuse tower::ServiceBuilder;\nuse tower_http::timeout::TimeoutLayer;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Tower-HTTP Layers — Tracing, Compression, CORS, ServeDir — common patterns you'll see in production.\n// APPROACH  - Combine Tower-HTTP Layers — Tracing, Compression, CORS, ServeDir with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Tracing layer setup ─────────────────────────────\nfn setup_tracing() {\n    tracing_subscriber::fmt()\n        .with_max_level(tracing::Level::INFO)\n        .init();\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Tower-HTTP Layers — Tracing, Compression, CORS, ServeDir — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Comprehensive middleware stack ──────────────────,pub fn create_app() -> Router {,    Router::new(),        .route(\"/api/data\", get(|| async { \"data\" })),        .route(\"/\", get(|| async { \"hello\" })),        .nest_services(\"/static\", ServeDir::new(\"static\")),        .layer(,            ServiceBuilder::new(),                // Request tracing,                .layer(TraceLayer::new_for_http()),\n\n                // Compression,                .layer(CompressionLayer::new(),                    .gzip(true),                    .br(true),                    .zstd(true)),\n\n                // CORS,                .layer(,                    CorsLayer::new(),                        .allow_origin(Any),                        .allow_methods(Any),                        .allow_headers(Any),                        .max_age(Duration::from_secs(86400)),                ),\n\n                // Timeout,                .layer(TimeoutLayer::new(Duration::from_secs(30))),\n\n                // Custom headers,                .layer(SetResponseHeaderLayer::if_not_present(,                    \"x-frame-options\".parse().unwrap(),,                    \"DENY\".parse().unwrap(),,                )),        ),},\n\n// ── CorsLayer configuration ────────────────────────,fn cors_config() -> CorsLayer {,    CorsLayer::new(),        .allow_origin(\"http://localhost:3000\".parse().unwrap()),        .allow_methods([,            axum::http::Method::GET,,            axum::http::Method::POST,,            axum::http::Method::PUT,,        ]),        .allow_headers(Any),        .allow_credentials(),        .max_age(Duration::from_secs(3600)),},\n\n// ── Compression options ─────────────────────────────,fn compression_config() -> CompressionLayer {,    CompressionLayer::new(),        .gzip(true)          // gzip compression,        .br(true)            // brotli compression,        .zstd(true)          // zstandard compression,        // Prefer smaller payloads automatically,},\n\n// ── Serve static files ──────────────────────────────,pub fn with_static_files() -> Router {,    Router::new(),        .route(\"/api/data\", get(|| async { \"data\" })),        // Serve files from static/ directory,        .nest_services(\"/\", ServeDir::new(\"static\"),            .fallback(axum::routing::get(|| async { \"not found\" }))),},\n\n// ── Main with all layers ────────────────────────────,#[tokio::main],async fn main() {,    setup_tracing();,,    let app = create_app();,,    let listener = tokio::net::TcpListener::bind(\"0.0.0.0:3000\"),        .await,        .unwrap();,,    println!(\"Listening on :3000\");,    axum::serve(listener, app),        .await,        .unwrap();,},\n\n// ── Metrics with tower-http ────────────────────────,use tower_http::metrics::InFlightRequestsLayer;,,fn with_metrics() -> Router {,    Router::new(),        .route(\"/\", get(|| async { \"hello\" })),        .layer(InFlightRequestsLayer::new()),}"
                  }
        ],
        tips: [
                  "TraceLayer + tracing_subscriber = automatic structured logging.",
                  "CompressionLayer auto-detects Accept-Encoding — no client code needed.",
                  "CorsLayer::permissive() for development — restrict origins in production.",
                  "ServeDir can fallback to a handler — useful for SPA routing."
        ],
        mistake: "Not using CompressionLayer — wastes bandwidth on JSON/HTML responses.",
        shorthand: {
          verbose: "// Manual CORS headers (verbose, error-prone)\nres.headers_mut().insert(\"Access-Control-Allow-Origin\", \"*\".parse()?);\nres.headers_mut().insert(\"Access-Control-Allow-Methods\", \"GET,POST\".parse()?);",
          concise: "app.layer(CorsLayer::permissive())",
        },
      },
    ],
  },
]

export default { meta, sections }
