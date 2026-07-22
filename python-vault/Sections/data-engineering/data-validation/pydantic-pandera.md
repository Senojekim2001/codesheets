---
type: "entry"
domain: "python"
file: "data-engineering"
section: "data-validation"
id: "pydantic-pandera"
title: "Pydantic & Pandera — Data Validation at Scale"
category: "Validation"
subtitle: "BaseModel, Field, validator, pa.DataFrameModel, @check, Great Expectations"
signature_short: "class Schema(BaseModel): field: int = Field(gt=0)  |  pa.DataFrameModel  |  @pa.check"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Pydantic & Pandera — Data Validation at Scale"
  - "pydantic-pandera"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/data-validation"
  - "category/validation"
  - "tier/tiered"
---

# Pydantic & Pandera — Data Validation at Scale

> BaseModel, Field, validator, pa.DataFrameModel, @check, Great Expectations

## Overview

Data validation ensures data quality at every pipeline stage. Pydantic validates individual records (API payloads, config, row-level validation) with type coercion and custom validators. Pandera validates entire DataFrames with column types, value ranges, uniqueness, and custom checks. Great Expectations provides a full data quality framework with expectation suites, profiling, and alerting. Use Pydantic at API boundaries and ingestion, Pandera for DataFrame transformations, and Great Expectations for warehouse-level monitoring.

## Signature

```python
class Schema(BaseModel): field: int = Field(gt=0)  |  pa.DataFrameModel  |  @pa.check
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One Pydantic BaseModel; type coercion gives you validation for free
# STRENGTHS - Smallest valid record validator
# WEAKNESSES- No custom validators, no DataFrame validation
#
from datetime import date
from pydantic import BaseModel, Field

class SalesRecord(BaseModel):
    order_id:    str   = Field(min_length=1)
    customer_id: int   = Field(gt=0)
    amount:      float = Field(gt=0, le=1_000_000)
    order_date:  date                                  # "2024-06-15" -> date

record = SalesRecord(order_id="ORD-1", customer_id=42,
                     amount=99.99, order_date="2024-06-15")
print(record.amount)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Pydantic for records + Pandera for DataFrames; pick by shape of data
# STRENGTHS - The two libraries you'll use most, side-by-side, with batch errors
# WEAKNESSES- No Great Expectations, no streaming validation
#
from datetime import date
from pydantic import BaseModel, Field, field_validator
import pandera as pa
from pandera.typing import DataFrame, Series
import pandas as pd

# 1) Pydantic — single record / API payload
class SalesRecord(BaseModel):
    order_id:    str   = Field(min_length=1)
    customer_id: int   = Field(gt=0)
    amount:      float = Field(gt=0, le=1_000_000)
    currency:    str   = Field(pattern=r"^[A-Z]{3}$")
    order_date:  date

    @field_validator("currency")
    @classmethod
    def known_currency(cls, v):
        if v not in {"USD", "EUR", "GBP", "JPY"}:
            raise ValueError(f"unknown currency: {v}")
        return v

# Batch validate, collect errors instead of failing on the first
def validate_batch(rows):
    ok, bad = [], []
    for r in rows:
        try:
            ok.append(SalesRecord(**r))
        except Exception as e:
            bad.append({"row": r, "error": str(e)})
    return ok, bad

# 2) Pandera — whole DataFrame
class SalesSchema(pa.DataFrameModel):
    order_id:    Series[str]          = pa.Field(str_length={"min_value": 1})
    customer_id: Series[int]          = pa.Field(gt=0)
    amount:      Series[float]        = pa.Field(gt=0, le=1_000_000)
    region:      Series[str]          = pa.Field(isin=["US", "EU", "APAC"])
    order_date:  Series[pa.DateTime]

    class Config:
        coerce = True                                  # cast columns to declared dtype
        strict = True                                  # reject unexpected columns

df = pd.DataFrame({
    "order_id":    ["A1", "A2"],
    "customer_id": [1, 2],
    "amount":      [99.99, 149.50],
    "region":      ["US", "EU"],
    "order_date":  ["2024-01-01", "2024-01-02"],
})
validated: DataFrame[SalesSchema] = SalesSchema.validate(df)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - lazy validation, @check_types boundary contracts, custom checks, GE for warehouse
# STRENGTHS - The patterns that catch bad data EARLY without crashing batch jobs
# WEAKNESSES- N/A
#
from typing import Optional
from pydantic import BaseModel, ValidationError, ConfigDict
import pandera as pa
from pandera.typing import DataFrame, Series

# 1) Pydantic — strict mode + lazy validation for batches (collect ALL errors per row)
class StrictSalesRecord(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    order_id:    str
    customer_id: int
    amount:      float
    region:      Optional[str] = None

def validate_batch(rows):
    errors_by_row = []
    for i, r in enumerate(rows):
        try:
            StrictSalesRecord(**r)
        except ValidationError as e:
            errors_by_row.append((i, e.errors()))      # full error list per row
    return errors_by_row

# 2) Pandera — class-based schema with cross-column checks + lazy mode
class SalesSchema(pa.DataFrameModel):
    customer_id: Series[int]   = pa.Field(gt=0)
    amount:      Series[float] = pa.Field(gt=0, le=1_000_000)
    discount:    Series[float] = pa.Field(ge=0, le=1)
    region:      Series[str]   = pa.Field(isin=["US", "EU", "APAC"])

    class Config:
        coerce = True
        strict = True

    @pa.check("amount", error="amount cannot be too round at scale")
    @classmethod
    def no_suspicious_round(cls, s: Series[float]) -> Series[bool]:
        return ~((s > 10_000) & (s % 1000 == 0))

    @pa.dataframe_check
    @classmethod
    def discount_doesnt_exceed_amount(cls, df: pd.DataFrame) -> Series[bool]:
        return (df["amount"] * df["discount"]) <= df["amount"]

# Validate with lazy=True to collect ALL violations at once
try:
    SalesSchema.validate(df, lazy=True)
except pa.errors.SchemaErrors as e:
    print(e.failure_cases.head())                       # which rows / cols / values failed

# 3) Boundary contracts — @check_types validates inputs AND outputs
@pa.check_types
def apply_promo(df: DataFrame[SalesSchema]) -> DataFrame[SalesSchema]:
    out = df.assign(amount=df["amount"] * (1 - df["discount"]))
    return out                                          # pandera enforces post-condition

# 4) Warehouse-level monitoring — Great Expectations runs alongside dbt
#    great_expectations checkpoint run nightly_checks
#    Use GE for: row counts, freshness, distribution drift, referential integrity.

# Decision rule:
#   single record / API payload          -> Pydantic BaseModel
#   batch of records (need ALL errors)   -> Pydantic + lazy collection loop
#   pandas DataFrame in a pipeline       -> Pandera DataFrameModel + @check_types
#   Spark / Polars DataFrame              -> pandera (modin) or great-expectations
#   warehouse table monitoring             -> Great Expectations or dbt tests
#   schema evolution / external API       -> Pydantic with extra="ignore" + strict per-field
#
# Anti-pattern: validating only at ingestion, then assuming downstream is clean
#   Each transformation can break invariants. Place @check_types on every
#   pipeline boundary; validation is cheap, debugging bad data is not.

import pandas as pd
df = pd.DataFrame()
```

## Decision Rule

```text
single record / API payload          -> Pydantic BaseModel
batch of records (need ALL errors)   -> Pydantic + lazy collection loop
pandas DataFrame in a pipeline       -> Pandera DataFrameModel + @check_types
Spark / Polars DataFrame              -> pandera (modin) or great-expectations
warehouse table monitoring             -> Great Expectations or dbt tests
schema evolution / external API       -> Pydantic with extra="ignore" + strict per-field
```

## Anti-Pattern

> [!warning] Anti-pattern
> validating only at ingestion, then assuming downstream is clean
>   Each transformation can break invariants. Place @check_types on every
>   pipeline boundary; validation is cheap, debugging bad data is not.

## Tips

- Pydantic for record-level (API payloads, row validation), Pandera for DataFrame-level (column types, ranges, cross-column checks).
- Use Pydantic model_validator(mode="after") for cross-field validation — e.g., end_date > start_date.
- Pandera @check_types decorator validates function inputs and outputs automatically — catches bugs at function boundaries.
- Collect validation errors instead of failing on the first one — batch processing needs error reports, not exceptions.

## Common Mistake

> [!warning] Skipping validation in data pipelines and debugging bad data downstream — add Pydantic/Pandera checks at ingestion and after each transformation. Catching bad data early saves hours of debugging.

## Shorthand (Junior → Senior)

**Junior:**
```python
from pydantic import BaseModel
class User:
    def __init__(self, name, email, age):
        if not isinstance(name, str):
            raise TypeError("name must be str")
        if age < 0:
            raise ValueError("age must be non-negative")
        self.name = name
        self.email = email
        self.age = age
```

**Senior:**
```python
from pydantic import BaseModel, Field
class User(BaseModel):
    name: str
    email: str
    age: int = Field(ge=0)
user = User(name="Alice", email="alice@example.com", age=30)
```

## See Also

- [[Sections/data-engineering/data-validation/_Index|Data Engineering → Data Validation & Quality]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]
