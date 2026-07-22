# Java Domain for CodeSheets

## Overview
Complete production-quality Java reference with 82 entries across 4 sheets covering Java 8-21 features.

## Files

### 1. core.js (30 entries, 6 sections)
Core Java syntax and object-oriented programming
- **Variables & Types** (5): var keyword, primitives vs wrappers, string immutability, final keyword, enums
- **Control Flow** (5): if-else, switch statements, for loops, while loops, break/continue
- **Methods & Lambdas** (5): method definition, overloading, varargs, lambda expressions, method references
- **Object-Oriented Programming** (5): class definition, inheritance, interfaces, records, abstract classes
- **Collections Framework** (5): ArrayList, HashMap, HashSet, LinkedList, TreeMap
- **Exception Handling** (5): try-catch-finally, custom exceptions, multi-catch, try-with-resources, Optional

### 2. streams.js (20 entries, 4 sections)
Stream processing and functional programming
- **Stream Creation** (4): Stream.of(), Arrays.stream(), Collection.stream(), IntStream.range()
- **Intermediate Operations** (6): filter, map, flatMap, sorted, distinct, peek, limit/skip
- **Terminal Operations** (5): forEach, collect, reduce, count, and comprehensive Collector examples
- **Collectors** (5): toList/toSet, toMap, groupingBy, partitioningBy, joining

### 3. concurrency.js (19 entries, 5 sections)
Threading, synchronization, and modern concurrency patterns
- **Thread Basics** (4): Thread class, Runnable interface, Callable and Future, thread lifecycle
- **Executors & Thread Pools** (4): ExecutorService, executor types, execute vs submit, ScheduledExecutorService
- **Synchronization Primitives** (4): synchronized keyword, ReentrantLock, atomic variables, ConcurrentHashMap
- **CompletableFuture** (4): Creating, chaining operations, composition, exception handling
- **Virtual Threads (Java 21+)** (3): Virtual threads basics, with executors, structured concurrency

### 4. modern.js (13 entries, 4 sections)
Modern Java features (17-21)
- **Records & Sealed Classes** (4): Records intro, sealed classes, combining them, equals/hashCode
- **Pattern Matching** (3): instanceof patterns, switch expressions, record patterns
- **Text Blocks & APIs** (3): Text blocks, new string methods, SequencedCollections
- **Miscellaneous** (3): Unnamed patterns, null handling in patterns, Foreign Function & Memory API

### 5. master.js (Combined reference)
Aggregates all sheets with prefixed section IDs for unified reference.

## Quality Standards Met

✓ **All 8 required fields per entry:**
- id: kebab-case unique identifier
- fn: display name
- desc: 1-line description
- category: grouping within section
- subtitle: brief subtitle
- signature: syntax signature
- descLong: 50+ character detailed description
- code: 10+ lines of RUNNABLE, self-contained Java code WITH imports
- tips: string[] with 3+ actionable tips
- mistake: common mistake string

✓ **Code Quality:**
- Every code example is complete and runnable
- All imports explicitly included
- Main methods and proper class structure
- Real-world usage patterns
- Modern Java idioms used (var, records, switch expressions, etc.)

✓ **Coverage:**
- Java 8 fundamentals (lambdas, streams)
- Java 10+ (var keyword)
- Java 14+ (records, switch expressions)
- Java 15+ (sealed classes, text blocks)
- Java 16+ (pattern matching)
- Java 17+ (sealed classes finalized)
- Java 21+ (virtual threads, record patterns, unnamed patterns)

## Statistics

| Sheet | Sections | Entries | Focus |
|-------|----------|---------|-------|
| core.js | 6 | 30 | Fundamentals & OOP |
| streams.js | 4 | 20 | Functional & Stream Processing |
| concurrency.js | 5 | 19 | Threading & Async |
| modern.js | 4 | 13 | Latest Features |
| **Total** | **19** | **82** | **Complete Reference** |

## Usage

Import individual sheets:
```javascript
import core from './core.js'
import streams from './streams.js'
import concurrency from './concurrency.js'
import modern from './modern.js'
```

Or use the master reference:
```javascript
import java from './master.js'
```

Each entry is fully self-contained with complete code examples, practical tips, and common mistakes to avoid.
