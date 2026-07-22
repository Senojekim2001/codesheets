export const meta = {
  "title": "Components",
  "domain": "react",
  "sheet": "components",
  "icon": "🧱"
}

export const sections = [

  // ── Section 1: Component Fundamentals ─────────────────────────────────────────
  {
    id: "component-fundamentals",
    title: "Component Fundamentals",
    entries: [
      {
        id: "jsx-rules",
        fn: "JSX Syntax Rules",
        desc: "JSX is syntactic sugar for React.createElement(). Key rules: one root, className, self-closing, expressions in {}.",
        category: "JSX",
        subtitle: "The rules of React's HTML-like syntax",
        signature: "<Component prop={expr}>children</Component>",
        descLong: "JSX must have a single root element (or use a Fragment). HTML attributes use camelCase (className, htmlFor, onClick). Self-closing tags must have />.  Expressions in {} can be any JS expression — not statements. Comments use {/* */}.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of JSX Syntax Rules — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Single root — use Fragment to avoid extra DOM node\nfunction Card({ title, children }) {\n  return (\n    <>\n      <h2 className=\"title\">{title}</h2>\n      <div className=\"body\">{children}</div>\n    </>\n  );\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of JSX Syntax Rules — common patterns you'll see in production.\n// APPROACH  - Combine JSX Syntax Rules with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Expressions in JSX\n<p style={{ color: isError ? 'red' : 'green' }}>\n  {count > 0 ? `${count} items` : 'Empty'}\n</p>\n// Self-closing\n<img src={src} alt={alt} />\n<Input ref={ref} />"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of JSX Syntax Rules — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Rendering lists — key required\n{items.map(item => (\n  <li key={item.id}>{item.name}</li>\n))}"
                  }
        ],
        tips: [
                  "Use <> </> (Fragment shorthand) to avoid wrapping divs that add meaningless DOM nodes.",
                  "Keys must be stable and unique among siblings — never use array index if items can reorder.",
                  "Avoid conditional rendering of JSX with && — return null explicitly if falsy.",
                  "Attributes spread: <Component {...props} /> passes all properties as props."
        ],
        mistake: "Using array index as a key in lists — if items reorder, the key no longer matches the item.",
        shorthand: {
          verbose: "function List({ items }) {\n  return (\n    <ul>\n      {items.map((item, index) => (\n        <li key={index}>{item.name}</li>\n      ))}\n    </ul>\n  );\n}",
          concise: "function List({ items }) {\n  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>;\n}",
        },
      },
      {
        id: "props-drilling",
        fn: "Props & Props Drilling",
        desc: "Passing data through multiple component levels. Use Context or a state management library to avoid it.",
        category: "Component Patterns",
        subtitle: "Data flow with props and alternatives",
        signature: "<Parent user={user}><Child user={user}/></Parent>",
        descLong: "Props drill (pass-through) occurs when intermediate components receive props only to pass them down. This is a code smell — if passing through 3+ levels, use Context (useContext), Redux, Zustand, or state management instead. Keep prop drilling to 1-2 levels.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Props & Props Drilling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Prop drilling — BAD if it goes 3+ levels deep\nfunction Page({ user }) {\n  return <Container user={user} />;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Props & Props Drilling — common patterns you'll see in production.\n// APPROACH  - Combine Props & Props Drilling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction Container({ user }) {\n  return <Header user={user} />;\n}\nfunction Header({ user }) {\n  return <Welcome name={user.name} />;\n}\n// GOOD — use Context to avoid drilling\nimport { createContext, useContext } from 'react';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Props & Props Drilling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst UserContext = createContext();\nfunction Page({ user }) {\n  return (\n    <UserContext.Provider value={user}>\n      <Container />\n    </UserContext.Provider>\n  );\n}\nfunction Header() {\n  const user = useContext(UserContext);\n  return <Welcome name={user.name} />;\n}"
                  }
        ],
        tips: [
                  "Prop drilling 1-2 levels is fine — it makes data flow explicit.",
                  "Prop drilling 3+ levels is a smell — consider Context or state management.",
                  "Context is built-in and free; use it liberally for UI state (theme, language, user).",
                  "For complex data flow, use Redux, Zustand, or Jotai — they're more explicit than Context."
        ],
        mistake: "Drilling props 5+ levels deep instead of using Context — makes refactoring hard and the code harder to follow.",
        shorthand: {
          verbose: "function Page({ user }) {\n  return <Container user={user} />;\n}\nfunction Container({ user }) {\n  return <Header user={user} />;\n}",
          concise: "const UserContext = createContext();\nfunction Page({ user }) {\n  return <UserContext.Provider value={user}><Container /></UserContext.Provider>;\n}\nconst Header = () => <div>{useContext(UserContext).name}</div>;",
        },
      },
      {
        id: "component-composition",
        fn: "Component Composition Patterns",
        desc: "Building components from smaller pieces — render props, composition, children.",
        category: "Component Patterns",
        subtitle: "Flexible, composable component design",
        signature: "<Container><Item /><Item /></Container>",
        descLong: "Composition is building larger components from smaller, reusable pieces. Use children for flexible composition, render props for fine-grained control, and higher-order components (HOCs) for wrapping logic. Modern React prefers composition + hooks over render props or HOCs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Component Composition Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Simple composition with children\nfunction Card({ title, children }) {\n  return (\n    <div className=\"card\">\n      <h2>{title}</h2>\n      <div className=\"content\">{children}</div>\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Component Composition Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Component Composition Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction Page() {\n  return (\n    <Card title=\"Welcome\">\n      <p>This is flexible!</p>\n    </Card>\n  );\n}\n// Render props — control what each slot renders\nfunction List({ items, renderItem, renderEmpty }) {\n  return items.length > 0 ? (\n    <ul>\n      {items.map((item, i) => (\n        <li key={i}>{renderItem(item)}</li>\n      ))}\n    </ul>\n  ) : (\n    renderEmpty()\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Component Composition Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n<List\n  items={[1, 2, 3]}\n  renderItem={(x) => <span>{x * 2}</span>}\n  renderEmpty={() => <p>No items</p>}\n/>"
                  }
        ],
        tips: [
                  "children is the simplest composition pattern — use it by default.",
                  "Render props give fine-grained control over what renders — useful for complex layouts.",
                  "HOCs are less common in modern React — hooks are more composable.",
                  "Avoid deeply nested composition — it becomes hard to trace."
        ],
        mistake: "Creating a huge generic component that tries to handle all cases instead of composing smaller pieces.",
        shorthand: {
          verbose: "function Card({ title, children }) {\n  return (\n    <div className=\"card\">\n      <h2>{title}</h2>\n      <div className=\"content\">{children}</div>\n    </div>\n  );\n}",
          concise: "const Card = ({ title, children }) => (\n  <div className=\"card\"><h2>{title}</h2><div className=\"content\">{children}</div></div>\n);",
        },
      },
      {
        id: "controlled-uncontrolled",
        fn: "Controlled vs Uncontrolled Components",
        desc: "React state (controlled) vs DOM state (uncontrolled). Prefer controlled for most cases.",
        category: "Form Patterns",
        subtitle: "Managing form input state",
        signature: "<input value={state} onChange={setState} /> (controlled)",
        descLong: "A controlled component's value is driven by React state. An uncontrolled component stores its own value in the DOM (ref.current.value). Controlled is more predictable but requires more boilerplate. Use controlled for validation, uncontrolled for simple inputs or integrating with non-React code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Controlled vs Uncontrolled Components — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useRef } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Controlled vs Uncontrolled Components — common patterns you'll see in production.\n// APPROACH  - Combine Controlled vs Uncontrolled Components with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// CONTROLLED — React state\nfunction ControlledForm() {\n  const [name, setName] = useState('');\n  return (\n    <>\n      <input\n        value={name}\n        onChange={(e) => setName(e.target.value)}\n        placeholder=\"Enter name\"\n      />\n      <p>Hello, {name || 'Guest'}</p>\n    </>\n  );\n}\n// UNCONTROLLED — DOM stores state\nfunction UncontrolledForm() {\n  const inputRef = useRef();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Controlled vs Uncontrolled Components — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst handleSubmit = (e) => {\n    e.preventDefault();\n    alert(`Hello, ${inputRef.current.value}`);\n  };\n  return (\n    <form onSubmit={handleSubmit}>\n      <input ref={inputRef} placeholder=\"Enter name\" />\n      <button type=\"submit\">Submit</button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Controlled components work better with validation and real-time feedback.",
                  "Uncontrolled components are simpler for one-off submissions (like file uploads).",
                  "File inputs are always uncontrolled — you can't set the value from React.",
                  "For existing non-React code, uncontrolled components avoid conflicts."
        ],
        mistake: "Mixing controlled and uncontrolled patterns in the same form — choose one approach consistently.",
        shorthand: {
          verbose: "function Form() {\n  const [name, setName] = useState('');\n  return (\n    <input value={name} onChange={(e) => setName(e.target.value)} />\n  );\n}",
          concise: "const Form = () => {\n  const [name, setName] = useState('');\n  return <input value={name} onChange={(e) => setName(e.target.value)} />;\n};",
        },
      },
      {
        id: "error-boundaries",
        fn: "Error Boundaries",
        desc: "Catch JavaScript errors in React trees and display a fallback UI.",
        category: "Special Components",
        subtitle: "Graceful error handling in render",
        signature: "<ErrorBoundary fallback={<Error />}><App /></ErrorBoundary>",
        descLong: "Error Boundaries are class components with getDerivedStateFromError and componentDidCatch lifecycle methods. They catch errors during render, in lifecycle methods, and in constructors of child components. Event handlers and async code need try/catch. React 18+ supports error-ui libraries and async error catching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Error Boundaries — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport React from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Error Boundaries — common patterns you'll see in production.\n// APPROACH  - Combine Error Boundaries with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass ErrorBoundary extends React.Component {\n  constructor(props) {\n    super(props);\n    this.state = { hasError: false, error: null };\n  }\n  static getDerivedStateFromError(error) {\n    return { hasError: true, error };\n  }\n  componentDidCatch(error, errorInfo) {\n    console.error('Error caught:', error, errorInfo);\n    // Send to error reporting service\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Error Boundaries — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nrender() {\n    if (this.state.hasError) {\n      return (\n        <div className=\"error\">\n          <h2>Something went wrong</h2>\n          <p>{this.state.error?.message}</p>\n          <button onClick={() => this.setState({ hasError: false })}>\n            Try again\n          </button>\n        </div>\n      );\n    }\n    return this.props.children;\n  }\n}\n// Usage\n<ErrorBoundary>\n  <App />\n</ErrorBoundary>"
                  }
        ],
        tips: [
                  "Error Boundaries only catch render errors, not event handler errors — use try/catch for those.",
                  "Error Boundaries don't catch async errors (promises) — use .catch() or try/await.",
                  "Use multiple boundaries at different levels to isolate errors.",
                  "Error boundaries are for user-facing error handling — use error reporting services."
        ],
        mistake: "Expecting Error Boundaries to catch all errors (events, async, Server Components) — they only catch render and lifecycle errors.",
        shorthand: {
          verbose: "class ErrorBoundary extends React.Component {\n  static getDerivedStateFromError(error) {\n    return { hasError: true };\n  }\n  render() {\n    if (this.state.hasError) return <div>Error!</div>;\n    return this.props.children;\n  }\n}",
          concise: "class ErrorBoundary extends React.Component {\n  static getDerivedStateFromError(error) { return { hasError: true }; }\n  render() { return this.state?.hasError ? <div>Error!</div> : this.props.children; }\n}",
        },
      },
      {
        id: "ref-forwardref",
        fn: "useRef & forwardRef",
        desc: "Access DOM directly with useRef. Wrap functional components with forwardRef to forward refs to children.",
        category: "Advanced Patterns",
        subtitle: "Direct DOM access and ref forwarding",
        signature: "const ref = useRef();  →  <input ref={ref} />",
        descLong: "useRef creates a container for a mutable value that persists across renders. Use it for DOM access (focus, scroll, selections), storing timers/intervals, or caching values. forwardRef lets parent components access a child component's ref. Avoid refs for things you can do with state/events.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useRef & forwardRef — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useRef, forwardRef } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useRef & forwardRef — common patterns you'll see in production.\n// APPROACH  - Combine useRef & forwardRef with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Ref for direct DOM access\nfunction TextInput() {\n  const inputRef = useRef(null);\n  const focus = () => {\n    inputRef.current?.focus();\n  };\n  return (\n    <>\n      <input ref={inputRef} type=\"text\" />\n      <button onClick={focus}>Focus input</button>\n    </>\n  );\n}\n// forwardRef — pass ref through to child\nconst FancyInput = forwardRef((props, ref) => {\n  return <input ref={ref} {...props} className=\"fancy\" />;\n});\n// Parent can access the input ref\nfunction Parent() {\n  const fancyRef = useRef();\n  const handleClick = () => {\n    fancyRef.current?.focus();\n  };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useRef & forwardRef — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <>\n      <FancyInput ref={fancyRef} />\n      <button onClick={handleClick}>Focus fancy</button>\n    </>\n  );\n}\n// Ref for managing timers\nfunction StopWatch() {\n  const intervalRef = useRef(null);\n  const [seconds, setSeconds] = useState(0);\n  const start = () => {\n    intervalRef.current = setInterval(\n      () => setSeconds(s => s + 1),\n      1000\n    );\n  };\n  const stop = () => {\n    clearInterval(intervalRef.current);\n  };\n  return (\n    <>\n      <p>{seconds}s</p>\n      <button onClick={start}>Start</button>\n      <button onClick={stop}>Stop</button>\n    </>\n  );\n}"
                  }
        ],
        tips: [
                  "Don't overuse refs — they're an escape hatch. Use state/events first.",
                  "forwardRef makes refs work on functional components — class components pass ref automatically.",
                  "Refs are mutable and don't cause re-renders when updated.",
                  "useRef(null) creates the ref; .current holds the actual value."
        ],
        mistake: "Using refs to read values that should be state (like form inputs) — use controlled components instead.",
        shorthand: {
          verbose: "const inputRef = useRef(null);\n\nconst focus = () => {\n  inputRef.current?.focus();\n};\n\nreturn (\n  <>\n    <input ref={inputRef} type=\"text\" />\n    <button onClick={focus}>Focus input</button>\n  </>\n);",
          concise: "const inputRef = useRef(null);\nreturn (\n  <>\n    <input ref={inputRef} type=\"text\" />\n    <button onClick={() => inputRef.current?.focus()}>Focus input</button>\n  </>\n);",
        },
      },
      {
        id: "suspense-basics",
        fn: "Suspense & Code Splitting",
        desc: "Suspend render while loading data. Use with lazy() for code splitting.",
        category: "Special Components",
        subtitle: "Declarative loading states",
        signature: "<Suspense fallback={<Spinner />}><LazyComponent /></Suspense>",
        descLong: "Suspense lets you handle async operations declaratively. Wrap lazy-loaded components or data-fetching boundaries in <Suspense>. When a promise is thrown, Suspense catches it and shows the fallback. In React 19, use() makes promises throw automatically.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Suspense & Code Splitting — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { lazy, Suspense } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Suspense & Code Splitting — common patterns you'll see in production.\n// APPROACH  - Combine Suspense & Code Splitting with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst HeavyChart = lazy(() => import('./HeavyChart'));\nconst Dashboard = lazy(() => import('./Dashboard'));\nfunction App() {\n  return (\n    <Suspense fallback={<div>Loading...</div>}>\n      <HeavyChart />\n    </Suspense>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Suspense & Code Splitting — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Multiple boundaries for granular loading\nfunction PageWithMultipleRegions() {\n  return (\n    <div>\n      <Suspense fallback={<HeaderSkeleton />}>\n        <Header />\n      </Suspense>\n      <Suspense fallback={<MainSkeleton />}>\n        <MainContent />\n      </Suspense>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Suspense is for async loading — it catches thrown promises.",
                  "Lazy-loaded components automatically throw promises until ready.",
                  "Use nested Suspense boundaries for granular loading states.",
                  "In Next.js and Remix, Suspense integrates with server-side streaming."
        ],
        mistake: "Wrapping entire app in one Suspense — user sees a blank page while everything loads. Use nested boundaries.",
        shorthand: {
          verbose: "const HeavyChart = lazy(() => import('./HeavyChart'));\n\nfunction App() {\n  return (\n    <Suspense fallback={<div>Loading...</div>}>\n      <HeavyChart />\n    </Suspense>\n  );\n}",
          concise: "const HeavyChart = lazy(() => import('./HeavyChart'));\nconst App = () => <Suspense fallback={<div>Loading...</div>}><HeavyChart /></Suspense>;",
        },
      },
      {
        id: "suspense-advanced",
        fn: "Suspense Boundaries (Advanced)",
        desc: "Nested Suspense patterns, error boundaries integration, and granular loading states.",
        category: "Special Components",
        subtitle: "Advanced data loading patterns",
        signature: "<Suspense fallback={...}> with error boundaries and nested boundaries",
        descLong: "Suspense enables declarative loading states. Nest multiple boundaries for granular control — different parts of the page load independently. Combine with ErrorBoundary to catch both render errors and data-fetching errors. In React 19, use() to suspend on promises. Suspense works with lazy(), React Query, Relay, and Next.js.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Suspense Boundaries (Advanced) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { Suspense } from 'react';\nimport { ErrorBoundary } from 'react-error-boundary';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Suspense Boundaries (Advanced) — common patterns you'll see in production.\n// APPROACH  - Combine Suspense Boundaries (Advanced) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction PageSkeleton() {\n  return (\n    <div className=\"page-skeleton\">\n      <div className=\"header-skeleton\" />\n      <div className=\"sidebar-skeleton\" />\n      <div className=\"main-skeleton\" />\n    </div>\n  );\n}\nfunction HeaderSkeleton() {\n  return <div className=\"skeleton header-height\" />;\n}\nfunction SidebarSkeleton() {\n  return <div className=\"skeleton sidebar-width\" />;\n}\nfunction MainSkeleton() {\n  return <div className=\"skeleton main-height\" />;\n}\n// Nested Suspense boundaries for granular loading\nfunction Page() {\n  return (\n    <ErrorBoundary\n      FallbackComponent={ErrorPage}\n      onReset={() => window.location.reload()}\n    >\n      <Suspense fallback={<PageSkeleton />}>\n        <div className=\"page\">\n          <Suspense fallback={<HeaderSkeleton />}>\n            <Header />\n          </Suspense>\n          <div className=\"content\">\n            <Suspense fallback={<SidebarSkeleton />}>\n              <Sidebar />\n            </Suspense>\n            {/* Main content can have its own nested suspense */}\n            <Suspense fallback={<MainSkeleton />}>\n              <MainContent />\n            </Suspense>\n          </div>\n        </div>\n      </Suspense>\n    </ErrorBoundary>\n  );\n}\n// React Query with Suspense mode\nimport { useSuspenseQuery } from '@tanstack/react-query';\nfunction UserList() {\n  // Suspense mode: throws a promise, caught by nearest Suspense\n  const { data: users } = useSuspenseQuery({\n    queryKey: ['users'],\n    queryFn: () => fetch('/api/users').then(r => r.json()),\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Suspense Boundaries (Advanced) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <ul>\n      {users.map(user => (\n        <li key={user.id}>{user.name}</li>\n      ))}\n    </ul>\n  );\n}\n// React 19: use() hook for promises\nfunction UserDetail({ userPromise }) {\n  const user = use(userPromise);\n  return <div>User: {user.name}</div>;\n}\n// Preloading data before navigation\nfunction handleNavigate(path) {\n  const dataPromise = fetchPageData(path);\n  navigate(path, { state: { dataPromise } });\n}\n// Combining Suspense with transitions\nimport { useTransition } from 'react';\nfunction TabContent() {\n  const [tab, setTab] = useState('overview');\n  const [isPending, startTransition] = useTransition();\n  return (\n    <div>\n      <div className=\"tabs\">\n        {['overview', 'details', 'settings'].map(t => (\n          <button\n            key={t}\n            onClick={() => startTransition(() => setTab(t))}\n            className={tab === t ? 'active' : ''}\n          >\n            {t}\n          </button>\n        ))}\n      </div>\n      <Suspense fallback={<TabSkeleton />}>\n        {tab === 'overview' && <OverviewTab />}\n        {tab === 'details' && <DetailsTab />}\n        {tab === 'settings' && <SettingsTab />}\n      </Suspense>\n      {isPending && <p className=\"loading-indicator\">Switching tabs...</p>}\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Nest Suspense boundaries to show partial page content while other parts load.",
                  "Use error boundaries alongside Suspense — Suspense handles loading, ErrorBoundary handles errors.",
                  "Each Suspense level shows its own fallback — structure boundaries to match your UI layout.",
                  "React Query and SWR support Suspense mode — no loading state checks needed.",
                  "Combine with useTransition to show pending state while navigating between tabs/pages."
        ],
        mistake: "Wrapping the entire page in a single Suspense boundary — the whole page shows a spinner while any sub-component loads. Use nested boundaries for better UX.",
        shorthand: {
          verbose: "function Page() {\n  return (\n    <div className=\"page\">\n      <Suspense fallback={<HeaderSkeleton />}>\n        <Header />\n      </Suspense>\n      <Suspense fallback={<MainSkeleton />}>\n        <MainContent />\n      </Suspense>\n    </div>\n  );\n}",
          concise: "const Page = () => (\n  <div className=\"page\">\n    <Suspense fallback={<HeaderSkeleton />}><Header /></Suspense>\n    <Suspense fallback={<MainSkeleton />}><MainContent /></Suspense>\n  </div>\n);",
        },
      },
      {
        id: "react-lazy-edge-cases",
        fn: "React.lazy() Edge Cases & Code Splitting",
        desc: "Common pitfalls with code splitting, named exports, parallel loading, and preloading strategies.",
        category: "Code Splitting",
        subtitle: "Avoid common code-splitting mistakes",
        signature: "const Comp = lazy(() => import('./path'))",
        descLong: "React.lazy() splits code by dynamically importing modules. Common mistakes: defining lazy() inside components (recreates the component every render), not handling named exports, and forgetting to wrap in Suspense. Best practices: define lazy at module level, preload on hover, use parallel loaders in routes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of React.lazy() Edge Cases & Code Splitting — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { lazy, Suspense } from 'react';\nimport { useEffect } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of React.lazy() Edge Cases & Code Splitting — common patterns you'll see in production.\n// APPROACH  - Combine React.lazy() Edge Cases & Code Splitting with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// WRONG — recreates component on every parent render\nfunction App() {\n  const Chart = lazy(() => import('./Chart')); // bad!\n  return <Suspense fallback={<Spinner />}><Chart /></Suspense>;\n}\n// RIGHT — define at module level\nconst Chart = lazy(() => import('./Chart'));\nfunction App() {\n  return <Suspense fallback={<Spinner />}><Chart /></Suspense>;\n}\n// Handling named exports\n// If module exports named exports, wrap them in a default export\nconst ChartComponent = lazy(() =>\n  import('./charts').then(module => ({\n    default: module.AdvancedChart\n  }))\n);\n// Preloading strategies\nfunction preloadComponent(fn) {\n  const promise = fn();\n  return lazy(() => promise);\n}\nconst HeavyDashboard = preloadComponent(() => import('./Dashboard'));\n// Preload on hover\nfunction NavLink({ to, label }) {\n  const handleMouseEnter = () => {\n    import('./pages/Dashboard'); // Start loading on hover\n  };\n  return (\n    <a\n      href={to}\n      onMouseEnter={handleMouseEnter}\n      onTouchStart={handleMouseEnter}\n    >\n      {label}\n    </a>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of React.lazy() Edge Cases & Code Splitting — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Preload when idle (requestIdleCallback)\nfunction useIdlePreload(importFn) {\n  useEffect(() => {\n    if ('requestIdleCallback' in window) {\n      requestIdleCallback(() => importFn());\n    } else {\n      setTimeout(() => importFn(), 2000);\n    }\n  }, [importFn]);\n}\n// Parallel route loading\nconst routes = [\n  {\n    path: '/',\n    element: lazy(() => import('./pages/Home')),\n  },\n  {\n    path: '/dashboard',\n    element: lazy(() => import('./pages/Dashboard')),\n  },\n  {\n    path: '/settings',\n    element: lazy(() => import('./pages/Settings')),\n  },\n];\n// Preload all lazy routes in parallel\nfunction preloadAllRoutes() {\n  Promise.all([\n    import('./pages/Home'),\n    import('./pages/Dashboard'),\n    import('./pages/Settings'),\n  ]);\n}\n// Error handling with lazy\nfunction withLazyErrorBoundary(lazyComponent) {\n  return class extends React.Component {\n    constructor(props) {\n      super(props);\n      this.state = { hasError: false };\n    }\n    static getDerivedStateFromError() {\n      return { hasError: true };\n    }\n    componentDidCatch(error, errorInfo) {\n      console.error('Lazy load error:', error);\n    }\n    render() {\n      if (this.state.hasError) {\n        return <p>Failed to load component</p>;\n      }\n      return (\n        <Suspense fallback={<Spinner />}>\n          <lazyComponent {...this.props} />\n        </Suspense>\n      );\n    }\n  };\n}\n// Route-level code splitting with React Router\nconst routes = [\n  {\n    path: '/',\n    element: <Home />,\n  },\n  {\n    path: '/dashboard',\n    element: <Suspense fallback={<PageSpinner />}>\n      {lazy(() => import('./Dashboard'))}\n    </Suspense>,\n    loader: dashboardLoader,\n  },\n];"
                  }
        ],
        tips: [
                  "Define lazy() at module level, not inside render — re-defining creates a new component type each render.",
                  "For named exports, use .then(m => ({ default: m.NamedExport })) to wrap them.",
                  "Preload on hover/focus or when idle using requestIdleCallback for better perceived performance.",
                  "In React Router, combine lazy() with loaders for data + code splitting.",
                  "Use React DevTools Network tab to verify chunks are actually being split and lazy-loaded."
        ],
        mistake: "Defining lazy(() => import(...)) inside a component — it creates a new component type on every render, causing the component to unmount/remount repeatedly.",
        shorthand: {
          verbose: "function App() {\n  const Chart = lazy(() => import('./Chart'));\n  return (\n    <Suspense fallback={<Spinner />}>\n      <Chart />\n    </Suspense>\n  );\n}",
          concise: "const Chart = lazy(() => import('./Chart'));\nconst App = () => <Suspense fallback={<Spinner />}><Chart /></Suspense>;",
        },
      },
      {
        id: "memo-deep-dive",
        fn: "React.memo() Deep Dive",
        desc: "When to use memo, custom comparisons, and common pitfalls.",
        category: "Memoization",
        subtitle: "Prevent re-renders with conditional memoization",
        signature: "const Memoized = React.memo(Component, (prev, next) => {})",
        descLong: "React.memo does a shallow comparison of props. Pass a custom comparison function for fine-grained control. Only effective when parent re-renders but props haven't changed. Pair with useCallback/useMemo for stable function/object props. Profile before memoizing — most components are fast enough.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of React.memo() Deep Dive — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport React, { useState, useCallback, useMemo, memo } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of React.memo() Deep Dive — common patterns you'll see in production.\n// APPROACH  - Combine React.memo() Deep Dive with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Basic memo — shallow comparison\nconst Button = memo(function Button({ label, onClick }) {\n  return <button onClick={onClick}>{label}</button>;\n});\n// Custom comparison\nconst UserCard = memo(\n  function UserCard({ user, isLoading }) {\n    return (\n      <div>\n        <h3>{user.name}</h3>\n        <p>{user.email}</p>\n        {isLoading && <Spinner />}\n      </div>\n    );\n  },\n  // Custom comparison function\n  (prevProps, nextProps) => {\n    // Return true if props are EQUAL (skip re-render)\n    // Return false if props are DIFFERENT (re-render)\n    return (\n      prevProps.user.id === nextProps.user.id &&\n      prevProps.isLoading === nextProps.isLoading\n    );\n  }\n);\n// Common mistake: not stabilizing prop callbacks\nfunction Parent() {\n  const [count, setCount] = useState(0);\n  // BAD — creates new function every render\n  // MemoizedChild re-renders even though logic is the same\n  return (\n    <MemoizedChild\n      onClick={() => setCount(c => c + 1)}\n      data={{ value: count }}\n    />\n  );\n}\n// GOOD — stabilize with useCallback\nfunction ParentFixed() {\n  const [count, setCount] = useState(0);\n  const handleClick = useCallback(() => {\n    setCount(c => c + 1);\n  }, []);\n  const memoData = useMemo(() => ({ value: count }), [count]);\n  return (\n    <MemoizedChild\n      onClick={handleClick}\n      data={memoData}\n    />\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of React.memo() Deep Dive — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Comparison by value (not just reference)\nconst SelectableItem = memo(\n  function SelectableItem({ item, isSelected, onSelect }) {\n    return (\n      <div\n        className={isSelected ? 'selected' : ''}\n        onClick={() => onSelect(item.id)}\n      >\n        {item.name}\n      </div>\n    );\n  },\n  // Custom comparison: item.id matters, but object identity doesn't\n  (prev, next) => {\n    return (\n      prev.item.id === next.item.id &&\n      prev.isSelected === next.isSelected &&\n      prev.onSelect === next.onSelect\n    );\n  }\n);\n// Use case: expensive render computation\nconst DataTable = memo(\n  function DataTable({ rows, sortBy, filterQuery }) {\n    // Expensive: sort + filter + render many rows\n    const processedRows = rows\n      .filter(r => r.name.includes(filterQuery))\n      .sort((a, b) => (sortBy === 'name' ? a.name.localeCompare(b.name) : 0));\n    return (\n      <table>\n        <tbody>\n          {processedRows.map(row => (\n            <tr key={row.id}>{/* render row */}</tr>\n          ))}\n        </tbody>\n      </table>\n    );\n  }\n);\n// When NOT to use memo\nconst Cheap = memo(function Cheap({ x }) {\n  // Simple render — memo overhead costs more than re-render\n  return <div>{x}</div>;\n}); // Don't memoize cheap components\n// Profile to verify memo helps\nfunction App() {\n  const [count, setCount] = useState(0);\n  return (\n    <>\n      <button onClick={() => setCount(c => c + 1)}>\n        Count: {count}\n      </button>\n      <Profiler id=\"List\" onRender={logProfile}>\n        <List items={items} />\n      </Profiler>\n    </>\n  );\n}\nfunction logProfile(id, phase, actualDuration) {\n  console.log(`${id} [${phase}]: ${actualDuration}ms`);\n  // If actualDuration is consistently < 1ms, memo adds unnecessary overhead\n}"
                  }
        ],
        tips: [
                  "Profile before adding memo — most components render quickly; the comparison overhead can exceed savings.",
                  "useMemo + useCallback are required for memo to work — without stable props, memo has no effect.",
                  "Custom comparison function: return true to skip re-render, false to re-render.",
                  "Don't memoize pure components that receive primitive props — shallow comparison is free.",
                  "React 19 compiler may eliminate the need for manual memoization."
        ],
        mistake: "Memoizing every component \"just in case\" without profiling — creates unnecessary complexity. Only memoize when you have a measured performance problem.",
        shorthand: {
          verbose: "const Button = React.memo(function Button({ label, onClick }) {\n  return <button onClick={onClick}>{label}</button>;\n});\n\nfunction App() {\n  const [count, setCount] = useState(0);\n  return <Button label=\"Click me\" onClick={() => setCount(c => c + 1)} />;\n}",
          concise: "const Button = memo(({ label, onClick }) => <button onClick={onClick}>{label}</button>);\nconst App = () => {\n  const [count, setCount] = useState(0);\n  return <Button label=\"Click me\" onClick={() => setCount(c => c + 1)} />;\n};",
        },
      },
      {
        id: "fragment-patterns",
        fn: "Fragments & <>",
        desc: "Using fragments to avoid wrapper divs and keyed fragments for list rendering.",
        category: "JSX",
        subtitle: "Render multiple elements without wrapping",
        signature: "<> ... </> or <React.Fragment key={key}> ... </React.Fragment>",
        descLong: "Fragments let you return multiple elements without adding a DOM wrapper. Use <></> shorthand for most cases. Use explicit <React.Fragment key={key}> when keys are needed (in lists). Fragments don't render a DOM node — useful for reducing DOM nesting and improving semantics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Fragments & <> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { Fragment } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Fragments & <> — common patterns you'll see in production.\n// APPROACH  - Combine Fragments & <> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Fragment shorthand\nfunction Card({ title, children }) {\n  return (\n    <>\n      <h2>{title}</h2>\n      <div className=\"body\">{children}</div>\n    </>\n  );\n}\n// List rendering with keyed fragments\nfunction UserList({ users }) {\n  return (\n    <>\n      {users.map(user => (\n        <Fragment key={user.id}>\n          <h3>{user.name}</h3>\n          <p className=\"email\">{user.email}</p>\n          <hr />\n        </Fragment>\n      ))}\n    </>\n  );\n}\n// Without fragment — creates extra divs (bad for semantics)\nfunction BadStructure({ items }) {\n  return (\n    <div>\n      {items.map(item => (\n        <div key={item.id}>\n          <h4>{item.title}</h4>\n          <p>{item.description}</p>\n        </div>\n      ))}\n    </div>\n  );\n}\n// With fragment — cleaner structure\nfunction GoodStructure({ items }) {\n  return (\n    <>\n      {items.map(item => (\n        <Fragment key={item.id}>\n          <h4>{item.title}</h4>\n          <p>{item.description}</p>\n        </Fragment>\n      ))}\n    </>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Fragments & <> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Fragments with conditional rendering\nfunction Dialog({ isOpen, title, children, onClose }) {\n  if (!isOpen) return null;\n  return (\n    <>\n      <div className=\"modal-overlay\" onClick={onClose} />\n      <div className=\"modal\">\n        <h2>{title}</h2>\n        {children}\n        <button onClick={onClose}>Close</button>\n      </div>\n    </>\n  );\n}\n// Fragments in table rows (required for valid HTML)\nfunction TableRows({ rows }) {\n  return (\n    <table>\n      <tbody>\n        {rows.map(row => (\n          <Fragment key={row.id}>\n            <tr>\n              <td>{row.name}</td>\n              <td>{row.value}</td>\n            </tr>\n            {row.expanded && (\n              <tr className=\"expanded-details\">\n                <td colSpan=\"2\">{row.details}</td>\n              </tr>\n            )}\n          </Fragment>\n        ))}\n      </tbody>\n    </table>\n  );\n}"
                  }
        ],
        tips: [
                  "Use <></> shorthand unless you need a key attribute.",
                  "Use explicit <React.Fragment key={k}> in lists where each item is a fragment.",
                  "Fragments are useful in lists to avoid extra wrapping divs and maintain semantic HTML.",
                  "Fragments don't affect React's reconciliation — they're purely syntactic."
        ],
        mistake: "Using <div> as a wrapper when <Fragment> would be more appropriate — unnecessary divs increase DOM nesting and can break CSS layouts (especially with flexbox/grid).",
        shorthand: {
          verbose: "function Card({ title, children }) {\n  return (\n    <div>\n      <h2>{title}</h2>\n      <div className=\"body\">{children}</div>\n    </div>\n  );\n}",
          concise: "const Card = ({ title, children }) => (\n  <><h2>{title}</h2><div className=\"body\">{children}</div></>\n);",
        },
      },
    ],
  },
]

export default { meta, sections }
