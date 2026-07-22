export const meta = {
  "title": "APIs & Frameworks",
  "domain": "python",
  "sheet": "apis",
  "icon": "🌐"
}

export const sections = [

  // ── Section 1: FastAPI ─────────────────────────────────────────
  {
    id: "fastapi",
    title: "FastAPI",
    entries: [
      {
        id: "fastapi-routes",
        fn: "FastAPI routes",
        desc: "Define HTTP endpoints with automatic validation and OpenAPI docs.",
        category: "FastAPI",
        subtitle: "Path params, query params, request body — all validated via type hints",
        signature: "@app.get(\"/items/{id}\") async def fn(id: int, q: str = None):",
        descLong: "FastAPI uses Python type hints for automatic request validation, serialization, and OpenAPI docs generation (available at /docs). Path parameters are in the URL; query parameters are function arguments with defaults; request body comes from Pydantic models.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of FastAPI routes — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom fastapi import FastAPI\napp = FastAPI()\n@app.get(\"/items/{item_id}\")\nasync def read_item(item_id: int, q: str | None = None):\n    return {\"item_id\": item_id, \"q\": q}\n# $ uvicorn main:app --reload\n# Open http://localhost:8000/docs for the auto-generated Swagger UI"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of FastAPI routes — common patterns you'll see in production.\n# APPROACH  - Combine FastAPI routes with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom fastapi import FastAPI, HTTPException, status\nfrom pydantic import BaseModel\napp = FastAPI(title=\"Sales API\", version=\"1.0.0\")\nclass UserIn(BaseModel):\n    name:  str\n    email: str\n    age:   int | None = None\nclass UserOut(BaseModel):\n    id:    int\n    name:  str\n    email: str\n# GET with path param (typed) + query param (with default = optional)\n@app.get(\"/users/{user_id}\", response_model=UserOut)\nasync def get_user(user_id: int, verbose: bool = False):\n    user = fetch_user(user_id)\n    if not user:\n        raise HTTPException(status_code=404, detail=\"user not found\")\n    return user                                   # response_model strips extra fields\n# POST returns 201 — never 200 on creation\n@app.post(\"/users\", response_model=UserOut, status_code=status.HTTP_201_CREATED)\nasync def create_user(body: UserIn):\n    return persist_user(body.model_dump())"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of FastAPI routes — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom fastapi import FastAPI, APIRouter, HTTPException, status, Path, Query\nfrom pydantic import BaseModel, Field\n# 1) APIRouter — split routes into modules, mount with a single line\nusers_router = APIRouter(prefix=\"/users\", tags=[\"users\"])\nclass UserOut(BaseModel):\n    id:    int\n    name:  str\n    email: str\nclass ErrorOut(BaseModel):\n    error:   str\n    request_id: str | None = None\n# 2) responses= documents non-200 status codes in OpenAPI\n@users_router.get(\n    \"/{user_id}\",\n    response_model=UserOut,\n    responses={\n        404: {\"model\": ErrorOut, \"description\": \"User not found\"},\n        429: {\"model\": ErrorOut, \"description\": \"Rate limit exceeded\"},\n    },\n)\nasync def get_user(\n    user_id: int = Path(..., gt=0, description=\"positive integer ID\"),\n    fields:  list[str] = Query(default=[], max_length=10),\n):\n    user = fetch_user(user_id)\n    if not user:\n        raise HTTPException(status_code=404, detail=\"user not found\")\n    return user\n# 3) Verb decorators (FastAPI 0.95+) — clearer than @app.api_route(methods=[...])\n@users_router.post(\"/\", response_model=UserOut, status_code=status.HTTP_201_CREATED)\nasync def create_user(body: UserOut):                # use a separate UserIn in real code\n    return body\n# 4) Mount the router on the app — keep app.py tiny\napp = FastAPI()\napp.include_router(users_router)\n# Decision rule:\n#   < 5 routes total                    -> @app.get / @app.post on the FastAPI instance\n#   feature-grouped routes               -> APIRouter(prefix=..., tags=...) per module\n#   document non-2xx responses           -> responses={404: {...}, ...}\n#   constrain path / query parameters     -> Path(..., gt=0) / Query(..., max_length=N)\n#   shared logic across handlers          -> dependency injection, not helper imports\n#   long-running endpoint                  -> StreamingResponse / BackgroundTasks\n#\n# Anti-pattern: business logic crammed into route bodies\n#   Routes are a HTTP layer: validate, authenticate, call a service, shape the\n#   response. Push DB / email / payment logic into a service module so it stays\n#   testable independently of FastAPI.\ndef fetch_user(_): return None\ndef persist_user(d): return {\"id\": 1, **d}"
                  }
        ],
        tips: [
                  "FastAPI auto-generates `/docs` (Swagger UI) and `/redoc` — browse the API interactively",
                  "`response_model=` strips private fields before returning — prevents leaking internal data",
                  "`raise HTTPException(status_code=404, detail=\"msg\")` is the standard error response",
                  "`status_code=201` on POST routes — 200 is incorrect for creation"
        ],
        mistake: "Putting all logic in route functions. Move DB queries and business logic to service functions — routes should only handle HTTP concerns (parsing, status codes, HTTPException).",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "fastapi-di",
        fn: "FastAPI dependency injection",
        desc: "Share logic across routes with Depends() — DB sessions, auth, config.",
        category: "FastAPI",
        subtitle: "Depends() injects shared resources — composable and testable",
        signature: "def route(dep=Depends(get_dep)): ...",
        descLong: "FastAPI's Depends() system injects dependencies (DB sessions, auth tokens, config) into route functions. Dependencies can depend on other dependencies (composition). Yield dependencies handle setup and teardown.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of FastAPI dependency injection — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom fastapi import Depends, FastAPI\napp = FastAPI()\ndef pagination(skip: int = 0, limit: int = 50):\n    return {\"skip\": skip, \"limit\": min(limit, 100)}\n@app.get(\"/items\")\nasync def list_items(p: dict = Depends(pagination)):\n    return {\"page\": p}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of FastAPI dependency injection — common patterns you'll see in production.\n# APPROACH  - Combine FastAPI dependency injection with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom fastapi import Depends, FastAPI, HTTPException, status\nfrom fastapi.security import OAuth2PasswordBearer\napp = FastAPI()\n# 1) Yield dependency — setup before, teardown after; runs even on errors\ndef get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()\n# 2) Composition — dependencies can depend on other dependencies\noauth2_scheme = OAuth2PasswordBearer(tokenUrl=\"token\")\ndef get_current_user(token: str = Depends(oauth2_scheme),\n                     db = Depends(get_db)):\n    user = verify_token(token, db)\n    if not user:\n        raise HTTPException(401, \"invalid token\",\n                            headers={\"WWW-Authenticate\": \"Bearer\"})\n    return user\ndef get_admin(user = Depends(get_current_user)):\n    if not user.is_admin:\n        raise HTTPException(403, \"admins only\")\n    return user\n@app.get(\"/me\")\nasync def me(user = Depends(get_current_user)):\n    return {\"id\": user.id, \"name\": user.name}\n@app.delete(\"/users/{uid}\")\nasync def delete_user(uid: int,\n                      db    = Depends(get_db),\n                      _admin = Depends(get_admin)):\n    db.query(User).filter(User.id == uid).delete()\n    db.commit()\n    return {\"deleted\": uid}\n# Tests: app.dependency_overrides[get_db] = lambda: test_db   (clean override)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of FastAPI dependency injection — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom typing import Annotated\nfrom fastapi import Depends, FastAPI, Header, Request, HTTPException\napp = FastAPI()\n# 1) Annotated[Type, Depends(fn)] — single source of truth, no duplication on every route\ndef get_db():\n    db = SessionLocal()\n    try: yield db\n    finally: db.close()\nDBSession = Annotated[Session, Depends(get_db)]    # define the type ONCE, reuse it\n@app.get(\"/users/{uid}\")\nasync def get_user(uid: int, db: DBSession):       # cleaner than db = Depends(get_db) on every route\n    return db.get(User, uid)\n# 2) Class-based dependency — natural fit for \"stateful\" deps with multiple inputs\nclass Pagination:\n    def __init__(self, skip: int = 0, limit: int = 50, max_limit: int = 100):\n        self.skip = skip\n        self.limit = min(limit, max_limit)\n@app.get(\"/items\")\nasync def list_items(p: Annotated[Pagination, Depends()]):\n    return {\"skip\": p.skip, \"limit\": p.limit}\n# 3) Per-request state via dependencies + middleware — request-id propagation\nasync def get_request_id(request: Request,\n                         x_request_id: str | None = Header(default=None)):\n    rid = x_request_id or request.headers.get(\"traceparent\") or \"anon\"\n    request.state.request_id = rid\n    return rid\n@app.get(\"/work\")\nasync def work(rid: str = Depends(get_request_id)):\n    return {\"request_id\": rid}\n# 4) Caching — by default, the SAME dependency is computed once per request.\n#    Pass use_cache=False to force recomputation when needed (rare).\ndef expensive_check(): return \"ok\"\n@app.get(\"/x\")\nasync def x(c1: str = Depends(expensive_check),\n            c2: str = Depends(expensive_check, use_cache=False)):  # called twice\n    return c1, c2\n# 5) Override in tests — the only sane way to swap the DB\n# def fake_db(): yield FakeSession()\n# app.dependency_overrides[get_db] = fake_db\n# ... TestClient(app) ...\n# app.dependency_overrides.clear()\n# Decision rule:\n#   shared resource per request           -> yield dependency (db, redis, otel span)\n#   reused across handlers, no setup       -> plain function dependency\n#   bundles multiple inputs                 -> class dependency (Annotated[..., Depends()])\n#   cross-cutting policy (auth, RBAC)       -> compose dependencies; declare on the route\n#   value derived from headers / cookies    -> dependency that takes Header / Cookie / Request\n#   want test isolation                      -> app.dependency_overrides\n#\n# Anti-pattern: importing a global SessionLocal in handlers\n#   The session leaks past the request, isn't closed on errors, and survives in\n#   one async task while another resets it. Always go through Depends(get_db).\ndef verify_token(t, db): return None\ndef SessionLocal(): return None\nclass Session: pass\nclass User: pass"
                  }
        ],
        tips: [
                  "`yield` in a dependency — code before yield is setup, code after is teardown (always runs)",
                  "Dependencies can depend on other dependencies — compose them like building blocks",
                  "Dependencies are cached per request — `get_db()` is called once even if multiple routes use it",
                  "Override dependencies in tests: `app.dependency_overrides[get_db] = lambda: test_db`"
        ],
        mistake: "Creating a DB session at module level instead of using a dependency. Module-level sessions are not scoped to a request — they accumulate connections and cause leaks.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "pydantic-models",
        fn: "Pydantic models",
        desc: "Define validated, typed data schemas for request and response bodies.",
        category: "FastAPI",
        subtitle: "BaseModel with Field constraints — validates on instantiation",
        signature: "class Model(BaseModel): field: type = Field(..., gt=0)",
        descLong: "Pydantic BaseModel validates data at instantiation using type hints and Field constraints. Used in FastAPI for request bodies, response schemas, and settings. model_dump() serializes to dict; model_validate() parses from dict.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Pydantic models — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom pydantic import BaseModel\nclass User(BaseModel):\n    id:    int\n    name:  str\n    email: str\nu = User(id=1, name=\"Alice\", email=\"alice@example.com\")\nprint(u.model_dump())                                # {'id': 1, 'name': 'Alice', ...}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Pydantic models — common patterns you'll see in production.\n# APPROACH  - Combine Pydantic models with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom datetime import datetime\nfrom pydantic import BaseModel, Field, EmailStr\nclass Address(BaseModel):\n    street: str\n    city:   str\nclass Order(BaseModel):\n    id:       int\n    item:     str       = Field(..., min_length=1)        # ... = required (no default)\n    quantity: int       = Field(..., gt=0, le=1000)\n    price:    float     = Field(..., gt=0)\n    discount: float     = Field(default=0.0, ge=0, le=1.0)\n    created:  datetime  = Field(default_factory=datetime.utcnow)\n    tags:     list[str] = []\n    address:  Address                                       # validated recursively\n# Serialization\no = Order(id=1, item=\"Widget\", quantity=5, price=9.99,\n          address=Address(street=\"123 Main\", city=\"Boston\"))\nprint(o.model_dump())                                       # plain dict\nprint(o.model_dump(exclude={\"id\", \"tags\"}))                 # drop sensitive fields\nprint(o.model_dump_json())                                  # JSON string\n# Read from a SQLAlchemy ORM row (model_config option)\nclass UserOut(BaseModel):\n    id:    int\n    name:  str\n    email: EmailStr\n    model_config = {\"from_attributes\": True}                # was orm_mode in v1"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Pydantic models — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom typing import Annotated, Literal\nfrom pydantic import (\n    BaseModel, ConfigDict, Field, EmailStr, computed_field, model_validator,\n)\n# 1) Strict mode + extra=\"forbid\" — no silent type coercion, no surprise fields\nclass StrictUser(BaseModel):\n    model_config = ConfigDict(strict=True, extra=\"forbid\")\n    id:    int\n    email: EmailStr\n    age:   int = Field(ge=0, le=120)\n# 2) computed_field — derive a field that appears in dump() and OpenAPI\nclass Order(BaseModel):\n    quantity: int     = Field(gt=0)\n    price:    float   = Field(gt=0)\n    discount: float   = Field(default=0.0, ge=0, le=1.0)\n    @computed_field\n    @property\n    def total(self) -> float:\n        return self.quantity * self.price * (1 - self.discount)\n# 3) Discriminated union — dispatch on a literal field; FastAPI auto-routes\nclass CardPayment(BaseModel):\n    method: Literal[\"card\"]\n    last4:  str = Field(pattern=r\"^\\d{4}$\")\nclass WirePayment(BaseModel):\n    method: Literal[\"wire\"]\n    iban:   str\nPayment = Annotated[CardPayment | WirePayment, Field(discriminator=\"method\")]\nclass Checkout(BaseModel):\n    payment: Payment\nCheckout.model_validate({\"payment\": {\"method\": \"card\", \"last4\": \"1234\"}})\n# 4) Use model_validator for \"this combo is invalid\"\nclass DateRange(BaseModel):\n    start: datetime\n    end:   datetime\n    @model_validator(mode=\"after\")\n    def end_after_start(self):\n        if self.end <= self.start:\n            raise ValueError(\"end must be after start\")\n        return self\n# 5) Reuse the JSON schema in OpenAPI / docs / static analysis\nprint(Order.model_json_schema())\n# Decision rule:\n#   public API request body              -> strict=True + extra=\"forbid\"\n#   internal record / config              -> defaults; permissive parsing\n#   field derived from others             -> @computed_field (visible in OpenAPI)\n#   pick by a \"type\" field                -> discriminated union with Field(discriminator=...)\n#   email / URL / etc.                     -> EmailStr / HttpUrl, not plain str\n#   need to mutate value during validation  -> @field_validator returns the cleaned value\n#\n# Anti-pattern: extra=\"ignore\" on a public POST endpoint\n#   Clients can send any field they like; you silently drop them. The bug is\n#   indistinguishable from \"field renamed and forgot to update client\". Use\n#   extra=\"forbid\" so typos blow up immediately.\nfrom datetime import datetime"
                  }
        ],
        tips: [
                  "`Field(..., gt=0)` — `...` means required (no default). Use `None` as default for optional fields",
                  "`model_dump(exclude={\"password\"})` strips sensitive fields before logging or returning",
                  "`from_attributes=True` in `model_config` lets Pydantic read attributes from ORM objects",
                  "Pydantic v2 (current): `model_dump()` not `dict()`, `model_validate()` not `parse_obj()`",
                  "Public API request bodies should set `model_config = ConfigDict(strict=True, extra=\"forbid\")` — `extra=\"ignore\"` silently drops typoed/renamed fields and the bug looks identical to a stale client",
                  "Use `EmailStr` / `HttpUrl` / `SecretStr` over plain `str` for those types — validation and safer reprs come for free"
        ],
        mistake: "Using Pydantic v1 syntax in v2: `@validator` → `@field_validator`, `dict()` → `model_dump()`, `parse_obj()` → `model_validate()`. Check version: `pydantic.__version__`.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "pydantic-validators",
        fn: "Pydantic validators",
        desc: "Add custom validation logic to Pydantic model fields.",
        category: "FastAPI",
        subtitle: "@field_validator for per-field, @model_validator for cross-field",
        signature: "@field_validator(\"field\") @classmethod def validate(cls, v): ...",
        descLong: "Pydantic v2 uses @field_validator for per-field validation and @model_validator for cross-field constraints. Validators receive the value and can raise ValueError to fail validation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Pydantic validators — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom pydantic import BaseModel, field_validator\nclass User(BaseModel):\n    email: str\n    @field_validator(\"email\")\n    @classmethod\n    def lowercase(cls, v: str) -> str:           # raise OR transform\n        if \"@\" not in v:\n            raise ValueError(\"invalid email\")\n        return v.lower()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Pydantic validators — common patterns you'll see in production.\n# APPROACH  - Combine Pydantic validators with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom datetime import datetime\nfrom pydantic import BaseModel, ValidationError, field_validator, model_validator\nclass User(BaseModel):\n    email: str\n    age:   int\n    name:  str\n    @field_validator(\"email\")\n    @classmethod\n    def email_must_have_at(cls, v):\n        if \"@\" not in v: raise ValueError(\"invalid email\")\n        return v.lower()                            # normalize on the way in\n    @field_validator(\"name\")\n    @classmethod\n    def name_strip(cls, v):\n        v = v.strip()\n        if not v: raise ValueError(\"name cannot be empty\")\n        return v.title()\n    @field_validator(\"age\")\n    @classmethod\n    def age_range(cls, v):\n        if not 0 <= v <= 150:\n            raise ValueError(\"age must be 0..150\")\n        return v\n# All errors come back in ONE list — clients see every problem at once\ntry:\n    User(email=\"bad\", age=-5, name=\"\")\nexcept ValidationError as e:\n    for err in e.errors():\n        print(err[\"loc\"], err[\"msg\"])\n# Cross-field invariants live on @model_validator(mode=\"after\")\nclass DateRange(BaseModel):\n    start: datetime\n    end:   datetime\n    @model_validator(mode=\"after\")\n    def end_after_start(self):\n        if self.end <= self.start:\n            raise ValueError(\"end must be after start\")\n        return self"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Pydantic validators — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom typing import Annotated\nfrom pydantic import (\n    BaseModel, ValidationError, ValidationInfo,\n    field_validator, model_validator, AfterValidator, BeforeValidator,\n)\n# 1) mode='before' runs BEFORE type coercion — useful when raw input isn't typed yet\nclass Order(BaseModel):\n    quantity: int\n    @field_validator(\"quantity\", mode=\"before\")\n    @classmethod\n    def coerce_strings(cls, v):\n        if isinstance(v, str) and v.endswith(\" units\"):\n            return int(v.removesuffix(\" units\"))\n        return v\nOrder.model_validate({\"quantity\": \"5 units\"})           # works\n# 2) Annotated[Type, AfterValidator(fn)] — REUSE validation across models\ndef lowercase(v: str) -> str:\n    return v.lower()\ndef must_have_at(v: str) -> str:\n    if \"@\" not in v: raise ValueError(\"invalid email\")\n    return v\nEmail = Annotated[str, BeforeValidator(lowercase), AfterValidator(must_have_at)]\nclass Signup(BaseModel):\n    email: Email\nclass Invite(BaseModel):\n    invite_email: Email                                  # reused — single source of truth\n# 3) ValidationInfo gives access to other fields and context — for genuinely cross-field rules\nclass PriceQuote(BaseModel):\n    base:     float\n    discount: float\n    @field_validator(\"discount\")\n    @classmethod\n    def cap_to_base(cls, v: float, info: ValidationInfo) -> float:\n        base = (info.data or {}).get(\"base\", 0)\n        if v > base:\n            raise ValueError(\"discount cannot exceed base price\")\n        return v\n# 4) Errors are structured — turn ValidationError into a stable HTTP body\ndef validation_to_http(e: ValidationError):\n    return [{\"field\": \".\".join(map(str, err[\"loc\"])),\n             \"message\": err[\"msg\"],\n             \"type\": err[\"type\"]} for err in e.errors()]\n# Decision rule:\n#   normalize a single field             -> @field_validator(...)\n#   normalize SHAPE before typing         -> mode=\"before\"\n#   cross-field invariant                  -> @model_validator(mode=\"after\")\n#   need values from sibling fields        -> field_validator + ValidationInfo.data\n#   reusable rule across many models      -> Annotated[Type, AfterValidator(fn)]\n#   custom error formatting for clients     -> walk e.errors(), build your own JSON\n#\n# Anti-pattern: raising HTTPException inside a Pydantic validator\n#   Validators run during model construction, not in a FastAPI handler. They\n#   should raise ValueError; FastAPI translates ValidationError to 422 for you.\n#   Raising HTTPException leaks the framework into your domain models."
                  }
        ],
        tips: [
                  "Validators are `@classmethod` in Pydantic v2 — the `cls` argument receives the model class",
                  "Returning a transformed value from a validator is fine — use it to normalize (lowercase, strip, etc.)",
                  "`mode=\"after\"` in `@model_validator` runs after all field validators pass — has access to all fields",
                  "All validation errors are collected and raised together — users see all problems at once"
        ],
        mistake: "Using the v1 `@validator` decorator in Pydantic v2. It still works but is deprecated. Use `@field_validator` with `@classmethod` as the v2 replacement.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "pydantic-settings",
        fn: "Pydantic BaseSettings",
        desc: "Load typed configuration from environment variables and .env files.",
        category: "FastAPI",
        subtitle: "12-factor app config — reads from env vars automatically",
        signature: "class Settings(BaseSettings): db_url: str",
        descLong: "BaseSettings (from pydantic-settings) reads configuration from environment variables automatically. Field names map to env var names. Use @lru_cache to create a singleton — settings are loaded once and reused.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Pydantic BaseSettings — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# pip install pydantic-settings\nfrom pydantic_settings import BaseSettings\nclass Settings(BaseSettings):\n    database_url: str                    # required — must be in env\n    debug:        bool = False           # default if missing\n# Reads from env: DATABASE_URL, DEBUG (case-insensitive)\nsettings = Settings()\nprint(settings.database_url, settings.debug)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Pydantic BaseSettings — common patterns you'll see in production.\n# APPROACH  - Combine Pydantic BaseSettings with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom functools import lru_cache\nfrom pydantic_settings import BaseSettings, SettingsConfigDict\nfrom fastapi import Depends, FastAPI\nclass Settings(BaseSettings):\n    model_config = SettingsConfigDict(\n        env_file=\".env\",\n        env_file_encoding=\"utf-8\",\n        case_sensitive=False,\n        extra=\"ignore\",                  # ignore unrelated env vars\n    )\n    database_url: str                    # required\n    secret_key:   str                    # required\n    debug:        bool = False\n    port:         int  = 8000\n    cors_origins: list[str] = [\"http://localhost:3000\"]\n# .env (NEVER commit to git)\n#   DATABASE_URL=postgresql://user:pass@localhost/db\n#   SECRET_KEY=supersecret\n#   CORS_ORIGINS=[\"https://app.example.com\"]\n@lru_cache\ndef get_settings() -> Settings:\n    return Settings()                    # cached after first call\napp = FastAPI()\n@app.get(\"/info\")\ndef info(s: Settings = Depends(get_settings)):\n    return {\"debug\": s.debug, \"port\": s.port}      # NEVER return secret_key"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Pydantic BaseSettings — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom functools import lru_cache\nfrom pydantic import SecretStr\nfrom pydantic_settings import BaseSettings, SettingsConfigDict\n# 1) SecretStr — repr() and logs show '**********', accessor needs .get_secret_value()\nclass DBSettings(BaseSettings):\n    model_config = SettingsConfigDict(env_prefix=\"DB_\", env_file=\".env\")\n    host:     str\n    port:     int = 5432\n    user:     str\n    password: SecretStr                  # NOT str\n    name:     str\nclass RedisSettings(BaseSettings):\n    model_config = SettingsConfigDict(env_prefix=\"REDIS_\", env_file=\".env\")\n    url: str\n# 2) Nested settings — compose; each subgroup has its own env prefix\nclass Settings(BaseSettings):\n    model_config = SettingsConfigDict(env_file=\".env\", extra=\"ignore\")\n    env:    str = \"dev\"\n    db:     DBSettings    = DBSettings()\n    redis:  RedisSettings = RedisSettings()\n    def database_url(self) -> str:\n        return (f\"postgresql://{self.db.user}:{self.db.password.get_secret_value()}\"\n                f\"@{self.db.host}:{self.db.port}/{self.db.name}\")\n@lru_cache\ndef get_settings() -> Settings:\n    return Settings()\n# 3) Per-environment files — pick at startup via env var\n#    DJANGO_ENV=staging python -m uvicorn ...\nimport os\nenv_file = f\".env.{os.getenv('APP_ENV', 'dev')}\"\nclass EnvAwareSettings(Settings):\n    model_config = SettingsConfigDict(env_file=env_file, extra=\"ignore\")\n# 4) Test override — clear the lru_cache and inject a fake\ndef override_for_tests(**overrides):\n    get_settings.cache_clear()\n    # In real tests:  app.dependency_overrides[get_settings] = lambda: Settings(**overrides)\n# Decision rule:\n#   anything sensitive (passwords, tokens) -> SecretStr; never plain str\n#   grouped config (db, redis, smtp)        -> nested BaseSettings with env_prefix\n#   per-env config                            -> .env.dev / .env.prod, pick via APP_ENV\n#   serverless / no .env file                  -> ignore env_file, rely on platform env vars\n#   FastAPI handler needs settings             -> Depends(get_settings) (cached lru)\n#   testing                                    -> dependency_overrides + cache_clear\n#\n# Anti-pattern: print(settings) showing the password\n#   Plain str fields are repr'd verbatim — and end up in stack traces, logs, and\n#   error reports. SecretStr renders as '**********' and is opt-in to read."
                  }
        ],
        tips: [
                  "Add `.env` to `.gitignore` immediately — never commit credentials to version control",
                  "`@lru_cache` on `get_settings()` creates a singleton — settings are loaded only once",
                  "`BaseSettings` validates and casts env vars — `PORT=\"8000\"` automatically becomes `int`",
                  "Install separately: `pip install pydantic-settings`",
                  "Type sensitive fields as `SecretStr` (never plain `str`) — they render as `**********` in logs and stack traces and require explicit `.get_secret_value()` to read"
        ],
        mistake: "Hardcoding credentials in source code. Use env vars — one accidental `git push` and credentials are public forever.",
        shorthand: {
          verbose: "from pydantic_settings import BaseSettings\nfrom functools import lru_cache\nclass Settings(BaseSettings):\n# Reads DATABASE_URL from env automatically:",
          concise: "return {\"debug\": s.debug, \"port\": s.port}",
        },
      },
      {
        id: "sqlalchemy-models",
        fn: "SQLAlchemy models",
        desc: "Define database tables as Python classes with the ORM.",
        category: "FastAPI",
        subtitle: "DeclarativeBase + mapped_column — SQLAlchemy 2.0 style",
        signature: "class User(Base): id: Mapped[int] = mapped_column(primary_key=True)",
        descLong: "SQLAlchemy ORM maps Python classes to database tables. The modern (2.0+) API uses DeclarativeBase and Mapped[type] annotations. Relationships link models and enable lazy/eager loading of related objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of SQLAlchemy models — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom sqlalchemy import String, create_engine\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column\nclass Base(DeclarativeBase):\n    pass\nclass User(Base):\n    __tablename__ = \"users\"\n    id:    Mapped[int] = mapped_column(primary_key=True)\n    name:  Mapped[str] = mapped_column(String(100))\n    email: Mapped[str] = mapped_column(String(200), unique=True)\nengine = create_engine(\"sqlite:///app.db\")\nBase.metadata.create_all(engine)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of SQLAlchemy models — common patterns you'll see in production.\n# APPROACH  - Combine SQLAlchemy models with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom sqlalchemy import String, ForeignKey, create_engine\nfrom sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship\nclass Base(DeclarativeBase):\n    pass\nclass Department(Base):\n    __tablename__ = \"departments\"\n    id:   Mapped[int] = mapped_column(primary_key=True)\n    name: Mapped[str] = mapped_column(String(100), unique=True)\n    # selectin avoids the N+1 trap when iterating dept.employees\n    employees: Mapped[list[\"Employee\"]] = relationship(\n        back_populates=\"dept\", lazy=\"selectin\",\n    )\nclass Employee(Base):\n    __tablename__ = \"employees\"\n    id:      Mapped[int]              = mapped_column(primary_key=True)\n    name:    Mapped[str]              = mapped_column(String(200))\n    email:   Mapped[str]              = mapped_column(String(200), unique=True)\n    salary:  Mapped[int]              = mapped_column(default=0)\n    dept_id: Mapped[int | None]       = mapped_column(ForeignKey(\"departments.id\"))\n    dept:    Mapped[\"Department | None\"] = relationship(back_populates=\"employees\")\nengine = create_engine(\"postgresql+psycopg://user:pw@host/db\")\nBase.metadata.create_all(engine)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of SQLAlchemy models — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom datetime import datetime\nfrom sqlalchemy import (\n    String, ForeignKey, Index, UniqueConstraint, CheckConstraint,\n    func, text, create_engine,\n)\nfrom sqlalchemy.orm import (\n    DeclarativeBase, Mapped, mapped_column, relationship, declared_attr,\n)\n# 1) Mixin — every table gets created/updated/deleted_at without copy-paste\nclass TimestampedMixin:\n    created_at: Mapped[datetime] = mapped_column(server_default=func.now())\n    updated_at: Mapped[datetime] = mapped_column(\n        server_default=func.now(), server_onupdate=func.now(),\n    )\n    deleted_at: Mapped[datetime | None] = mapped_column(default=None)\nclass Base(DeclarativeBase):\n    # 2) Map Python types to SQL types in ONE place\n    type_annotation_map = {str: String(255)}             # all str cols become varchar(255)\nclass Department(TimestampedMixin, Base):\n    __tablename__ = \"departments\"\n    id:   Mapped[int] = mapped_column(primary_key=True)\n    name: Mapped[str] = mapped_column(unique=True)\n    employees: Mapped[list[\"Employee\"]] = relationship(\n        back_populates=\"dept\", lazy=\"selectin\", cascade=\"all, delete-orphan\",\n    )\nclass Employee(TimestampedMixin, Base):\n    __tablename__ = \"employees\"\n    id:      Mapped[int]            = mapped_column(primary_key=True)\n    name:    Mapped[str]\n    email:   Mapped[str]\n    salary:  Mapped[int]\n    # PROTECT prevents deleting a dept that still has employees\n    dept_id: Mapped[int | None]     = mapped_column(\n        ForeignKey(\"departments.id\", ondelete=\"RESTRICT\"),\n    )\n    dept:    Mapped[\"Department | None\"] = relationship(back_populates=\"employees\")\n    # 3) Composite index + constraints at the table level\n    __table_args__ = (\n        UniqueConstraint(\"email\", name=\"uq_employees_email\"),\n        Index(\"ix_employees_dept_salary\", \"dept_id\", \"salary\"),\n        CheckConstraint(\"salary >= 0\", name=\"ck_employees_salary_nonneg\"),\n    )\n# 4) Migrations live in Alembic, not Base.metadata.create_all in production\n#    $ alembic init migrations\n#    $ alembic revision --autogenerate -m \"add employees.salary check\"\n#    $ alembic upgrade head\n# Decision rule:\n#   shared timestamp / soft-delete columns       -> mixin class\n#   one Python type -> one SQL type project-wide  -> type_annotation_map on Base\n#   parent without parent column                   -> ondelete=\"RESTRICT\" / \"PROTECT\" semantics\n#   queries always filter by (a, b)                -> composite Index in __table_args__\n#   any invariant the DB must enforce              -> CheckConstraint / UniqueConstraint\n#   schema changes after first deploy              -> Alembic, not create_all\n#\n# Anti-pattern: Base.metadata.create_all(engine) in app startup\n#   It's idempotent for adds but NEVER drops or migrates columns. The schema\n#   silently drifts from the code. Use Alembic from day one."
                  }
        ],
        tips: [
                  "`Mapped[int | None]` is a nullable column — `Mapped[int]` is NOT NULL",
                  "`relationship(back_populates=\"...\")` creates the bidirectional link between models",
                  "`relationship(lazy=\"selectin\")` avoids N+1 queries — loads related objects in one extra query",
                  "Always call `Base.metadata.create_all(engine)` to create tables before using the app"
        ],
        mistake: "Using `relationship(lazy=\"select\")` (the default) with nested loops. For every parent object, SQLAlchemy executes a separate query for children — N+1 problem. Use `lazy=\"selectin\"` or `eager` loading.",
        shorthand: {
          verbose: "from sqlalchemy import create_engine, String, ForeignKey\nfrom sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column,\nrelationship, sessionmaker)\nengine     = create_engine(\"postgresql://user:pass@host/db\")",
          concise: "Base.metadata.create_all(engine)",
        },
      },
      {
        id: "sqlalchemy-session-apis",
        fn: "SQLAlchemy session",
        desc: "Perform CRUD operations using a database session.",
        category: "FastAPI",
        subtitle: "Session manages transactions — always use as context manager",
        signature: "with Session(engine) as db: db.add(obj); db.commit()",
        descLong: "The Session is the unit of work — it tracks objects and flushes changes to the database on commit. Always use a context manager to guarantee cleanup. Refresh after commit to reload server-generated values like auto-increment IDs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of SQLAlchemy session — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom sqlalchemy.orm import Session\nwith Session(engine) as db:                           # auto-rollback on exception\n    emp = Employee(name=\"Alice\", email=\"alice@x.com\")\n    db.add(emp)\n    db.commit()                                       # row written\n    db.refresh(emp)                                   # reload server-generated id\n    print(emp.id)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of SQLAlchemy session — common patterns you'll see in production.\n# APPROACH  - Combine SQLAlchemy session with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom sqlalchemy import select\nfrom sqlalchemy.orm import Session\nwith Session(engine) as db:\n    # READ — primary key (cheap; uses identity map)\n    emp = db.get(Employee, 1)\n    # READ — single row by predicate\n    alice = db.scalars(\n        select(Employee).where(Employee.name == \"Alice\")\n    ).one_or_none()                                   # 0 or 1; .one() raises on miss\n    # READ — composed query: join + filter + order + limit\n    rows = db.scalars(\n        select(Employee)\n          .join(Department)\n          .where(Department.name == \"Engineering\",\n                 Employee.salary > 80_000)\n          .order_by(Employee.salary.desc())\n          .limit(10)\n    ).all()\n    # UPDATE — mutate the tracked instance, then commit\n    if alice:\n        alice.salary = 95_000\n        db.commit()\n    # DELETE\n    db.delete(alice)\n    db.commit()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of SQLAlchemy session — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom sqlalchemy import select, update, delete, func\nfrom sqlalchemy.orm import Session, selectinload, joinedload\nfrom sqlalchemy.exc import IntegrityError\n# 1) N+1 prevention — declare loader strategy at QUERY time, not just on the relationship\nwith Session(engine) as db:\n    # selectinload: separate IN(...) query per relationship — scales to many parents\n    depts = db.scalars(\n        select(Department).options(selectinload(Department.employees))\n    ).all()\n    for d in depts:\n        for e in d.employees:                         # no extra queries\n            ...\n    # joinedload: single SQL JOIN — best for one-to-one or single parent fetch\n    alice = db.scalar(\n        select(Employee).options(joinedload(Employee.dept))\n                        .where(Employee.id == 1)\n    )\n# 2) Bulk operations — orders of magnitude faster than per-row .save()\nwith Session(engine) as db:\n    # bulk INSERT\n    db.execute(Employee.__table__.insert(), [\n        {\"name\": \"Bob\", \"email\": \"b@x.com\"},\n        {\"name\": \"Carol\", \"email\": \"c@x.com\"},\n    ])\n    # bulk UPDATE\n    db.execute(update(Employee).where(Employee.salary < 50_000).values(salary=50_000))\n    # bulk DELETE\n    db.execute(delete(Employee).where(Employee.dept_id.is_(None)))\n    db.commit()\n# 3) SELECT FOR UPDATE — row-level lock for read-modify-write safety\nwith Session(engine) as db:\n    e = db.scalar(\n        select(Employee).where(Employee.id == 1).with_for_update()\n    )\n    e.salary += 1000                                  # other transactions wait\n    db.commit()\n# 4) Stable error contract — wrap commits, rollback ALWAYS, re-raise typed\ndef safe_commit(db: Session):\n    try:\n        db.commit()\n    except IntegrityError:\n        db.rollback()\n        raise                                         # let caller translate to 409 etc.\n# 5) Async session (SQLAlchemy 2.0 + async driver: postgres+asyncpg)\n# from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine\n# async with AsyncSession(async_engine) as db:\n#     emp = (await db.scalars(select(Employee))).all()\n# Decision rule:\n#   single PK lookup                          -> db.get(Model, pk)\n#   single row by predicate                    -> .one() / .one_or_none() / .scalar()\n#   list query                                  -> .scalars(...).all()\n#   parent + many children                     -> selectinload (one extra IN query)\n#   single parent + child                       -> joinedload (single JOIN)\n#   bulk INSERT/UPDATE/DELETE                  -> Core .execute(), not loops + .save()\n#   read-modify-write across processes         -> .with_for_update() inside a transaction\n#   FastAPI                                     -> session per request via Depends(get_db)\n#\n# Anti-pattern: keeping a Session open across requests\n#   Identity map fills with stale objects; later commits leak data from one\n#   request into another. Always: ONE session per unit of work, opened on the\n#   way in, closed (and rolled back) on the way out.\nclass Department: pass\nclass Employee:\n    __table__ = None\ndef engine(): pass"
                  }
        ],
        tips: [
                  "`db.refresh(obj)` after commit reloads server-generated fields — without it, `obj.id` may be None",
                  "`db.scalars(select(Model))` is the SQLAlchemy 2.0 query style — cleaner than legacy `db.query(Model)`",
                  "The `with Session(engine) as db:` context manager automatically rolls back on exception",
                  "`db.get(Model, pk)` is faster than a full query for primary key lookups",
                  "For read-modify-write across processes use `select(...).with_for_update()` inside a transaction — it acquires a row lock so concurrent updates do not lose writes",
                  "Bulk INSERT/UPDATE/DELETE: Core `.execute(insert(Model), [...])` is orders of magnitude faster than a loop of `db.add` + `commit`",
                  "In FastAPI, open ONE session per request via `Depends(get_db)` — keeping a session across requests pollutes the identity map and leaks data between callers"
        ],
        mistake: "Not calling `db.refresh(obj)` after `db.commit()`. The in-memory object's server-generated fields (id, timestamps) are stale until refreshed.",
        shorthand: {
          verbose: "from sqlalchemy.orm import Session\nfrom sqlalchemy import select\nwith Session(engine) as db:\n# Create:",
          concise: "db.commit()",
        },
      },
    ],
  },

  // ── Section 2: Async & Concurrency ─────────────────────────────────────────
  {
    id: "async",
    title: "Async & Concurrency",
    entries: [
      {
        id: "async-def",
        fn: "async def",
        desc: "Define an asynchronous coroutine function.",
        category: "Async",
        subtitle: "Calling async def returns a coroutine — it does not execute until awaited",
        signature: "async def fn() -> type: ...",
        descLong: "async def creates a coroutine function. Calling it returns a coroutine object — the body does not execute until the coroutine is awaited or scheduled. Use asyncio.run() to enter the event loop from synchronous code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of async def — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport asyncio\nasync def hello(name: str) -> str:\n    return f\"hello, {name}\"\nprint(asyncio.run(hello(\"Alice\")))            # asyncio.run starts the event loop\n# IMPORTANT: hello(\"Alice\") alone returns a COROUTINE — it doesn't run until awaited."
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of async def — common patterns you'll see in production.\n# APPROACH  - Combine async def with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport asyncio\nimport httpx\n# 1) Async function — uses await inside\nasync def fetch(url: str) -> dict:\n    async with httpx.AsyncClient(timeout=10) as client:        # async ctx manager\n        r = await client.get(url)\n        r.raise_for_status()\n        return r.json()\n# 2) Async generator — yields values across awaits\nasync def paginate(base: str):\n    page = 1\n    while True:\n        items = await fetch(f\"{base}?page={page}\")\n        if not items:\n            return                              # generator stops here\n        for item in items:\n            yield item                          # consumer can use 'async for'\n        page += 1\nasync def main():\n    async for it in paginate(\"https://api.example.com/items\"):\n        print(it[\"id\"])\nasyncio.run(main())                             # ONE call to run() at the top"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of async def — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport asyncio\nimport time\n# 1) FRAMEWORKS already run a loop. NEVER call asyncio.run() inside FastAPI / Jupyter.\n#    Inside a handler:  result = await my_coro()\n#    Top of a script:   asyncio.run(main())\n# 2) Bridge from SYNC into async — use asyncio.run() at the boundary\ndef sync_caller():\n    return asyncio.run(my_async_function())\n# 3) Bridge from ASYNC into a BLOCKING function — run_in_executor, never call directly\ndef blocking_io():\n    time.sleep(2)                                # blocks the entire event loop if awaited!\n    return 42\nasync def call_blocking():\n    loop = asyncio.get_running_loop()\n    # to_thread (3.9+) is the modern, no-executor-passing form\n    return await asyncio.to_thread(blocking_io)\n# 4) Bridge from ASYNC into a CPU-bound function — process pool, NOT thread pool\nimport concurrent.futures\nasync def heavy_cpu(x):\n    loop = asyncio.get_running_loop()\n    with concurrent.futures.ProcessPoolExecutor() as pool:\n        return await loop.run_in_executor(pool, _crunch, x)\ndef _crunch(x): return sum(i*i for i in range(x))\n# 5) Async iteration shapes\nasync def main():\n    # async for — async generator / async iterator\n    async for v in paginate(...):\n        process(v)\n    # async with — async context manager (DB session, HTTP client, lock)\n    # awaitable expressions in comprehensions:\n    results = [await fetch(u) for u in urls]    # SEQUENTIAL — usually wrong\n    # for concurrency, use asyncio.gather (next entry)\n# Decision rule:\n#   pure compute, no I/O                       -> NO async; run sync (or process pool)\n#   I/O-bound (HTTP, DB, file)                 -> async/await all the way down\n#   stuck calling a blocking lib in async       -> asyncio.to_thread(fn, *args)\n#   stuck in CPU-heavy work in async            -> ProcessPoolExecutor + run_in_executor\n#   running in Jupyter / FastAPI                 -> NEVER asyncio.run; just await\n#   testing async code                            -> pytest-asyncio (asyncio_mode='auto')\n#\n# Anti-pattern: making EVERYTHING async because \"async is faster\"\n#   Async is ONLY faster for I/O-bound, CONCURRENT work. Synchronous code is\n#   simpler, faster for pure compute, and easier to debug. Convert when you\n#   need concurrency, not because the keyword exists.\nasync def my_async_function(): return 1\nasync def paginate(*_): yield 1\ndef process(x): pass\nurls = []\nasync def fetch(_): return {}"
                  }
        ],
        tips: [
                  "`async def` creates a coroutine function — calling it returns a coroutine object, not the result",
                  "Use `asyncio.run()` once at the top level to enter the event loop from sync code",
                  "Never call `asyncio.run()` inside an already-running event loop — use `await` directly instead",
                  "async/await only helps I/O-bound work — CPU-bound tasks still block the event loop",
                  "Stuck calling a blocking lib in an async function? Wrap with `await asyncio.to_thread(fn, *args)` (or `loop.run_in_executor`) so the event loop keeps moving",
                  "CPU-heavy work in async: `loop.run_in_executor(ProcessPoolExecutor(), fn, ...)` — threads are GIL-locked"
        ],
        mistake: "Calling `asyncio.run()` inside an already-running event loop (Jupyter, FastAPI). Use `await coroutine` directly in those contexts, or `asyncio.create_task()` to schedule it.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "await",
        fn: "await",
        desc: "Suspend a coroutine until an awaitable completes.",
        category: "Async",
        subtitle: "Yields control to the event loop — resumes when the result is ready",
        signature: "result = await coroutine | await asyncio.sleep(1)",
        descLong: "await suspends the current coroutine and yields control to the event loop until the awaitable completes. It can only be used inside an async def function. Awaitables include coroutines, Tasks, and Futures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of await — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport asyncio\nasync def main():\n    print(\"start\")\n    await asyncio.sleep(1)                 # yields to the event loop for 1s\n    print(\"done\")\nasyncio.run(main())"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of await — common patterns you'll see in production.\n# APPROACH  - Combine await with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport asyncio\nimport time\nasync def fetch(url, ms=500):\n    await asyncio.sleep(ms / 1000)\n    return f\"body of {url}\"\nasync def sequential():\n    t0 = time.perf_counter()\n    a = await fetch(\"a\")                       # waits 500 ms\n    b = await fetch(\"b\")                       # waits ANOTHER 500 ms (total 1.0 s)\n    print(\"sequential:\", time.perf_counter() - t0, \"s\")\nasync def concurrent():\n    t0 = time.perf_counter()\n    # create_task starts running immediately — both inflight at the same time\n    ta = asyncio.create_task(fetch(\"a\"))\n    tb = asyncio.create_task(fetch(\"b\"))\n    a = await ta\n    b = await tb                               # total ~0.5 s (both ran concurrently)\n    print(\"concurrent:\", time.perf_counter() - t0, \"s\")\nasyncio.run(sequential())\nasyncio.run(concurrent())\n# Mental model:\n#   await PAUSES the current coroutine — but only this one resumes when ready.\n#   Concurrency comes from MULTIPLE in-flight tasks, not from the await keyword."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of await — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport asyncio\n# 1) timeout — cancel the operation if it takes too long (3.11+ syntax)\nasync def fetch_with_timeout():\n    try:\n        async with asyncio.timeout(2.0):           # 2-second budget for everything inside\n            return await long_operation()\n    except TimeoutError:\n        return None\n# 2) Cancellation propagation — Tasks get CancelledError; clean up in finally\nasync def worker(q):\n    try:\n        while True:\n            item = await q.get()\n            await process(item)\n    except asyncio.CancelledError:\n        # cleanup BEFORE the task ends; re-raise to confirm cancellation\n        await close_resource()\n        raise\n# 3) Shield — protect a critical section from outer cancellation\nasync def critical(work):\n    try:\n        return await asyncio.shield(work)          # outer cancel won't cancel work\n    except asyncio.CancelledError:\n        # we were cancelled but 'work' may still complete in the background\n        raise\n# 4) Structured concurrency with TaskGroup (3.11+): if ANY child fails,\n#    siblings are cancelled and ALL exceptions surface as ExceptionGroup.\nasync def parallel_fetch(urls):\n    async with asyncio.TaskGroup() as tg:\n        tasks = [tg.create_task(fetch(u)) for u in urls]\n    return [t.result() for t in tasks]              # safe: TaskGroup ensures all are done\n# 5) wait_for is the older single-coro version of timeout\nasync def fetch_one(url):\n    try:\n        return await asyncio.wait_for(fetch(url), timeout=2.0)\n    except TimeoutError:\n        return None\n# Decision rule:\n#   one await with a deadline                -> asyncio.timeout(seconds): ...\n#   N concurrent awaits, fail-fast             -> async with TaskGroup() (3.11+)\n#   N concurrent awaits, tolerate failures     -> asyncio.gather(..., return_exceptions=True)\n#   long-lived background worker                -> create_task; handle CancelledError\n#   \"I don't want this cancelled if my caller is\" -> asyncio.shield(coro)\n#   wait for FIRST result of N options          -> asyncio.wait(..., return_when=FIRST_COMPLETED)\n#\n# Anti-pattern: try/except Exception that swallows CancelledError\n#   Once CancelledError is suppressed, your task ignores cancellation and the\n#   shutdown hangs. Either re-raise it explicitly or catch it as its own clause:\n#       except asyncio.CancelledError: cleanup(); raise\nasync def long_operation(): return 1\nasync def fetch(_): await asyncio.sleep(0); return {}\nasync def process(_): pass\nasync def close_resource(): pass"
                  }
        ],
        tips: [
                  "`await` can only be used inside `async def` — using it in a regular function is a SyntaxError",
                  "Two sequential `await` calls run one after the other — use `asyncio.gather()` for concurrency",
                  "`asyncio.create_task()` schedules a coroutine to run concurrently without awaiting immediately",
                  "`await asyncio.sleep(0)` yields control to the event loop without sleeping — useful in tight loops",
                  "On Python 3.11+ prefer `async with asyncio.TaskGroup()` for fail-fast structured concurrency; pair with `async with asyncio.timeout(...)` to bound the whole batch",
                  "When you must NOT propagate the caller's cancellation, wrap the inner coro in `asyncio.shield()`; never `except Exception` swallow `CancelledError` — re-raise after cleanup"
        ],
        mistake: "Writing two sequential awaits expecting concurrency: `r1 = await fn1(); r2 = await fn2()`. This is sequential. Use `r1, r2 = await asyncio.gather(fn1(), fn2())`.",
        shorthand: {
          verbose: "import asyncio\nasync def main():\n# await a coroutine:\nresult = await fetch(\"https://api.example.com\")",
          concise: ")",
        },
      },
      {
        id: "asyncio-gather",
        fn: "asyncio.gather()",
        desc: "Run multiple coroutines concurrently and collect all results.",
        category: "Async",
        subtitle: "Concurrent I/O — all coroutines run simultaneously",
        signature: "results = await asyncio.gather(*coroutines, return_exceptions=False)",
        descLong: "asyncio.gather() runs all given coroutines concurrently and returns their results in order. return_exceptions=True prevents one failure from cancelling everything — exceptions are returned as values instead of being raised.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of asyncio.gather() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport asyncio\nasync def task(name, ms):\n    await asyncio.sleep(ms / 1000)\n    return name\nasync def main():\n    return await asyncio.gather(task(\"a\", 100), task(\"b\", 200), task(\"c\", 50))\nprint(asyncio.run(main()))                          # ['a', 'b', 'c'] — order preserved"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of asyncio.gather() — common patterns you'll see in production.\n# APPROACH  - Combine asyncio.gather() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport asyncio\nimport httpx\nasync def fetch(client, url):\n    r = await client.get(url, timeout=10)\n    r.raise_for_status()\n    return r.json()\n# 1) return_exceptions=True — keep what worked, mark what didn't\nasync def fetch_all(urls):\n    async with httpx.AsyncClient() as client:\n        results = await asyncio.gather(\n            *(fetch(client, u) for u in urls),\n            return_exceptions=True,                  # NO single failure aborts the rest\n        )\n    return [r if not isinstance(r, Exception) else None for r in results]\n# 2) Semaphore — bound concurrency so you don't get rate-limited\nasync def fetch_with_limit(urls, *, concurrency: int = 10):\n    sem = asyncio.Semaphore(concurrency)\n    async with httpx.AsyncClient() as client:\n        async def bounded(u):\n            async with sem:\n                return await fetch(client, u)\n        return await asyncio.gather(*(bounded(u) for u in urls))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of asyncio.gather() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport asyncio\n# 1) TaskGroup (3.11+) — STRUCTURED CONCURRENCY\n#    - if ONE task fails, siblings are cancelled\n#    - all exceptions surface together as ExceptionGroup\n#    - context exits only when every task is done\nasync def parallel_fetch(urls):\n    async with asyncio.TaskGroup() as tg:\n        tasks = [tg.create_task(fetch(u)) for u in urls]\n    return [t.result() for t in tasks]\n# Catch the group of errors with the new except* syntax\nasync def safe_parallel(urls):\n    try:\n        return await parallel_fetch(urls)\n    except* httpx.HTTPError as eg:\n        for e in eg.exceptions: log_error(e)\n        return []\n# 2) as_completed — handle results as they arrive (start downstream work earlier)\nasync def stream_first_n(urls, n):\n    out = []\n    coros = [fetch(u) for u in urls]\n    for done in asyncio.as_completed(coros):\n        out.append(await done)\n        if len(out) >= n:\n            break                                    # remaining tasks keep running\n    return out\n# 3) asyncio.wait — finer-grained: FIRST_COMPLETED, ALL_COMPLETED, FIRST_EXCEPTION\nasync def race(urls):\n    tasks = {asyncio.create_task(fetch(u)): u for u in urls}\n    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)\n    for t in pending:\n        t.cancel()                                   # cancel the losers\n    return done.pop().result()\n# 4) Combine semaphore with TaskGroup — bounded concurrency AND structured cleanup\nasync def fetch_bounded(urls, concurrency=10):\n    sem = asyncio.Semaphore(concurrency)\n    async def one(u):\n        async with sem:\n            return await fetch(u)\n    async with asyncio.TaskGroup() as tg:\n        tasks = [tg.create_task(one(u)) for u in urls]\n    return [t.result() for t in tasks]\n# Decision rule:\n#   N coros, all-or-nothing semantics       -> TaskGroup (3.11+); except* on errors\n#   N coros, partial failure tolerated       -> asyncio.gather(..., return_exceptions=True)\n#   need to react as results arrive          -> asyncio.as_completed\n#   \"first one wins, cancel the rest\"        -> asyncio.wait(return_when=FIRST_COMPLETED)\n#   bounded concurrency                       -> asyncio.Semaphore wrapping each call\n#   timeout the whole batch                   -> async with asyncio.timeout(...): TaskGroup\n#\n# Anti-pattern: gather(coros) instead of gather(*coros)\n#   gather expects POSITIONAL args. Passing one list silently runs nothing —\n#   the coros are never awaited and you get RuntimeWarnings. Always *unpack.\nimport httpx\nasync def fetch(_): return {}\ndef log_error(_): pass"
                  }
        ],
        tips: [
                  "`return_exceptions=True` makes gather never raise — exceptions come back as return values",
                  "`asyncio.Semaphore(n)` rate-limits concurrent requests — prevents overwhelming an API",
                  "`TaskGroup` (3.11+) cancels all sibling tasks on first failure — structured concurrency",
                  "Create all tasks first as a list, then pass to gather — do not `await` each one sequentially"
        ],
        mistake: "Passing a list to `asyncio.gather` without unpacking: `await asyncio.gather([coro1, coro2])` treats the list as a single arg and raises `TypeError`. Either unpack with `*` (`asyncio.gather(*coros)`) or pass coroutines positionally (`asyncio.gather(coro1, coro2)`).",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "asyncio-queue",
        fn: "asyncio.Queue()",
        desc: "Thread-safe async FIFO queue for producer/consumer patterns.",
        category: "Async",
        subtitle: "Decouple producers from consumers in async workflows",
        signature: "q = asyncio.Queue(); await q.put(item); item = await q.get()",
        descLong: "asyncio.Queue provides an async-native FIFO queue for coordinating producers and consumers. put() adds items; get() waits for an item. task_done() signals a task is complete; join() waits for all items to be processed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of asyncio.Queue() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport asyncio\nasync def main():\n    q = asyncio.Queue()\n    await q.put(\"a\")\n    await q.put(\"b\")\n    print(await q.get())                    # \"a\"\n    print(await q.get())                    # \"b\"\nasyncio.run(main())"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of asyncio.Queue() — common patterns you'll see in production.\n# APPROACH  - Combine asyncio.Queue() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport asyncio\nN_CONSUMERS = 3\nSENTINEL    = None                          # signals \"no more work\"\nasync def producer(q: asyncio.Queue, items):\n    for item in items:\n        await q.put(item)                   # blocks if queue is full -> backpressure\n    for _ in range(N_CONSUMERS):\n        await q.put(SENTINEL)               # one sentinel per consumer\nasync def consumer(name, q: asyncio.Queue):\n    while True:\n        item = await q.get()\n        if item is SENTINEL:\n            q.task_done()\n            return\n        try:\n            await process(item)\n            print(f\"{name} processed {item}\")\n        finally:\n            q.task_done()                   # MUST call once per get(); pairs with q.join()\nasync def main():\n    q = asyncio.Queue(maxsize=10)           # cap memory; producer pauses if full\n    consumers = [asyncio.create_task(consumer(f\"w{i}\", q)) for i in range(N_CONSUMERS)]\n    await producer(q, range(20))\n    await q.join()                           # wait until ALL items processed\n    await asyncio.gather(*consumers)         # consumers exited on sentinel\nasync def process(_): await asyncio.sleep(0.05)\nasyncio.run(main())"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of asyncio.Queue() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport asyncio\n# 1) NO sentinel — use q.join() to wait until done, then cancel consumers cleanly\nasync def main():\n    q = asyncio.Queue(maxsize=100)\n    workers = [asyncio.create_task(consumer(q, i)) for i in range(8)]\n    for item in range(1000):\n        await q.put(item)\n    await q.join()                              # block until every task_done() called\n    for w in workers:\n        w.cancel()                              # tell workers to stop waiting on get()\n    await asyncio.gather(*workers, return_exceptions=True)\nasync def consumer(q: asyncio.Queue, wid: int):\n    try:\n        while True:\n            item = await q.get()\n            try:\n                await process(item)\n            except Exception as e:\n                log_error(wid, item, e)         # don't propagate; one bad item ≠ crash\n            finally:\n                q.task_done()                   # always — even on failure\n    except asyncio.CancelledError:\n        return                                  # clean exit when main cancels us\n# 2) PriorityQueue — for SLA / urgency-driven pipelines\nasync def priority_demo():\n    pq: asyncio.PriorityQueue = asyncio.PriorityQueue()\n    await pq.put((10, \"low\"))                   # (priority, value) — lower = sooner\n    await pq.put((1,  \"urgent\"))\n    while not pq.empty():\n        prio, item = await pq.get()\n        print(prio, item)                       # 1 'urgent', then 10 'low'\n# 3) Async pipeline — multiple queues form stages (each worker pool independent)\nasync def stage(q_in: asyncio.Queue, q_out: asyncio.Queue, fn):\n    while True:\n        item = await q_in.get()\n        try:\n            await q_out.put(await fn(item))\n        finally:\n            q_in.get_nowait                     # placeholder so flake doesn't whine\n            q_in.task_done()\n# 4) maxsize is your THROUGHPUT KNOB\n#    - too low: producer waits, throughput tied to slowest consumer\n#    - too high: memory / latency balloon, items sit in flight too long\n#    Start small (e.g. 2 * num_consumers) and tune by p50 / p99 latency.\n# Decision rule:\n#   single producer / consumer                -> Queue() with sentinel\n#   N consumers, finite work                   -> Queue(maxsize) + q.join() + cancel\n#   urgency-ordered work                        -> PriorityQueue\n#   strict order matters                         -> single consumer, OR sequence-numbered items\n#   multi-stage pipeline                         -> chain queues; each stage = own pool\n#   cross-process / multi-host                   -> NOT asyncio; use Redis Streams / Kafka / SQS\n#\n# Anti-pattern: forgetting q.task_done() in the failure path\n#   q.join() never returns; the program hangs at shutdown waiting for unmatched\n#   put()s. Use try/finally so task_done() runs even when process() raises.\nasync def process(_): await asyncio.sleep(0.01)\ndef log_error(*_): pass\nasyncio.run(main())"
                  }
        ],
        tips: [
                  "`maxsize=n` creates backpressure — producer will wait if the queue is full",
                  "`task_done()` after each `get()` is needed to make `q.join()` work correctly",
                  "Use `None` or a sentinel object to signal consumers to stop",
                  "For CPU-bound work, use `multiprocessing.Queue` — asyncio.Queue is single-threaded"
        ],
        mistake: "Forgetting `task_done()` when using `q.join()`. Without it, `join()` never returns — it waits for all `task_done()` calls to match the number of `put()` calls.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "thread-pool",
        fn: "ThreadPoolExecutor",
        desc: "Run I/O-bound blocking functions concurrently in a thread pool.",
        category: "Async",
        subtitle: "Parallel I/O — use for blocking libraries (requests, psycopg2)",
        signature: "with ThreadPoolExecutor(max_workers=10) as ex: futures = ex.map(fn, items)",
        descLong: "ThreadPoolExecutor runs functions in worker threads — useful for I/O-bound blocking code (file I/O, `requests`, database calls). Threads share memory but are limited by the GIL for CPU-bound work.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ThreadPoolExecutor — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom concurrent.futures import ThreadPoolExecutor\nimport requests\ndef fetch(url: str) -> int:\n    return requests.get(url, timeout=10).status_code\nwith ThreadPoolExecutor(max_workers=10) as ex:\n    codes = list(ex.map(fetch, urls))      # results in input order"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ThreadPoolExecutor — common patterns you'll see in production.\n# APPROACH  - Combine ThreadPoolExecutor with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom concurrent.futures import ThreadPoolExecutor, as_completed\nimport requests\ndef fetch(url: str) -> dict:\n    r = requests.get(url, timeout=10)\n    r.raise_for_status()\n    return r.json()\nresults = {}\nwith ThreadPoolExecutor(max_workers=10) as ex:\n    futures = {ex.submit(fetch, u): u for u in urls}\n    for fut in as_completed(futures):              # yields fastest first\n        url = futures[fut]\n        try:\n            results[url] = fut.result()\n        except Exception as e:\n            results[url] = None\n            print(f\"{url}: {e}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ThreadPoolExecutor — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport asyncio\nfrom concurrent.futures import ThreadPoolExecutor\n# 1) THREADS RELEASE THE GIL during I/O — they help requests, file I/O, sockets.\n#    They DO NOT help CPU-bound code (numpy / sklearn release the GIL too —\n#    those ARE OK in threads).\n#    Pure Python loops over numbers? Use ProcessPoolExecutor.\n# 2) Bridge from ASYNC -> blocking: asyncio.to_thread (3.9+)\ndef slow_blocking_call(x):                          # e.g. legacy psycopg2 query\n    import time; time.sleep(0.5); return x * 2\nasync def use_blocking_in_async():\n    return await asyncio.to_thread(slow_blocking_call, 21)\n# 3) Custom executor (e.g. larger pool dedicated to I/O)\nio_pool = ThreadPoolExecutor(max_workers=64, thread_name_prefix=\"io\")\nasync def fetch_in_pool(url):\n    loop = asyncio.get_running_loop()\n    return await loop.run_in_executor(io_pool, fetch, url)\n# 4) Sizing rules of thumb\n#    I/O-bound, light work       -> 10-50 threads (start at 2 * cpu_count, raise on need)\n#    DB pool                      -> match thread pool size to DB max_connections\n#    HTTP client (requests)       -> threads ~= permitted concurrent calls per host\n#    CPU-bound                    -> ProcessPoolExecutor(max_workers=os.cpu_count())\n# 5) Cancellation truth — submitted futures CAN'T be killed mid-execution.\n#    fut.cancel() only works BEFORE the thread picks up the work.\n#    Implement cancellation cooperatively: have the worker check a flag.\nimport threading\nstop = threading.Event()\ndef worker():\n    while not stop.is_set():\n        do_chunk()\n# Decision rule:\n#   blocking I/O (requests, psycopg2)      -> ThreadPoolExecutor\n#   numpy / pandas / sklearn (releases GIL) -> ThreadPoolExecutor is fine\n#   pure-Python CPU work                    -> ProcessPoolExecutor\n#   ASYNC code path needs blocking call     -> asyncio.to_thread / run_in_executor\n#   tens of thousands of small tasks         -> async I/O (httpx) instead of threads\n#   tasks that may never finish              -> cooperative stop flag, NOT future.cancel()\n#\n# Anti-pattern: ThreadPoolExecutor for CPU-bound pure-Python work\n#   The GIL serializes execution; you'll see ~1 core utilized regardless of\n#   max_workers. Switch to ProcessPoolExecutor (or rewrite the hot loop in\n#   numpy/cython/numba which release the GIL).\ndef fetch(url): import requests; return requests.get(url, timeout=10).json()\ndef do_chunk(): pass\nurls = []"
                  }
        ],
        tips: [
                  "`as_completed()` yields futures as they finish — best UX for large batches",
                  "`loop.run_in_executor(None, fn, *args)` runs blocking code in a thread from async context",
                  "The GIL prevents true parallelism in threads for CPU-bound code — use ProcessPoolExecutor instead",
                  "`max_workers` for I/O-bound: 10-50; for CPU-bound with processes: `os.cpu_count()`"
        ],
        mistake: "Using ThreadPoolExecutor for CPU-bound work like number crunching. The GIL means threads do not run in parallel for CPU work. Use ProcessPoolExecutor instead.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "process-pool",
        fn: "ProcessPoolExecutor",
        desc: "Run CPU-bound functions in parallel across multiple processes.",
        category: "Async",
        subtitle: "True parallelism for CPU-bound work — bypasses the GIL",
        signature: "with ProcessPoolExecutor(max_workers=4) as ex: results = ex.map(fn, items)",
        descLong: "ProcessPoolExecutor runs functions in separate processes — each has its own Python interpreter and memory. This bypasses the GIL, enabling true parallelism for CPU-bound work. Objects must be picklable to be passed between processes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of ProcessPoolExecutor — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport os\nfrom concurrent.futures import ProcessPoolExecutor\ndef square(n: int) -> int:                  # MUST be a top-level (picklable) function\n    return n * n\nwith ProcessPoolExecutor(max_workers=os.cpu_count()) as ex:\n    out = list(ex.map(square, range(20)))\nprint(out)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of ProcessPoolExecutor — common patterns you'll see in production.\n# APPROACH  - Combine ProcessPoolExecutor with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport os\nfrom concurrent.futures import ProcessPoolExecutor, as_completed\ndef heavy(n: int) -> int:                   # top-level function — REQUIRED for pickling\n    return sum(i * i for i in range(n))\n# 1) Chunked map — for many small tasks, chunksize amortizes IPC overhead\nwith ProcessPoolExecutor() as ex:\n    out = list(ex.map(heavy, [50_000] * 1000, chunksize=50))\n# 2) submit + as_completed for streaming results\nwith ProcessPoolExecutor(max_workers=os.cpu_count()) as ex:\n    futures = {ex.submit(heavy, n): n for n in (10**5, 10**6, 10**7)}\n    for fut in as_completed(futures):\n        n = futures[fut]\n        try:\n            print(n, \"->\", fut.result())\n        except Exception as e:\n            print(n, \"failed:\", e)\n# Picklability rules (the #1 source of ProcessPoolExecutor errors):\n# - lambdas: NOT picklable\n# - closures over local state: NOT picklable\n# - methods on local classes: NOT picklable\n# - top-level functions, primitives, dataclasses: PICKLABLE"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of ProcessPoolExecutor — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport os\nfrom concurrent.futures import ProcessPoolExecutor\nfrom multiprocessing import shared_memory\nimport numpy as np\n# 1) initializer — load big read-only state ONCE per worker (model, lookup table)\n_model = None\ndef _init_worker(model_path: str):\n    global _model\n    _model = load_model(model_path)             # heavy; pays back across N tasks\ndef _predict(x):\n    return _model.predict(x)\nwith ProcessPoolExecutor(\n    max_workers=os.cpu_count(),\n    initializer=_init_worker,\n    initargs=(\"models/v1.pkl\",),\n) as ex:\n    preds = list(ex.map(_predict, batches))\n# 2) Shared memory — avoid serializing huge numpy arrays per task\ndef _make_shm(arr: np.ndarray):\n    shm = shared_memory.SharedMemory(create=True, size=arr.nbytes)\n    np.ndarray(arr.shape, dtype=arr.dtype, buffer=shm.buf)[:] = arr\n    return shm\ndef _job(shm_name, shape, dtype, slice_):\n    shm = shared_memory.SharedMemory(name=shm_name)\n    a = np.ndarray(shape, dtype=dtype, buffer=shm.buf)\n    return a[slice_].sum()\n# 3) When to use processes vs alternatives\n#    - pure Python CPU work, multi-core           -> ProcessPoolExecutor\n#    - numpy / scikit-learn / numba (release GIL) -> threads are often FINE and faster\n#    - I/O-bound work                              -> async I/O or threads, NOT processes\n#    - distributed across machines                  -> Dask / Ray, not local processes\n# 4) Startup cost is REAL — don't use processes for thousands of <1 ms tasks.\n#    Batch into chunks of 100-1000 work items per task to amortize.\n# Decision rule:\n#   pure-Python, CPU-bound, > 100 ms per task   -> ProcessPoolExecutor\n#   numpy-heavy work                              -> ThreadPoolExecutor (numpy releases GIL)\n#   I/O-bound                                     -> async / threads, NOT processes\n#   need shared state                              -> initializer + module globals; shared_memory for arrays\n#   work scattered across many machines             -> Dask / Ray, not local processes\n#   tasks < 1 ms                                    -> sequential beats both, or batch them\n#\n# Anti-pattern: pickling lambdas / locally-defined functions\n#   \"AttributeError: Can't pickle local object\" — the worker tries to import\n#   the function by name and fails. Define them at module level (or use cloudpickle\n#   via dask/joblib if you can't refactor).\ndef load_model(_): return None\nbatches = []"
                  }
        ],
        tips: [
                  "Arguments and return values must be picklable — lambdas and closures often are not",
                  "`max_workers=os.cpu_count()` uses all available cores — typically optimal for CPU-bound work",
                  "Process startup has overhead — only worth it for tasks that take > ~100ms each",
                  "`multiprocessing.Pool` and `ProcessPoolExecutor` are equivalent — `ProcessPoolExecutor` is the modern API"
        ],
        mistake: "Passing lambda functions to ProcessPoolExecutor. Lambdas are not picklable. Define named functions at module level instead.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
    ],
  },

  // ── Section 3: HTTP & Standard Library ─────────────────────────────────────────
  {
    id: "http-stdlib",
    title: "HTTP & Standard Library",
    entries: [
      {
        id: "logging-apis",
        fn: "logging",
        desc: "Production-grade application logging with levels and handlers.",
        category: "Standard Library",
        subtitle: "Never use print() in production — use logging.getLogger(__name__)",
        signature: "log = logging.getLogger(__name__) | log.info(\"msg %s\", val)",
        descLong: "The logging module provides leveled, configurable logging. Always get a named logger per module with `getLogger(__name__)`. Configure at the entry point, not in library code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of logging — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport logging\nlogging.basicConfig(level=logging.INFO,\n                    format=\"%(asctime)s %(levelname)-7s %(name)s  %(message)s\")\nlog = logging.getLogger(__name__)               # one logger per module\nlog.info(\"user logged in: %s\", user_id)         # lazy %s, not f-string\nlog.warning(\"rate limit approaching: %d/min\", 90)\nlog.exception(\"query failed\")                   # use INSIDE except — adds traceback"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of logging — common patterns you'll see in production.\n# APPROACH  - Combine logging with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# logging.yml-equivalent in code (use logging.config.dictConfig in app.py)\nimport logging.config\nLOGGING = {\n    \"version\": 1,\n    \"disable_existing_loggers\": False,\n    \"formatters\": {\n        \"default\": {\n            \"format\": \"%(asctime)s %(levelname)-7s %(name)s  %(message)s\",\n        },\n    },\n    \"handlers\": {\n        \"console\": {\"class\": \"logging.StreamHandler\", \"formatter\": \"default\"},\n        \"file\":    {\"class\": \"logging.handlers.RotatingFileHandler\",\n                    \"filename\": \"app.log\", \"maxBytes\": 10_000_000, \"backupCount\": 5,\n                    \"formatter\": \"default\"},\n    },\n    \"loggers\": {\n        \"myapp\":     {\"level\": \"INFO\",    \"handlers\": [\"console\", \"file\"]},\n        \"uvicorn\":   {\"level\": \"INFO\"},\n        \"sqlalchemy.engine\": {\"level\": \"WARNING\"},     # mute noisy libs\n    },\n    \"root\": {\"level\": \"WARNING\", \"handlers\": [\"console\"]},\n}\nlogging.config.dictConfig(LOGGING)\n# Library code — only get a logger; NEVER call basicConfig\nlog = logging.getLogger(\"myapp.users\")\n# Add per-call context with the extra= keyword\nlog.info(\"created user\", extra={\"user_id\": 42, \"email\": \"a@x.com\"})"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of logging — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport json\nimport logging\nimport logging.config\nimport contextvars\n# 1) Per-request correlation — set ONCE in middleware, every log line carries it\nrequest_id_var = contextvars.ContextVar(\"request_id\", default=\"-\")\nclass RequestIdFilter(logging.Filter):\n    def filter(self, record):\n        record.request_id = request_id_var.get()\n        return True\n# 2) Structured JSON formatter — one line of JSON per log event\nclass JsonFormatter(logging.Formatter):\n    def format(self, record):\n        payload = {\n            \"ts\":      self.formatTime(record, \"%Y-%m-%dT%H:%M:%S%z\"),\n            \"level\":   record.levelname,\n            \"logger\":  record.name,\n            \"msg\":     record.getMessage(),\n            \"rid\":     getattr(record, \"request_id\", \"-\"),\n        }\n        # Pick up extras passed via log.info(\"...\", extra={\"k\": v})\n        for k, v in record.__dict__.items():\n            if k not in payload and k not in (\n                \"args\",\"msg\",\"levelname\",\"levelno\",\"pathname\",\"filename\",\n                \"module\",\"exc_info\",\"exc_text\",\"stack_info\",\"lineno\",\"funcName\",\n                \"created\",\"msecs\",\"relativeCreated\",\"thread\",\"threadName\",\n                \"processName\",\"process\",\"name\",\"request_id\"):\n                payload[k] = v\n        if record.exc_info:\n            payload[\"exc\"] = self.formatException(record.exc_info)\n        return json.dumps(payload, default=str)\nlogging.config.dictConfig({\n    \"version\": 1, \"disable_existing_loggers\": False,\n    \"filters\":  {\"rid\":  {\"()\": RequestIdFilter}},\n    \"formatters\":{\"json\":{\"()\": JsonFormatter}},\n    \"handlers\": {\"stdout\":{\"class\":\"logging.StreamHandler\",\n                            \"filters\":[\"rid\"], \"formatter\":\"json\"}},\n    \"root\":     {\"level\":\"INFO\", \"handlers\":[\"stdout\"]},\n})\nlog = logging.getLogger(\"myapp\")\n# 3) Use it from a FastAPI middleware\n# @app.middleware(\"http\")\n# async def assign_request_id(request, call_next):\n#     token = request_id_var.set(request.headers.get(\"x-request-id\") or new_id())\n#     try:    return await call_next(request)\n#     finally: request_id_var.reset(token)\n# 4) Exception logging contract — log.exception() ONLY inside except blocks\ndef transfer(amount):\n    try:\n        do_transfer(amount)\n    except Exception:\n        log.exception(\"transfer failed\", extra={\"amount\": amount})\n        raise                                          # re-raise so caller decides\n# Decision rule:\n#   library code                              -> getLogger(__name__); NO basicConfig\n#   app entry point                            -> dictConfig once at startup\n#   structured logging / search by field        -> JSON formatter + extra={...}\n#   correlate logs to one request               -> ContextVar + Filter\n#   exception path                              -> log.exception() inside except\n#   need to mute a noisy library                 -> per-logger level, e.g. sqlalchemy.engine WARNING\n#\n# Anti-pattern: logging.basicConfig() inside library code\n#   First import wins; every other config is silently ignored. Libraries should\n#   only acquire loggers; the application owns configuration.\nuser_id = None\ndef do_transfer(_): pass\ndef new_id(): import uuid; return uuid.uuid4().hex"
                  }
        ],
        tips: [
                  "Use `log.info(\"val: %s\", value)` — lazy formatting, string only built if level is active",
                  "`log.exception(\"msg\")` inside an except block automatically includes the full traceback",
                  "Libraries should only add a NullHandler — never call basicConfig()",
                  "Never call `logging.getLogger()` (root logger) in libraries — use `getLogger(__name__)`"
        ],
        mistake: "Using `print()` for logging in production. No levels, no timestamps, no file routing, no way to silence it. Use `logging.getLogger(__name__)` instead.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "os-environ",
        fn: "os.environ",
        desc: "Read configuration and secrets from environment variables.",
        category: "Standard Library",
        subtitle: "os.getenv() for optional, os.environ[] for required",
        signature: "os.getenv(\"KEY\", \"default\") | os.environ[\"KEY\"]",
        descLong: "Environment variables are the standard place for configuration and secrets in production (12-factor app pattern). os.environ[\"KEY\"] raises KeyError if missing (use for required vars). os.getenv(\"KEY\", default) returns the default if absent.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of os.environ — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport os\nport    = int(os.getenv(\"PORT\", \"8000\"))      # optional, default 8000\ndb_url  = os.environ[\"DATABASE_URL\"]          # required — KeyError if missing"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of os.environ — common patterns you'll see in production.\n# APPROACH  - Combine os.environ with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport os\nfrom dotenv import load_dotenv\n# Local dev only — load .env from cwd (do NOT call in production)\nload_dotenv()                                  # safe no-op if no .env exists\ndef env_required(key: str) -> str:\n    v = os.environ.get(key)\n    if not v:\n        raise RuntimeError(f\"required env var missing: {key}\")\n    return v\ndef env_bool(key: str, default: bool = False) -> bool:\n    raw = os.getenv(key)\n    if raw is None: return default\n    return raw.strip().lower() in {\"1\", \"true\", \"yes\", \"on\"}\nDATABASE_URL = env_required(\"DATABASE_URL\")\nDEBUG        = env_bool(\"DEBUG\", default=False)\nPORT         = int(os.getenv(\"PORT\", \"8000\"))\nORIGINS      = [o.strip() for o in os.getenv(\"CORS_ORIGINS\", \"\").split(\",\") if o.strip()]\n# Test override — set BEFORE importing the module under test\n# os.environ[\"DATABASE_URL\"] = \"sqlite:///:memory:\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of os.environ — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport os\nfrom functools import lru_cache\nfrom typing import Iterable\n# 1) ONE config module — code never reads os.environ directly. Fakes are trivial.\nclass _Config:\n    DATABASE_URL: str\n    SECRET_KEY:   str\n    DEBUG:        bool\n    PORT:         int\n    ENVIRONMENT:  str\ndef _require(key: str, *, allowed: Iterable[str] | None = None) -> str:\n    v = os.environ.get(key)\n    if not v:\n        raise RuntimeError(f\"missing required env var: {key}\")\n    if allowed and v not in allowed:\n        raise RuntimeError(f\"{key} must be one of {sorted(allowed)}; got {v!r}\")\n    return v\n@lru_cache\ndef get_config() -> _Config:\n    cfg = _Config()\n    cfg.DATABASE_URL = _require(\"DATABASE_URL\")\n    cfg.SECRET_KEY   = _require(\"SECRET_KEY\")\n    cfg.ENVIRONMENT  = _require(\"ENVIRONMENT\", allowed={\"dev\", \"staging\", \"prod\"})\n    cfg.DEBUG        = os.getenv(\"DEBUG\", \"false\").lower() in {\"1\", \"true\"}\n    cfg.PORT         = int(os.getenv(\"PORT\", \"8000\"))\n    return cfg\n# 2) NEVER print the whole environment — secrets end up in logs/incidents\nSECRET_PREFIXES = (\"DATABASE_\", \"SECRET_\", \"AWS_\", \"STRIPE_\", \"TOKEN\")\ndef safe_env_dump() -> dict[str, str]:\n    return {\n        k: (\"***\" if any(k.startswith(p) for p in SECRET_PREFIXES) else v)\n        for k, v in os.environ.items()\n    }\n# 3) Prefer pydantic-settings for typed config — see the pydantic-settings entry.\n#    Reach for raw os.environ only when you can't add the dependency.\n# Decision rule:\n#   single optional var, simple type        -> os.getenv(\"X\", \"default\")\n#   required var that should fail-loud       -> os.environ[\"X\"] or _require(\"X\")\n#   typed config object, many fields          -> pydantic-settings BaseSettings\n#   need .env in dev only                       -> python-dotenv, called BEHIND a guard\n#   container / serverless                      -> ignore .env; rely on platform env vars\n#   secrets                                      -> SecretStr (pydantic) or KMS / Vault\n#\n# Anti-pattern: spreading os.environ.get(\"X\") across 50 files\n#   Renaming a var becomes a grep-and-replace; defaults disagree across modules;\n#   tests can't override consistently. Centralize config in one module."
                  }
        ],
        tips: [
                  "Add `.env` to `.gitignore` immediately — never commit credentials",
                  "`os.environ[\"KEY\"]` raises `KeyError` on missing — use for required vars so the app fails loudly",
                  "`os.getenv(\"KEY\")` returns `None` on missing — check explicitly or provide a default",
                  "For typed config, use `Pydantic BaseSettings` instead of raw `os.getenv` calls"
        ],
        mistake: "Hardcoding credentials: `db = connect(\"password123\")`. Use env vars — one accidental commit and credentials are compromised.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "requests",
        fn: "requests",
        desc: "Synchronous HTTP client — the standard library for REST API calls.",
        category: "HTTP",
        subtitle: "GET, POST, auth, sessions, error handling — always set timeout=",
        signature: "requests.get(url, params={}, headers={}, timeout=10)",
        descLong: "requests is the standard sync HTTP library. Always set timeout= — without it, a hung server blocks your program forever. Use Session to reuse TCP connections across multiple requests to the same host.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of requests — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport requests\nr = requests.get(\"https://api.example.com/users/1\", timeout=10)\nr.raise_for_status()                          # raise on 4xx/5xx\nprint(r.json())"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of requests — common patterns you'll see in production.\n# APPROACH  - Combine requests with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport requests\n# Session reuses TCP + base headers — ~3x faster for many calls to the same host\nsession = requests.Session()\nsession.headers.update({\"Authorization\": \"Bearer token\", \"User-Agent\": \"myapp/1.0\"})\ndef list_users(page: int = 1) -> list[dict]:\n    try:\n        r = session.get(\n            \"https://api.example.com/users\",\n            params={\"page\": page, \"limit\": 50},\n            timeout=10,                       # MANDATORY — without this, hangs forever\n        )\n        r.raise_for_status()\n        return r.json()\n    except requests.HTTPError as e:           # 4xx/5xx\n        raise RuntimeError(f\"http {e.response.status_code}: {e.response.text[:200]}\")\n    except requests.Timeout:\n        raise RuntimeError(\"upstream timeout\")\n    except requests.ConnectionError:\n        raise RuntimeError(\"network error\")\ndef create_user(payload: dict) -> dict:\n    r = session.post(\"https://api.example.com/users\", json=payload, timeout=10)\n    r.raise_for_status()\n    return r.json()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of requests — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport requests\nfrom requests.adapters import HTTPAdapter\nfrom urllib3.util import Retry\n# 1) Retry with exponential backoff — only for safe / idempotent statuses + methods\ndef make_session(*, total: int = 5, backoff: float = 0.5) -> requests.Session:\n    s = requests.Session()\n    s.mount(\"https://\", HTTPAdapter(max_retries=Retry(\n        total=total,\n        backoff_factor=backoff,                                   # 0.5, 1, 2, 4, 8 s\n        status_forcelist=[429, 500, 502, 503, 504],\n        allowed_methods=frozenset([\"GET\", \"PUT\", \"DELETE\", \"OPTIONS\", \"HEAD\"]),\n        respect_retry_after_header=True,\n    )))\n    s.mount(\"http://\", HTTPAdapter(max_retries=Retry(total=2)))\n    return s\n# 2) Separate connect / read timeouts — you usually want short connect, long read\nTIMEOUT = (5, 30)                                                # (connect, read)\nsession = make_session()\nsession.headers.update({\"User-Agent\": \"myapp/1.0\"})\n# 3) Streaming download — never load a 5 GB body into memory\ndef download(url: str, path: str):\n    with session.get(url, stream=True, timeout=TIMEOUT) as r:\n        r.raise_for_status()\n        with open(path, \"wb\") as f:\n            for chunk in r.iter_content(chunk_size=1024 * 1024):\n                f.write(chunk)\n# 4) Streaming JSON / NDJSON — process line-by-line\ndef stream_events(url: str):\n    with session.get(url, stream=True, timeout=TIMEOUT) as r:\n        r.raise_for_status()\n        for line in r.iter_lines(decode_unicode=True):\n            if line:\n                yield line                                       # caller json.loads()\n# 5) Verify TLS in production. Never disable for \"convenience.\"\nsession.verify = True                                            # default; never set False in prod\n# Decision rule:\n#   one-off script, no concurrency           -> requests.get/post with timeout\n#   many calls, same host                     -> Session()\n#   transient 5xx / 429 expected              -> Session + Retry(status_forcelist=...)\n#   downloads / large bodies                  -> stream=True + iter_content\n#   per-line streaming JSON                    -> stream=True + iter_lines\n#   need async (>10s of concurrent calls)     -> switch to httpx.AsyncClient\n#\n# Anti-pattern: requests.get(url) with NO timeout\n#   The default is None — wait forever. One misbehaving upstream wedges the\n#   whole process. Always pass timeout= (a tuple is even better)."
                  }
        ],
        tips: [
                  "Always set `timeout=` — without it, requests can hang forever",
                  "`r.raise_for_status()` is one line to raise on any 4xx/5xx — always call before `r.json()`",
                  "`Session` reuses TCP connections — ~3x faster for multiple requests to the same host",
                  "`requests.get(..., verify=False)` disables SSL verification — never in production",
                  "For transient 5xx / 429 responses, mount a `urllib3.util.Retry(status_forcelist=[429,500,502,503,504], backoff_factor=...)` on the Session — never hand-roll a retry loop",
                  "Large bodies / downloads: use `stream=True` + `iter_content` (or `iter_lines` for line-delimited JSON) so memory does not balloon to the response size"
        ],
        mistake: "Not setting `timeout=`. A single hung server request will block your entire program indefinitely. Always pass `timeout=10` (or higher for slow APIs).",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "httpx",
        fn: "httpx",
        desc: "Async-capable HTTP client — drop-in replacement for requests.",
        category: "HTTP",
        subtitle: "Same API as requests but supports async/await",
        signature: "async with httpx.AsyncClient() as client: r = await client.get(url)",
        descLong: "httpx has the same API as requests but also supports async with AsyncClient. Use httpx when you need concurrent HTTP requests — with asyncio.gather() you can fetch hundreds of URLs concurrently.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of httpx — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport httpx\nr = httpx.get(\"https://api.example.com/users/1\", timeout=10)\nr.raise_for_status()\nprint(r.json())"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of httpx — common patterns you'll see in production.\n# APPROACH  - Combine httpx with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport asyncio\nimport httpx\nTIMEOUT = httpx.Timeout(10.0, connect=5.0)\nasync def fetch_one(client: httpx.AsyncClient, url: str) -> dict:\n    r = await client.get(url, timeout=TIMEOUT)\n    r.raise_for_status()\n    return r.json()\nasync def fetch_all(urls: list[str]) -> list[dict | None]:\n    async with httpx.AsyncClient() as client:\n        results = await asyncio.gather(\n            *(fetch_one(client, u) for u in urls),\n            return_exceptions=True,                  # one failure doesn't kill the rest\n        )\n    return [r if not isinstance(r, Exception) else None for r in results]\nprint(asyncio.run(fetch_all([\n    \"https://api.example.com/users/1\",\n    \"https://api.example.com/users/2\",\n])))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of httpx — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport asyncio\nfrom contextlib import asynccontextmanager\nimport httpx\nfrom fastapi import FastAPI, Request\n# 1) ONE AsyncClient per process — connection pool is shared across all requests\nLIMITS    = httpx.Limits(max_connections=100, max_keepalive_connections=20)\nTIMEOUT   = httpx.Timeout(10.0, connect=5.0)\nTRANSPORT = httpx.AsyncHTTPTransport(retries=3)            # connect-error retries\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    app.state.http = httpx.AsyncClient(\n        base_url=\"https://api.upstream.com\",\n        timeout=TIMEOUT,\n        limits=LIMITS,\n        transport=TRANSPORT,\n        headers={\"User-Agent\": \"myapp/1.0\"},\n        http2=True,                                        # multiplex; fewer TCP conns\n    )\n    try:\n        yield\n    finally:\n        await app.state.http.aclose()                      # MUST close on shutdown\napp = FastAPI(lifespan=lifespan)\n@app.get(\"/users/{uid}\")\nasync def get_user(uid: int, request: Request):\n    client: httpx.AsyncClient = request.app.state.http\n    r = await client.get(f\"/users/{uid}\")\n    r.raise_for_status()\n    return r.json()\n# 2) Status-code retry with exponential backoff (httpx doesn't ship one for 5xx)\nasync def get_with_retry(client, url, attempts=3):\n    delay = 0.5\n    for i in range(attempts):\n        try:\n            r = await client.get(url)\n            if r.status_code < 500:\n                return r\n        except httpx.RequestError:\n            if i == attempts - 1: raise\n        await asyncio.sleep(delay); delay *= 2\n    return r\n# 3) Streaming for large bodies — chunk-by-chunk; don't materialize 5 GB in RAM\nasync def download(client, url, path):\n    async with client.stream(\"GET\", url) as r:\n        r.raise_for_status()\n        with open(path, \"wb\") as f:\n            async for chunk in r.aiter_bytes(chunk_size=1024 * 1024):\n                f.write(chunk)\n# Decision rule:\n#   sync code path                            -> httpx.get / Client (drop-in for requests)\n#   async server (FastAPI, Starlette)         -> ONE AsyncClient on app.state, lifespan-managed\n#   one-off async script                       -> async with httpx.AsyncClient(): ...\n#   N concurrent fetches                       -> asyncio.gather + return_exceptions=True\n#   large download                              -> client.stream(\"GET\", url) + aiter_bytes\n#   need recordable mocks for tests             -> respx (httpx-native), not vcrpy\n#   tons of concurrent connections to one host  -> http2=True (multiplex)\n#\n# Anti-pattern: instantiating AsyncClient per request handler\n#   ~30 ms TLS handshake every request; FD count climbs; throughput collapses.\n#   Create the client ONCE at startup (lifespan) and inject via request.app.state.\nasyncio = asyncio"
                  }
        ],
        tips: [
                  "`asyncio.gather(*tasks)` fetches all URLs concurrently — much faster than sequential requests",
                  "`return_exceptions=True` in gather prevents one failure from crashing everything else",
                  "`base_url=` in AsyncClient — set it once and use relative paths in each call",
                  "`httpx.Timeout(connect=5, read=30)` sets separate connect and read timeouts"
        ],
        mistake: "Creating a new `AsyncClient` for every request in a loop — this defeats connection pooling. Create one client and reuse it for all requests in the same session.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },
]

export default { meta, sections }
