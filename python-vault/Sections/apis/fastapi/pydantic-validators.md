---
type: "entry"
domain: "python"
file: "apis"
section: "fastapi"
id: "pydantic-validators"
title: "Pydantic validators"
category: "FastAPI"
subtitle: "@field_validator for per-field, @model_validator for cross-field"
signature_short: "@field_validator(\"field\") @classmethod def validate(cls, v): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Pydantic validators"
  - "pydantic-validators"
tags:
  - "python"
  - "python/apis"
  - "python/apis/fastapi"
  - "category/fastapi"
  - "tier/tiered"
---

# Pydantic validators

> @field_validator for per-field, @model_validator for cross-field

## Overview

Pydantic v2 uses @field_validator for per-field validation and @model_validator for cross-field constraints. Validators receive the value and can raise ValueError to fail validation.

## Signature

```python
@field_validator("field") @classmethod def validate(cls, v): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One @field_validator that normalizes a field
# STRENGTHS - Smallest valid custom validator
# WEAKNESSES- No mode= choice, no cross-field
#
from pydantic import BaseModel, field_validator

class User(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def lowercase(cls, v: str) -> str:           # raise OR transform
        if "@" not in v:
            raise ValueError("invalid email")
        return v.lower()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - field_validator (per-field) + model_validator (cross-field), error inspection
# STRENGTHS - The two validator types and what each is for
# WEAKNESSES- No mode='before' / 'wrap' nuances
#
from datetime import datetime
from pydantic import BaseModel, ValidationError, field_validator, model_validator

class User(BaseModel):
    email: str
    age:   int
    name:  str

    @field_validator("email")
    @classmethod
    def email_must_have_at(cls, v):
        if "@" not in v: raise ValueError("invalid email")
        return v.lower()                            # normalize on the way in

    @field_validator("name")
    @classmethod
    def name_strip(cls, v):
        v = v.strip()
        if not v: raise ValueError("name cannot be empty")
        return v.title()

    @field_validator("age")
    @classmethod
    def age_range(cls, v):
        if not 0 <= v <= 150:
            raise ValueError("age must be 0..150")
        return v

# All errors come back in ONE list — clients see every problem at once
try:
    User(email="bad", age=-5, name="")
except ValidationError as e:
    for err in e.errors():
        print(err["loc"], err["msg"])

# Cross-field invariants live on @model_validator(mode="after")
class DateRange(BaseModel):
    start: datetime
    end:   datetime

    @model_validator(mode="after")
    def end_after_start(self):
        if self.end <= self.start:
            raise ValueError("end must be after start")
        return self
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - mode='before' for normalization before typing, AfterValidator for reuse, info access
# STRENGTHS - The patterns that DRY up validators across many models
# WEAKNESSES- N/A
#
from typing import Annotated
from pydantic import (
    BaseModel, ValidationError, ValidationInfo,
    field_validator, model_validator, AfterValidator, BeforeValidator,
)

# 1) mode='before' runs BEFORE type coercion — useful when raw input isn't typed yet
class Order(BaseModel):
    quantity: int

    @field_validator("quantity", mode="before")
    @classmethod
    def coerce_strings(cls, v):
        if isinstance(v, str) and v.endswith(" units"):
            return int(v.removesuffix(" units"))
        return v

Order.model_validate({"quantity": "5 units"})           # works

# 2) Annotated[Type, AfterValidator(fn)] — REUSE validation across models
def lowercase(v: str) -> str:
    return v.lower()

def must_have_at(v: str) -> str:
    if "@" not in v: raise ValueError("invalid email")
    return v

Email = Annotated[str, BeforeValidator(lowercase), AfterValidator(must_have_at)]

class Signup(BaseModel):
    email: Email
class Invite(BaseModel):
    invite_email: Email                                  # reused — single source of truth

# 3) ValidationInfo gives access to other fields and context — for genuinely cross-field rules
class PriceQuote(BaseModel):
    base:     float
    discount: float

    @field_validator("discount")
    @classmethod
    def cap_to_base(cls, v: float, info: ValidationInfo) -> float:
        base = (info.data or {}).get("base", 0)
        if v > base:
            raise ValueError("discount cannot exceed base price")
        return v

# 4) Errors are structured — turn ValidationError into a stable HTTP body
def validation_to_http(e: ValidationError):
    return [{"field": ".".join(map(str, err["loc"])),
             "message": err["msg"],
             "type": err["type"]} for err in e.errors()]

# Decision rule:
#   normalize a single field             -> @field_validator(...)
#   normalize SHAPE before typing         -> mode="before"
#   cross-field invariant                  -> @model_validator(mode="after")
#   need values from sibling fields        -> field_validator + ValidationInfo.data
#   reusable rule across many models      -> Annotated[Type, AfterValidator(fn)]
#   custom error formatting for clients     -> walk e.errors(), build your own JSON
#
# Anti-pattern: raising HTTPException inside a Pydantic validator
#   Validators run during model construction, not in a FastAPI handler. They
#   should raise ValueError; FastAPI translates ValidationError to 422 for you.
#   Raising HTTPException leaks the framework into your domain models.
```

## Decision Rule

```text
normalize a single field             -> @field_validator(...)
normalize SHAPE before typing         -> mode="before"
cross-field invariant                  -> @model_validator(mode="after")
need values from sibling fields        -> field_validator + ValidationInfo.data
reusable rule across many models      -> Annotated[Type, AfterValidator(fn)]
custom error formatting for clients     -> walk e.errors(), build your own JSON
```

## Anti-Pattern

> [!warning] Anti-pattern
> raising HTTPException inside a Pydantic validator
>   Validators run during model construction, not in a FastAPI handler. They
>   should raise ValueError; FastAPI translates ValidationError to 422 for you.
>   Raising HTTPException leaks the framework into your domain models.

## Tips

- Validators are `@classmethod` in Pydantic v2 — the `cls` argument receives the model class
- Returning a transformed value from a validator is fine — use it to normalize (lowercase, strip, etc.)
- `mode="after"` in `@model_validator` runs after all field validators pass — has access to all fields
- All validation errors are collected and raised together — users see all problems at once

## Common Mistake

> [!warning] Using the v1 `@validator` decorator in Pydantic v2. It still works but is deprecated. Use `@field_validator` with `@classmethod` as the v2 replacement.

## Shorthand (Junior → Senior)

**Junior:**
```python
try:
    result = risky()
except ValueError as e:
    print(e)
```

**Senior:**
```python
try:
    result = risky()
except ValueError:
    result = None
```

## See Also

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes (APIs & Frameworks)]]
- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-models|Pydantic models (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-settings|Pydantic BaseSettings (APIs & Frameworks)]]
- [[Sections/apis/fastapi/_Index|APIs & Frameworks → FastAPI]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]
