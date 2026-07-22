---
type: "entry"
domain: "python"
file: "apis"
section: "fastapi"
id: "pydantic-models"
title: "Pydantic models"
category: "FastAPI"
subtitle: "BaseModel with Field constraints — validates on instantiation"
signature_short: "class Model(BaseModel): field: type = Field(..., gt=0)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Pydantic models"
  - "pydantic-models"
tags:
  - "python"
  - "python/apis"
  - "python/apis/fastapi"
  - "category/fastapi"
  - "tier/tiered"
---

# Pydantic models

> BaseModel with Field constraints — validates on instantiation

## Overview

Pydantic BaseModel validates data at instantiation using type hints and Field constraints. Used in FastAPI for request bodies, response schemas, and settings. model_dump() serializes to dict; model_validate() parses from dict.

## Signature

```python
class Model(BaseModel): field: type = Field(..., gt=0)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One BaseModel; instantiation validates types
# STRENGTHS - The minimum-shape Pydantic model
# WEAKNESSES- No constraints, no defaults, no nested types
#
from pydantic import BaseModel

class User(BaseModel):
    id:    int
    name:  str
    email: str

u = User(id=1, name="Alice", email="alice@example.com")
print(u.model_dump())                                # {'id': 1, 'name': 'Alice', ...}
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Field constraints, defaults, default_factory, nested models, ORM mode
# STRENGTHS - The five Field features that cover most schemas
# WEAKNESSES- No custom validators (next entry); no discriminated unions
#
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

class Address(BaseModel):
    street: str
    city:   str

class Order(BaseModel):
    id:       int
    item:     str       = Field(..., min_length=1)        # ... = required (no default)
    quantity: int       = Field(..., gt=0, le=1000)
    price:    float     = Field(..., gt=0)
    discount: float     = Field(default=0.0, ge=0, le=1.0)
    created:  datetime  = Field(default_factory=datetime.utcnow)
    tags:     list[str] = []
    address:  Address                                       # validated recursively

# Serialization
o = Order(id=1, item="Widget", quantity=5, price=9.99,
          address=Address(street="123 Main", city="Boston"))
print(o.model_dump())                                       # plain dict
print(o.model_dump(exclude={"id", "tags"}))                 # drop sensitive fields
print(o.model_dump_json())                                  # JSON string

# Read from a SQLAlchemy ORM row (model_config option)
class UserOut(BaseModel):
    id:    int
    name:  str
    email: EmailStr
    model_config = {"from_attributes": True}                # was orm_mode in v1
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Strict mode, computed_field, discriminated unions, schema for OpenAPI
# STRENGTHS - The patterns that turn Pydantic from "validation" to "boundary contract"
# WEAKNESSES- N/A
#
from typing import Annotated, Literal
from pydantic import (
    BaseModel, ConfigDict, Field, EmailStr, computed_field, model_validator,
)

# 1) Strict mode + extra="forbid" — no silent type coercion, no surprise fields
class StrictUser(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    id:    int
    email: EmailStr
    age:   int = Field(ge=0, le=120)

# 2) computed_field — derive a field that appears in dump() and OpenAPI
class Order(BaseModel):
    quantity: int     = Field(gt=0)
    price:    float   = Field(gt=0)
    discount: float   = Field(default=0.0, ge=0, le=1.0)

    @computed_field
    @property
    def total(self) -> float:
        return self.quantity * self.price * (1 - self.discount)

# 3) Discriminated union — dispatch on a literal field; FastAPI auto-routes
class CardPayment(BaseModel):
    method: Literal["card"]
    last4:  str = Field(pattern=r"^\d{4}$")
class WirePayment(BaseModel):
    method: Literal["wire"]
    iban:   str

Payment = Annotated[CardPayment | WirePayment, Field(discriminator="method")]

class Checkout(BaseModel):
    payment: Payment

Checkout.model_validate({"payment": {"method": "card", "last4": "1234"}})

# 4) Use model_validator for "this combo is invalid"
class DateRange(BaseModel):
    start: datetime
    end:   datetime

    @model_validator(mode="after")
    def end_after_start(self):
        if self.end <= self.start:
            raise ValueError("end must be after start")
        return self

# 5) Reuse the JSON schema in OpenAPI / docs / static analysis
print(Order.model_json_schema())

# Decision rule:
#   public API request body              -> strict=True + extra="forbid"
#   internal record / config              -> defaults; permissive parsing
#   field derived from others             -> @computed_field (visible in OpenAPI)
#   pick by a "type" field                -> discriminated union with Field(discriminator=...)
#   email / URL / etc.                     -> EmailStr / HttpUrl, not plain str
#   need to mutate value during validation  -> @field_validator returns the cleaned value
#
# Anti-pattern: extra="ignore" on a public POST endpoint
#   Clients can send any field they like; you silently drop them. The bug is
#   indistinguishable from "field renamed and forgot to update client". Use
#   extra="forbid" so typos blow up immediately.

from datetime import datetime
```

## Decision Rule

```text
public API request body              -> strict=True + extra="forbid"
internal record / config              -> defaults; permissive parsing
field derived from others             -> @computed_field (visible in OpenAPI)
pick by a "type" field                -> discriminated union with Field(discriminator=...)
email / URL / etc.                     -> EmailStr / HttpUrl, not plain str
need to mutate value during validation  -> @field_validator returns the cleaned value
```

## Anti-Pattern

> [!warning] Anti-pattern
> extra="ignore" on a public POST endpoint
>   Clients can send any field they like; you silently drop them. The bug is
>   indistinguishable from "field renamed and forgot to update client". Use
>   extra="forbid" so typos blow up immediately.

## Tips

- `Field(..., gt=0)` — `...` means required (no default). Use `None` as default for optional fields
- `model_dump(exclude={"password"})` strips sensitive fields before logging or returning
- `from_attributes=True` in `model_config` lets Pydantic read attributes from ORM objects
- Pydantic v2 (current): `model_dump()` not `dict()`, `model_validate()` not `parse_obj()`
- Public API request bodies should set `model_config = ConfigDict(strict=True, extra="forbid")` — `extra="ignore"` silently drops typoed/renamed fields and the bug looks identical to a stale client
- Use `EmailStr` / `HttpUrl` / `SecretStr` over plain `str` for those types — validation and safer reprs come for free

## Common Mistake

> [!warning] Using Pydantic v1 syntax in v2: `@validator` → `@field_validator`, `dict()` → `model_dump()`, `parse_obj()` → `model_validate()`. Check version: `pydantic.__version__`.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes (APIs & Frameworks)]]
- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-settings|Pydantic BaseSettings (APIs & Frameworks)]]
- [[Sections/apis/fastapi/_Index|APIs & Frameworks → FastAPI]]
- [[Sections/apis/_Index|APIs & Frameworks index]]
- [[_Index|Vault index]]
