export const meta = {
  "id": "buildtools",
  "label": "Build Tools (Maven & Gradle)",
  "icon": "🔨",
  "description": "Java build tools: Maven POM, Gradle Kotlin DSL, dependency management, plugins, and multi-module projects."
}

export const sections = [

  // ── Section 1: Maven ─────────────────────────────────────────
  {
    id: "maven",
    title: "Maven",
    entries: [
      {
        id: "maven-fundamentals",
        fn: "Maven — POM, Dependencies & Lifecycle",
        desc: "Project Object Model, dependency management, build lifecycle, profiles, and the Maven repository system.",
        category: "Maven",
        subtitle: "pom.xml, dependencies, plugins, profiles, mvn clean install",
        signature: "mvn clean install  |  mvn test  |  mvn package -P production  |  mvn dependency:tree",
        descLong: "Maven uses pom.xml to define project metadata, dependencies, plugins, and build configuration. The dependency system resolves transitive dependencies from Maven Central automatically. The build lifecycle has phases: validate → compile → test → package → verify → install → deploy. Profiles activate different configurations (dev/prod). The Maven wrapper (mvnw) ensures consistent Maven versions across teams. Multi-module projects use parent POMs with modules.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Maven — POM, Dependencies & Lifecycle — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n<!-- ── pom.xml — standard project setup ──────────────── -->\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<project xmlns=\"http://maven.apache.org/POM/4.0.0\"\n         xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n         xsi:schemaLocation=\"http://maven.apache.org/POM/4.0.0\n         https://maven.apache.org/xsd/maven-4.0.0.xsd\">\n\n    <modelVersion>4.0.0</modelVersion>\n    <groupId>com.example</groupId>\n    <artifactId>my-app</artifactId>\n    <version>1.0.0-SNAPSHOT</version>\n    <packaging>jar</packaging>\n\n    <!-- Spring Boot parent (manages dependency versions) -->\n    <parent>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter-parent</artifactId>\n        <version>3.2.0</version>\n    </parent>\n\n    <properties>\n        <java.version>21</java.version>\n        <maven.compiler.source>21</maven.compiler.source>\n        <maven.compiler.target>21</maven.compiler.target>\n    </properties>\n\n    <dependencies>\n        <!-- Runtime dependency -->\n        <dependency>\n            <groupId>org.springframework.boot</groupId>\n            <artifactId>spring-boot-starter-web</artifactId>\n        </dependency>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Maven — POM, Dependencies & Lifecycle — common patterns you'll see in production.\n// APPROACH  - Combine Maven — POM, Dependencies & Lifecycle with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n<dependency>\n            <groupId>org.postgresql</groupId>\n            <artifactId>postgresql</artifactId>\n            <scope>runtime</scope>\n        </dependency>\n\n        <!-- Test dependency (not in production JAR) -->\n        <dependency>\n            <groupId>org.springframework.boot</groupId>\n            <artifactId>spring-boot-starter-test</artifactId>\n            <scope>test</scope>\n        </dependency>\n\n        <!-- Provided (available at compile, not packaged) -->\n        <dependency>\n            <groupId>org.projectlombok</groupId>\n            <artifactId>lombok</artifactId>\n            <scope>provided</scope>\n        </dependency>\n    </dependencies>\n\n    <!-- Build plugins -->\n    <build>\n        <plugins>\n            <plugin>\n                <groupId>org.springframework.boot</groupId>\n                <artifactId>spring-boot-maven-plugin</artifactId>\n            </plugin>\n        </plugins>\n    </build>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Maven — POM, Dependencies & Lifecycle — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n<!-- Profiles for environment-specific config -->\n    <profiles>\n        <profile>\n            <id>dev</id>\n            <properties>\n                <spring.profiles.active>dev</spring.profiles.active>\n            </properties>\n        </profile>\n        <profile>\n            <id>prod</id>\n            <properties>\n                <spring.profiles.active>prod</spring.profiles.active>\n            </properties>\n        </profile>\n    </profiles>\n</project>\n\n<!-- ── Common Maven commands ─────────────────────────── -->\n<!-- mvn clean install           — build + install to local repo     -->\n<!-- mvn test                    — run tests only                    -->\n<!-- mvn package -DskipTests     — build JAR, skip tests             -->\n<!-- mvn dependency:tree          — show dependency tree              -->\n<!-- mvn versions:display-dependency-updates — check for updates     -->\n<!-- mvn spring-boot:run          — run Spring Boot app              -->\n<!-- mvn clean install -P prod    — build with production profile    -->\n<!-- ./mvnw clean install         — use Maven wrapper (recommended)  -->"
                  }
        ],
        tips: [
                  "Use the Maven wrapper (mvnw) in version control — it ensures everyone uses the same Maven version without installing it.",
                  "dependency:tree shows the full transitive dependency graph — essential for debugging version conflicts.",
                  "scope=test keeps test libraries out of production. scope=provided keeps compile-time-only deps (Lombok) out of the JAR.",
                  "Spring Boot parent POM manages dependency versions — you usually omit <version> for Spring-managed dependencies."
        ],
        mistake: "Not using a BOM (Bill of Materials) or parent POM for version management — manually specifying versions for every dependency leads to version conflicts. Use Spring Boot parent or dependencyManagement section.",
        shorthand: {
          verbose: "<dependency>\n  <groupId>junit</groupId>\n  <artifactId>junit</artifactId>\n  <version>4.13.2</version>\n</dependency>",
          concise: "<dependency>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-starter-test</artifactId>\n  <scope>test</scope>\n</dependency>\n<!-- Parent POM manages versions -->",
        },
      },
      {
        id: "maven-lifecycle",
        fn: "Maven Build Lifecycle — Phases and Goals",
        desc: "Maven lifecycle phases: validate, compile, test, package, verify, install, deploy. Goals execute phase work.",
        category: "Maven",
        subtitle: "validate, compile, test, package, verify, install, deploy, goals",
        signature: "mvn compile  |  mvn test  |  mvn package  |  mvn verify  |  mvn install",
        descLong: "Maven has three built-in lifecycles: default (main build), clean (cleanup), site (documentation). Default lifecycle: validate → compile → test → package → verify → install → deploy. Each phase runs plugins that execute goals. mvn package runs through package phase (and earlier). Plugins bind goals to phases — Surefire plugin binds test goal to test phase. Understanding lifecycles prevents confusion about when code runs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Maven Build Lifecycle — Phases and Goals — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n<!-- ── Maven Lifecycle Phases ────────────────────\nvalidate    Validate project is correct, all necessary info available\ncompile     Compile the source code\ntest        Test the compiled source using test framework (JUnit)\npackage     Package compiled code into JAR/WAR\nverify      Run integration tests, check quality\ninstall     Install package in local repo (~/.m2/repository)\ndeploy      Copy final package to remote repo\n\nCommon commands:\nmvn clean                  Remove target/ directory\nmvn compile                Compile source code only\nmvn test                   Run tests (skips package)\nmvn package                Package to JAR/WAR (runs test)\nmvn package -DskipTests    Package, skip tests\nmvn verify                 Run integration tests + checks\nmvn install                Install to local repo\nmvn deploy                 Upload to remote repo\nmvn site                   Generate documentation site\n-->\n\n<!-- ── Plugin execution bound to lifecycle ──────── -->\n<build>\n    <plugins>\n        <!-- Compiler plugin — binds to compile phase -->\n        <plugin>\n            <groupId>org.apache.maven.plugins</groupId>\n            <artifactId>maven-compiler-plugin</artifactId>\n            <version>3.11.0</version>\n            <configuration>\n                <source>21</source>\n                <target>21</target>\n            </configuration>\n        </plugin>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Maven Build Lifecycle — Phases and Goals — common patterns you'll see in production.\n// APPROACH  - Combine Maven Build Lifecycle — Phases and Goals with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n<!-- Surefire plugin — binds test goal to test phase -->\n        <plugin>\n            <groupId>org.apache.maven.plugins</groupId>\n            <artifactId>maven-surefire-plugin</artifactId>\n            <version>3.0.0</version>\n            <configuration>\n                <includes>\n                    <include>**/*Test.java</include>\n                    <include>**/*Tests.java</include>\n                </includes>\n            </configuration>\n        </plugin>\n\n        <!-- Failsafe plugin — integration tests in verify phase -->\n        <plugin>\n            <groupId>org.apache.maven.plugins</groupId>\n            <artifactId>maven-failsafe-plugin</artifactId>\n            <version>3.0.0</version>\n            <configuration>\n                <includes>\n                    <include>**/*IT.java</include>\n                </includes>\n            </configuration>\n        </plugin>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Maven Build Lifecycle — Phases and Goals — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n<!-- Jar plugin — binds to package phase -->\n        <plugin>\n            <groupId>org.apache.maven.plugins</groupId>\n            <artifactId>maven-jar-plugin</artifactId>\n            <version>3.3.0</version>\n        </plugin>\n    </plugins>\n</build>"
                  }
        ],
        tips: [
                  "mvn clean package is the standard build — removes old artifacts, compiles, tests, packages.",
                  "Phases are sequential: test runs compile first, package runs test first — no need to call mvn compile then mvn test.",
                  "mvn verify includes integration tests (Failsafe) in addition to unit tests (Surefire) — use in CI.",
                  "Plugin goals can be called directly: mvn dependency:tree, mvn org.apache.maven.plugins:maven-compiler-plugin:compile."
        ],
        mistake: "Not understanding phase sequencing — calling mvn test then mvn compile compiles twice. Use mvn compile test package for the right sequence.",
        shorthand: {
          verbose: "# Run full build cycle\nmvn clean install\n\n# Just compile\nmvn compile\n\n# Compile + run tests\nmvn test",
          concise: "mvn clean package\n# Cleans, compiles, tests, packages\n# Most common command",
        },
      },
      {
        id: "maven-dependencies",
        fn: "Maven Dependency Management — Scopes and BOMs",
        desc: "Manage dependencies: compile/test/provided/runtime scopes, transitive deps, BOMs, version properties.",
        category: "Maven",
        subtitle: "scope (compile/test/provided/runtime), <dependencyManagement>, BOM imports, <properties>",
        signature: "<scope>test</scope>  |  <scope>provided</scope>  |  <dependencyManagement> with BOM",
        descLong: "Maven scopes control when dependencies are available. compile (default): compile + runtime + tests. test: tests only, not in JAR. provided: compile-time only (e.g., Servlet API), not packaged. runtime: runtime only, not compile (rare). Transitive dependencies are pulled automatically — Maven resolves the tree. BOMs (Bill of Materials) with <dependencyManagement> centralize version management across modules. Dependency properties (< version>${spring.version}</version>) keep versions DRY.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Maven Dependency Management — Scopes and BOMs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<project>\n    <!-- ── Dependency Management (BOM) ──────────────── -->\n    <!-- Centralize versions across modules -->\n    <dependencyManagement>\n        <dependencies>\n            <!-- Import Spring Boot BOM -->\n            <dependency>\n                <groupId>org.springframework.boot</groupId>\n                <artifactId>spring-boot-dependencies</artifactId>\n                <version>3.2.0</version>\n                <type>pom</type>\n                <scope>import</scope>\n            </dependency>\n        </dependencies>\n    </dependencyManagement>\n\n    <!-- ── Properties for DRY version management ───── -->\n    <properties>\n        <java.version>21</java.version>\n        <maven.compiler.source>21</maven.compiler.source>\n        <maven.compiler.target>21</maven.compiler.target>\n        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>\n        <spring.version>6.0.0</spring.version>\n        <postgresql.version>42.6.0</postgresql.version>\n    </properties>\n\n    <dependencies>\n        <!-- ── Compile scope (default) ─────────────── -->\n        <!-- Available at compile time, runtime, and tests -->\n        <dependency>\n            <groupId>org.springframework</groupId>\n            <artifactId>spring-context</artifactId>\n            <version>${spring.version}</version>\n            <!-- <scope>compile</scope> default, can omit -->\n        </dependency>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Maven Dependency Management — Scopes and BOMs — common patterns you'll see in production.\n// APPROACH  - Combine Maven Dependency Management — Scopes and BOMs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n<!-- ── Test scope ──────────────────────────── -->\n        <!-- Only available in tests, NOT in JAR -->\n        <dependency>\n            <groupId>org.junit.jupiter</groupId>\n            <artifactId>junit-jupiter</artifactId>\n            <version>5.9.2</version>\n            <scope>test</scope>\n        </dependency>\n\n        <dependency>\n            <groupId>org.mockito</groupId>\n            <artifactId>mockito-core</artifactId>\n            <version>5.2.0</version>\n            <scope>test</scope>\n        </dependency>\n\n        <!-- ── Provided scope ──────────────────────── -->\n        <!-- Compile-time only (e.g., Servlet API on server) -->\n        <!-- Not packaged, assumed present at runtime -->\n        <dependency>\n            <groupId>jakarta.servlet</groupId>\n            <artifactId>jakarta.servlet-api</artifactId>\n            <version>6.0.0</version>\n            <scope>provided</scope>\n        </dependency>\n\n        <!-- ── Runtime scope (rare) ────────────────── -->\n        <!-- Not needed at compile time, only runtime -->\n        <!-- Example: JDBC drivers -->\n        <dependency>\n            <groupId>org.postgresql</groupId>\n            <artifactId>postgresql</artifactId>\n            <version>${postgresql.version}</version>\n            <scope>runtime</scope>\n        </dependency>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Maven Dependency Management — Scopes and BOMs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n<!-- ── Transitive dependency (auto-pulled) ─── -->\n        <!-- Spring Context automatically pulls Spring Core, Beans, etc. -->\n        <!-- No need to explicitly declare them -->\n    </dependencies>\n\n    <!-- ── Exclude transitive dependency ─────────────── -->\n    <dependency>\n        <groupId>org.springframework</groupId>\n        <artifactId>spring-context</artifactId>\n        <version>${spring.version}</version>\n        <exclusions>\n            <exclusion>\n                <groupId>commons-logging</groupId>\n                <artifactId>commons-logging</artifactId>\n            </exclusion>\n        </exclusions>\n    </dependency>\n\n    <!-- ── Check for dependency updates ──────────────── -->\n    <!-- mvn versions:display-dependency-updates -->\n\n    <!-- ── Analyze unused/missing dependencies ───────── -->\n    <!-- mvn dependency:analyze -->\n\n    <!-- ── View dependency tree ──────────────────────── -->\n    <!-- mvn dependency:tree -->\n</project>"
                  }
        ],
        tips: [
                  "<scope>test</scope> keeps test libs out of production — never accidentally deploy test code.",
                  "<scope>provided</scope> for Servlet API, Lombok — they are present at runtime (server provides them).",
                  "BOM imports centralize versions — declare once in dependencyManagement, inherit in all modules.",
                  "mvn dependency:tree shows transitive deps — useful for debugging version conflicts."
        ],
        mistake: "Not using scope=provided for Servlet API — test/dev code will try to bundle it, causing conflicts.",
        shorthand: {
          verbose: "<dependency>\n  <groupId>org.springframework</groupId>\n  <artifactId>spring-context</artifactId>\n  <version>6.0.0</version>\n  <scope>compile</scope>  <!-- Default -->\n</dependency>",
          concise: "<!-- Spring Boot parent handles versions -->\n<parent>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-starter-parent</artifactId>\n  <version>3.2.0</version>\n</parent>\n\n<dependency>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-starter-web</artifactId>\n  <!-- Version inherited from parent -->\n</dependency>",
        },
      },
      {
        id: "maven-plugins",
        fn: "Maven Plugins — Surefire, Failsafe, Shade, Spring Boot",
        desc: "Common plugins: Surefire (unit tests), Failsafe (integration tests), Shade (fat JAR), Spring Boot, Versions.",
        category: "Maven",
        subtitle: "maven-surefire-plugin, maven-failsafe-plugin, maven-shade-plugin, spring-boot-maven-plugin",
        signature: "mvn test (Surefire)  |  mvn verify (Failsafe)  |  mvn package (Shade)  |  ./mvnw spring-boot:run",
        descLong: "Plugins extend Maven by binding goals to phases. Surefire runs unit tests (*Test.java) in test phase. Failsafe runs integration tests (*IT.java) in verify phase. Shade creates uber-JARs (fat JARs with all dependencies). Spring Boot plugin creates executable JARs with embedded Tomcat. Versions plugin checks for outdated dependencies. Each plugin has configuration options (parallel threads, test includes, JAR name).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Maven Plugins — Surefire, Failsafe, Shade, Spring Boot — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n<!-- ── Surefire Plugin — Unit Tests ──────────────── -->\n<plugin>\n    <groupId>org.apache.maven.plugins</groupId>\n    <artifactId>maven-surefire-plugin</artifactId>\n    <version>3.0.0</version>\n    <configuration>\n        <!-- Include test classes -->\n        <includes>\n            <include>**/*Test.java</include>\n            <include>**/*Tests.java</include>\n        </includes>\n\n        <!-- Run tests in parallel -->\n        <parallel>methods</parallel>\n        <threadCount>4</threadCount>\n\n        <!-- Skip slow tests in dev -->\n        <excludedGroups>slow</excludedGroups>\n    </configuration>\n</plugin>\n\n<!-- ── Failsafe Plugin — Integration Tests ────────── -->\n<!-- Runs in verify phase, after package -->\n<!-- Suitable for tests requiring real resources (DB, server) -->\n<plugin>\n    <groupId>org.apache.maven.plugins</groupId>\n    <artifactId>maven-failsafe-plugin</artifactId>\n    <version>3.0.0</version>\n    <configuration>\n        <!-- Integration tests naming -->\n        <includes>\n            <include>**/*IT.java</include>\n            <include>**/*IntegrationTest.java</include>\n        </includes>\n    </configuration>\n    <executions>\n        <execution>\n            <goals>\n                <goal>integration-test</goal>\n                <goal>verify</goal>\n            </goals>\n        </execution>\n    </executions>\n</plugin>\n\n<!-- ── Shade Plugin — Fat JAR (Uber-JAR) ──────────── -->\n<!-- Bundles all dependencies into single JAR -->\n<!-- Useful for standalone apps without runtime classpath setup -->\n<plugin>\n    <groupId>org.apache.maven.plugins</groupId>\n    <artifactId>maven-shade-plugin</artifactId>\n    <version>3.4.1</version>\n    <executions>\n        <execution>\n            <phase>package</phase>\n            <goals>\n                <goal>shade</goal>\n            </goals>\n            <configuration>\n                <transformers>\n                    <!-- Merge META-INF/services files -->\n                    <transformer implementation=\n                        \"org.apache.maven.plugins.shade.resource.ServicesResourceTransformer\">\n                    </transformer>\n                    <!-- Set main class -->\n                    <transformer implementation=\n                        \"org.apache.maven.plugins.shade.resource.ManifestResourceTransformer\">\n                        <mainClass>com.example.Main</mainClass>\n                    </transformer>\n                </transformers>\n                <!-- Exclude files from JAR -->\n                <shadedArtifactAttached>true</shadedArtifactAttached>\n                <shadedClassifierName>shaded</shadedClassifierName>\n            </configuration>\n        </execution>\n    </executions>\n</plugin>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Maven Plugins — Surefire, Failsafe, Shade, Spring Boot — common patterns you'll see in production.\n// APPROACH  - Combine Maven Plugins — Surefire, Failsafe, Shade, Spring Boot with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n<!-- ── Spring Boot Maven Plugin ────────────────────── -->\n<!-- Creates executable JAR with embedded server -->\n<!-- Usually included via spring-boot-starter-parent -->\n<plugin>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-maven-plugin</artifactId>\n    <version>3.2.0</version>\n    <configuration>\n        <!-- Main class (auto-detected, rarely needed) -->\n        <mainClass>com.example.Application</mainClass>\n    </configuration>\n</plugin>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Maven Plugins — Surefire, Failsafe, Shade, Spring Boot — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n<!-- ── Versions Plugin — Check for Updates ─────────── -->\n<!-- mvn versions:display-dependency-updates          -->\n<!-- mvn versions:display-plugin-updates              -->\n<!-- mvn versions:update-properties -Dincludes=... -->\n<plugin>\n    <groupId>org.codehaus.mojo</groupId>\n    <artifactId>versions-maven-plugin</artifactId>\n    <version>2.14.2</version>\n</plugin>\n\n<!-- ── Enforcer Plugin — Check Build Rules ────────── -->\n<!-- Enforce Java version, Maven version, banned deps -->\n<plugin>\n    <groupId>org.apache.maven.plugins</groupId>\n    <artifactId>maven-enforcer-plugin</artifactId>\n    <version>3.3.0</version>\n    <executions>\n        <execution>\n            <id>enforce-versions</id>\n            <goals>\n                <goal>enforce</goal>\n            </goals>\n            <configuration>\n                <rules>\n                    <!-- Require Java 21+ -->\n                    <requireJavaVersion>\n                        <version>21</version>\n                    </requireJavaVersion>\n                    <!-- Require Maven 3.8.1+ -->\n                    <requireMavenVersion>\n                        <version>3.8.1</version>\n                    </requireMavenVersion>\n                    <!-- Ban certain dependencies -->\n                    <bannedDependencies>\n                        <excludes>\n                            <exclude>log4j:log4j</exclude>\n                            <exclude>commons-logging:commons-logging</exclude>\n                        </excludes>\n                    </bannedDependencies>\n                </rules>\n            </configuration>\n        </execution>\n    </executions>\n</plugin>"
                  }
        ],
        tips: [
                  "Surefire for unit tests (fast, no setup), Failsafe for integration tests (slow, real resources) — keep them separate.",
                  "mvn verify runs both Surefire and Failsafe — ideal for CI/CD; mvn test runs only Surefire (dev).",
                  "Spring Boot plugin auto-creates executable JAR — no configuration usually needed if using parent POM.",
                  "Shade plugin for standalone CLIs; Spring Boot plugin for servers — pick based on use case."
        ],
        mistake: "Not separating unit and integration tests by naming (*Test vs *IT) — slow integration tests slow down dev build.",
        shorthand: {
          verbose: "<plugin>\n  <groupId>org.apache.maven.plugins</groupId>\n  <artifactId>maven-surefire-plugin</artifactId>\n  <configuration>\n    <parallel>methods</parallel>\n    <threadCount>4</threadCount>\n  </configuration>\n</plugin>",
          concise: "<!-- Spring Boot plugin (in spring-boot-starter-parent) -->\n<!-- Automatically creates executable JAR -->\n<!-- mvn spring-boot:run to run directly -->\n<!-- No explicit config needed -->",
        },
      },
    ],
  },

  // ── Section 2: Gradle ─────────────────────────────────────────
  {
    id: "gradle",
    title: "Gradle",
    entries: [
      {
        id: "gradle-basics",
        fn: "Gradle Fundamentals — Tasks, Plugins, Dependencies",
        desc: "Gradle basics: build.gradle.kts, plugins, tasks, dependencies, repositories, Gradle wrapper.",
        category: "Gradle",
        subtitle: "plugins {}, dependencies {}, tasks {}, Gradle wrapper (./gradlew)",
        signature: "gradle build  |  gradle test  |  ./gradlew bootRun  |  gradle tasks",
        descLong: "Gradle uses build.gradle.kts (Kotlin DSL) or build.gradle (Groovy). plugins {} declares plugins (java, application, spring-boot). dependencies {} specifies compile/test/runtime deps. Gradle wrapper (./gradlew) ensures consistent Gradle version across team — checked in to version control. Gradle is faster than Maven due to incremental builds and build cache. Task execution order is determined by task dependencies, not sequential.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Gradle Fundamentals — Tasks, Plugins, Dependencies — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── build.gradle.kts ──────────────────────────\nplugins {\n    java\n    id(\"org.springframework.boot\") version \"3.2.0\"\n    id(\"io.spring.dependency-management\") version \"1.1.4\"\n}\n\ngroup = \"com.example\"\nversion = \"1.0.0\"\n\njava {\n    sourceCompatibility = JavaVersion.VERSION_21\n    targetCompatibility = JavaVersion.VERSION_21\n}\n\nrepositories {\n    mavenCentral()\n    // Custom repository\n    maven {\n        url = uri(\"https://repo.custom.com/maven\")\n    }\n}\n\ndependencies {\n    // Implementation: compile + runtime\n    implementation(\"org.springframework.boot:spring-boot-starter-web\")"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Gradle Fundamentals — Tasks, Plugins, Dependencies — common patterns you'll see in production.\n// APPROACH  - Combine Gradle Fundamentals — Tasks, Plugins, Dependencies with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Only runtime (not compile time)\n    runtimeOnly(\"org.postgresql:postgresql\")"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Gradle Fundamentals — Tasks, Plugins, Dependencies — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Only compile time,    compileOnly(\"org.projectlombok:lombok\"),    annotationProcessor(\"org.projectlombok:lombok\"),\n\n    // Test dependencies,    testImplementation(\"org.springframework.boot:spring-boot-starter-test\"),},\n\n// ── Tasks ───────────────────────────────────────,tasks.test {,    useJUnitPlatform(),},,tasks.bootJar {,    archiveFileName.set(\"app.jar\"),},\n\n// Custom task,tasks.register(\"greet\") {,    doLast {,        println(\"Hello from Gradle!\"),    },},\n\n// ── Gradle commands ─────────────────────────────,// ./gradlew build           — compile, test, package,// ./gradlew test            — tests only,// ./gradlew clean           — remove build/,// ./gradlew bootRun         — run Spring Boot,// ./gradlew tasks           — list all tasks,// ./gradlew dependencies    — show dependency tree"
                  }
        ],
        tips: [
                  "./gradlew (wrapper) ensures consistent Gradle version — always use wrapper, never install Gradle system-wide.",
                  "plugins {} must come first — declares plugins before properties/dependencies.",
                  "implementation hides internal deps; api exposes them — use implementation for 95% of deps.",
                  "gradle build --parallel uses all CPU cores — enables in gradle.properties: org.gradle.parallel=true."
        ],
        mistake: "Using global Gradle instead of wrapper — different versions produce different results. Always use ./gradlew.",
        shorthand: {
          verbose: "plugins {\n    id(\"java\")\n    id(\"org.springframework.boot\") version \"3.2.0\"\n}\nrepositories {\n    mavenCentral()\n}\ndependencies {\n    implementation(\"org.springframework.boot:spring-boot-starter-web\")\n}",
          concise: "./gradlew build  # Compile, test, package\n./gradlew test   # Run tests\n./gradlew clean  # Remove build/",
        },
      },
      {
        id: "gradle-kotlin-dsl",
        fn: "Gradle Kotlin DSL — Modern Build Configuration",
        desc: "Configure Java projects with Gradle Kotlin DSL: dependencies, tasks, plugins, and multi-module builds.",
        category: "Gradle",
        subtitle: "build.gradle.kts, implementation, testImplementation, tasks, plugins",
        signature: "gradle build  |  gradle test  |  implementation(\"group:artifact:version\")",
        descLong: "Gradle is a flexible build tool using Kotlin DSL (build.gradle.kts) or Groovy (build.gradle). Kotlin DSL provides type-safe configuration with IDE auto-complete. Dependencies use configuration scopes: implementation (compile + runtime), api (transitive), runtimeOnly, testImplementation. The Gradle wrapper (gradlew) pins the version. Gradle is faster than Maven due to incremental builds, build cache, and parallel execution. Configuration cache further speeds up repeated builds.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Gradle Kotlin DSL — Modern Build Configuration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── build.gradle.kts — Kotlin DSL ─────────────────\nplugins {\n    java\n    id(\"org.springframework.boot\") version \"3.2.0\"\n    id(\"io.spring.dependency-management\") version \"1.1.4\"\n}\n\ngroup = \"com.example\"\nversion = \"1.0.0-SNAPSHOT\"\n\njava {\n    sourceCompatibility = JavaVersion.VERSION_21\n    targetCompatibility = JavaVersion.VERSION_21\n}\n\nrepositories {\n    mavenCentral()\n}\n\ndependencies {\n    // Compile + runtime\n    implementation(\"org.springframework.boot:spring-boot-starter-web\")\n    implementation(\"org.springframework.boot:spring-boot-starter-data-jpa\")"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Gradle Kotlin DSL — Modern Build Configuration — common patterns you'll see in production.\n// APPROACH  - Combine Gradle Kotlin DSL — Modern Build Configuration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Runtime only (not needed at compile time)\n    runtimeOnly(\"org.postgresql:postgresql\")"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Gradle Kotlin DSL — Modern Build Configuration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Compile only (annotation processors),    compileOnly(\"org.projectlombok:lombok\"),    annotationProcessor(\"org.projectlombok:lombok\"),\n\n    // Test dependencies,    testImplementation(\"org.springframework.boot:spring-boot-starter-test\"),    testImplementation(\"org.testcontainers:postgresql:1.19.3\"),},,tasks.test {,    useJUnitPlatform()         // use JUnit 5,    maxParallelForks = Runtime.getRuntime().availableProcessors(),    jvmArgs(\"-XX:+EnableDynamicAgentLoading\"),},,tasks.bootJar {,    archiveFileName.set(\"app.jar\"),},\n\n// ── Multi-module project ─────────────────────────,// settings.gradle.kts:,// rootProject.name = \"my-app\",// include(\"core\", \"api\", \"web\"),\n\n// In subproject build.gradle.kts:,// dependencies {,//     implementation(project(\":core\")),// },\n\n// ── Custom task ──────────────────────────────────,tasks.register(\"printVersion\") {,    doLast {,        println(\"Version: $version\"),    },},\n\n// ── Common Gradle commands ───────────────────────,// ./gradlew build                — compile + test + package,// ./gradlew test                 — run tests only,// ./gradlew bootRun              — run Spring Boot app,// ./gradlew dependencies         — show dependency tree,// ./gradlew build --parallel     — parallel module builds,// ./gradlew build --build-cache  — use build cache,// ./gradlew clean build -x test  — build without tests"
                  }
        ],
        tips: [
                  "Use Kotlin DSL (.kts) over Groovy — you get type safety, auto-complete, and compile-time error checking.",
                  "./gradlew build --parallel --build-cache makes Gradle significantly faster — enable both in gradle.properties permanently.",
                  "implementation hides transitive dependencies from consumers; api exposes them — use implementation by default.",
                  "tasks.test { useJUnitPlatform() } is required for JUnit 5 — without it, Gradle uses JUnit 4 runner."
        ],
        mistake: "Using api() for all dependencies — api() exposes dependencies to consumers, bloating their classpath. Use implementation() by default; only use api() when downstream modules genuinely need the dependency.",
        shorthand: {
          verbose: "// Groovy DSL — less IDE support, no type checking\ndependencies {\n    compile 'org.springframework.boot:spring-boot-starter-web:3.2.0'\n}",
          concise: "// Kotlin DSL — type-safe, IDE auto-complete\ndependencies {\n    implementation(\"org.springframework.boot:spring-boot-starter-web\")\n}",
        },
      },
      {
        id: "gradle-multi-module",
        fn: "Gradle Multi-Module Projects — Shared Dependencies",
        desc: "Multi-module builds: settings.gradle.kts, allprojects, subproject configs, shared dependency versions.",
        category: "Gradle",
        subtitle: "settings.gradle.kts, include(), allprojects {}, subprojects {}, shared properties",
        signature: "include(\"core\", \"api\", \"web\")  |  implementation(project(\":core\"))  |  subprojects { java { ... } }",
        descLong: "Multi-module projects organize code by logical layers/services. settings.gradle.kts defines root and includes subprojects. allprojects {} applies config to all modules; subprojects {} to all except root. Shared dependency versions in root build.gradle.kts prevent version mismatches. Project dependencies (implementation(project(\":core\"))) declare module dependencies. Build cache and parallel execution make builds fast.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Gradle Multi-Module Projects — Shared Dependencies — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── settings.gradle.kts (root) ──────────────────\nrootProject.name = \"my-app\"\n\ninclude(\"api\", \"core\", \"common\", \"integration-tests\")"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Gradle Multi-Module Projects — Shared Dependencies — common patterns you'll see in production.\n// APPROACH  - Combine Gradle Multi-Module Projects — Shared Dependencies with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Optional: configure subprojects\npluginManagement {\n    repositories {\n        gradlePluginPortal()\n        mavenCentral()\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Gradle Multi-Module Projects — Shared Dependencies — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── build.gradle.kts (root) ──────────────────,group = \"com.example.myapp\",version = \"1.0.0-SNAPSHOT\",\n\n// Properties shared by all subprojects,val javaVersion = JavaVersion.VERSION_21,val springBootVersion = \"3.2.0\",val junitVersion = \"5.9.2\",\n\n// Apply plugins and config to all subprojects,allprojects {,    repositories {,        mavenCentral(),    },},,subprojects {,    apply(plugin = \"java\"),,    java {,        sourceCompatibility = javaVersion,        targetCompatibility = javaVersion,    },\n\n    // Shared dependencies,    dependencies {,        testImplementation(\"org.junit.jupiter:junit-jupiter:$junitVersion\"),        testImplementation(\"org.mockito:mockito-core:5.2.0\"),    },},\n\n// ── api/build.gradle.kts ────────────────────,plugins {,    id(\"org.springframework.boot\") version \"3.2.0\",},,dependencies {,    // Internal project dependencies,    implementation(project(\":core\")),    implementation(project(\":common\")),\n\n    // External dependencies,    implementation(\"org.springframework.boot:spring-boot-starter-web:$springBootVersion\"),    testImplementation(\"org.springframework.boot:spring-boot-starter-test\"),},\n\n// ── core/build.gradle.kts ────────────────────,dependencies {,    implementation(project(\":common\")),\n\n    // Core business logic dependencies,    implementation(\"org.springframework:spring-context:6.0.0\"),    testImplementation(\"org.mockito:mockito-core:5.2.0\"),},\n\n// ── common/build.gradle.kts ──────────────────,// Minimal dependencies, no Spring,dependencies {,    // Only utility/model classes,},\n\n// ── gradle.properties ────────────────────────,# Enable parallel builds,org.gradle.parallel=true,,# Enable build cache,org.gradle.caching=true,,# Faster startup,org.gradle.daemon=true"
                  }
        ],
        tips: [
                  "allprojects for config that applies to all (including root); subprojects to exclude root.",
                  "Keep common/ dependency-light (no Spring) — it is imported everywhere, so minimal deps = smaller builds.",
                  "Use project(\":core\") for internal deps — avoids publishing all modules to Maven Central.",
                  "Define versions in root build.gradle.kts or gradle.properties — prevents version mismatches across modules."
        ],
        mistake: "Duplicating version properties in each subproject — define once in root, reference everywhere.",
        shorthand: {
          verbose: "// settings.gradle.kts\nrootProject.name = \"my-app\"\ninclude(\"api\", \"core\", \"common\")\n\n// root build.gradle.kts\nallprojects {\n    repositories { mavenCentral() }\n}\nsubprojects {\n    apply(plugin = \"java\")\n}\n\n// api/build.gradle.kts\ndependencies {\n    implementation(project(\":core\"))\n    implementation(project(\":common\"))\n}",
          concise: "include(\"api\", \"core\")\n// Then in api/build.gradle.kts:\ndependencies {\n    implementation(project(\":core\"))\n}",
        },
      },
      {
        id: "spring-boot-build",
        fn: "Spring Boot Build — Maven Plugin and Fat JARs",
        desc: "Spring Boot build: spring-boot-maven-plugin, executable JARs, layered JARs for Docker, native image.",
        category: "Spring Boot",
        subtitle: "spring-boot-maven-plugin, bootJar, layers, main class, fat JAR",
        signature: "mvn spring-boot:run  |  ./mvnw package  |  java -jar app.jar",
        descLong: "Spring Boot plugin creates executable JARs containing an embedded servlet container (Tomcat). Fat JAR (uber-JAR) includes all dependencies. Layered JARs separate app classes, dependencies, resources for efficient Docker layering. Main class is auto-detected from @SpringBootApplication. spring-boot:run starts the app directly without packaging. Executable JARs are portable — just java -jar app.jar.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Spring Boot Build — Maven Plugin and Fat JARs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n<!-- ── pom.xml ────────────────────────────────── -->\n<parent>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-parent</artifactId>\n    <version>3.2.0</version>\n    <relativePath/>\n</parent>\n\n<dependencies>\n    <dependency>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter-web</artifactId>\n    </dependency>\n</dependencies>\n\n<!-- Spring Boot plugin (auto-included via parent) -->\n<build>\n    <plugins>\n        <plugin>\n            <groupId>org.springframework.boot</groupId>\n            <artifactId>spring-boot-maven-plugin</artifactId>\n            <configuration>\n                <!-- Main class auto-detected, can override -->\n                <mainClass>com.example.Application</mainClass>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Spring Boot Build — Maven Plugin and Fat JARs — common patterns you'll see in production.\n// APPROACH  - Combine Spring Boot Build — Maven Plugin and Fat JARs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n<!-- Layered JAR for efficient Docker caching -->\n                <layers>\n                    <enabled>true</enabled>\n                </layers>\n            </configuration>\n        </plugin>\n    </plugins>\n</build>\n\n<!-- Commands ───────────────────────────────────\nmvn spring-boot:run                     # Run directly, skip packaging\nmvn package                             # Build executable JAR\njava -jar target/app-1.0.0.jar         # Run JAR\njava -Dspring.profiles.active=prod -jar app.jar  # Run with profile\n-->\n\n<!-- ── Dockerfile for layered JAR ─────────────\nFROM eclipse-temurin:21-jdk as builder\nWORKDIR /builder\nCOPY target/app-1.0.0.jar app.jar\nRUN java -Djarmode=tools -jar app.jar extract --destination extracted"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Spring Boot Build — Maven Plugin and Fat JARs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nFROM eclipse-temurin:21-jre\nWORKDIR /app\nCOPY --from=builder /builder/extracted/dependencies/ ./\nCOPY --from=builder /builder/extracted/spring-boot-loader/ ./\nCOPY --from=builder /builder/extracted/snapshot-dependencies/ ./\nCOPY --from=builder /builder/extracted/application/ ./\nENTRYPOINT [\"java\", \"org.springframework.boot.loader.launch.JarLauncher\"]\n-->"
                  }
        ],
        tips: [
                  "Spring Boot parent POM includes spring-boot-maven-plugin — no explicit plugin needed in most cases.",
                  "mvn spring-boot:run is fast for development — skip packaging, start app directly.",
                  "Layered JARs (layers: enabled) optimize Docker image caching — dependencies are separate layer from app code.",
                  "Fat JAR is portable — single file, no classpath setup, runs anywhere with Java installed."
        ],
        mistake: "Not using layered JARs in Docker — every code change rebuilds entire dependency layer. Layers separate deps from app code.",
        shorthand: {
          verbose: "<plugin>\n  <groupId>org.springframework.boot</groupId>\n  <artifactId>spring-boot-maven-plugin</artifactId>\n  <configuration>\n    <mainClass>com.example.Application</mainClass>\n    <layers>\n      <enabled>true</enabled>\n    </layers>\n  </configuration>\n</plugin>",
          concise: "<!-- Included in spring-boot-starter-parent -->\n<!-- No explicit config needed for most apps -->\nmvn spring-boot:run        # Run directly\nmvn package                # Create executable JAR",
        },
      },
      {
        id: "native-image",
        fn: "GraalVM Native Image — Compiled Binaries",
        desc: "Compile Java to native binary: native-maven-plugin, reflection config, instant startup, small size.",
        category: "Advanced Build",
        subtitle: "native-image, GraalVM, reflection config, no JVM startup",
        signature: "mvn -Pnative native:compile  |  ./mvnw native:compile  |  gradle nativeCompile",
        descLong: "GraalVM native-image compiles Java bytecode to native binary (~10ms startup vs 2-5s JVM). Ideal for serverless (AWS Lambda, Cloud Run) and containers. Requires reflection config (JSON) for frameworks using reflection. Spring Boot 3+ provides native build support. Result: ~10ms startup, ~50MB RAM (vs ~2s, ~200MB). Trade-off: build time increases, no dynamic features.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of GraalVM Native Image — Compiled Binaries — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n<!-- ── pom.xml ────────────────────────────────\nAdd Spring Boot native profile (auto in 3.x):\n-->\n<profiles>\n    <profile>\n        <id>native</id>\n        <activation>\n            <activeByDefault>false</activeByDefault>\n        </activation>\n        <build>\n            <plugins>\n                <plugin>\n                    <groupId>org.graalvm.buildtools</groupId>\n                    <artifactId>native-maven-plugin</artifactId>\n                </plugin>\n            </plugins>\n        </build>\n    </profile>\n</profiles>\n\n<!-- Commands ──────────────────────────────────\n./mvnw -Pnative native:compile         # Build native image\n./target/app                           # Run binary directly\n./mvnw -Pnative native:run             # Build + run\n-->"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of GraalVM Native Image — Compiled Binaries — common patterns you'll see in production.\n// APPROACH  - Combine GraalVM Native Image — Compiled Binaries with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── build.gradle.kts ─────────────────────────\nplugins {\n    id(\"org.graalvm.buildtools.native\") version \"0.9.27\"\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of GraalVM Native Image — Compiled Binaries — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Commands:,// ./gradlew nativeCompile,// ./build/native/nativeCompile/app,\n\n// ── Reflection config (if needed) ─────────────,// src/main/resources/META-INF/native-image/reflection-config.json,{,  \"classes\": [,    {,      \"name\": \"com.example.User\",,      \"allPublicConstructors\": true,,      \"allPublicMethods\": true,,      \"allPublicFields\": true,    },  ],,  \"methods\": [,    {,      \"name\": \"com.example.User.<init>\",,      \"parameterTypes\": [\"java.lang.String\", \"java.lang.String\"],    },  ],},\n\n// ── Dockerfile for native image ─────────────,FROM ghcr.io/graalvm/native-image:22 AS build,WORKDIR /build,COPY . .,RUN ./mvnw -Pnative native:compile,,FROM gcr.io/distroless/base-debian12:nonroot,COPY --from=build /build/target/app /app,ENTRYPOINT [\"/app\"],// Result: ~5MB Docker image, 10ms startup,\n\n// ── Build options ────────────────────────────,// -H:+ReportExceptionStackTraces,// -H:+StaticSpringBoot,// -H:+AotMode,// See: https://spring.io/guides/gs/native-image/"
                  }
        ],
        tips: [
                  "Native image startup (~10ms) is ideal for serverless — pay per invocation becomes cheaper.",
                  "Spring Boot 3+ has built-in native build support — just mvn -Pnative native:compile.",
                  "Reflection config is required for dynamic features (annotation processing) — Spring Boot usually auto-generates.",
                  "Native images are platform-specific — build on target OS (Linux) if deploying to Linux containers."
        ],
        mistake: "Assuming all libraries work with native image — some require reflection config. Test early; Spring ecosystem is well-supported.",
        shorthand: {
          verbose: "./mvnw -Pnative native:compile\n# Result: target/app (executable binary)\n./target/app",
          concise: "mvn -Pnative native:compile\n./target/app  # Instant startup",
        },
      },
      {
        id: "jib-docker",
        fn: "Jib — Dockerfile-Free Container Images",
        desc: "Jib Maven/Gradle plugin: build Docker images without Dockerfile, efficient layering, registry push.",
        category: "Advanced Build",
        subtitle: "jib-maven-plugin, jib-gradle-plugin, docker build, efficient layers",
        signature: "mvn compile jib:build  |  gradle jibBuild  |  No Dockerfile needed",
        descLong: "Jib (Google) builds optimized Docker images without Dockerfile. Efficiently layers dependencies, resources, and app code. Supports pushing directly to Docker Hub/ECR/GCR. Faster builds than docker build. No Docker daemon required. Maven: mvn compile jib:build. Gradle: gradle jibBuild. Automatic base image selection (distroless). Great for CI/CD pipelines.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Jib — Dockerfile-Free Container Images — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n<!-- ── pom.xml ──────────────────────────────── -->\n<plugin>\n    <groupId>com.google.cloud.tools</groupId>\n    <artifactId>jib-maven-plugin</artifactId>\n    <version>3.3.2</version>\n    <configuration>\n        <!-- Base image (distroless by default) -->\n        <from>\n            <image>eclipse-temurin:21-jre-alpine</image>\n        </from>\n\n        <!-- Target image repository -->\n        <to>\n            <image>ghcr.io/myorg/my-app</image>\n            <tags>\n                <tag>latest</tag>\n                <tag>${project.version}</tag>\n            </tags>\n            <!-- Auth (use maven-settings.xml or env vars) -->\n            <auth>\n                <username>${env.DOCKER_USERNAME}</username>\n                <password>${env.DOCKER_PASSWORD}</password>\n            </auth>\n        </to>\n\n        <!-- Container configuration -->\n        <container>\n            <jvmFlags>\n                <jvmFlag>-XX:+UseG1GC</jvmFlag>\n                <jvmFlag>-Xmx512m</jvmFlag>\n            </jvmFlags>\n            <mainClass>com.example.Application</mainClass>\n            <ports>\n                <port>8080</port>\n            </ports>\n            <environment>\n                <LOG_LEVEL>INFO</LOG_LEVEL>\n            </environment>\n            <labels>\n                <version>${project.version}</version>\n                <repo>my-app</repo>\n            </labels>\n        </container>\n\n        <!-- Efficient layering (skip for Spring Boot fat JARs) -->\n        <containerizingMode>packaged</containerizingMode>\n    </configuration>\n</plugin>\n\n<!-- Commands ──────────────────────────────────\nmvn compile jib:build                           # Build + push to registry\nmvn compile jib:buildTar                        # Build tar archive (no push)\nmvn compile jib:dockerBuild                     # Build to local Docker daemon\n-->"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Jib — Dockerfile-Free Container Images — common patterns you'll see in production.\n// APPROACH  - Combine Jib — Dockerfile-Free Container Images with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── build.gradle.kts ─────────────────────────\nplugins {\n    id(\"com.google.cloud.tools.jib\") version \"3.3.2\"\n}\n\njib {\n    from {\n        image = \"eclipse-temurin:21-jre-alpine\"\n    }\n    to {\n        image = \"ghcr.io/myorg/my-app\"\n        tags = setOf(\"latest\", version.toString())\n        auth {\n            username = System.getenv(\"DOCKER_USERNAME\")\n            password = System.getenv(\"DOCKER_PASSWORD\")\n        }\n    }\n    container {\n        jvmFlags = listOf(\"-XX:+UseG1GC\", \"-Xmx512m\")\n        mainClass = \"com.example.Application\"\n        ports = listOf(\"8080\")\n        environment = mapOf(\"LOG_LEVEL\" to \"INFO\")\n        labels = mapOf(\n            \"version\" to version.toString(),\n            \"repo\" to \"my-app\"\n        )\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Jib — Dockerfile-Free Container Images — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Commands:,// gradle jibBuild                 # Build + push,// gradle jibBuildTar              # Build tar,// gradle jibDockerBuild           # Build to local Docker"
                  }
        ],
        tips: [
                  "Jib requires no Docker daemon — push directly to registry from CI/CD.",
                  "Efficient layering: dependencies, resources, app code are separate — cache dependencies across rebuilds.",
                  "Use distroless base images for smaller images (~20MB vs 200MB+ for full OS).",
                  "jibDockerBuild to local Docker for testing; jibBuild to push to registry in CI."
        ],
        mistake: "Using jib with Spring Boot fat JAR — Jib is designed for non-fat JARs with separate layers. For fat JARs, use docker build or Spring Boot layer extraction.",
        shorthand: {
          verbose: "<plugin>\n  <groupId>com.google.cloud.tools</groupId>\n  <artifactId>jib-maven-plugin</artifactId>\n  <configuration>\n    <to>\n      <image>gcr.io/my-project/my-app</image>\n    </to>\n  </configuration>\n</plugin>\n<!-- mvn compile jib:build -->",
          concise: "mvn compile jib:build\n# Image pushed to Docker Hub automatically",
        },
      },
      {
        id: "toolchains",
        fn: "Java Toolchains — Multi-JDK Support",
        desc: "Gradle toolchain support: compile with Java 21, test with Java 17, support different JDK versions.",
        category: "Advanced Build",
        subtitle: "java.toolchain, JavaLanguageVersion, JVM compatibility",
        signature: "java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }",
        descLong: "Toolchains allow projects to specify which JDK version to use for compilation and tests, separate from the JDK running Gradle. Gradle finds matching JDK or downloads from AdoptOpenJDK/Eclipse Temurin. Useful for CI/CD (run tests on multiple Java versions). Compile with Java 21, test with Java 17 in same build. Prevents \"wrong JDK\" errors across team.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Java Toolchains — Multi-JDK Support — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── build.gradle.kts ─────────────────────────\njava {\n    toolchain {\n        // Compile with Java 21\n        languageVersion = JavaLanguageVersion.of(21)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Java Toolchains — Multi-JDK Support — common patterns you'll see in production.\n// APPROACH  - Combine Java Toolchains — Multi-JDK Support with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Optional: vendor\n        vendor = JvmVendorSpec.ECLIPSE\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Java Toolchains — Multi-JDK Support — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Test with different JDK ─────────────────,// (Advanced),val java17Toolchain = javaToolchains.compilerFor {,    languageVersion = JavaLanguageVersion.of(17),},,tasks.register<Test>(\"testWithJava17\") {,    javaLauncher = javaToolchains.launcherFor {,        languageVersion = JavaLanguageVersion.of(17),    },},\n\n// ── Multi-version test ──────────────────────,tasks.create(\"testAllVersions\") {,    dependsOn(\"test\", \"testWithJava17\"),},\n\n// ── gradle.properties ────────────────────────,# Instruct Gradle where to find JDKs,org.gradle.java.installations.paths=/usr/lib/jvm/java-21,/usr/lib/jvm/java-17,\n\n// ── Command ──────────────────────────────────,// gradle build                    # Build with Java 21 toolchain,// gradle testAllVersions          # Test on Java 21 and 17"
                  }
        ],
        tips: [
                  "Toolchains ensure consistent JDK across team — no \"works on my machine\" JDK mismatches.",
                  "CI/CD can test on multiple Java versions — add different test tasks for Java 17, 21, 23.",
                  "Gradle downloads missing JDKs from AdoptOpenJDK — requires network access.",
                  "Useful for library projects supporting multiple Java versions — test on 17, 21, LTS versions."
        ],
        mistake: "Assuming everyone has the same JDK version — toolchains enforce consistency, preventing subtle version-related bugs.",
        shorthand: {
          verbose: "java {\n    toolchain {\n        languageVersion = JavaLanguageVersion.of(21)\n    }\n}",
          concise: "// Gradle automatically finds matching JDK\n// If not found, download from AdoptOpenJDK",
        },
      },
    ],
  },
]

export default { meta, sections }
