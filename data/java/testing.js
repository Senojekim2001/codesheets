export const meta = {
  "id": "testing",
  "label": "Testing (JUnit & Mockito)",
  "icon": "🧪",
  "description": "Java testing: JUnit 5, Mockito, assertions, parameterized tests, test lifecycle, and integration testing."
}

export const sections = [

  // ── Section 1: JUnit 5 Fundamentals ─────────────────────────────────────────
  {
    id: "junit5",
    title: "JUnit 5 Fundamentals",
    entries: [
      {
        id: "junit-basics",
        fn: "JUnit 5 — Test Lifecycle & Assertions",
        desc: "Write unit tests with JUnit 5: @Test, assertions, lifecycle hooks, display names, and test organization.",
        category: "JUnit",
        subtitle: "@Test, @BeforeEach, @AfterEach, assertEquals, assertThrows, @DisplayName",
        signature: "@Test void test() { assertEquals(expected, actual); }  |  assertThrows(Exception.class, () -> ...)",
        descLong: "JUnit 5 (Jupiter) is the standard Java testing framework. @Test marks test methods. Assertions verify expected behavior: assertEquals, assertTrue, assertNull, assertThrows, assertAll. Lifecycle hooks (@BeforeEach, @AfterEach, @BeforeAll, @AfterAll) set up and tear down test fixtures. @DisplayName gives tests readable names. @Nested groups related tests. @Disabled skips tests. Tests should be fast, isolated, and focused on one behavior.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of JUnit 5 — Test Lifecycle & Assertions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport org.junit.jupiter.api.*;\nimport static org.junit.jupiter.api.Assertions.*;\n\n@DisplayName(\"UserService Tests\")\nclass UserServiceTest {\n\n    private UserService service;\n    private UserRepository mockRepo;\n\n    @BeforeEach\n    void setUp() {\n        mockRepo = new InMemoryUserRepository();\n        service = new UserService(mockRepo);\n    }\n\n    @AfterEach\n    void tearDown() {\n        mockRepo.clear();\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of JUnit 5 — Test Lifecycle & Assertions — common patterns you'll see in production.\n// APPROACH  - Combine JUnit 5 — Test Lifecycle & Assertions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic assertions ─────────────────────────────\n    @Test\n    @DisplayName(\"should create user with valid email\")\n    void createUser_validEmail_returnsUser() {\n        User user = service.createUser(\"alice@example.com\", \"Alice\");\n\n        assertEquals(\"Alice\", user.getName());\n        assertEquals(\"alice@example.com\", user.getEmail());\n        assertNotNull(user.getId());\n        assertTrue(user.isActive());\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of JUnit 5 — Test Lifecycle & Assertions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Assert exceptions ────────────────────────────,    @Test,    @DisplayName(\"should throw on invalid email\"),    void createUser_invalidEmail_throwsException() {,        var ex = assertThrows(,            IllegalArgumentException.class,,            () -> service.createUser(\"not-an-email\", \"Bob\"),        );,        assertEquals(\"Invalid email format\", ex.getMessage());,    },\n\n    // ── assertAll — check multiple conditions ────────,    @Test,    @DisplayName(\"should return complete user profile\"),    void getUserProfile_existingUser_returnsFullProfile() {,        service.createUser(\"alice@example.com\", \"Alice\");,        UserProfile profile = service.getProfile(\"alice@example.com\");,,        assertAll(\"user profile\",,            () -> assertEquals(\"Alice\", profile.getName()),,            () -> assertEquals(\"alice@example.com\", profile.getEmail()),,            () -> assertNotNull(profile.getCreatedAt()),,            () -> assertTrue(profile.isActive()),,            () -> assertEquals(0, profile.getOrderCount()),        );,        // assertAll runs ALL checks — reports all failures, not just first,    },\n\n    // ── Nested test groups ───────────────────────────,    @Nested,    @DisplayName(\"when user exists\"),    class WhenUserExists {,        private User existingUser;,,        @BeforeEach,        void createExistingUser() {,            existingUser = service.createUser(\"alice@example.com\", \"Alice\");,        },,        @Test,        @DisplayName(\"should find by email\"),        void findByEmail_returnsUser() {,            var found = service.findByEmail(\"alice@example.com\");,            assertTrue(found.isPresent());,            assertEquals(existingUser.getId(), found.get().getId());,        },,        @Test,        @DisplayName(\"should prevent duplicate email\"),        void createUser_duplicateEmail_throwsException() {,            assertThrows(,                DuplicateEmailException.class,,                () -> service.createUser(\"alice@example.com\", \"Alice2\"),            );,        },    },,    @Nested,    @DisplayName(\"when user does not exist\"),    class WhenUserDoesNotExist {,        @Test,        @DisplayName(\"should return empty optional\"),        void findByEmail_returnsEmpty() {,            var result = service.findByEmail(\"nobody@example.com\");,            assertTrue(result.isEmpty());,        },    },\n\n    // ── Timeout ──────────────────────────────────────,    @Test,    @Timeout(value = 500, unit = TimeUnit.MILLISECONDS),    void performanceTest() {,        service.processAllUsers();,    },}"
                  }
        ],
        tips: [
                  "Name tests with the pattern: method_condition_expectedBehavior — it reads like documentation.",
                  "assertAll() runs every assertion and reports ALL failures — regular assertions stop at the first failure.",
                  "@Nested classes group related tests with shared setup — creates a BDD-like describe/it structure.",
                  "@DisplayName gives human-readable names in test reports — use sentences that describe the behavior."
        ],
        mistake: "Writing one giant test that checks everything — each test should verify one specific behavior. Multiple focused tests are easier to debug than one large test that fails somewhere in the middle.",
        shorthand: {
          verbose: "@Test\npublic void testAdd() {\n  assertEquals(4, calc.add(2, 2));\n}",
          concise: "@Test\nvoid testAdd() {\n  assertEquals(4, calc.add(2, 2));\n}",
        },
      },
      {
        id: "parameterized-tests",
        fn: "Parameterized Tests — Data-Driven Testing",
        desc: "Run the same test with different inputs: @ValueSource, @CsvSource, @MethodSource, and @EnumSource.",
        category: "JUnit",
        subtitle: "@ParameterizedTest, @ValueSource, @CsvSource, @MethodSource, @EnumSource",
        signature: "@ParameterizedTest @ValueSource(strings = {\"a\", \"b\"}) void test(String s)",
        descLong: "Parameterized tests run the same test logic with different input data. @ValueSource provides simple values (strings, ints, doubles). @CsvSource provides multiple arguments per test as CSV. @MethodSource references a method that returns a Stream of Arguments. @EnumSource tests all enum values. This eliminates copy-paste tests that differ only in input/output. The test report shows each parameterized case separately.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Parameterized Tests — Data-Driven Testing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport org.junit.jupiter.params.ParameterizedTest;\nimport org.junit.jupiter.params.provider.*;\n\nclass ValidationTest {"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Parameterized Tests — Data-Driven Testing — common patterns you'll see in production.\n// APPROACH  - Combine Parameterized Tests — Data-Driven Testing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── @ValueSource — simple single-argument tests ──\n    @ParameterizedTest\n    @ValueSource(strings = {\"alice@test.com\", \"bob@co.uk\", \"a@b.c\"})\n    @DisplayName(\"should accept valid emails\")\n    void isValidEmail_validInput_returnsTrue(String email) {\n        assertTrue(Validator.isValidEmail(email));\n    }\n\n    @ParameterizedTest\n    @ValueSource(strings = {\"\", \"not-email\", \"@missing.com\", \"no@\"})\n    @DisplayName(\"should reject invalid emails\")\n    void isValidEmail_invalidInput_returnsFalse(String email) {\n        assertFalse(Validator.isValidEmail(email));\n    }\n\n    @ParameterizedTest\n    @ValueSource(ints = {1, 5, 10, 100, Integer.MAX_VALUE})\n    void isPositive_positiveNumbers_returnsTrue(int n) {\n        assertTrue(n > 0);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Parameterized Tests — Data-Driven Testing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── @NullAndEmptySource — edge cases ─────────────,    @ParameterizedTest,    @NullAndEmptySource,    @ValueSource(strings = {\"  \", \"\\t\", \"\\n\"}),    @DisplayName(\"should reject blank strings\"),    void isBlank_blankInput_returnsTrue(String input) {,        assertTrue(Validator.isBlank(input));,    },\n\n    // ── @CsvSource — multiple arguments per case ─────,    @ParameterizedTest,    @CsvSource({,        \"1,   1,  2\",,        \"5,   3,  8\",,        \"100, 50, 150\",,        \"-1,  1,  0\",,        \"0,   0,  0\",    }),    @DisplayName(\"should add two numbers correctly\"),    void add(int a, int b, int expected) {,        assertEquals(expected, Calculator.add(a, b));,    },,    @ParameterizedTest,    @CsvSource({,        \"alice@test.com,  true\",,        \"not-an-email,    false\",,        \"'',              false\",    }),    void validateEmail(String email, boolean expected) {,        assertEquals(expected, Validator.isValidEmail(email));,    },\n\n    // ── @MethodSource — complex test data ────────────,    @ParameterizedTest,    @MethodSource(\"provideUsersForValidation\"),    @DisplayName(\"should validate user objects\"),    void validateUser(User user, boolean expected, String reason) {,        assertEquals(expected, Validator.isValid(user), reason);,    },,    static Stream<Arguments> provideUsersForValidation() {,        return Stream.of(,            Arguments.of(new User(\"Alice\", \"a@b.com\", 25), true, \"valid user\"),,            Arguments.of(new User(\"\", \"a@b.com\", 25), false, \"empty name\"),,            Arguments.of(new User(\"Bob\", \"invalid\", 25), false, \"bad email\"),,            Arguments.of(new User(\"Carol\", \"c@d.com\", -1), false, \"negative age\"),,            Arguments.of(null, false, \"null user\"),        );,    },\n\n    // ── @EnumSource — test all enum values ───────────,    @ParameterizedTest,    @EnumSource(Status.class),    @DisplayName(\"all statuses should have a display name\"),    void allStatuses_haveDisplayName(Status status) {,        assertNotNull(status.getDisplayName());,        assertFalse(status.getDisplayName().isEmpty());,    },,    @ParameterizedTest,    @EnumSource(value = Status.class, names = {\"ACTIVE\", \"PENDING\"}),    void onlyActiveStatuses(Status status) {,        assertTrue(status.isEditable());,    },}"
                  }
        ],
        tips: [
                  "@CsvSource is the most versatile — use it when tests have 2-3 input/output parameters per case.",
                  "@MethodSource for complex objects — return Stream<Arguments> with descriptive test data.",
                  "@NullAndEmptySource + @ValueSource covers null, \"\", and custom blank strings in one annotation.",
                  "Each parameterized case appears as a separate test in reports — failures show which specific input failed."
        ],
        mistake: "Copy-pasting the same test 10 times with different inputs — use @ParameterizedTest with @CsvSource or @MethodSource instead. It is more maintainable and each case is reported separately.",
        shorthand: {
          verbose: "@ParameterizedTest\n@ValueSource(ints = { 1, 3, 5 })\nvoid testOdd(int num) { assertTrue(isOdd(num)); }",
          concise: "@ParameterizedTest\n@CsvSource({ \"1, true\", \"2, false\", \"3, true\" })\nvoid testOdd(int num, boolean expected) { }",
        },
      },
      {
        id: "junit5-assertions",
        fn: "AssertJ — Fluent Assertions",
        desc: "Readable, chainable assertions with AssertJ: assertThat, soft assertions, custom assertions, and better error messages.",
        category: "JUnit",
        subtitle: "assertThat().isEqualTo(), hasSize(), containsExactly(), soft assertions",
        signature: "assertThat(list).hasSize(3).containsExactly(\"a\", \"b\", \"c\")  |  softAssertions()",
        descLong: "AssertJ provides fluent assertion syntax: assertThat(value).isEqualTo(expected) reads naturally. Supports collections (hasSize(), contains(), containsExactly()), exceptions (assertThatThrownBy()), and custom assertions. SoftAssertions collects failures and reports all at the end — perfect for multi-check tests. Compared to plain JUnit assertEquals, AssertJ gives better error messages and IDE auto-complete for chainable methods.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of AssertJ — Fluent Assertions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport static org.assertj.core.api.Assertions.*;\nimport org.assertj.core.api.SoftAssertions;\n\nclass UserServiceTest {"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of AssertJ — Fluent Assertions — common patterns you'll see in production.\n// APPROACH  - Combine AssertJ — Fluent Assertions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Simple object assertions ─────────────────────\n    @Test\n    void createUser_returnsValidUser() {\n        User user = service.createUser(\"alice@test.com\", \"Alice\", 30);\n\n        assertThat(user)\n            .isNotNull()\n            .extracting(User::getName, User::getEmail, User::getAge)\n            .containsExactly(\"Alice\", \"alice@test.com\", 30);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of AssertJ — Fluent Assertions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Collection assertions ────────────────────────,    @Test,    void findAllUsers_returnsAllUsers() {,        List<User> users = service.findAll();,,        assertThat(users),            .hasSize(3),            .extracting(User::getName),            .containsExactly(\"Alice\", \"Bob\", \"Carol\");,,        assertThat(users),            .filteredOn(u -> u.getAge() > 25),            .hasSize(2);,    },\n\n    // ── Exception assertions (assertThatThrownBy) ────,    @Test,    void createUser_invalidEmail_throwsException() {,        assertThatThrownBy(() -> service.createUser(\"bad-email\", \"Bob\", 25)),            .isInstanceOf(IllegalArgumentException.class),            .hasMessage(\"Invalid email format\"),            .hasNoCause();,    },\n\n    // ── Soft assertions — check multiple, report all ──,    @Test,    void getUserProfile_completenessCheck() {,        UserProfile profile = service.getProfile(\"alice@test.com\");,,        SoftAssertions soft = new SoftAssertions();,        soft.assertThat(profile.getName()).isNotBlank();,        soft.assertThat(profile.getEmail()).contains(\"@\");,        soft.assertThat(profile.getAge()).isGreaterThan(0);,        soft.assertThat(profile.getCreatedAt()).isNotNull();,        soft.assertThat(profile.getOrders()).isNotNull();,        soft.assertAll();  // Fails if ANY assertion failed,    },\n\n    // ── Custom assertions ────────────────────────────,    @Test,    void customAssertion_userIsActive() {,        User user = service.createUser(\"alice@test.com\", \"Alice\", 30);,,        assertThat(user),            .satisfies(u -> {,                assertThat(u.getName()).isNotBlank();,                assertThat(u.getEmail()).contains(\"@\");,                assertThat(u.isActive()).isTrue();,            });,    },\n\n    // ── Optional assertions ──────────────────────────,    @Test,    void findByEmail_existingUser_returnsOptional() {,        var user = service.findByEmail(\"alice@test.com\");,,        assertThat(user),            .isPresent(),            .hasValue(new User(\"Alice\", \"alice@test.com\", 30));,    },\n\n    // ── String assertions ────────────────────────────,    @Test,    void formatUserInfo_containsExpectedContent() {,        String info = service.formatUserInfo(\"alice@test.com\");,,        assertThat(info),            .isNotEmpty(),            .contains(\"Alice\"),            .startsWith(\"User:\"),            .endsWith(\"active\"),            .doesNotContain(\"password\");,    },}"
                  }
        ],
        tips: [
                  "assertThat().satisfies() runs custom lambda checks — perfect for multi-condition assertions on single objects.",
                  "SoftAssertions.assertAll() reports ALL failures at once, not just the first — use for comprehensive test checks.",
                  "extracting(User::getName, User::getAge) grabs fields from objects for cleaner assertions than field-by-field checks.",
                  "AssertJ error messages are far better than JUnit — they show exact difference, diffs, and context automatically."
        ],
        mistake: "Mixing AssertJ and JUnit assertions — pick one for consistency. AssertJ is more readable and should be preferred.",
        shorthand: {
          verbose: "List<String> names = service.getAllNames();\nassertTrue(names.size() == 2);\nassertTrue(names.contains(\"Alice\"));\nassertTrue(names.contains(\"Bob\"));",
          concise: "assertThat(service.getAllNames())\n  .hasSize(2)\n  .containsExactly(\"Alice\", \"Bob\");",
        },
      },
      {
        id: "junit5-extensions",
        fn: "JUnit 5 Extensions — Custom Test Behavior",
        desc: "Extend JUnit 5 with custom extensions: lifecycle callbacks, parameter injection, and test templates.",
        category: "JUnit",
        subtitle: "@ExtendWith, BeforeEachCallback, AfterEachCallback, ParameterResolver",
        signature: "@ExtendWith(MyExtension.class)  |  class MyExtension implements BeforeEachCallback",
        descLong: "JUnit 5 extensions customize test behavior via callbacks and parameters. Extensions implement interfaces like BeforeEachCallback, AfterEachCallback, and ParameterResolver. @ExtendWith activates extensions on test classes. Common use cases: database setup, resetting mocks, injection of fixtures, custom parameterization. Extensions are cleaner than inheritance or static setup methods — they compose and stack.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of JUnit 5 Extensions — Custom Test Behavior — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport org.junit.jupiter.api.extension.*;\nimport org.junit.jupiter.api.*;\nimport java.util.*;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of JUnit 5 Extensions — Custom Test Behavior — common patterns you'll see in production.\n// APPROACH  - Combine JUnit 5 Extensions — Custom Test Behavior with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Custom extension example ─────────────────────\nclass DatabaseExtension implements BeforeEachCallback, AfterEachCallback {\n\n    @Override\n    public void beforeEach(ExtensionContext ctx) throws Exception {\n        // Clean database before each test\n        TestDatabase.reset();\n        TestDatabase.migrate();\n    }\n\n    @Override\n    public void afterEach(ExtensionContext ctx) throws Exception {\n        // Cleanup after test\n        TestDatabase.rollback();\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of JUnit 5 Extensions — Custom Test Behavior — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Extension with ParameterResolver ─────────────,class UserFixtureExtension implements ParameterResolver {,,    @Override,    public boolean supportsParameter(,            ParameterContext pc, ExtensionContext ec) {,        return pc.getParameter().getType() == User.class;,    },,    @Override,    public Object resolveParameter(,            ParameterContext pc, ExtensionContext ec) {,        // Inject User fixture,        return new User(\"Alice\", \"alice@test.com\", 30);,    },},\n\n// ── Using extensions ────────────────────────────,@ExtendWith({DatabaseExtension.class, UserFixtureExtension.class}),class UserServiceTest {,,    @Test,    void createUser_validData_succeeds(User fixture, TestInfo info) {,        // fixture injected by UserFixtureExtension,        // info injected by JUnit (built-in),,        User created = service.createUser(,            fixture.getEmail(), fixture.getName(), fixture.getAge(),        );,,        assertThat(created.getId()).isNotNull();,        System.out.println(\"Test: \" + info.getDisplayName());,    },},\n\n// ── Lifecycle callbacks ──────────────────────────,class TimingExtension implements BeforeEachCallback, AfterEachCallback {,,    private static final ExtensionContext.Namespace NAMESPACE =,        ExtensionContext.Namespace.create(\"timing\");,,    @Override,    public void beforeEach(ExtensionContext ctx) {,        ctx.getStore(NAMESPACE),            .put(\"startTime\", System.nanoTime());,    },,    @Override,    public void afterEach(ExtensionContext ctx) {,        long startTime = ctx.getStore(NAMESPACE),            .get(\"startTime\", long.class);,        long elapsed = (System.nanoTime() - startTime) / 1_000_000;,,        if (elapsed > 1000) {,            System.out.println(\"⚠️  Test too slow: \" + elapsed + \"ms\");,        },    },}"
                  }
        ],
        tips: [
                  "BeforeEachCallback runs before every test; use for setup. AfterEachCallback runs after every test; use for cleanup.",
                  "ParameterResolver injects test parameters beyond method parameters — combine with @ExtendWith for powerful fixture injection.",
                  "ExtensionContext.Store shares state between callbacks — use Namespace for thread-safe state management.",
                  "Extensions are composable: @ExtendWith({A.class, B.class}) applies both — order matters for before/after sequences."
        ],
        mistake: "Creating static setup/cleanup methods when extensions would be cleaner — extensions are reusable, testable, and more flexible than static methods.",
        shorthand: {
          verbose: "@ExtendWith(MockitoExtension.class)\n@ExtendWith(DatabaseExtension.class)\nclass UserServiceTest { }",
          concise: "@ExtendWith({MockitoExtension.class, DatabaseExtension.class})\nclass UserServiceTest { }",
        },
      },
    ],
  },

  // ── Section 2: Mockito & Integration Testing ─────────────────────────────────────────
  {
    id: "mockito",
    title: "Mockito & Integration Testing",
    entries: [
      {
        id: "mockito-basics",
        fn: "Mockito — Mocking Dependencies",
        desc: "Isolate units under test with Mockito: mock creation, stubbing, verification, and argument matchers.",
        category: "Mockito",
        subtitle: "@Mock, @InjectMocks, when/thenReturn, verify, ArgumentCaptor",
        signature: "when(mock.method(arg)).thenReturn(value)  |  verify(mock).method(arg)  |  @Mock",
        descLong: "Mockito creates mock objects that simulate dependency behavior. @Mock creates a mock, @InjectMocks injects mocks into the class under test. when().thenReturn() stubs method return values. verify() checks that methods were called with expected arguments. ArgumentCaptor captures arguments passed to mocks for detailed assertions. Mockito ensures unit tests are fast and isolated — they test only the class under test, not its dependencies.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mockito — Mocking Dependencies — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport org.junit.jupiter.api.Test;\nimport org.junit.jupiter.api.extension.ExtendWith;\nimport org.mockito.*;\nimport org.mockito.junit.jupiter.MockitoExtension;\nimport static org.mockito.Mockito.*;\nimport static org.junit.jupiter.api.Assertions.*;\n\n@ExtendWith(MockitoExtension.class)\nclass OrderServiceTest {\n\n    @Mock\n    private OrderRepository orderRepo;\n    @Mock\n    private PaymentGateway paymentGateway;\n    @Mock\n    private EmailService emailService;\n\n    @InjectMocks\n    private OrderService orderService;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mockito — Mocking Dependencies — common patterns you'll see in production.\n// APPROACH  - Combine Mockito — Mocking Dependencies with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Stubbing — define mock behavior ──────────────\n    @Test\n    void placeOrder_validOrder_savesAndCharges() {\n        // Arrange — stub dependencies\n        var order = new Order(\"user-1\", List.of(\n            new LineItem(\"SKU-A\", 2, 29.99)\n        ));\n\n        when(paymentGateway.charge(\"user-1\", 59.98))\n            .thenReturn(new PaymentResult(true, \"txn-123\"));\n        when(orderRepo.save(any(Order.class)))\n            .thenAnswer(inv -> {\n                Order o = inv.getArgument(0);\n                o.setId(\"order-1\");\n                return o;\n            });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mockito — Mocking Dependencies — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Act,        Order result = orderService.placeOrder(order);,\n\n        // Assert,        assertEquals(\"order-1\", result.getId());,        assertEquals(OrderStatus.CONFIRMED, result.getStatus());,    },\n\n    // ── Verification — check interactions ────────────,    @Test,    void placeOrder_success_sendsConfirmationEmail() {,        when(paymentGateway.charge(anyString(), anyDouble())),            .thenReturn(new PaymentResult(true, \"txn-1\"));,        when(orderRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));,,        orderService.placeOrder(new Order(\"user-1\", List.of()));,\n\n        // Verify email was sent exactly once,        verify(emailService, times(1)).sendOrderConfirmation(,            eq(\"user-1\"),,            any(Order.class),        );,\n\n        // Verify payment gateway was NOT refunded,        verify(paymentGateway, never()).refund(anyString());,    },\n\n    // ── ArgumentCaptor — inspect captured arguments ──,    @Test,    void placeOrder_capturesEmailContent() {,        when(paymentGateway.charge(anyString(), anyDouble())),            .thenReturn(new PaymentResult(true, \"txn-1\"));,        when(orderRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));,,        @Captor ArgumentCaptor<Order> orderCaptor;,,        orderService.placeOrder(new Order(\"user-1\", List.of()));,,        verify(emailService).sendOrderConfirmation(,            eq(\"user-1\"),,            orderCaptor.capture(),        );,,        Order capturedOrder = orderCaptor.getValue();,        assertEquals(OrderStatus.CONFIRMED, capturedOrder.getStatus());,    },\n\n    // ── Stubbing exceptions ──────────────────────────,    @Test,    void placeOrder_paymentFails_throwsException() {,        when(paymentGateway.charge(anyString(), anyDouble())),            .thenThrow(new PaymentException(\"Declined\"));,,        assertThrows(PaymentException.class,,            () -> orderService.placeOrder(new Order(\"user-1\", List.of())),        );,\n\n        // Verify order was NOT saved,        verify(orderRepo, never()).save(any());,    },\n\n    // ── Argument matchers ────────────────────────────,    @Test,    void matchers_example() {,        when(orderRepo.findByUser(anyString())).thenReturn(List.of());,        when(orderRepo.findByDateRange(any(), any())).thenReturn(List.of());,        when(orderRepo.findByAmount(argThat(a -> a > 100))),            .thenReturn(List.of(new Order()));,        // argThat() — custom matcher with lambda,    },}"
                  }
        ],
        tips: [
                  "@ExtendWith(MockitoExtension.class) enables @Mock and @InjectMocks annotations — add it to every Mockito test class.",
                  "when().thenReturn() for simple stubs, when().thenAnswer() when you need to inspect or transform arguments.",
                  "verify(mock, never()).method() asserts a method was NOT called — important for testing error paths.",
                  "ArgumentCaptor.capture() grabs the actual argument for detailed assertions — more powerful than argument matchers."
        ],
        mistake: "Mocking the class under test — only mock its dependencies. If you mock the class itself, you are testing Mockito, not your code. @InjectMocks creates a real instance with mocked dependencies.",
        shorthand: {
          verbose: "UserService mockService = mock(UserService.class);\nwhen(mockService.getUser(1)).thenReturn(new User(1, \"Alice\"));\nUser user = mockService.getUser(1);",
          concise: "@Mock UserService mockService;\nvoid setup() { MockitoAnnotations.openMocks(this); }",
        },
      },
      {
        id: "mockito-advanced",
        fn: "Mockito Advanced — Spies, Answers, and Matchers",
        desc: "Advanced Mockito: @Spy for partial mocking, custom answers, thenAnswer, and complex argument matchers.",
        category: "Mockito",
        subtitle: "@Spy, doThrow(), thenAnswer(), ArgumentMatchers.*, InOrder",
        signature: "@Spy RealClass spy  |  doThrow().when(spy).method()  |  ArgumentMatchers.matches(regex)",
        descLong: "@Spy wraps a real object and tracks calls while executing real behavior — useful for testing partial changes. doThrow()/doNothing()/doReturn() used when you need to configure behavior before the spy method is called. thenAnswer(invocation) is more powerful than thenReturn — it receives the actual arguments and can compute a response. ArgumentMatchers supports custom predicates with matches() or argThat(). InOrder verifies call sequences.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mockito Advanced — Spies, Answers, and Matchers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport org.mockito.*;\nimport static org.mockito.Mockito.*;\nimport static org.mockito.ArgumentMatchers.*;\nimport org.junit.jupiter.api.Test;\n\nclass AdvancedMockitoTest {"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mockito Advanced — Spies, Answers, and Matchers — common patterns you'll see in production.\n// APPROACH  - Combine Mockito Advanced — Spies, Answers, and Matchers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── @Spy — partial real/mock ────────────────────\n    @Test\n    void spy_callsRealMethodByDefault() {\n        List<String> realList = new ArrayList<>();\n        List<String> spyList = spy(realList);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mockito Advanced — Spies, Answers, and Matchers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Real behavior — actually adds to list,        spyList.add(\"Alice\");,        assertThat(spyList).hasSize(1);,\n\n        // Override specific method,        doNothing().when(spyList).clear();,        spyList.clear();,        assertThat(spyList).hasSize(1);  // clear() was stubbed, so it did nothing,    },\n\n    // ── doThrow() — configure exception before call ──,    @Test,    void doThrow_configureFail() {,        OrderRepository mockRepo = mock(OrderRepository.class);,\n\n        // Must use doThrow for void methods,        doThrow(new DatabaseException(\"Connection lost\")),            .when(mockRepo),            .delete(1L);,,        assertThrows(DatabaseException.class, () -> {,            mockRepo.delete(1L);,        });,    },\n\n    // ── thenAnswer() — compute response dynamically ──,    @Test,    void thenAnswer_inspectArguments() {,        UserService mockService = mock(UserService.class);,\n\n        // thenAnswer receives invocation with all args,        when(mockService.updateUser(any(User.class))),            .thenAnswer(invocation -> {,                User arg = invocation.getArgument(0);,                // Inspect/modify and return,                arg.setLastModified(LocalDateTime.now());,                return arg;,            });,,        User user = new User(\"Alice\", \"alice@test.com\", 30);,        User result = mockService.updateUser(user);,,        assertThat(result.getLastModified()).isNotNull();,    },\n\n    // ── ArgumentMatchers — custom regex matcher ─────,    @Test,    void argumentMatchers_regex() {,        UserValidator validator = mock(UserValidator.class);,,        when(validator.isValidEmail(matches(\".*@example\\.com\"))),            .thenReturn(true);,        when(validator.isValidEmail(matches(\".*@other\\.com\"))),            .thenReturn(false);,,        assertThat(validator.isValidEmail(\"alice@example.com\")).isTrue();,        assertThat(validator.isValidEmail(\"bob@other.com\")).isFalse();,    },\n\n    // ── ArgumentMatchers.argThat() — complex condition ──,    @Test,    void argThat_customPredicate() {,        OrderRepository mockRepo = mock(OrderRepository.class);,,        when(mockRepo.findByAmount(argThat(,            amount -> amount > 100 && amount < 1000,        ))).thenReturn(List.of(new Order(\"order-1\", 500)));,,        var orders = mockRepo.findByAmount(500);,        assertThat(orders).hasSize(1);,    },\n\n    // ── InOrder — verify call sequence ──────────────,    @Test,    void inOrder_verifyCallSequence() {,        OrderRepository repo = mock(OrderRepository.class);,        PaymentGateway gateway = mock(PaymentGateway.class);,,        OrderService service = new OrderService(repo, gateway);,        Order order = new Order(\"user-1\", 100);,,        service.placeOrder(order);,\n\n        // Verify calls in order,        InOrder inOrder = inOrder(repo, gateway);,        inOrder.verify(repo).save(any());  // save called first,        inOrder.verify(gateway).charge(anyString(), anyDouble());  // charge called second,    },\n\n    // ── Verification with timeout ────────────────────,    @Test,    void verify_withTimeout() {,        AsyncService asyncService = mock(AsyncService.class);,,        asyncService.processAsync(\"request-1\");,\n\n        // Verify was called within 2 seconds,        verify(asyncService, timeout(2000)),            .processAsync(\"request-1\");,    },\n\n    // ── Multiple calls with different arguments ──────,    @Test,    void multipleStubs_differentArgs() {,        UserRepository mockRepo = mock(UserRepository.class);,,        when(mockRepo.findById(1L)),            .thenReturn(new User(\"Alice\", \"alice@test.com\", 30));,        when(mockRepo.findById(2L)),            .thenReturn(new User(\"Bob\", \"bob@test.com\", 25));,        when(mockRepo.findById(argThat(id -> id > 100))),            .thenThrow(new NotFoundException());,,        assertThat(mockRepo.findById(1L).getName()).isEqualTo(\"Alice\");,        assertThat(mockRepo.findById(2L).getName()).isEqualTo(\"Bob\");,        assertThrows(NotFoundException.class, () -> mockRepo.findById(101L));,    },}"
                  }
        ],
        tips: [
                  "@Spy wraps a real object — useful for testing legacy code or when you want real behavior with selective overrides.",
                  "Use doThrow().when() instead of when().thenThrow() for void methods — syntax matters for mocks vs spies.",
                  "thenAnswer() is more powerful than thenReturn() — it gives you the actual arguments to compute dynamic responses.",
                  "verify(mock, timeout(millis)).method() checks async calls — useful for testing asynchronous behavior."
        ],
        mistake: "Over-spying on real objects — if you spy on everything, you lose the benefit of unit testing. Spy sparingly on specific behaviors.",
        shorthand: {
          verbose: "OrderRepository repo = new OrderRepository();\nOrderRepository spy = spy(repo);\nwhen(spy.save(any())).thenReturn(null);",
          concise: "@Spy OrderRepository repo;\ndoThrow(new DbException())\n  .when(repo).delete(anyLong());",
        },
      },
    ],
  },

  // ── Section 3: Spring Boot & Integration Testing ─────────────────────────────────────────
  {
    id: "spring-boot-testing",
    title: "Spring Boot & Integration Testing",
    entries: [
      {
        id: "spring-boot-test",
        fn: "Spring Boot Integration Tests — @SpringBootTest & Slices",
        desc: "Integration test setup: @SpringBootTest, @WebMvcTest, @DataJpaTest, MockMvc, and TestRestTemplate.",
        category: "Spring Boot",
        subtitle: "@SpringBootTest, @WebMvcTest, @DataJpaTest, MockMvc, TestRestTemplate",
        signature: "@SpringBootTest  |  @WebMvcTest(UserController.class)  |  mockMvc.perform(get(\"/users\"))",
        descLong: "@SpringBootTest loads the full application context — slow but tests real integration. @WebMvcTest loads only the web layer (controllers) with MockMvc — faster integration tests. @DataJpaTest loads only JPA + datasource for repository tests. TestRestTemplate makes real HTTP calls to a live server. MockMvc is in-memory, no HTTP — preferred for controller tests. Each annotation creates a focused context for specific layer testing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Spring Boot Integration Tests — @SpringBootTest & Slices — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;\nimport org.springframework.boot.test.autoconfigure.data.jdbc.DataJdbcTest;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport org.springframework.boot.test.web.client.TestRestTemplate;\nimport org.springframework.boot.test.mock.mockito.MockBean;\nimport org.junit.jupiter.api.Test;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;\nimport static org.hamcrest.Matchers.*;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Spring Boot Integration Tests — @SpringBootTest & Slices — common patterns you'll see in production.\n// APPROACH  - Combine Spring Boot Integration Tests — @SpringBootTest & Slices with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── @WebMvcTest — controller layer only (fastest) ──\n@WebMvcTest(UserController.class)\nclass UserControllerTest {\n\n    @Autowired\n    private MockMvc mockMvc;\n\n    @MockBean\n    private UserService userService;\n\n    @Test\n    void getUser_existingId_returns200() throws Exception {\n        when(userService.findById(1L))\n            .thenReturn(new User(1L, \"Alice\", \"alice@test.com\"));\n\n        mockMvc.perform(get(\"/api/users/1\")\n                .contentType(MediaType.APPLICATION_JSON))\n            .andExpect(status().isOk())\n            .andExpect(jsonPath(\"$.id\").value(1))\n            .andExpect(jsonPath(\"$.name\").value(\"Alice\"));\n    }\n\n    @Test\n    void createUser_validRequest_returns201() throws Exception {\n        User newUser = new User(null, \"Bob\", \"bob@test.com\");\n        User saved = new User(2L, \"Bob\", \"bob@test.com\");\n\n        when(userService.create(any()))\n            .thenReturn(saved);\n\n        mockMvc.perform(post(\"/api/users\")\n                .contentType(MediaType.APPLICATION_JSON)\n                .content(\"\"\"\n                    {\"name\":\"Bob\",\"email\":\"bob@test.com\"}\n                    \"\"\"))\n            .andExpect(status().isCreated())\n            .andExpect(jsonPath(\"$.id\").value(2))\n            .andExpect(jsonPath(\"$.name\").value(\"Bob\"));\n    }\n\n    @Test\n    void getUser_notFound_returns404() throws Exception {\n        when(userService.findById(999L))\n            .thenThrow(new NotFoundException(\"User not found\"));\n\n        mockMvc.perform(get(\"/api/users/999\"))\n            .andExpect(status().isNotFound());\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Spring Boot Integration Tests — @SpringBootTest & Slices — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── @DataJpaTest — repository layer only ────────,@DataJpaTest,class UserRepositoryTest {,,    @Autowired,    private UserRepository userRepository;,,    @Autowired,    private TestEntityManager testEntityManager;,,    @Test,    void findByEmail_existingEmail_returnsUser() {,        User user = new User(null, \"Alice\", \"alice@test.com\");,        testEntityManager.persistAndFlush(user);,,        var found = userRepository.findByEmail(\"alice@test.com\");,,        assertThat(found).isPresent();,        assertThat(found.get().getName()).isEqualTo(\"Alice\");,    },,    @Test,    void findByEmail_missingEmail_returnsEmpty() {,        var found = userRepository.findByEmail(\"nobody@test.com\");,        assertThat(found).isEmpty();,    },},\n\n// ── @SpringBootTest — full application context ──,@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT),class UserIntegrationTest {,,    @Autowired,    private TestRestTemplate restTemplate;,,    @LocalServerPort,    private int port;,,    @Test,    void listUsers_viaDatabaseIntegration_succeeds() {,        String response = restTemplate.getForObject(,            \"http://localhost:\" + port + \"/api/users\",,            String.class,        );,,        assertThat(response).contains(\"Alice\");,    },}"
                  }
        ],
        tips: [
                  "@WebMvcTest is fastest — use it for unit-testing controllers in isolation with mocked services.",
                  "@DataJpaTest tests repositories with a real (in-memory) database — useful for testing query logic.",
                  "@SpringBootTest loads everything — use only for end-to-end tests. It is slow but catches real integration issues.",
                  "mockMvc.perform().andExpect() chains assertions — each expect() runs in the same request context."
        ],
        mistake: "Using @SpringBootTest for every test — it is 5-10x slower than @WebMvcTest. Test controller and service layers in isolation first, use @SpringBootTest only for critical end-to-end paths.",
        shorthand: {
          verbose: "@SpringBootTest\nclass UserControllerTest {\n    @Autowired TestRestTemplate restTemplate;\n    void test() { restTemplate.getForObject(\"/api/users\", User[].class); }\n}",
          concise: "@WebMvcTest(UserController.class)\nclass UserControllerTest {\n    @Autowired MockMvc mockMvc;\n    void test() throws Exception { mockMvc.perform(get(\"/api/users\")); }\n}",
        },
      },
      {
        id: "testcontainers-java",
        fn: "Testcontainers — Docker Containers in Tests",
        desc: "Run real databases/services in tests: @Testcontainers, @Container, PostgreSQL, Redis, WireMock containers.",
        category: "Spring Boot",
        subtitle: "@Testcontainers, @Container, GenericContainer, PostgreSQL/Redis containers",
        signature: "@Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(\"postgres:15\")",
        descLong: "Testcontainers runs Docker containers during tests — test against real PostgreSQL, Redis, Kafka, not H2 mocks. @Testcontainers enables the extension, @Container marks container fields. Containers start before tests and stop after. Huge advantage over mocked databases: tests real SQL, real schema migrations, real network behavior. Requires Docker installed. Spring Boot auto-detects and connects to containers via environment variables.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Testcontainers — Docker Containers in Tests — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport org.testcontainers.junit.jupiter.Container;\nimport org.testcontainers.junit.jupiter.Testcontainers;\nimport org.testcontainers.containers.PostgreSQLContainer;\nimport org.testcontainers.containers.GenericContainer;\nimport org.springframework.boot.test.context.SpringBootTest;\nimport org.springframework.test.context.DynamicPropertySource;\nimport org.springframework.test.context.DynamicPropertyRegistry;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Testcontainers — Docker Containers in Tests — common patterns you'll see in production.\n// APPROACH  - Combine Testcontainers — Docker Containers in Tests with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── PostgreSQL container for integration tests ──\n@Testcontainers\n@SpringBootTest\nclass OrderRepositoryTest {\n\n    @Container\n    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(\"postgres:15\")\n        .withDatabaseName(\"test_db\")\n        .withUsername(\"test_user\")\n        .withPassword(\"test_pass\");\n\n    @DynamicPropertySource\n    static void registerDatasourceProperties(DynamicPropertyRegistry registry) {\n        registry.add(\"spring.datasource.url\", postgres::getJdbcUrl);\n        registry.add(\"spring.datasource.username\", postgres::getUsername);\n        registry.add(\"spring.datasource.password\", postgres::getPassword);\n    }\n\n    @Autowired\n    private OrderRepository orderRepository;\n\n    @Test\n    void saveOrder_realDatabase_succeeds() {\n        Order order = new Order(\"user-1\", List.of(\n            new LineItem(\"SKU-A\", 2, 29.99)\n        ));\n\n        Order saved = orderRepository.save(order);\n\n        assertThat(saved.getId()).isNotNull();\n        assertThat(orderRepository.findById(saved.getId())).isPresent();\n    }\n\n    @Test\n    void complexQuery_realSchema_works() {\n        // Inserts test data\n        orderRepository.saveAll(List.of(\n            new Order(\"user-1\", 100),\n            new Order(\"user-2\", 250),\n            new Order(\"user-1\", 150)\n        ));\n\n        List<Order> user1Orders = orderRepository.findByUserId(\"user-1\");\n\n        assertThat(user1Orders).hasSize(2)\n            .extracting(Order::getTotal)\n            .containsExactly(100, 150);\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Testcontainers — Docker Containers in Tests — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Redis container ─────────────────────────────,@Testcontainers,class CacheIntegrationTest {,,    @Container,    static GenericContainer<?> redis = new GenericContainer<>(\"redis:7\"),        .withExposedPorts(6379);,,    @DynamicPropertySource,    static void redisProperties(DynamicPropertyRegistry registry) {,        registry.add(\"spring.redis.host\", redis::getHost);,        registry.add(\"spring.redis.port\", () -> redis.getMappedPort(6379));,    },,    @Autowired,    private CacheService cacheService;,,    @Test,    void cache_storesAndRetrieves() {,        cacheService.put(\"key-1\", \"value-1\");,        var value = cacheService.get(\"key-1\");,,        assertThat(value).isEqualTo(\"value-1\");,    },}"
                  }
        ],
        tips: [
                  "@Container static fields start once per test class — use for expensive containers (databases). Instance fields start per test (slower).",
                  "@DynamicPropertySource supplies connection details to Spring — auto-detected, no manual config needed.",
                  "Testcontainers caches pulled images — first test is slow, subsequent tests reuse the container.",
                  "Use Testcontainers for integration tests only — they are 10-20x slower than unit tests. Keep unit tests fast with mocks."
        ],
        mistake: "Running Testcontainers tests without Docker installed — tests fail silently. Ensure Docker daemon is running and accessible.",
        shorthand: {
          verbose: "@Testcontainers\nclass OrderRepositoryTest {\n    @Container\n    static PostgreSQLContainer<?> db = new PostgreSQLContainer<>(\"postgres:15\");\n\n    @DynamicPropertySource\n    static void props(DynamicPropertyRegistry reg) {\n        reg.add(\"spring.datasource.url\", db::getJdbcUrl);\n    }\n}",
          concise: "@Testcontainers\n@SpringBootTest(properties = {\n    \"spring.datasource.url=jdbc:tc:postgresql:15:///test\"\n})\nclass OrderRepositoryTest { }",
        },
      },
      {
        id: "wiremock-basics",
        fn: "WireMock — HTTP Mocking for External APIs",
        desc: "Mock HTTP services in tests: stubFor, exact matching, regex, request/response transformation, scenarios.",
        category: "Spring Boot",
        subtitle: "stubFor(get/post), urlEqualTo, jsonPath matchers, willReturn(aResponse())",
        signature: "stubFor(get(urlEqualTo(\"/api/users/1\")).willReturn(aResponse().withStatus(200)))",
        descLong: "WireMock intercepts HTTP requests and returns stubbed responses. Useful for testing code that calls external APIs without actually calling them. More flexible than simple mocking — supports regex URL matching, request body matching, response delays, scenarios (stateful mocking). Can run as standalone server or embedded in tests. Spring Cloud Contract integrates with WireMock for contract testing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WireMock — HTTP Mocking for External APIs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport com.github.tomakehurst.wiremock.junit5.WireMockTest;\nimport com.github.tomakehurst.wiremock.junit5.WireMockExtension;\nimport static com.github.tomakehurst.wiremock.client.WireMock.*;\nimport static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WireMock — HTTP Mocking for External APIs — common patterns you'll see in production.\n// APPROACH  - Combine WireMock — HTTP Mocking for External APIs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Embedded WireMock (easiest) ──────────────────\n@WireMockTest(httpPort = 8080)\nclass UserApiClientTest {\n\n    private UserApiClient client;\n\n    @BeforeEach\n    void setUp() {\n        client = new UserApiClient(\"http://localhost:8080\");\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WireMock — HTTP Mocking for External APIs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Exact URL matching ───────────────────────────,    @Test,    void getUser_stubsExactMatch() {,        stubFor(get(urlEqualTo(\"/api/users/1\")),            .willReturn(aResponse(),                .withStatus(200),                .withHeader(\"Content-Type\", \"application/json\"),                .withBody(\"\"\",                    {\"id\":1,\"name\":\"Alice\",\"email\":\"alice@test.com\"},                    \"\"\")));,,        User user = client.getUser(1);,,        assertThat(user.getName()).isEqualTo(\"Alice\");,        verify(1, getRequestedFor(urlEqualTo(\"/api/users/1\")));,    },\n\n    // ── Regex URL matching ───────────────────────────,    @Test,    void getUser_regexMatch_anyId() {,        stubFor(get(urlMatching(\"/api/users/\\\\d+\")),            .willReturn(aResponse(),                .withStatus(200),                .withJsonBody(new User(1, \"Bob\", \"bob@test.com\"))));,,        User user1 = client.getUser(1);,        User user2 = client.getUser(999);,,        assertThat(user1.getId()).isEqualTo(1);,        assertThat(user2.getId()).isEqualTo(999);,    },\n\n    // ── Request body matching ────────────────────────,    @Test,    void createUser_matchesRequestBody() {,        stubFor(post(urlEqualTo(\"/api/users\")),            .withRequestBody(matchingJsonPath(\"$.email\", matching(\".*@test.com\"))),            .willReturn(aResponse(),                .withStatus(201),                .withJsonBody(new User(2, \"Carol\", \"carol@test.com\"))));,,        User created = client.createUser(\"carol@test.com\", \"Carol\");,,        assertThat(created.getId()).isEqualTo(2);,    },\n\n    // ── Stateful scenarios (stateful mocking) ────────,    @Test,    void scenario_orderLifecycle() {,        // Scenario: order starts as PENDING, then becomes CONFIRMED,        stubFor(get(urlEqualTo(\"/api/orders/123\")),            .inScenario(\"order-flow\"),            .whenScenarioStateIs(STARTED),            .willReturn(aResponse(),                .withStatus(200),                .withJsonBody(new Order(\"order-123\", \"PENDING\"))),            .willSetStateTo(\"order-confirmed\"));,,        stubFor(get(urlEqualTo(\"/api/orders/123\")),            .inScenario(\"order-flow\"),            .whenScenarioStateIs(\"order-confirmed\"),            .willReturn(aResponse(),                .withStatus(200),                .withJsonBody(new Order(\"order-123\", \"CONFIRMED\"))));,,        Order order1 = client.getOrder(\"123\");,        assertThat(order1.getStatus()).isEqualTo(\"PENDING\");,,        Order order2 = client.getOrder(\"123\");,        assertThat(order2.getStatus()).isEqualTo(\"CONFIRMED\");,    },\n\n    // ── Response delays (test timeouts) ──────────────,    @Test,    void slowAPI_delayedResponse() {,        stubFor(get(urlEqualTo(\"/api/slow\")),            .willReturn(aResponse(),                .withStatus(200),                .withFixedDelay(2000),                .withBody(\"Slow response\")));,,        long start = System.currentTimeMillis();,        String response = client.getSlow();,        long elapsed = System.currentTimeMillis() - start;,,        assertThat(response).isEqualTo(\"Slow response\");,        assertThat(elapsed).isGreaterThanOrEqualTo(2000);,    },\n\n    // ── Error responses ──────────────────────────────,    @Test,    void notFound_returnsErrorResponse() {,        stubFor(get(urlEqualTo(\"/api/users/999\")),            .willReturn(aResponse(),                .withStatus(404),                .withBody(\"User not found\")));,,        assertThrows(NotFoundException.class, () -> {,            client.getUser(999);,        });,    },}"
                  }
        ],
        tips: [
                  "stubFor() defines the stub before making the request — WireMock intercepts matching requests.",
                  "urlMatching(regex) is more flexible than urlEqualTo() — use for paths with dynamic IDs or query params.",
                  "Scenarios provide stateful mocking — first call returns PENDING, second returns CONFIRMED. Useful for simulating state transitions.",
                  "withFixedDelay() tests timeout handling — verify your client handles slow APIs gracefully."
        ],
        mistake: "Hardcoding URLs in stubs — use urlMatching(regex) to match dynamic IDs, query params, or port numbers.",
        shorthand: {
          verbose: "@RegisterExtension\nstatic WireMockExtension wireMock = WireMockExtension.newInstance()\n    .options(wireMockConfig().port(8080));",
          concise: "@WireMockTest\nclass ApiClientTest { // WireMock auto-starts on random port\n}",
        },
      },
    ],
  },

  // ── Section 4: Advanced Testing Techniques ─────────────────────────────────────────
  {
    id: "advanced-testing",
    title: "Advanced Testing Techniques",
    entries: [
      {
        id: "architecture-tests",
        fn: "ArchUnit — Architecture Rules & Constraints",
        desc: "Enforce architecture constraints in tests: ArchUnit checks dependencies, layering, naming conventions, and cycles.",
        category: "Advanced",
        subtitle: "ArchRule, SliceRule, noClasses().that().resideIn().should().dependOn()",
        signature: "noClasses().that().resideIn(\"..repository..\").should().dependOn(\"..controller..\")",
        descLong: "ArchUnit enforces architectural rules as unit tests. Define which layers can depend on which others, prevent cycles, enforce naming conventions (e.g., all @Controller classes must end with \"Controller\"), check for forbidden classes. Rules are checked at build time. Prevents architecture violations before code review — faster feedback than architecture committees. Integrates with JUnit 5.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ArchUnit — Architecture Rules & Constraints — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport com.tngtech.archunit.core.domain.JavaClasses;\nimport com.tngtech.archunit.core.importer.ClassFileImporter;\nimport com.tngtech.archunit.lang.ArchRule;\nimport static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.*;\nimport org.junit.jupiter.api.Test;\n\nclass ArchitectureTest {\n\n    private static final JavaClasses importedClasses =\n        new ClassFileImporter().importPackages(\"com.example\");"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ArchUnit — Architecture Rules & Constraints — common patterns you'll see in production.\n// APPROACH  - Combine ArchUnit — Architecture Rules & Constraints with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Layered architecture: controllers → service → repository ──\n    @Test\n    void serviceLayer_shouldNotDependOnControllers() {\n        ArchRule rule = noClasses()\n            .that()\n            .resideInAPackage(\"..service..\")\n            .should()\n            .dependOnClassesThat()\n            .resideInAPackage(\"..controller..\");\n\n        rule.check(importedClasses);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ArchUnit — Architecture Rules & Constraints — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Repository layer isolation ───────────────────,    @Test,    void repositoryLayer_shouldNotDependOnService() {,        ArchRule rule = noClasses(),            .that(),            .resideInAPackage(\"..repository..\"),            .should(),            .dependOnClassesThat(),            .resideInAPackage(\"..service..\");,,        rule.check(importedClasses);,    },\n\n    // ── Naming conventions ───────────────────────────,    @Test,    void controllerClasses_mustEndWithController() {,        ArchRule rule = classes(),            .that(),            .resideInAPackage(\"..controller..\"),            .should(),            .haveSimpleNameEndingWith(\"Controller\");,,        rule.check(importedClasses);,    },\n\n    // ── Service classes should be named Service ──────,    @Test,    void serviceClasses_shouldBeNamed() {,        ArchRule rule = classes(),            .that(),            .resideInAPackage(\"..service..\"),            .and(),            .areNotInterfaces(),            .should(),            .haveSimpleNameEndingWith(\"Service\");,,        rule.check(importedClasses);,    },\n\n    // ── Check for forbidden dependencies ─────────────,    @Test,    void noClassesShouldDependOnLogging() {,        ArchRule rule = noClasses(),            .should(),            .dependOnClassesThat(),            .resideInAnyPackage(\"java.util.logging\", \"org.apache.log4j\");,,        rule.check(importedClasses);,    },\n\n    // ── Detect cycles ────────────────────────────────,    @Test,    void noCycles_inDependencies() {,        ArchRule rule = noClasses(),            .should(),            .dependOnClassesThat(),            .dependOnClassesThat(),            .resideInAnyPackage(\"..service..\");,,        rule.check(importedClasses);,    },}"
                  }
        ],
        tips: [
                  "ArchRule violations are caught at build time — prevents architectural drift before code review.",
                  "Define rules for your codebase early — catches violations from new developers who might not know the structure.",
                  "Use package naming conventions (..controller, ..service, ..repository) to make rules clearer.",
                  "Rules are composable: chain .and(), .or() to express complex constraints."
        ],
        mistake: "Not using ArchUnit — let architecture degrade over time with no tests to prevent it. Rules as tests make expectations explicit and enforceable.",
        shorthand: {
          verbose: "ArchRule rule = noClasses()\n  .that()\n  .resideInAPackage(\"..service..\")\n  .should()\n  .dependOnClassesThat()\n  .resideInAPackage(\"..controller..\");\nrule.check(classes);",
          concise: "noClasses()\n  .that().resideIn(\"..service..\")\n  .should().dependOn(\"..controller..\")\n  .check(importedClasses);",
        },
      },
      {
        id: "mutation-testing",
        fn: "PITest — Mutation Testing & Code Coverage Quality",
        desc: "PITest mutates code to test test quality: kills mutants, survives means weak tests, improves coverage metrics.",
        category: "Advanced",
        subtitle: "mvn pitest:mutationCoverage, surviving mutants, mutation score",
        signature: "mvn pitest:mutationCoverage  |  PIT Report mutation score > 90%",
        descLong: "PITest mutates Java code (e.g., change > to >=) and re-runs tests. If tests fail, mutant is killed (good). If tests pass, mutant survives (bad test). Code coverage 100% does not mean good tests — you can have all code covered but weak assertions. Mutation score is a better metric than code coverage. Requires tests to run separately (Maven Failsafe, not Surefire) to isolate mutation testing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of PITest — Mutation Testing & Code Coverage Quality — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n<!-- pom.xml — PITest setup ────────────────────── -->\n<plugin>\n    <groupId>org.pitest</groupId>\n    <artifactId>pitest-maven</artifactId>\n    <version>1.14.2</version>\n    <configuration>\n        <!-- Classes to mutate (your code) -->\n        <targetClasses>\n            <param>com.example.*</param>\n        </targetClasses>\n        <!-- Test classes -->\n        <targetTests>\n            <param>com.example.*Test</param>\n        </targetTests>\n        <!-- Mutation operators to use -->\n        <mutators>\n            <mutator>DEFAULTS</mutator>\n        </mutators>\n        <!-- Minimum mutation score to pass -->\n        <mutationThreshold>85</mutationThreshold>\n    </configuration>\n</plugin>\n\n<!-- Example test that passes PITest ────────────────── -->\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\nclass CalculatorTest {\n\n    @Test\n    void add_validNumbers_returnsSum() {\n        Calculator calc = new Calculator();\n\n        assertEquals(4, calc.add(2, 2));  // Mutation: change == to !=  →  test fails (mutant killed) ✓\n        assertEquals(5, calc.add(2, 3));  // Additional cases prevent mutations from sneaking through\n        assertEquals(0, calc.add(-2, 2)); // Edge case catches more mutants\n    }\n\n    @Test\n    void divide_byZero_throwsException() {\n        Calculator calc = new Calculator();\n\n        assertThrows(ArithmeticException.class, () -> calc.divide(10, 0));\n        // Without this test, a missing null-check might survive mutation\n    }\n\n    @Test\n    void isPositive_negativeNumber_returnsFalse() {\n        assertFalse(Calculator.isPositive(-1));  // Test false case\n        assertTrue(Calculator.isPositive(1));    // Test true case\n        assertFalse(Calculator.isPositive(0));   // Test boundary\n        // Mutations: > → >=, > → <, etc. all caught\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of PITest — Mutation Testing & Code Coverage Quality — common patterns you'll see in production.\n// APPROACH  - Combine PITest — Mutation Testing & Code Coverage Quality with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Class under test ────────────────────────────\npublic class Calculator {\n    public int add(int a, int b) {\n        return a + b;  // Mutation: change + to - would be caught\n    }\n\n    public int divide(int a, int b) {\n        if (b == 0) throw new ArithmeticException(\"Division by zero\");\n        return a / b;\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of PITest — Mutation Testing & Code Coverage Quality — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\npublic static boolean isPositive(int n) {\n        return n > 0;  // Mutation: change > to >= would be caught\n    }\n}"
                  }
        ],
        tips: [
                  "PITest catches weak tests that have high code coverage — mutation score is more meaningful than coverage %.",
                  "Run mutation testing in CI/CD — enforce minimum mutation score (85-90%) to prevent quality regressions.",
                  "Focus on boundary cases and both true/false assertions — these catch most mutations.",
                  "PITest is slow (10-50x slower than regular tests) — run only in CI, not local dev loop."
        ],
        mistake: "Relying on code coverage alone — 100% coverage with only positive assertions means weak tests. Mutation testing reveals the truth.",
        shorthand: {
          verbose: "<plugin>\n  <groupId>org.pitest</groupId>\n  <artifactId>pitest-maven</artifactId>\n  <version>1.14.2</version>\n</plugin>\n<!-- mvn pitest:mutationCoverage -->",
          concise: "mvn pitest:mutationCoverage\n# Report in target/pit-reports/index.html",
        },
      },
      {
        id: "test-fixtures",
        fn: "Test Data Builders & Fixtures",
        desc: "Build test data cleanly: Builder pattern for test objects, @Sql for DB fixtures, Factory methods, Test Data Builders.",
        category: "Advanced",
        subtitle: "Builder pattern, Test Data Builders, @Sql, DbUnit, Faker for realistic test data",
        signature: "new UserBuilder().withEmail(\"a@b.com\").withAge(30).build()  |  @Sql(\"/fixtures/users.sql\")",
        descLong: "Test fixtures are the setup data needed for tests. Builder pattern creates test objects cleanly — avoid huge constructor calls or setters scattered in tests. @Sql loads SQL files to populate databases. DbUnit provides XML-based fixtures. Faker generates realistic fake data (emails, names, addresses). Clean fixtures make tests readable and maintainable — the test explains itself.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Test Data Builders & Fixtures — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport org.junit.jupiter.api.Test;\nimport org.springframework.test.context.jdbc.Sql;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Test Data Builders & Fixtures — common patterns you'll see in production.\n// APPROACH  - Combine Test Data Builders & Fixtures with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Builder pattern for test data ────────────────\nclass UserBuilder {\n    private String name = \"Test User\";\n    private String email = \"test@example.com\";\n    private int age = 25;\n    private boolean active = true;\n\n    public UserBuilder withName(String name) {\n        this.name = name;\n        return this;\n    }\n\n    public UserBuilder withEmail(String email) {\n        this.email = email;\n        return this;\n    }\n\n    public UserBuilder withAge(int age) {\n        this.age = age;\n        return this;\n    }\n\n    public UserBuilder inactive() {\n        this.active = false;\n        return this;\n    }\n\n    public User build() {\n        return new User(null, name, email, age, active);\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Test Data Builders & Fixtures — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Using the builder in tests ───────────────────,class UserServiceTest {,,    @Test,    void createUser_validData_succeeds() {,        User user = new UserBuilder(),            .withEmail(\"alice@test.com\"),            .withAge(30),            .build();,,        User created = service.createUser(user);,,        assertThat(created).isNotNull();,    },,    @Test,    void inactiveUser_isSkipped() {,        User inactive = new UserBuilder(),            .inactive(),            .build();,,        var result = service.findActive();,,        assertThat(result).doesNotContain(inactive);,    },},\n\n// ── @Sql for database fixtures ───────────────────,@DataJpaTest,@Sql(\"/fixtures/users.sql\")  // Loads SQL before test,class UserRepositoryTest {,,    @Autowired,    private UserRepository repo;,,    @Test,    void findAll_loadsFixtureData() {,        var users = repo.findAll();,\n\n        // users.sql inserted test data,        assertThat(users).hasSize(3);,    },,    @Test,    @Sql(\"/fixtures/additional-users.sql\")  // Additional data for this test,    void findByRole_loadsFixtureData() {,        var admins = repo.findByRole(\"ADMIN\");,        assertThat(admins).hasSize(2);,    },},\n\n// ── Faker for realistic test data ────────────────,// Add dependency: com.github.javafaker:javafaker,,import com.github.javafaker.Faker;,,class OrderServiceTest {,,    private final Faker faker = new Faker();,,    @Test,    void createOrder_randomData_succeeds() {,        String userEmail = faker.internet().emailAddress();,        String productName = faker.commerce().productName();,        double price = Double.parseDouble(faker.commerce().price());,,        Order order = service.createOrder(,            userEmail,,            productName,,            price,        );,,        assertThat(order.getId()).isNotNull();,    },\n\n    // Generate 100 realistic orders,    @ParameterizedTest,    @MethodSource(\"generateRandomOrders\"),    void bulkOrderProcessing_randomData_succeeds(Order order) {,        Order processed = service.process(order);,        assertThat(processed.getStatus()).isEqualTo(\"PROCESSED\");,    },,    static Stream<Order> generateRandomOrders() {,        Faker faker = new Faker();,        return Stream.generate(() ->,            new Order(,                faker.internet().emailAddress(),,                faker.commerce().productName(),,                Double.parseDouble(faker.commerce().price()),            ),        ).limit(100);,    },}"
                  }
        ],
        tips: [
                  "Builder pattern is cleaner than big constructors — makes test intent clear and supports optional fields.",
                  "@Sql loads fixtures before each test — use for repository tests needing pre-populated data.",
                  "Faker generates realistic test data — good for property-based testing and performance tests with varied inputs.",
                  "Test fixtures should be immutable — use builders or factory methods, not setters in tests."
        ],
        mistake: "Hardcoding all test data directly in tests — use builders and factories. It clutters the test and obscures intent.",
        shorthand: {
          verbose: "User user = new User();\nuser.setName(\"Alice\");\nuser.setEmail(\"alice@test.com\");\nuser.setAge(30);\nuser.setActive(true);",
          concise: "User user = new UserBuilder()\n  .withName(\"Alice\")\n  .withEmail(\"alice@test.com\")\n  .withAge(30)\n  .build();",
        },
      },
    ],
  },
]

export default { meta, sections }
