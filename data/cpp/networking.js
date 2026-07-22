export const meta = {
  "id": "networking",
  "label": "Networking & Serialization",
  "icon": "🌐",
  "description": "C++ networking: sockets, HTTP clients, REST APIs, JSON serialization, and protocol buffers."
}

export const sections = [

  // ── Section 1: Sockets & HTTP Clients ─────────────────────────────────────────
  {
    id: "sockets-http",
    title: "Sockets & HTTP Clients",
    entries: [
      {
        id: "boost-asio",
        fn: "Boost.Asio — Asynchronous Networking",
        desc: "Cross-platform async networking with Boost.Asio: TCP/UDP sockets, timers, and the proactor pattern.",
        category: "Networking",
        subtitle: "io_context, tcp::socket, async_read, async_write, co_await",
        signature: "asio::io_context io  |  tcp::socket sock(io)  |  co_await async_read(sock, buf)",
        descLong: "Boost.Asio (also available standalone as asio) is the standard C++ networking library. It uses the proactor pattern: you initiate async operations and provide completion handlers. io_context runs the event loop. TCP and UDP sockets support both sync and async I/O. C++20 coroutines integrate with Asio for readable async code. Asio is the basis for the proposed C++ Networking TS and is used by Beast (HTTP/WebSocket), gRPC, and many production systems.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Boost.Asio — Asynchronous Networking — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Boost.Asio TCP echo server (coroutines) ────────\n#include <boost/asio.hpp>\n#include <boost/asio/co_spawn.hpp>\n#include <boost/asio/detached.hpp>\n#include <iostream>\n\nnamespace asio = boost::asio;\nusing tcp = asio::ip::tcp;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Boost.Asio — Asynchronous Networking — common patterns you'll see in production.\n// APPROACH  - Combine Boost.Asio — Asynchronous Networking with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Coroutine-based session handler\nasio::awaitable<void> handle_session(tcp::socket socket) {\n    try {\n        char buf[1024];\n        for (;;) {\n            // Async read — suspends coroutine until data arrives\n            auto n = co_await socket.async_read_some(\n                asio::buffer(buf), asio::use_awaitable);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Boost.Asio — Asynchronous Networking — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Echo back,            co_await async_write(,                socket, asio::buffer(buf, n), asio::use_awaitable);,        },    } catch (std::exception& e) {,        std::cerr << \"Session error: \" << e.what() << \"\\n\";,    },},\n\n// Coroutine-based acceptor,asio::awaitable<void> listener(tcp::acceptor acceptor) {,    for (;;) {,        auto socket = co_await acceptor.async_accept(asio::use_awaitable);,        // Spawn a new coroutine for each connection,        co_spawn(acceptor.get_executor(),,                 handle_session(std::move(socket)),,                 asio::detached);,    },},,int main() {,    asio::io_context io;,,    tcp::acceptor acceptor(io, {tcp::v4(), 8080});,    co_spawn(io, listener(std::move(acceptor)), asio::detached);,,    std::cout << \"Listening on port 8080\\n\";,    io.run();  // Run the event loop,},\n\n// ── Async TCP client (coroutine) ───────────────────,asio::awaitable<std::string> fetch(,    asio::io_context& io,,    const std::string& host, const std::string& port),{,    tcp::resolver resolver(io);,    auto endpoints = co_await resolver.async_resolve(,        host, port, asio::use_awaitable);,,    tcp::socket socket(io);,    co_await asio::async_connect(,        socket, endpoints, asio::use_awaitable);,,    std::string request = \"GET / HTTP/1.1\\r\\nHost: \" + host + \"\\r\\n\\r\\n\";,    co_await async_write(,        socket, asio::buffer(request), asio::use_awaitable);,,    std::string response;,    asio::streambuf buf;,    co_await asio::async_read_until(,        socket, buf, \"\\r\\n\", asio::use_awaitable);,,    std::istream is(&buf);,    std::getline(is, response);,    co_return response;,},\n\n// ── UDP datagram example ───────────────────────────,// udp::socket sock(io, udp::endpoint(udp::v4(), 9000));,// udp::endpoint sender;,// auto n = co_await sock.async_receive_from(,//     asio::buffer(buf), sender, asio::use_awaitable);,// co_await sock.async_send_to(,//     asio::buffer(buf, n), sender, asio::use_awaitable);,\n\n// CMake: find_package(Boost REQUIRED COMPONENTS system),// target_link_libraries(app PRIVATE Boost::system)"
                  }
        ],
        tips: [
                  "Use C++20 coroutines with asio::use_awaitable — readable async code without callback hell or complex state machines.",
                  "co_spawn() launches a coroutine on the executor — use asio::detached for fire-and-forget sessions.",
                  "io_context::run() blocks and processes all async operations — call it from your main thread or a thread pool.",
                  "Standalone Asio (no Boost) is available — just use asio:: namespace instead of boost::asio::."
        ],
        mistake: "Calling io.run() from multiple threads without strand synchronization — shared resources (sockets, state) need asio::strand to serialize access across threads.",
        shorthand: {
          verbose: "// Manual / verbose approach\nsocket.async_connect(endpoint, [](const error_code& ec) { if (!ec) { /* connected */ } });\n// More explicit but longer",
          concise: "asio::co_spawn(executor, [](){ co_await socket.async_connect(endpoint); }, detached);",
        },
      },
      {
        id: "http-clients",
        fn: "HTTP Clients — cpr, Beast & httplib",
        desc: "Make HTTP requests in C++: cpr (curl wrapper), Beast (Boost HTTP/WebSocket), and cpp-httplib (header-only).",
        category: "Networking",
        subtitle: "cpr::Get, Beast::http, httplib::Client, REST APIs",
        signature: "cpr::Get(cpr::Url{\"...\"})  |  httplib::Client cli(\"host\")  |  beast::http::request<>",
        descLong: "C++ HTTP clients range from simple to feature-rich. cpr is a modern curl wrapper with a Python-requests-like API — the easiest option. cpp-httplib is header-only and works for simple GET/POST. Beast (Boost.Beast) provides low-level HTTP/WebSocket on top of Asio — maximum control and performance. For REST APIs, combine any of these with nlohmann/json for request/response serialization.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of HTTP Clients — cpr, Beast & httplib — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── cpr — simple HTTP (like Python requests) ───────\n#include <cpr/cpr.h>\n#include <iostream>\n\nvoid cpr_examples() {\n    // GET request\n    auto r = cpr::Get(\n        cpr::Url{\"https://api.example.com/users\"},\n        cpr::Header{{\"Authorization\", \"Bearer token123\"}},\n        cpr::Parameters{{\"page\", \"1\"}, {\"limit\", \"10\"}}\n    );\n\n    std::cout << \"Status: \" << r.status_code << \"\\n\";\n    std::cout << \"Body: \" << r.text << \"\\n\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of HTTP Clients — cpr, Beast & httplib — common patterns you'll see in production.\n// APPROACH  - Combine HTTP Clients — cpr, Beast & httplib with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// POST with JSON body\n    auto post = cpr::Post(\n        cpr::Url{\"https://api.example.com/users\"},\n        cpr::Header{{\"Content-Type\", \"application/json\"}},\n        cpr::Body{R\"({\"name\": \"Alice\", \"email\": \"alice@example.com\"})\"}\n    );"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of HTTP Clients — cpr, Beast & httplib — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// POST with form data,    auto form = cpr::Post(,        cpr::Url{\"https://api.example.com/upload\"},,        cpr::Multipart{,            {\"file\", cpr::File{\"photo.jpg\"}},,            {\"description\", \"Profile photo\"},        },    );,\n\n    // Async request,    auto future = cpr::GetAsync(,        cpr::Url{\"https://api.example.com/data\"},    );,    auto response = future.get();  // blocks until done,\n\n    // Timeout & retries,    auto safe = cpr::Get(,        cpr::Url{\"https://api.example.com/data\"},,        cpr::Timeout{5000},  // 5 second timeout,        cpr::VerifySsl{true},    );,},\n\n// CMake: FetchContent_Declare(cpr GIT_REPOSITORY https://github.com/libcpr/cpr.git),// target_link_libraries(app PRIVATE cpr::cpr),\n\n// ── cpp-httplib — header-only, zero dependencies ───,#include <httplib.h>,,void httplib_examples() {,    httplib::Client cli(\"https://api.example.com\");,,    auto res = cli.Get(\"/users?page=1\");,    if (res && res->status == 200) {,        std::cout << res->body << \"\\n\";,    },\n\n    // POST JSON,    cli.Post(\"/users\",,        R\"({\"name\": \"Bob\"})\",,        \"application/json\");,\n\n    // Simple HTTP server (for testing / internal APIs),    httplib::Server svr;,    svr.Get(\"/hello\", [](const httplib::Request&, httplib::Response& res) {,        res.set_content(\"Hello!\", \"text/plain\");,    });,    svr.listen(\"0.0.0.0\", 8080);,},\n\n// Just: #include \"httplib.h\" — single header, no build needed"
                  }
        ],
        tips: [
                  "cpr is the easiest C++ HTTP library — if you just need REST API calls, start here.",
                  "cpp-httplib is header-only (single file) — perfect for quick prototypes or when you cannot add build dependencies.",
                  "Beast is for high-performance servers and WebSocket — overkill for simple REST API clients.",
                  "Always set timeouts on HTTP requests — network calls without timeouts can hang your application indefinitely."
        ],
        mistake: "Using raw libcurl in C++ — the C API is error-prone (manual cleanup, string handling). Use cpr which wraps curl with RAII, modern C++ types, and a clean API.",
        shorthand: {
          verbose: "CURL* curl = curl_easy_init();\ncurl_easy_setopt(curl, CURLOPT_URL, url);\ncurl_easy_perform(curl);",
          concise: "auto response = co_await http_client.get(url);\nstd::string body = response.body();",
        },
      },
      {
        id: "bsd-sockets",
        fn: "BSD Sockets — Low-Level Socket Programming",
        desc: "Low-level socket API: socket(), bind(), listen(), accept(), connect() for TCP client/server.",
        category: "Networking",
        subtitle: "socket(), bind(), listen(), accept(), connect(), TCP server/client",
        signature: "int sock = socket(AF_INET, SOCK_STREAM, 0)  |  bind(sock, ...)  |  listen(sock, backlog)  |  accept()",
        descLong: "BSD sockets are the foundational API for network programming on Unix/Linux/Windows. socket() creates an endpoint; bind() assigns an address; listen() marks as server; accept() waits for connections; connect() initiates client connections. Low-level but portable — use for custom protocols or when you need absolute control. For most applications, prefer Asio or cpr which build on sockets with better abstractions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of BSD Sockets — Low-Level Socket Programming — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── TCP server with BSD sockets ─────────────────────\n#include <sys/socket.h>\n#include <netinet/in.h>\n#include <arpa/inet.h>\n#include <unistd.h>\n#include <cstring>\n#include <iostream>\n\nvoid tcp_server() {\n    // Create socket\n    int server_fd = socket(AF_INET, SOCK_STREAM, 0);\n    if (server_fd < 0) {\n        perror(\"socket\");\n        return;\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of BSD Sockets — Low-Level Socket Programming — common patterns you'll see in production.\n// APPROACH  - Combine BSD Sockets — Low-Level Socket Programming with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Allow reuse of address\n    int opt = 1;\n    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR,\n               &opt, sizeof(opt));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of BSD Sockets — Low-Level Socket Programming — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Bind to address,    sockaddr_in addr{};,    addr.sin_family = AF_INET;,    addr.sin_addr.s_addr = htonl(INADDR_ANY);,    addr.sin_port = htons(8080);,,    if (bind(server_fd, (struct sockaddr*)&addr, sizeof(addr)) < 0) {,        perror(\"bind\");,        close(server_fd);,        return;,    },\n\n    // Listen for connections,    if (listen(server_fd, 5) < 0) {,        perror(\"listen\");,        close(server_fd);,        return;,    },,    std::cout << \"Listening on port 8080\\n\";,\n\n    // Accept and handle connections,    sockaddr_in client_addr{};,    socklen_t client_len = sizeof(client_addr);,,    while (true) {,        int client_fd = accept(server_fd,,            (struct sockaddr*)&client_addr, &client_len);,        if (client_fd < 0) {,            perror(\"accept\");,            continue;,        },\n\n        // Echo server: read and write back,        char buffer[1024];,        while (true) {,            ssize_t n = read(client_fd, buffer, sizeof(buffer));,            if (n <= 0) break;,            write(client_fd, buffer, n);,        },,        close(client_fd);,    },,    close(server_fd);,},\n\n// ── TCP client with BSD sockets ──────────────────────,void tcp_client() {,    int sock = socket(AF_INET, SOCK_STREAM, 0);,    if (sock < 0) {,        perror(\"socket\");,        return;,    },,    sockaddr_in addr{};,    addr.sin_family = AF_INET;,    addr.sin_port = htons(8080);,    inet_pton(AF_INET, \"127.0.0.1\", &addr.sin_addr);,,    if (connect(sock, (struct sockaddr*)&addr, sizeof(addr)) < 0) {,        perror(\"connect\");,        close(sock);,        return;,    },,    const char* msg = \"Hello, server!\";,    write(sock, msg, strlen(msg));,,    char buffer[1024];,    ssize_t n = read(sock, buffer, sizeof(buffer));,    std::cout << \"Received: \";,    std::cout.write(buffer, n);,,    close(sock);,}"
                  }
        ],
        tips: [
                  "Always call close() on sockets — leaking file descriptors exhausts system resources.",
                  "Set SO_REUSEADDR on the listening socket — allows immediate restart after shutdown.",
                  "Use htonl/htons for byte order conversion — ensures portable network byte order.",
                  "For portable code across Windows/Unix, consider wrapping in a thin abstraction or use Asio."
        ],
        mistake: "Not checking return values from socket API calls — error handling is essential. Every socket call can fail.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n// ── TCP server with BSD sockets ─────────────────────\n#include <sys/socket.h>\n#include <netinet/in.h>\n#include <arpa/inet.h>\n#include <unistd.h>\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
      {
        id: "select-epoll",
        fn: "I/O Multiplexing — select(), poll(), epoll()",
        desc: "Multiplexing: select() portable, poll() better, epoll()/kqueue for high performance.",
        category: "Networking",
        subtitle: "select(), poll(), epoll_create(), epoll_ctl(), epoll_wait()",
        signature: "select(nfds, &readfds, NULL, NULL, &tv)  |  poll(fds, nfds, timeout)  |  epoll_wait(epfd, events, maxevents, timeout)",
        descLong: "I/O multiplexing allows a single thread to monitor many sockets. select() is portable but has O(n) complexity. poll() is similar but scales better. epoll (Linux) and kqueue (BSD) are O(1) event notification — designed for thousands of concurrent connections. Use epoll/kqueue for production servers; select for simple cases or portability.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of I/O Multiplexing — select(), poll(), epoll() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── epoll example (Linux, high performance) ────────\n#include <sys/epoll.h>\n#include <sys/socket.h>\n#include <netinet/in.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <cstring>\n#include <iostream>\n\nvoid epoll_server() {\n    // Create listening socket\n    int listen_fd = socket(AF_INET, SOCK_STREAM, 0);\n    int opt = 1;\n    setsockopt(listen_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));\n\n    sockaddr_in addr{};\n    addr.sin_family = AF_INET;\n    addr.sin_addr.s_addr = htonl(INADDR_ANY);\n    addr.sin_port = htons(8080);\n    bind(listen_fd, (struct sockaddr*)&addr, sizeof(addr));\n    listen(listen_fd, 5);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of I/O Multiplexing — select(), poll(), epoll() — common patterns you'll see in production.\n// APPROACH  - Combine I/O Multiplexing — select(), poll(), epoll() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Make non-blocking\n    fcntl(listen_fd, F_SETFL, O_NONBLOCK);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of I/O Multiplexing — select(), poll(), epoll() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Create epoll,    int epfd = epoll_create1(0);,    epoll_event event;,    event.events = EPOLLIN;,    event.data.fd = listen_fd;,    epoll_ctl(epfd, EPOLL_CTL_ADD, listen_fd, &event);,,    epoll_event events[64];,,    while (true) {,        // Wait for events on any monitored fd,        int nfds = epoll_wait(epfd, events, 64, -1);,,        for (int i = 0; i < nfds; ++i) {,            if (events[i].data.fd == listen_fd) {,                // Accept new connection,                sockaddr_in client_addr;,                socklen_t client_len = sizeof(client_addr);,                int client_fd = accept(listen_fd,,                    (struct sockaddr*)&client_addr, &client_len);,                if (client_fd >= 0) {,                    fcntl(client_fd, F_SETFL, O_NONBLOCK);,                    epoll_event ev;,                    ev.events = EPOLLIN;,                    ev.data.fd = client_fd;,                    epoll_ctl(epfd, EPOLL_CTL_ADD, client_fd, &ev);,                },            } else {,                // Data available on client socket,                char buffer[1024];,                ssize_t n = read(events[i].data.fd, buffer, sizeof(buffer));,                if (n > 0) {,                    write(events[i].data.fd, buffer, n);,                } else {,                    epoll_ctl(epfd, EPOLL_CTL_DEL, events[i].data.fd, NULL);,                    close(events[i].data.fd);,                },            },        },    },,    close(epfd);,    close(listen_fd);,}"
                  }
        ],
        tips: [
                  "epoll is Linux-specific; use kqueue on BSD/macOS, IOCP on Windows, or Asio for portability.",
                  "Always set sockets to non-blocking mode with epoll — blocking calls defeat the multiplexing advantage.",
                  "EPOLLET (edge-triggered) vs EPOLLLT (level-triggered) — level-triggered is safer for beginners.",
                  "epoll can monitor thousands of sockets in a single thread — ideal for I/O-bound servers."
        ],
        mistake: "Using select() for servers expecting >1000 concurrent connections — use epoll or kqueue instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n// ── epoll example (Linux, high performance) ────────\n#include <sys/epoll.h>\n#include <sys/socket.h>\n#include <netinet/in.h>\n#include <fcntl.h>\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
      {
        id: "socket-options",
        fn: "Socket Options — setsockopt() & getsockopt()",
        desc: "Control socket behavior: SO_REUSEADDR, SO_KEEPALIVE, TCP_NODELAY, SO_RCVTIMEO, etc.",
        category: "Networking",
        subtitle: "setsockopt(), SO_REUSEADDR, SO_KEEPALIVE, TCP_NODELAY, timeouts",
        signature: "setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt))  |  setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, ...)",
        descLong: "Socket options configure socket behavior via setsockopt()/getsockopt(). SO_REUSEADDR allows immediate restart. SO_KEEPALIVE sends periodic probes. TCP_NODELAY disables Nagle (send immediately, no buffering). SO_RCVTIMEO/SO_SNDTIMEO set read/write timeouts. SO_RCVBUF/SO_SNDBUF tune buffer sizes. SO_LINGER controls close behavior.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Socket Options — setsockopt() & getsockopt() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Socket options examples ──────────────────────\n#include <sys/socket.h>\n#include <netinet/in.h>\n#include <netinet/tcp.h>\n#include <iostream>\n\nvoid socket_options_examples(int sock) {\n    // ── SO_REUSEADDR: allow reuse of address/port ────\n    // Useful after server restart\n    int opt = 1;\n    setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Socket Options — setsockopt() & getsockopt() — common patterns you'll see in production.\n// APPROACH  - Combine Socket Options — setsockopt() & getsockopt() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── SO_KEEPALIVE: detect dead connections ────────\n    // Sends TCP keep-alive probes every ~2 hours by default\n    int keepalive = 1;\n    setsockopt(sock, SOL_SOCKET, SO_KEEPALIVE, &keepalive, sizeof(keepalive));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Socket Options — setsockopt() & getsockopt() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Fine-tune keep-alive timing (Linux),    int tcp_keepidle = 60;      // first probe after 60s,    int tcp_keepintvl = 10;     // probe every 10s,    int tcp_keepcnt = 5;        // fail after 5 probes,    setsockopt(sock, IPPROTO_TCP, TCP_KEEPIDLE, &tcp_keepidle, sizeof(tcp_keepidle));,    setsockopt(sock, IPPROTO_TCP, TCP_KEEPINTVL, &tcp_keepintvl, sizeof(tcp_keepintvl));,    setsockopt(sock, IPPROTO_TCP, TCP_KEEPCNT, &tcp_keepcnt, sizeof(tcp_keepcnt));,\n\n    // ── TCP_NODELAY: disable Nagle's algorithm ──────,    // Send data immediately without waiting for more data,    int nodelay = 1;,    setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, &nodelay, sizeof(nodelay));,\n\n    // ── SO_RCVTIMEO / SO_SNDTIMEO: read/write timeouts,    struct timeval timeout;,    timeout.tv_sec = 5;     // 5 seconds,    timeout.tv_usec = 0;,    setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));,    setsockopt(sock, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));,\n\n    // ── SO_RCVBUF / SO_SNDBUF: buffer sizes ────────,    int rcvbuf = 64 * 1024;    // 64 KB receive buffer,    int sndbuf = 64 * 1024;    // 64 KB send buffer,    setsockopt(sock, SOL_SOCKET, SO_RCVBUF, &rcvbuf, sizeof(rcvbuf));,    setsockopt(sock, SOL_SOCKET, SO_SNDBUF, &sndbuf, sizeof(sndbuf));,\n\n    // ── SO_LINGER: control close() behavior ────────,    struct linger linger_opt;,    linger_opt.l_onoff = 1;    // enable SO_LINGER,    linger_opt.l_linger = 5;   // wait 5 seconds for data to flush,    setsockopt(sock, SOL_SOCKET, SO_LINGER, &linger_opt, sizeof(linger_opt));,\n\n    // ── getsockopt: read current option value ───────,    int current_nodelay;,    socklen_t len = sizeof(current_nodelay);,    getsockopt(sock, IPPROTO_TCP, TCP_NODELAY, &current_nodelay, &len);,    std::cout << \"TCP_NODELAY: \" << current_nodelay << \"\\n\";,}"
                  }
        ],
        tips: [
                  "SO_REUSEADDR on listening sockets prevents \"Address already in use\" after restart.",
                  "TCP_NODELAY is crucial for latency-sensitive applications (trading, interactive systems).",
                  "SO_KEEPALIVE detects dead connections — valuable for long-lived connections in unreliable networks.",
                  "Buffer sizes (SO_RCVBUF, SO_SNDBUF) affect throughput — increase for high-bandwidth, high-latency networks."
        ],
        mistake: "Ignoring socket options — defaults are not optimized for all use cases. Tune for your application.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n// ── Socket options examples ──────────────────────\n#include <sys/socket.h>\n#include <netinet/in.h>\n#include <netinet/tcp.h>\n#include <iostream>\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
      {
        id: "asio-io-context",
        fn: "Asio Fundamentals — io_context & async_read/async_write",
        desc: "Asio basics: io_context event loop, async read/write, proactor pattern.",
        category: "Networking",
        subtitle: "io_context, async_read, async_write, co_await, handlers",
        signature: "asio::io_context io  |  co_await async_read(sock, buf, use_awaitable)  |  io.run()",
        descLong: "io_context is the event loop at Asio's core. It manages async operations and runs completion handlers. async_read/async_write initiate I/O and invoke a handler when complete. C++20 coroutines with co_await provide readable async code. The proactor pattern: you request an operation and get notified on completion.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Asio Fundamentals — io_context & async_read/async_write — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Asio io_context and async operations ────────\n#include <boost/asio.hpp>\n#include <iostream>\n\nnamespace asio = boost::asio;\nusing tcp = asio::ip::tcp;\n\nvoid async_read_example() {\n    asio::io_context io;\n\n    tcp::socket sock(io);\n    // Connect to server (simplified)\n    asio::ip::tcp::endpoint ep(\n        asio::ip::make_address(\"127.0.0.1\"), 8080);\n\n    asio::buffer buf(1024);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Asio Fundamentals — io_context & async_read/async_write — common patterns you'll see in production.\n// APPROACH  - Combine Asio Fundamentals — io_context & async_read/async_write with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Async read with callback\n    asio::async_read(sock, buf,\n        [](const asio::error_code& ec, std::size_t bytes_transferred) {\n            if (!ec) {\n                std::cout << \"Read \" << bytes_transferred << \" bytes\\n\";\n            }\n        });\n\n    io.run();  // Run event loop — processes all async ops\n}\n\nvoid async_write_example() {\n    asio::io_context io;\n    tcp::socket sock(io);\n\n    std::string msg = \"Hello, Asio!\";\n\n    asio::async_write(sock, asio::buffer(msg),\n        [](const asio::error_code& ec, std::size_t bytes) {\n            if (!ec) {\n                std::cout << \"Wrote \" << bytes << \" bytes\\n\";\n            }\n        });\n\n    io.run();\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Asio Fundamentals — io_context & async_read/async_write — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── C++20 coroutine with co_await ──────────────────,asio::awaitable<void> async_echo_coroutine(tcp::socket sock) {,    try {,        char buf[1024];,        while (true) {,            auto n = co_await asio::async_read_some(,                sock, asio::buffer(buf), asio::use_awaitable);,            co_await asio::async_write(,                sock, asio::buffer(buf, n), asio::use_awaitable);,        },    } catch (std::exception& e) {,        std::cerr << e.what() << \"\\n\";,    },}"
                  }
        ],
        tips: [
                  "io.run() blocks — call from a dedicated thread or use io.poll() for non-blocking checks.",
                  "C++20 co_await with use_awaitable is cleaner than callback-based handlers.",
                  "Each io_context has one thread of execution — use a thread pool or multiple io_contexts for parallelism."
        ],
        mistake: "Calling blocking I/O operations inside async callbacks — defeats async. Use async operations throughout.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n// ── Asio io_context and async operations ────────\n#include <boost/asio.hpp>\n#include <iostream>\nnamespace asio = boost::asio;\nusing tcp = asio::ip::tcp;\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
      {
        id: "asio-tcp-server",
        fn: "Asio TCP Server — Acceptor, Sessions & Strand",
        desc: "Async TCP server with Asio: acceptor for incoming connections, sessions per client, strand for thread safety.",
        category: "Networking",
        subtitle: "tcp::acceptor, session handling, strand<executor>, multi-threaded safety",
        signature: "tcp::acceptor(io, endpoint)  |  async_accept()  |  asio::strand<executor>",
        descLong: "Build async TCP servers with acceptor (listens for connections) and spawn a session coroutine per client. Use strand to serialize handler execution — ensures thread-safe access to shared resources without locks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Asio TCP Server — Acceptor, Sessions & Strand — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Asio TCP server with coroutines and strand ───\n#include <boost/asio.hpp>\n#include <iostream>\n#include <memory>\n\nnamespace asio = boost::asio;\nusing tcp = asio::ip::tcp;\n\nclass Session : public std::enable_shared_from_this<Session> {\n    tcp::socket socket_;\n    asio::strand<asio::io_context::executor_type> strand_;\n    char buffer_[1024];\n\npublic:\n    Session(asio::io_context& io, tcp::socket sock)\n        : socket_(std::move(sock)), strand_(io.get_executor()) {}\n\n    void start() {\n        asio::co_spawn(\n            strand_,\n            [self = shared_from_this()]() {\n                return self->session_loop();\n            },\n            asio::detached);\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Asio TCP Server — Acceptor, Sessions & Strand — common patterns you'll see in production.\n// APPROACH  - Combine Asio TCP Server — Acceptor, Sessions & Strand with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nprivate:\n    asio::awaitable<void> session_loop() {\n        try {\n            for (;;) {\n                auto n = co_await asio::async_read_some(\n                    socket_, asio::buffer(buffer_),\n                    asio::use_awaitable);\n\n                co_await asio::async_write(\n                    socket_, asio::buffer(buffer_, n),\n                    asio::use_awaitable);\n            }\n        } catch (std::exception& e) {\n            std::cerr << \"Session error: \" << e.what() << \"\\n\";\n        }\n    }\n};\n\nclass Server {\n    asio::io_context io_;\n    tcp::acceptor acceptor_;\n\npublic:\n    Server(uint16_t port)\n        : acceptor_(io_, {tcp::v4(), port}) {}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Asio TCP Server — Acceptor, Sessions & Strand — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nvoid run() {\n        asio::co_spawn(io_, listener(), asio::detached);\n        io_.run();\n    }\n\nprivate:\n    asio::awaitable<void> listener() {\n        for (;;) {\n            auto sock = co_await acceptor_.async_accept(\n                asio::use_awaitable);\n            auto session = std::make_shared<Session>(io_, std::move(sock));\n            session->start();\n        }\n    }\n};\n\nint main() {\n    Server server(8080);\n    std::cout << \"Server listening on port 8080\\n\";\n    server.run();\n}"
                  }
        ],
        tips: [
                  "strand serializes handlers — safe for multi-threaded I/O context without manual locks.",
                  "enable_shared_from_this<> allows session to keep itself alive until async ops complete.",
                  "Run io_context in multiple threads for parallelism — each thread processes its own handlers."
        ],
        mistake: "Sharing socket or state across multiple handlers without strand protection.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n// ── Asio TCP server with coroutines and strand ───\n#include <boost/asio.hpp>\n#include <iostream>\n#include <memory>\nnamespace asio = boost::asio;\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
      {
        id: "asio-timer",
        fn: "Asio Timers — steady_timer & Periodic Tasks",
        desc: "Async timers in Asio: steady_timer, async_wait(), periodic tasks.",
        category: "Networking",
        subtitle: "steady_timer, async_wait(), periodic operations",
        signature: "asio::steady_timer timer(io, duration)  |  co_await timer.async_wait(use_awaitable)",
        descLong: "steady_timer provides monotonic timing (not affected by clock adjustments). async_wait() waits asynchronously. Useful for timeouts, periodic tasks, and rate limiting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Asio Timers — steady_timer & Periodic Tasks — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Asio timer examples ──────────────────────────\n#include <boost/asio.hpp>\n#include <iostream>\n#include <chrono>\n\nnamespace asio = boost::asio;\nusing steady_timer = asio::steady_timer;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Asio Timers — steady_timer & Periodic Tasks — common patterns you'll see in production.\n// APPROACH  - Combine Asio Timers — steady_timer & Periodic Tasks with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Periodic task using coroutine ────────────────\nasio::awaitable<void> periodic_task(int interval_seconds) {\n    asio::io_context& io = co_await asio::this_coro::executor;\n\n    while (true) {\n        auto deadline = std::chrono::steady_clock::now() +\n                       std::chrono::seconds(interval_seconds);\n        steady_timer timer(io.get_executor(), deadline);\n\n        co_await timer.async_wait(asio::use_awaitable);\n        std::cout << \"Periodic task executed\\n\";\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Asio Timers — steady_timer & Periodic Tasks — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Timeout on async operation ───────────────────,asio::awaitable<bool> operation_with_timeout() {,    auto executor = co_await asio::this_coro::executor;,    steady_timer timer(executor, std::chrono::seconds(5));,\n\n    // Race: operation vs timeout,    asio::any_io_executor winner = co_await asio::experimental::race(,        operation_that_returns_something(),,        [&]() -> asio::awaitable<void> {,            co_await timer.async_wait(asio::use_awaitable);,        }());,,    co_return winner == /* operation won */;,}"
                  }
        ],
        tips: [
                  "Use steady_clock for timeouts — unaffected by system clock adjustments.",
                  "Periodic tasks with async timers don't block threads.",
                  "Always handle connection errors and timeouts gracefully in production code."
        ],
        mistake: "Using sleep() in async code — blocks the thread. Use async_wait() instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n// ── Asio timer examples ──────────────────────────\n#include <boost/asio.hpp>\n#include <iostream>\n#include <chrono>\nnamespace asio = boost::asio;\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
      {
        id: "asio-strand",
        fn: "Asio Strand — Thread-Safe Handler Serialization",
        desc: "Strand ensures handlers execute sequentially — no manual locks needed.",
        category: "Networking",
        subtitle: "asio::strand<executor>, handler serialization, multi-threaded I/O",
        signature: "asio::strand<executor> strand(io.get_executor())  |  co_spawn(strand, coroutine, detached)",
        descLong: "Strand wraps an executor and guarantees sequential execution. Use when multiple threads access shared state — no lock required, strand handles synchronization.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Asio Strand — Thread-Safe Handler Serialization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Strand for multi-threaded safe access ────────\n#include <boost/asio.hpp>\n#include <iostream>\n#include <thread>\n\nnamespace asio = boost::asio;\n\nclass SafeCounter {\n    int count_ = 0;\n    asio::strand<asio::io_context::executor_type> strand_;\n\npublic:\n    SafeCounter(asio::io_context& io)\n        : strand_(io.get_executor()) {}\n\n    asio::awaitable<void> increment() {\n        co_await asio::post(strand_, asio::use_awaitable);\n        count_++;  // Safe — executed sequentially via strand\n        std::cout << \"Count: \" << count_ << \"\\n\";\n    }\n};\n\nint main() {\n    asio::io_context io;\n    SafeCounter counter(io);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Asio Strand — Thread-Safe Handler Serialization — common patterns you'll see in production.\n// APPROACH  - Combine Asio Strand — Thread-Safe Handler Serialization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Spawn multiple coroutines on different threads\n    std::thread t1([&]() { io.run(); });\n    std::thread t2([&]() { io.run(); });\n\n    for (int i = 0; i < 100; ++i) {\n        asio::co_spawn(io, counter.increment(), asio::detached);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Asio Strand — Thread-Safe Handler Serialization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nio.stop();\n    t1.join();\n    t2.join();\n}"
                  }
        ],
        tips: [
                  "Strand is the primary synchronization mechanism in Asio — prefer it over manual mutexes.",
                  "Multiple io_context threads + strand = thread-safe without locks.",
                  "Always handle connection errors and timeouts gracefully in production code."
        ],
        mistake: "Modifying shared state in async handlers without strand protection.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n// ── Strand for multi-threaded safe access ────────\n#include <boost/asio.hpp>\n#include <iostream>\n#include <thread>\nnamespace asio = boost::asio;\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
      {
        id: "asio-coroutines",
        fn: "Asio with C++20 Coroutines — co_spawn & awaitable<T>",
        desc: "C++20 coroutines with Asio: co_spawn, awaitable<T>, readable async code.",
        category: "Networking",
        subtitle: "co_spawn, awaitable<T>, use_awaitable, co_await",
        signature: "co_spawn(executor, coroutine(), detached)  |  awaitable<std::string> fetch_data()",
        descLong: "C++20 coroutines eliminate callback hell. co_spawn launches a coroutine. awaitable<T> is the return type. use_awaitable adapts async ops to co_await syntax. Much more readable than callbacks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Asio with C++20 Coroutines — co_spawn & awaitable<T> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── C++20 coroutine patterns with Asio ─────────\n#include <boost/asio.hpp>\n#include <iostream>\n\nnamespace asio = boost::asio;\nusing tcp = asio::ip::tcp;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Asio with C++20 Coroutines — co_spawn & awaitable<T> — common patterns you'll see in production.\n// APPROACH  - Combine Asio with C++20 Coroutines — co_spawn & awaitable<T> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Coroutine returning a value ──────────────────\nasio::awaitable<std::string> fetch_data(tcp::socket& sock) {\n    asio::streambuf buf;\n    co_await asio::async_read_until(\n        sock, buf, '\\n', asio::use_awaitable);\n\n    std::istream is(&buf);\n    std::string line;\n    std::getline(is, line);\n    co_return line;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Asio with C++20 Coroutines — co_spawn & awaitable<T> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Spawn coroutine ──────────────────────────────,asio::awaitable<void> main_coroutine(asio::io_context& io) {,    tcp::socket sock(io);,    tcp::endpoint ep(asio::ip::make_address(\"127.0.0.1\"), 8080);,,    co_await sock.async_connect(ep, asio::use_awaitable);,,    auto data = co_await fetch_data(sock);,    std::cout << \"Fetched: \" << data << \"\\n\";,,    co_return;,},,int main() {,    asio::io_context io;,,    asio::co_spawn(,        io,,        main_coroutine(io),,        [](std::exception_ptr ep) {,            if (ep) std::rethrow_exception(ep);,        });,,    io.run();,}"
                  }
        ],
        tips: [
                  "co_spawn with detached = fire-and-forget; use error handler to catch exceptions.",
                  "awaitable<T> automatically integrates with co_await.",
                  "C++20 coroutines make async code read like synchronous code."
        ],
        mistake: "Mixing callback-based and coroutine-based code — use coroutines consistently.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n// ── C++20 coroutine patterns with Asio ─────────\n#include <boost/asio.hpp>\n#include <iostream>\nnamespace asio = boost::asio;\nusing tcp = asio::ip::tcp;\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
      {
        id: "beast-http",
        fn: "Boost.Beast — HTTP & WebSocket on Asio",
        desc: "Beast: HTTP client/server and WebSocket on top of Asio.",
        category: "Networking",
        subtitle: "http::request<>, http::response<>, async HTTP client, WebSocket",
        signature: "http::request<http::string_body> req  |  co_await http::async_write(sock, req, use_awaitable)",
        descLong: "Beast is Boost's HTTP and WebSocket library built on Asio. Provides type-safe request/response objects, efficient parsing, and full WebSocket support. Use for high-performance HTTP servers and clients.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Boost.Beast — HTTP & WebSocket on Asio — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Beast HTTP client ────────────────────────────\n#include <boost/beast/core.hpp>\n#include <boost/beast/http.hpp>\n#include <boost/asio.hpp>\n\nnamespace beast = boost::beast;\nnamespace http = beast::http;\nnamespace asio = boost::asio;\nusing tcp = asio::ip::tcp;\n\nasio::awaitable<std::string> beast_http_get(\n    const std::string& host, const std::string& path)\n{\n    auto executor = co_await asio::this_coro::executor;\n    tcp::socket sock(executor);\n\n    tcp::resolver resolver(executor);\n    auto results = co_await resolver.async_resolve(\n        host, \"http\", asio::use_awaitable);\n\n    co_await asio::async_connect(\n        sock, results, asio::use_awaitable);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Boost.Beast — HTTP & WebSocket on Asio — common patterns you'll see in production.\n// APPROACH  - Combine Boost.Beast — HTTP & WebSocket on Asio with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Build request\n    http::request<http::empty_body> req{\n        http::verb::get, path, 11};\n    req.set(http::field::host, host);\n    req.set(http::field::user_agent, \"Beast\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Boost.Beast — HTTP & WebSocket on Asio — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Send request,    co_await http::async_write(,        sock, req, asio::use_awaitable);,\n\n    // Read response,    beast::flat_buffer buf;,    http::response<http::string_body> res;,,    co_await http::async_read(,        sock, buf, res, asio::use_awaitable);,,    co_return res.body();,},\n\n// ── Beast WebSocket echo server ───────────────────,asio::awaitable<void> echo_websocket(tcp::socket sock) {,    try {,        // Upgrade to WebSocket,        beast::websocket::stream<tcp::socket> ws(std::move(sock));,        co_await ws.async_accept(asio::use_awaitable);,\n\n        // Echo loop,        beast::flat_buffer buf;,        while (true) {,            buf.clear();,            co_await ws.async_read(buf, asio::use_awaitable);,            co_await ws.async_write(buf.data(), asio::use_awaitable);,        },    } catch (std::exception& e) {,        std::cerr << e.what() << \"\\n\";,    },}"
                  }
        ],
        tips: [
                  "Beast provides proper HTTP parsing — use it instead of string-based parsing.",
                  "WebSocket support is first-class — perfect for real-time applications.",
                  "Always handle connection errors and timeouts gracefully in production code."
        ],
        mistake: "Manual HTTP parsing instead of using Beast — error-prone and slow.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n// ── Beast HTTP client ────────────────────────────\n#include <boost/beast/core.hpp>\n#include <boost/beast/http.hpp>\n#include <boost/asio.hpp>\nnamespace beast = boost::beast;\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
      {
        id: "curl-cpp",
        fn: "libcurl in C++ — Low-Level HTTP Client",
        desc: "libcurl API: curl_easy_init, CURLOPT_URL, CURLOPT_WRITEFUNCTION.",
        category: "Networking",
        subtitle: "curl_easy_init(), CURLOPT_*, curl_easy_perform(), callbacks",
        signature: "CURL* curl = curl_easy_init()  |  curl_easy_setopt(curl, CURLOPT_URL, url)  |  curl_easy_perform()",
        descLong: "libcurl is the underlying C library powering most HTTP clients. Direct API is verbose and error-prone (manual memory management, callbacks). Use C++ wrappers like cpr instead. However, understanding libcurl helps debug network issues.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of libcurl in C++ — Low-Level HTTP Client — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Raw libcurl example (verbose, not recommended) ──\n#include <curl/curl.h>\n#include <string>\n#include <iostream>\n\nstatic size_t write_callback(\n    void* contents, size_t size, size_t nmemb, std::string* s) {\n    s->append((char*)contents, size * nmemb);\n    return size * nmemb;\n}\n\nvoid raw_curl_example() {\n    CURL* curl = curl_easy_init();\n    if (!curl) return;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of libcurl in C++ — Low-Level HTTP Client — common patterns you'll see in production.\n// APPROACH  - Combine libcurl in C++ — Low-Level HTTP Client with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nstd::string response;\n\n    curl_easy_setopt(curl, CURLOPT_URL, \"https://api.example.com/users\");\n    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);\n    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);\n    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);\n\n    CURLcode res = curl_easy_perform(curl);\n    if (res != CURLE_OK) {\n        std::cerr << curl_easy_strerror(res) << \"\\n\";\n    } else {\n        std::cout << response << \"\\n\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of libcurl in C++ — Low-Level HTTP Client — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ncurl_easy_cleanup(curl);\n}"
                  }
        ],
        tips: [
                  "Prefer cpr over raw libcurl — much cleaner API and RAII-safe.",
                  "libcurl supports many protocols (FTP, SFTP, LDAP) — powerful but complex.",
                  "Always handle connection errors and timeouts gracefully in production code."
        ],
        mistake: "Using raw libcurl instead of cpr — manual cleanup and verbose callback setup are error-prone.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n// ── Raw libcurl example (verbose, not recommended) ──\n#include <curl/curl.h>\n#include <string>\n#include <iostream>\nstatic size_t write_callback(\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
      {
        id: "grpc-cpp",
        fn: "gRPC C++ — RPC Framework on Protobuf",
        desc: "gRPC: high-performance RPC with protocol buffers, streaming, async API.",
        category: "Networking",
        subtitle: "ServerBuilder, ServiceImpl, stub client, async streaming, code generation",
        signature: "grpc::ServerBuilder builder  |  builder.AddListeningPort()  |  std::unique_ptr<Server> server",
        descLong: "gRPC is Google's RPC framework built on protobuf. Define services in .proto files, code generation creates stubs and skeletons. Supports unary, server streaming, client streaming, and bidirectional streaming. Async API integrates with custom event loops. Used for microservices.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of gRPC C++ — RPC Framework on Protobuf — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── gRPC server (simplified example) ──────────────\n// Define in service.proto:\n// service Greeter {\n//   rpc SayHello (HelloRequest) returns (HelloReply);\n// }\n\n#include <grpc++/server.h>\n#include <grpc++/server_builder.h>\n#include \"service.grpc.pb.h\"\n\nclass GreeterServiceImpl : public Greeter::Service {\npublic:\n    grpc::Status SayHello(\n        grpc::ServerContext* context,\n        const HelloRequest* request,\n        HelloReply* reply) override\n    {\n        reply->set_message(\"Hello, \" + request->name());\n        return grpc::Status::OK;\n    }\n};\n\nvoid run_server() {\n    GreeterServiceImpl service;\n\n    grpc::ServerBuilder builder;\n    builder.AddListeningPort(\"[::1]:50051\",\n        grpc::InsecureServerCredentials());\n    builder.RegisterService(&service);\n\n    std::unique_ptr<grpc::Server> server(builder.BuildAndStart());\n    std::cout << \"Server listening on port 50051\\n\";\n    server->Wait();\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of gRPC C++ — RPC Framework on Protobuf — common patterns you'll see in production.\n// APPROACH  - Combine gRPC C++ — RPC Framework on Protobuf with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── gRPC client ──────────────────────────────────\nvoid grpc_client() {\n    auto channel = grpc::CreateChannel(\n        \"localhost:50051\", grpc::InsecureChannelCredentials());\n    auto stub = Greeter::NewStub(channel);\n\n    HelloRequest request;\n    request.set_name(\"Alice\");\n\n    HelloReply reply;\n    grpc::ClientContext context;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of gRPC C++ — RPC Framework on Protobuf — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ngrpc::Status status = stub->SayHello(&context, request, &reply);\n    if (status.ok()) {\n        std::cout << reply.message() << \"\\n\";\n    } else {\n        std::cerr << \"RPC failed\\n\";\n    }\n}"
                  }
        ],
        tips: [
                  "gRPC code generation is automatic — define .proto, run protoc, get client/server skeletons.",
                  "Streaming is built-in — bi-directional streaming for reactive systems.",
                  "Async API for both client and server — integrates with Asio and custom event loops."
        ],
        mistake: "Trying to build gRPC services without protobuf — gRPC requires protocol buffer contracts.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n// ── gRPC server (simplified example) ──────────────\n// Define in service.proto:\n// service Greeter {\n//   rpc SayHello (HelloRequest) returns (HelloReply);\n// }\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n}",
        },
      },
    ],
  },

  // ── Section 2: JSON & Serialization ─────────────────────────────────────────
  {
    id: "serialization",
    title: "JSON & Serialization",
    entries: [
      {
        id: "nlohmann-json",
        fn: "nlohmann/json — Modern JSON for C++",
        desc: "Parse, create, and manipulate JSON with nlohmann/json: intuitive API, automatic serialization, and JSON Pointer.",
        category: "Serialization",
        subtitle: "json::parse, to_json, from_json, NLOHMANN_DEFINE_TYPE, JSON Pointer",
        signature: "json j = json::parse(str)  |  j[\"key\"]  |  j.get<T>()  |  NLOHMANN_DEFINE_TYPE_INTRUSIVE",
        descLong: "nlohmann/json is the most popular C++ JSON library — header-only with an intuitive, STL-like API. Parse JSON strings, access nested values, and serialize to/from C++ types automatically. Define to_json/from_json for custom types, or use macros for zero-boilerplate serialization. JSON Pointer (/path/to/value) navigates deep structures. Supports JSON Merge Patch, binary formats (BSON, CBOR, MessagePack), and streaming I/O.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of nlohmann/json — Modern JSON for C++ — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <nlohmann/json.hpp>\n#include <fstream>\n#include <iostream>\n#include <optional>\n#include <vector>\n\nusing json = nlohmann::json;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of nlohmann/json — Modern JSON for C++ — common patterns you'll see in production.\n// APPROACH  - Combine nlohmann/json — Modern JSON for C++ with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Parse & access ──────────────────────────────────\nvoid basics() {\n    // Parse from string\n    json j = json::parse(R\"({\n        \"name\": \"Alice\",\n        \"age\": 30,\n        \"scores\": [95, 87, 92],\n        \"address\": {\n            \"city\": \"Portland\",\n            \"state\": \"OR\"\n        }\n    })\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of nlohmann/json — Modern JSON for C++ — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Access values,    std::string name = j[\"name\"];           // \"Alice\",    int age = j[\"age\"];                     // 30,    auto city = j[\"address\"][\"city\"];       // \"Portland\",\n\n    // Safe access with .value() (default if missing),    auto email = j.value(\"email\", \"none\");  // \"none\",\n\n    // Check existence,    if (j.contains(\"scores\")) {,        for (auto& score : j[\"scores\"]) {,            std::cout << score << \" \";,        },    },\n\n    // JSON Pointer — navigate deep structures,    auto state = j[\"/address/state\"_json_pointer];  // \"OR\",\n\n    // Iterate object,    for (auto& [key, val] : j.items()) {,        std::cout << key << \": \" << val << \"\\n\";,    },},\n\n// ── Build JSON ──────────────────────────────────────,void building() {,    json j;,    j[\"name\"] = \"Bob\";,    j[\"tags\"] = {\"cpp\", \"networking\"};,    j[\"metadata\"][\"version\"] = 2;,\n\n    // From initializer list,    json config = {,        {\"host\", \"localhost\"},,        {\"port\", 8080},,        {\"features\", {\"auth\", \"logging\", \"cors\"}},    };,\n\n    // Pretty print,    std::cout << config.dump(2) << \"\\n\";,\n\n    // Read/write files,    std::ofstream(\"config.json\") << config.dump(2);,,    std::ifstream f(\"config.json\");,    json loaded = json::parse(f);,},\n\n// ── Automatic struct serialization ──────────────────,struct User {,    std::string name;,    int age;,    std::vector<std::string> roles;,    std::optional<std::string> email;,\n\n    // One macro — generates to_json & from_json,    NLOHMANN_DEFINE_TYPE_INTRUSIVE(User, name, age, roles),};,\n\n// Or with optional fields (non-intrusive):,void to_json(json& j, const User& u) {,    j = json{{\"name\", u.name}, {\"age\", u.age}, {\"roles\", u.roles}};,    if (u.email) j[\"email\"] = *u.email;,},,void from_json(const json& j, User& u) {,    j.at(\"name\").get_to(u.name);,    j.at(\"age\").get_to(u.age);,    j.at(\"roles\").get_to(u.roles);,    if (j.contains(\"email\")) u.email = j[\"email\"].get<std::string>();,},,void serialization_example() {,    // Struct → JSON,    User alice{\"Alice\", 30, {\"admin\", \"user\"}, \"alice@ex.com\"};,    json j = alice;,    std::cout << j.dump(2) << \"\\n\";,\n\n    // JSON → struct,    auto bob = json::parse(R\"({\"name\":\"Bob\",\"age\":25,\"roles\":[\"user\"]})\");,    User user = bob.get<User>();,},\n\n// CMake: find_package(nlohmann_json REQUIRED),// target_link_libraries(app PRIVATE nlohmann_json::nlohmann_json)"
                  }
        ],
        tips: [
                  "NLOHMANN_DEFINE_TYPE_INTRUSIVE generates to_json/from_json with one line — no manual serialization code.",
                  "Use j.value(\"key\", default) instead of j[\"key\"] for safe access — avoids exceptions on missing keys.",
                  "json::parse() throws on invalid JSON — wrap in try/catch or use json::accept() to validate first.",
                  "R\"(...)\" raw strings are ideal for JSON literals — no escaping backslashes or quotes."
        ],
        mistake: "Using j[\"key\"] without checking existence — it inserts a null value if the key is missing (for non-const json). Use j.value(), j.contains(), or j.at() for safe access.",
        shorthand: {
          verbose: "std::string json_str = \"{\"name\": \"Alice\"}\";\nauto j = json::parse(json_str);\nstd::string name = j[\"name\"];",
          concise: "auto j = json::parse(R\"({\"name\": \"Alice\"})\");\nstd::string name = j[\"name\"];",
        },
      },
      {
        id: "protobuf-flatbuffers",
        fn: "Protocol Buffers & FlatBuffers — Binary Serialization",
        desc: "High-performance binary serialization: Protocol Buffers for RPC/storage, FlatBuffers for zero-copy access.",
        category: "Serialization",
        subtitle: "protobuf, FlatBuffers, gRPC, schema definition, code generation",
        signature: "protoc --cpp_out=. schema.proto  |  flatc --cpp schema.fbs  |  message.SerializeToString()",
        descLong: "Protocol Buffers (protobuf) and FlatBuffers are schema-based binary serialization formats. Protobuf is the standard for gRPC, microservices, and data storage — compact, fast, with cross-language support. FlatBuffers (from Google) enables zero-copy deserialization — access fields directly from the buffer without parsing. Both use schema files to generate C++ classes. Protobuf is more mature; FlatBuffers is faster for read-heavy workloads (games, real-time systems).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Protocol Buffers & FlatBuffers — Binary Serialization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Protocol Buffers ────────────────────────────────\n// Define schema: user.proto\n// syntax = \"proto3\";\n//\n// message User {\n//   string name = 1;\n//   int32 age = 2;\n//   repeated string roles = 3;\n//\n//   message Address {\n//     string city = 1;\n//     string state = 2;\n//   }\n//   Address address = 4;\n// }\n//\n// Compile: protoc --cpp_out=. user.proto\n// Generates: user.pb.h, user.pb.cc\n\n#include \"user.pb.h\"\n#include <fstream>\n\nvoid protobuf_example() {\n    // Create message\n    User user;\n    user.set_name(\"Alice\");\n    user.set_age(30);\n    user.add_roles(\"admin\");\n    user.add_roles(\"user\");\n\n    auto* addr = user.mutable_address();\n    addr->set_city(\"Portland\");\n    addr->set_state(\"OR\");"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Protocol Buffers & FlatBuffers — Binary Serialization — common patterns you'll see in production.\n// APPROACH  - Combine Protocol Buffers & FlatBuffers — Binary Serialization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Serialize to binary (compact, fast)\n    std::string binary;\n    user.SerializeToString(&binary);\n    // binary is ~30 bytes vs ~120 bytes JSON"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Protocol Buffers & FlatBuffers — Binary Serialization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Deserialize,    User parsed;,    parsed.ParseFromString(binary);,    std::cout << parsed.name() << \", \" << parsed.age() << \"\\n\";,\n\n    // Serialize to file,    std::ofstream out(\"user.bin\", std::ios::binary);,    user.SerializeToOstream(&out);,\n\n    // JSON interop (requires protobuf-json),    // google::protobuf::util::MessageToJsonString(user, &json_str);,},\n\n// ── FlatBuffers — zero-copy deserialization ─────────,// Define schema: user.fbs,// namespace MyApp;,//,// table User {,//   name: string;,//   age: int;,//   roles: [string];,// },//,// root_type User;,//,// Compile: flatc --cpp user.fbs,// Generates: user_generated.h,,#include \"user_generated.h\",,void flatbuffers_example() {,    flatbuffers::FlatBufferBuilder builder(256);,\n\n    // Build (bottom-up — inner objects first),    auto name = builder.CreateString(\"Alice\");,    auto roles = builder.CreateVectorOfStrings({\"admin\", \"user\"});,,    auto user = MyApp::CreateUser(builder, name, 30, roles);,    builder.Finish(user);,\n\n    // Get buffer pointer (zero-copy),    auto buf = builder.GetBufferPointer();,    auto size = builder.GetSize();,    // Send buf over network, write to file, etc.,\n\n    // Read — NO parsing step, direct memory access,    auto parsed = MyApp::GetUser(buf);,    std::cout << parsed->name()->c_str() << \"\\n\";  // direct pointer,    std::cout << parsed->age() << \"\\n\";             // direct read,\n\n    // Iteration,    for (auto role : *parsed->roles()) {,        std::cout << role->c_str() << \" \";,    },},\n\n// ── When to use which ──────────────────────────────,// JSON:         Human-readable, debugging, REST APIs, config files,// Protobuf:     gRPC, microservices, storage, cross-language RPC,// FlatBuffers:  Games, real-time systems, zero-copy needed, mmap files,// MessagePack:  Compact JSON alternative, no schema needed"
                  }
        ],
        tips: [
                  "Protobuf field numbers (= 1, = 2) are the wire format ID — never reuse or change them after deployment.",
                  "FlatBuffers zero-copy means no deserialization step — access fields directly from network buffer or mmap file.",
                  "Use proto3 syntax (not proto2) for new projects — simpler defaults, no required/optional distinction.",
                  "nlohmann/json supports BSON, CBOR, MessagePack — for schema-less binary, you may not need protobuf."
        ],
        mistake: "Using JSON for high-throughput internal services — protobuf is 3-10x smaller and 20-100x faster to parse than JSON. Use JSON for external APIs and human-readable config; protobuf for internal RPC and storage.",
        shorthand: {
          verbose: "// Manually set proto fields\nMessage msg; msg.set_id(42); msg.set_name(\"Alice\");\nstd::string data = msg.SerializeAsString();",
          concise: "// FlatBuffers: zero-copy, faster\nauto builder = FlatBufferBuilder(1024);\nauto msg = CreateMessage(builder, 42, name);",
        },
      },
    ],
  },
]

export default { meta, sections }
