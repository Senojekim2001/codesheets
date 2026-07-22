export const meta = {
  "title": "Core R",
  "domain": "r",
  "sheet": "core",
  "icon": "📊"
}

export const sections = [

  // ── Section 1: R Fundamentals ─────────────────────────────────────────
  {
    id: "r-fundamentals-core",
    title: "R Fundamentals",
    entries: [
      {
        id: "r-basics",
        fn: "R Syntax, Vectors & Data Types",
        desc: "Everything in R is a vector — the fundamental data structure.",
        category: "R Core",
        subtitle: "Variables, atomic types, vectors, and basic operators",
        signature: "x <- value  |  c(1,2,3)  |  class(x)  |  length(x)",
        descLong: "R uses <- for assignment (= also works). The atomic types are numeric (double), integer, character, logical, complex, and raw. Vectors are the base building block — scalars are just length-1 vectors. R is vectorized: operations apply element-by-element without loops.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of R Syntax, Vectors & Data Types — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Assignment ─────────────────────────────────────────\nx <- 42          # preferred style\ny = \"hello\"      # also works, less conventional\nassign(\"z\", 100) # programmatic assignment\n# ── Atomic types ───────────────────────────────────────\nclass(3.14)        # \"numeric\"  (double precision)\nclass(3L)          # \"integer\"  (L suffix)\nclass(TRUE)        # \"logical\"\nclass(\"text\")      # \"character\"\nclass(1+2i)        # \"complex\"\nclass(NA)          # \"logical\" (missing)\nclass(NULL)        # \"NULL\" (absence of value)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of R Syntax, Vectors & Data Types — common patterns you'll see in production.\n# APPROACH  - Combine R Syntax, Vectors & Data Types with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Type checking & coercion ───────────────────────────\nis.numeric(3.14)   # TRUE\nis.character(\"x\")  # TRUE\nas.integer(3.7)    # 3  (truncates)\nas.numeric(\"3.14\") # 3.14\nas.character(42)   # \"42\"\nas.logical(0)      # FALSE  (0=FALSE, nonzero=TRUE)\n# ── Vectors ────────────────────────────────────────────\nx <- c(1, 4, 9, 16, 25)       # combine into vector\nseq(1, 10, by=2)               # 1 3 5 7 9\nseq(0, 1, length.out=5)        # 0.00 0.25 0.50 0.75 1.00\nrep(c(1,2,3), times=2)         # 1 2 3 1 2 3\nrep(c(1,2,3), each=2)          # 1 1 2 2 3 3"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of R Syntax, Vectors & Data Types — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Vectorized operations ──────────────────────────────\nx <- c(1,2,3,4,5)\nx * 2              # 2 4 6 8 10  (no loop needed)\nx^2                # 1 4 9 16 25\nx > 3              # FALSE FALSE FALSE TRUE TRUE\nsum(x > 3)         # 2  (count of TRUEs)\nmean(x[x > 3])     # 4.5  (mean of values > 3)\n# ── Recycling (important!) ─────────────────────────────\nc(1,2,3,4) + c(10,20)  # 11 22 13 24  (shorter recycled)"
                  }
        ],
        tips: [
                  "Use `<-` not `=` for assignment — `=` inside function calls means argument assignment",
                  "R is **1-indexed** — first element is `x[1]`, not `x[0]` (x[0] returns empty vector)",
                  "NA is contagious: `1 + NA = NA`. Use `na.rm=TRUE` in aggregation functions",
                  "Recycling silently repeats shorter vectors — works when lengths are multiples, warning otherwise"
        ],
        mistake: "Using `==` to test for NA: `x == NA` always returns NA, never TRUE. Use `is.na(x)` to test for missing values.",
        shorthand: {
          verbose: "x <- c(1, NA, 3)\nif (x == NA) { }  # NA (always!)\nif (x == 1) { }  # NA, FALSE, FALSE",
          concise: "if (is.na(x[2])) { }  # TRUE\nif (any(is.na(x))) { }  # TRUE",
        },
      },
      {
        id: "r-print-output",
        fn: "print() / cat() / message() / sprintf()",
        desc: "Write output to the console — each function has a distinct purpose and destination.",
        category: "R Core",
        subtitle: "Console output, formatted strings, stderr messages, writeLines",
        signature: "print(x)  |  cat(..., sep=' ')  |  message(...)  |  sprintf('%s %d', s, n)",
        descLong: "R has four distinct output functions: print() uses the object's print method (shows [1] index); cat() concatenates and writes raw text (no [1] prefix, no auto-newline); message() writes to stderr (for warnings/progress, can be suppressed); sprintf() builds formatted strings. In scripts, invisible() suppresses auto-printing of return values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of print() / cat() / message() / sprintf() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── print() — uses object's print method ─────────────\nx <- 42\nprint(x)           # [1] 42\nprint(\"hello\")      # [1] \"hello\"\nprint(c(1,2,3))    # [1] 1 2 3\nprint(data.frame(a=1:2, b=c('x','y')))\n#   a b\n# 1 1 x\n# 2 2 y\n# ── cat() — raw text, no [1] prefix ──────────────────\ncat(\"Hello, World!\\n\")     # Hello, World!\ncat(\"x =\", x, \"\\n\")        # x = 42\ncat(1, 2, 3, sep=\", \")     # 1, 2, 3  (no newline!)\ncat(\"a\", \"b\", \"c\", sep=\"-\", fill=TRUE)  # a-b-c\\n\n# cat to file:\ncat(\"log entry\\n\", file = \"output.txt\", append = TRUE)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of print() / cat() / message() / sprintf() — common patterns you'll see in production.\n# APPROACH  - Combine print() / cat() / message() / sprintf() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── message() — writes to stderr ─────────────────────\nmessage(\"Loading data...\")          # goes to stderr\nmessage(\"Processed \", nrow(df), \" rows\")  # auto-pastes\n# Suppress messages from a function call:\nsuppressMessages(some_function())\n# ── sprintf() — formatted strings (like C printf) ────\nsprintf(\"Name: %s, Score: %.1f%%\", \"Alice\", 95.5)\n# [1] \"Name: Alice, Score: 95.5%\"\nsprintf(\"%05d\", 42)      # \"00042\"  (zero-padded)\nsprintf(\"%-10s|\", \"hi\") # \"hi        |\"  (left-aligned, 10 wide)\n# sprintf is vectorized:\nsprintf(\"Item %d: %s\", 1:3, c(\"a\",\"b\",\"c\"))\n# [1] \"Item 1: a\" \"Item 2: b\" \"Item 3: c\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of print() / cat() / message() / sprintf() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── writeLines() — clean vector printing ──────────────\nwriteLines(c(\"line one\", \"line two\", \"line three\"))\n# line one\n# line two\n# line three\n# ── Suppress auto-print ───────────────────────────────\nx <- invisible(42)   # assigned but not printed at REPL\nf <- function() invisible(NULL)  # common for side-effect functions"
                  }
        ],
        tips: [
                  "cat() does not add a newline — always end with cat('...\\n') or use fill=TRUE.",
                  "message() goes to stderr so it stays visible when stdout is redirected to a file.",
                  "In R Markdown / Quarto, message() output appears in the console but not in the rendered document (unless message=TRUE chunk option is set).",
                  "Use sprintf() for precise numeric formatting; glue::glue() for readable string interpolation in modern code."
        ],
        mistake: "Using print() in a loop expecting raw text output. print(\"hello\") shows [1] \"hello\" with quotes and index. Use cat(\"hello\\n\") or writeLines(\"hello\") when you want clean text output.",
        shorthand: {
          verbose: "// Manual / verbose approach\npaste0(\"Name: \", name, \", Score: \", score)\n// More explicit but longer",
          concise: "sprintf(\"Name: %s, Score: %.1f\", name, score)\n# or: glue::glue(\"Name: {name}, Score: {score}\")",
        },
      },
    ],
  },

  // ── Section 2: Advanced R ─────────────────────────────────────────
  {
    id: "r-advanced-core",
    title: "Advanced R",
    entries: [
      {
        id: "r-apply-family",
        fn: "apply / sapply / lapply / tapply / mapply",
        desc: "Apply functions over arrays, matrices, lists, and groups.",
        category: "R Functional",
        subtitle: "Built-in functional programming without external packages",
        signature: "apply(X, MARGIN, FUN)  |  sapply(X, FUN)  |  tapply(X, INDEX, FUN)",
        descLong: "The apply family is base R functional programming. apply works on matrices/arrays by row or column. lapply always returns a list. sapply simplifies to vector/matrix. tapply applies by groups. mapply applies a function to multiple lists in parallel.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of apply / sapply / lapply / tapply / mapply — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── apply: matrices / arrays ──────────────────────────────\nm <- matrix(1:12, 3, 4)\n#      [,1] [,2] [,3] [,4]\n# [1,]    1    4    7   10\n# [2,]    2    5    8   11\n# [3,]    3    6    9   12\napply(m, 1, sum)    # row sums: 22 26 30\napply(m, 2, mean)   # col means: 2 5 8 11\napply(m, 1, range)  # min and max per row (returns matrix)\n# ── lapply: always returns list ────────────────────────────\nlapply(1:3, function(x) x^2)\n# [[1]] 1   [[2]] 4   [[3]] 9"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of apply / sapply / lapply / tapply / mapply — common patterns you'll see in production.\n# APPROACH  - Combine apply / sapply / lapply / tapply / mapply with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nlapply(list(a=1:2, b=3:4), function(x) sum(x))\n# $a 3  $b 7\n# ── sapply: simplifies result ──────────────────────────────\nsapply(1:3, function(x) x^2)   # 1 4 9  (simplified to vector)\nsapply(list(a=1:2, b=3:4), sum)  # a b; 3 7  (names preserved)\n# ── vapply: type-safe sapply ──────────────────────────────\nvapply(1:3, function(x) x^2, numeric(1))  # safe type check\n# numeric(1) declares: each result should be numeric, length 1\n# ── tapply: apply by groups ────────────────────────────────\nx <- c(1, 2, 3, 4, 5, 6)\ngroups <- c('A', 'B', 'A', 'B', 'A', 'B')"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of apply / sapply / lapply / tapply / mapply — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ntapply(x, groups, sum)\n# A  B\n# 9 12\ntapply(x, groups, mean)\n# A B\n# 3 4\n# ── mapply: multiple list inputs ───────────────────────────\nmapply(`+`, c(1,2,3), c(10,20,30))  # 11 22 33\nmapply(function(a,b) a*b, 1:3, c(2,4,6))  # 2 8 18"
                  }
        ],
        tips: [
                  "lapply always returns a list — use it when you need predictable output type for nested loops",
                  "sapply tries to simplify — it can silently return wrong types if results vary. vapply is safer for production",
                  "tapply is fast for grouped aggregation: `tapply(df$salary, df$dept, mean)` vs dplyr chain",
                  "Use apply(X, 1, FUN) for rows; apply(X, 2, FUN) for columns — 1=rows, 2=columns"
        ],
        mistake: "Using sapply in production code. If the function returns different lengths for different inputs, sapply returns a list instead of a vector — silently. Use vapply() with explicit type checking.",
        shorthand: {
          verbose: "// Manual / verbose approach\nsapply(1:5, function(x) if (x > 3) x^2 else NULL)\n# Unpredictable: list or vector?\n// More explicit but longer",
          concise: "vapply(1:5, function(x) x^2, numeric(1))\n# Safe: errors if type doesn't match",
        },
      },
      {
        id: "r-regex-strings",
        fn: "grep / grepl / sub / gsub / regex patterns",
        desc: "Pattern matching and string replacement with regular expressions.",
        category: "R Strings",
        subtitle: "Base R regex functions — grep(), grepl(), sub(), gsub()",
        signature: "grep(pattern, x)  |  grepl(pattern, x)  |  gsub(old, new, x)",
        descLong: "Base R regex functions find and manipulate text. grep() returns indices/values matching pattern. grepl() returns TRUE/FALSE. sub() replaces first match, gsub() replaces all. The stringr package provides cleaner alternatives (str_detect, str_replace) but base R functions work everywhere.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of grep / grepl / sub / gsub / regex patterns — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── grep: find matching indices / values ─────────────────\nx <- c('apple', 'banana', 'apricot', 'blueberry')\ngrep('ap', x)       # c(1, 3)  indices of matches\ngrep('ap', x, value=TRUE)  # c('apple', 'apricot')  values\n# ── grepl: logical TRUE/FALSE vector ────────────────────────\ngrepl('ap', x)      # TRUE FALSE TRUE FALSE\n# Filter using grepl:\nx[grepl('ap', x)]   # 'apple' 'apricot'\n# ── sub vs gsub: replace matches ───────────────────────────\ns <- 'The cat sat on the mat'\nsub('the', 'THE', s)   # 'The cat sat on THE mat'  (first only)\ngsub('the', 'THE', s)  # 'The cat sat on THE mat'  (all)\n# Note: case-sensitive. Add ignore.case=TRUE\ngsub('the', 'THE', s, ignore.case=TRUE)\n# 'THE cat sat on THE mat'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of grep / grepl / sub / gsub / regex patterns — common patterns you'll see in production.\n# APPROACH  - Combine grep / grepl / sub / gsub / regex patterns with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Regex patterns ────────────────────────────────────────\n# .     any character\n# *     zero or more\n# +     one or more\n# ?     zero or one\n# ^     start of string\n# $     end of string\n# [abc] any of a, b, c\n# [^abc]anything but a, b, c\n# \\d   digit\n# \\s   whitespace\n# \\w   word character\n# Examples:\ngrep('^[aeiou]', c('apple', 'banana', 'orange'))  # 1 3\ngrep('[0-9]', c('abc', 'a1b', 'def'))  # 2  (has digit)\ngrep('@', c('alice@example.com', 'bob'))  # 1\n# ── strsplit: split strings ────────────────────────────────\nstrsplit('apple,banana,orange', ',')\n# [[1]] 'apple' 'banana' 'orange'"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of grep / grepl / sub / gsub / regex patterns — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── nchar: string length ───────────────────────────────────\nnchar('hello')    # 5\n# ── substr: substring ──────────────────────────────────────\nsubstr('hello', 1, 3)   # 'hel'\nsubstring('hello', 2, 4)  # 'ell'  (more flexible)\n# ── paste: string concatenation ────────────────────────────\npaste('Hello', 'World')      # 'Hello World'\npaste('x', 1:3, sep='_')     # 'x_1' 'x_2' 'x_3'\npaste(c('a','b'), collapse=',')  # 'a,b'"
                  }
        ],
        tips: [
                  "grepl() + filter is the R idiom for regex-based filtering: `df[grepl(\"pattern\", df$col), ]`",
                  "Use raw strings or double-escape backslashes: `grep(\"\\\\d\", x)` to match digits",
                  "fixed=TRUE makes grep treat pattern as literal string — much faster if you don't need regex",
                  "Use stringr::str_* functions in new code — more consistent interface than base grep/gsub"
        ],
        mistake: "Using grep() when you want TRUE/FALSE. grep() returns indices. Use grepl() for logical matching: `if (any(grepl(\"pattern\", x)))`",
        shorthand: {
          verbose: "x <- c('apple', 'banana')\nidx <- grep('ap', x)  # c(1)\nif (length(idx) > 0) { }  # Wrong logic",
          concise: "if (any(grepl('ap', x))) { }  # TRUE/FALSE direct\nx[grepl('ap', x)]  # Filter with logical vector",
        },
      },
      {
        id: "r-factors",
        fn: "factor / levels / relevel / droplevels",
        desc: "Categorical variables with ordered/unordered levels.",
        category: "R Data",
        subtitle: "Define levels, reorder references, and handle unused levels",
        signature: "factor(x, levels, ordered)  |  relevel(x, ref)  |  droplevels(x)",
        descLong: "Factors represent categorical data with explicitly defined levels. In models, factors automatically create dummy variables. The reference level (first level by default) is the omitted category. Proper factor management prevents statistical errors and produces interpretable model output.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of factor / levels / relevel / droplevels — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Create factors ────────────────────────────────────────\nrating <- c('Low', 'High', 'Med', 'High', 'Low')\n# Default: alphabetical order\nf <- factor(rating)\nlevels(f)  # 'High' 'Low' 'Med'  ← NOT in intuitive order!\n# Specify order explicitly:\nf <- factor(rating, levels=c('Low', 'Med', 'High'))\nlevels(f)  # 'Low' 'Med' 'High'  ← correct order\n# Ordered factor:\nf_ord <- factor(rating, levels=c('Low', 'Med', 'High'), ordered=TRUE)\nf_ord[2] > f_ord[1]  # TRUE  (High > Low, because ordered)\n# ── Reference level (affects model output) ──────────────────\nfit1 <- lm(y ~ f, data=df)  # Low is reference (alphabetical)\n# Coefficients: (Intercept), fMed, fHigh"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of factor / levels / relevel / droplevels — common patterns you'll see in production.\n# APPROACH  - Combine factor / levels / relevel / droplevels with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfit2 <- lm(y ~ relevel(f, ref='Med'), data=df)  # Med is reference\n# Coefficients: (Intercept), fLow, fHigh\n# ── droplevels: remove unused levels ────────────────────────\nf <- factor(c('A', 'A', 'B'), levels=c('A', 'B', 'C', 'D'))\n# f has 4 levels even though only A, B are present\nf_dropped <- droplevels(f)  # only A, B remain\nlevels(f_dropped)  # 'A' 'B'\n# ── Combining factors ──────────────────────────────────────\nf1 <- factor(c('a', 'b'))\nf2 <- factor(c('x', 'y'))\n# Naive concatenation loses levels:\nc(f1, f2)  # 1 2 1 2  (integer codes!)\n# Correct: expand levels first\nf1_exp <- factor(f1, levels=union(levels(f1), levels(f2)))\nf2_exp <- factor(f2, levels=union(levels(f1), levels(f2)))\nc(f1_exp, f2_exp)  # a b x y with 4 levels"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of factor / levels / relevel / droplevels — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Converting factors ──────────────────────────────────────\n# Common mistake:\nas.numeric(factor(c('1', '2', '3')))  # 1 2 3  — gets level CODES\n# Correct for numeric factor:\nas.numeric(as.character(factor(c('1', '2', '3'))))  # 1 2 3\n# ── table: frequency counts ────────────────────────────────\ntable(rating)\n# Low High Med\n#  2   2   1\ntable(rating, education)  # 2D contingency table"
                  }
        ],
        tips: [
                  "Set factor levels explicitly — don't rely on alphabetical defaults. Models will be clearer",
                  "Use ordered=TRUE only when levels are truly ordered (Likert scales, income brackets)",
                  "The reference level matters for interpretation: `relevel(f, ref=\"desired\")` before modeling",
                  "droplevels() speeds up model fitting if data is a subset (unused levels cause overspecification)"
        ],
        mistake: "Mixing factor codes and values. `as.numeric(factor(c(\"10\",\"20\")))` returns 1,2 (the codes), not 10,20. Convert to character first: `as.numeric(as.character(...))`",
        shorthand: {
          verbose: "// Manual / verbose approach\nf <- factor(c('10', '20', '30'))\nas.numeric(f)  # 1 2 3 (wrong!)\n// More explicit but longer",
          concise: "as.numeric(as.character(f))  # 10 20 30 (correct)\n# Always convert to string first",
        },
      },
      {
        id: "r-dates-lubridate-basics",
        fn: "Dates: as.Date, difftime, seq.Date",
        desc: "Basic date manipulation without lubridate.",
        category: "R Dates",
        subtitle: "as.Date(), format(), seq.Date(), difftime() — base R approach",
        signature: "as.Date(\"2024-01-15\")  |  format(d, \"%Y-%m-%d\")  |  seq.Date(from, to, by)",
        descLong: "R represents dates as days since 1970-01-01. as.Date() parses strings. format() converts dates to display format. seq.Date() creates date sequences. The lubridate package is friendlier, but base R functions work anywhere.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Dates: as.Date, difftime, seq.Date — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Create dates ──────────────────────────────────────────\nas.Date('2024-01-15')           # 2024-01-15\nas.Date('01/15/24', format='%m/%d/%y')  # parse non-standard\nas.Date('15-Jan-2024', format='%d-%b-%Y')\n# ── Numeric representation (days since 1970-01-01) ─────────\nd <- as.Date('2024-01-15')\nas.numeric(d)  # 19731  (days since epoch)\n# ── Extract components ────────────────────────────────────\nd <- as.Date('2024-07-04')\nformat(d, '%Y')     # '2024'\nformat(d, '%m')     # '07'\nformat(d, '%d')     # '04'\nformat(d, '%A')     # 'Thursday'\nformat(d, '%B')     # 'July'\nformat(d, '%Y-%m-%d')  # '2024-07-04'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Dates: as.Date, difftime, seq.Date — common patterns you'll see in production.\n# APPROACH  - Combine Dates: as.Date, difftime, seq.Date with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# weekdays() and months():\nweekdays(d)         # 'Thursday'\nmonths(d)           # 'July'\n# ── Arithmetic (days) ──────────────────────────────────────\nd + 30              # 30 days later\nd - as.Date('2024-01-01')  # 185 days difference\n# ── difftime: duration comparison ──────────────────────────\nd1 <- as.Date('2024-01-01')\nd2 <- as.Date('2024-12-31')\ndiff <- difftime(d2, d1, units='days')\n# Time difference of 365 days\ndiff / 365          # ~1 year"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Dates: as.Date, difftime, seq.Date — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── seq.Date: create sequences ────────────────────────────\nseq.Date(as.Date('2024-01-01'), as.Date('2024-12-31'), by='month')\nseq.Date(as.Date('2024-01-01'), by='week', length.out=10)\nseq.Date(as.Date('2024-01-01'), by='quarter', length.out=4)\n# ── POSIXct: datetimes (with time-of-day) ──────────────────\nas.POSIXct('2024-01-15 14:30:00')  # datetime\nas.POSIXct('2024-01-15', tz='America/New_York')  # with timezone\n# Extract hour/minute:\nformat(as.POSIXct('2024-01-15 14:30:00'), '%H:%M:%S')  # '14:30:00'"
                  }
        ],
        tips: [
                  "Dates are integers under the hood — arithmetic just works (+30 days, -1 week)",
                  "Always use ISO format (YYYY-MM-DD) for unambiguous date handling",
                  "Use POSIXct for timestamps with time-of-day; Date for dates only",
                  "Specify timezone when working with datetimes: tz=\"UTC\" or tz=\"America/New_York\""
        ],
        mistake: "Mixing Date and POSIXct. Arithmetic works between them, but coercion silently happens. Be explicit: `as.Date(datetime_obj)`",
        shorthand: {
          verbose: "d <- as.Date('2024-01-15')\ndt <- as.POSIXct('2024-01-15 14:30:00')\nd + dt  # Coercion silently happens",
          concise: "d <- as.Date('2024-01-15')\ndt_as_date <- as.Date(dt)  # Explicit conversion\ndt_as_posix <- as.POSIXct(d)  # Or reverse",
        },
      },
      {
        id: "r-environments",
        fn: "Environments & new.env / assign / get",
        desc: "Work with R's environment system for advanced programming.",
        category: "R Environments",
        subtitle: "Create, modify, and introspect environments",
        signature: "new.env()  |  assign(name, value, envir=e)  |  get(name, envir=e)",
        descLong: "Environments are collections of name-value pairs. Most user code uses the global environment implicitly. Advanced techniques create new environments for data isolation, caching, and building custom APIs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Environments & new.env / assign / get — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Create environment ────────────────────────────────────\ne <- new.env()\n# Assign values\ne$x <- 42\ne[['y']] <- 'hello'\nassign('z', 3.14, envir=e)\n# Access values\ne$x              # 42\nget('y', envir=e)  # 'hello'\ne[['z']]         # 3.14\n# ── List contents ──────────────────────────────────────────\nls(e)            # 'x' 'y' 'z'\nexists('x', envir=e)  # TRUE\nexists('w', envir=e)  # FALSE\n# ── Remove from environment ────────────────────────────────\nrm('x', envir=e)\nls(e)            # 'y' 'z'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Environments & new.env / assign / get — common patterns you'll see in production.\n# APPROACH  - Combine Environments & new.env / assign / get with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Parent environment / inheritance ─────────────────────\ne1 <- new.env()\ne1$a <- 1\ne2 <- new.env(parent=e1)  # e2 inherits from e1\ne2$b <- 2\ne2$a  # finds 'a' in parent e1: 1\nls(e2)  # only 'b' (a is in parent)\n# ── Global and local envs ──────────────────────────────────\nenvironment()    # current (usually .GlobalEnv)\nglobalenv()      # .GlobalEnv (top-level)\nparent.env(environment())  # parent of current env\n# ── Accessing with string names (dynamic) ─────────────────\ncol_names <- c('x', 'y', 'z')\ne <- new.env()\nassign('x', 10, envir=e)\nassign('y', 20, envir=e)\nassign('z', 30, envir=e)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Environments & new.env / assign / get — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Get a value by string name:\ncol_name <- 'y'\nget(col_name, envir=e)  # 20\n# ── Caching with environments ──────────────────────────────\ncache <- new.env()\nexpensive_fn <- function(x) {\n  key <- paste0('result_', x)\n  if (exists(key, envir=cache)) {\n    cat('Cache hit!\\n')\n    return(get(key, envir=cache))\n  }\n  # Compute result\n  result <- slow_computation(x)\n  assign(key, result, envir=cache)\n  result\n}"
                  }
        ],
        tips: [
                  "new.env() creates a truly isolated namespace — useful for packages and modules",
                  "parent.env() climbs the environment chain — lexical scoping walks up this chain looking for variables",
                  "Cache results in an environment to avoid recomputation: check exists(), then get()",
                  "Use get() / assign() for programmatic access (string variable names)"
        ],
        mistake: "Trying to use == to compare environments. Environments are reference objects — use identical(). Modification is in-place; no reassignment needed.",
        shorthand: {
          verbose: "e1 <- new.env()\ne2 <- e1\ne1 == e2  # Error\ne1$x <- 10\ne2$x  # 10 (modified in-place)",
          concise: "identical(e1, e2)  # TRUE (same object)\ne1 <- new.env()  # Create separate env\ne1$x <- 10  # In-place modification",
        },
      },
      {
        id: "r-s3-dispatch",
        fn: "S3 Method Dispatch",
        desc: "Write polymorphic functions that behave differently by object class.",
        category: "R OOP",
        subtitle: "Define methods for classes using obj.class notation",
        signature: "UseMethod(\"generic\")  |  fn.ClassName <- function(x) {...}",
        descLong: "S3 is R's informal but ubiquitous object system. A generic function routes to methods based on the class attribute. Simple to create but less rigorous than S4. Most base R functions (print, summary, plot) use S3.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of S3 Method Dispatch — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Simple S3 example: speak method ────────────────────\nspeak <- function(x, ...) UseMethod('speak')\nspeak.default <- function(x, ...) cat('...')\nspeak.dog <- function(x, ...) cat('Woof!\\n')\nspeak.cat <- function(x, ...) cat('Meow!\\n')\n# Create dog and cat objects:\ndog <- list(name='Fido')\nclass(dog) <- 'dog'\ncat_obj <- list(name='Whiskers')\nclass(cat_obj) <- 'cat'\nspeak(dog)     # 'Woof!'\nspeak(cat_obj) # 'Meow!'\nspeak(42)      # '...'  (default)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of S3 Method Dispatch — common patterns you'll see in production.\n# APPROACH  - Combine S3 Method Dispatch with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Check class and dispatch ──────────────────────────────\nclass(dog)            # 'dog'\ninherits(dog, 'dog')  # TRUE\nmethods('speak')      # list all speak.* methods\n# ── Multiple inheritance ────────────────────────────────────\nanimal <- list(name='Fido', type='dog')\nclass(animal) <- c('dog', 'animal')\n# speak dispatches to speak.dog first (left-to-right)\n# ── NextMethod: call parent method ───────────────────────\nspeak.animal <- function(x, ...) cat('Some sound\\n')\nspeak.dog <- function(x, ...) {\n  cat('Dog named', x$name, 'says: ')\n  NextMethod()  # calls speak.animal\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of S3 Method Dispatch — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nspeak(dog)  # 'Dog named Fido says: Some sound'\n# ── Example: custom print method ───────────────────────────\nmy_data <- data.frame(a=1:3, b=4:6)\nclass(my_data) <- c('my_class', 'data.frame')\nprint.my_class <- function(x, ...) {\n  cat('=== My Custom Data ===\\n')\n  print(as.data.frame(x))  # use default print for data.frame\n  cat('===\\n')\n}\nmy_data  # calls print.my_class automatically"
                  }
        ],
        tips: [
                  "Class is just an attribute: `class(obj) <- \"MyClass\"`",
                  "Write generic functions using UseMethod() — it determines which method to call",
                  "NextMethod() calls the next method in the inheritance chain",
                  "Methods don't need to be defined before the generic — R finds them dynamically"
        ],
        mistake: "Forgetting that UseMethod() triggers dispatch. If you call UseMethod inside a generic, the generic should do nothing else — dispatch happens to the appropriate method.",
        shorthand: {
          verbose: "myfn <- function(x) {\n  cat('Before dispatch\\n')\n  UseMethod('myfn')  # Transfers to myfn.class\n  cat('After dispatch')  # Never runs!\n}",
          concise: "myfn <- function(x) UseMethod('myfn')\nmyfn.dog <- function(x) cat('Woof!')\nmyfn.cat <- function(x) cat('Meow!')",
        },
      },
      {
        id: "r-apply-family",
        fn: "apply / sapply / lapply / tapply / mapply",
        desc: "Apply functions over arrays, matrices, lists, and groups.",
        category: "R Functional",
        subtitle: "Built-in functional programming without external packages",
        signature: "apply(X, MARGIN, FUN)  |  sapply(X, FUN)  |  tapply(X, INDEX, FUN)",
        descLong: "The apply family is base R functional programming. apply works on matrices/arrays by row or column. lapply always returns a list. sapply simplifies to vector/matrix. tapply applies by groups. mapply applies a function to multiple lists in parallel.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of apply / sapply / lapply / tapply / mapply — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── apply: matrices / arrays ──────────────────────────────\nm <- matrix(1:12, 3, 4)\n#      [,1] [,2] [,3] [,4]\n# [1,]    1    4    7   10\n# [2,]    2    5    8   11\n# [3,]    3    6    9   12\napply(m, 1, sum)    # row sums: 22 26 30\napply(m, 2, mean)   # col means: 2 5 8 11\napply(m, 1, range)  # min and max per row (returns matrix)\n# ── lapply: always returns list ────────────────────────────\nlapply(1:3, function(x) x^2)\n# [[1]] 1   [[2]] 4   [[3]] 9"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of apply / sapply / lapply / tapply / mapply — common patterns you'll see in production.\n# APPROACH  - Combine apply / sapply / lapply / tapply / mapply with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nlapply(list(a=1:2, b=3:4), function(x) sum(x))\n# $a 3  $b 7\n# ── sapply: simplifies result ──────────────────────────────\nsapply(1:3, function(x) x^2)   # 1 4 9  (simplified to vector)\nsapply(list(a=1:2, b=3:4), sum)  # a b; 3 7  (names preserved)\n# ── vapply: type-safe sapply ──────────────────────────────\nvapply(1:3, function(x) x^2, numeric(1))  # safe type check\n# numeric(1) declares: each result should be numeric, length 1\n# ── tapply: apply by groups ────────────────────────────────\nx <- c(1, 2, 3, 4, 5, 6)\ngroups <- c('A', 'B', 'A', 'B', 'A', 'B')"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of apply / sapply / lapply / tapply / mapply — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ntapply(x, groups, sum)\n# A  B\n# 9 12\ntapply(x, groups, mean)\n# A B\n# 3 4\n# ── mapply: multiple list inputs ───────────────────────────\nmapply(\"+\", c(1,2,3), c(10,20,30))  # 11 22 33\nmapply(function(a,b) a*b, 1:3, c(2,4,6))  # 2 8 18"
                  }
        ],
        tips: [
                  "lapply always returns a list — use it when you need predictable output type for nested loops",
                  "sapply tries to simplify — it can silently return wrong types if results vary. vapply is safer for production",
                  "tapply is fast for grouped aggregation: `tapply(df$salary, df$dept, mean)` vs dplyr chain",
                  "Use apply(X, 1, FUN) for rows; apply(X, 2, FUN) for columns — 1=rows, 2=columns"
        ],
        mistake: "Using sapply in production code. If the function returns different lengths for different inputs, sapply returns a list instead of a vector — silently. Use vapply() with explicit type checking.",
        shorthand: {
          verbose: "results <- list()\nfor (i in 1:length(x)) {\n  results[[i]] <- fn(x[[i]])\n}",
          concise: "results <- lapply(x, fn)",
        },
      },
      {
        id: "r-regex-strings",
        fn: "grep / grepl / sub / gsub / regex patterns",
        desc: "Pattern matching and string replacement with regular expressions.",
        category: "R Strings",
        subtitle: "Base R regex functions — grep(), grepl(), sub(), gsub()",
        signature: "grep(pattern, x)  |  grepl(pattern, x)  |  gsub(old, new, x)",
        descLong: "Base R regex functions find and manipulate text. grep() returns indices/values matching pattern. grepl() returns TRUE/FALSE. sub() replaces first match, gsub() replaces all. The stringr package provides cleaner alternatives (str_detect, str_replace) but base R functions work everywhere.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of grep / grepl / sub / gsub / regex patterns — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── grep: find matching indices / values ─────────────────\nx <- c('apple', 'banana', 'apricot', 'blueberry')\ngrep('ap', x)       # c(1, 3)  indices of matches\ngrep('ap', x, value=TRUE)  # c('apple', 'apricot')  values\n# ── grepl: logical TRUE/FALSE vector ────────────────────────\ngrepl('ap', x)      # TRUE FALSE TRUE FALSE\n# Filter using grepl:\nx[grepl('ap', x)]   # 'apple' 'apricot'\n# ── sub vs gsub: replace matches ───────────────────────────\ns <- 'The cat sat on the mat'\nsub('the', 'THE', s)   # 'The cat sat on THE mat'  (first only)\ngsub('the', 'THE', s)  # 'The cat sat on THE mat'  (all)\n# Note: case-sensitive. Add ignore.case=TRUE\ngsub('the', 'THE', s, ignore.case=TRUE)\n# 'THE cat sat on THE mat'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of grep / grepl / sub / gsub / regex patterns — common patterns you'll see in production.\n# APPROACH  - Combine grep / grepl / sub / gsub / regex patterns with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Regex patterns ────────────────────────────────────────\n# .     any character\n# *     zero or more\n# +     one or more\n# ?     zero or one\n# ^     start of string\n# $     end of string\n# [abc] any of a, b, c\n# [^abc]anything but a, b, c\n# \\d   digit\n# \\s   whitespace\n# \\w   word character\n# Examples:\ngrep('^[aeiou]', c('apple', 'banana', 'orange'))  # 1 3\ngrep('[0-9]', c('abc', 'a1b', 'def'))  # 2  (has digit)\ngrep('@', c('alice@example.com', 'bob'))  # 1\n# ── strsplit: split strings ────────────────────────────────\nstrsplit('apple,banana,orange', ',')\n# [[1]] 'apple' 'banana' 'orange'"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of grep / grepl / sub / gsub / regex patterns — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── nchar: string length ───────────────────────────────────\nnchar('hello')    # 5\n# ── substr: substring ──────────────────────────────────────\nsubstr('hello', 1, 3)   # 'hel'\nsubstring('hello', 2, 4)  # 'ell'  (more flexible)\n# ── paste: string concatenation ────────────────────────────\npaste('Hello', 'World')      # 'Hello World'\npaste('x', 1:3, sep='_')     # 'x_1' 'x_2' 'x_3'\npaste(c('a','b'), collapse=',')  # 'a,b'"
                  }
        ],
        tips: [
                  "grepl() + filter is the R idiom for regex-based filtering: `df[grepl(\"pattern\", df$col), ]`",
                  "Use raw strings or double-escape backslashes: `grep(\"\\\\d\", x)` to match digits",
                  "fixed=TRUE makes grep treat pattern as literal string — much faster if you don't need regex",
                  "Use stringr::str_* functions in new code — more consistent interface than base grep/gsub"
        ],
        mistake: "Using grep() when you want TRUE/FALSE. grep() returns indices. Use grepl() for logical matching: `if (any(grepl(\"pattern\", x)))`",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-factors",
        fn: "factor / levels / relevel / droplevels",
        desc: "Categorical variables with ordered/unordered levels.",
        category: "R Data",
        subtitle: "Define levels, reorder references, and handle unused levels",
        signature: "factor(x, levels, ordered)  |  relevel(x, ref)  |  droplevels(x)",
        descLong: "Factors represent categorical data with explicitly defined levels. In models, factors automatically create dummy variables. The reference level (first level by default) is the omitted category. Proper factor management prevents statistical errors and produces interpretable model output.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of factor / levels / relevel / droplevels — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Create factors ────────────────────────────────────────\nrating <- c('Low', 'High', 'Med', 'High', 'Low')\n# Default: alphabetical order\nf <- factor(rating)\nlevels(f)  # 'High' 'Low' 'Med'  ← NOT in intuitive order!\n# Specify order explicitly:\nf <- factor(rating, levels=c('Low', 'Med', 'High'))\nlevels(f)  # 'Low' 'Med' 'High'  ← correct order\n# Ordered factor:\nf_ord <- factor(rating, levels=c('Low', 'Med', 'High'), ordered=TRUE)\nf_ord[2] > f_ord[1]  # TRUE  (High > Low, because ordered)\n# ── Reference level (affects model output) ──────────────────\nfit1 <- lm(y ~ f, data=df)  # Low is reference (alphabetical)\n# Coefficients: (Intercept), fMed, fHigh"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of factor / levels / relevel / droplevels — common patterns you'll see in production.\n# APPROACH  - Combine factor / levels / relevel / droplevels with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfit2 <- lm(y ~ relevel(f, ref='Med'), data=df)  # Med is reference\n# Coefficients: (Intercept), fLow, fHigh\n# ── droplevels: remove unused levels ────────────────────────\nf <- factor(c('A', 'A', 'B'), levels=c('A', 'B', 'C', 'D'))\n# f has 4 levels even though only A, B are present\nf_dropped <- droplevels(f)  # only A, B remain\nlevels(f_dropped)  # 'A' 'B'\n# ── Combining factors ──────────────────────────────────────\nf1 <- factor(c('a', 'b'))\nf2 <- factor(c('x', 'y'))\n# Naive concatenation loses levels:\nc(f1, f2)  # 1 2 1 2  (integer codes!)\n# Correct: expand levels first\nf1_exp <- factor(f1, levels=union(levels(f1), levels(f2)))\nf2_exp <- factor(f2, levels=union(levels(f1), levels(f2)))\nc(f1_exp, f2_exp)  # a b x y with 4 levels"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of factor / levels / relevel / droplevels — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Converting factors ──────────────────────────────────────\n# Common mistake:\nas.numeric(factor(c('1', '2', '3')))  # 1 2 3  — gets level CODES\n# Correct for numeric factor:\nas.numeric(as.character(factor(c('1', '2', '3'))))  # 1 2 3\n# ── table: frequency counts ────────────────────────────────\ntable(rating)\n# Low High Med\n#  2   2   1\ntable(rating, education)  # 2D contingency table"
                  }
        ],
        tips: [
                  "Set factor levels explicitly — don't rely on alphabetical defaults. Models will be clearer",
                  "Use ordered=TRUE only when levels are truly ordered (Likert scales, income brackets)",
                  "The reference level matters for interpretation: `relevel(f, ref=\"desired\")` before modeling",
                  "droplevels() speeds up model fitting if data is a subset (unused levels cause overspecification)"
        ],
        mistake: "Mixing factor codes and values. `as.numeric(factor(c(\"10\",\"20\")))` returns 1,2 (the codes), not 10,20. Convert to character first: `as.numeric(as.character(...))`",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-dates-lubridate-basics",
        fn: "Dates: as.Date, difftime, seq.Date",
        desc: "Basic date manipulation without lubridate.",
        category: "R Dates",
        subtitle: "as.Date(), format(), seq.Date(), difftime() — base R approach",
        signature: "as.Date(\"2024-01-15\")  |  format(d, \"%Y-%m-%d\")  |  seq.Date(from, to, by)",
        descLong: "R represents dates as days since 1970-01-01. as.Date() parses strings. format() converts dates to display format. seq.Date() creates date sequences. The lubridate package is friendlier, but base R functions work anywhere.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Dates: as.Date, difftime, seq.Date — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Create dates ──────────────────────────────────────────\nas.Date('2024-01-15')           # 2024-01-15\nas.Date('01/15/24', format='%m/%d/%y')  # parse non-standard\nas.Date('15-Jan-2024', format='%d-%b-%Y')\n# ── Numeric representation (days since 1970-01-01) ─────────\nd <- as.Date('2024-01-15')\nas.numeric(d)  # 19731  (days since epoch)\n# ── Extract components ────────────────────────────────────\nd <- as.Date('2024-07-04')\nformat(d, '%Y')     # '2024'\nformat(d, '%m')     # '07'\nformat(d, '%d')     # '04'\nformat(d, '%A')     # 'Thursday'\nformat(d, '%B')     # 'July'\nformat(d, '%Y-%m-%d')  # '2024-07-04'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Dates: as.Date, difftime, seq.Date — common patterns you'll see in production.\n# APPROACH  - Combine Dates: as.Date, difftime, seq.Date with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# weekdays() and months():\nweekdays(d)         # 'Thursday'\nmonths(d)           # 'July'\n# ── Arithmetic (days) ──────────────────────────────────────\nd + 30              # 30 days later\nd - as.Date('2024-01-01')  # 185 days difference\n# ── difftime: duration comparison ──────────────────────────\nd1 <- as.Date('2024-01-01')\nd2 <- as.Date('2024-12-31')\ndiff <- difftime(d2, d1, units='days')\n# Time difference of 365 days\ndiff / 365          # ~1 year"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Dates: as.Date, difftime, seq.Date — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── seq.Date: create sequences ────────────────────────────\nseq.Date(as.Date('2024-01-01'), as.Date('2024-12-31'), by='month')\nseq.Date(as.Date('2024-01-01'), by='week', length.out=10)\nseq.Date(as.Date('2024-01-01'), by='quarter', length.out=4)\n# ── POSIXct: datetimes (with time-of-day) ──────────────────\nas.POSIXct('2024-01-15 14:30:00')  # datetime\nas.POSIXct('2024-01-15', tz='America/New_York')  # with timezone\n# Extract hour/minute:\nformat(as.POSIXct('2024-01-15 14:30:00'), '%H:%M:%S')  # '14:30:00'"
                  }
        ],
        tips: [
                  "Dates are integers under the hood — arithmetic just works (+30 days, -1 week)",
                  "Always use ISO format (YYYY-MM-DD) for unambiguous date handling",
                  "Use POSIXct for timestamps with time-of-day; Date for dates only",
                  "Specify timezone when working with datetimes: tz=\"UTC\" or tz=\"America/New_York\""
        ],
        mistake: "Mixing Date and POSIXct. Arithmetic works between them, but coercion silently happens. Be explicit: `as.Date(datetime_obj)`",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-environments",
        fn: "Environments & new.env / assign / get",
        desc: "Work with R's environment system for advanced programming.",
        category: "R Environments",
        subtitle: "Create, modify, and introspect environments",
        signature: "new.env()  |  assign(name, value, envir=e)  |  get(name, envir=e)",
        descLong: "Environments are collections of name-value pairs. Most user code uses the global environment implicitly. Advanced techniques create new environments for data isolation, caching, and building custom APIs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Environments & new.env / assign / get — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Create environment ────────────────────────────────────\ne <- new.env()\n# Assign values\ne$x <- 42\ne[['y']] <- 'hello'\nassign('z', 3.14, envir=e)\n# Access values\ne$x              # 42\nget('y', envir=e)  # 'hello'\ne[['z']]         # 3.14\n# ── List contents ──────────────────────────────────────────\nls(e)            # 'x' 'y' 'z'\nexists('x', envir=e)  # TRUE\nexists('w', envir=e)  # FALSE\n# ── Remove from environment ────────────────────────────────\nrm('x', envir=e)\nls(e)            # 'y' 'z'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Environments & new.env / assign / get — common patterns you'll see in production.\n# APPROACH  - Combine Environments & new.env / assign / get with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Parent environment / inheritance ─────────────────────\ne1 <- new.env()\ne1$a <- 1\ne2 <- new.env(parent=e1)  # e2 inherits from e1\ne2$b <- 2\ne2$a  # finds 'a' in parent e1: 1\nls(e2)  # only 'b' (a is in parent)\n# ── Global and local envs ──────────────────────────────────\nenvironment()    # current (usually .GlobalEnv)\nglobalenv()      # .GlobalEnv (top-level)\nparent.env(environment())  # parent of current env\n# ── Accessing with string names (dynamic) ─────────────────\ncol_names <- c('x', 'y', 'z')\ne <- new.env()\nassign('x', 10, envir=e)\nassign('y', 20, envir=e)\nassign('z', 30, envir=e)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Environments & new.env / assign / get — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Get a value by string name:\ncol_name <- 'y'\nget(col_name, envir=e)  # 20\n# ── Caching with environments ──────────────────────────────\ncache <- new.env()\nexpensive_fn <- function(x) {\n  key <- paste0('result_', x)\n  if (exists(key, envir=cache)) {\n    cat('Cache hit!\\n')\n    return(get(key, envir=cache))\n  }\n  # Compute result\n  result <- slow_computation(x)\n  assign(key, result, envir=cache)\n  result\n}"
                  }
        ],
        tips: [
                  "new.env() creates a truly isolated namespace — useful for packages and modules",
                  "parent.env() climbs the environment chain — lexical scoping walks up this chain looking for variables",
                  "Cache results in an environment to avoid recomputation: check exists(), then get()",
                  "Use get() / assign() for programmatic access (string variable names)"
        ],
        mistake: "Trying to use == to compare environments. Environments are reference objects — use identical(). Modification is in-place; no reassignment needed.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-s3-dispatch",
        fn: "S3 Method Dispatch",
        desc: "Write polymorphic functions that behave differently by object class.",
        category: "R OOP",
        subtitle: "Define methods for classes using obj.class notation",
        signature: "UseMethod(\"generic\")  |  fn.ClassName <- function(x) {...}",
        descLong: "S3 is R's informal but ubiquitous object system. A generic function routes to methods based on the class attribute. Simple to create but less rigorous than S4. Most base R functions (print, summary, plot) use S3.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of S3 Method Dispatch — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Simple S3 example: speak method ────────────────────\nspeak <- function(x, ...) UseMethod('speak')\nspeak.default <- function(x, ...) cat('...')\nspeak.dog <- function(x, ...) cat('Woof!\\n')\nspeak.cat <- function(x, ...) cat('Meow!\\n')\n# Create dog and cat objects:\ndog <- list(name='Fido')\nclass(dog) <- 'dog'\ncat_obj <- list(name='Whiskers')\nclass(cat_obj) <- 'cat'\nspeak(dog)     # 'Woof!'\nspeak(cat_obj) # 'Meow!'\nspeak(42)      # '...'  (default)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of S3 Method Dispatch — common patterns you'll see in production.\n# APPROACH  - Combine S3 Method Dispatch with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Check class and dispatch ──────────────────────────────\nclass(dog)            # 'dog'\ninherits(dog, 'dog')  # TRUE\nmethods('speak')      # list all speak.* methods\n# ── Multiple inheritance ────────────────────────────────────\nanimal <- list(name='Fido', type='dog')\nclass(animal) <- c('dog', 'animal')\n# speak dispatches to speak.dog first (left-to-right)\n# ── NextMethod: call parent method ───────────────────────\nspeak.animal <- function(x, ...) cat('Some sound\\n')\nspeak.dog <- function(x, ...) {\n  cat('Dog named', x$name, 'says: ')\n  NextMethod()  # calls speak.animal\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of S3 Method Dispatch — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nspeak(dog)  # 'Dog named Fido says: Some sound'\n# ── Example: custom print method ───────────────────────────\nmy_data <- data.frame(a=1:3, b=4:6)\nclass(my_data) <- c('my_class', 'data.frame')\nprint.my_class <- function(x, ...) {\n  cat('=== My Custom Data ===\\n')\n  print(as.data.frame(x))  # use default print for data.frame\n  cat('===\\n')\n}\nmy_data  # calls print.my_class automatically"
                  }
        ],
        tips: [
                  "Class is just an attribute: `class(obj) <- \"MyClass\"`",
                  "Write generic functions using UseMethod() — it determines which method to call",
                  "NextMethod() calls the next method in the inheritance chain",
                  "Methods don't need to be defined before the generic — R finds them dynamically"
        ],
        mistake: "Forgetting that UseMethod() triggers dispatch. If you call UseMethod inside a generic, the generic should do nothing else — dispatch happens to the appropriate method.",
        shorthand: {
          verbose: "# Long-form explicit version\nresult <- function_call(data,\n  argument1 = value1,\n  argument2 = value2\n)\nprint(result)",
          concise: "result <- data |> function_call(arg1=val1, arg2=val2)",
        },
      },
      {
        id: "r-vectors-advanced",
        fn: "Advanced Vector Operations — Subsetting, Vectorization, Recycling",
        desc: "Mastery of vectors: logical subsetting, which(), match(), %in%, recycling rules.",
        category: "R Core",
        subtitle: "Vectorized operations, logical subsetting, which(), match(), %in%",
        signature: "x[x > 0]  |  which()  |  match()  |  %in%  |  x[-index]",
        descLong: "Vectors are R's atomic unit. Mastering vector operations beats loops. Logical subsetting: x[condition]. which() returns indices. match() finds positions. %in% checks membership. Recycling rules automatically extend shorter vectors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Advanced Vector Operations — Subsetting, Vectorization, Recycling — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Logical subsetting ─────────────────────────────────────\nx <- c(10, 20, 30, 40, 50)\nx > 25              # TRUE FALSE TRUE TRUE TRUE\nx[x > 25]          # 30 40 50\n# Multiple conditions:\nx[x > 20 & x < 50]   # 30 40\nx[x < 15 | x > 40]   # 10 50\n# Negate with !\nx[!(x > 25)]       # 10 20\n# ── which() — indices of TRUE values ───────────────────\nwhich(x > 25)      # 3 4 5  (indices, not values)\n# Negative indexing (drop elements):\nx[-which(x > 25)]  # 10 20  (remove > 25)\n# ── match() — find positions ────────────────────────────\nmatch(c(30, 10), x)  # 3 1  (positions of 30 and 10 in x)\nmatch('b', c('a', 'b', 'c'))  # 2"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Advanced Vector Operations — Subsetting, Vectorization, Recycling — common patterns you'll see in production.\n# APPROACH  - Combine Advanced Vector Operations — Subsetting, Vectorization, Recycling with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Returns NA for non-matches:\nmatch(c(25, 30, 50), x)  # NA 3 5\n# ── %in% — membership testing ──────────────────────────\nc(10, 25, 30) %in% x   # TRUE FALSE TRUE\nwhich(x %in% c(10, 50))  # 1 5  (indices of 10 and 50)\n# ── Negative indexing ──────────────────────────────────\nx[-3]              # 10 20 40 50  (drop 3rd element)\nx[-c(2, 4)]        # 10 30 50  (drop 2nd and 4th)\n# ── Named vector subsetting ────────────────────────────\nv <- c(a=1, b=2, c=3, d=4)\nv['b']             # 2\nv[c('a', 'd')]     # 1 4\n# ── Recycling rules ────────────────────────────────────\nc(1, 2, 3) + c(10, 20)  # 11 22 13  (second vector recycled)\nmatrix(1:6, nrow=2)  # fills column-by-column"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Advanced Vector Operations — Subsetting, Vectorization, Recycling — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Vectorized operations:\nsin(c(0, pi/2, pi))  # applied element-wise\ndf <- data.frame(x=1:5, y=6:10)\ndf$x * 2           # 2 4 6 8 10\n# ── head() / tail() for preview ────────────────────────\nhead(x, 3)         # first 3: 10 20 30\ntail(x, 2)         # last 2: 40 50\n# ── Vectorized conditional: ifelse() ────────────────────\nifelse(x > 25, \"high\", \"low\")\n# \"low\" \"low\" \"high\" \"high\" \"high\""
                  }
        ],
        tips: [
                  "Logical subsetting is vectorized — x[condition] is faster than loops",
                  "which() returns indices, grepl()/grep() returns values — know the difference",
                  "match() finds first occurrence, %in% checks membership — different use cases",
                  "Recycling happens silently — c(1,2) + c(10,20,30) recycles c(1,2) to match length"
        ],
        mistake: "Using == to check if value is in vector. x == c(1,2,3) returns vector of booleans. Use %in%: x %in% c(1,2,3) or any(x == c(1,2,3)).",
        shorthand: {
          verbose: "x <- 1:10\nindices <- which(x > 5)\nresult <- x[indices]",
          concise: "x[x > 5]  # direct logical subsetting",
        },
      },
      {
        id: "r-lists",
        fn: "Lists — named elements, [[]] subsetting, lapply, flattening",
        desc: "Lists hold mixed types: [[]] for extraction, $ for named access, lapply/sapply iteration.",
        category: "R Data",
        subtitle: "list(), [[]], $, lapply(), sapply(), unlist(), nested structure",
        signature: "list(a=1, b=\"x\")  |  lst[[\"a\"]]  |  lst$b  |  lapply(lst, fn)",
        descLong: "Lists are flexible containers mixing types/lengths. [[ ]] extracts single element, [ ] extracts sublist. $ accesses by name. lapply applies function to each element (returns list), sapply simplifies (returns vector/matrix).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Lists — named elements, [[]] subsetting, lapply, flattening — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Create lists ──────────────────────────────────────────\nlst <- list(\n  name = \"Alice\",\n  age = 30,\n  scores = c(85, 90, 78),\n  meta = list(active = TRUE, level = 2)\n)\n# ── Access elements ────────────────────────────────────\nlst[[\"name\"]]      # \"Alice\"  (extract single)\nlst[1]             # list(name=\"Alice\")  (sublist)\nlst$age            # 30  (named access)\nlst[[2]]           # 30  (positional)\n# ── Nested access ──────────────────────────────────────\nlst$meta$level     # 2\nlst[[\"meta\"]][[\"active\"]]  # TRUE\n# ── Iterate with lapply (returns list) ────────────────\nlapply(lst, class)\n# $name\\n# \"character\"\n# $age\\n# \"numeric\"\n# ... etc"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Lists — named elements, [[]] subsetting, lapply, flattening — common patterns you'll see in production.\n# APPROACH  - Combine Lists — named elements, [[]] subsetting, lapply, flattening with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Iterate with sapply (simplifies) ────────────────\nsapply(lst, length)\n# name      age   scores      meta\n#    1        1        3        2\n# ── Modify list elements ──────────────────────────────\nlst$status <- \"active\"  # add element\nlst$age <- 31           # update\nlst$name <- NULL        # remove\n# ── List of lists (nested) ────────────────────────────\ndata_list <- list(\n  group_a = list(x=1:3, y=4:6),\n  group_b = list(x=7:9, y=10:12)\n)\ndata_list[[\"group_a\"]]$x  # 1 2 3\nlapply(data_list, function(g) mean(g$x))  # mean of x per group\n# ── Convert list to vector: unlist() ────────────────\nlst_simple <- list(a=1, b=2, c=3)\nunlist(lst_simple)  # a b c; 1 2 3  (vector)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Lists — named elements, [[]] subsetting, lapply, flattening — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── data.frame from list of equal-length vectors ─────\ndf <- as.data.frame(list(\n  id = 1:3,\n  name = c(\"A\", \"B\", \"C\"),\n  value = c(10, 20, 30)\n))\n# ── Remove NULL elements (flattening) ──────────────────\nlst <- list(a=1, b=NULL, c=3, d=NULL)\nCompact <- function(lst) lst[!sapply(lst, is.null)]\nCompact(lst)  # list(a=1, c=3)"
                  }
        ],
        tips: [
                  "[[ ]] extracts, [ ] subsets — crucial difference: lst[1] vs lst[[1]]",
                  "lapply always returns list, sapply simplifies — sapply can return wrong types, use vapply for safety",
                  "unlist() flattens list to vector — useful for converting output to simple type",
                  "names(lst) gets element names, names(lst)[n] <- \"new\" renames"
        ],
        mistake: "Using lst[\"a\"] when you need lst[[\"a\"]]. lst[\"a\"] returns sublist (list), lst[[\"a\"]] returns value (whatever type).",
        shorthand: {
          verbose: "for (i in seq_along(lst)) {\n  result[[i]] <- fn(lst[[i]])\n}",
          concise: "lapply(lst, fn)  # or sapply(lst, fn)",
        },
      },
      {
        id: "r-functions-advanced",
        fn: "Functions — Default Arguments, ..., do.call(), Closures",
        desc: "Advanced function programming: default args, ..., do.call(), function factories, scope.",
        category: "R Functions",
        subtitle: "function(x = default, ...) { }, do.call(), Recall(), closures",
        signature: "function(x=1, ...) {}  |  do.call(fn, args)  |  Recall()  |  function factories",
        descLong: "Function mastery: default arguments, ... (ellipsis) for variable arguments, do.call() to call with list of args, Recall() for recursion, closures for encapsulation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Functions — Default Arguments, ..., do.call(), Closures — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Default arguments ──────────────────────────────────────\nfn <- function(x = 10, y = 20) {\n  x + y\n}\nfn()          # 30  (both defaults)\nfn(5)         # 25  (x=5, y=20)\nfn(x=1, y=2)  # 3\n# Default can depend on other args:\nfn2 <- function(x, y = x*2) {\n  x + y\n}\nfn2(5)  # 5 + 10 = 15\n# ── ... (ellipsis) — variable number of arguments ──────\nsum_all <- function(...) {\n  args <- list(...)\n  Reduce(\"+\", args)\n}\nsum_all(1, 2, 3, 4, 5)  # 15\n# Common use: pass args to nested function:\nmy_plot <- function(x, y, ...) {\n  plot(x, y, ...)  # ... passes to plot (col, pch, etc)\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Functions — Default Arguments, ..., do.call(), Closures — common patterns you'll see in production.\n# APPROACH  - Combine Functions — Default Arguments, ..., do.call(), Closures with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nmy_plot(1:5, 1:5, col=\"red\", pch=19)  # ... = col and pch\n# Capture ...\nfn_dots <- function(...) {\n  args <- list(...)\n  names(args) <- names(list(...))  # preserve names\n  args\n}\nfn_dots(a=1, b=2, c=3)  # list(a=1, b=2, c=3)\n# ── do.call() — call function with list of args ────────\nargs_list <- list(x=c(1,2,3,NA), na.rm=TRUE)\nresult <- do.call(mean, args_list)  # mean(c(1,2,3,NA), na.rm=TRUE)\n# Useful for dynamic function calls\nfns <- list(mean, median, sd)\ndo.call(sample(fns, 1)[[1]], list(x=1:10))  # call random function\n# ── Recursion with Recall() ───────────────────────────\nfact <- function(n) {\n  if (n <= 1) 1 else n * Recall(n-1)  # Recall = recursive call\n}\nfact(5)  # 120\n# ── Closures — functions that capture environment ──────\nmake_adder <- function(n) {\n  function(x) x + n  # 'n' from outer scope\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Functions — Default Arguments, ..., do.call(), Closures — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nadd5 <- make_adder(5)\nadd5(10)  # 15\n# Each closure has its own copy of 'n':\nadd10 <- make_adder(10)\nadd10(10)  # 20\n# Use for counters:\nmake_counter <- function() {\n  count <- 0\n  function() {\n    count <<- count + 1  # <<- modifies outer scope\n    count\n  }\n}\ncounter <- make_counter()\ncounter()  # 1\ncounter()  # 2\ncounter()  # 3"
                  }
        ],
        tips: [
                  "Default arguments evaluated left-to-right — later defaults can reference earlier",
                  "... allows flexible argument passing — check ?list to see how it works",
                  "do.call(fn, list(...)) is cleaner than do.call(fn, args = list(...)) (no args= needed)",
                  "Closures beautiful for stateful functions (counters, caches) — <<- modifies outer scope"
        ],
        mistake: "Using = for named args in ..., then expecting them to come through as list(...). Use list(...) to capture all args.",
        shorthand: {
          verbose: "# Verbose recursion\nfactorial <- function(n) {\n  if (n <= 1) return(1)\n  n * factorial(n-1)\n}",
          concise: "factorial <- function(n) {\n  if (n <= 1) 1 else n * Recall(n-1)\n}",
        },
      },
      {
        id: "r-oop-s3",
        fn: "S3 Object System — class, UseMethod, Method Dispatch",
        desc: "Simple but powerful S3 OOP: class attribute, UseMethod() generic, method tables.",
        category: "R OOP",
        subtitle: "S3 method dispatch, class(), UseMethod(), method.class functions",
        signature: "class(obj) <- \"MyClass\"  |  UseMethod(\"generic\")  |  generic.MyClass <- function",
        descLong: "S3 is R's simplest OOP system. Objects have a class attribute. UseMethod(\"generic\") dispatches to generic.class(). No formal definitions — just follow naming convention. Powers most base R (print, summary, plot).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of S3 Object System — class, UseMethod, Method Dispatch — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Create S3 object ──────────────────────────────────────\nperson <- list(name=\"Alice\", age=30)\nclass(person) <- \"person\"\n# ── Create generic function ────────────────────────────\ngreet <- function(x, ...) UseMethod(\"greet\")\n# ── Create methods for different classes ───────────────\ngreet.person <- function(x, ...) {\n  cat(\"Hello\", x$name, \", age\", x$age, \"\\n\")\n}\ngreet.default <- function(x, ...) {\n  cat(\"Hello\\n\")\n}\ngreet.numeric <- function(x, ...) {\n  cat(\"You gave me the number\", x, \"\\n\")\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of S3 Object System — class, UseMethod, Method Dispatch — common patterns you'll see in production.\n# APPROACH  - Combine S3 Object System — class, UseMethod, Method Dispatch with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Dispatch happens automatically ──────────────────────\ngreet(person)   # -> greet.person(person)\ngreet(42)       # -> greet.numeric(42)\ngreet(\"text\")   # -> greet.default(\"text\")\n# ── List available methods ─────────────────────────────\nmethods(\"greet\")  # shows greet.default, greet.numeric, greet.person\nmethods(class=\"person\")  # all methods for person class\n# ── Check class ────────────────────────────────────────\nclass(person)         # \"person\"\ninherits(person, \"person\")  # TRUE\ninherits(person, \"list\")    # TRUE (implicit parent)\n# ── NextMethod() — call next method in chain ──────────\nprint.person <- function(x, ...) {\n  cat(\"=== Person ===\\n\")\n  NextMethod()  # calls print.default for underlying list\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of S3 Object System — class, UseMethod, Method Dispatch — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Multiple classes (inheritance chain) ────────────────\nstudent <- list(name=\"Bob\", age=20, gpa=3.8)\nclass(student) <- c(\"student\", \"person\", \"list\")\n# Dispatch tries student -> person -> default\n# ── Practical example: custom lm object method ──────────\nresults <- lm(y ~ x, data=df)\nclass(results)  # \"lm\"  (has many S3 methods)\nprint(results)     # print.lm() (nice summary)\npredict(results)   # predict.lm() (extracts coefficients, newdata)\nplot(results)      # plot.lm() (diagnostic plots)"
                  }
        ],
        tips: [
                  "S3 dispatch by class attribute — just set class() and define method.class functions",
                  "UseMethod() transfers control to appropriate method — generic should just call it",
                  "NextMethod() calls next method in chain — useful for extending inherited methods",
                  "No formal definitions — follow naming convention: generic.class <- function(...) { }"
        ],
        mistake: "Putting code in generic before UseMethod(). That code is lost during dispatch. Generic should only contain UseMethod() call.",
        shorthand: {
          verbose: "myfn <- function(x) {\n  if (class(x) == \"dog\") cat(\"Woof!\")\n  else if (class(x) == \"cat\") cat(\"Meow!\")\n}",
          concise: "myfn <- function(x) UseMethod(\"myfn\")\nmyfn.dog <- function(x) cat(\"Woof!\")\nmyfn.cat <- function(x) cat(\"Meow!\")",
        },
      },
      {
        id: "r-oop-r6",
        fn: "R6 Classes — Reference Objects, $, initialize(), Active Bindings",
        desc: "Modern OOP with R6: mutable reference semantics, methods, private fields, active bindings.",
        category: "R OOP",
        subtitle: "R6Class, public/private, initialize(), active bindings, $methods()",
        signature: "R6Class(\"Name\", public=list(...), private=list(...))  |  $initialize  |  $method()",
        descLong: "R6 provides formal OOP with reference semantics (objects mutable in-place). Public/private fields, methods, initialization, active bindings. Modern alternative to S3/S4 for complex objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of R6 Classes — Reference Objects, $, initialize(), Active Bindings — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(R6)\n# ── Define R6 class ────────────────────────────────────\nPerson <- R6Class(\n  \"Person\",\n  public = list(\n    name = NA,\n    age = NA,\n    initialize = function(name, age) {\n      self$name <- name\n      self$age <- age\n    },\n    greet = function() {\n      cat(\"Hello, I'm\", self$name, \"and I'm\", self$age, \"\\n\")\n    },\n    have_birthday = function() {\n      self$age <- self$age + 1\n    }\n  ),\n  private = list(\n    ssn = NA,  # private field\n    validate_ssn = function(ssn) {\n      nchar(ssn) == 11  # internal validation\n    }\n  )\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of R6 Classes — Reference Objects, $, initialize(), Active Bindings — common patterns you'll see in production.\n# APPROACH  - Combine R6 Classes — Reference Objects, $, initialize(), Active Bindings with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Create instance ────────────────────────────────────\nperson1 <- Person$new(\"Alice\", 30)  # $new creates instance\nperson1$greet()  # Hello, I'm Alice and I'm 30\n# ── Modify in-place (reference semantics) ──────────────\nperson1$have_birthday()\nperson1$age  # 31  (modified)\n# ── Active bindings (computed properties) ──────────────\nCounter <- R6Class(\n  \"Counter\",\n  private = list(count = 0),\n  active = list(\n    value = function(v) {\n      if (missing(v)) {\n        # get\n        private$count\n      } else {\n        # set\n        private$count <- v\n      }\n    }\n  ),\n  public = list(\n    increment = function() {\n      private$count <- private$count + 1\n    }\n  )\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of R6 Classes — Reference Objects, $, initialize(), Active Bindings — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ncounter <- Counter$new()\ncounter$value          # 0  (get)\ncounter$value <- 10    # set to 10\ncounter$increment()\ncounter$value          # 11\n# ── Inheritance ────────────────────────────────────────\nEmployee <- R6Class(\n  \"Employee\",\n  inherit = Person,  # inherit from Person\n  public = list(\n    salary = NA,\n    initialize = function(name, age, salary) {\n      super$initialize(name, age)\n      self$salary <- salary\n    },\n    get_info = function() {\n      cat(\"Name:\", self$name, \"Age:\", self$age, \"Salary:\", self$salary, \"\\n\")\n    }\n  )\n)\nemp <- Employee$new(\"Bob\", 35, 50000)\nemp$get_info()"
                  }
        ],
        tips: [
                  "$new() creates instance, self$ accesses own fields, super$ calls parent method",
                  "Reference semantics: modifications in-place, no <- needed to reassign",
                  "Private fields truly private — not accessible from outside",
                  "Active bindings make computed properties look like normal fields"
        ],
        mistake: "Confusing R6 reference semantics with S3 copy-on-modify. obj$x <- y modifies obj in-place, not reassignment needed.",
        shorthand: {
          verbose: "person <- Person$new(\"Alice\", 30)\nperson$have_birthday()\nage_after <- person$age",
          concise: "person <- Person$new(\"Alice\", 30)$have_birthday()\n# Not chainable by default, but could be with invisible(self)",
        },
      },
      {
        id: "r-error-handling",
        fn: "Error Handling — tryCatch, withCallingHandlers, rlang::abort",
        desc: "Robust error handling: tryCatch, withCallingHandlers, custom conditions, rlang.",
        category: "R Errors",
        subtitle: "tryCatch(), error/warning/finally, withCallingHandlers(), rlang::abort()",
        signature: "tryCatch(expr, error=function(e){}, finally={})  |  rlang::abort(\"msg\")",
        descLong: "Error handling prevents crashes. tryCatch() catches errors, warnings, messages. withCallingHandlers() calls handlers in calling context (preserves stack). rlang provides modern error functions with better messages.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Error Handling — tryCatch, withCallingHandlers, rlang::abort — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Basic tryCatch ────────────────────────────────────────\nresult <- tryCatch(\n  {\n    # expression to run\n    1 / 0  # ERROR\n  },\n  error = function(e) {\n    # handle error\n    cat(\"Caught error:\", e$message, \"\\n\")\n    NA  # return value if error\n  },\n  finally = {\n    # always runs (cleanup)\n    cat(\"Done\\n\")\n  }\n)\nresult  # NA\n# ── Handle multiple error types ────────────────────────\nresult <- tryCatch(\n  {\n    x <- \"not a number\"\n    x + 1\n  },\n  error = function(e) {\n    cat(\"Error:\", e$message, \"\\n\")\n    NULL\n  },\n  warning = function(w) {\n    cat(\"Warning:\", w$message, \"\\n\")\n  },\n  message = function(m) {\n    cat(\"Message:\", m$message, \"\\n\")\n  }\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Error Handling — tryCatch, withCallingHandlers, rlang::abort — common patterns you'll see in production.\n# APPROACH  - Combine Error Handling — tryCatch, withCallingHandlers, rlang::abort with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── withCallingHandlers (more flexible) ─────────────────\nwithCallingHandlers(\n  {\n    warning(\"Something might be wrong\")\n    cat(\"Continuing...\\n\")\n  },\n  warning = function(w) {\n    cat(\"Caught warning:\", w$message, \"\\n\")\n    invokeRestart(\"muffleWarning\")  # suppress warning\n  }\n)\n# ── Custom error messages with rlang ────────────────────\nlibrary(rlang)\nfn <- function(x) {\n  if (!is.numeric(x)) {\n    abort(paste0(\n      \"Expected numeric, got \", typeof(x), \".\",\n      \"\\nProvided: \", as.character(x)\n    ))\n  }\n  x * 2\n}\nfn(\"text\")  # Clear error message"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Error Handling — tryCatch, withCallingHandlers, rlang::abort — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Create custom condition ────────────────────────────\nmy_error <- function(message, value) {\n  err <- structure(\n    list(message = message, value = value),\n    class = c(\"my_error\", \"error\", \"condition\")\n  )\n  stop(err)\n}\ntryCatch(\n  my_error(\"Custom error\", 42),\n  my_error = function(e) {\n    cat(\"Caught custom error with value:\", e$value, \"\\n\")\n  }\n)"
                  }
        ],
        tips: [
                  "tryCatch error/warning/finally all optional — specify what you need",
                  "finally block always runs — good for cleanup (close file, disconnect DB)",
                  "rlang::abort() gives better error messages than base stop()",
                  "withCallingHandlers more complex but preserves calling context"
        ],
        mistake: "Bare tryCatch({ code }, error=function(e) NA) swallows all errors silently. Always log/report error, don't hide it.",
        shorthand: {
          verbose: "result <- NULL\ntry_result <- try(result <- risky_function())\nif (inherits(try_result, \"try-error\")) {\n  cat(\"Error\\n\")\n  result <- default_value\n}",
          concise: "result <- tryCatch(\n  risky_function(),\n  error = function(e) default_value\n)",
        },
      },
      {
        id: "r-functional",
        fn: "Functional Programming — compose, partial, map, Reduce",
        desc: "Functional style: function composition, partial application, map/reduce, purrr.",
        category: "R Functional",
        subtitle: "purrr::compose, purrr::partial, map, reduce, piping",
        signature: "compose(f, g)  |  partial(fn, arg=val)  |  map(x, fn)  |  reduce(x, fn)",
        descLong: "Functional programming treats functions as first-class objects. Composition chains functions, partial fixes some arguments, map applies function to elements, reduce aggregates. purrr package modernizes base R for functional style.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Functional Programming — compose, partial, map, Reduce — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(purrr)\n# ── Function composition ──────────────────────────────\n# Compose functions: (f ∘ g)(x) = f(g(x))\nf <- function(x) x * 2\ng <- function(x) x + 10\n# Manual: f(g(x))\nf(g(5))  # 30\n# With compose:\nh <- compose(f, g)  # composition order: g first, then f\nh(5)  # 30\n# More useful with named functions:\nsqrt_abs_log <- compose(sqrt, abs, log)  # log -> abs -> sqrt\nsqrt_abs_log(-10)  # sqrt(abs(log(-10)))\n# ── Partial application (fix some arguments) ──────────\nmultiply_by_n <- partial(\"*\", 5)  # always multiply by 5\nmultiply_by_n(2)  # 10\nmultiply_by_n(3)  # 15\n# Useful for passing to map:\ndata <- list(c(1,2), c(3,4), c(5,6))\nlapply(data, partial(mean))  # mean of each"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Functional Programming — compose, partial, map, Reduce — common patterns you'll see in production.\n# APPROACH  - Combine Functional Programming — compose, partial, map, Reduce with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── map family (purrr) ─────────────────────────────────\n# map: returns list\nmap(1:3, \\~. * 2)  # list(2, 4, 6)\n# map_dbl: returns numeric vector\nmap_dbl(1:3, \\~. * 2)  # 2 4 6\n# map_chr: returns character\nmap_chr(list(a=1, b=2), as.character)  # \"1\" \"2\"\n# map2: iterate over two vectors in parallel\nmap2_dbl(c(1,2,3), c(10,20,30), \\~.x + .y)  # 11 22 33\n# pmap: iterate over list of vectors\nargs <- list(\n  x = c(1, 2, 3),\n  y = c(10, 20, 30),\n  z = c(100, 200, 300)\n)\npmap_dbl(args, \\~.x + .y + .z)  # 111 222 333\n# ── Reduce (aggregate) ─────────────────────────────────\n# Reduce(f, x) applies f cumulatively\nReduce(\"+\", c(1, 2, 3, 4))  # ((1+2)+3)+4 = 10\nReduce(\"*\", c(1, 2, 3, 4))  # 24"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Functional Programming — compose, partial, map, Reduce — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# With initial value:\nReduce(\"+\", c(1, 2, 3), init=100)  # 100+1+2+3 = 106\n# ── Accumulate (keep intermediate results) ────────────\naccumulate(c(1, 2, 3, 4), \"+\")  # 1 3 6 10\n# ── Piping for functional style ────────────────────────\n# Old style: nesting\nresult <- round(mean(sqrt(c(1, 4, 9, 16))))  # hard to read\n# New style: piping (|>)\nresult <- c(1, 4, 9, 16) |>\n  sqrt() |>\n  mean() |>\n  round()\n# Piping with magrittr:\nresult <- c(1, 4, 9, 16) %>%\n  sqrt() %>%\n  mean() %>%\n  round()"
                  }
        ],
        tips: [
                  "compose(f, g) applies right-to-left: f(g(x)) — function order reads naturally",
                  "partial() useful for creating specialized functions from general ones",
                  "map_* family returns specific type (dbl, chr, int) — safer than map + unlist",
                  "Piping |> or %>% makes functional style readable — chains of operations"
        ],
        mistake: "Using nested function calls instead of piping. sqrt(mean(abs(x))) hard to read. Use x |> abs() |> mean() |> sqrt().",
        shorthand: {
          verbose: "results <- list()\nfor (i in seq_along(x)) {\n  results[[i]] <- fn(x[[i]])\n}\nresults <- unlist(results)",
          concise: "results <- map_dbl(x, fn)",
        },
      },
      {
        id: "r-date-time",
        fn: "Date/Time Deep Dive — lubridate, Intervals, Time Zones",
        desc: "Advanced date/time: lubridate functions, intervals/durations/periods, time zones.",
        category: "R Dates",
        subtitle: "lubridate::ymd(), intervals, durations, periods, tz handling",
        signature: "ymd(), dmy()  |  interval()  |  duration()  |  period()  |  with_tz()",
        descLong: "lubridate makes date/time pleasant. ymd/mdy/dmy parse common formats. Intervals are spans, durations are exact time, periods respect calendar (months). Time zones crucial for international apps.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Date/Time Deep Dive — lubridate, Intervals, Time Zones — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(lubridate)\n# ── Parsing dates (ymd, mdy, dmy) ──────────────────────\ndate1 <- ymd(\"2024-03-15\")       # \"2024-03-15\"\ndate2 <- mdy(\"03/15/2024\")       # \"2024-03-15\"\ndate3 <- dmy(\"15-03-2024\")       # \"2024-03-15\"\n# Parse with times:\ndt <- ymd_hms(\"2024-03-15 14:30:45\")  # POSIXct\n# ── Extract components ────────────────────────────────\ndate <- ymd(\"2024-03-15\")\nyear(date)        # 2024\nmonth(date)       # 3\nday(date)         # 15\nwday(date)        # 6 (Friday, 1=Sunday)\nwday(date, label=TRUE)  # Fri\nquarter(date)     # 1\n# ── Arithmetic (with +/- Period to respect calendars) ──\ndate + days(5)      # 2024-03-20  (5 exact days)\ndate + months(1)    # 2024-04-15  (1 calendar month)\ndate + years(2)     # 2026-03-15\n# Duration (exact time):\ndate + ddays(5)     # add 5*24 hours exactly\ndt + dhours(2)      # add 2 hours exactly"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Date/Time Deep Dive — lubridate, Intervals, Time Zones — common patterns you'll see in production.\n# APPROACH  - Combine Date/Time Deep Dive — lubridate, Intervals, Time Zones with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Period (calendar):\ndate + months(2)    # add 2 calendar months (respects day boundaries)\ndate + weeks(1)     # add 7 days\n# ── Intervals (span between two dates) ──────────────────\nstart <- ymd(\"2024-01-01\")\nend <- ymd(\"2024-12-31\")\nint <- interval(start, end)\nint  # 2024-01-01 UTC--2024-12-31 UTC\n# Check if date is in interval:\nymd(\"2024-06-15\") %within% int  # TRUE\nymd(\"2025-06-15\") %within% int  # FALSE\n# ── Duration (exact time difference) ───────────────────\ndt1 <- ymd_hms(\"2024-01-01 00:00:00\")\ndt2 <- ymd_hms(\"2024-01-02 12:30:45\")\ndur <- dt2 - dt1  # duration object\ndurations(dur)     # 86445s  (1.5 days in seconds)\nas.numeric(dur, \"hours\")  # 36.5 hours\n# ── Time zones ─────────────────────────────────────────\ndt <- ymd_hms(\"2024-03-15 14:30:00\")\ndt  # POSIXct, no timezone (assumes UTC)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Date/Time Deep Dive — lubridate, Intervals, Time Zones — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# With timezone:\ndt_ny <- with_tz(dt, \"America/New_York\")\ndt_ny  # same instant, displayed in NY time\n# Parse with timezone:\ndt_london <- ymd_hms(\"2024-03-15 14:30:00\", tz=\"Europe/London\")\n# Convert between zones:\ndt_tokyo <- with_tz(dt_london, \"Asia/Tokyo\")\n# Handy timezone list:\nOlson_timezones()[1:10]  # \"Africa/Abidjan\", etc\n# ── Round/floor/ceiling ────────────────────────────────\ndt <- ymd_hms(\"2024-03-15 14:35:47\")\nfloor_date(dt, \"hour\")    # 2024-03-15 14:00:00\nround_date(dt, \"hour\")    # 2024-03-15 15:00:00 (rounds up)\nceiling_date(dt, \"hour\")  # 2024-03-15 15:00:00"
                  }
        ],
        tips: [
                  "Use ymd/mdy/dmy parsing — never manually parse dates with regex",
                  "periods respect calendar (month = variable days), durations are exact (month = 30 days)",
                  "Always work in UTC internally, convert to local tz for display",
                  "%within% checks if date in interval — clean syntax"
        ],
        mistake: "Assuming month() + 1 gives next month. Use date + months(1) — handles year boundaries. date + period(months=1) is explicit.",
        shorthand: {
          verbose: "// Manual / verbose approach\nas.Date(\"2024-03-15\") + 30\n# Manual: 30 days from 03-15 is 04-14\n// More explicit but longer",
          concise: "ymd(\"2024-03-15\") + months(1)\n# Calendar month: 04-15",
        },
      },
      {
        id: "r-string-ops",
        fn: "String Operations — stringr, glue, regex, text manipulation",
        desc: "Modern string handling: stringr functions, glue for templates, regex, text processing.",
        category: "R Strings",
        subtitle: "stringr::str_*, glue(), regex patterns, text processing",
        signature: "str_detect()  |  str_replace()  |  str_split()  |  glue(\"template\")",
        descLong: "stringr modernizes base R string functions with consistent naming and vectorization. glue allows string interpolation. Regular expressions powerful but complex — start with stringr.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of String Operations — stringr, glue, regex, text manipulation — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(stringr)\nlibrary(glue)\n# ── Detection & matching ──────────────────────────────\nx <- c(\"apple\", \"banana\", \"apricot\", \"blueberry\")\nstr_detect(x, \"ap\")       # TRUE FALSE TRUE FALSE\nstr_which(x, \"ap\")        # 1 3  (indices)\n# ── Extraction ────────────────────────────────────────\nemail <- \"alice@example.com\"\nstr_extract(email, \"[^@]+\")  # \"alice\"  (before @)\nstr_extract_all(email, \"[a-z]+\")  # list(c(\"alice\", \"example\", \"com\"))\n# ── Substitution ──────────────────────────────────────\ntext <- \"The cat sat on the mat\"\nstr_replace(text, \"the\", \"THE\")     # replaces first only\nstr_replace_all(text, \"the\", \"THE\") # replaces all\n# Case insensitive:\nstr_replace_all(text, regex(\"the\", ignore_case=TRUE), \"THE\")\n# ── Splitting ──────────────────────────────────────────\nstr_split(\"apple,banana,orange\", \",\")\n# list(c(\"apple\", \"banana\", \"orange\"))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of String Operations — stringr, glue, regex, text manipulation — common patterns you'll see in production.\n# APPROACH  - Combine String Operations — stringr, glue, regex, text manipulation with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Into specific number of pieces:\nstr_split_fixed(\"a-b-c-d\", \"-\", n=2)  # \"a\", \"b-c-d\"\n# ── Length & trimming ─────────────────────────────────\nstr_length(\"hello\")       # 5\nstr_trim(\"  hello  \")     # \"hello\"  (both sides)\nstr_trim(\"  hello  \", \"left\")   # \"hello  \"\n# ── Case conversion ────────────────────────────────────\nstr_to_upper(\"hello\")     # \"HELLO\"\nstr_to_lower(\"HELLO\")     # \"hello\"\nstr_to_title(\"hello world\")  # \"Hello World\"\n# ── Padding ────────────────────────────────────────────\nstr_pad(\"5\", width=3, pad=\"0\")  # \"005\"\nstr_pad(\"hello\", width=10, side=\"both\")  # \"  hello   \"\n# ── Substring operations ──────────────────────────────\nstr_sub(\"hello\", 1, 3)    # \"hel\"\nstr_sub(\"hello\", -3)      # \"llo\"  (last 3)\n# ── Combination ────────────────────────────────────────\nstr_c(\"Hello\", \"World\", sep=\" \")  # \"Hello World\"\nstr_flatten(c(\"a\", \"b\", \"c\"), \", \")  # \"a, b, c\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of String Operations — stringr, glue, regex, text manipulation — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── String interpolation with glue ─────────────────────\nname <- \"Alice\"\nage <- 30\nglue(\"My name is {name} and I'm {age} years old\")\n# \"My name is Alice and I'm 30 years old\"\n# Expressions in glue:\nglue(\"2 + 2 = {2 + 2}\")  # \"2 + 2 = 4\"\nglue(\"Doubled: {name |> str_to_upper()}\")  # \"Doubled: ALICE\"\n# Glue with .sep and .envir\nglue_collapse(c(\"a\", \"b\", \"c\"), sep=\", \")  # \"a, b, c\"\n# ── Regular expressions (complex patterns) ────────────\n# Use regex() for clarity:\npattern <- regex(\"^[0-9]{3}-[0-9]{3}-[0-9]{4}$\", ignore_case=TRUE)\nstr_detect(\"555-123-4567\", pattern)  # TRUE"
                  }
        ],
        tips: [
                  "stringr functions vectorized — str_*(vector) returns vector same length",
                  "All stringr functions start with str_* — autocomplete friendly",
                  "glue() for string templates — cleaner than paste() or sprintf()",
                  "Use regex() for complex patterns — more readable than raw regex strings"
        ],
        mistake: "Using base gsub() instead of str_replace_all(). stringr more consistent and easier to remember.",
        shorthand: {
          verbose: "# Verbose: multiple passes\ntext <- gsub(\"the\", \"THE\", text)\ntext <- gsub(\"and\", \"AND\", text)\ntext <- gsub(\"is\", \"IS\", text)",
          concise: "# One pass with stringr\ntext <- text |>\n  str_replace_all(\"the\", \"THE\") |>\n  str_replace_all(\"and\", \"AND\") |>\n  str_replace_all(\"is\", \"IS\")",
        },
      },
      {
        id: "r-file-io",
        fn: "File I/O — readr, readxl, arrow, file operations",
        desc: "Read/write data: readr (CSV fast), readxl (Excel), arrow (Parquet, large), file system.",
        category: "R I/O",
        subtitle: "readr::read_csv, readxl::read_excel, arrow::read_parquet, file operations",
        signature: "read_csv(file)  |  read_excel(file, sheet)  |  read_parquet(file)  |  file.choose()",
        descLong: "Modern R file I/O beats base functions. readr is fast with clean defaults. readxl reads Excel without Java. arrow handles Parquet/Feather (columnar, huge datasets). Always use here() for portable paths.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of File I/O — readr, readxl, arrow, file operations — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nlibrary(readr)\nlibrary(readxl)\nlibrary(arrow)\nlibrary(here)\n# ── CSV with readr (faster, better defaults) ──────────\ndf <- read_csv(here(\"data\", \"sales.csv\"))\n# Specify column types:\ndf <- read_csv(\n  here(\"data\", \"sales.csv\"),\n  col_types = cols(\n    date = col_date(\"%Y-%m-%d\"),\n    amount = col_double(),\n    category = col_factor(),\n    notes = col_skip()  # skip this column\n  )\n)\n# Show problems during parsing:\nproblems(df)  # any parse errors?\n# Write CSV:\nwrite_csv(df, here(\"output\", \"clean.csv\"))\nwrite_csv(df, here(\"output\", \"clean.csv.gz\"))  # auto-compress"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of File I/O — readr, readxl, arrow, file operations — common patterns you'll see in production.\n# APPROACH  - Combine File I/O — readr, readxl, arrow, file operations with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# ── Excel with readxl ─────────────────────────────────\ndf <- read_excel(\n  here(\"data\", \"report.xlsx\"),\n  sheet = \"Sales\",     # sheet name or number\n  range = \"A1:D100\",   # specific range\n  na = c(\"\", \"NA\", \"N/A\")  # treat as missing\n)\nexcel_sheets(here(\"data\", \"report.xlsx\"))  # list all sheets\n# ── Large data: Arrow/Parquet (columnar, compressed) ──\n# Parquet: efficient, compressed, fast to read\ndf <- read_parquet(here(\"data\", \"large.parquet\"))\nwrite_parquet(df, here(\"output\", \"large.parquet\"))\n# Feather (fast but larger):\ndf <- read_feather(here(\"data\", \"data.feather\"))\nwrite_feather(df, here(\"output\", \"data.feather\"))\n# ── Open file dialog ───────────────────────────────────\nfile_path <- file.choose()  # interactive file picker\ndf <- read_csv(file_path)\n# ── Directory operations ───────────────────────────────\ndir()           # list files in current dir\ndir(\"data\")     # list files in data/"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of File I/O — readr, readxl, arrow, file operations — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfile.exists(\"myfile.csv\")  # check if file exists\nfile.size(\"myfile.csv\")    # size in bytes\n# ── File system paths ──────────────────────────────────\npath_home()     # user's home directory\npath_temp()     # temp directory\npath_wd()       # working directory\n# Create directory:\ndir.create(here(\"output\"), showWarnings=FALSE)\n# ── Read multiple files ───────────────────────────────\nfiles <- list.files(here(\"data\"), pattern=\"*.csv\", full.names=TRUE)\ndf_list <- lapply(files, read_csv)  # read all\ndf_all <- do.call(rbind, df_list)  # combine\n# Or with purrr:\ndf_all <- map_df(files, read_csv)  # automatically rbinds"
                  }
        ],
        tips: [
                  "read_csv() automatically detects types — check with spec() if unsure",
                  "read_parquet() for huge datasets — 100x faster/smaller than CSV",
                  "Always use here() in read_csv paths — works on any machine",
                  "write_csv.gz automatically compresses — no extra step needed"
        ],
        mistake: "Using read.csv() instead of read_csv(). read.csv() converts strings to factors, slower parsing, worse errors. Always use readr.",
        shorthand: {
          verbose: "// Manual / verbose approach\ndf <- read.csv(\"file.csv\", stringsAsFactors=FALSE, na.strings=c(\"\", \"NA\"))\n// More explicit but longer",
          concise: "df <- read_csv(\"file.csv\")  # safer defaults",
        },
      },
    ],
  },
]

export default { meta, sections }
