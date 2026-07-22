export const meta = {
  "id": "cli-observability",
  "label": "CLI Tools & Observability",
  "icon": "🔭",
  "description": "Go CLI development (Cobra, Viper), observability (pprof, tracing, metrics), context patterns, and fuzz testing."
}

export const sections = [

  // ── Section 1: CLI Development & Configuration ─────────────────────────────────────────
  {
    id: "cli-tools",
    title: "CLI Development & Configuration",
    entries: [
      {
        id: "cobra-viper",
        fn: "Cobra & Viper — Production CLI Applications",
        desc: "Build Go CLI tools with Cobra (commands, flags, args) and Viper (config files, env vars, defaults).",
        category: "CLI",
        subtitle: "cobra.Command, PersistentFlags, Viper, config files, env vars, subcommands",
        signature: "rootCmd.AddCommand(subCmd)  |  cmd.Flags().StringP()  |  viper.GetString()  |  viper.ReadInConfig()",
        descLong: "Cobra is the standard Go CLI framework (used by kubectl, docker, hugo). It provides subcommands, flags, arguments, auto-generated help, and shell completions. Viper handles configuration from files (YAML, JSON, TOML), environment variables, and flags — with automatic priority: flags > env > config > defaults. Cobra and Viper integrate seamlessly: bind Viper keys to Cobra flags for configuration that works from both CLI and config file.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Cobra & Viper — Production CLI Applications — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"fmt\"\n\t\"os\"\n\n\t\"github.com/spf13/cobra\"\n\t\"github.com/spf13/viper\"\n)\n\nvar cfgFile string"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Cobra & Viper — Production CLI Applications — common patterns you'll see in production.\n// APPROACH  - Combine Cobra & Viper — Production CLI Applications with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Root command\nvar rootCmd = &cobra.Command{\n\tUse:   \"myapp\",\n\tShort: \"A powerful CLI application\",\n\tLong:  \"myapp is a CLI tool for managing deployments and services.\",\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Cobra & Viper — Production CLI Applications — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Subcommand: deploy,var deployCmd = &cobra.Command{,\tUse:   \"deploy [environment]\",,\tShort: \"Deploy the application\",,\tArgs:  cobra.ExactArgs(1),,\tRunE: func(cmd *cobra.Command, args []string) error {,\t\tenv := args[0],\t\ttag, _ := cmd.Flags().GetString(\"tag\"),\t\tforce, _ := cmd.Flags().GetBool(\"force\"),\t\ttimeout := viper.GetDuration(\"deploy.timeout\"),,\t\tfmt.Printf(\"Deploying to %s (tag=%s, force=%v, timeout=%v)\\n\",,\t\t\tenv, tag, force, timeout),\t\treturn nil,\t},,},\n\n// Subcommand: config show,var configShowCmd = &cobra.Command{,\tUse:   \"show\",,\tShort: \"Show current configuration\",,\tRun: func(cmd *cobra.Command, args []string) {,\t\tfor _, key := range viper.AllKeys() {,\t\t\tfmt.Printf(\"%s = %v\\n\", key, viper.Get(key)),\t\t},\t},,},,func init() {,\tcobra.OnInitialize(initConfig),\n\n\t// Global persistent flags (available to all subcommands),\trootCmd.PersistentFlags().StringVar(&cfgFile, \"config\", \"\",,\t\t\"config file (default $HOME/.myapp.yaml)\"),\trootCmd.PersistentFlags().String(\"log-level\", \"info\",,\t\t\"Log level (debug, info, warn, error)\"),\tviper.BindPFlag(\"log_level\", rootCmd.PersistentFlags().Lookup(\"log-level\")),\n\n\t// Deploy-specific flags,\tdeployCmd.Flags().StringP(\"tag\", \"t\", \"latest\", \"Docker image tag\"),\tdeployCmd.Flags().BoolP(\"force\", \"f\", false, \"Skip confirmation\"),\tviper.BindPFlag(\"deploy.tag\", deployCmd.Flags().Lookup(\"tag\")),\n\n\t// Build command tree,\tconfigCmd := &cobra.Command{Use: \"config\", Short: \"Manage configuration\"},\tconfigCmd.AddCommand(configShowCmd),\trootCmd.AddCommand(deployCmd, configCmd),},,func initConfig() {,\tif cfgFile != \"\" {,\t\tviper.SetConfigFile(cfgFile),\t} else {,\t\thome, _ := os.UserHomeDir(),\t\tviper.AddConfigPath(home),\t\tviper.AddConfigPath(\".\"),\t\tviper.SetConfigName(\".myapp\"),\t\tviper.SetConfigType(\"yaml\"),\t},\n\n\t// Environment variables: MYAPP_DEPLOY_TAG -> deploy.tag,\tviper.SetEnvPrefix(\"MYAPP\"),\tviper.AutomaticEnv(),,\tviper.SetDefault(\"deploy.timeout\", \"5m\"),\tviper.SetDefault(\"log_level\", \"info\"),,\tif err := viper.ReadInConfig(); err == nil {,\t\tfmt.Println(\"Using config:\", viper.ConfigFileUsed()),\t},},,func main() {,\tif err := rootCmd.Execute(); err != nil {,\t\tos.Exit(1),\t},}"
                  }
        ],
        tips: [
                  "Cobra auto-generates --help, shell completions (bash, zsh, fish), and man pages — no manual help text needed.",
                  "viper.BindPFlag() connects config file keys to CLI flags — users can set values in either place with flags taking priority.",
                  "viper.SetEnvPrefix(\"MYAPP\") + AutomaticEnv() maps MYAPP_LOG_LEVEL env var to \"log_level\" config key automatically.",
                  "Use RunE (returns error) instead of Run — it properly sets the exit code and integrates with Cobra error handling."
        ],
        mistake: "Defining all commands in main.go — split subcommands into separate files (cmd/deploy.go, cmd/config.go) for maintainability. Cobra CLI scaffolding (cobra-cli init) sets this up for you.",
        shorthand: {
          verbose: "// main.go - all 1000 lines\nvar deployCmd = &cobra.Command { ... }\nvar configCmd = &cobra.Command { ... }",
          concise: "rootCmd.AddCommand(subCmd); split: cmd/deploy.go, cmd/config.go; viper.BindPFlag(); SetEnvPrefix(\"APP\")",
        },
      },
      {
        id: "cobra-basics",
        fn: "Cobra Basics — Commands, Flags & Auto-Completion",
        desc: "Master Cobra command structure: defining commands, handling flags, subcommands, and generating shell completions.",
        category: "CLI",
        subtitle: "cobra.Command, RunE, cmd.Flags(), PersistentFlags, AddCommand, shell completions",
        signature: "cmd := &cobra.Command{Use:\"name\", RunE:func(cmd *cobra.Command, args []string)error{...}}",
        descLong: "Cobra is the idiomatic Go CLI framework. Each command is a cobra.Command with Use (usage string), Short, Long descriptions, and RunE (error-returning Run). Flags are registered with cmd.Flags() (local to command) or cmd.PersistentFlags() (inherited by subcommands). Use RunE to return errors — Cobra handles exit codes. Build command trees with AddCommand. Shell completions (bash, zsh, fish) are auto-generated from the command structure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Cobra Basics — Commands, Flags & Auto-Completion — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"fmt\"\n\n\t\"github.com/spf13/cobra\"\n)\n\nvar rootCmd = &cobra.Command{\n\tUse:   \"myapp\",\n\tShort: \"My application\",\n\tRun: func(cmd *cobra.Command, args []string) {\n\t\tfmt.Println(\"Hello from myapp\")\n\t},\n}\n\nvar deployCmd = &cobra.Command{\n\tUse:   \"deploy [env]\",\n\tShort: \"Deploy to environment\",\n\tArgs:  cobra.ExactArgs(1),\n\tRunE: func(cmd *cobra.Command, args []string) error {\n\t\tenv := args[0]\n\t\ttag, _ := cmd.Flags().GetString(\"tag\")\n\t\tfmt.Printf(\"Deploying to %s with tag %s\\n\", env, tag)\n\t\treturn nil\n\t},\n}\n\nvar statusCmd = &cobra.Command{\n\tUse:   \"status\",\n\tShort: \"Show deployment status\",\n\tRun: func(cmd *cobra.Command, args []string) {\n\t\tverbose, _ := cmd.Flags().GetBool(\"verbose\")\n\t\tif verbose {\n\t\t\tfmt.Println(\"Detailed status...\")\n\t\t} else {\n\t\t\tfmt.Println(\"Status: OK\")\n\t\t}\n\t},\n}\n\nfunc init() {\n\t// Persistent flags (inherited by subcommands)\n\trootCmd.PersistentFlags().String(\"config\", \"\", \"Config file path\")"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Cobra Basics — Commands, Flags & Auto-Completion — common patterns you'll see in production.\n// APPROACH  - Combine Cobra Basics — Commands, Flags & Auto-Completion with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Local flags (only for this command)\n\tdeployCmd.Flags().StringP(\"tag\", \"t\", \"latest\", \"Docker image tag\")\n\tdeployCmd.Flags().BoolP(\"force\", \"f\", false, \"Skip confirmation\")\n\n\tstatusCmd.Flags().BoolP(\"verbose\", \"v\", false, \"Verbose output\")"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Cobra Basics — Commands, Flags & Auto-Completion — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Build tree,\trootCmd.AddCommand(deployCmd, statusCmd),},,func main() {,\tif err := rootCmd.Execute(); err != nil {,\t\tfmt.Println(err),\t\tos.Exit(1),\t},}"
                  }
        ],
        tips: [
                  "RunE (with E) returns error and properly sets exit code. Run ignores return value — always use RunE for production code.",
                  "Persistent flags apply to the command and all subcommands. Local flags only apply to that command.",
                  "Cobra auto-completes to subcommands. Add completions with cmd.RegisterFlagCompletionFunc() for dynamic values.",
                  "Args validators (ExactArgs, MinimumNArgs, MaximumNArgs) enforce argument counts before the command runs."
        ],
        mistake: "Using Run instead of RunE — errors are silently ignored. This makes error handling invisible and exit codes wrong. Always use RunE.",
        shorthand: {
          verbose: "var cmd = &cobra.Command{\n  Use: \"deploy\",\n  RunE: func(cmd *cobra.Command, args []string) error {\n    return deploy(args[0])\n  },\n}",
          concise: "&cobra.Command{Use:\"deploy\", RunE:func(cmd *cobra.Command, args []string)error{...}}; cmd.Flags().StringP(\"tag\",\"t\",\"latest\",help); rootCmd.AddCommand(cmd)",
        },
      },
      {
        id: "cobra-subcommands",
        fn: "Cobra Subcommands — Nested Command Trees",
        desc: "Build multi-level command hierarchies: parent/child commands, pass-through args, and command organization patterns.",
        category: "CLI",
        subtitle: "AddCommand, parent-child tree, args inheritance, command discovery",
        signature: "rootCmd.AddCommand(subCmd)  |  subCmd.AddCommand(childCmd)  |  cobra.MatchedArgs(cmd)",
        descLong: "Cobra supports arbitrary nesting: commands can have subcommands, which can have their own subcommands. Use AddCommand to attach children. Arguments flow to the matched command. Parent persistent flags apply to all descendants. Organize large CLIs by splitting commands into files (cmd/deploy.go, cmd/status.go, cmd/config.go) and registering them in init(). Cobra handles routing to the correct command automatically.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Cobra Subcommands — Nested Command Trees — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"fmt\"\n\t\"github.com/spf13/cobra\"\n)\n\nvar rootCmd = &cobra.Command{\n\tUse:   \"app\",\n\tShort: \"Main application\",\n}\n\nvar deployCmd = &cobra.Command{\n\tUse:   \"deploy\",\n\tShort: \"Deployment operations\",\n}\n\nvar deployStartCmd = &cobra.Command{\n\tUse:   \"start [service]\",\n\tShort: \"Start deployment\",\n\tArgs:  cobra.ExactArgs(1),\n\tRunE: func(cmd *cobra.Command, args []string) error {\n\t\tfmt.Printf(\"Starting deployment for %s\\n\", args[0])\n\t\treturn nil\n\t},\n}\n\nvar deployStatusCmd = &cobra.Command{\n\tUse:   \"status [service]\",\n\tShort: \"Check deployment status\",\n\tRunE: func(cmd *cobra.Command, args []string) error {\n\t\tfmt.Printf(\"Checking status for %s\\n\", args[0])\n\t\treturn nil\n\t},\n}\n\nvar configCmd = &cobra.Command{\n\tUse:   \"config\",\n\tShort: \"Configuration management\",\n}\n\nvar configSetCmd = &cobra.Command{\n\tUse:   \"set KEY VALUE\",\n\tShort: \"Set config value\",\n\tArgs:  cobra.ExactArgs(2),\n\tRunE: func(cmd *cobra.Command, args []string) error {\n\t\tfmt.Printf(\"Set %s = %s\\n\", args[0], args[1])\n\t\treturn nil\n\t},\n}\n\nfunc init() {\n\t// Build: root -> deploy -> {start, status}\n\tdeployCmd.AddCommand(deployStartCmd, deployStatusCmd)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Cobra Subcommands — Nested Command Trees — common patterns you'll see in production.\n// APPROACH  - Combine Cobra Subcommands — Nested Command Trees with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Build: root -> config -> {set}\n\tconfigCmd.AddCommand(configSetCmd)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Cobra Subcommands — Nested Command Trees — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Add to root,\trootCmd.AddCommand(deployCmd, configCmd),},,func main() {,\trootCmd.Execute(),},\n\n// Usage:,// app deploy start myservice,// app deploy status myservice,// app config set db.url postgres://localhost"
                  }
        ],
        tips: [
                  "Split commands into separate files: cmd/deploy.go, cmd/config.go, etc. Import and register in init().",
                  "Parent commands with only subcommands should return a help message, not try to execute business logic.",
                  "Use RunE for subcommands that do real work. Parent group commands can use Run to show help.",
                  "Arguments pass through the tree: \"app deploy start myservice\" → args[0]=\"myservice\" in deployStartCmd."
        ],
        mistake: "Putting all commands in main.go — makes it unreadable. Organize as: cmd/root.go, cmd/deploy.go, cmd/config.go, etc.",
        shorthand: {
          verbose: "// Manual / verbose approach\nrootCmd.AddCommand(deployCmd)\ndeployCmd.AddCommand(deployStartCmd, deployStatusCmd)\n// More explicit but longer",
          concise: "rootCmd.AddCommand(deployCmd); deployCmd.AddCommand(startCmd, statusCmd); organize: cmd/*.go per command",
        },
      },
      {
        id: "viper-config",
        fn: "Viper Configuration — Files, Environment Variables & Defaults",
        desc: "Master Viper: loading config from files, binding env vars, setting defaults, and unmarshaling to structs.",
        category: "Configuration",
        subtitle: "viper.SetConfigFile, viper.ReadInConfig, viper.BindPFlag, viper.Unmarshal",
        signature: "viper.SetConfigFile(path)  |  viper.BindPFlag(\"key\", flag)  |  viper.Unmarshal(&config)",
        descLong: "Viper is the Go config manager. Load from files (YAML, JSON, TOML, HCL), environment variables, and command-line flags with priority: flags > env > file > defaults. viper.SetConfigFile() or SetConfigName() + AddConfigPath(). viper.ReadInConfig() loads the file. BindPFlag() links a Cobra flag to a Viper key. BindEnv() links an env var. Unmarshal() deserializes into a struct with struct tags. AutomaticEnv() with SetEnvPrefix() automatically maps env vars (PREFIX_KEY_NAME) to config keys (key.name).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Viper Configuration — Files, Environment Variables & Defaults — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"fmt\"\n\t\"github.com/spf13/viper\"\n)\n\ntype Config struct {\n\tDatabase struct {\n\t\tHost     string\n\t\tPort     int\n\t\tUsername string\n\t}\n\tServer struct {\n\t\tPort int\n\t\tTLS  bool\n\t}\n\tLogLevel string\n}\n\nfunc main() {\n\t// Load from config file\n\tviper.SetConfigName(\"config\")\n\tviper.SetConfigType(\"yaml\")\n\tviper.AddConfigPath(\".\")\n\tviper.AddConfigPath(\"/etc/myapp/\")\n\n\tif err := viper.ReadInConfig(); err != nil {\n\t\tfmt.Println(\"No config file found, using defaults\")\n\t}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Viper Configuration — Files, Environment Variables & Defaults — common patterns you'll see in production.\n// APPROACH  - Combine Viper Configuration — Files, Environment Variables & Defaults with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Set defaults\n\tviper.SetDefault(\"server.port\", 8080)\n\tviper.SetDefault(\"log_level\", \"info\")\n\tviper.SetDefault(\"database.host\", \"localhost\")"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Viper Configuration — Files, Environment Variables & Defaults — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Bind environment variables,\tviper.BindEnv(\"database.host\", \"DB_HOST\"),\tviper.BindEnv(\"database.port\", \"DB_PORT\"),\tviper.SetEnvPrefix(\"APP\"),\tviper.AutomaticEnv() // APP_LOG_LEVEL -> log_level,\n\n\t// Get individual values,\tdbHost := viper.GetString(\"database.host\"),\tdbPort := viper.GetInt(\"database.port\"),\tlogLevel := viper.GetString(\"log_level\"),,\tfmt.Printf(\"DB: %s:%d, Log: %s\\n\", dbHost, dbPort, logLevel),\n\n\t// Unmarshal entire config to struct,\tvar cfg Config,\tif err := viper.Unmarshal(&cfg); err != nil {,\t\tpanic(err),\t},,\tfmt.Printf(\"Full config: %+v\\n\", cfg),\n\n\t// Watch for config file changes,\tviper.OnConfigChange(func(e fsnotify.Event) {,\t\tfmt.Println(\"Config reloaded!\"),\t}),\tviper.WatchConfig(),}"
                  }
        ],
        tips: [
                  "SetEnvPrefix(\"APP\") + AutomaticEnv() maps APP_DATABASE_HOST to database.host automatically.",
                  "BindPFlag() + BindEnv() create a priority chain: flags override env vars override config files override defaults.",
                  "Unmarshal() supports nested structs with \"mapstructure\" tags — deserialize entire config in one call.",
                  "WatchConfig() with OnConfigChange() enables live reloading — useful for sidecar processes that update config."
        ],
        mistake: "Not setting defaults before ReadInConfig() — if the config file is missing, values are nil. Always SetDefault() for all required keys.",
        shorthand: {
          verbose: "viper.SetConfigFile(\"config.yaml\")\nviper.ReadInConfig()\nviper.SetDefault(\"db.host\", \"localhost\")\nval := viper.GetString(\"db.host\")",
          concise: "viper.SetConfigFile(\"config.yaml\"); viper.ReadInConfig(); viper.SetDefault(...); viper.Unmarshal(&cfg)",
        },
      },
      {
        id: "go-flags-stdlib",
        fn: "Standard flag Package — Built-in CLI Flags",
        desc: "Go standard library flag package: simple flags, parsing, and basic CLI argument handling without external dependencies.",
        category: "CLI",
        subtitle: "flag.String, flag.Int, flag.Bool, flag.Parse, flag.Args",
        signature: "name := flag.String(\"name\", \"default\", \"help text\")  |  flag.Parse()  |  flag.Args()",
        descLong: "Go's flag package is the built-in standard for simple CLI flags. Less powerful than Cobra/Viper but requires no dependencies. Define flags with flag.String(), flag.Int(), flag.Bool(), etc. Call flag.Parse() to parse os.Args. Access values through returned pointers or flag.Lookup(). flag.Args() returns non-flag arguments. Best for simple utilities. For complex CLIs, use Cobra.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Standard flag Package — Built-in CLI Flags — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"flag\"\n\t\"fmt\"\n\t\"os\"\n)\n\nfunc main() {\n\t// Define flags\n\tname := flag.String(\"name\", \"World\", \"Name to greet\")\n\tcount := flag.Int(\"count\", 1, \"Number of greetings\")\n\tverbose := flag.Bool(\"verbose\", false, \"Verbose output\")"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Standard flag Package — Built-in CLI Flags — common patterns you'll see in production.\n// APPROACH  - Combine Standard flag Package — Built-in CLI Flags with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Parse command line\n\tflag.Parse()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Standard flag Package — Built-in CLI Flags — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Remaining non-flag arguments,\targs := flag.Args(),,\tif *verbose {,\t\tfmt.Printf(\"Parsed flags: name=%q, count=%d\\n\", *name, *count),\t\tfmt.Printf(\"Non-flag args: %v\\n\", args),\t},,\tfor i := 0; i < *count; i++ {,\t\tfmt.Printf(\"Hello, %s!\\n\", *name),\t},}"
                  }
        ],
        tips: [
                  "Flag variables are pointers — dereference with * to get the value.",
                  "flag.Parse() must be called before accessing flag values — typically first thing in main().",
                  "flag.Args() returns []string of non-flag arguments — useful for positional arguments.",
                  "Use flag for simple utilities. For complex CLIs (subcommands, validation), use Cobra."
        ],
        mistake: "Forgetting to dereference flag pointers with * — flag.String() returns *string, not string.",
        shorthand: {
          verbose: "name := flag.String(\"name\", \"default\", \"help\")\nflag.Parse()\nfmt.Println(*name)",
          concise: "flag.String/Int/Bool(...); flag.Parse(); use *varName or flag.Args() for positional",
        },
      },
      {
        id: "promptui",
        fn: "promptui — Interactive CLI Prompts",
        desc: "Build interactive CLIs with promptui: text input, selections, validation, and arrow key navigation.",
        category: "Interaction",
        subtitle: "promptui.Prompt, promptui.Select, Validate, Templates",
        signature: "prompt := &promptui.Prompt{Label:\"Name\"}  |  result, _ := prompt.Run()  |  select with arrow keys",
        descLong: "promptui provides beautiful interactive CLI prompts. Prompt for text input with validation. Select from a list with arrow keys, search, and Enter to select. Support for templates, custom validation functions, and password input. Essential for CLI tools that need user interaction beyond flags.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of promptui — Interactive CLI Prompts — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"fmt\"\n\t\"github.com/manifoldco/promptui\"\n)\n\nfunc main() {\n\t// ── Simple text prompt ──────────────────────────────\n\tprompt := &promptui.Prompt{\n\t\tLabel: \"Enter your name\",\n\t\tDefault: \"Anonymous\",\n\t}\n\tname, err := prompt.Run()\n\tif err != nil {\n\t\tfmt.Println(\"Error:\", err)\n\t\treturn\n\t}\n\tfmt.Printf(\"Hello, %s!\\n\", name)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of promptui — Interactive CLI Prompts — common patterns you'll see in production.\n// APPROACH  - Combine promptui — Interactive CLI Prompts with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Prompt with validation ──────────────────────────\n\tvalidate := func(input string) error {\n\t\tif len(input) < 3 {\n\t\t\treturn fmt.Errorf(\"name must be at least 3 characters\")\n\t\t}\n\t\treturn nil\n\t}\n\n\tprompt = &promptui.Prompt{\n\t\tLabel:    \"Enter username\",\n\t\tValidate: validate,\n\t}\n\tusername, _ := prompt.Run()\n\tfmt.Printf(\"Username: %s\\n\", username)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of promptui — Interactive CLI Prompts — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Select from list with arrow keys ────────────────,\titems := []string{\"Development\", \"Staging\", \"Production\"},,\tselect_ := &promptui.Select{,\t\tLabel: \"Select environment\",,\t\tItems: items,,\t},,\tidx, env, err := select_.Run(),\tif err != nil {,\t\tfmt.Println(\"Cancelled\"),\t\treturn,\t},\tfmt.Printf(\"You selected: %s (index %d)\\n\", env, idx),\n\n\t// ── Confirm prompt ──────────────────────────────────,\tconfirmPrompt := &promptui.Prompt{,\t\tLabel:     \"Deploy to production\",,\t\tIsConfirm: true,,\t},\tresult, err := confirmPrompt.Run(),\tif err != nil || result != \"y\" {,\t\tfmt.Println(\"Cancelled\"),\t\treturn,\t},\tfmt.Println(\"Deploying...\"),}"
                  }
        ],
        tips: [
                  "Validate function allows custom validation — return error to show message and re-prompt.",
                  "Select with arrow keys and type to search — much better UX than typing options.",
                  "IsConfirm: true prompts Y/n instead of free text — standard for confirmations.",
                  "Templates enable custom formatting — see promptui docs for format options."
        ],
        mistake: "Not validating input — use Validate: func to catch invalid input at prompt time instead of later.",
        shorthand: {
          verbose: "// Manual / verbose approach\nprompt := &promptui.Prompt{Label: \"Name\", Validate: func(s string) error { ... }}\nresult, _ := prompt.Run()\n// More explicit but longer",
          concise: "&promptui.Prompt{Label:\"...\", Validate:validateFunc}; &promptui.Select{Label:\"...\", Items:list}",
        },
      },
      {
        id: "bubbletea-basics",
        fn: "Bubble Tea TUI — Terminal User Interfaces",
        desc: "Build rich terminal UIs with Bubble Tea: model-update-view pattern, components, and interactive apps.",
        category: "TUI",
        subtitle: "tea.Model, Init, Update, View, tea.Program, messages",
        signature: "type Model struct{...}  |  func(m Model) Init()  |  func(m Model) Update(msg)  |  func(m Model) View()",
        descLong: "Bubble Tea is the Go TUI framework. Uses the Elm architecture: Model (state), Init (setup), Update (message handling), View (rendering). tea.Program runs the app loop. Send messages for events (key presses, timers, HTTP responses). Update returns new model and commands. Composable components for input, lists, tables. Essential for beautiful CLIs, dashboards, and interactive tools.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Bubble Tea TUI — Terminal User Interfaces — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"fmt\"\n\t\"github.com/charmbracelet/bubbletea\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Bubble Tea TUI — Terminal User Interfaces — common patterns you'll see in production.\n// APPROACH  - Combine Bubble Tea TUI — Terminal User Interfaces with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Model: holds application state ──────────────────\ntype Model struct {\n\tcount   int\n\tquitting bool\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Bubble Tea TUI — Terminal User Interfaces — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Init: called at startup ────────────────────────,func (m Model) Init() tea.Cmd {,\treturn nil,},\n\n// ── Update: handle messages and update state ───────,func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {,\tswitch msg := msg.(type) {,\tcase tea.KeyMsg:,\t\tswitch msg.String() {,\t\tcase \"q\", \"ctrl+c\":,\t\t\tm.quitting = true,\t\t\treturn m, tea.Quit,\t\tcase \"up\":,\t\t\tm.count++,\t\tcase \"down\":,\t\t\tif m.count > 0 {,\t\t\t\tm.count--,\t\t\t},\t\t},\t},\treturn m, nil,},\n\n// ── View: render the screen ────────────────────────,func (m Model) View() string {,\tif m.quitting {,\t\treturn \"Goodbye!\\n\",\t},\treturn fmt.Sprintf(,\t\t\"Count: %d\\n\\nPress up/down to change, q to quit\\n\",,\t\tm.count,,\t),},,func main() {,\tm := Model{count: 0},\tp := tea.NewProgram(m),\tif _, err := p.Run(); err != nil {,\t\tfmt.Println(\"Error:\", err),\t},}"
                  }
        ],
        tips: [
                  "Model holds all state. Update returns new Model — think of it as immutable (even though it's not).",
                  "Init() runs once at startup — use it to fetch data, start subscriptions.",
                  "Return tea.Quit() from Update to exit cleanly.",
                  "Use tea.Batch() to send multiple commands from Update."
        ],
        mistake: "Modifying model in place instead of returning a new model — Bubble Tea expects Update to return the updated model.",
        shorthand: {
          verbose: "func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {\n  switch msg := msg.(type) {\n  case tea.KeyMsg:\n    ...\n  }\n  return m, nil\n}",
          concise: "Model with Init/Update/View; switch on msg type; return (model, cmd) from Update; tea.Quit() to exit",
        },
      },
    ],
  },

  // ── Section 2: Observability & Fuzz Testing ─────────────────────────────────────────
  {
    id: "observability",
    title: "Observability & Fuzz Testing",
    entries: [
      {
        id: "pprof-tracing",
        fn: "pprof, Tracing & Metrics — Production Observability",
        desc: "Profile and monitor Go services: pprof for CPU/memory, OpenTelemetry tracing, Prometheus metrics, and context propagation.",
        category: "Observability",
        subtitle: "net/http/pprof, runtime/pprof, OpenTelemetry, Prometheus, context.Context",
        signature: "import _ \"net/http/pprof\"  |  tracer.Start(ctx, \"name\")  |  prometheus.NewCounter()",
        descLong: "Go has best-in-class built-in profiling. pprof captures CPU profiles, memory allocations, goroutine stacks, and block profiles — accessible via HTTP or programmatically. OpenTelemetry provides distributed tracing across services. Prometheus client exposes metrics (counters, histograms, gauges). context.Context propagates request-scoped data (trace IDs, deadlines, cancellation) through the call chain. Always pass context as the first parameter.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of pprof, Tracing & Metrics — Production Observability — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"context\"\n\t\"log\"\n\t\"net/http\"\n\t_ \"net/http/pprof\" // register pprof handlers\n\t\"runtime\"\n\t\"time\"\n\n\t\"github.com/prometheus/client_golang/prometheus\"\n\t\"github.com/prometheus/client_golang/prometheus/promhttp\"\n\t\"go.opentelemetry.io/otel\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of pprof, Tracing & Metrics — Production Observability — common patterns you'll see in production.\n// APPROACH  - Combine pprof, Tracing & Metrics — Production Observability with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── pprof — built-in profiling ──────────────────────\n// Import net/http/pprof and serve on a debug port:\n// go func() { log.Println(http.ListenAndServe(\":6060\", nil)) }()\n//\n// Usage:\n// go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30  (CPU)\n// go tool pprof http://localhost:6060/debug/pprof/heap                (memory)\n// go tool pprof http://localhost:6060/debug/pprof/goroutine           (goroutines)\n//\n// Interactive: top, list funcName, web (SVG visualization)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of pprof, Tracing & Metrics — Production Observability — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Prometheus metrics ──────────────────────────────,var (,\thttpRequestsTotal = prometheus.NewCounterVec(,\t\tprometheus.CounterOpts{,\t\t\tName: \"http_requests_total\",,\t\t\tHelp: \"Total HTTP requests\",,\t\t},,\t\t[]string{\"method\", \"path\", \"status\"},,\t),,\thttpDuration = prometheus.NewHistogramVec(,\t\tprometheus.HistogramOpts{,\t\t\tName:    \"http_request_duration_seconds\",,\t\t\tHelp:    \"HTTP request duration\",,\t\t\tBuckets: prometheus.DefBuckets,,\t\t},,\t\t[]string{\"method\", \"path\"},,\t),,\tactiveConnections = prometheus.NewGauge(prometheus.GaugeOpts{,\t\tName: \"active_connections\",,\t\tHelp: \"Number of active connections\",,\t}),),,func init() {,\tprometheus.MustRegister(httpRequestsTotal, httpDuration, activeConnections),},\n\n// Middleware to record metrics,func metricsMiddleware(next http.Handler) http.Handler {,\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {,\t\tstart := time.Now(),\t\tactiveConnections.Inc(),\t\tdefer activeConnections.Dec(),,\t\tnext.ServeHTTP(w, r),,\t\tduration := time.Since(start).Seconds(),\t\thttpRequestsTotal.WithLabelValues(r.Method, r.URL.Path, \"200\").Inc(),\t\thttpDuration.WithLabelValues(r.Method, r.URL.Path).Observe(duration),\t}),},\n\n// ── OpenTelemetry tracing ───────────────────────────,var tracer = otel.Tracer(\"myservice\"),,func processOrder(ctx context.Context, orderID string) error {,\tctx, span := tracer.Start(ctx, \"processOrder\"),\tdefer span.End(),,\tspan.SetAttributes(,\t\tattribute.String(\"order.id\", orderID),,\t),\n\n\t// Child span — automatically linked to parent,\tif err := validateOrder(ctx, orderID); err != nil {,\t\tspan.RecordError(err),\t\tspan.SetStatus(codes.Error, err.Error()),\t\treturn err,\t},,\treturn chargePayment(ctx, orderID),},\n\n// ── Context propagation pattern ─────────────────────,type contextKey string,,const requestIDKey contextKey = \"requestID\",,func withRequestID(ctx context.Context, id string) context.Context {,\treturn context.WithValue(ctx, requestIDKey, id),},,func getRequestID(ctx context.Context) string {,\tif id, ok := ctx.Value(requestIDKey).(string); ok {,\t\treturn id,\t},\treturn \"unknown\",},\n\n// Always pass context as first parameter,func fetchData(ctx context.Context, query string) ([]byte, error) {,\tctx, cancel := context.WithTimeout(ctx, 5*time.Second),\tdefer cancel(),,\treq, _ := http.NewRequestWithContext(ctx, \"GET\", \"https://api.example.com\", nil),\tresp, err := http.DefaultClient.Do(req),\tif err != nil {,\t\treturn nil, err // context cancellation/timeout surfaces here,\t},\tdefer resp.Body.Close(),\treturn io.ReadAll(resp.Body),}"
                  }
        ],
        tips: [
                  "Always expose pprof on a separate port (6060) from your main server — never expose it publicly in production.",
                  "go tool pprof -http=:8080 profile.pb.gz opens an interactive web UI with flame graphs — the best way to analyze profiles.",
                  "Use prometheus.HistogramVec for request duration — histograms let you calculate percentiles (p50, p95, p99) in Grafana.",
                  "context.Context should always be the first parameter — it carries deadlines, cancellation, and trace context through the entire call chain."
        ],
        mistake: "Storing context in a struct field — context should flow through function parameters, not be stored. Storing it leads to stale deadlines and leaked goroutines when the original request is done.",
        shorthand: {
          verbose: "type Service struct {\n  ctx context.Context\n}\nfunc (s *Service) Do() error {\n  // ctx deadline is stale\n}",
          concise: "func Do(ctx context.Context, args...) error { ... } as first param; context.WithTimeout() within function scope",
        },
      },
      {
        id: "opentelemetry-go",
        fn: "OpenTelemetry Go — Distributed Tracing",
        desc: "Instrument Go services with OpenTelemetry: creating spans, setting attributes, and propagating trace context.",
        category: "Observability",
        subtitle: "otel.Tracer, tracer.Start, span attributes, trace context propagation, exporters",
        signature: "tracer := otel.Tracer(\"serviceName\")  |  ctx, span := tracer.Start(ctx, \"operationName\")  |  span.SetAttributes(...)",
        descLong: "OpenTelemetry is the standard for distributed tracing in Go. Create a tracer from otel, then start spans within context. Each span tracks timing and attributes. Child operations automatically link to parent spans through context. Exporters send traces to backends (Jaeger, Tempo, etc.). Essential for understanding request flows across services and debugging latency.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of OpenTelemetry Go — Distributed Tracing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"context\"\n\t\"github.com/lightstep/otel-launcher-go/launcher\"\n\t\"go.opentelemetry.io/otel\"\n)\n\nfunc init() {\n\totel.SetTracerProvider(\n\t\tlauncher.NewSDK().GetTracerProvider(),\n\t)\n}\n\nvar tracer = otel.Tracer(\"myservice\")\n\nfunc processRequest(ctx context.Context, userID string) error {\n\tctx, span := tracer.Start(ctx, \"processRequest\")\n\tdefer span.End()\n\n\tspan.SetAttributes(\n\t\tattribute.String(\"user.id\", userID),\n\t)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of OpenTelemetry Go — Distributed Tracing — common patterns you'll see in production.\n// APPROACH  - Combine OpenTelemetry Go — Distributed Tracing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Child spans auto-link to parent\n\tif err := fetchUser(ctx, userID); err != nil {\n\t\tspan.RecordError(err)\n\t\treturn err\n\t}\n\n\treturn nil\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of OpenTelemetry Go — Distributed Tracing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfunc fetchUser(ctx context.Context, userID string) error {\n\tctx, span := tracer.Start(ctx, \"fetchUser\")\n\tdefer span.End()\n\t// ... implementation\n\treturn nil\n}"
                  }
        ],
        tips: [
                  "Context automatically carries trace context — spans created from ctx link as children.",
                  "Always defer span.End() — ensures span is properly recorded even if panic occurs.",
                  "span.RecordError() + span.SetStatus() mark errors for tracing backend.",
                  "Attributes should include request-scoped data (user ID, customer, etc.) for debugging."
        ],
        mistake: "Creating new context instead of passing through — tracer.Start(context.Background()) instead of tracer.Start(ctx) breaks trace linkage.",
        shorthand: {
          verbose: "ctx, span := tracer.Start(ctx, \"operation\")\ndefer span.End()\nspan.SetAttributes(...)\nspan.RecordError(err)",
          concise: "tracer.Start(ctx, \"op\"); defer span.End(); span.SetAttributes; span.RecordError",
        },
      },
      {
        id: "prometheus-go",
        fn: "Prometheus Go Client — Metrics Collection",
        desc: "Export Prometheus metrics: counters, gauges, histograms, and exposing /metrics endpoint.",
        category: "Observability",
        subtitle: "prometheus.NewCounterVec, MustRegister, histogram, gauge, /metrics",
        signature: "prometheus.NewCounterVec(...)  |  prometheus.MustRegister(...)  |  http.Handle(\"/metrics\", promhttp.Handler())",
        descLong: "Prometheus client instruments Go code with metrics. Counters accumulate (request count), Gauges are snapshots (active connections), Histograms measure distributions (latency). Use WithLabelValues() to add dimensions. MustRegister() registers globally. Expose /metrics HTTP endpoint with promhttp.Handler(). Prometheus scrapes this endpoint periodically.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Prometheus Go Client — Metrics Collection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"net/http\"\n\t\"github.com/prometheus/client_golang/prometheus\"\n\t\"github.com/prometheus/client_golang/prometheus/promhttp\"\n)\n\nvar (\n\trequestsTotal = prometheus.NewCounterVec(\n\t\tprometheus.CounterOpts{\n\t\t\tName: \"http_requests_total\",\n\t\t\tHelp: \"Total HTTP requests\",\n\t\t},\n\t\t[]string{\"method\", \"path\", \"status\"},\n\t)\n\n\trequestDuration = prometheus.NewHistogramVec(\n\t\tprometheus.HistogramOpts{\n\t\t\tName:    \"http_request_duration_seconds\",\n\t\t\tHelp:    \"Request duration in seconds\",\n\t\t\tBuckets: prometheus.DefBuckets,\n\t\t},\n\t\t[]string{\"path\"},\n\t)\n\n\tactiveConnections = prometheus.NewGaugeVec(\n\t\tprometheus.GaugeOpts{\n\t\t\tName: \"active_connections\",\n\t\t\tHelp: \"Active connections\",\n\t\t},\n\t\t[]string{\"endpoint\"},\n\t)\n)\n\nfunc init() {\n\tprometheus.MustRegister(requestsTotal, requestDuration, activeConnections)\n}\n\nfunc main() {\n\thttp.Handle(\"/metrics\", promhttp.Handler())\n\n\thttp.HandleFunc(\"/api/users\", func(w http.ResponseWriter, r *http.Request) {\n\t\tactiveConnections.WithLabelValues(\"users\").Inc()\n\t\tdefer activeConnections.WithLabelValues(\"users\").Dec()"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Prometheus Go Client — Metrics Collection — common patterns you'll see in production.\n// APPROACH  - Combine Prometheus Go Client — Metrics Collection with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ... business logic\n\n\t\trequestsTotal.WithLabelValues(r.Method, r.URL.Path, \"200\").Inc()\n\t\trequestDuration.WithLabelValues(r.URL.Path).Observe(0.05)\n\t})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Prometheus Go Client — Metrics Collection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nhttp.ListenAndServe(\":8080\", nil)\n}"
                  }
        ],
        tips: [
                  "Counter.Inc() increments by 1. Counter.Add(n) increments by n.",
                  "Histogram automatically tracks count, sum, and bucket counts for percentile calculations.",
                  "WithLabelValues() order must match the label names passed to NewCounterVec().",
                  "Keep cardinality low — avoid high-cardinality labels like user ID or request ID."
        ],
        mistake: "Using high-cardinality labels (user ID, request ID) — creates explosion of metric series and exhausts Prometheus memory.",
        shorthand: {
          verbose: "prometheus.NewCounterVec(prometheus.CounterOpts{Name:\"...\", Help:\"...\"},[]string{\"label\"})\nprometheus.MustRegister(...)\ncounter.WithLabelValues(\"val\").Inc()",
          concise: "NewCounterVec/HistogramVec/GaugeVec; MustRegister; .WithLabelValues().Inc/Set/Observe; promhttp.Handler",
        },
      },
      {
        id: "zerolog-basics",
        fn: "zerolog — Structured Logging",
        desc: "Fast structured JSON logging with zerolog: fields, levels, and log filtering.",
        category: "Logging",
        subtitle: "log.Info, log.Str, log.Int, structured fields, JSON output",
        signature: "log.Info().Str(\"key\", \"val\").Int(\"count\", 5).Msg(\"message\")",
        descLong: "zerolog is a fast, zero-allocation JSON logger. Build log messages with fluent API: .Str(), .Int(), .Bool(), etc. Chain fields, then call .Msg() to emit. Automatically outputs JSON. Use global log.Info/Warn/Error or logger.Info() after New(). Fast compared to other loggers due to zero-allocation design.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of zerolog — Structured Logging — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"github.com/rs/zerolog\"\n\t\"github.com/rs/zerolog/log\"\n)\n\nfunc main() {\n\t// ── Global logger (output to stderr) ────────────────\n\tlog.Info().Str(\"action\", \"startup\").Msg(\"application starting\")\n\n\tlog.Warn().\n\t\tStr(\"endpoint\", \"/api/users\").\n\t\tInt(\"status\", 500).\n\t\tMsg(\"request failed\")\n\n\tlog.Error().\n\t\tErr(errors.New(\"database down\")).\n\t\tStr(\"db\", \"postgres\").\n\t\tMsg(\"critical error\")"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of zerolog — Structured Logging — common patterns you'll see in production.\n// APPROACH  - Combine zerolog — Structured Logging with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Structured fields ───────────────────────────────\n\tlog.Info().\n\t\tStr(\"user_id\", \"123\").\n\t\tStr(\"action\", \"login\").\n\t\tInt(\"attempts\", 3).\n\t\tBool(\"success\", true).\n\t\tMsg(\"authentication complete\")"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of zerolog — Structured Logging — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Custom logger with level ───────────────────────,\tlogger := zerolog.New(os.Stderr).With().Timestamp().Logger(),\tlogger.Info().Msg(\"custom logger\"),\n\n\t// ── Log level configuration ────────────────────────,\tzerolog.SetGlobalLevel(zerolog.InfoLevel),\tlog.Debug().Msg(\"this won't appear\"),\tlog.Info().Msg(\"this will appear\"),}"
                  }
        ],
        tips: [
                  "zerolog outputs JSON by default — each field becomes a key-value pair in the JSON object.",
                  "Chain multiple fields: .Str().Int().Bool() before .Msg()",
                  "Use .Err(err) to log error details — automatically extracts error message and stack.",
                  ".With().Logger() creates a child logger with context fields that apply to all messages."
        ],
        mistake: "Not setting a log level — debug logs appear in production. Always set zerolog.SetGlobalLevel(zerolog.InfoLevel) or use environment-based configuration.",
        shorthand: {
          verbose: "// Manual / verbose approach\nlog.Info().Str(\"key\", \"val\").Int(\"count\", 5).Msg(\"message\")\n// More explicit but longer",
          concise: "log.Info/Warn/Error().Str/Int/Bool(\"key\",\"val\").Err(err).Msg(\"msg\"); structured JSON output",
        },
      },
      {
        id: "zap-basics",
        fn: "Uber zap — High-Performance Logging",
        desc: "Ultra-fast logging with Uber zap: structured fields, sampling, and production-grade configuration.",
        category: "Logging",
        subtitle: "zap.NewProduction, logger.Info, zap.String, SugaredLogger",
        signature: "logger, _ := zap.NewProduction()  |  logger.Info(\"msg\", zap.String(\"key\", \"val\"))",
        descLong: "zap is Uber's high-performance logger designed for production. More verbose than zerolog but faster at scale. Structured logging with strongly-typed fields (zap.String, zap.Int, etc.). zap.NewProduction() includes sampling, error handling. SugaredLogger wrapper allows printf-style logging. Must call Sync() to flush buffers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Uber zap — High-Performance Logging — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"go.uber.org/zap\"\n)\n\nfunc main() {\n\t// ── Production logger (JSON, sampling, buffering) ───\n\tlogger, _ := zap.NewProduction()\n\tdefer logger.Sync()\n\n\tlogger.Info(\"user login\",\n\t\tzap.String(\"user_id\", \"123\"),\n\t\tzap.String(\"action\", \"login\"),\n\t)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Uber zap — High-Performance Logging — common patterns you'll see in production.\n// APPROACH  - Combine Uber zap — High-Performance Logging with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Structured fields ──────────────────────────────\n\tlogger.Info(\"request processed\",\n\t\tzap.String(\"path\", \"/api/users\"),\n\t\tzap.Int(\"status\", 200),\n\t\tzap.Float64(\"duration_ms\", 45.2),\n\t\tzap.Bool(\"cached\", true),\n\t)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Uber zap — High-Performance Logging — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Error logging ──────────────────────────────────,\tif err != nil {,\t\tlogger.Error(\"failed to process\",,\t\t\tzap.Error(err),,\t\t\tzap.String(\"operation\", \"fetch_user\"),,\t\t),\t},\n\n\t// ── SugaredLogger (printf-style) ────────────────────,\tsugar := logger.Sugar(),\tsugar.Infof(\"user %s logged in at %s\", userID, timestamp),\tsugar.Warnw(\"invalid input\",,\t\t\"field\", \"email\",,\t\t\"value\", input,,\t),\n\n\t// ── Development logger (pretty-printed) ────────────,\tdevLogger, _ := zap.NewDevelopment(),\tdevLogger.Info(\"debug message\"),}"
                  }
        ],
        tips: [
                  "zap.NewProduction() includes sampling — high-frequency messages are sampled to avoid overwhelming logs.",
                  "Must call logger.Sync() before exit — buffers may be lost otherwise.",
                  "Use strongly-typed fields (zap.String, zap.Int) — faster than interfaces and catches type errors.",
                  "SugaredLogger is slower but convenient for printf-style — use sparingly."
        ],
        mistake: "Forgetting to defer logger.Sync() — logs may be lost if the process exits before buffers are flushed.",
        shorthand: {
          verbose: "logger, _ := zap.NewProduction()\ndefer logger.Sync()\nlogger.Info(\"msg\", zap.String(\"key\", \"val\"))",
          concise: "zap.NewProduction(); defer Sync(); logger.Info/Error(msg, zap.String/Int(...)); SugaredLogger for printf-style",
        },
      },
      {
        id: "slog-basics",
        fn: "slog — Standard Logging (Go 1.21+)",
        desc: "Go 1.21+ standard library logging: structured, composable, with JSON and text handlers.",
        category: "Logging",
        subtitle: "slog.Info, slog.With, slog.NewJSONHandler, structured attrs",
        signature: "slog.Info(\"msg\", \"key\", \"value\")  |  slog.With(slog.String(\"user_id\", \"123\")).Info(\"msg\")",
        descLong: "slog is the Go 1.21+ standard logging library. Built-in to stdlib — no dependencies. Structured logging with key-value pairs. Handlers determine output format (JSON, text). slog.With() creates context loggers with persistent fields. NewJSONHandler() for JSON output.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of slog — Standard Logging (Go 1.21+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"log/slog\"\n\t\"os\"\n)\n\nfunc main() {\n\t// ── Default logger (text output to stderr) ─────────\n\tslog.Info(\"application started\")"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of slog — Standard Logging (Go 1.21+) — common patterns you'll see in production.\n// APPROACH  - Combine slog — Standard Logging (Go 1.21+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Structured logging ─────────────────────────────\n\tslog.Info(\"user login\",\n\t\tslog.String(\"user_id\", \"123\"),\n\t\tslog.String(\"action\", \"login\"),\n\t\tslog.Int(\"attempt\", 2),\n\t)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of slog — Standard Logging (Go 1.21+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── JSON handler ───────────────────────────────────,\topts := &slog.HandlerOptions{,\t\tLevel: slog.LevelInfo,,\t},\thandler := slog.NewJSONHandler(os.Stderr, opts),\tlogger := slog.New(handler),,\tlogger.Info(\"processing request\",,\t\tslog.String(\"path\", \"/api/users\"),,\t\tslog.Int(\"status\", 200),,\t),\n\n\t// ── Context logging (slog.With) ────────────────────,\trequestLogger := slog.With(,\t\tslog.String(\"request_id\", \"req-123\"),,\t\tslog.String(\"user_id\", \"user-456\"),,\t),\trequestLogger.Info(\"started\"),\trequestLogger.Error(\"failed\", slog.String(\"reason\", \"timeout\")),\n\n\t// ── Log levels ─────────────────────────────────────,\tslog.Debug(\"debug message\")   // minimum level,\tslog.Info(\"info message\"),\tslog.Warn(\"warning message\"),\tslog.Error(\"error message\"),}"
                  }
        ],
        tips: [
                  "slog.With() returns a new logger with added context — useful for request-scoped logging.",
                  "JSONHandler outputs standard JSON — integrates with log aggregators.",
                  "TextHandler is human-readable — good for development.",
                  "slog is built into stdlib — zero dependencies, ship with Go itself."
        ],
        mistake: "Mixing key-value pairs incorrectly — slog expects pairs like \"key\", value or slog.String(\"key\", \"val\").",
        shorthand: {
          verbose: "// Manual / verbose approach\nslog.Info(\"msg\", slog.String(\"k\", \"v\"), slog.Int(\"n\", 5))\nlogger := slog.New(slog.NewJSONHandler(os.Stderr, nil))\n// More explicit but longer",
          concise: "slog.Info/Warn/Error(msg, slog.String/Int(...)); slog.With(...).Info(); NewJSONHandler for JSON output",
        },
      },
      {
        id: "pprof-basics",
        fn: "pprof — CPU and Memory Profiling",
        desc: "Profile Go applications: CPU profiles, memory allocation, goroutines, and block profiling.",
        category: "Profiling",
        subtitle: "net/http/pprof, go tool pprof, CPU profile, heap, goroutines",
        signature: "import _ \"net/http/pprof\"  |  go tool pprof http://localhost:6060/debug/pprof/profile",
        descLong: "pprof is Go's built-in profiling tool. Import net/http/pprof to register HTTP handlers. Profiles include CPU (samples stack every 10ms), heap (memory allocations), goroutines (active goroutine stacks), block (lock contention). Use go tool pprof to analyze. Supports command-line interactive mode or web UI with flame graphs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of pprof — CPU and Memory Profiling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n\t\"fmt\"\n\t\"log\"\n\t\"net/http\"\n\t_ \"net/http/pprof\"\n)\n\nfunc main() {\n\t// ── Expose pprof on debug port ─────────────────────\n\tgo func() {\n\t\tlog.Println(http.ListenAndServe(\":6060\", nil))\n\t}()"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of pprof — CPU and Memory Profiling — common patterns you'll see in production.\n// APPROACH  - Combine pprof — CPU and Memory Profiling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Serve main application ────────────────────────\n\thttp.HandleFunc(\"/\", handler)\n\thttp.ListenAndServe(\":8080\", nil)\n}\n\nfunc handler(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set(\"Content-Type\", \"text/plain\")\n\tfmt.Fprintf(w, \"Hello, World!\")\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of pprof — CPU and Memory Profiling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Available pprof endpoints:,// http://localhost:6060/debug/pprof/                  - index,// http://localhost:6060/debug/pprof/profile?seconds=30 - CPU profile,// http://localhost:6060/debug/pprof/heap              - memory profile,// http://localhost:6060/debug/pprof/goroutine         - goroutine stacks,// http://localhost:6060/debug/pprof/threadcreate      - thread creation,// http://localhost:6060/debug/pprof/block             - contention profile,\n\n// Usage examples:,// go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30,// go tool pprof http://localhost:6060/debug/pprof/heap,// go tool pprof http://localhost:6060/debug/pprof/goroutine"
                  }
        ],
        tips: [
                  "CPU profile: go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30 then type \"top\" to see hot functions.",
                  "Memory profile: look for alloc_space (total allocated) vs inuse_space (current memory).",
                  "go tool pprof -http=:8080 <profile> opens a web UI with flame graphs — better than CLI.",
                  "Never expose pprof publicly — it reveals code structure and is a security risk."
        ],
        mistake: "Profiling in production without -http UI — text output is hard to interpret. Always use -http=:8080 for visualization.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport _ \"net/http/pprof\"\ngo func() { http.ListenAndServe(\":6060\", nil) }()\n// More explicit but longer",
          concise: "import _ \"net/http/pprof\"; go http.ListenAndServe(\":6060\"); go tool pprof -http=:8080 http://...:6060/debug/pprof/profile",
        },
      },
      {
        id: "fuzz-testing",
        fn: "Fuzz Testing — Finding Bugs Automatically",
        desc: "Go native fuzz testing: writing fuzz targets, corpus management, and finding edge cases automatically.",
        category: "Testing",
        subtitle: "testing.F, f.Fuzz(), f.Add(), corpus, -fuzz, -fuzztime",
        signature: "func FuzzParse(f *testing.F) { f.Add(\"seed\"); f.Fuzz(func(t *testing.T, input string) { ... }) }",
        descLong: "Go 1.18+ includes native fuzz testing. Fuzz tests generate random inputs to find crashes, panics, and edge cases. Write a fuzz target with f.Fuzz(), seed it with f.Add(), and Go will mutate inputs to maximize code coverage. Found failures are saved as regression test cases in testdata/. Run with go test -fuzz=FuzzName -fuzztime=30s. Fuzz testing is ideal for parsers, validators, serializers, and any function that handles untrusted input.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Fuzz Testing — Finding Bugs Automatically — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage parser\n\nimport (\n\t\"testing\"\n\t\"unicode/utf8\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Fuzz Testing — Finding Bugs Automatically — common patterns you'll see in production.\n// APPROACH  - Combine Fuzz Testing — Finding Bugs Automatically with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic fuzz test ─────────────────────────────────\nfunc FuzzParseJSON(f *testing.F) {\n\t// Seed corpus — known interesting inputs\n\tf.Add(`{\"name\":\"Alice\",\"age\":30}`)\n\tf.Add(`[]`)\n\tf.Add(`\"\"`)\n\tf.Add(`null`)\n\tf.Add(`{\"nested\":{\"deep\":true}}`)\n\n\tf.Fuzz(func(t *testing.T, input string) {\n\t\t// The fuzzer will mutate these seeds to find crashes\n\t\tresult, err := ParseJSON(input)\n\t\tif err != nil {\n\t\t\treturn // errors are fine, panics are not\n\t\t}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Fuzz Testing — Finding Bugs Automatically — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Round-trip test: parse -> serialize -> parse must be equal,\t\tserialized, err := SerializeJSON(result),\t\tif err != nil {,\t\t\tt.Fatalf(\"failed to serialize parsed result: %v\", err),\t\t},,\t\tresult2, err := ParseJSON(serialized),\t\tif err != nil {,\t\t\tt.Fatalf(\"failed to re-parse: %v\", err),\t\t},,\t\tif !deepEqual(result, result2) {,\t\t\tt.Errorf(\"round-trip mismatch: %q -> %v -> %q -> %v\",,\t\t\t\tinput, result, serialized, result2),\t\t},\t}),},\n\n// ── Fuzz with multiple parameter types ──────────────,func FuzzEncodeURL(f *testing.F) {,\tf.Add(\"hello world\", true),\tf.Add(\"a/b?c=d&e=f\", false),\tf.Add(\"unicode: éèê\", true),,\tf.Fuzz(func(t *testing.T, input string, strict bool) {,\t\tif !utf8.ValidString(input) {,\t\t\treturn // skip invalid UTF-8,\t\t},,\t\tencoded := EncodeURL(input, strict),\t\tdecoded, err := DecodeURL(encoded),\t\tif err != nil {,\t\t\tt.Fatalf(\"decode failed: %v (encoded=%q)\", err, encoded),\t\t},\t\tif decoded != input {,\t\t\tt.Errorf(\"round-trip: %q -> %q -> %q\", input, encoded, decoded),\t\t},\t}),},\n\n// Run: go test -fuzz=FuzzParseJSON -fuzztime=30s,// Run: go test -fuzz=FuzzEncodeURL -fuzztime=1m,//,// Failures saved to: testdata/fuzz/FuzzParseJSON/<hash>,// These become permanent regression tests run by 'go test'"
                  }
        ],
        tips: [
                  "Fuzz tests find panics automatically — if your function panics on any input, the fuzzer will find it and save the input as a test case.",
                  "Seed the corpus with edge cases you know about (empty string, unicode, deeply nested) — the fuzzer mutates these to explore more paths.",
                  "Round-trip testing (parse -> serialize -> parse) is the most effective fuzz pattern — it catches asymmetry bugs without knowing the expected output.",
                  "Found failures are saved to testdata/ and run as regular tests — they become permanent regression tests automatically."
        ],
        mistake: "Running fuzz tests in CI without -fuzztime — without a time limit, fuzz tests run forever. Use -fuzztime=30s in CI and longer durations (hours) locally for thorough testing.",
        shorthand: {
          verbose: "func FuzzParse(f *testing.F) {\n  f.Fuzz(func(t *testing.T, input string) {\n    Parse(input)\n  })\n}",
          concise: "f.Add(seed); f.Fuzz(func(t*T, ...inputs){...}); go test -fuzz=FuzzName -fuzztime=30s; failures saved to testdata/fuzz/",
        },
      },
    ],
  },
]

export default { meta, sections }
