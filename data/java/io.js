export const meta = {
  "id": "java-io",
  "label": "IO, NIO & Networking",
  "icon": "☕",
  "description": "File I/O with NIO.2, readers/writers, serialization, HTTP client, and properties."
}

export const sections = [

  // ── Section 1: IO & NIO.2 ─────────────────────────────────────────
  {
    id: "io-nio",
    title: "IO & NIO.2",
    entries: [
      {
        id: "path-files-nio2",
        fn: "Path & Files (NIO.2)",
        desc: "Modern file system API — read, write, copy, move, and walk directory trees with java.nio.file.",
        category: "IO",
        subtitle: "java.nio.file.Path and Files utility class",
        signature: "Path.of(\"dir\", \"file.txt\")  |  Files.readString(path)  |  Files.walk(dir)",
        descLong: "NIO.2 (Java 7+) replaces the legacy java.io.File API. Path represents a file system path. Files provides static methods for all file operations. Key advantages: better error messages, atomic operations, directory watching, and symbolic link support. Always prefer NIO.2 over java.io.File for new code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Path & Files (NIO.2) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.nio.file.*;\nimport java.nio.charset.StandardCharsets;\nimport java.io.IOException;\nimport java.util.List;\nimport java.util.stream.Stream;\n\npublic class NioExamples {\n    public static void main(String[] args) throws IOException {\n        // Creating paths\n        Path file = Path.of(\"data\", \"users.txt\");     // relative\n        Path abs = Path.of(\"/home/app/config.yml\");    // absolute\n        Path resolved = Path.of(\"project\").resolve(\"src\").resolve(\"Main.java\");"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Path & Files (NIO.2) — common patterns you'll see in production.\n// APPROACH  - Combine Path & Files (NIO.2) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Reading files (Java 11+)\n        String content = Files.readString(file);                       // entire file as string\n        List<String> lines = Files.readAllLines(file);                 // all lines as list\n        byte[] bytes = Files.readAllBytes(file);                       // raw bytes"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Path & Files (NIO.2) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Writing files,        Files.writeString(Path.of(\"output.txt\"), \"Hello\\nWorld\");,        Files.write(Path.of(\"lines.txt\"), List.of(\"line1\", \"line2\"));,        Files.write(Path.of(\"append.txt\"), \"more\\n\".getBytes(),,            StandardOpenOption.APPEND, StandardOpenOption.CREATE);,\n\n        // Copy, move, delete,        Files.copy(file, Path.of(\"backup.txt\"), StandardCopyOption.REPLACE_EXISTING);,        Files.move(Path.of(\"old.txt\"), Path.of(\"new.txt\"), StandardCopyOption.ATOMIC_MOVE);,        Files.deleteIfExists(Path.of(\"temp.txt\"));,\n\n        // File info,        System.out.println(\"Exists: \" + Files.exists(file));,        System.out.println(\"Size: \" + Files.size(file));,        System.out.println(\"Modified: \" + Files.getLastModifiedTime(file));,        System.out.println(\"Is directory: \" + Files.isDirectory(file));,\n\n        // Walk directory tree,        try (Stream<Path> paths = Files.walk(Path.of(\"src\"), 3)) {,            paths.filter(Files::isRegularFile),                 .filter(p -> p.toString().endsWith(\".java\")),                 .forEach(System.out::println);,        },\n\n        // List directory contents,        try (Stream<Path> entries = Files.list(Path.of(\".\"))) {,            entries.filter(Files::isDirectory).forEach(System.out::println);,        },\n\n        // Create directories,        Files.createDirectories(Path.of(\"output\", \"reports\", \"2024\"));,\n\n        // Temporary files,        Path temp = Files.createTempFile(\"prefix-\", \".tmp\");,        Files.writeString(temp, \"temporary data\");,    },}"
                  }
        ],
        tips: [
                  "Files.readString() and Files.writeString() (Java 11+) are the simplest way to read/write text files.",
                  "Always use try-with-resources for Files.walk() and Files.list() — they open directory streams that must be closed.",
                  "Path.of() (Java 11+) is preferred over Paths.get() — same functionality, cleaner API.",
                  "Use StandardCopyOption.ATOMIC_MOVE for safe file updates — write to temp, then atomic rename."
        ],
        mistake: "Using java.io.File in new code — NIO.2 (Path/Files) has better errors, atomic operations, and stream support. File.toPath() bridges legacy code.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFile file = new File(\"path/to/file.txt\");\nString content = new String(Files.readAllBytes(file.toPath()));\n// More explicit but longer",
          concise: "String content = Files.readString(Path.of(\"path/to/file.txt\"));",
        },
      },
      {
        id: "buffered-readers-writers",
        fn: "BufferedReader & BufferedWriter",
        desc: "Efficiently read and write text files line-by-line with buffered character streams.",
        category: "IO",
        subtitle: "Line-by-line processing for large files",
        signature: "Files.newBufferedReader(path)  |  reader.readLine()  |  reader.lines()",
        descLong: "BufferedReader wraps a Reader with a buffer for efficient line-by-line reading. For large files that don't fit in memory, use BufferedReader instead of Files.readAllLines(). The lines() method returns a Stream<String> for functional processing. BufferedWriter provides efficient writing with newLine() support.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of BufferedReader & BufferedWriter — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.io.*;\nimport java.nio.file.*;\nimport java.util.stream.Stream;\n\npublic class BufferedIOExamples {\n    public static void main(String[] args) throws IOException {\n        Path input = Path.of(\"data\", \"large-log.txt\");\n        Path output = Path.of(\"data\", \"filtered.txt\");"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of BufferedReader & BufferedWriter — common patterns you'll see in production.\n// APPROACH  - Combine BufferedReader & BufferedWriter with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Read line-by-line (try-with-resources auto-closes)\n        try (BufferedReader reader = Files.newBufferedReader(input)) {\n            String line;\n            while ((line = reader.readLine()) != null) {\n                if (line.contains(\"ERROR\")) {\n                    System.out.println(line);\n                }\n            }\n        }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of BufferedReader & BufferedWriter — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Stream-based processing (lazy — memory efficient),        try (Stream<String> lines = Files.lines(input)) {,            long errorCount = lines,                .filter(line -> line.contains(\"ERROR\")),                .peek(System.out::println),                .count();,            System.out.println(\"Total errors: \" + errorCount);,        },\n\n        // Write with BufferedWriter,        try (BufferedWriter writer = Files.newBufferedWriter(output)) {,            writer.write(\"Header line\");,            writer.newLine();,            for (int i = 0; i < 1000; i++) {,                writer.write(\"Line \" + i);,                writer.newLine();,            },        }  // auto-flushed and closed,\n\n        // Copy and transform,        try (BufferedReader reader = Files.newBufferedReader(input);,             BufferedWriter writer = Files.newBufferedWriter(output)) {,,            reader.lines(),                .map(String::toUpperCase),                .forEach(line -> {,                    try {,                        writer.write(line);,                        writer.newLine();,                    } catch (IOException e) {,                        throw new UncheckedIOException(e);,                    },                });,        },    },}"
                  }
        ],
        tips: [
                  "Files.lines() returns a lazy Stream — processes one line at a time, can handle gigabyte files.",
                  "Always use try-with-resources for readers/writers — forgetting to close leaks file descriptors.",
                  "BufferedWriter auto-flushes on close — no need to call flush() explicitly in try-with-resources.",
                  "Use UncheckedIOException to wrap IOException inside lambdas where checked exceptions aren't allowed."
        ],
        mistake: "Using Files.readAllLines() on a 10GB log file — it loads everything into memory. Use Files.lines() or BufferedReader for streaming large files.",
        shorthand: {
          verbose: "FileReader fr = new FileReader(\"file.txt\");\nBufferedReader br = new BufferedReader(fr);\nString line;\nwhile ((line = br.readLine()) != null) { }",
          concise: "try (var reader = Files.newBufferedReader(Path.of(\"file.txt\"))) {\n  reader.lines().forEach(System.out::println);\n}",
        },
      },
      {
        id: "serialization",
        fn: "Serialization & JSON",
        desc: "Convert objects to bytes (Serializable) or JSON (Jackson/Gson) for storage and transmission.",
        category: "IO",
        subtitle: "Object persistence with Java serialization and JSON libraries",
        signature: "implements Serializable  |  ObjectMapper.writeValueAsString(obj)",
        descLong: "Java serialization (Serializable + ObjectOutputStream) converts objects to byte streams. However, it has security issues, versioning problems, and poor interoperability. Modern Java projects use JSON serialization (Jackson or Gson) instead. Jackson is the de-facto standard — fast, feature-rich, and widely used in Spring Boot.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Serialization & JSON — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Jackson (recommended) ──────────────────────────────\nimport com.fasterxml.jackson.databind.ObjectMapper;\nimport com.fasterxml.jackson.databind.SerializationFeature;\nimport com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;\n\npublic class JacksonExample {\n    record User(String name, int age, String email) {}\n\n    public static void main(String[] args) throws Exception {\n        ObjectMapper mapper = new ObjectMapper()\n            .registerModule(new JavaTimeModule())\n            .enable(SerializationFeature.INDENT_OUTPUT);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Serialization & JSON — common patterns you'll see in production.\n// APPROACH  - Combine Serialization & JSON with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Object → JSON string\n        User user = new User(\"Alice\", 30, \"alice@example.com\");\n        String json = mapper.writeValueAsString(user);\n        // {\"name\":\"Alice\",\"age\":30,\"email\":\"alice@example.com\"}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Serialization & JSON — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// JSON string → Object,        User parsed = mapper.readValue(json, User.class);,        System.out.println(parsed.name());  // \"Alice\",\n\n        // Object → JSON file,        mapper.writeValue(new File(\"user.json\"), user);,\n\n        // JSON file → Object,        User fromFile = mapper.readValue(new File(\"user.json\"), User.class);,\n\n        // List of objects,        List<User> users = List.of(,            new User(\"Alice\", 30, \"a@b.com\"),,            new User(\"Bob\", 25, \"b@c.com\"),        );,        String jsonArray = mapper.writeValueAsString(users);,\n\n        // JSON array → List,        List<User> parsed2 = mapper.readValue(jsonArray,,            mapper.getTypeFactory().constructCollectionType(List.class, User.class));,\n\n        // Map,        Map<String, Object> map = mapper.readValue(json, Map.class);,    },},\n\n// ── Java Serialization (legacy — avoid for new code) ──,import java.io.*;,,public class SerializationExample implements Serializable {,    private static final long serialVersionUID = 1L;,    private String name;,    private transient String password;  // excluded from serialization,\n\n    // Serialize,    // ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(\"data.ser\"));,    // oos.writeObject(obj);,\n\n    // Deserialize,    // ObjectInputStream ois = new ObjectInputStream(new FileInputStream(\"data.ser\"));,    // MyClass obj = (MyClass) ois.readObject();,}"
                  }
        ],
        tips: [
                  "Jackson + records (Java 14+) = zero-boilerplate JSON serialization — no getters/setters needed.",
                  "Register JavaTimeModule for LocalDate/LocalDateTime support — Jackson doesn't handle java.time by default.",
                  "Use @JsonIgnore, @JsonProperty, @JsonFormat annotations to customize serialization behavior.",
                  "Avoid Java Serialization (ObjectOutputStream) — it has security vulnerabilities and breaks with class changes."
        ],
        mistake: "Using Java's built-in Serializable for APIs or storage — it's fragile (class changes break deserialization), has security issues (deserialization attacks), and is Java-only. Use JSON (Jackson) instead.",
        shorthand: {
          verbose: "ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(\"file.ser\"));\noos.writeObject(obj);\noos.close();",
          concise: "ObjectOutputStream oos = new ObjectOutputStream(Files.newOutputStream(path));\noos.writeObject(obj); // auto-closed",
        },
      },
      {
        id: "http-client",
        fn: "HTTP Client (Java 11+)",
        desc: "Built-in HTTP client for making GET, POST, and async requests — no external libraries needed.",
        category: "Networking",
        subtitle: "java.net.http.HttpClient — modern, async-capable HTTP",
        signature: "HttpClient.newHttpClient().send(request, BodyHandlers.ofString())",
        descLong: "Java 11+ includes a modern HTTP client that supports HTTP/1.1, HTTP/2, WebSocket, sync and async requests, and redirects. It replaces the old HttpURLConnection and removes the need for Apache HttpClient or OkHttp for basic use cases. Builder pattern for configuration, immutable request objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of HTTP Client (Java 11+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.net.URI;\nimport java.net.http.*;\nimport java.net.http.HttpResponse.BodyHandlers;\nimport java.time.Duration;\nimport java.util.concurrent.CompletableFuture;\n\npublic class HttpClientExample {\n    public static void main(String[] args) throws Exception {\n        // Create client (reusable, thread-safe)\n        HttpClient client = HttpClient.newBuilder()\n            .version(HttpClient.Version.HTTP_2)\n            .connectTimeout(Duration.ofSeconds(10))\n            .followRedirects(HttpClient.Redirect.NORMAL)\n            .build();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of HTTP Client (Java 11+) — common patterns you'll see in production.\n// APPROACH  - Combine HTTP Client (Java 11+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// GET request\n        HttpRequest getReq = HttpRequest.newBuilder()\n            .uri(URI.create(\"https://api.example.com/users\"))\n            .header(\"Accept\", \"application/json\")\n            .header(\"Authorization\", \"Bearer \" + System.getenv(\"API_TOKEN\"))\n            .timeout(Duration.ofSeconds(30))\n            .GET()\n            .build();\n\n        HttpResponse<String> response = client.send(getReq, BodyHandlers.ofString());\n        System.out.println(\"Status: \" + response.statusCode());\n        System.out.println(\"Body: \" + response.body());\n        System.out.println(\"Headers: \" + response.headers().map());"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of HTTP Client (Java 11+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// POST with JSON body,        String jsonBody = \"{\\\"name\\\":\\\"Alice\\\",\\\"email\\\":\\\"alice@example.com\\\"}\";,        HttpRequest postReq = HttpRequest.newBuilder(),            .uri(URI.create(\"https://api.example.com/users\")),            .header(\"Content-Type\", \"application/json\"),            .POST(HttpRequest.BodyPublishers.ofString(jsonBody)),            .build();,,        HttpResponse<String> postResp = client.send(postReq, BodyHandlers.ofString());,\n\n        // Async request,        CompletableFuture<HttpResponse<String>> future =,            client.sendAsync(getReq, BodyHandlers.ofString());,,        future.thenApply(HttpResponse::body),              .thenAccept(body -> System.out.println(\"Async result: \" + body)),              .join();  // wait for completion,\n\n        // Multiple async requests in parallel,        var uris = List.of(,            \"https://api.example.com/users/1\",,            \"https://api.example.com/users/2\",,            \"https://api.example.com/users/3\",        );,,        List<CompletableFuture<String>> futures = uris.stream(),            .map(uri -> HttpRequest.newBuilder(URI.create(uri)).build()),            .map(req -> client.sendAsync(req, BodyHandlers.ofString()),                .thenApply(HttpResponse::body)),            .toList();,,        CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new)).join();,        futures.forEach(f -> System.out.println(f.join()));,    },}"
                  }
        ],
        tips: [
                  "HttpClient is thread-safe and should be reused — create one instance and share it.",
                  "Use sendAsync() with CompletableFuture for non-blocking requests and parallel API calls.",
                  "Combine with Jackson: parse response.body() with ObjectMapper.readValue() for typed deserialization.",
                  "BodyHandlers.ofFile(path) writes response directly to disk — efficient for downloads."
        ],
        mistake: "Creating a new HttpClient per request — it manages connection pools internally. Reuse a single instance for the lifetime of your application.",
        shorthand: {
          verbose: "HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();\nconn.setRequestMethod(\"GET\");\nInputStream is = conn.getInputStream();",
          concise: "HttpResponse<String> response = HttpClient.newHttpClient()\n  .send(HttpRequest.newBuilder(URI.create(url)).build(), BodyHandlers.ofString());",
        },
      },
      {
        id: "properties-config",
        fn: "Properties & Configuration",
        desc: "Load application configuration from properties files, environment variables, and system properties.",
        category: "IO",
        subtitle: "Properties files, resource bundles, and externalized config",
        signature: "props.load(stream)  |  props.getProperty(key, default)  |  System.getenv()",
        descLong: "Java Properties reads key=value configuration files. Best practice: store config in src/main/resources, load via classpath, use defaults for all values. Modern frameworks (Spring Boot) handle this automatically, but understanding Properties is essential for library code and simple applications.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Properties & Configuration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.Properties;\nimport java.io.*;\nimport java.nio.file.Files;\nimport java.nio.file.Path;\n\npublic class ConfigExample {\n    public static void main(String[] args) throws IOException {\n        // ── Load from classpath (src/main/resources/app.properties) ──\n        Properties props = new Properties();\n        try (InputStream is = ConfigExample.class\n                .getClassLoader()\n                .getResourceAsStream(\"app.properties\")) {\n            if (is == null) throw new FileNotFoundException(\"app.properties not found\");\n            props.load(is);\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Properties & Configuration — common patterns you'll see in production.\n// APPROACH  - Combine Properties & Configuration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Read with defaults\n        String dbHost = props.getProperty(\"db.host\", \"localhost\");\n        int dbPort = Integer.parseInt(props.getProperty(\"db.port\", \"5432\"));\n        String dbName = props.getProperty(\"db.name\", \"myapp\");\n        boolean debug = Boolean.parseBoolean(props.getProperty(\"debug\", \"false\"));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Properties & Configuration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Environment variables (12-factor app style) ──────────────,        String apiKey = System.getenv(\"API_KEY\");,        String dbUrl = System.getenv().getOrDefault(\"DATABASE_URL\",,            \"jdbc:postgresql://localhost:5432/myapp\");,\n\n        // ── System properties (-Dproperty=value on JVM startup) ─────,        String logLevel = System.getProperty(\"log.level\", \"INFO\");,        String appMode = System.getProperty(\"app.mode\", \"production\");,\n\n        // ── Priority: env vars > system props > properties file ─────,        String host = System.getenv(\"DB_HOST\");,        if (host == null) host = System.getProperty(\"db.host\");,        if (host == null) host = props.getProperty(\"db.host\", \"localhost\");,\n\n        // ── Write properties ────────────────────────────────────────,        Properties output = new Properties();,        output.setProperty(\"generated.at\", java.time.Instant.now().toString());,        output.setProperty(\"version\", \"1.0.0\");,,        try (OutputStream os = Files.newOutputStream(Path.of(\"build-info.properties\"))) {,            output.store(os, \"Auto-generated build info\");,        },    },}"
                  }
        ],
        tips: [
                  "Load from classpath with getResourceAsStream() — works in JARs, unlike file paths.",
                  "Always provide defaults: getProperty(key, default) prevents NPE from missing config.",
                  "Environment variables for secrets (API keys, passwords) — never commit them to properties files.",
                  "12-factor apps: env vars override properties files — check env first, then file, then default."
        ],
        mistake: "Hardcoding file paths like \"/home/user/app.properties\" — breaks in JARs and on other machines. Load from classpath with getResourceAsStream() instead.",
        shorthand: {
          verbose: "Properties props = new Properties();\nInputStream is = new FileInputStream(\"app.properties\");\nprops.load(is);\nString value = props.getProperty(\"key\");",
          concise: "Properties props = new Properties();\nprops.load(Files.newInputStream(Path.of(\"app.properties\")));\nString value = props.getProperty(\"key\");",
        },
      },
      {
        id: "collections-utilities",
        fn: "Collections Utility Methods",
        desc: "Powerful static methods for sorting, searching, synchronizing, and creating unmodifiable collections.",
        category: "Collections",
        subtitle: "Collections.sort, unmodifiable, synchronized, List.of, Map.of",
        signature: "Collections.sort(list)  |  List.of(a, b)  |  Collections.unmodifiableList(list)",
        descLong: "The Collections class provides static utility methods for collection operations. Java 9+ added factory methods (List.of, Map.of, Set.of) for creating immutable collections. Key operations: sorting, searching (binarySearch), shuffling, frequency counting, finding min/max, and creating synchronized or unmodifiable wrappers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Collections Utility Methods — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;\n\npublic class CollectionsUtils {\n    public static void main(String[] args) {\n        // ── Immutable collections (Java 9+) ──────────────────────\n        List<String> names = List.of(\"Alice\", \"Bob\", \"Charlie\");  // immutable\n        Set<Integer> ids = Set.of(1, 2, 3);                       // immutable\n        Map<String, Integer> scores = Map.of(                      // immutable\n            \"Alice\", 95,\n            \"Bob\", 87,\n            \"Charlie\", 92\n        );\n        // names.add(\"Dave\");  // throws UnsupportedOperationException"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Collections Utility Methods — common patterns you'll see in production.\n// APPROACH  - Combine Collections Utility Methods with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// More than 10 entries:\n        Map<String, Integer> big = Map.ofEntries(\n            Map.entry(\"a\", 1),\n            Map.entry(\"b\", 2)\n        );"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Collections Utility Methods — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Sorting ──────────────────────────────────────────────,        List<String> mutable = new ArrayList<>(names);,        Collections.sort(mutable);                           // natural order,        Collections.sort(mutable, Comparator.reverseOrder()); // reverse,        Collections.reverse(mutable);                        // reverse in-place,        Collections.shuffle(mutable);                        // random order,\n\n        // ── Searching ────────────────────────────────────────────,        Collections.sort(mutable);  // must be sorted first!,        int idx = Collections.binarySearch(mutable, \"Bob\");  // O(log n),\n\n        // ── Statistics ───────────────────────────────────────────,        String min = Collections.min(mutable);,        String max = Collections.max(mutable);,        int freq = Collections.frequency(mutable, \"Alice\");,\n\n        // ── Unmodifiable wrappers ────────────────────────────────,        List<String> readOnly = Collections.unmodifiableList(mutable);,        // readOnly.add(\"x\");  // throws UnsupportedOperationException,        // Note: List.copyOf() (Java 10+) creates a true immutable copy,\n\n        // ── Synchronized wrappers ────────────────────────────────,        List<String> syncList = Collections.synchronizedList(new ArrayList<>());,        // Thread-safe for individual operations, but iteration needs manual sync:,        synchronized (syncList) {,            for (String s : syncList) { /* ... */ },        },\n\n        // ── Singleton, empty, nCopies ────────────────────────────,        List<String> single = Collections.singletonList(\"only\");  // immutable, 1 element,        List<String> empty = Collections.emptyList();              // immutable, 0 elements,        List<String> filler = Collections.nCopies(10, \"default\"); // 10 × \"default\",    },}"
                  }
        ],
        tips: [
                  "List.of(), Set.of(), Map.of() (Java 9+) are the cleanest way to create small immutable collections.",
                  "Collections.unmodifiableList() wraps the original — changes to the original still visible. Use List.copyOf() for a true snapshot.",
                  "binarySearch() requires a sorted list — results are undefined on unsorted data.",
                  "ConcurrentHashMap is almost always better than Collections.synchronizedMap() — finer-grained locking."
        ],
        mistake: "Using Collections.synchronizedList() and iterating without the synchronized block — individual operations are thread-safe but iteration is NOT. Either synchronize manually or use CopyOnWriteArrayList.",
        shorthand: {
          verbose: "List<String> mutable = new ArrayList<>();\nmutable.add(\"a\"); mutable.add(\"b\");\nCollections.sort(mutable);\nList<String> readOnly = Collections.unmodifiableList(mutable);",
          concise: "List<String> immutable = List.of(\"a\", \"b\");\n// Immutable, no modification possible",
        },
      },
    ],
  },
]

export default { meta, sections }
