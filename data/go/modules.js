export const meta = {
  "id": "modules",
  "label": "Modules & Dependencies",
  "icon": "📦",
  "description": "Go modules, go.mod, go.sum, version management, require/exclude, module resolution, and dependency best practices."
}

export const sections = [

  // ── Section 1: Modules & Dependency Management ─────────────────────────────────────────
  {
    id: "modules",
    title: "Modules & Dependency Management",
    entries: [
      {
        id: "gomod-basics",
        fn: "go.mod & Versioning",
        desc: "Go modules declare dependencies — go.mod tracks versions, go.sum verifies checksums.",
        category: "Module Fundamentals",
        subtitle: "Declarative dependency management",
        signature: "module github.com/user/pkg  |  require github.com/external/lib v1.2.3",
        descLong: "go.mod declares the module path and its dependencies with semantic versioning. go.sum contains checksums to detect tampering. go mod init creates go.mod. Commands: go get (add/upgrade), go mod tidy (clean unused), go mod download (download all). Versions follow semver: v1.0.0 means major.minor.patch.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of go.mod & Versioning — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Example go.mod\n// module github.com/user/myapp\n\nrequire (\n  github.com/lib/pq v1.10.7\n  github.com/spf13/cobra v1.6.1\n  golang.org/x/sync v0.1.0\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of go.mod & Versioning — common patterns you'll see in production.\n// APPROACH  - Combine go.mod & Versioning with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Example go.sum (created automatically)\n// github.com/lib/pq v1.10.7 h1:p7ZhMD+KsSRyzVBvzorKAk+vp3KeKScLKXWmyfp7zY=\n// github.com/lib/pq v1.10.7/go.mod h1:AlVN5x4KeqIQvsV+jmQmoplAlGzG5QFP9OnlL5hM=\n\npackage main\n\nimport (\n  \"database/sql\"\n  _ \"github.com/lib/pq\"  // Register postgres driver\n  \"log\"\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of go.mod & Versioning — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfunc main() {\n  db, err := sql.Open(\"postgres\", \"...\")\n  if err != nil {\n    log.Fatal(err)\n  }\n  defer db.Close()\n}"
                  }
        ],
        tips: [
                  "Semantic versioning: v1.0.0 (major.minor.patch) — only update major for breaking changes.",
                  "go get -u upgrades to latest compatible version.",
                  "go get github.com/pkg/lib@v1.2.3 pins a specific version.",
                  "go mod tidy removes unused dependencies — run before commit.",
                  "go.sum prevents dependency tampering — commit it to Git."
        ],
        mistake: "Leaving go.mod out of version control — always commit go.mod and go.sum. They make builds reproducible.",
        shorthand: {
          verbose: "// Manually edit go.mod\nrequire github.com/lib/pq v1.10.7\nrequire github.com/spf13/cobra v1.6.1\n// then: go mod download",
          concise: "// Command line:\ngo get github.com/lib/pq@v1.10.7\ngo get github.com/spf13/cobra@v1.6.1",
        },
      },
      {
        id: "go-get-versions",
        fn: "go get & Version Resolution",
        desc: "Add, upgrade, and downgrade dependencies with go get — semantic versioning rules apply.",
        category: "Dependency Management",
        subtitle: "Installing and managing dependency versions",
        signature: "go get github.com/package  |  go get -u ./...  |  go get @version",
        descLong: "go get downloads and records dependencies. Without a version, gets the latest. go get -u upgrades to the latest compatible (within major version for v1+). go get pkg@v1.0.0 pins a version. go get ./... updates all dependencies in the current module. go mod download fetches without saving.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of go get & Version Resolution — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Add a new dependency\n// go get github.com/spf13/cobra"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of go get & Version Resolution — common patterns you'll see in production.\n// APPROACH  - Combine go get & Version Resolution with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Upgrade to latest compatible\n// go get -u github.com/spf13/cobra\n// or all: go get -u ./..."
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of go get & Version Resolution — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Upgrade to latest (even major version bump),// go get -u=patch github.com/pkg  (patch only),// go get -u=minor github.com/pkg  (minor only),\n\n// Pin to specific version,// go get github.com/pkg@v2.0.0,\n\n// Use commit or branch,// go get github.com/pkg@main,// go get github.com/pkg@a1b2c3d,\n\n// Remove unused (in tidy),// go mod tidy,\n\n// View dependency tree,// go mod graph,,package main,,import (,  \"github.com/spf13/cobra\",),,func main() {,  cmd := &cobra.Command{,    Use: \"app\",,    Run: func(cmd *cobra.Command, args []string) {,      println(\"Hello from cobra\"),    },,  },  cmd.Execute(),}"
                  }
        ],
        tips: [
                  "go get with no version gets the latest released version.",
                  "go get pkg@v1.0.0 is deterministic — always the same version.",
                  "go mod graph shows the full dependency tree.",
                  "go mod why -m github.com/pkg explains why a dependency is needed.",
                  "Semantic versioning: for v0.x, any change can be breaking. For v1+, only major bumps are breaking."
        ],
        mistake: "Using go get -u in CI without pinning versions — different runs may pull different versions, breaking reproducibility.",
        shorthand: {
          verbose: "go get github.com/pkg@latest\ngo get github.com/pkg@develop\ngo get github.com/pkg@a1b2c3d",
          concise: "go get github.com/pkg          // latest release\ngo get github.com/pkg@v1.2.3   // pin version",
        },
      },
      {
        id: "require-exclude",
        fn: "require & exclude Directives",
        desc: "Manually control dependency versions — require pins, exclude blocks specific versions.",
        category: "Advanced Module Management",
        subtitle: "Fine-grained dependency control",
        signature: "require github.com/pkg v1.0.0  |  exclude github.com/pkg v1.1.0",
        descLong: "require forces a specific version. exclude prevents Go from using a version (useful for buggy releases). Both modify go.mod directly and affect all packages in your module. Use sparingly — prefer go get for routine updates.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of require & exclude Directives — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// go.mod example with require and exclude\n\nmodule github.com/user/app\n\ngo 1.21\n\nrequire (\n  github.com/spf13/cobra v1.6.1\n  github.com/lib/pq v1.10.7\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of require & exclude Directives — common patterns you'll see in production.\n// APPROACH  - Combine require & exclude Directives with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Force a specific version (override what a dependency requires)\nrequire github.com/some/lib v1.0.0"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of require & exclude Directives — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Exclude a buggy version,exclude github.com/buggy/pkg v1.5.0,\n\n// Pin indirect dependency (used by cobra),require github.com/spf13/pflag v1.0.5"
                  }
        ],
        tips: [
                  "require is usually not needed — go get handles version resolution.",
                  "exclude is for blocking buggy or known-bad versions.",
                  "Both are written to go.mod automatically in most cases.",
                  "go mod why -m pkg shows why a version is required.",
                  "Complex require/exclude usually indicates a dependency design issue."
        ],
        mistake: "Using require to pin all transitive dependencies — let Go's minimal version selection do its job. Pin only when needed.",
        shorthand: {
          verbose: "require (\n  a/lib v1.0.0\n  b/lib v2.0.0\n  c/lib v1.5.0\n  d/lib v0.1.0\n)",
          concise: "require (\n  a/lib v1.0.0  // direct\n  b/lib v2.0.0\n)\n// transitive versions auto-selected",
        },
      },
      {
        id: "retract",
        fn: "retract Directive (Go 1.16+)",
        desc: "Retract buggy or problematic versions — module authors can prevent others from upgrading.",
        category: "Module Publishing",
        subtitle: "Prevent consumers from using broken releases",
        signature: "retract v1.0.0  |  retract [v1.0.0, v1.1.0]",
        descLong: "retract marks versions as unsuitable — consumers with those versions get a warning. Module authors use retract when a version has critical bugs. Go 1.16+. Useful for published modules — if you publish a broken v1.2.3, retract it and release v1.2.4.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of retract Directive (Go 1.16+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// go.mod for a published module with a retracted version\n\nmodule github.com/user/mylib\n\ngo 1.21"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of retract Directive (Go 1.16+) — common patterns you'll see in production.\n// APPROACH  - Combine retract Directive (Go 1.16+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Retract a single buggy version\nretract v1.0.1"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of retract Directive (Go 1.16+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Retract a range,retract [v1.1.0, v1.2.0],\n\n// Retract with reason (comment above),// v1.3.0 had a critical bug in the marshaler,retract v1.3.0"
                  }
        ],
        tips: [
                  "retract is for module authors to signal bad releases.",
                  "go get automatically warns if you're using a retracted version.",
                  "Always release a new version after retracting — don't leave users stranded.",
                  "Document the reason in a comment above retract.",
                  "When bumping major version, you can often skip retracting old major versions."
        ],
        mistake: "Using retract instead of just releasing a new version — retract is a signal, not a fix. Always release a corrected version.",
        shorthand: {
          verbose: "// After discovering a bug in v1.3.0:\n// 1. Retract v1.3.0 in go.mod\n// 2. User with v1.3.0 gets warning\n// 3. User stuck until they upgrade",
          concise: "// Better:\n// 1. Fix the bug locally\n// 2. Release v1.3.1\n// 3. Optionally: retract v1.3.0",
        },
      },
      {
        id: "replace-directive",
        fn: "replace Directive (for Local Development)",
        desc: "Temporarily replace dependencies with local versions — useful for testing changes before publishing.",
        category: "Development Workflows",
        subtitle: "Local dependency overrides",
        signature: "replace github.com/pkg => ../local/path  |  replace github.com/pkg => github.com/fork v1.0.0",
        descLong: "replace redirects a module import to a different source. Use local paths for development (replace github.com/lib => ../lib), or fork/branch versions (replace pkg => fork/pkg@v1.0.0). replace is local to your go.mod — doesn't affect consumers of your module.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of replace Directive (for Local Development) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// go.mod with replace directives\n\nmodule github.com/user/app\n\nrequire (\n  github.com/spf13/cobra v1.6.1\n  github.com/mycompany/internal v1.0.0\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of replace Directive (for Local Development) — common patterns you'll see in production.\n// APPROACH  - Combine replace Directive (for Local Development) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Use local version during development\nreplace github.com/mycompany/internal => ../internal"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of replace Directive (for Local Development) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Use a fork,replace github.com/upstream/lib => github.com/mycompany/lib v1.0.0,\n\n// Point to a branch,replace github.com/pkg => github.com/my/fork@develop,\n\n// Usage in code — unchanged,import \"github.com/mycompany/internal\""
                  }
        ],
        tips: [
                  "replace is local to your module — not inherited by consumers.",
                  "Use relative paths for local development: replace pkg => ../path",
                  "replace github.com/pkg => ./local/path copies the local path — changes reflected immediately.",
                  "Always remove replace directives before publishing — they're not portable.",
                  "Multi-module workspaces (go.work) can be cleaner than replace for developing interdependent modules."
        ],
        mistake: "Pushing go.mod with replace directives — they're for local development only. Remove before committing to the main branch.",
        shorthand: {
          verbose: "// Manual / verbose approach\nrequire github.com/mycompany/internal v1.0.0\nreplace github.com/mycompany/internal => ../internal\n// More explicit but longer",
          concise: "replace github.com/mycompany/internal => ../internal\n// local development only, not published",
        },
      },
      {
        id: "workspace-go-work",
        fn: "Workspaces (go.work) — Multi-Module Development",
        desc: "Develop multiple modules together with go.work — coordinates versions across modules.",
        category: "Advanced Workflows",
        subtitle: "Multi-module development coordination",
        signature: "go work init ./pkg1 ./pkg2  |  go.work file",
        descLong: "go.work (Go 1.18+) allows working on multiple modules simultaneously. Useful for monorepos or developing interdependent modules. go work init creates the file. Each module's go.mod is still used, but go.work coordinates builds and tests across all.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Workspaces (go.work) — Multi-Module Development — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── go.work file (coordinates multiple modules) ─────────\n/*\ngo 1.21\n\nuse (\n  ./api\n  ./lib\n  ./cli\n)\n*/"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Workspaces (go.work) — Multi-Module Development — common patterns you'll see in production.\n// APPROACH  - Combine Workspaces (go.work) — Multi-Module Development with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── api/go.mod (API module) ────────────────────────────\nmodule github.com/mycompany/api\n\ngo 1.21\n\nrequire github.com/mycompany/lib v0.1.0"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Workspaces (go.work) — Multi-Module Development — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── lib/go.mod (Library module) ────────────────────────,module github.com/mycompany/lib,,go 1.21,,require github.com/golang-jwt/jwt/v5 v5.0.0,\n\n// ── api/main.go (uses lib module) ─────────────────────,package main,,import (,  \"fmt\",  \"github.com/mycompany/lib\",),,func main() {,  result := lib.ProcessData(\"test\"),  fmt.Println(result),},\n\n// ── lib/lib.go (library implementation) ────────────────,package lib,,import \"strings\",,func ProcessData(input string) string {,  return strings.ToUpper(input),},\n\n// ── CLI module using both api and lib ──────────────────,// cli/main.go,package main,,import (,  \"fmt\",  \"github.com/mycompany/api\",  \"github.com/mycompany/lib\",),,func main() {,  data := lib.ProcessData(\"hello\"),  result := api.HandleRequest(data),  fmt.Println(result),},\n\n// ── Creating and using the workspace ───────────────────,// 1. Initialize workspace:,//    go work init ./api ./lib ./cli,//    Creates go.work file,\n\n// 2. Running tests builds all modules:,//    go test ./...,\n\n// 3. Building targets all modules:,//    go build ./...,\n\n// 4. Each module maintains its own go.mod for publishing,// 5. go.work coordinates versions locally during development,// 6. When publishing, go.work is removed (add to .gitignore)"
                  }
        ],
        tips: [
                  "go work init ./mod1 ./mod2 ./mod3 creates go.work.",
                  "Each module maintains its own go.mod (for publishing).",
                  "go.work is not committed to repos where only one module is public.",
                  "Use for monorepos or developing interdependent packages.",
                  "go.work use and use mod ./path override go.mod versions locally."
        ],
        mistake: "Committing go.work when publishing a public module — go.work is for development only. Add to .gitignore.",
        shorthand: {
          verbose: "// Manual / verbose approach\nreplace github.com/mycompany/api => ../api\nreplace github.com/mycompany/lib => ../lib\n// More explicit but longer",
          concise: "go work use ./api ./lib\n// coordinates multiple modules locally",
        },
      },
    ],
  },
]

export default { meta, sections }
