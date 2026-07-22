---
type: "file-index"
domain: "python"
file: "testing"
title: "Testing with pytest"
tags:
  - "python"
  - "python/testing"
  - "index"
---

# Testing with pytest

> 21 entries across 4 sections.

## pytest Basics · 5

- [[Sections/testing/pytest-basics/assertions|pytest assertions]] — Write tests with plain assert — pytest rewrites them for detailed output.
- [[Sections/testing/pytest-basics/test-doubles|Test doubles]] — Vocabulary for the different kinds of fake objects used in testing.
- [[Sections/testing/pytest-basics/raises|pytest.raises()]] — Assert that code raises a specific exception.
- [[Sections/testing/pytest-basics/approx|pytest.approx()]] — Compare floating-point numbers with tolerance.
- [[Sections/testing/pytest-basics/parametrize|@pytest.mark.parametrize]] — Run one test function with many different input/output pairs.

## Fixtures · 5

- [[Sections/testing/fixtures/fixture-basic|@pytest.fixture]] — Provide reusable setup — and teardown — for tests.
- [[Sections/testing/fixtures/fixture-scope|Fixture scope]] — Control how often a fixture is created and torn down.
- [[Sections/testing/fixtures/factory-boy|Factory Boy]] — Generate test data with factories — no more brittle fixture dicts.
- [[Sections/testing/fixtures/conftest|conftest.py]] — Share fixtures across test files without imports.
- [[Sections/testing/fixtures/integration-tests|Integration test patterns]] — Test multiple components together — DB, HTTP, file system.

## Mocking · 6

- [[Sections/testing/mocking/patch|unittest.mock.patch()]] — Temporarily replace an object with a mock for the duration of a test.
- [[Sections/testing/mocking/responses|responses]] — Mock HTTP requests made by the requests library in tests.
- [[Sections/testing/mocking/httpretty|httpretty]] — Mock HTTP requests at the socket level — works with any HTTP library.
- [[Sections/testing/mocking/magicmock|MagicMock]] — A flexible mock object that auto-creates attributes and tracks calls.
- [[Sections/testing/mocking/mocker|mocker fixture]] — pytest-mock's mocker fixture — cleaner mocking without decorators.
- [[Sections/testing/mocking/pytest-asyncio|pytest-asyncio]] — Test async functions with pytest.

## Advanced Testing · 5

- [[Sections/testing/advanced/coverage|pytest coverage]] — Measure which lines of code are exercised by your tests.
- [[Sections/testing/advanced/cov-config|pytest-cov configuration]] — Configure coverage reporting — omit paths, set thresholds, generate HTML.
- [[Sections/testing/advanced/freezegun|freezegun]] — Freeze time in tests — mock datetime.now() and time.time().
- [[Sections/testing/advanced/marks-config|Marks & configuration]] — Categorize tests with marks and configure pytest via pyproject.toml.
- [[Sections/testing/advanced/hypothesis|Hypothesis]] — Property-based testing — generate hundreds of random inputs automatically.
