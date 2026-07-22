export const meta = {
  "title": "Testing",
  "domain": "python",
  "sheet": "testing",
  "icon": "🧪"
}

export const sections = [

  // ── Section 1: pytest Basics ─────────────────────────────────────────
  {
    id: "pytest-basics",
    title: "pytest Basics",
    entries: [
      {
        id: "assertions",
        fn: "pytest assertions",
        desc: "Write tests with plain assert — pytest rewrites them for detailed output.",
        category: "pytest",
        subtitle: "Use assert directly — pytest shows exactly what failed and why",
        signature: "def test_fn(): assert result == expected",
        descLong: "pytest uses plain Python assert statements — no special assertion methods needed. pytest rewrites assert at collection time to produce detailed failure messages showing the actual and expected values. Tests are discovered automatically in files matching test_*.py.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pytest assertions — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# test_math.py\ndef add(a, b):\n    return a + b\ndef test_add_positive_numbers():\n    assert add(2, 3) == 5\n# $ pytest                    # discovers test_*.py automatically\n# $ pytest -v                 # show each test name\n# $ pytest -k \"add\"           # only tests with \"add\" in the name"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pytest assertions — common patterns you'll see in production.\n# APPROACH  - Combine pytest assertions with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\ndef test_user_registration_creates_active_user():\n    # Arrange — set up inputs\n    email = \"alice@example.com\"\n    name  = \"Alice Smith\"\n    # Act — call the thing under test\n    user = create_user(email, name)\n    # Assert — one logical thing per test, but multiple assertions are fine\n    assert user.email == email\n    assert user.name  == name\n    assert user.created_at is not None\n    assert user.is_active, \"newly created users should be active by default\"\ndef test_email_validator():\n    # Plain assert reads better than unittest's assertEqual / assertTrue\n    assert validate_email(\"user@example.com\") is True\n    assert validate_email(\"invalid.email\")    is False\n    assert validate_email(\"\")                 is False\n# Useful flags:\n# pytest -x                  stop after first failure\n# pytest --lf                only re-run last-failed tests\n# pytest -s                  don't capture stdout (see print/debug output)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pytest assertions — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# 1) NAME tests by behavior, not function — \"what\" + \"when\" + \"expected outcome\"\ndef test_create_user_with_negative_age_raises_value_error():    # crystal-clear failure log\n    with pytest.raises(ValueError, match=\"age must be\"):\n        create_user(\"bob@example.com\", \"Bob\", age=-5)\n# 2) ONE behavior per test — multiple asserts on the SAME state are fine; resist\n#    asserting two unrelated behaviors in one function.\ndef test_payment_completed_marks_metadata():\n    payment = process_payment(amount=99.99, currency=\"USD\")\n    assert payment.status         == \"completed\"\n    assert payment.amount         == 99.99\n    assert \"transaction_id\" in payment.metadata\n    # Don't tack on: assert refund_payment(payment).status == \"refunded\"\n# 3) Helpful failure messages — the assertion shows values, but custom strings\n#    explain INTENT for the engineer reading the failure.\ndef test_orders_are_strictly_pending():\n    orders = get_pending_orders()\n    bad = [o for o in orders if o.status != \"pending\"]\n    assert not bad, f\"non-pending orders leaked into get_pending_orders(): {bad[:3]}\"\n# 4) Equality on collections — let pytest's diff do the work\ndef test_normalize_email_strips_and_lowercases():\n    raw = [\"  A@X.COM \", \"b@y.com\\n\"]\n    assert normalize_emails(raw) == [\"a@x.com\", \"b@y.com\"]    # diff is shown on failure\n# Decision rule:\n#   one logical behavior, multiple aspects   -> multiple assert lines, ONE test function\n#   N similar inputs, same behavior          -> @pytest.mark.parametrize, not N copies\n#   error path                                 -> pytest.raises with match=\n#   floating-point math                        -> pytest.approx, never ==\n#   unrelated behavior                         -> separate test function\n#\n# Anti-pattern: \"test_create_user\" with 30 asserts spanning every feature\n#   When one fails, the rest never run, so each commit gives you ONE bug at a\n#   time. Split by behavior — failures in unrelated areas should be visible\n#   simultaneously."
                  }
        ],
        tips: [
                  "pytest rewrites `assert` — plain `assert a == b` gives better output than unittest's `assertEqual(a, b)`",
                  "Add a message: `assert cond, f\"got {val}\"` — shown only on failure",
                  "pytest discovers tests in files named `test_*.py` or `*_test.py` automatically",
                  "Run `pytest -v` for verbose output, `pytest -s` to see print() output"
        ],
        mistake: "Using `assert` outside of pytest (e.g., in production code). pytest rewrites assert — outside pytest, a failed assert raises AssertionError with no helpful message.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "test-doubles",
        fn: "Test doubles",
        desc: "Vocabulary for the different kinds of fake objects used in testing.",
        category: "pytest",
        subtitle: "Stub / Fake / Spy / Mock — know which to use when",
        signature: "stub → fixed return | mock → verify calls | spy → wrap real obj",
        descLong: "Test doubles are objects that stand in for real dependencies. The terms are often used loosely but have distinct meanings: stubs return fixed values, fakes have working implementations, spies record calls without replacing behavior, mocks verify specific interactions were made.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Test doubles — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nclass StubEmailService:\n    \"\"\"Always 'succeeds'; doesn't actually send.\"\"\"\n    def send(self, to, subject, body):\n        return True\ndef test_signup_uses_email_service():\n    email = StubEmailService()\n    user  = signup(\"alice@example.com\", email_service=email)\n    assert user.is_active"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Test doubles — common patterns you'll see in production.\n# APPROACH  - Combine Test doubles with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom unittest.mock import MagicMock\n# 1) Stub — fixed return, ignores arguments\nclass StubEmail:\n    def send(self, *args, **kw): return True\n# 2) Fake — working implementation, not production-grade\nclass FakeDB:\n    def __init__(self):  self._store = {}\n    def get(self, k):    return self._store.get(k)\n    def set(self, k, v): self._store[k] = v\ndef test_fake_db_round_trip():\n    db = FakeDB()\n    db.set(\"a\", 1)\n    assert db.get(\"a\") == 1                         # FakeDB has REAL behavior\n# 3) Spy — wraps real object, records calls without changing behavior\nclass SpyEmail:\n    def __init__(self, real):    self._real, self.calls = real, []\n    def send(self, to, subject, body):\n        self.calls.append((to, subject))\n        return self._real.send(to, subject, body)\n# 4) Mock — replaces the dependency; you assert HOW it was called\ndef test_signup_sends_welcome_mail():\n    email = MagicMock()\n    email.send.return_value = True\n    signup(\"alice@example.com\", email_service=email)\n    email.send.assert_called_once()                 # just one call\n    args, _ = email.send.call_args\n    assert args[0] == \"alice@example.com\"           # to:"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Test doubles — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom unittest.mock import MagicMock\n# 1) Mock at the BOUNDARY — external HTTP, DB, queue. Never internal helpers.\n#    Internal helpers don't need to be mocked: refactoring them shouldn't break tests.\nclass StripeClient:                                  # the real client (boundary)\n    def charge(self, amount, token): ...\ndef test_purchase_charges_stripe_once():\n    stripe = MagicMock(spec=StripeClient)            # spec= rejects unknown attrs\n    stripe.charge.return_value = {\"id\": \"ch_123\"}\n    purchase(amount=100, payment_token=\"tok_x\", stripe=stripe)\n    stripe.charge.assert_called_once_with(100, \"tok_x\")\n# 2) Prefer FAKES for stateful collaborators (DB, cache, queue) — real behavior,\n#    fast, and tests survive internal refactors.\nclass FakeQueue:\n    def __init__(self):       self.items = []\n    def push(self, item):     self.items.append(item)\n    def pop(self):            return self.items.pop(0) if self.items else None\ndef test_worker_processes_each_item():\n    q = FakeQueue(); q.push(\"a\"); q.push(\"b\")\n    process_all(q)\n    assert q.items == []                             # behavior, not call count\n# 3) SPY when you want to keep real behavior AND verify a side effect\nclass SpyLogger:\n    def __init__(self, real): self._real, self.entries = real, []\n    def info(self, msg, *a, **kw):\n        self.entries.append(msg)\n        return self._real.info(msg, *a, **kw)\n# 4) Specify the contract with spec= or spec_set= so the mock CAN'T grow new\n#    attributes silently — production code calling a typo'd method gets caught.\nmock = MagicMock(spec_set=StripeClient)\n# mock.refund(...)   -> AttributeError immediately; .charge(...) is fine\n# Decision rule:\n#   external service (HTTP, DB, queue)         -> Mock with spec=Real, assert calls\n#   in-process collaborator with state          -> Fake (in-memory)\n#   need to verify side-effect AND keep behavior -> Spy (wrap, record, delegate)\n#   test the return value, not the interaction   -> Stub (or just MagicMock)\n#   private helper / pure function               -> NO double; call it directly\n#\n# Anti-pattern: mocking the function under test's own dependencies recursively\n#   \"I mocked save_user, hash_password, send_email — and the test still passes.\"\n#   You're testing the mocks. Mock the OUTERMOST boundary; let the rest of the\n#   code run for real, on a fake DB."
                  }
        ],
        tips: [
                  "Prefer stubs and fakes over mocks — tests with fewer mock assertions are less brittle",
                  "Mocks test implementation details — if you refactor without changing behavior, mocked tests break",
                  "Fakes (in-memory DB, fake Redis) make integration tests fast without a real infrastructure dependency",
                  "The simplest test double is a lambda: `send_email = lambda to, subj, body: None`"
        ],
        mistake: "Over-mocking — replacing every dependency with a mock. Tests become coupled to implementation details and break on refactoring. Mock at the boundary (external HTTP, DB) not internal function calls.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "raises",
        fn: "pytest.raises()",
        desc: "Assert that code raises a specific exception.",
        category: "pytest",
        subtitle: "Test that the right exception is raised with the right message",
        signature: "with pytest.raises(ExcType, match=\"regex\"): ...",
        descLong: "pytest.raises() is a context manager that passes only if the wrapped code raises the specified exception. match= checks the exception message with a regex. Access the exception info via the as clause.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pytest.raises() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport pytest\ndef divide(a, b):\n    if b == 0:\n        raise ValueError(\"division by zero\")\n    return a / b\ndef test_divide_by_zero_raises():\n    with pytest.raises(ValueError):\n        divide(1, 0)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pytest.raises() — common patterns you'll see in production.\n# APPROACH  - Combine pytest.raises() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport pytest\nclass InsufficientFunds(Exception):\n    def __init__(self, amount, balance):\n        self.amount, self.balance = amount, balance\n        super().__init__(f\"need {amount}, have {balance}\")\ndef withdraw(amount, balance):\n    if amount > balance:\n        raise InsufficientFunds(amount, balance)\n    return balance - amount\n# match= is re.search — anchor with ^...$ if you want a full match\ndef test_withdraw_message():\n    with pytest.raises(InsufficientFunds, match=r\"need 100, have 50\"):\n        withdraw(100, balance=50)\n# Capture the instance to assert on attributes\ndef test_withdraw_carries_state():\n    with pytest.raises(InsufficientFunds) as exc_info:\n        withdraw(100, balance=50)\n    assert exc_info.value.amount  == 100\n    assert exc_info.value.balance == 50\n    assert exc_info.type is InsufficientFunds       # exact class, not subclass\n# pytest.raises FAILS the test if NO exception is raised — no need to add asserts\ndef test_withdraw_success():\n    assert withdraw(40, balance=50) == 10           # no pytest.raises here"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pytest.raises() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport pytest\n# 1) NEVER catch the parent class — you'll silence unrelated bugs\ndef test_too_loose():\n    with pytest.raises(Exception):                  # ANTI-PATTERN: hides KeyError, TypeError, ...\n        ...\ndef test_correct():\n    with pytest.raises(ValueError, match=r\"^age must be positive$\"):\n        create_user(\"a@x.com\", \"A\", age=-5)\n# 2) Parametrize the error cases — clearer than 5 near-identical test functions\n@pytest.mark.parametrize(\"amount, balance, msg\", [\n    (100, 50,  r\"need 100, have 50\"),\n    (1,   0,   r\"need 1, have 0\"),\n    (0,   0,   r\"^amount must be positive$\"),\n])\ndef test_withdraw_errors(amount, balance, msg):\n    with pytest.raises((InsufficientFunds, ValueError), match=msg):\n        withdraw(amount, balance=balance)\n# 3) Chained exceptions — verify the cause, not just the wrapper\ndef parse_int(s):\n    try:\n        return int(s)\n    except ValueError as e:\n        raise RuntimeError(\"parse failed\") from e\ndef test_chained():\n    with pytest.raises(RuntimeError, match=\"parse failed\") as exc_info:\n        parse_int(\"abc\")\n    assert isinstance(exc_info.value.__cause__, ValueError)\n# 4) Multi-error (Python 3.11+ ExceptionGroup) — pytest has a matcher for it\ndef test_group():\n    with pytest.RaisesGroup(ValueError, KeyError):\n        raise ExceptionGroup(\"ouch\", [ValueError(\"a\"), KeyError(\"b\")])\n# Decision rule:\n#   error type matters, message matters    -> raises(Type, match=r\"regex\")\n#   need to inspect the exception object   -> as exc_info; assert on .value / .__cause__\n#   N similar error scenarios               -> @parametrize, one test function\n#   library wraps a real cause              -> assert exc_info.value.__cause__ is the real one\n#   ExceptionGroup (3.11+)                  -> pytest.RaisesGroup\n#\n# Anti-pattern: assertions INSIDE the with-block\n#   with pytest.raises(ValueError):\n#       result = thing()\n#       assert result == expected      # AssertionError gets eaten by pytest.raises!\n#   Always: assert AFTER the block, on exc_info.value if needed."
                  }
        ],
        tips: [
                  "`match=` uses `re.search()` — it is a partial match, not full-string. Use `^...$` to anchor",
                  "Access `.value` for the exception instance, `.type` for the class, `.traceback` for the stack",
                  "Test the exact exception type — catching a base class like `Exception` misses bugs",
                  "If the code should raise, the test fails if it does NOT raise — no assertion needed inside the block"
        ],
        mistake: "Putting assertions AFTER the line that raises inside the `pytest.raises` block — execution never reaches them once the expected exception fires, so they silently never run. Put follow-up assertions OUTSIDE the block, against `excinfo.value`.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "approx",
        fn: "pytest.approx()",
        desc: "Compare floating-point numbers with tolerance.",
        category: "pytest",
        subtitle: "Never use == for floats — use pytest.approx()",
        signature: "assert value == pytest.approx(expected, rel=1e-6, abs=1e-12)",
        descLong: "Floating-point arithmetic is inexact — 0.1 + 0.2 is not exactly 0.3 in binary. pytest.approx() compares with a relative tolerance (default 1e-6) so small floating-point errors do not cause false failures. Works on scalars, lists, dicts, and numpy arrays.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pytest.approx() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport pytest\n# 0.1 + 0.2 == 0.3   # False in Python! IEEE 754 float math is inexact\ndef test_float_sum():\n    assert 0.1 + 0.2 == pytest.approx(0.3)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pytest.approx() — common patterns you'll see in production.\n# APPROACH  - Combine pytest.approx() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport math\nimport numpy as np\nimport pytest\n# Default: rel=1e-6  (|a-b| / |b| < 1e-6)\nassert 1 / 3 == pytest.approx(0.333333, rel=1e-5)\n# Use abs= when the expected value is near zero (relative tolerance breaks down)\nassert math.sin(math.pi) == pytest.approx(0.0, abs=1e-9)   # NOT rel=\n# Approx works on collections too — diffs become readable on failure\nassert [0.1 + 0.2, 1/3] == pytest.approx([0.3, 0.3333])\nassert {\"pi\": 3.14159, \"e\": 2.71828} == pytest.approx({\"pi\": 3.14159, \"e\": 2.71828})\n# numpy arrays: works the same way\nassert np.array([0.1 + 0.2]) == pytest.approx(np.array([0.3]))\n# Integers are exact — DON'T wrap them in approx\nassert 10 // 3 == 3"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pytest.approx() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport math\nimport numpy as np\nimport pytest\n# 1) NaN is NEVER == anything — including itself or another NaN.\n#    pytest.approx supports nan via nan_ok=True\nassert math.nan == pytest.approx(math.nan, nan_ok=True)\n# 2) Near-zero — relative tolerance is meaningless. Use abs=, not rel=.\n#    rel=1e-6 around 0.0 means \"absolute < 0.0\" -> always fails.\ndef test_near_zero_use_abs():\n    val = 1e-12\n    assert val == pytest.approx(0.0, abs=1e-9)            # OK\n    # assert val == pytest.approx(0.0, rel=1e-6)          # FAILS\n# 3) Mixed-magnitude vectors — np.isclose with rtol AND atol is the safer tool\n#    pytest.approx applies one tolerance pair across the whole structure.\nbig_small = np.array([1e6, 1e-6, 0.0])\nnp.testing.assert_allclose(big_small, [1e6 + 1, 1e-6, 1e-9], rtol=1e-3, atol=1e-9)\n# 4) Don't use approx on EXACT comparisons. Integer math, hash strings, IDs —\n#    those should fail loudly when they drift. approx hides the problem.\n# 5) For scientific results, prefer numpy.testing helpers — the failure messages\n#    show element-wise diffs, mean error, and locations.\nnp.testing.assert_array_almost_equal_nulp(np.array([1.0]), np.array([1.0]), nulp=2)\n# Decision rule:\n#   simple float scalar                       -> pytest.approx(expected, rel=1e-6)\n#   value near zero                            -> pytest.approx(0.0, abs=1e-9)\n#   list / dict of floats                      -> pytest.approx(struct)\n#   numpy array, mixed magnitudes               -> np.testing.assert_allclose(..., rtol, atol)\n#   bit-level numerical correctness            -> np.testing.assert_array_almost_equal_nulp\n#   integers / IDs / strings                    -> plain ==\n#\n# Anti-pattern: assert abs(a - b) < 1e-6\n#   Hand-rolled tolerances forget the absolute case, don't compose, and produce\n#   useless failure messages. Use approx or np.testing.* — they print diffs."
                  }
        ],
        tips: [
                  "Default tolerance is 1e-6 relative — tight enough for most tests, loose enough for float noise",
                  "`abs=` tolerance is better when the expected value is near zero (relative tolerance breaks down)",
                  "pytest.approx works on nested structures — lists of lists, dicts of lists, numpy arrays",
                  "Only use approx for floats — integer comparisons should always be exact"
        ],
        mistake: "`assert 0.1 + 0.2 == 0.3` fails because `0.1 + 0.2 = 0.30000000000000004`. Always use `pytest.approx()` for floating-point assertions.",
        shorthand: {
          verbose: "import pytest\n0.1 + 0.2 == 0.3          # False in Python!\ndef test_float():\nassert 0.1 + 0.2 == pytest.approx(0.3)     # passes ✓",
          concise: "assert 10 // 3 == 3     # exact comparison fine",
        },
      },
      {
        id: "parametrize",
        fn: "@pytest.mark.parametrize",
        desc: "Run one test function with many different input/output pairs.",
        category: "pytest",
        subtitle: "Data-driven tests — one function, many cases, each pass/fail independently",
        signature: "@pytest.mark.parametrize(\"a,b,expected\", [(1,2,3), (4,5,9)])",
        descLong: "parametrize runs a test multiple times with different arguments. Each set of arguments is a separate test case with its own pass/fail result. Cleaner and more scalable than writing separate test functions for each case.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of @pytest.mark.parametrize — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport pytest\ndef is_palindrome(s):\n    return s == s[::-1]\n@pytest.mark.parametrize(\"word\", [\"racecar\", \"level\", \"noon\"])\ndef test_palindromes(word):\n    assert is_palindrome(word)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of @pytest.mark.parametrize — common patterns you'll see in production.\n# APPROACH  - Combine @pytest.mark.parametrize with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport pytest\ndef is_palindrome(s):\n    s = s.lower().replace(\" \", \"\")\n    return s == s[::-1]\n# Multi-column parametrize with readable IDs in the test report\n@pytest.mark.parametrize(\"text, expected\", [\n    pytest.param(\"racecar\",       True,  id=\"basic_palindrome\"),\n    pytest.param(\"hello\",         False, id=\"not_palindrome\"),\n    pytest.param(\"\",              True,  id=\"empty_string\"),\n    pytest.param(\"A man a plan\",  False, id=\"ignores_only_spaces\"),\n    pytest.param(\"A\",             True,  id=\"single_char\"),\n])\ndef test_is_palindrome(text, expected):\n    assert is_palindrome(text) is expected\n# Combine with a fixture — each case gets a fresh fixture\n@pytest.fixture\ndef client():\n    yield TestClient(app)                            # imagined; one per case\n@pytest.mark.parametrize(\"role\", [\"admin\", \"user\", \"guest\"])\ndef test_login_role(client, role):\n    r = client.post(\"/login\", json={\"role\": role})\n    assert r.status_code == 200"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of @pytest.mark.parametrize — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport pytest\n# 1) Stacked decorators = cartesian product (N x M test cases)\n@pytest.mark.parametrize(\"x\", [1, 2, 3])\n@pytest.mark.parametrize(\"y\", [10, 20])\ndef test_grid(x, y):                                 # 6 cases\n    assert x * y > 0\n# 2) Per-case marks: skip / xfail / slow / custom — without forking the function\n@pytest.mark.parametrize(\"n,expected\", [\n    (0,  1),\n    (1,  1),\n    (5,  120),\n    pytest.param(20, 2_432_902_008_176_640_000, marks=pytest.mark.slow),\n    pytest.param(-1, None,                        marks=pytest.mark.xfail(strict=True)),\n])\ndef test_factorial(n, expected):\n    assert factorial(n) == expected\n# 3) Big test tables — extract to a module-level constant for reuse + readability\nPALINDROMES = [\n    (\"racecar\",       True),\n    (\"\",              True),\n    (\"hello\",         False),\n]\n@pytest.mark.parametrize(\"text, expected\", PALINDROMES)\ndef test_palindrome_table(text, expected):\n    assert is_palindrome(text) is expected\n# 4) Parametrize a FIXTURE — every test using `db` runs once per backend\n@pytest.fixture(params=[\"sqlite\", \"postgres\"], ids=[\"sqlite\", \"pg\"])\ndef db(request):\n    yield connect(request.param)\ndef test_user_round_trip(db):                        # runs twice: sqlite + pg\n    db.save({\"id\": 1, \"name\": \"alice\"})\n    assert db.get(1)[\"name\"] == \"alice\"\n# 5) indirect=True forwards the param to a fixture — useful for \"load this file\"\n@pytest.fixture\ndef fixture_data(request):\n    return load_file(request.param)\n@pytest.mark.parametrize(\"fixture_data\", [\"a.json\", \"b.json\"], indirect=True)\ndef test_file_processing(fixture_data):\n    assert process(fixture_data).is_valid\n# Decision rule:\n#   1 input, M cases                          -> single-arg parametrize\n#   (input, expected) tuples                   -> two-arg parametrize, IDs per case\n#   slow / known-broken cases                  -> pytest.param(marks=mark.slow / xfail)\n#   same test, different backends              -> fixture(params=[...])\n#   independent dimensions (e.g., role x lang) -> stacked parametrize\n#   table reused across files                   -> module constant + parametrize\n#\n# Anti-pattern: 12 near-identical test_* functions differing only by inputs\n#   Each renames a variable; bug-fixing requires editing 12 places. Use one\n#   parametrized function — failures still show per-case in the report.\ndef factorial(n): import math; return math.factorial(n)\ndef is_palindrome(s): s = s.lower().replace(\" \", \"\"); return s == s[::-1]\ndef connect(_): pass\ndef load_file(_): pass\ndef process(_): return type(\"R\", (), {\"is_valid\": True})()"
                  }
        ],
        tips: [
                  "Use `pytest.param(..., id=\"name\")` for readable test names instead of `test_fn[param0-param1]`",
                  "Two `@parametrize` decorators run the cartesian product — N × M test cases",
                  "Mark individual params: `pytest.param(val, marks=pytest.mark.xfail)` for expected failures",
                  "Extract large parameter lists to a module-level constant: `CASES = [...]; @parametrize(\"a,b\", CASES)`"
        ],
        mistake: "Writing ten nearly identical test functions differing only by input. Use `@parametrize` — each case gets its own pass/fail, clearer output, and easier to add more cases.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
    ],
  },

  // ── Section 2: Fixtures ─────────────────────────────────────────
  {
    id: "fixtures",
    title: "Fixtures",
    entries: [
      {
        id: "fixture-basic",
        fn: "@pytest.fixture",
        desc: "Provide reusable setup — and teardown — for tests.",
        category: "Fixtures",
        subtitle: "yield fixtures run setup before the test and teardown after",
        signature: "@pytest.fixture\\ndef my_fixture(): yield value",
        descLong: "Fixtures provide reusable setup and teardown. A fixture with yield runs code before the test (setup), yields a value to the test, then runs code after (teardown). Teardown runs even when the test fails.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of @pytest.fixture — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport pytest\n@pytest.fixture\ndef sample_user():\n    return {\"email\": \"test@example.com\", \"name\": \"Test User\"}\ndef test_user_email(sample_user):           # parameter name == fixture name\n    assert sample_user[\"email\"].endswith(\"@example.com\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of @pytest.fixture — common patterns you'll see in production.\n# APPROACH  - Combine @pytest.fixture with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport pytest\n@pytest.fixture\ndef db():\n    conn = connect_db(\":memory:\")             # SETUP\n    conn.setup_schema()\n    yield conn                                # value injected into the test\n    conn.close()                              # TEARDOWN — runs even on failure\n@pytest.fixture\ndef sample_user(db):                          # fixtures can depend on fixtures\n    user_id = db.create_user(\"test@example.com\", \"Test\")\n    return db.get_user(user_id)\ndef test_user_round_trip(db, sample_user):\n    assert db.count_users() == 1\n    assert sample_user.email == \"test@example.com\"\ndef test_database_isolated(db):               # gets a FRESH db (function scope)\n    assert db.count_users() == 0"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of @pytest.fixture — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport contextlib\nimport pytest\n# 1) request gives access to the calling test's context — log per-test names,\n#    parametrize-aware setup, finalizers when yield isn't enough.\n@pytest.fixture\ndef tmp_workspace(request, tmp_path):\n    workspace = tmp_path / request.node.name\n    workspace.mkdir()\n    return workspace\n# 2) Multi-resource teardown — ExitStack guarantees cleanup even if one step fails\n@pytest.fixture\ndef integration_env():\n    with contextlib.ExitStack() as stack:\n        db    = stack.enter_context(temporary_db())\n        cache = stack.enter_context(temporary_redis())\n        queue = stack.enter_context(temporary_queue())\n        yield {\"db\": db, \"cache\": cache, \"queue\": queue}\n    # all three close in REVERSE order, even if a test raised\n# 3) autouse fixture for state reset — applies to every test in scope without\n#    each test having to remember to ask for it.\n@pytest.fixture(autouse=True)\ndef reset_singletons():\n    yield\n    SingletonRegistry.clear()                  # post-test cleanup\n# 4) Factory fixture — let the test ASK for N variants instead of hard-coding one\n@pytest.fixture\ndef make_user(db):\n    created = []\n    def _factory(**overrides):\n        u = db.create_user(**({\"email\": \"x@x.com\", \"name\": \"X\"} | overrides))\n        created.append(u.id)\n        return u\n    yield _factory\n    for uid in created:                        # cleanup all created in this test\n        db.delete_user(uid)\ndef test_two_users(make_user):\n    a = make_user(email=\"a@x.com\")\n    b = make_user(email=\"b@x.com\")\n    assert a.id != b.id\n# Decision rule:\n#   resource needs cleanup                   -> yield + cleanup-after-yield\n#   multiple resources, any can fail          -> contextlib.ExitStack\n#   need fresh resource per test               -> default (function scope)\n#   N variants per test                        -> factory fixture (yield a callable)\n#   reset global state across all tests        -> autouse=True\n#   per-test parametrization metadata          -> request.node.name / request.param\n#\n# Anti-pattern: cleanup in a try/finally inside the test\n#   def test_x():\n#       db = connect()\n#       try: ...\n#       finally: db.close()\n#   That's a fixture screaming to be born. Move it; you'll reuse it tomorrow.\ndef connect_db(_): return type(\"C\", (), {\"setup_schema\": lambda s: None,\n                                         \"create_user\":  lambda s, *a, **k: 1,\n                                         \"get_user\":     lambda s, _: type(\"U\", (), {\"email\": \"test@example.com\"})(),\n                                         \"delete_user\":  lambda s, _: None,\n                                         \"count_users\":  lambda s: 0,\n                                         \"close\":        lambda s: None})()\n@contextlib.contextmanager\ndef temporary_db():    yield None\n@contextlib.contextmanager\ndef temporary_redis(): yield None\n@contextlib.contextmanager\ndef temporary_queue(): yield None\nclass SingletonRegistry:\n    @staticmethod\n    def clear(): pass"
                  }
        ],
        tips: [
                  "Always use `yield` fixtures over `request.addfinalizer` — setup and teardown in one function is cleaner",
                  "Teardown after `yield` runs even when the test raises — guaranteed cleanup",
                  "Fixtures are injected by parameter name — the name of the fixture function must match the parameter",
                  "Put shared fixtures in `conftest.py` — pytest discovers them automatically without imports"
        ],
        mistake: "Doing cleanup with `return` instead of `yield`. Code after `return` never runs. Use `yield` to split setup/teardown, or `request.addfinalizer(cleanup_fn)`.",
        shorthand: {
          verbose: "import pytest\n@pytest.fixture\ndef sample_database():\n\"\"\"Setup: create test DB\"\"\"",
          concise: "assert sample_database.count_users() == 1",
        },
      },
      {
        id: "fixture-scope",
        fn: "Fixture scope",
        desc: "Control how often a fixture is created and torn down.",
        category: "Fixtures",
        subtitle: "function | class | module | session — match cost to lifetime",
        signature: "@pytest.fixture(scope=\"session\")",
        descLong: "scope= controls how often a fixture is set up and torn down. The default is \"function\" — fresh instance per test. Use \"session\" for expensive resources like database connections or server startup that can be shared safely.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Fixture scope — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport pytest\n@pytest.fixture                              # default scope = \"function\"\ndef fresh_list():\n    return []                                # NEW list per test\n@pytest.fixture(scope=\"module\")              # one instance shared across the file\ndef shared_counter():\n    return {\"calls\": 0}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Fixture scope — common patterns you'll see in production.\n# APPROACH  - Combine Fixture scope with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport pytest\n# function (default) — fresh per test, the safe choice\n@pytest.fixture\ndef cart():\n    return Cart()\n# class — shared across methods of one TestClass\n@pytest.fixture(scope=\"class\")\ndef class_resource():\n    res = setup_resource()\n    yield res\n    teardown_resource(res)\n# module — shared across all tests in one file\n@pytest.fixture(scope=\"module\")\ndef db_connection():\n    conn = create_connection()\n    yield conn\n    conn.close()\n# session — shared across the WHOLE test run\n@pytest.fixture(scope=\"session\")\ndef app():\n    return create_app({\"TESTING\": True})\n# autouse — applies to every test in scope without being requested\n@pytest.fixture(autouse=True)\ndef reset_singletons():\n    yield\n    clear_singletons()                       # post-test cleanup\n# Rule: a fixture can only depend on fixtures of EQUAL or BROADER scope.\n# function < class < module < session.   Function can use session; not vice versa."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Fixture scope — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport pytest\n# 1) Session-scoped engine — created ONCE; engine creation is expensive\n@pytest.fixture(scope=\"session\")\ndef engine():\n    e = create_engine(\"postgresql://test/test\")    # or sqlite:///:memory:\n    Base.metadata.create_all(e)\n    yield e\n    e.dispose()\n# 2) Function-scoped session — wraps every test in a transaction that ROLLS BACK\n@pytest.fixture\ndef db(engine):\n    connection  = engine.connect()\n    transaction = connection.begin()\n    session = Session(bind=connection)\n    yield session\n    session.close()\n    transaction.rollback()                          # THIS is what gives you isolation\n    connection.close()\ndef test_user_created(db):                          # fast: no schema rebuild per test\n    db.add(User(email=\"a@x.com\")); db.flush()\n    assert db.query(User).count() == 1\ndef test_db_is_clean(db):                           # rollback guarantees isolation\n    assert db.query(User).count() == 0\n# 3) Mixing scopes safely — broader scope is the cache, narrower scope is the rollback\n#    session-scoped engine + function-scoped transaction = fast AND isolated.\n# 4) Beware autouse + session — runs ONCE for the suite; almost never what you want\n#    for state reset. Pair autouse with function scope.\n# Decision rule:\n#   anything mutated during a test         -> function scope (default)\n#   pure compute / read-only resource       -> module or session scope\n#   shared across whole suite (DB engine)   -> session scope; pair with function-scope txn\n#   reset global state automatically         -> autouse=True at function scope\n#   per-test logger / temp dir               -> request.node.name + tmp_path (function)\n#\n# Anti-pattern: scope=\"session\" on a list / dict the tests mutate\n#   The third test in the file fails because the second mutated the shared\n#   object. Either switch to function scope or wrap the resource with a\n#   per-test reset (autouse fixture that snapshots and restores).\nclass Cart: pass\ndef setup_resource(): pass\ndef teardown_resource(_): pass\ndef create_connection(): return type(\"C\", (), {\"close\": lambda s: None})()\ndef create_app(_): pass\ndef clear_singletons(): pass\ndef create_engine(_): return type(\"E\", (), {\"connect\": lambda s: None, \"dispose\": lambda s: None})()\nclass Base:\n    metadata = type(\"M\", (), {\"create_all\": staticmethod(lambda _: None)})()\nclass Session:\n    def __init__(self, bind=None): pass\n    def add(self, _): pass\n    def flush(self): pass\n    def query(self, _): return type(\"Q\", (), {\"count\": lambda s: 0})()\n    def close(self): pass\nclass User:\n    def __init__(self, email=None): self.email = email"
                  }
        ],
        tips: [
                  "Use `scope=\"session\"` for expensive setup (DB engine, test server) — runs once for the whole suite",
                  "Use `scope=\"function\"` (default) for anything that mutates state — guarantees isolation",
                  "`autouse=True` applies the fixture to every test in scope — great for resetting global state",
                  "Scoped fixtures can only request fixtures of equal or broader scope: function < class < module < session"
        ],
        mistake: "`scope=\"session\"` with a fixture that mutates shared state. Tests become order-dependent and flaky. Use `scope=\"function\"` with transactions that roll back after each test.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "factory-boy",
        fn: "Factory Boy",
        desc: "Generate test data with factories — no more brittle fixture dicts.",
        category: "Fixtures",
        subtitle: "factory_boy creates realistic model instances with sensible defaults",
        signature: "class UserFactory(factory.Factory): name = factory.Faker(\"name\")",
        descLong: "Factory Boy creates test data factories — classes that generate model instances with sensible defaults. Faker generates realistic data. SQLAlchemy factories integrate with the session. Much cleaner than manually constructing dicts or objects in every test.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Factory Boy — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport factory\nfrom factory import Faker\nclass User:\n    def __init__(self, name, email):  self.name, self.email = name, email\nclass UserFactory(factory.Factory):\n    class Meta:\n        model = User\n    name  = Faker(\"name\")           # \"John Smith\"\n    email = Faker(\"email\")          # \"john.smith@example.com\"\n# In tests\ndef test_email_lowercased():\n    user = UserFactory(email=\"ALICE@X.COM\")     # override only what matters\n    assert normalize_email(user.email) == \"alice@x.com\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Factory Boy — common patterns you'll see in production.\n# APPROACH  - Combine Factory Boy with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport factory\nfrom factory import Faker, SubFactory, LazyAttribute, Sequence\nclass UserFactory(factory.Factory):\n    class Meta:\n        model = User\n    # Sequence — guarantees uniqueness across calls\n    username = Sequence(lambda n: f\"user_{n:04d}\")\n    # LazyAttribute — compute from OTHER fields on this instance\n    name  = Faker(\"name\")\n    email = LazyAttribute(lambda o: f\"{o.name.lower().replace(' ', '.')}@test.com\")\nclass Post:\n    def __init__(self, title, author): self.title, self.author = title, author\nclass PostFactory(factory.Factory):\n    class Meta:\n        model = Post\n    title  = Faker(\"sentence\", nb_words=5)\n    author = SubFactory(UserFactory)            # creates a User automatically\n# Build many at once\nusers = UserFactory.build_batch(5)              # list of 5 unrelated Users\npost  = PostFactory()                            # author auto-created via SubFactory"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Factory Boy — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport factory\nfrom factory import Faker, SubFactory, RelatedFactory, Trait, post_generation\nfrom factory.alchemy import SQLAlchemyModelFactory\n# 1) SQLAlchemy factory — wire the session via a pytest fixture\ndef make_factories(session):\n    class _UserFactory(SQLAlchemyModelFactory):\n        class Meta:\n            model              = User\n            sqlalchemy_session = session\n            sqlalchemy_session_persistence = \"commit\"   # or \"flush\"\n        username = factory.Sequence(lambda n: f\"u{n}\")\n        email    = Faker(\"email\")\n        # 2) Traits — named bundles of overrides; compose them per test\n        class Params:\n            admin = Trait(role=\"admin\", is_staff=True)\n            unverified = Trait(verified_at=None, role=\"pending\")\n    class _PostFactory(SQLAlchemyModelFactory):\n        class Meta:\n            model = Post\n            sqlalchemy_session = session\n        title  = Faker(\"sentence\")\n        author = SubFactory(_UserFactory)\n        # 3) RelatedFactory — create a related object AFTER self exists (one-to-many)\n        first_comment = RelatedFactory(\n            \"tests.factories.CommentFactory\", factory_related_name=\"post\",\n        )\n        # 4) Post-generation hook — accept extra kwargs, do work after build\n        @post_generation\n        def tags(self, create, extracted, **kwargs):\n            if not create:\n                return\n            for name in (extracted or []):\n                self.tags.append(Tag(name=name))\n    return _UserFactory, _PostFactory\n# Usage in a test\ndef test_post_with_admin_author(db):\n    UserFactory, PostFactory = make_factories(db)\n    post = PostFactory(author__admin=True,                   # trait via dunder\n                       tags=[\"python\", \"testing\"])           # post-generation kwarg\n    assert post.author.role == \"admin\"\n    assert {t.name for t in post.tags} == {\"python\", \"testing\"}\n# Decision rule:\n#   simple object construction              -> factory.Factory + Faker\n#   field derived from another field         -> LazyAttribute\n#   needs to be unique (DB constraint)       -> factory.Sequence\n#   FK to another model                       -> SubFactory\n#   related child rows (one-to-many)          -> RelatedFactory\n#   \"this user but as an admin\"               -> Trait under Params\n#   custom post-create logic                   -> @post_generation\n#\n# Anti-pattern: dictionaries hand-rolled in every test\n#   {\"username\": \"alice\", \"email\": \"alice@x.com\", \"role\": \"user\", \"verified\": True, ...}\n#   When the model gains a new required field, every test breaks. Centralize\n#   defaults in a factory; tests only specify what they care about.\nclass User: pass\nclass Post: pass\nclass Tag:\n    def __init__(self, name=None): self.name = name"
                  }
        ],
        tips: [
                  "Factories give you sane defaults — only override what matters for each specific test",
                  "LazyAttribute computes a value from other fields: `email = LazyAttribute(lambda o: f\"{o.name}@test.com\")`",
                  "SubFactory creates related objects automatically — no need to create dependencies by hand",
                  "factory.Sequence guarantees unique values — essential for fields with unique constraints"
        ],
        mistake: "Creating test data manually in each test: `{\"name\": \"test\", \"email\": \"test@test.com\", ...}`. When models change, every test breaks. Factories centralize test data construction.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "conftest",
        fn: "conftest.py",
        desc: "Share fixtures across test files without imports.",
        category: "Fixtures",
        subtitle: "pytest discovers conftest.py automatically at each directory level",
        signature: "# tests/conftest.py — no import needed in test files",
        descLong: "conftest.py is a special file pytest discovers automatically. Fixtures defined in conftest.py are available to all tests in the same directory and subdirectories — no import required. Use it to share fixtures, register plugins, and configure pytest.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of conftest.py — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# tests/conftest.py\nimport pytest\n@pytest.fixture\ndef sample_user():\n    return {\"email\": \"test@example.com\", \"name\": \"Test\"}\n# tests/test_signup.py\ndef test_signup_uses_user(sample_user):           # no import — pytest finds it\n    assert \"@\" in sample_user[\"email\"]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of conftest.py — common patterns you'll see in production.\n# APPROACH  - Combine conftest.py with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# Project layout\n# myapp/\n#   tests/\n#     conftest.py            shared fixtures (app, client, db)\n#     unit/\n#       conftest.py          extra unit-only fixtures\n#       test_models.py\n#     integration/\n#       conftest.py          extra integration-only fixtures\n#       test_api.py\n# tests/conftest.py\nimport pytest\nfrom myapp import create_app, db as _db\n@pytest.fixture(scope=\"session\")\ndef app():\n    a = create_app({\"TESTING\": True, \"DATABASE_URL\": \"sqlite:///:memory:\"})\n    with a.app_context():\n        _db.create_all()\n        yield a\n        _db.drop_all()\n@pytest.fixture\ndef client(app):\n    return app.test_client()\n@pytest.fixture\ndef db(app):\n    yield _db\n    _db.session.rollback()\n# tests/integration/conftest.py        scope-narrow fixture lives here\n@pytest.fixture\ndef auth_token():\n    return \"test-token-abc\"\n# tests/integration/test_api.py — sees BOTH conftests automatically\ndef test_list_users(client, auth_token):\n    r = client.get(\"/api/users\", headers={\"Authorization\": f\"Bearer {auth_token}\"})\n    assert r.status_code == 200"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of conftest.py — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# tests/conftest.py\nimport pytest\n# 1) Register custom markers — silences PytestUnknownMarkWarning + enables -m\ndef pytest_configure(config):\n    config.addinivalue_line(\"markers\", \"slow: takes > 1s; skipped by default\")\n    config.addinivalue_line(\"markers\", \"integration: hits a real DB / network\")\n# 2) Skip slow tests unless --runslow is passed\ndef pytest_addoption(parser):\n    parser.addoption(\"--runslow\", action=\"store_true\",\n                     help=\"run tests marked @pytest.mark.slow\")\ndef pytest_collection_modifyitems(config, items):\n    if config.getoption(\"--runslow\"):\n        return\n    skip_slow = pytest.mark.skip(reason=\"need --runslow option to run\")\n    for item in items:\n        if \"slow\" in item.keywords:\n            item.add_marker(skip_slow)\n# 3) Per-test setup that the test doesn't have to opt into — autouse + session DB\n@pytest.fixture(autouse=True)\ndef _reset_caches():\n    yield\n    cache_clear_all()\n# 4) Session-scoped expensive resource referenced by name from anywhere\n@pytest.fixture(scope=\"session\")\ndef docker_postgres():\n    container = start_postgres_container()\n    yield container.url\n    container.stop()\n# 5) pytest plugin loaded only for these tests\npytest_plugins = [\"pytest_asyncio\", \"pytest_httpx\"]\n# Use:\n#   $ pytest                          # fast tests only\n#   $ pytest --runslow                # include @slow tests\n#   $ pytest -m integration           # only integration tests\n#   $ pytest -m \"not integration\"     # exclude them\n# Decision rule:\n#   fixture used by 2+ test files          -> move to conftest.py at the common root\n#   fixture used by 1 file                  -> keep it in that file\n#   directory has unique fixtures            -> nested conftest.py inside that dir\n#   custom markers (slow, integration)        -> register in pytest_configure\n#   command-line flag for opt-in tests        -> pytest_addoption + collection_modifyitems\n#   plugin needed by these tests only         -> pytest_plugins = [...] in conftest\n#\n# Anti-pattern: importing fixtures from a test file\n#   from tests.test_helpers import db  # works, but pytest can't reason about it\n#   Fixtures belong in conftest.py — the discovery is the whole point.\ndef cache_clear_all(): pass\ndef start_postgres_container(): return type(\"C\", (), {\"url\": \"x\", \"stop\": lambda s: None})()"
                  }
        ],
        tips: [
                  "Fixtures in `tests/conftest.py` are available to ALL test files in `tests/` and subdirectories",
                  "Layer conftest.py files — shared fixtures at the top level, specific ones in subdirectories",
                  "No import statement needed — pytest injects conftest fixtures automatically by name",
                  "Use conftest.py for pytest plugins, hooks (`pytest_configure`), and custom marks too"
        ],
        mistake: "Defining fixtures inside individual test files and duplicating them. Move shared fixtures to conftest.py — it is discoverable without imports and scoped to the right directory.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "integration-tests",
        fn: "Integration test patterns",
        desc: "Test multiple components together — DB, HTTP, file system.",
        category: "Fixtures",
        subtitle: "TestClient for FastAPI, in-memory DB, temp directories",
        signature: "TestClient(app) | SQLite in-memory | tmp_path fixture",
        descLong: "Integration tests verify that components work together correctly. FastAPI's TestClient makes HTTP requests without starting a server. Use SQLite in-memory for DB tests. pytest's tmp_path fixture provides a temporary directory per test.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Integration test patterns — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom fastapi.testclient import TestClient\nfrom myapp.main import app\nclient = TestClient(app)\ndef test_health_endpoint():\n    r = client.get(\"/health\")\n    assert r.status_code == 200\n    assert r.json() == {\"status\": \"ok\"}\ndef test_writes_csv(tmp_path):                  # tmp_path: built-in pytest fixture\n    out = tmp_path / \"out.csv\"\n    write_report(out)\n    assert out.exists()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Integration test patterns — common patterns you'll see in production.\n# APPROACH  - Combine Integration test patterns with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport pytest\nfrom fastapi.testclient import TestClient\nfrom sqlalchemy import create_engine\nfrom sqlalchemy.orm import sessionmaker\nfrom myapp.main import app, get_db\nfrom myapp.db import Base\n@pytest.fixture\ndef test_db():\n    engine = create_engine(\"sqlite:///:memory:\",\n                           connect_args={\"check_same_thread\": False})\n    Base.metadata.create_all(engine)\n    Session = sessionmaker(bind=engine)\n    db = Session()\n    yield db\n    db.close()\n    Base.metadata.drop_all(engine)\n@pytest.fixture\ndef client(test_db):\n    def _override():\n        yield test_db\n    app.dependency_overrides[get_db] = _override\n    with TestClient(app) as c:\n        yield c\n    app.dependency_overrides.clear()           # ALWAYS reset after test\ndef test_create_user_persists(client):\n    r = client.post(\"/users/\", json={\"name\": \"Alice\", \"email\": \"a@x.com\"})\n    assert r.status_code == 201\n    body = r.json()\n    assert body[\"name\"] == \"Alice\"\n    assert \"id\" in body"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Integration test patterns — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport contextlib\nimport pytest\nfrom fastapi.testclient import TestClient\nfrom sqlalchemy import create_engine, event\nfrom sqlalchemy.pool import StaticPool\nfrom sqlalchemy.orm import sessionmaker\nfrom myapp.main import app, get_db\nfrom myapp.db import Base\n# 1) Session-scoped engine. StaticPool keeps ONE in-memory SQLite connection so\n#    schema changes survive across sessions in the test process.\n@pytest.fixture(scope=\"session\")\ndef engine():\n    e = create_engine(\n        \"sqlite:///:memory:\",\n        connect_args={\"check_same_thread\": False},\n        poolclass=StaticPool,\n    )\n    Base.metadata.create_all(e)\n    yield e\n    e.dispose()\n# 2) Function-scoped session — wrap each test in a SAVEPOINT, roll back at end.\n#    Tests stay isolated AND avoid recreating the schema 1000 times.\n@pytest.fixture\ndef db(engine):\n    connection  = engine.connect()\n    transaction = connection.begin()\n    Session = sessionmaker(bind=connection)\n    session = Session()\n    nested = connection.begin_nested()             # SAVEPOINT\n    @event.listens_for(session, \"after_transaction_end\")\n    def restart_savepoint(s, t):\n        nonlocal nested\n        if t.nested and not t._parent.nested:\n            nested = connection.begin_nested()\n    yield session\n    session.close()\n    transaction.rollback()                          # the magic line\n    connection.close()\n# 3) Override the FastAPI dependency exactly once, in a context that auto-restores\n@pytest.fixture\ndef client(db):\n    app.dependency_overrides[get_db] = lambda: db\n    with TestClient(app) as c:\n        yield c\n    app.dependency_overrides.clear()\n# 4) Parametrize the backend — same tests run on SQLite AND on a real Postgres\n#    container in CI, with no test code changes.\n@pytest.fixture(scope=\"session\", params=[\n    pytest.param(\"sqlite\",   id=\"sqlite\"),\n    pytest.param(\"postgres\", id=\"pg\", marks=pytest.mark.integration),\n])\ndef db_url(request):\n    return {\"sqlite\":   \"sqlite:///:memory:\",\n            \"postgres\": \"postgresql://test/test\"}[request.param]\n# Decision rule:\n#   pure HTTP endpoint, no DB             -> TestClient(app), no fixture overrides\n#   HTTP + DB                              -> in-memory SQLite + dependency_overrides\n#   need cross-test isolation, fast        -> session engine + per-test transaction rollback\n#   schema migrations matter                -> Postgres in Docker (testcontainers / pytest-docker)\n#   files involved                          -> tmp_path; never a hardcoded path\n#   external HTTP service                    -> respx / responses mock, never real network\n#\n# Anti-pattern: TestClient.app calling the production database\n#   Tests pollute real data; CI is non-deterministic; running locally is unsafe.\n#   Always override get_db (or whatever dependency hits external state).\ndef write_report(_): pass"
                  }
        ],
        tips: [
                  "TestClient does not start a real server — it calls the ASGI app directly, very fast",
                  "Override dependencies with `app.dependency_overrides[fn] = override` — clear after test",
                  "SQLite in-memory is fast enough for most integration tests and requires no setup",
                  "tmp_path is automatically cleaned up — never use hardcoded paths in tests",
                  "For fast cross-test DB isolation use a session-scoped engine + per-test transaction that rolls back at teardown — much faster than re-creating the schema per test",
                  "When migrations matter, run Postgres in Docker via `testcontainers` or `pytest-docker`; mock outbound HTTP with `respx`/`responses` and never hit the real network in CI"
        ],
        mistake: "Using the production database in tests. Tests must be isolated — use a test database, in-memory SQLite, or transaction rollback so tests do not affect each other or real data.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
    ],
  },

  // ── Section 3: Mocking ─────────────────────────────────────────
  {
    id: "mocking",
    title: "Mocking",
    entries: [
      {
        id: "patch",
        fn: "unittest.mock.patch()",
        desc: "Temporarily replace an object with a mock for the duration of a test.",
        category: "Mocking",
        subtitle: "Patch where the name is USED — not where it is defined",
        signature: "@patch(\"myapp.module.ClassName\") | with patch(...) as mock:",
        descLong: "patch() replaces an object in a module with a MagicMock for the duration of the test, then restores the original. The critical rule: patch the object where it is looked up (the importing module), not where it is defined.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of unittest.mock.patch() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom unittest.mock import patch\nimport pytest\ndef test_api_failure_raises():\n    with patch(\"requests.get\") as mock_get:\n        mock_get.side_effect = ConnectionError(\"API down\")\n        with pytest.raises(ConnectionError):\n            fetch_user_data(user_id=1)\n    # Outside the with-block, requests.get is the real function again"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of unittest.mock.patch() — common patterns you'll see in production.\n# APPROACH  - Combine unittest.mock.patch() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom unittest.mock import patch\n# myapp/service.py\n#   from requests import get      # <- 'get' now lives in myapp.service\n#\n#   def fetch_user(uid):\n#       return get(f\"/users/{uid}\").json()\n# WRONG — patches the original module; service.get already imported the real one\n@patch(\"requests.get\")\ndef test_fetch_user_wrong(mock_get):\n    mock_get.return_value.json.return_value = {\"id\": 1}\n    # Calls real requests.get because myapp.service.get is the bound name\n# RIGHT — patch the name where it's looked up\n@patch(\"myapp.service.get\")\ndef test_fetch_user_right(mock_get):\n    mock_get.return_value.json.return_value = {\"id\": 1, \"name\": \"Alice\"}\n    from myapp.service import fetch_user\n    assert fetch_user(1)[\"name\"] == \"Alice\"\n    mock_get.assert_called_once_with(\"/users/1\")\n# Stacked decorators: APPLIED bottom-up, INJECTED top-down (reverse-application order)\n@patch(\"myapp.service.get\")          # outer (applied last) -> first parameter\n@patch(\"myapp.service.cache\")        # inner (applied first) -> second parameter\ndef test_two_patches(mock_cache, mock_get):\n    ..."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of unittest.mock.patch() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport os\nfrom unittest.mock import patch, ANY\n# 1) patch.object — patch a single method on a class or instance (precise scope)\nclass S3Client:\n    def upload(self, key, body): ...\ndef test_upload_called():\n    with patch.object(S3Client, \"upload\", return_value=\"ok\") as up:\n        S3Client().upload(\"k\", b\"x\")\n        up.assert_called_once_with(\"k\", b\"x\")\n# 2) patch.dict — temporarily set env vars / mutate a dict and restore after\ndef test_uses_test_database():\n    with patch.dict(os.environ, {\"DATABASE_URL\": \"sqlite:///:memory:\"}, clear=False):\n        from myapp.config import database_url\n        assert database_url() == \"sqlite:///:memory:\"\n# 3) autospec=True — the mock matches the REAL signature; typos / wrong arity fail\n@patch(\"myapp.service.send_email\", autospec=True)\ndef test_typed_call(mock_send):\n    from myapp.service import notify\n    notify(\"alice@x.com\", \"Welcome\")\n    mock_send.assert_called_once_with(\"alice@x.com\", \"Welcome\")\n    # mock_send(\"a\", \"b\", \"c\") would raise TypeError — wrong arity\n# 4) Prefer DI when you can — patch is a hammer when the dependency is hidden;\n#    accept it as an argument and the mock is just a value, no patching needed.\ndef fetch_user(uid, *, http=None):                  # http is the seam\n    http = http or default_http_client()\n    return http.get(f\"/users/{uid}\").json()\ndef test_fetch_user_di():\n    fake = type(\"F\", (), {\"get\": lambda self, _: type(\"R\", (), {\"json\": lambda s: {\"id\": 1}})()})()\n    assert fetch_user(1, http=fake)[\"id\"] == 1      # no patch at all\n# Decision rule:\n#   constructor injection available           -> pass a fake; don't patch\n#   third-party lib imported into your module  -> @patch(\"yourmodule.<imported_name>\", autospec=True)\n#   method on a class                           -> patch.object(Cls, \"method\")\n#   environment variable / dict-like          -> patch.dict(os.environ, {...})\n#   need wide-spread mock for many tests       -> @pytest.fixture(autouse=False) wrapping a patch\n#   typo-proof signatures                       -> autospec=True (or spec_set=)\n#\n# Anti-pattern: patching the place a function is DEFINED instead of USED\n#   patch(\"requests.get\") doesn't replace what your code already imported as\n#   'get'. Always patch the name in the calling module: \"myapp.service.get\".\ndef fetch_user_data(uid): import requests; return requests.get(f\"/u/{uid}\").json()\ndef default_http_client(): import requests; return requests"
                  }
        ],
        tips: [
                  "Patch where the name is USED: `patch(\"myapp.views.requests.get\")` not `patch(\"requests.get\")`",
                  "Stacked `@patch` decorators are applied bottom-up but injected top-down into the function args",
                  "Use `patch.object(instance, \"method\")` to patch a method on a specific object",
                  "Use `patch.dict(os.environ, {\"KEY\": \"value\"})` to temporarily set environment variables",
                  "Pass `autospec=True` (or `spec_set=`) so the mock's signature matches the real callable — typos and wrong-arg calls then fail at test time instead of silently passing"
        ],
        mistake: "Patching the wrong location. `from requests import get` in your module means `get` is a local name. You must patch `\"myapp.module.get\"`, not `\"requests.get\"`.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "responses",
        fn: "responses",
        desc: "Mock HTTP requests made by the requests library in tests.",
        category: "Mocking",
        subtitle: "Intercept requests library calls — no code changes needed",
        signature: "@responses.activate | responses.add(GET, url, json={...})",
        descLong: "The responses library intercepts HTTP calls made by the requests library and returns fake responses without hitting real servers. No changes to application code required. Use for unit testing code that makes HTTP calls — cleaner and more reliable than manual mocking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of responses — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport responses\nimport requests\n@responses.activate\ndef test_get_user():\n    responses.add(\n        responses.GET,\n        \"https://api.example.com/users/1\",\n        json={\"id\": 1, \"name\": \"Alice\"},\n        status=200,\n    )\n    r = requests.get(\"https://api.example.com/users/1\")\n    assert r.json()[\"name\"] == \"Alice\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of responses — common patterns you'll see in production.\n# APPROACH  - Combine responses with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport json\nimport pytest\nimport responses\nfrom responses import matchers\n@pytest.fixture\ndef http():\n    with responses.RequestsMock(assert_all_requests_are_fired=True) as rsps:\n        yield rsps                                          # auto-cleans + verifies\ndef test_creates_user_with_payload(http):\n    http.add(\n        responses.POST,\n        \"https://api.example.com/users\",\n        json={\"id\": 99, \"name\": \"Bob\"},\n        status=201,\n        match=[matchers.json_params_matcher({\"name\": \"Bob\"})],   # only fires for matching body\n    )\n    import requests\n    r = requests.post(\"https://api.example.com/users\", json={\"name\": \"Bob\"})\n    assert r.status_code == 201\n    assert len(http.calls) == 1\n    # Inspect the request that was sent\n    sent = json.loads(http.calls[0].request.body)\n    assert sent == {\"name\": \"Bob\"}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of responses — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport responses\nfrom responses import matchers\n@responses.activate\ndef test_retries_then_succeeds():\n    # Same URL added twice — first call gets the first registration, etc.\n    responses.add(responses.GET, \"https://api.example.com/x\", status=503)   # call 1\n    responses.add(responses.GET, \"https://api.example.com/x\",               # call 2\n                  json={\"ok\": True}, status=200)\n    import requests\n    r1 = requests.get(\"https://api.example.com/x\"); assert r1.status_code == 503\n    r2 = requests.get(\"https://api.example.com/x\"); assert r2.json() == {\"ok\": True}\n# 1) Block ALL unexpected requests — fail-loud rather than hit real network\n@responses.activate(assert_all_requests_are_fired=True)\ndef test_no_unexpected_calls():\n    responses.add(responses.GET, \"https://api.example.com/v1/health\",\n                  json={\"ok\": True})\n    import requests\n    requests.get(\"https://api.example.com/v1/health\")\n    # Any other URL hit -> ConnectionError(\"not registered\")\n# 2) Header / query-string matching for endpoints that vary by params\nresponses.add(\n    responses.GET, \"https://api.example.com/search\",\n    json={\"results\": []},\n    match=[matchers.query_param_matcher({\"q\": \"py\", \"page\": \"1\"})],\n)\n# 3) Library choice — library MUST match the HTTP client your code uses\n#    requests       -> responses\n#    httpx (sync)    -> respx\n#    httpx (async)   -> respx (pytest-httpx is an alternative)\n#    aiohttp          -> aioresponses\n#    socket-level all -> httpretty (heavier, slower)\n# Decision rule:\n#   code uses requests, you control it    -> responses\n#   code uses httpx                        -> respx\n#   need to assert request body / headers   -> responses.matchers.* (or respx equivalents)\n#   code calls multiple HTTP libs           -> httpretty (socket-level)\n#   third-party lib makes HTTP calls         -> mock at THEIR boundary (their client object)\n#\n# Anti-pattern: not failing on unexpected URLs\n#   Without assert_all_requests_are_fired (or pytest-socket blocking), a test\n#   silently calls the real internet, passes locally, and breaks in CI behind a\n#   proxy. Block real network access in your CI test config."
                  }
        ],
        tips: [
                  "responses only works with the requests library — use respx for httpx",
                  "Check `len(responses.calls)` to verify the right number of HTTP calls were made",
                  "Use `responses.add(match_querystring=True)` to match specific query parameters",
                  "responses.add() can take match= with matchers like responses.matchers.json_params_matcher()",
                  "Pair the mock with `assert_all_requests_are_fired` (or `pytest-socket` to block real connections) — otherwise an unexpected URL silently calls the real internet, passes locally, and breaks in CI behind a proxy"
        ],
        mistake: "Using unittest.mock.patch to mock requests.get directly. It requires knowing the internal call path and breaks if the library is refactored. Use responses — it intercepts at a higher level.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "httpretty",
        fn: "httpretty",
        desc: "Mock HTTP requests at the socket level — works with any HTTP library.",
        category: "Mocking",
        subtitle: "Socket-level interception — library-agnostic HTTP mocking",
        signature: "@httpretty.activate | httpretty.register_uri(GET, url, body=...)",
        descLong: "httpretty mocks HTTP requests at the socket level, intercepting all HTTP libraries (requests, urllib, httpx, etc.). More flexible than responses but slightly heavier. Use when you need to mock multiple HTTP libraries or have unusual HTTP scenarios.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of httpretty — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport httpretty, requests\n@httpretty.activate\ndef test_get_user():\n    httpretty.register_uri(\n        httpretty.GET,\n        \"https://api.example.com/users/1\",\n        body='{\"id\": 1, \"name\": \"Alice\"}',\n        status=200,\n    )\n    r = requests.get(\"https://api.example.com/users/1\")\n    assert r.json()[\"name\"] == \"Alice\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of httpretty — common patterns you'll see in production.\n# APPROACH  - Combine httpretty with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport httpretty\nimport urllib.request           # works with urllib too — that's the point\nimport requests\ndef test_works_for_two_libraries():\n    with httpretty.enabled():\n        httpretty.register_uri(\n            httpretty.GET,\n            \"https://api.example.com/data\",\n            body='[1, 2, 3]',\n            status=200,\n            adding_headers={\"X-RateLimit-Remaining\": \"42\"},\n        )\n        # requests library\n        r = requests.get(\"https://api.example.com/data\")\n        assert r.headers[\"X-RateLimit-Remaining\"] == \"42\"\n        # urllib also intercepted at socket layer\n        with urllib.request.urlopen(\"https://api.example.com/data\") as r2:\n            body = r2.read()\n        assert body == b\"[1, 2, 3]\"\n        # Inspect the LAST request httpretty saw\n        last = httpretty.last_request()\n        assert last.method == \"GET\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of httpretty — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport httpretty\n# 1) httpretty operates at the SOCKET level. It mocks anything that goes through\n#    Python's socket module — requests, urllib, urllib3.\n#    It does NOT mock httpx (uses its own transport) or aiohttp (asyncio sockets).\n#    For those: respx (httpx) and aioresponses (aiohttp).\n# 2) Streaming responses — httpretty handles chunked bodies via a callback\ndef stream_body(request, uri, response_headers):\n    return [200, response_headers, \"chunk1\\nchunk2\\nchunk3\"]\nwith httpretty.enabled():\n    httpretty.register_uri(\n        httpretty.GET, \"https://api.example.com/stream\",\n        body=stream_body,\n    )\n# 3) Inspect ALL requests made during a test (debug a failing assertion)\nwith httpretty.enabled(allow_net_connect=False):       # block real network\n    # ... run code under test ...\n    for req in httpretty.latest_requests():\n        print(req.method, req.url, dict(req.querystring))\n# 4) Don't mix httpretty with another HTTP mocker (responses, respx) in the same\n#    test process — interceptor stacking is undefined and breaks intermittently.\n# Decision rule:\n#   code uses requests / urllib                -> responses (lighter, faster, type-safe)\n#   code uses httpx                             -> respx (httpx-native transport)\n#   code uses aiohttp                            -> aioresponses\n#   code uses MULTIPLE HTTP libraries             -> httpretty (socket-level catches all)\n#   need to inspect raw bytes / headers           -> httpretty's last_request / latest_requests\n#   need to BLOCK real network during tests       -> allow_net_connect=False (httpretty) or\n#                                                    pytest-socket plugin\n#\n# Anti-pattern: assuming httpretty mocks httpx or aiohttp\n#   Both bypass the socket layer for performance. The mock seems to install but\n#   no requests are intercepted. Use respx / aioresponses for those clients."
                  }
        ],
        tips: [
                  "httpretty works with any HTTP library (requests, urllib, httpx) — responses is requests-only",
                  "httpretty.last_request() accesses details of the last mocked request",
                  "Use body= for string responses or responses= for httpretty.Response objects",
                  "httpretty.reset() clears all registered URIs — useful between tests"
        ],
        mistake: "Mixing httpretty with responses in the same test — they can conflict. Choose one and stick with it for each test.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "magicmock",
        fn: "MagicMock",
        desc: "A flexible mock object that auto-creates attributes and tracks calls.",
        category: "Mocking",
        subtitle: "Set return values, track calls, assert how a mock was used",
        signature: "mock.return_value = x | mock.side_effect = [a,b,exc] | mock.assert_called_once_with()",
        descLong: "MagicMock auto-creates any attribute or method you access on it. Set return_value for what a call should return. Set side_effect to a list (yields each in turn) or an exception class (raises it). spec= constrains the mock to a real class's interface.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of MagicMock — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom unittest.mock import MagicMock\nemail = MagicMock()\nemail.send.return_value = True\nsend_welcome(email, \"alice@example.com\")\nemail.send.assert_called_once_with(\"alice@example.com\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of MagicMock — common patterns you'll see in production.\n# APPROACH  - Combine MagicMock with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom unittest.mock import MagicMock, AsyncMock\n# 1) return_value — what calls return\nmock = MagicMock()\nmock.do_thing.return_value = 42\n# 2) side_effect = list — yields one value per call (great for retry tests)\nmock.fetch.side_effect = [\n    ConnectionError(\"timeout\"),     # 1st call: raises\n    ConnectionError(\"timeout\"),     # 2nd call: raises\n    {\"status\": \"ok\"},                # 3rd call: returns\n]\n# 3) side_effect = exception — every call raises\nmock.parse.side_effect = ValueError(\"bad input\")\n# 4) Call inspection\nmock(1, 2); mock(3, 4)\nprint(mock.call_count)               # 2\nprint(mock.call_args)                # call(3, 4)  — most recent\nprint(mock.call_args_list)           # [call(1, 2), call(3, 4)]\n# 5) AsyncMock for awaitable code paths\nafetch = AsyncMock(return_value={\"data\": [1, 2, 3]})\n# in an async test:\n# result = await afetch()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of MagicMock — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom unittest.mock import MagicMock, AsyncMock, ANY, call\nclass Database:\n    def get_user(self, uid): ...\n    def save(self, user):     ...\n# 1) spec_set= — strictest. Mock CAN'T grow new attributes; typos die at test time.\nmock_db = MagicMock(spec_set=Database)\nmock_db.get_user(1)              # OK\n# mock_db.get_usr(1)             # AttributeError — caught immediately\n# mock_db.new_method(1)          # AttributeError — would silently work without spec_set\n# 2) configure_mock — set many attributes/return_values at once\nmock_db.configure_mock(**{\n    \"get_user.return_value\": {\"id\": 1, \"name\": \"Alice\"},\n    \"save.return_value\":     None,\n})\n# 3) ANY — match arguments you don't care to assert exactly\nmock_db.save(MagicMock(id=1))\nmock_db.save.assert_called_once_with(ANY)        # any object passed -> pass\n# 4) Multi-call assertions — call_args_list with the call helper\nmock = MagicMock()\nmock(1); mock(2); mock(3)\nassert mock.call_args_list == [call(1), call(2), call(3)]\nmock.assert_has_calls([call(1), call(3)])        # subset, in order\nmock.assert_has_calls([call(2), call(1)], any_order=True)\n# 5) reset_mock — clear call history WITHOUT clearing return_value/side_effect\nmock.reset_mock()\nmock.assert_not_called()\n# 6) Async — await targets must use AsyncMock; assert_awaited_*  for awaits\nafetch = AsyncMock(return_value=42)\n# await afetch(7)\nafetch.assert_awaited_once_with(7)               # different from assert_called_*\n# Decision rule:\n#   verify a single call, exact args      -> assert_called_once_with(args)\n#   match anything for one arg              -> ANY\n#   stub a method                            -> mock.method.return_value = X\n#   raise on call                            -> mock.method.side_effect = ExcClass\n#   sequence of returns                      -> side_effect = [r1, r2, r3]\n#   typo-safe mock                           -> MagicMock(spec_set=RealClass)\n#   async function                           -> AsyncMock + assert_awaited*\n#\n# Anti-pattern: assert_called() instead of assert_called_once_with()\n#   assert_called() passes for ANY number of calls with ANY args. The test goes\n#   green even when the mocked code is fundamentally broken. Always assert\n#   COUNT and ARGS together.\ndef send_welcome(email, addr): email.send(addr)"
                  }
        ],
        tips: [
                  "`assert_called_once_with(args)` is stricter than `assert_called_once()` — always prefer it",
                  "`MagicMock(spec=RealClass)` is best practice — catches typos and wrong method names at test time",
                  "`side_effect` list is consumed one per call — useful for testing retry logic",
                  "Use `AsyncMock` for `async def` functions — regular `MagicMock` is not awaitable"
        ],
        mistake: "Using `mock.assert_called()` instead of `mock.assert_called_once_with(expected_args)`. The latter verifies both that it was called exactly once AND with the right arguments.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "mocker",
        fn: "mocker fixture",
        desc: "pytest-mock's mocker fixture — cleaner mocking without decorators.",
        category: "Mocking",
        subtitle: "Automatically undone after each test — no context managers needed",
        signature: "def test_fn(mocker): mock = mocker.patch(\"module.fn\")",
        descLong: "pytest-mock provides the mocker fixture — a thin wrapper around unittest.mock that integrates with pytest's fixture lifecycle. Patches are automatically undone after each test. No decorator or context manager needed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of mocker fixture — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# pip install pytest-mock\ndef test_fetch_user(mocker):\n    mock_get = mocker.patch(\"myapp.service.requests.get\")\n    mock_get.return_value.json.return_value = {\"id\": 1, \"name\": \"Alice\"}\n    from myapp.service import fetch_user\n    assert fetch_user(1)[\"name\"] == \"Alice\"\n    mock_get.assert_called_once()\n# After this test, requests.get is automatically restored — no @patch needed."
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of mocker fixture — common patterns you'll see in production.\n# APPROACH  - Combine mocker fixture with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\ndef test_patch_object(mocker):\n    mock = mocker.patch.object(Calculator, \"add\", return_value=100)\n    assert Calculator().add(2, 3) == 100\n    mock.assert_called_once()\ndef test_spy(mocker):\n    # spy WRAPS the real function — assertions on calls AND real return value\n    spy = mocker.spy(Calculator, \"add\")\n    assert Calculator().add(2, 3) == 5            # real result\n    spy.assert_called_once()                       # but we ALSO see the call\ndef test_any(mocker):\n    send = mocker.patch(\"myapp.send_email\")\n    trigger_signup(\"alice@example.com\")\n    send.assert_called_once_with(mocker.ANY, subject=\"Welcome!\")\ndef test_make_mock(mocker):\n    db = mocker.MagicMock(spec_set=Database)\n    db.get_user.return_value = {\"id\": 1}\n    assert fetch_with_db(db)[\"id\"] == 1"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of mocker fixture — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport pytest\n# 1) Reusable mock fixtures — encapsulate setup the whole suite needs\n@pytest.fixture\ndef stripe(mocker):\n    \"\"\"A typo-proof Stripe client mock with sensible defaults.\"\"\"\n    m = mocker.patch(\"myapp.payments.stripe_client\", autospec=True)\n    m.charge.return_value = {\"id\": \"ch_123\", \"status\": \"succeeded\"}\n    return m\ndef test_purchase_charges_stripe(stripe):\n    purchase(amount=100, token=\"tok_x\")\n    stripe.charge.assert_called_once_with(100, \"tok_x\")\n# 2) Override per-test — fixture provides defaults, test overrides what matters\ndef test_handles_card_decline(stripe):\n    stripe.charge.side_effect = StripeError(\"card_declined\")\n    with pytest.raises(PaymentFailed):\n        purchase(amount=100, token=\"tok_bad\")\n# 3) Spy vs patch — pick by goal\n#    - patch: replace behavior, assert calls\n#    - spy:   keep real behavior, ALSO assert calls (use to verify side-effects\n#             without breaking the function under test)\ndef test_cache_hit(mocker):\n    spy = mocker.spy(myapp.cache, \"get\")\n    do_lookup(\"k\")\n    do_lookup(\"k\")\n    assert spy.call_count == 2\n    # Real cache still ran; we just confirmed it was hit.\n# 4) mocker.resetall / mocker.stopall — needed only when wiring multiple\n#    parallel mock contexts inside one test (rare). Normally pytest-mock cleans up.\n# Decision rule:\n#   pytest project, simple replace          -> mocker.patch (no @patch decorator)\n#   precise method on a class                -> mocker.patch.object\n#   keep real behavior, observe calls        -> mocker.spy\n#   build a typo-safe fake collaborator       -> mocker.MagicMock(spec_set=Real)\n#   project-wide mocked client (Stripe, etc.) -> wrap mocker.patch in a fixture\n#   need to mock during fixture setup          -> mocker is fixture-friendly; @patch isn't\n#\n# Anti-pattern: stacking @patch decorators inside pytest tests\n#   def test(...):\n#     with patch(\"a\"), patch(\"b\"), patch(\"c\"): ...\n#   Reaches three indentation levels deep. mocker.patch flattens it: each call\n#   is one statement, all auto-cleaned.\nclass Calculator:\n    def add(self, a, b): return a + b\nclass MyService:\n    def __init__(self, c): self.c = c\n    def run(self): return self.c.add(40, 60)\nclass Database: pass\ndef fetch_with_db(db): return db.get_user(1)\ndef trigger_signup(_): pass\nclass StripeError(Exception): pass\nclass PaymentFailed(Exception): pass\ndef purchase(amount, token): pass\nclass _M:\n    def get(self, _): return None\nclass myapp:\n    cache = _M()\ndef do_lookup(_): myapp.cache.get(_)"
                  }
        ],
        tips: [
                  "`mocker.patch()` is automatically undone after the test — no need for context managers or decorators",
                  "`mocker.spy()` wraps the real function — lets you assert on calls while still running real logic",
                  "`mocker.ANY` matches any value in assert_called_with — useful when you do not care about one argument",
                  "Install with `pip install pytest-mock` — it is the standard pytest mocking plugin"
        ],
        mistake: "Using raw `unittest.mock.patch` as a decorator inside pytest when `mocker` is available. Decorators are not automatically undone — `mocker` handles cleanup via the fixture lifecycle.",
        shorthand: {
          verbose: "import requests\ndef test_fetch_user(mocker):\nmock_get = mocker.patch(\"myapp.service.requests.get\")\nmock_get.return_value.json.return_value = {\"id\": 1, \"name\": \"Alice\"}",
          concise: ")",
        },
      },
      {
        id: "pytest-asyncio",
        fn: "pytest-asyncio",
        desc: "Test async functions with pytest.",
        category: "Mocking",
        subtitle: "@pytest.mark.asyncio or asyncio_mode=\"auto\" in pytest.ini",
        signature: "@pytest.mark.asyncio async def test_fn(): await ...",
        descLong: "pytest-asyncio allows pytest to run async test functions. Either mark each test with @pytest.mark.asyncio or set asyncio_mode=\"auto\" in pytest.ini to apply globally. Also provides async fixtures. Install: pip install pytest-asyncio.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pytest-asyncio — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# pip install pytest-asyncio\nimport pytest\nasync def fetch_user(uid):\n    return {\"id\": uid, \"name\": \"Alice\"}\n@pytest.mark.asyncio\nasync def test_fetch_user():\n    result = await fetch_user(1)\n    assert result[\"name\"] == \"Alice\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pytest-asyncio — common patterns you'll see in production.\n# APPROACH  - Combine pytest-asyncio with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# pyproject.toml — apply mark to every async test automatically\n# [tool.pytest.ini_options]\n# asyncio_mode = \"auto\"\nimport pytest\nimport pytest_asyncio\nimport httpx\nfrom unittest.mock import AsyncMock\nfrom myapp.main import app\n# Async fixtures use the async-aware decorator\n@pytest_asyncio.fixture\nasync def client():\n    transport = httpx.ASGITransport(app=app)\n    async with httpx.AsyncClient(transport=transport, base_url=\"http://test\") as c:\n        yield c\nasync def test_get_user(client):                      # no @pytest.mark.asyncio (auto mode)\n    r = await client.get(\"/users/1\")\n    assert r.status_code == 200\nasync def test_raises_async():\n    with pytest.raises(ValueError):\n        await failing_async_function()\n# Mock async functions with AsyncMock — NOT MagicMock\nasync def test_async_mock(mocker):\n    mocker.patch(\"myapp.service.fetch_data\",\n                 new=AsyncMock(return_value={\"id\": 1}))\n    from myapp.service import wrapper\n    assert (await wrapper())[\"id\"] == 1"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pytest-asyncio — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# pyproject.toml\n# [tool.pytest.ini_options]\n# asyncio_mode = \"auto\"\n# asyncio_default_fixture_loop_scope = \"session\"     # one loop for all tests in a session\nimport asyncio\nimport pytest\nimport pytest_asyncio\nimport httpx\n# 1) FastAPI without spinning up a real server: ASGITransport drives the app in-process\n@pytest_asyncio.fixture(scope=\"session\")\nasync def async_client():\n    from myapp.main import app\n    transport = httpx.ASGITransport(app=app)\n    async with httpx.AsyncClient(transport=transport, base_url=\"http://test\") as c:\n        yield c\n# 2) Async fakes for stateful collaborators (Redis, queues) — keep tests fast + offline\n@pytest_asyncio.fixture\nasync def redis():\n    import fakeredis.aioredis\n    r = fakeredis.aioredis.FakeRedis()\n    yield r\n    await r.aclose()\n# 3) Deadline / timeout pattern — async hangs are silent in unit tests\nasync def test_request_completes(async_client):\n    async with asyncio.timeout(2.0):                  # 3.11+; pytest-asyncio also has @pytest.mark.timeout\n        r = await async_client.get(\"/slow\")\n        assert r.status_code == 200\n# 4) Concurrent assertions — gather lets you exercise concurrency in tests\nasync def test_concurrent_creates(async_client):\n    tasks = [async_client.post(\"/users\", json={\"i\": i}) for i in range(10)]\n    responses = await asyncio.gather(*tasks)\n    assert all(r.status_code == 201 for r in responses)\n# 5) Mocking awaitable methods on a class — AsyncMock everywhere\nasync def test_async_method_mock(mocker):\n    mock_db = mocker.MagicMock()\n    mock_db.get_user = mocker.AsyncMock(return_value={\"id\": 1})\n    user = await mock_db.get_user(1)\n    mock_db.get_user.assert_awaited_once_with(1)      # NOT assert_called_*\n# Decision rule:\n#   testing async function                    -> @pytest.mark.asyncio (or asyncio_mode=auto)\n#   FastAPI app                                -> httpx.AsyncClient + ASGITransport(app=app)\n#   third-party async client (redis, kafka)    -> async fakes (fakeredis.aioredis, etc.)\n#   need to test concurrency                    -> asyncio.gather inside the test\n#   tests hanging / flaky                       -> asyncio.timeout or @pytest.mark.timeout\n#   mocking an async function                    -> AsyncMock; assert_awaited_* not assert_called_*\n#\n# Anti-pattern: MagicMock for an async function\n#   mock = MagicMock()\n#   await mock()    # TypeError: object MagicMock can't be used in 'await' expression\n#   Always AsyncMock for code paths that await.\nasync def failing_async_function():\n    raise ValueError(\"bad\")"
                  }
        ],
        tips: [
                  "Set asyncio_mode = \"auto\" in pytest.ini to avoid @pytest.mark.asyncio on every test",
                  "Use AsyncMock not MagicMock when mocking async functions — MagicMock does not support await",
                  "httpx.AsyncClient with app= lets you test FastAPI without starting a real server",
                  "Async fixtures must use @pytest_asyncio.fixture, not @pytest.fixture"
        ],
        mistake: "Using MagicMock for an async function. `mock = MagicMock(); await mock()` raises TypeError. Use `AsyncMock` for anything that will be awaited.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
    ],
  },

  // ── Section 4: Advanced Testing ─────────────────────────────────────────
  {
    id: "advanced",
    title: "Advanced Testing",
    entries: [
      {
        id: "coverage",
        fn: "pytest coverage",
        desc: "Measure which lines of code are exercised by your tests.",
        category: "Advanced",
        subtitle: "pytest-cov — run coverage alongside tests, fail below a threshold",
        signature: "pytest --cov=myapp --cov-report=term-missing --cov-fail-under=80",
        descLong: "pytest-cov integrates coverage.py with pytest. It measures which lines are executed during tests and reports uncovered lines. Use --cov-fail-under= in CI to prevent coverage regressions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pytest coverage — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# pip install pytest-cov\n# $ pytest --cov=myapp --cov-report=term-missing\n#\n# Name              Stmts   Miss  Cover   Missing\n# -------------------------------------------------\n# myapp/auth.py        45      3   93%    23, 41-42\n# myapp/utils.py       18      0  100%"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pytest coverage — common patterns you'll see in production.\n# APPROACH  - Combine pytest coverage with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# Run:\n#   $ pytest --cov=myapp --cov-branch --cov-report=html --cov-fail-under=80\n#\n# --cov-branch        also tracks if/else branch decisions, not just lines\n# --cov-report=html   writes htmlcov/index.html — line-by-line view\n# --cov-fail-under=80 exits non-zero if total coverage < 80% (CI gate)\n# Per-line exclusion\ndef debug_dump():               # pragma: no cover\n    print(\"dev-only path\")\nfrom typing import TYPE_CHECKING\nif TYPE_CHECKING:               # pragma: no cover\n    from .types import Heavy   # type-checker only — never executed\n# Coverage works with parametrize too — each case marks the lines it hit\nimport pytest\n@pytest.mark.parametrize(\"a,b,expected\", [(1, 2, 3), (0, 0, 0)])\ndef test_add(a, b, expected):\n    assert a + b == expected"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pytest coverage — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# 1) Parallel test runs — combine partial coverage files at the end\n#    $ COVERAGE_PROCESS_START=.coveragerc pytest -n 4 --cov=myapp --cov-append\n#    $ coverage combine\n#    $ coverage report --fail-under=80\n# 2) Diff coverage — only require coverage on lines you JUST changed.\n#    Stops the \"100% coverage gate\" arms race that produces useless tests.\n#    $ pip install diff-cover\n#    $ pytest --cov=myapp --cov-report=xml\n#    $ diff-cover coverage.xml --compare-branch=origin/main --fail-under=90\n# 3) Mutation testing — coverage tells you what RAN; mutmut tells you what's\n#    actually TESTED. If a mutation survives, your tests don't constrain that line.\n#    $ pip install mutmut\n#    $ mutmut run --paths-to-mutate=myapp/\n#    $ mutmut results\n# 4) pyproject.toml — config in source control, not in pytest invocations\n# [tool.coverage.run]\n# source        = [\"myapp\"]\n# branch        = true\n# parallel      = true\n# omit          = [\"*/migrations/*\", \"*/tests/*\", \"*/__init__.py\"]\n#\n# [tool.coverage.report]\n# fail_under   = 80\n# show_missing = true\n# precision    = 1\n# exclude_lines = [\n#     \"pragma: no cover\",\n#     \"raise NotImplementedError\",\n#     \"if TYPE_CHECKING:\",\n#     \"if __name__ == .__main__.:\",\n# ]\n#\n# [tool.pytest.ini_options]\n# addopts = \"--cov=myapp --cov-branch --cov-report=term-missing --cov-fail-under=80\"\n# Decision rule:\n#   small repo, single test runner       -> --cov + --cov-report=term-missing\n#   want CI to gate on regressions        -> --cov-fail-under=N\n#   want to see if/else paths              -> --cov-branch (always worth it)\n#   parallel test runners                  -> --cov-append + coverage combine\n#   PRs add code without tests              -> diff-cover with branch comparison\n#   \"100% coverage but bugs slip through\"  -> mutation testing (mutmut / cosmic-ray)\n#   browse uncovered lines locally          -> --cov-report=html\n#\n# Anti-pattern: chasing 100% coverage on getters/setters\n#   You hit the number; tests are trivial; bugs still slip through. Branch\n#   coverage + diff coverage on changed lines is a better signal than total %."
                  }
        ],
        tips: [
                  "Add `--cov-fail-under=80` to CI to create a coverage gate — prevents regressions silently slipping in",
                  "Branch coverage (`--cov-branch`) is more thorough — catches untested if/else paths",
                  "Aim for meaningful coverage — 80% with important paths tested beats 95% with trivial getter/setter tests",
                  "`# pragma: no cover` on a line excludes it from coverage — use for unreachable/legacy code only"
        ],
        mistake: "Chasing 100% coverage by testing trivial getters and setters. Coverage measures lines run, not correctness. Focus on testing behavior, edge cases, and error paths — not line counts.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "cov-config",
        fn: "pytest-cov configuration",
        desc: "Configure coverage reporting — omit paths, set thresholds, generate HTML.",
        category: "Advanced",
        subtitle: ".coveragerc or pyproject.toml — omit, fail_under, report formats",
        signature: "pytest --cov=myapp --cov-report=html --cov-fail-under=80",
        descLong: "pytest-cov generates coverage reports. Configure via .coveragerc or pyproject.toml to omit test files, migrations, and virtual envs. fail_under= enforces a minimum coverage threshold in CI. HTML reports show exactly which lines are missed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pytest-cov configuration — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# pyproject.toml\n# [tool.pytest.ini_options]\n# addopts = \"--cov=myapp --cov-report=term-missing\"\n#\n# [tool.coverage.run]\n# source = [\"myapp\"]\n#\n# [tool.coverage.report]\n# show_missing = true\n# Now: just $ pytest"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pytest-cov configuration — common patterns you'll see in production.\n# APPROACH  - Combine pytest-cov configuration with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# pyproject.toml\n#\n# [tool.pytest.ini_options]\n# testpaths = [\"tests\"]\n# addopts   = \"--cov=myapp --cov-branch --cov-report=term-missing --cov-fail-under=80\"\n#\n# [tool.coverage.run]\n# source = [\"myapp\"]\n# branch = true\n# omit   = [\n#     \"*/tests/*\",\n#     \"*/migrations/*\",\n#     \"*/__init__.py\",\n#     \"myapp/_vendor/*\",\n# ]\n#\n# [tool.coverage.report]\n# show_missing = true\n# skip_covered = false\n# precision    = 1\n# exclude_lines = [\n#     \"pragma: no cover\",\n#     \"if TYPE_CHECKING:\",\n#     \"raise NotImplementedError\",\n#     \"if __name__ == .__main__.:\",\n# ]\n# Per-line exclusion still works in code\nfrom typing import TYPE_CHECKING\nif TYPE_CHECKING:                           # pragma: no cover\n    from .types import Heavy"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pytest-cov configuration — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# pyproject.toml — full config\n#\n# [tool.pytest.ini_options]\n# testpaths = [\"tests\"]\n# addopts   = \"--cov=myapp --cov-branch --cov-report=term-missing --cov-fail-under=80\"\n# markers   = [\n#     \"slow: deselected by default\",\n#     \"integration: hits external systems\",\n# ]\n#\n# [tool.coverage.run]\n# source       = [\"myapp\"]\n# branch       = true\n# parallel     = true                       # writes per-process .coverage.* files\n# concurrency  = [\"thread\", \"multiprocessing\"]\n# omit         = [\"*/tests/*\", \"*/migrations/*\"]\n# plugins      = [\"coverage_conditional_plugin\"]   # version-gated coverage rules\n#\n# [tool.coverage.report]\n# fail_under   = 80\n# show_missing = true\n# precision    = 1\n# exclude_lines = [\n#     \"pragma: no cover\",\n#     \"if TYPE_CHECKING:\",\n#     \"raise NotImplementedError\",\n# ]\n#\n# [tool.coverage.html]\n# directory = \"htmlcov\"\n#\n# [tool.coverage.xml]\n# output = \"coverage.xml\"\n# CI workflow (GitHub Actions sketch):\n#   - run: pytest -n auto --cov-append\n#   - run: coverage combine\n#   - run: coverage xml\n#   - run: coverage report --fail-under=80\n#   - uses: codecov/codecov-action@v4\n# Decision rule:\n#   single-process pytest                  -> default config; one .coverage file\n#   xdist / parallel runners                -> parallel = true, then coverage combine\n#   want PR diff feedback                   -> coverage xml + diff-cover or codecov\n#   conditional code (py 3.11 only path)    -> coverage_conditional_plugin\n#   tests in same repo as code              -> always omit tests/ from source\n#   pure-Python lib                          -> drop --cov-branch only on perf-critical builds\n#\n# Anti-pattern: keeping settings in BOTH pyproject.toml AND .coveragerc\n#   The two files override each other unpredictably. Pick ONE — pyproject.toml\n#   is the modern choice. Migrate everything; delete the other."
                  }
        ],
        tips: [
                  "Add .coveragerc to version control — consistent settings across all developers and CI",
                  "`pragma: no cover` on a line or branch excludes it — use sparingly for truly untestable code",
                  "aim for 80% coverage as a baseline — 100% coverage does not mean no bugs",
                  "HTML report (`--cov-report=html`) shows exactly which lines are not covered — open htmlcov/index.html"
        ],
        mistake: "Chasing 100% coverage at the expense of test quality. Cover the important paths well rather than writing trivial tests just to bump the percentage.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "freezegun",
        fn: "freezegun",
        desc: "Freeze time in tests — mock datetime.now() and time.time().",
        category: "Advanced",
        subtitle: "@freeze_time(\"2024-01-15\") — all datetime calls return the frozen time",
        signature: "@freeze_time(\"2024-01-15\") | with freeze_time(\"2024-01-15\"):",
        descLong: "freezegun patches all datetime and time calls to return a fixed moment. Works transparently — no code changes needed. Use it to test time-dependent logic like expiry, scheduling, age calculation, and token TTL. Install: pip install freezegun.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of freezegun — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# pip install freezegun\nfrom datetime import datetime\nfrom freezegun import freeze_time\n@freeze_time(\"2024-01-15 12:00:00\")\ndef test_user_age():\n    user = make_user(birth_date=datetime(1990, 1, 15))\n    assert user.age == 34\n    assert datetime.now() == datetime(2024, 1, 15, 12, 0, 0)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of freezegun — common patterns you'll see in production.\n# APPROACH  - Combine freezegun with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom datetime import datetime, timedelta\nimport pytest\nfrom freezegun import freeze_time\n# 1) Context manager — freeze for a region of the test\ndef test_token_expiry():\n    with freeze_time(\"2024-01-15\") as frozen:\n        token = create_token(ttl=timedelta(hours=1))\n        frozen.tick(timedelta(minutes=30))\n        assert not is_expired(token)\n        frozen.tick(timedelta(minutes=31))            # crosses the hour\n        assert is_expired(token)\n# 2) Fixture — share the frozen clock across many tests\n@pytest.fixture\ndef frozen_time():\n    with freeze_time(\"2024-06-01\") as ft:\n        yield ft\ndef test_jump_in_time(frozen_time):\n    assert datetime.now().date().isoformat() == \"2024-06-01\"\n    frozen_time.move_to(\"2024-06-15\")                 # absolute jump\n    assert datetime.now().date().isoformat() == \"2024-06-15\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of freezegun — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom datetime import datetime, timezone, timedelta\nfrom freezegun import freeze_time\n# 1) Architectural rule: PASS THE CLOCK IN. Then you don't need freezegun at all.\nclass Token:\n    def __init__(self, ttl, *, now=datetime.utcnow):\n        self.created = now()\n        self.ttl     = ttl\n    def is_expired(self, *, now=datetime.utcnow):\n        return now() > self.created + self.ttl\ndef test_token_expiry_di():\n    fake_now = lambda: datetime(2024, 1, 15, 12, 30)        # no freezegun needed\n    token = Token(timedelta(hours=1), now=lambda: datetime(2024, 1, 15, 12, 0))\n    assert token.is_expired(now=lambda: datetime(2024, 1, 15, 13, 1))\n# 2) When you can't refactor — freezegun handles legacy code transparently.\n#    BUT note: time.monotonic() and time.perf_counter() are NOT frozen by default.\n#    Pass tick=True or use .tick() to advance.\nwith freeze_time(\"2024-01-15\", tick=True):                  # real time advances; START is frozen\n    ...\n# 3) Time-zone aware tests — freeze in UTC, convert at the boundary\n@freeze_time(\"2024-01-15 23:00:00\")                          # UTC by default\ndef test_local_midnight_in_tokyo():\n    import zoneinfo\n    now_jst = datetime.now(timezone.utc).astimezone(zoneinfo.ZoneInfo(\"Asia/Tokyo\"))\n    assert now_jst.hour == 8                                  # 2024-01-16 08:00 JST\n# 4) Beware: third-party libs that cache time at import time skip freezegun.\n#    Apply freeze_time as a SESSION fixture before imports, or use ignore=[...]\n#    to skip libraries that misbehave.\n# Decision rule:\n#   greenfield code                            -> inject the clock; never use freezegun\n#   legacy uses datetime.now() / time.time()   -> @freeze_time\n#   need to advance time during a test          -> ft.tick(seconds=...) / ft.move_to(...)\n#   need monotonic / perf_counter to advance    -> tick=True; or pass a fake monotonic_ns\n#   testing across time zones                    -> freeze in UTC, convert on read\n#   library caches \"now\" at import                -> apply freeze BEFORE the import\n#\n# Anti-pattern: assert datetime.now() == \"2024-01-15\"\n#   On a real clock this is a flaky check that passes for one millisecond. Either\n#   freeze, or compare to a captured \"now\" variable, never the clock itself.\ndef make_user(birth_date):\n    age = (datetime.now() - birth_date).days // 365\n    return type(\"U\", (), {\"age\": age})()\ndef create_token(ttl): return type(\"T\", (), {\"created\": datetime.now(), \"ttl\": ttl})()\ndef is_expired(t): return datetime.now() > t.created + t.ttl"
                  }
        ],
        tips: [
                  "freezegun patches all datetime sources — datetime.now(), time.time(), date.today()",
                  "Use .move_to() or .tick() on the frozen_time object to advance time within a test",
                  "Works with third-party libraries too — any code that uses standard datetime is frozen",
                  "For testing across time zones, combine with freeze_time(\"2024-01-15\", tz_offset=-5)"
        ],
        mistake: "Using datetime.now() directly in production code without dependency injection. If you pass now as a parameter, you can test without freezegun at all — but freezegun handles legacy code gracefully.",
        shorthand: {
          verbose: "from datetime import datetime, timedelta\nfrom freezegun import freeze_time\nfrom datetime import datetime\nimport pytest",
          concise: "assert datetime.now().date() == date(2024, 6, 15)",
        },
      },
      {
        id: "marks-config",
        fn: "Marks & configuration",
        desc: "Categorize tests with marks and configure pytest via pyproject.toml.",
        category: "Advanced",
        subtitle: "skip, xfail, slow, integration — run subsets without touching test files",
        signature: "@pytest.mark.slow | pytest -m \"not slow\" | pyproject.toml",
        descLong: "Marks categorize tests so you can run subsets from the command line. Register custom marks in pyproject.toml to avoid warnings. Use skip/xfail for known issues. Configure default options in pyproject.toml so you never have to type long pytest commands.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Marks & configuration — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport sys\nimport pytest\n@pytest.mark.skip(reason=\"not implemented yet\")\ndef test_future_feature():\n    ...\n@pytest.mark.skipif(sys.platform == \"win32\", reason=\"unix only\")\ndef test_unix_only():\n    ..."
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Marks & configuration — common patterns you'll see in production.\n# APPROACH  - Combine Marks & configuration with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport pytest\n# xfail — expected failure; test still runs but doesn't break the suite\n@pytest.mark.xfail(reason=\"bug #123, fix in v2\")\ndef test_known_broken():\n    assert flaky_thing() == 1\n# strict=True — FAIL if it suddenly passes (catches accidental fixes)\n@pytest.mark.xfail(strict=True, reason=\"must remain broken until release\")\ndef test_must_fail():\n    assert False\n# Custom marks — pytest -m \"slow\" / -m \"not slow\"\n@pytest.mark.slow\ndef test_big_computation():\n    ...\n@pytest.mark.integration\ndef test_full_api_flow():\n    ...\n# Selecting subsets at the command line:\n#   $ pytest -m slow\n#   $ pytest -m \"not slow\"\n#   $ pytest -m \"integration and not slow\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Marks & configuration — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# pyproject.toml — every custom mark must be registered or pytest warns/errors\n#\n# [tool.pytest.ini_options]\n# testpaths = [\"tests\"]\n# addopts   = \"-ra --strict-markers --tb=short\"\n# markers   = [\n#     \"slow: opt-in via --runslow\",\n#     \"integration: hits real services\",\n#     \"smoke: runs in pre-deploy pipeline\",\n#     \"perf: long-running benchmarks\",\n# ]\n# 1) Custom CLI flag — opt-in for slow tests\n# tests/conftest.py\nimport pytest\ndef pytest_addoption(parser):\n    parser.addoption(\"--runslow\", action=\"store_true\", help=\"run @slow tests\")\ndef pytest_collection_modifyitems(config, items):\n    if config.getoption(\"--runslow\"):\n        return\n    skip = pytest.mark.skip(reason=\"needs --runslow\")\n    for item in items:\n        if \"slow\" in item.keywords:\n            item.add_marker(skip)\n# 2) Conditional skip — environment-aware\n@pytest.mark.skipif(\"CI\" not in os.environ, reason=\"only meaningful in CI\")\ndef test_only_in_ci(): ...\n# 3) Multiple marks compose — AND semantics in -m expressions\n@pytest.mark.slow\n@pytest.mark.integration\ndef test_slow_integration(): ...\n# $ pytest -m \"slow and integration\"          only the intersection\n# $ pytest -m \"slow or integration\"           the union\n# 4) CI workflow leveraging marks\n#   PR checks:    pytest -m \"not slow and not integration\"   (fast feedback)\n#   nightly:      pytest --runslow                            (full suite)\n#   pre-deploy:   pytest -m smoke                             (sanity gate)\n# Decision rule:\n#   permanently disable                 -> @pytest.mark.skip\n#   conditionally disable                -> @pytest.mark.skipif(...)\n#   tracked-known-broken                  -> @pytest.mark.xfail(strict=True)\n#   slow / I/O / external                  -> custom mark + CLI flag to opt in\n#   triage layer in CI                      -> multiple marks (smoke / unit / integration)\n#   third-party-flaky external test         -> @pytest.mark.flaky from pytest-rerunfailures\n#\n# Anti-pattern: addopts = \"-m 'not slow'\" with no way to OPT IN\n#   The slow tests never run anywhere — they bit-rot. Pair every \"default skip\"\n#   with a CLI flag or a CI lane that runs them.\nimport os\ndef flaky_thing(): return 0"
                  }
        ],
        tips: [
                  "Register custom marks in `pyproject.toml` — unregistered marks cause `PytestUnknownMarkWarning`",
                  "Use `pytest -m \"not slow\"` during development for fast feedback — full suite only in CI",
                  "`addopts` in config runs those flags on every `pytest` invocation — no more typing `--tb=short`",
                  "`@pytest.mark.xfail(strict=True)` catches bugs that get silently fixed — forces you to remove the mark"
        ],
        mistake: "Not registering custom marks. Every `@pytest.mark.slow` produces a warning unless the mark is declared in `markers` inside `pyproject.toml` or `pytest.ini`.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "hypothesis",
        fn: "Hypothesis",
        desc: "Property-based testing — generate hundreds of random inputs automatically.",
        category: "Advanced",
        subtitle: "@given(st.integers()) — Hypothesis finds edge cases you would not think of",
        signature: "from hypothesis import given, strategies as st",
        descLong: "Hypothesis generates random inputs and shrinks failing cases to the minimal example. Instead of testing specific values, you test properties that should hold for all valid inputs. Excellent for finding edge cases in parsers, math operations, and data transformations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Hypothesis — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom hypothesis import given, strategies as st\n# Property: addition is commutative — should hold for ALL pairs\n@given(st.integers(), st.integers())\ndef test_addition_commutative(a, b):\n    assert a + b == b + a"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Hypothesis — common patterns you'll see in production.\n# APPROACH  - Combine Hypothesis with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom hypothesis import given, assume, strategies as st\nimport json\n# Strategy cookbook\nst.integers(min_value=0, max_value=100)\nst.floats(allow_nan=False, allow_infinity=False)\nst.text(min_size=1, max_size=50)\nst.lists(st.integers(), min_size=1, max_size=20)\nst.dictionaries(st.text(min_size=1), st.integers())\nst.one_of(st.integers(), st.text())                  # union\nst.sampled_from([\"red\", \"green\", \"blue\"])            # finite set\n# Round-trip property — dump and load should be identity\n@given(st.dictionaries(\n    keys=st.text(min_size=1),\n    values=st.one_of(st.integers(), st.text(), st.booleans()),\n))\ndef test_json_round_trip(d):\n    assert json.loads(json.dumps(d)) == d\n# Use assume() to skip inputs that violate a precondition\n@given(st.floats(allow_nan=False), st.floats(allow_nan=False))\ndef test_division_inverts(a, b):\n    assume(abs(b) > 1e-9)                             # filter degenerate cases\n    assert (a / b) * b == _approx(a)\ndef _approx(x, eps=1e-9):\n    class A:\n        def __eq__(self, other): return abs(other - x) < eps\n    return A()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Hypothesis — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom hypothesis import given, assume, example, settings, strategies as st, target\nfrom hypothesis import HealthCheck\n# 1) @example — pin specific edge cases that you KNOW must work\n@example(\"\")                                          # always run on empty\n@example(\"\\u0000\")                                   # always run on null byte\n@given(st.text())\ndef test_normalize_idempotent(s):\n    assert normalize(normalize(s)) == normalize(s)\n# 2) @composite — build complex, dependent inputs\n@st.composite\ndef valid_user(draw):\n    age   = draw(st.integers(min_value=18, max_value=120))\n    name  = draw(st.text(min_size=1, max_size=50))\n    email = draw(st.emails())\n    return {\"name\": name.strip(), \"email\": email, \"age\": age}\n@given(valid_user())\ndef test_user_round_trip(u):\n    assert User.from_dict(u).to_dict() == u\n# 3) Settings — tune for your test, not just defaults\n@settings(\n    max_examples=500,\n    deadline=200,                                     # ms per example; default 200\n    suppress_health_check=[HealthCheck.too_slow],\n    derandomize=True,                                 # CI-stable random seed\n)\n@given(st.lists(st.integers()))\ndef test_sort_idempotent(lst):\n    assert sorted(sorted(lst)) == sorted(lst)\n# 4) target() — guide shrinker toward interesting space (e.g. larger lists)\n@given(st.lists(st.integers()))\ndef test_quantile_close_to_median(lst):\n    assume(lst)\n    target(len(lst), label=\"list size\")               # prefer larger lists\n    assert lst[len(lst)//2] in lst\n# 5) Stateful testing — exercise sequences of operations on a state machine\nfrom hypothesis.stateful import RuleBasedStateMachine, rule, invariant\nclass CartMachine(RuleBasedStateMachine):\n    def __init__(self):\n        super().__init__()\n        self.cart = Cart()\n    @rule(item=st.text(min_size=1), price=st.floats(min_value=0, allow_nan=False))\n    def add(self, item, price):\n        self.cart.add(item, price)\n    @invariant()\n    def total_non_negative(self):\n        assert self.cart.total() >= 0\nTestCart = CartMachine.TestCase                        # pytest collects it\n# Decision rule:\n#   pure function with universal property      -> @given(strategy) + assertion\n#   complex inputs depending on each other      -> @composite strategy\n#   known edge cases must always run             -> @example(...)\n#   long-running examples / CI flake             -> @settings(deadline=None, derandomize=True)\n#   sequence of operations on a stateful object  -> RuleBasedStateMachine\n#   need to scaffold property tests fast          -> hypothesis ghostwrite myapp.module\n#\n# Anti-pattern: testing a property the SUT enforces (e.g. testing __eq__'s reflexivity)\n#   \"x == x\" can't fail — Hypothesis just burns CPU. Properties should constrain\n#   relationships BETWEEN operations (encode/decode, sort/sort, push/pop).\ndef normalize(s): return s.strip().lower()\nclass User:\n    @staticmethod\n    def from_dict(d): return type(\"X\", (), {\"to_dict\": lambda self: d})()\nclass Cart:\n    def __init__(self): self.items = []\n    def add(self, item, price): self.items.append((item, price))\n    def total(self): return sum(p for _, p in self.items)"
                  }
        ],
        tips: [
                  "Hypothesis remembers failing examples in a database — reruns them first on subsequent runs",
                  "When Hypothesis finds a failure it shrinks to the minimal failing input — much easier to debug",
                  "Use assume() sparingly — too many skipped inputs make the test less useful",
                  "Property-based testing complements, not replaces, example-based tests — use both",
                  "For inputs whose fields depend on each other, build a `@composite` strategy; for sequences of operations on a stateful object use `RuleBasedStateMachine`"
        ],
        mistake: "Writing `@given(st.integers())` then using `n` in a way that only fails for very large numbers. Hypothesis will find it — but increase max_examples if the failure is rare.",
        shorthand: {
          verbose: "import json\nfrom hypothesis import given, assume, settings\nfrom hypothesis import strategies as st\n@given(st.lists(st.integers()))",
          concise: "assert isinstance(n, int)",
        },
      },
    ],
  },
]

export default { meta, sections }
