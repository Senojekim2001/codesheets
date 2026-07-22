export const meta = {
  "title": "Testing & Accessibility",
  "domain": "react",
  "sheet": "testing",
  "icon": "⚛️"
}

export const sections = [

  // ── Section 1: Component Testing ─────────────────────────────────────────
  {
    id: "component-testing",
    title: "Component Testing",
    entries: [
      {
        id: "testing-library-basics",
        fn: "React Testing Library — Fundamentals",
        desc: "Test components the way users interact with them — queries, events, and assertions by role, text, and label.",
        category: "Testing",
        subtitle: "render, screen, fireEvent, waitFor, queries",
        signature: "render(<Component />)  |  screen.getByRole()  |  fireEvent.click()",
        descLong: "React Testing Library (RTL) encourages testing user behavior, not implementation details. Query elements by role, label, text, or test ID — in that priority order. Use fireEvent or userEvent for interactions. waitFor handles async state updates. Never test internal state or props directly — test what the user sees and does.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of React Testing Library — Fundamentals — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { render, screen, fireEvent, waitFor } from '@testing-library/react'\nimport userEvent from '@testing-library/user-event'\nimport { Counter } from './Counter'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of React Testing Library — Fundamentals — common patterns you'll see in production.\n// APPROACH  - Combine React Testing Library — Fundamentals with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Basic render and query\ntest('renders counter with initial value', () => {\n  render(<Counter initialCount={5} />)\n  // Query by role (preferred)\n  expect(screen.getByRole('heading')).toHaveTextContent('Count: 5')\n  // Query by text\n  expect(screen.getByText('Count: 5')).toBeInTheDocument()\n  // Query by label (for form inputs)\n  // screen.getByLabelText('Email')\n  // Query by test ID (last resort)\n  // screen.getByTestId('counter-display')\n})\n// User interactions\ntest('increments counter on button click', async () => {\n  const user = userEvent.setup()\n  render(<Counter initialCount={0} />)\n  const button = screen.getByRole('button', { name: /increment/i })\n  await user.click(button)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of React Testing Library — Fundamentals — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexpect(screen.getByRole('heading')).toHaveTextContent('Count: 1')\n})\n// Async operations\ntest('loads user data', async () => {\n  render(<UserProfile userId=\"123\" />)\n  // Loading state\n  expect(screen.getByText('Loading...')).toBeInTheDocument()\n  // Wait for async update\n  await waitFor(() => {\n    expect(screen.getByText('Alice')).toBeInTheDocument()\n  })\n  // Or use findBy (combines getBy + waitFor)\n  const name = await screen.findByText('Alice')\n  expect(name).toBeInTheDocument()\n})\n// Query types:\n// getBy*    — throws if not found (synchronous, element must exist)\n// queryBy*  — returns null if not found (for asserting absence)\n// findBy*   — returns promise (waits for element to appear)\ntest('element is NOT present', () => {\n  render(<Modal isOpen={false} />)\n  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()\n})"
                  }
        ],
        tips: [
                  "Query priority: getByRole > getByLabelText > getByText > getByTestId — test like a user, not a developer.",
                  "Use userEvent over fireEvent — it simulates real browser behavior (focus, blur, keyboard events).",
                  "findBy* = getBy* + waitFor — use for elements that appear after async operations.",
                  "queryBy* returns null instead of throwing — use for asserting elements are NOT rendered."
        ],
        mistake: "Testing implementation details (checking state values, component instances, or internal methods) — if you refactor the component, tests break even though behavior hasn't changed. Test what the user sees.",
        shorthand: {
          verbose: "// Test implementation (fragile, breaks on refactor)\nconst instance = render(<Counter/>).container;\nconst state = instance.__reactInternalInstance__.memoizedState;\nexpect(state[0][0]).toBe(5);  // testing internal state",
          concise: "// Test user behavior (robust, durable)\nrender(<Counter initialCount={5}/>);\nexpect(screen.getByRole('heading')).toHaveTextContent('Count: 5');",
        },
      },
      {
        id: "mocking-testing",
        fn: "Mocking APIs, Modules & Providers",
        desc: "Mock fetch calls, modules, context providers, and router for isolated component testing.",
        category: "Testing",
        subtitle: "vi.mock, MSW, custom render with providers",
        signature: "vi.mock(\"./api\")  |  server.use(http.get(...))  |  renderWithProviders()",
        descLong: "Isolated component tests need mocked dependencies. Mock modules with vi.mock(), HTTP requests with MSW (Mock Service Worker), and wrap components in necessary providers (router, theme, auth). Create a custom render function that includes all providers — avoids repeating setup in every test.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mocking APIs, Modules & Providers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { render, screen } from '@testing-library/react'\nimport { vi } from 'vitest'\nimport { http, HttpResponse } from 'msw'\nimport { setupServer } from 'msw/node'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mocking APIs, Modules & Providers — common patterns you'll see in production.\n// APPROACH  - Combine Mocking APIs, Modules & Providers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nvi.mock('./api', () => ({\n  fetchUser: vi.fn().mockResolvedValue({ name: 'Alice', age: 30 }),\n}))\nimport { fetchUser } from './api'  // now mocked\ntest('displays user from mocked API', async () => {\n  render(<UserCard userId=\"1\" />)\n  await screen.findByText('Alice')\n  expect(fetchUser).toHaveBeenCalledWith('1')\n})\nconst server = setupServer(\n  http.get('/api/users/:id', ({ params }) => {\n    return HttpResponse.json({ name: 'Alice', id: params.id })\n  }),\n  http.post('/api/users', async ({ request }) => {\n    const body = await request.json()\n    return HttpResponse.json({ ...body, id: '123' }, { status: 201 })\n  }),\n)\nbeforeAll(() => server.listen())\nafterEach(() => server.resetHandlers())\nafterAll(() => server.close())\ntest('handles server error', async () => {\n  // Override handler for this test\n  server.use(\n    http.get('/api/users/:id', () => {\n      return HttpResponse.json({ error: 'Not found' }, { status: 404 })\n    }),\n  )\n  render(<UserCard userId=\"999\" />)\n  await screen.findByText('User not found')\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mocking APIs, Modules & Providers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// test-utils.tsx\nimport { BrowserRouter } from 'react-router-dom'\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query'\nimport { ThemeProvider } from './theme'\nfunction renderWithProviders(ui, options = {}) {\n  const queryClient = new QueryClient({\n    defaultOptions: { queries: { retry: false } },\n  })\n  return render(\n    <QueryClientProvider client={queryClient}>\n      <BrowserRouter>\n        <ThemeProvider>{ui}</ThemeProvider>\n      </BrowserRouter>\n    </QueryClientProvider>,\n    options\n  )\n}\nexport * from '@testing-library/react'\nexport { renderWithProviders as render }\n// Usage: import { render, screen } from './test-utils'"
                  }
        ],
        tips: [
                  "MSW intercepts at the network level — components make real fetch calls, so tests are more realistic.",
                  "Create a custom render() with all providers — import from test-utils.tsx instead of @testing-library/react.",
                  "server.use() in individual tests overrides handlers — great for testing error states.",
                  "Use vi.fn().mockResolvedValue() for async mocks and vi.fn().mockReturnValue() for sync."
        ],
        mistake: "Mocking fetch/axios globally with vi.mock — it's brittle and doesn't test the actual request/response cycle. Use MSW for realistic network mocking.",
        shorthand: {
          verbose: "// Manual mock — create a fake module by hand\njest.mock('../api/users', () => ({\n  getUser: () => Promise.resolve({ id: 1, name: 'Alice' }),\n  updateUser: () => Promise.resolve({ success: true }),\n}));\n// Then import and use as normal in tests",
          concise: "vi.mock('../api/users');\nimport { getUser } from '../api/users';\ngetUser.mockResolvedValue({ id: 1, name: 'Alice' });\nexpect(await getUser(1)).toMatchObject({ name: 'Alice' });",
        },
      },
      {
        id: "hook-testing",
        fn: "Testing Custom Hooks",
        desc: "Test custom hooks in isolation with renderHook — verify state changes, effects, and return values.",
        category: "Testing",
        subtitle: "renderHook, act, testing async hooks",
        signature: "renderHook(() => useMyHook())  |  act(() => result.current.increment())",
        descLong: "Custom hooks can't be called outside of components. renderHook wraps them in a test component automatically. Use act() to wrap state updates. For async hooks, use waitFor or waitForNextUpdate. Test the hook's public API (returned values and functions), not its internal implementation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Testing Custom Hooks — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { renderHook, act, waitFor } from '@testing-library/react'\nimport { useCounter } from './useCounter'\nimport { useDebounce } from './useDebounce'\nimport { useFetch } from './useFetch'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Testing Custom Hooks — common patterns you'll see in production.\n// APPROACH  - Combine Testing Custom Hooks with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntest('useCounter increments and decrements', () => {\n  const { result } = renderHook(() => useCounter(10))\n  expect(result.current.count).toBe(10)\n  act(() => {\n    result.current.increment()\n  })\n  expect(result.current.count).toBe(11)\n  act(() => {\n    result.current.decrement()\n  })\n  expect(result.current.count).toBe(10)\n})\ntest('useCounter respects step parameter', () => {\n  const { result, rerender } = renderHook(\n    ({ step }) => useCounter(0, step),\n    { initialProps: { step: 2 } }\n  )\n  act(() => result.current.increment())\n  expect(result.current.count).toBe(2)\n  // Change props\n  rerender({ step: 5 })\n  act(() => result.current.increment())\n  expect(result.current.count).toBe(7)\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Testing Custom Hooks — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntest('useFetch loads data', async () => {\n  const { result } = renderHook(() => useFetch('/api/users'))\n  // Initial loading state\n  expect(result.current.loading).toBe(true)\n  expect(result.current.data).toBeNull()\n  // Wait for data\n  await waitFor(() => {\n    expect(result.current.loading).toBe(false)\n  })\n  expect(result.current.data).toEqual([{ name: 'Alice' }])\n})\ntest('useDebounce delays value', async () => {\n  vi.useFakeTimers()\n  const { result, rerender } = renderHook(\n    ({ value }) => useDebounce(value, 500),\n    { initialProps: { value: 'hello' } }\n  )\n  expect(result.current).toBe('hello')\n  rerender({ value: 'world' })\n  expect(result.current).toBe('hello')  // not yet\n  act(() => vi.advanceTimersByTime(500))\n  expect(result.current).toBe('world')  // now updated\n  vi.useRealTimers()\n})"
                  }
        ],
        tips: [
                  "Wrap state-changing calls in act() — React needs to process updates before you assert.",
                  "Use rerender() to test hooks with changing props — simulates parent re-rendering.",
                  "vi.useFakeTimers() lets you control setTimeout/setInterval — essential for debounce/throttle hooks.",
                  "Test hooks through their return values only — never inspect internal state."
        ],
        mistake: "Calling hooks directly in test code without renderHook — hooks must run inside a React component tree. renderHook creates that wrapper automatically.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Calling hook directly (breaks, wrong context)\nconst result = useCounter();  // Error: hooks outside component\n// More explicit but longer",
          concise: "// renderHook wraps in component tree (works)\nconst { result } = renderHook(() => useCounter());\nexpect(result.current.count).toBe(0);",
        },
      },
    ],
  },

  // ── Section 2: Accessibility (a11y) ─────────────────────────────────────────
  {
    id: "accessibility",
    title: "Accessibility (a11y)",
    entries: [
      {
        id: "aria-roles",
        fn: "ARIA Roles, Labels & Live Regions",
        desc: "Make React apps accessible with proper ARIA attributes — roles, labels, live regions, and screen reader support.",
        category: "Accessibility",
        subtitle: "aria-label, aria-describedby, role, aria-live",
        signature: "aria-label=\"Close\"  |  role=\"alert\"  |  aria-live=\"polite\"",
        descLong: "ARIA (Accessible Rich Internet Applications) attributes convey semantics to assistive technologies. Use native HTML elements first (button, nav, main) — they have built-in roles. Add aria-label for icon-only buttons, aria-describedby for help text, and aria-live for dynamic content. Live regions announce changes to screen readers without focus changes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ARIA Roles, Labels & Live Regions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nfunction Navigation() {\n  return (\n    <nav aria-label=\"Main navigation\">\n      <ul role=\"list\">\n        <li><a href=\"/\" aria-current=\"page\">Home</a></li>\n        <li><a href=\"/about\">About</a></li>\n      </ul>\n    </nav>\n  )\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ARIA Roles, Labels & Live Regions — common patterns you'll see in production.\n// APPROACH  - Combine ARIA Roles, Labels & Live Regions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction IconButton({ onClick, icon, label }) {\n  return (\n    <button onClick={onClick} aria-label={label}>\n      {icon}  {/* Screen reader reads \"Close\" not the icon */}\n    </button>\n  )\n}\n<IconButton icon={<XIcon />} label=\"Close dialog\" onClick={close} />\nfunction LoginForm() {\n  return (\n    <form aria-labelledby=\"login-title\">\n      <h2 id=\"login-title\">Sign In</h2>\n      <div>\n        <label htmlFor=\"email\">Email</label>\n        <input\n          id=\"email\"\n          type=\"email\"\n          aria-required=\"true\"\n          aria-describedby=\"email-help email-error\"\n          aria-invalid={hasError}\n        />\n        <span id=\"email-help\">We'll never share your email.</span>\n        {hasError && <span id=\"email-error\" role=\"alert\">Invalid email</span>}\n      </div>\n    </form>\n  )\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ARIA Roles, Labels & Live Regions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction Notification({ message }) {\n  return (\n    <div\n      role=\"status\"           // polite announcement\n      aria-live=\"polite\"      // waits for user to pause\n      aria-atomic=\"true\"      // reads entire region, not just changes\n    >\n      {message}  {/* Screen reader announces when message changes */}\n    </div>\n  )\n}\nfunction AlertBanner({ error }) {\n  return (\n    <div role=\"alert\">  {/* assertive — interrupts immediately */}\n      {error}\n    </div>\n  )\n}\nfunction SkipLink() {\n  return (\n    <a\n      href=\"#main-content\"\n      className=\"sr-only focus:not-sr-only focus:absolute focus:top-0\"\n    >\n      Skip to main content\n    </a>\n  )\n}"
                  }
        ],
        tips: [
                  "Use native HTML elements first: <button>, <nav>, <main>, <dialog> — they have built-in ARIA roles.",
                  "aria-live=\"polite\" waits for the user to pause; \"assertive\" interrupts immediately — use assertive only for critical errors.",
                  "Every interactive element needs an accessible name: visible text, aria-label, or aria-labelledby.",
                  "Test with a screen reader (VoiceOver, NVDA) — automated tools catch only ~30% of accessibility issues."
        ],
        mistake: "Adding role=\"button\" to a <div> instead of using a <button> — you then need to add tabIndex, keyboard handlers (Enter, Space), and focus styles manually. Use the right HTML element.",
        shorthand: {
          verbose: "// DIV with button role (fragile, manual a11y)\n<div role=\"button\" tabIndex={0} onClick={...} onKeyDown={...}>\n  Click me\n</div>  // Missing keyboard handling, focus styles",
          concise: "// Native button (robust, automatic a11y)\n<button onClick={...}>\n  Click me\n</button>  // Focus, keyboard, styles all automatic",
        },
      },
      {
        id: "focus-keyboard",
        fn: "Focus Management & Keyboard Navigation",
        desc: "Trap focus in modals, manage focus on route changes, and ensure full keyboard navigability.",
        category: "Accessibility",
        subtitle: "Focus trap, tabIndex, useRef focus, keyboard events",
        signature: "ref.current.focus()  |  tabIndex={-1}  |  onKeyDown handler",
        descLong: "Focus management is critical for keyboard and screen reader users. Focus must be trapped inside modals (can't tab to elements behind the overlay). Route changes should move focus to the new content. Custom interactive widgets need keyboard support (arrow keys for menus, Escape to close). useRef + focus() handles programmatic focus.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Focus Management & Keyboard Navigation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useRef, useEffect, useCallback } from 'react'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Focus Management & Keyboard Navigation — common patterns you'll see in production.\n// APPROACH  - Combine Focus Management & Keyboard Navigation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction Modal({ isOpen, onClose, children }) {\n  const modalRef = useRef(null)\n  const previousFocus = useRef(null)\n  useEffect(() => {\n    if (isOpen) {\n      previousFocus.current = document.activeElement\n      modalRef.current?.focus()\n    } else {\n      previousFocus.current?.focus()  // restore focus on close\n    }\n  }, [isOpen])\n  const handleKeyDown = useCallback((e) => {\n    if (e.key === 'Escape') onClose()\n    if (e.key === 'Tab') {\n      const focusable = modalRef.current.querySelectorAll(\n        'button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])'\n      )\n      const first = focusable[0]\n      const last = focusable[focusable.length - 1]\n      if (e.shiftKey && document.activeElement === first) {\n        e.preventDefault()\n        last.focus()   // wrap to last\n      } else if (!e.shiftKey && document.activeElement === last) {\n        e.preventDefault()\n        first.focus()  // wrap to first\n      }\n    }\n  }, [onClose])\n  if (!isOpen) return null\n  return (\n    <div className=\"overlay\" onClick={onClose}>\n      <div\n        ref={modalRef}\n        role=\"dialog\"\n        aria-modal=\"true\"\n        aria-labelledby=\"modal-title\"\n        tabIndex={-1}\n        onKeyDown={handleKeyDown}\n        onClick={e => e.stopPropagation()}\n      >\n        <h2 id=\"modal-title\">Dialog Title</h2>\n        {children}\n        <button onClick={onClose}>Close</button>\n      </div>\n    </div>\n  )\n}\nfunction PageContent({ title, children }) {\n  const headingRef = useRef(null)\n  useEffect(() => {\n    headingRef.current?.focus()\n    document.title = title\n  }, [title])\n  return (\n    <main id=\"main-content\">\n      <h1 ref={headingRef} tabIndex={-1}>{title}</h1>\n      {children}\n    </main>\n  )\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Focus Management & Keyboard Navigation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction DropdownMenu({ items, onSelect }) {\n  const [activeIndex, setActiveIndex] = useState(0)\n  const handleKeyDown = (e) => {\n    switch (e.key) {\n      case 'ArrowDown':\n        e.preventDefault()\n        setActiveIndex(i => Math.min(i + 1, items.length - 1))\n        break\n      case 'ArrowUp':\n        e.preventDefault()\n        setActiveIndex(i => Math.max(i - 1, 0))\n        break\n      case 'Enter':\n      case ' ':\n        e.preventDefault()\n        onSelect(items[activeIndex])\n        break\n      case 'Escape':\n        onClose()\n        break\n    }\n  }\n  return (\n    <ul role=\"listbox\" onKeyDown={handleKeyDown}>\n      {items.map((item, i) => (\n        <li\n          key={item.id}\n          role=\"option\"\n          aria-selected={i === activeIndex}\n          tabIndex={i === activeIndex ? 0 : -1}\n        >\n          {item.label}\n        </li>\n      ))}\n    </ul>\n  )\n}"
                  }
        ],
        tips: [
                  "Always restore focus when a modal/dialog closes — return to the element that triggered it.",
                  "tabIndex={-1} makes an element focusable via JavaScript but not via Tab key — use for headings and containers.",
                  "Custom widgets need arrow key navigation (not just Tab) — follow WAI-ARIA Authoring Practices.",
                  "Use <dialog> element with showModal() for native focus trapping — simpler than manual implementation."
        ],
        mistake: "Not trapping focus in modals — keyboard users can Tab to elements behind the overlay, which is confusing and breaks the flow. Always trap focus inside open modals.",
        shorthand: {
          verbose: "// Manual focus trap (verbose, fragile)\nuseEffect(() => {\n  const keydown = (e) => {\n    if (e.key === 'Tab') { /* manual trap logic */ }\n    document.addEventListener('keydown', keydown);\n  };\n}, [isOpen]);",
          concise: "// <dialog> element (concise, native)\n<dialog ref={dialogRef} open={isOpen}>\n  <button onClick={() => dialogRef.current.close()}>Close</button>\n</dialog>\n// Native focus trapping, auto-backdrop",
        },
      },
      {
        id: "rtl-queries",
        fn: "RTL Query Priority",
        desc: "Query elements in priority order — getByRole > getByLabelText > getByText > getByTestId.",
        category: "Testing",
        subtitle: "Accessible query strategies",
        signature: "getByRole(\"button\") > getByLabelText(\"Email\") > getByText(\"Submit\") > getByTestId(\"submit-btn\")",
        descLong: "React Testing Library (RTL) encourages accessible queries. Use getByRole first — it queries semantically, encouraging proper HTML. getByLabelText for form inputs. getByText for content. getByTestId as last resort. Query variants: getBy* (throws), queryBy* (returns null), findBy* (waits asynchronously).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RTL Query Priority — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { render, screen } from '@testing-library/react'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RTL Query Priority — common patterns you'll see in production.\n// APPROACH  - Combine RTL Query Priority with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntest('submit button by role', () => {\n  render(<Form />)\n  const button = screen.getByRole('button', { name: /submit/i })\n  expect(button).toBeInTheDocument()\n})\ntest('email input by label', () => {\n  render(<Form />)\n  const input = screen.getByLabelText('Email')\n  expect(input).toBeInTheDocument()\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RTL Query Priority — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntest('instructions by text', () => {\n  render(<Form />)\n  const text = screen.getByText(/fill out all fields/i)\n  expect(text).toBeInTheDocument()\n})\ntest('custom widget by test ID', () => {\n  render(<CustomElement data-testid=\"widget\" />)\n  const widget = screen.getByTestId('widget')\n  expect(widget).toBeInTheDocument()\n})"
                  }
        ],
        tips: [
                  "Prefer getByRole — it encourages semantic HTML.",
                  "Use queryBy* to assert elements NOT rendered.",
                  "Use findBy* for async elements.",
                  "getByLabelText is best for form inputs."
        ],
        mistake: "Using getByTestId as primary query — doesn't test accessibility.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst button = screen.getByTestId('submit-btn')\n// More explicit but longer",
          concise: "const button = screen.getByRole('button', { name: /submit/i })",
        },
      },
      {
        id: "rtl-user-events",
        fn: "RTL User Events",
        desc: "userEvent.setup() for realistic interactions — type, click, keyboard, tab.",
        category: "Testing",
        subtitle: "Simulating real user interactions",
        signature: "const user = userEvent.setup()  |  await user.click()",
        descLong: "userEvent simulates real browser behavior — focus, blur, keyboard events. Async and realistic. Always use over fireEvent for modern testing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RTL User Events — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport userEvent from '@testing-library/user-event'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RTL User Events — common patterns you'll see in production.\n// APPROACH  - Combine RTL User Events with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntest('typing in input', async () => {\n  const user = userEvent.setup()\n  render(<input />)\n  await user.type(screen.getByRole('textbox'), 'test')\n  expect(screen.getByRole('textbox')).toHaveValue('test')\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RTL User Events — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntest('clicking button', async () => {\n  const user = userEvent.setup()\n  const onClick = vi.fn()\n  render(<button onClick={onClick}>Click</button>)\n  await user.click(screen.getByRole('button'))\n  expect(onClick).toHaveBeenCalled()\n})"
                  }
        ],
        tips: [
                  "Always await user interactions.",
                  "userEvent.setup() initializes environment.",
                  "user.type() types realistically.",
                  "user.keyboard() for special keys."
        ],
        mistake: "Using fireEvent instead of userEvent.",
        shorthand: {
          verbose: "// Manual / verbose approach\nfireEvent.change(input, { target: { value: 'test' } })\n// More explicit but longer",
          concise: "const user = userEvent.setup(); await user.type(input, 'test')",
        },
      },
      {
        id: "rtl-async",
        fn: "RTL Async Testing",
        desc: "waitFor, findBy*, act() for testing async updates and state changes.",
        category: "Testing",
        subtitle: "Testing async operations",
        signature: "await waitFor(() => expect(...))  |  await screen.findByText(...)",
        descLong: "Test async operations with waitFor (polls condition) and findBy* (getBy* + waitFor). Always await async operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RTL Async Testing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntest('loads user data', async () => {\n  render(<UserProfile />)\n  expect(screen.getByText('Loading...')).toBeInTheDocument()\n  await screen.findByText('Alice')\n})"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RTL Async Testing — common patterns you'll see in production.\n// APPROACH  - Combine RTL Async Testing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntest('wait with timeout', async () => {\n  render(<SlowComponent />)\n  await waitFor(() => {"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RTL Async Testing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexpect(screen.getByText('Loaded')).toBeInTheDocument()\n  }, { timeout: 5000 })\n})"
                  }
        ],
        tips: [
                  "Use findBy* for elements that appear after async ops.",
                  "waitFor polls condition repeatedly.",
                  "Always await async operations."
        ],
        mistake: "Not awaiting async operations — causes flaky tests.",
        shorthand: {
          verbose: "// Manual / verbose approach\nrender(<DataFetch />); expect(screen.getByText('Data')).toBeInTheDocument()\n// More explicit but longer",
          concise: "render(<DataFetch />); await screen.findByText('Data')",
        },
      },
      {
        id: "rtl-custom-render",
        fn: "Custom Render with Providers",
        desc: "Wrap components with providers — QueryClient, Router, ThemeProvider.",
        category: "Testing",
        subtitle: "Centralized provider setup",
        signature: "export { render } from \"./test-utils\"",
        descLong: "Create a custom render() in test-utils.tsx that wraps with all needed providers. Export it so all tests use the same setup.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Render with Providers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// test-utils.tsx\nfunction customRender(ui, options) {\n  const testQueryClient = new QueryClient({\n    defaultOptions: { queries: { retry: false } },\n  })\n  return render(\n    <QueryClientProvider client={testQueryClient}>\n      <BrowserRouter>{ui}</BrowserRouter>\n    </QueryClientProvider>,\n    options\n  )\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Render with Providers — common patterns you'll see in production.\n// APPROACH  - Combine Custom Render with Providers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport * from '@testing-library/react'\nexport { customRender as render }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Render with Providers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// tests use\nimport { render, screen } from './test-utils'"
                  }
        ],
        tips: [
                  "Wrap with all providers in one place.",
                  "Create fresh QueryClient per test.",
                  "Export all RTL functions from test-utils."
        ],
        mistake: "Repeating provider setup in every test.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Every test repeats provider setup\n// More explicit but longer",
          concise: "// test-utils centralizes it",
        },
      },
      {
        id: "msw-react",
        fn: "MSW (Mock Service Worker)",
        desc: "Network mocking at the network level — setupServer, override handlers per test.",
        category: "Testing",
        subtitle: "Realistic HTTP mocking",
        signature: "setupServer(...handlers)  |  server.use()  |  server.resetHandlers()",
        descLong: "MSW intercepts HTTP requests realistically. Components make real fetch calls; responses are mocked. Override handlers per test for different scenarios.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of MSW (Mock Service Worker) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { setupServer } from 'msw/node'\nimport { http, HttpResponse } from 'msw'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of MSW (Mock Service Worker) — common patterns you'll see in production.\n// APPROACH  - Combine MSW (Mock Service Worker) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst server = setupServer(\n  http.get('/api/users/:id', () =>\n    HttpResponse.json({ id: '1', name: 'Alice' })\n  )\n)\nbeforeAll(() => server.listen())\nafterEach(() => server.resetHandlers())\nafterAll(() => server.close())"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of MSW (Mock Service Worker) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntest('fetches user', async () => {\n  render(<UserProfile userId=\"1\" />)\n  await screen.findByText('Alice')\n})\ntest('handles 404', async () => {\n  server.use(\n    http.get('/api/users/:id', () =>\n      HttpResponse.json({ error: 'Not found' }, { status: 404 })\n    )\n  )\n  render(<UserProfile userId=\"999\" />)\n  await screen.findByText('User not found')\n})"
                  }
        ],
        tips: [
                  "MSW intercepts at network level — more realistic.",
                  "server.use() overrides handlers for specific test.",
                  "server.resetHandlers() prevents leakage."
        ],
        mistake: "Using vi.mock() for API calls — less realistic.",
        shorthand: {
          verbose: "// Manual / verbose approach\nvi.mock('./api')\n// More explicit but longer",
          concise: "setupServer(http.get(..., () => HttpResponse.json(...)))",
        },
      },
      {
        id: "snapshot-testing",
        fn: "Snapshot Testing",
        desc: "Use snapshots for stable UI; avoid for dynamic content.",
        category: "Testing",
        subtitle: "Snapshot best practices",
        signature: "expect(component).toMatchSnapshot()",
        descLong: "Snapshots capture output and warn on changes. Good for forms and modals; bad for dynamic content. Inline snapshots are more reviewable. Always review snapshot diffs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Snapshot Testing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntest('renders form', () => {\n  const { container } = render(<Form />)\n  expect(container).toMatchSnapshot()\n})"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Snapshot Testing — common patterns you'll see in production.\n// APPROACH  - Combine Snapshot Testing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntest('button with inline snapshot', () => {\n  const { container } = render(<Button>Click</Button>)\n  expect(container.firstChild).toMatchInlineSnapshot(`<button>Click</button>`)\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Snapshot Testing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// DON'T snapshot dynamic content\ntest('DO NOT snapshot timestamps', () => {\n  const { container } = render(<DateDisplay time={Date.now()} />)\n  // Don't: expect(container).toMatchSnapshot()\n  // Do:\n  expect(container.textContent).toContain('2024-')\n})"
                  }
        ],
        tips: [
                  "Use for stable UI only.",
                  "Inline snapshots are more reviewable.",
                  "Review diffs carefully before committing.",
                  "Avoid for dynamic/generated content."
        ],
        mistake: "Snapshotting large, complex trees.",
        shorthand: {
          verbose: "// Manual / verbose approach\nexpect(screen.getByRole('main')).toMatchSnapshot()\n// More explicit but longer",
          concise: "expect(screen.getByRole('dialog')).toMatchSnapshot()",
        },
      },
      {
        id: "test-accessibility",
        fn: "Accessibility Testing",
        desc: "axe-core and jest-axe for automated a11y checks.",
        category: "Accessibility",
        subtitle: "Automated accessibility testing",
        signature: "expect(container).toHaveNoViolations()",
        descLong: "axe-core catches ~30-50% of accessibility issues. Use for automated checks; combine with manual testing for thorough coverage.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Accessibility Testing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { axe, toHaveNoViolations } from 'jest-axe'\nexpect.extend(toHaveNoViolations)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Accessibility Testing — common patterns you'll see in production.\n// APPROACH  - Combine Accessibility Testing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntest('form is accessible', async () => {\n  const { container } = render(<LoginForm />)\n  expect(container).toHaveNoViolations()\n})\ntest('button has label', () => {\n  render(<button>Search</button>)\n  expect(screen.getByRole('button')).toHaveAccessibleName('Search')\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Accessibility Testing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntest('image has alt text', () => {\n  render(<img src=\"/logo.png\" alt=\"Logo\" />)\n  expect(screen.getByAltText('Logo')).toBeInTheDocument()\n})"
                  }
        ],
        tips: [
                  "Run axe tests on all components.",
                  "Automated tools catch ~30-50% of issues.",
                  "Use getByRole to encourage accessible patterns.",
                  "Manual testing catches context-dependent issues."
        ],
        mistake: "Only relying on automated tools.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Manual checks scattered\n// More explicit but longer",
          concise: "// Automated with jest-axe",
        },
      },
      {
        id: "playwright-react",
        fn: "Playwright Component Testing",
        desc: "Component testing in real browser — mount components and test in browser context.",
        category: "Testing",
        subtitle: "Browser-based component testing",
        signature: "mount(<Component />)  |  page.getByRole()",
        descLong: "Playwright CT runs components in a real browser. Mount components, interact, verify. Catches browser-specific issues. More integration-like than unit tests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Playwright Component Testing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { test, expect } from '@playwright/experimental-ct-react'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Playwright Component Testing — common patterns you'll see in production.\n// APPROACH  - Combine Playwright Component Testing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntest('counter increments', async ({ mount, page }) => {\n  await mount(<Counter initialValue={0} />)\n  await page.getByRole('button').click()\n  await expect(page.getByText('1')).toBeVisible()\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Playwright Component Testing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntest('dialog opens/closes', async ({ mount, page }) => {\n  await mount(<Dialog isOpen={true} title=\"Confirm\" />)\n  const dialog = page.getByRole('dialog')\n  await expect(dialog).toBeVisible()\n  await page.getByRole('button', { name: /cancel/i }).click()\n  await expect(dialog).not.toBeVisible()\n})"
                  }
        ],
        tips: [
                  "Runs in real browsers — catches browser-specific issues.",
                  "Good for visual regression and integration tests.",
                  "Use RTL for unit tests, Playwright for integration."
        ],
        mistake: "Over-using for unit tests — use RTL for unit, Playwright for integration.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Unit test with RTL\n// More explicit but longer",
          concise: "// Integration test with Playwright CT",
        },
      },
    ],
  },
]

export default { meta, sections }
