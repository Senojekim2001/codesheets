export const meta = {
  "id": "java-spring",
  "label": "Spring Boot & Modern Java",
  "icon": "☕",
  "description": "Spring Boot REST APIs, dependency injection, JPA/JDBC, records, sealed classes, and pattern matching."
}

export const sections = [

  // ── Section 1: Modern Java Features ─────────────────────────────────────────
  {
    id: "modern-java",
    title: "Modern Java Features",
    entries: [
      {
        id: "records",
        fn: "Records — Immutable Data Classes",
        desc: "Concise immutable data carriers — auto-generates constructor, getters, equals, hashCode, and toString.",
        category: "Modern Java",
        subtitle: "record Point(int x, int y) — compact data classes",
        signature: "record Name(Type field1, Type field2) { }",
        descLong: "Records (Java 14+) are immutable data classes. The compiler generates: canonical constructor, accessor methods (named after fields, not getX), equals/hashCode (based on all fields), and toString. Records can have compact constructors for validation, static methods, and implement interfaces. They cannot extend classes (implicitly extend Record) but can implement interfaces.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Records — Immutable Data Classes — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Basic record\nrecord Point(int x, int y) { }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Records — Immutable Data Classes — common patterns you'll see in production.\n// APPROACH  - Combine Records — Immutable Data Classes with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Usage — no \"new\" boilerplate needed\nvar p = new Point(3, 4);\nSystem.out.println(p.x());      // 3 (accessor, not getX)\nSystem.out.println(p.y());      // 4\nSystem.out.println(p);          // Point[x=3, y=4]\nSystem.out.println(p.equals(new Point(3, 4)));  // true"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Records — Immutable Data Classes — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Compact constructor for validation,record Email(String value) {,    Email {  // compact constructor — no parameter list,        if (value == null || !value.contains(\"@\")) {,            throw new IllegalArgumentException(\"Invalid email: \" + value);,        },        value = value.toLowerCase().strip();  // normalize,    },},\n\n// Record with methods and interfaces,record Range(int start, int end) implements Comparable<Range> {,    Range {,        if (start > end) throw new IllegalArgumentException(\"start > end\");,    },,    int length() { return end - start; },    boolean contains(int value) { return value >= start && value <= end; },,    @Override,    public int compareTo(Range other) {,        return Integer.compare(this.length(), other.length());,    },},\n\n// Records as DTOs (Data Transfer Objects),record CreateUserRequest(String name, String email, int age) { },record UserResponse(long id, String name, String email) {,    static UserResponse from(User user) {,        return new UserResponse(user.getId(), user.getName(), user.getEmail());,    },},\n\n// Records in collections,var points = List.of(new Point(1, 2), new Point(3, 4));,var sorted = points.stream(),    .sorted(Comparator.comparingInt(Point::x)),    .toList();,\n\n// Destructuring with pattern matching (Java 21+),if (p instanceof Point(int x, int y)) {,    System.out.println(\"x=\" + x + \", y=\" + y);,}"
                  }
        ],
        tips: [
                  "Record accessors use field names (p.x()) not JavaBean style (p.getX()) — this is intentional.",
                  "Records are ideal for DTOs, value objects, and method return types with multiple values.",
                  "Compact constructors validate and normalize — assignment to fields happens automatically after.",
                  "Records work with pattern matching (Java 21): if (obj instanceof Point(int x, int y)) { ... }."
        ],
        mistake: "Making records mutable by adding setters — records are designed to be immutable. If you need mutability, use a regular class. Records guarantee that equals/hashCode are stable.",
        shorthand: {
          verbose: "class Person {\n  private String name;\n  private int age;\n  public Person(String name, int age) { this.name = name; this.age = age; }\n  public String getName() { return name; }\n}",
          concise: "record Person(String name, int age) { }",
        },
      },
      {
        id: "sealed-pattern",
        fn: "Sealed Classes & Pattern Matching",
        desc: "Restrict class hierarchies with sealed, then exhaustively match variants with switch expressions.",
        category: "Modern Java",
        subtitle: "sealed, permits, switch expressions, pattern matching",
        signature: "sealed interface Shape permits Circle, Rectangle { }  |  switch (shape) { case Circle c -> ... }",
        descLong: "Sealed classes (Java 17) restrict which classes can extend them — creating closed type hierarchies (like Rust enums or Kotlin sealed classes). Combined with pattern matching switch (Java 21), the compiler verifies exhaustiveness — you handle every possible case. This enables type-safe algebraic data types in Java.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sealed Classes & Pattern Matching — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Sealed interface — only these implementations exist\nsealed interface Shape permits Circle, Rectangle, Triangle {\n    double area();\n}\n\nrecord Circle(double radius) implements Shape {\n    public double area() { return Math.PI * radius * radius; }\n}\n\nrecord Rectangle(double width, double height) implements Shape {\n    public double area() { return width * height; }\n}\n\nrecord Triangle(double base, double height) implements Shape {\n    public double area() { return 0.5 * base * height; }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sealed Classes & Pattern Matching — common patterns you'll see in production.\n// APPROACH  - Combine Sealed Classes & Pattern Matching with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Exhaustive pattern matching switch (Java 21)\nString describe(Shape shape) {\n    return switch (shape) {\n        case Circle c    -> \"Circle with radius \" + c.radius();\n        case Rectangle r -> \"Rectangle \" + r.width() + \"x\" + r.height();\n        case Triangle t  -> \"Triangle with base \" + t.base();\n        // No default needed — compiler knows all cases are covered!\n    };\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sealed Classes & Pattern Matching — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Guards in patterns,String classify(Shape shape) {,    return switch (shape) {,        case Circle c when c.radius() > 10 -> \"Large circle\";,        case Circle c                       -> \"Small circle\";,        case Rectangle r when r.width() == r.height() -> \"Square\";,        case Rectangle r                    -> \"Rectangle\";,        case Triangle t                     -> \"Triangle\";,    };,},\n\n// Sealed + records = algebraic data types,sealed interface Result<T> permits Success, Failure {,    static <T> Result<T> of(T value) { return new Success<>(value); },    static <T> Result<T> error(String msg) { return new Failure<>(msg); },},record Success<T>(T value) implements Result<T> { },record Failure<T>(String message) implements Result<T> { },\n\n// Use like Rust's Result,Result<User> result = findUser(id);,String output = switch (result) {,    case Success<User> s -> \"Found: \" + s.value().getName();,    case Failure<User> f -> \"Error: \" + f.message();,};"
                  }
        ],
        tips: [
                  "sealed + records + pattern matching = algebraic data types in Java — model domain precisely.",
                  "The compiler enforces exhaustiveness — adding a new Shape subclass forces updating all switches.",
                  "Use when guards for conditional matching within a case — keeps pattern matching expressive.",
                  "sealed permits only direct subtypes — each subtype must be final, sealed, or non-sealed."
        ],
        mistake: "Adding a default case to a sealed switch — it compiles but defeats exhaustiveness checking. If you add a new variant later, the compiler won't warn you about missing cases.",
        shorthand: {
          verbose: "// Manual / verbose approach\nif (shape instanceof Circle) { Circle c = (Circle) shape; } else if (shape instanceof Square) { Square s = (Square) shape; }\n// More explicit but longer",
          concise: "switch (shape) { case Circle c -> System.out.println(c.radius()); case Square s -> System.out.println(s.side()); }",
        },
      },
    ],
  },

  // ── Section 2: Spring Boot ─────────────────────────────────────────
  {
    id: "spring-boot",
    title: "Spring Boot",
    entries: [
      {
        id: "rest-controllers",
        fn: "REST Controllers & Request Handling",
        desc: "Build REST APIs with Spring Boot — controllers, path variables, request bodies, validation, and error handling.",
        category: "Spring Boot",
        subtitle: "@RestController, @GetMapping, @RequestBody, validation",
        signature: "@RestController @RequestMapping(\"/api/users\")  |  @GetMapping(\"/{id}\")",
        descLong: "Spring Boot REST controllers map HTTP requests to Java methods. @RestController combines @Controller + @ResponseBody. @GetMapping, @PostMapping, etc. map HTTP methods. @PathVariable extracts URL parameters, @RequestBody deserializes JSON. @Valid triggers Bean Validation. ResponseEntity controls status codes and headers. Exception handlers centralize error responses.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of REST Controllers & Request Handling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n@RestController\n@RequestMapping(\"/api/users\")\npublic class UserController {\n\n    private final UserService userService;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of REST Controllers & Request Handling — common patterns you'll see in production.\n// APPROACH  - Combine REST Controllers & Request Handling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Constructor injection (preferred, no @Autowired needed)\n    public UserController(UserService userService) {\n        this.userService = userService;\n    }\n\n    @GetMapping\n    public List<UserResponse> listUsers(\n            @RequestParam(defaultValue = \"0\") int page,\n            @RequestParam(defaultValue = \"20\") int size) {\n        return userService.findAll(page, size);\n    }\n\n    @GetMapping(\"/{id}\")\n    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {\n        return userService.findById(id)\n            .map(ResponseEntity::ok)\n            .orElse(ResponseEntity.notFound().build());\n    }\n\n    @PostMapping\n    @ResponseStatus(HttpStatus.CREATED)\n    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {\n        return userService.create(request);\n    }\n\n    @PutMapping(\"/{id}\")\n    public UserResponse updateUser(\n            @PathVariable Long id,\n            @Valid @RequestBody UpdateUserRequest request) {\n        return userService.update(id, request);\n    }\n\n    @DeleteMapping(\"/{id}\")\n    @ResponseStatus(HttpStatus.NO_CONTENT)\n    public void deleteUser(@PathVariable Long id) {\n        userService.delete(id);\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of REST Controllers & Request Handling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Validation with Bean Validation,record CreateUserRequest(,    @NotBlank @Size(max = 100) String name,,    @NotBlank @Email String email,,    @Min(0) @Max(150) Integer age,) { },\n\n// Global exception handler,@RestControllerAdvice,public class GlobalExceptionHandler {,,    @ExceptionHandler(NotFoundException.class),    @ResponseStatus(HttpStatus.NOT_FOUND),    public ErrorResponse handleNotFound(NotFoundException ex) {,        return new ErrorResponse(\"NOT_FOUND\", ex.getMessage());,    },,    @ExceptionHandler(MethodArgumentNotValidException.class),    @ResponseStatus(HttpStatus.BAD_REQUEST),    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {,        var errors = ex.getBindingResult().getFieldErrors().stream(),            .collect(Collectors.toMap(,                FieldError::getField,,                FieldError::getDefaultMessage,            ));,        return new ErrorResponse(\"VALIDATION_ERROR\", errors);,    },},,record ErrorResponse(String code, Object details) { }"
                  }
        ],
        tips: [
                  "Constructor injection is preferred — no @Autowired needed, easier to test, and enforces immutability.",
                  "Use @RestControllerAdvice for centralized exception handling — keeps controllers clean.",
                  "ResponseEntity gives full control over status, headers, and body — use for conditional responses.",
                  "Records work great as request/response DTOs with Bean Validation annotations."
        ],
        mistake: "Putting business logic in controllers — controllers should only handle HTTP concerns (parsing, validation, response formatting). Business logic belongs in @Service classes.",
        shorthand: {
          verbose: "// Manual / verbose approach\n@RequestMapping(method = RequestMethod.GET, value = \"/users/{id}\")\npublic User getUser(@PathVariable Integer id) { }\n// More explicit but longer",
          concise: "@GetMapping(\"/users/{id}\")\npublic User getUser(@PathVariable Integer id) { }",
        },
      },
      {
        id: "spring-data-jpa",
        fn: "Spring Data JPA — Database Access",
        desc: "Access databases with minimal boilerplate — repositories, entities, queries, and transactions.",
        category: "Spring Boot",
        subtitle: "JpaRepository, @Entity, JPQL, @Transactional",
        signature: "interface UserRepo extends JpaRepository<User, Long> { }  |  findByEmail(String email)",
        descLong: "Spring Data JPA generates repository implementations from interface definitions. Method names are parsed into queries: findByEmailAndActive → SELECT ... WHERE email = ? AND active = ?. Custom JPQL or native SQL via @Query. @Entity maps classes to tables. @Transactional manages transaction boundaries. Pagination and sorting are built-in.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Spring Data JPA — Database Access — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Entity\n@Entity\n@Table(name = \"users\")\npublic class User {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n\n    @Column(nullable = false)\n    private String name;\n\n    @Column(unique = true, nullable = false)\n    private String email;\n\n    @OneToMany(mappedBy = \"user\", cascade = CascadeType.ALL, fetch = FetchType.LAZY)\n    private List<Order> orders = new ArrayList<>();\n\n    @CreatedDate\n    private LocalDateTime createdAt;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Spring Data JPA — Database Access — common patterns you'll see in production.\n// APPROACH  - Combine Spring Data JPA — Database Access with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Constructors, getters, setters...\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Spring Data JPA — Database Access — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Repository — Spring generates the implementation!,public interface UserRepository extends JpaRepository<User, Long> {,\n\n    // Derived query methods,    Optional<User> findByEmail(String email);,    List<User> findByNameContainingIgnoreCase(String name);,    boolean existsByEmail(String email);,    long countByActiveTrue();,\n\n    // Pagination,    Page<User> findByActive(boolean active, Pageable pageable);,\n\n    // Custom JPQL,    @Query(\"SELECT u FROM User u WHERE u.createdAt >= :since AND u.active = true\"),    List<User> findRecentActiveUsers(@Param(\"since\") LocalDateTime since);,\n\n    // Native SQL,    @Query(value = \"SELECT * FROM users WHERE email LIKE %:domain\", nativeQuery = true),    List<User> findByEmailDomain(@Param(\"domain\") String domain);,\n\n    // Projections,    @Query(\"SELECT u.name as name, COUNT(o) as orderCount \" +,           \"FROM User u LEFT JOIN u.orders o GROUP BY u.name\"),    List<UserStats> getUserStats();,},,interface UserStats {,    String getName();,    Long getOrderCount();,},\n\n// Service with transactions,@Service,@Transactional(readOnly = true)  // default read-only for queries,public class UserService {,,    private final UserRepository userRepo;,,    @Transactional  // read-write for mutations,    public UserResponse create(CreateUserRequest request) {,        if (userRepo.existsByEmail(request.email())) {,            throw new ConflictException(\"Email already exists\");,        },        var user = new User(request.name(), request.email());,        return UserResponse.from(userRepo.save(user));,    },,    public Page<UserResponse> findAll(int page, int size) {,        return userRepo.findByActive(true, PageRequest.of(page, size)),            .map(UserResponse::from);,    },}"
                  }
        ],
        tips: [
                  "Method name queries (findByX) are powerful but don't overuse — complex queries are better as @Query JPQL.",
                  "@Transactional(readOnly = true) on the class, @Transactional on write methods — optimizes read connections.",
                  "Use FetchType.LAZY for relationships — EAGER loading causes N+1 queries and loads unnecessary data.",
                  "Projections (interfaces with getters) avoid loading entire entities — more efficient for read-only views."
        ],
        mistake: "Using EAGER fetch on @OneToMany — it loads ALL related entities for every query, causing performance issues. Use LAZY and fetch explicitly when needed with JOIN FETCH in JPQL.",
        shorthand: {
          verbose: "public interface UserRepository extends JpaRepository<User, Integer> {\n  @Query(\"SELECT u FROM User u WHERE u.email = ?1\")\n  User findByEmail(String email);\n}",
          concise: "public interface UserRepository extends JpaRepository<User, Integer> {\n  User findByEmail(String email);\n}",
        },
      },
      {
        id: "spring-config-profiles",
        fn: "Configuration & Profiles",
        desc: "Externalize configuration, manage environments with profiles, and inject properties type-safely.",
        category: "Spring Boot",
        subtitle: "application.yml, @ConfigurationProperties, @Profile",
        signature: "@Value(\"${app.name}\")  |  @ConfigurationProperties(prefix = \"app\")",
        descLong: "Spring Boot loads configuration from application.yml (or .properties), environment variables, and command-line args. @Value injects single properties. @ConfigurationProperties maps a group of properties to a type-safe POJO (or record). Profiles (dev, prod, test) activate different configs. Environment variables override file properties — 12-factor app friendly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Configuration & Profiles — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# application.yml\napp:\n  name: MyService\n  version: 1.0.0\n  feature-flags:\n    new-ui: true\n    beta-api: false\n\nserver:\n  port: 8080\n\nspring:\n  datasource:\n    url: jdbc:postgresql://localhost:5432/mydb\n    username: ${DB_USER:postgres}     # env var with default\n    password: ${DB_PASSWORD:secret}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Configuration & Profiles — common patterns you'll see in production.\n// APPROACH  - Combine Configuration & Profiles with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n---\n# application-dev.yml (activated with --spring.profiles.active=dev)\nspring:\n  config:\n    activate:\n      on-profile: dev\n  datasource:\n    url: jdbc:h2:mem:testdb"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Configuration & Profiles — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n---,# application-prod.yml,spring:,  config:,    activate:,      on-profile: prod,  datasource:,    url: jdbc:postgresql://${DB_HOST}:5432/${DB_NAME},\n\n// Type-safe configuration with record (Java 17+),@ConfigurationProperties(prefix = \"app\"),record AppConfig(,    String name,,    String version,,    FeatureFlags featureFlags,) {,    record FeatureFlags(boolean newUi, boolean betaApi) { },},\n\n// Enable in main class,@SpringBootApplication,@EnableConfigurationProperties(AppConfig.class),public class Application { },\n\n// Inject and use,@RestController,public class InfoController {,    private final AppConfig config;,,    public InfoController(AppConfig config) {,        this.config = config;,    },,    @GetMapping(\"/info\"),    public Map<String, Object> info() {,        return Map.of(,            \"name\", config.name(),,            \"version\", config.version(),,            \"features\", config.featureFlags(),        );,    },},\n\n// Profile-specific beans,@Configuration,public class StorageConfig {,    @Bean,    @Profile(\"dev\"),    StorageService localStorage() { return new LocalStorageService(); },,    @Bean,    @Profile(\"prod\"),    StorageService s3Storage() { return new S3StorageService(); },}"
                  }
        ],
        tips: [
                  "@ConfigurationProperties with records is the cleanest approach — immutable, validated, type-safe.",
                  "Use \\${ENV_VAR:default} syntax for environment variable overrides with sensible defaults.",
                  "Profile-specific files (application-prod.yml) override base application.yml — layer configs.",
                  "Never commit secrets to application.yml — use environment variables or a secrets manager."
        ],
        mistake: "Scattering @Value annotations everywhere — it's hard to track what config exists and where it's used. Group related properties into @ConfigurationProperties classes for discoverability.",
        shorthand: {
          verbose: "@Bean\n@ConditionalOnProperty(name = \"app.feature.enabled\", havingValue = \"true\")\npublic MyService myService() { }",
          concise: "@Bean\n@Profile(\"prod\")\npublic MyService myService() { }",
        },
      },
    ],
  },
]

export default { meta, sections }
