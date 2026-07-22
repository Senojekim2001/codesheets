export const meta = {
  "title": "Performance",
  "domain": "react",
  "sheet": "performance",
  "icon": "⚡"
}

export const sections = [

  // ── Section 1: Performance ─────────────────────────────────────────
  {
    id: "performance",
    title: "Performance",
    entries: [
      {
        id: "react-memo",
        fn: "React.memo()",
        desc: "Wraps a component to skip re-rendering when its props haven't changed.",
        category: "Memoization",
        subtitle: "Skip re-renders when props are unchanged",
        signature: "const MemoComp = React.memo(Component, arePropsEqual?)",
        descLong: "React.memo() is a higher-order component that does a shallow comparison of props. If props haven't changed, the previous render output is reused. Useful for expensive components that receive the same props frequently. Requires that function/object props are stable (useCallback/useMemo) to be effective.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of React.memo() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { memo, useState, useCallback } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of React.memo() — common patterns you'll see in production.\n// APPROACH  - Combine React.memo() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Without memo — re-renders whenever parent renders\nfunction ExpensiveList({ items, onDelete }) {\n  return items.map(item => (\n    <ExpensiveItem key={item.id} item={item} onDelete={onDelete} />\n  ));\n}\n// With memo — only re-renders when items or onDelete changes\nconst ExpensiveList = memo(function ExpensiveList({ items, onDelete }) {\n  return items.map(item => (\n    <ExpensiveItem key={item.id} item={item} onDelete={onDelete} />\n  ));\n});\n// Parent must use useCallback for onDelete to be stable\nfunction Parent() {\n  const [items, setItems] = useState([...]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of React.memo() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst handleDelete = useCallback(id => {\n    setItems(prev => prev.filter(i => i.id !== id));\n  }, []);\n  return <ExpensiveList items={items} onDelete={handleDelete} />;\n}"
                  }
        ],
        tips: [
                  "React.memo only helps if props are actually stable — pair with useCallback for function props.",
                  "Use the React DevTools Profiler to verify memo is preventing renders before adding it.",
                  "Custom comparison: React.memo(Comp, (prev, next) => prev.id === next.id) for fine-grained control.",
                  "Don't memoize every component — the comparison overhead isn't always worth it for cheap renders."
        ],
        mistake: "Using React.memo but passing a new object/function literal each render — the shallow comparison will always fail. Stabilize props with useMemo/useCallback.",
        shorthand: {
          verbose: "const MemoButton = memo(Button);\n\nfunction App() {\n  return <MemoButton onClick={() => handleClick()} style={{ color: 'red' }} />;\n}",
          concise: "const MemoButton = memo(Button);\nconst App = () => {\n  const onClick = useCallback(() => handleClick(), []);\n  const style = useMemo(() => ({ color: 'red' }), []);\n  return <MemoButton onClick={onClick} style={style} />;\n};",
        },
      },
      {
        id: "lazy-suspense",
        fn: "lazy() + Suspense",
        desc: "Dynamically import components to split your bundle and only load code when it's needed.",
        category: "Code Splitting",
        subtitle: "On-demand component loading",
        signature: "const Comp = lazy(() => import('./Comp'))  →  wrap in <Suspense>",
        descLong: "React.lazy() wraps a dynamic import and returns a component. When rendered for the first time, it triggers the import. Suspense provides a fallback while the component is loading. Great for route-level splitting — only load page components when the user navigates to them.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of lazy() + Suspense — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { lazy, Suspense } from 'react';\nimport { Routes, Route } from 'react-router-dom';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of lazy() + Suspense — common patterns you'll see in production.\n// APPROACH  - Combine lazy() + Suspense with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Lazy load heavy components\nconst Dashboard = lazy(() => import('./pages/Dashboard'));\nconst Settings = lazy(() => import('./pages/Settings'));\nfunction App() {\n  return (\n    <Suspense fallback={<PageSpinner />}>\n      <Routes>\n        <Route path=\"/dashboard\" element={<Dashboard />} />\n        <Route path=\"/settings\"  element={<Settings />} />\n      </Routes>\n    </Suspense>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of lazy() + Suspense — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Named export — wrap in default export shim\nconst Chart = lazy(() =>\n  import('./components/Chart').then(m => ({ default: m.Chart }))\n);"
                  }
        ],
        tips: [
                  "Lazy-load at the route level first — the biggest bundle wins are usually per-page components.",
                  "For named exports, use .then(m => ({ default: m.NamedExport })) in the import promise.",
                  "Nest multiple Suspense boundaries for granular loading states.",
                  "Preload on hover/focus by calling the import() manually before the user navigates."
        ],
        mistake: "Defining lazy() inside a component — it creates a new component type on every render, causing the component to unmount and remount. Define lazy() at module level.",
        shorthand: {
          verbose: "function App() {\n  const HeavyChart = lazy(() => import('./Chart'));\n  return <HeavyChart />;\n}",
          concise: "const HeavyChart = lazy(() => import('./Chart'));\nconst App = () => <Suspense fallback={<Spinner />}><HeavyChart /></Suspense>;",
        },
      },
      {
        id: "usetransition",
        fn: "useTransition()",
        desc: "Marks a state update as non-urgent so React can keep the UI responsive during the transition.",
        category: "Concurrent Features",
        subtitle: "Non-blocking state updates",
        signature: "const [isPending, startTransition] = useTransition()",
        descLong: "useTransition lets you mark a state update as a \"transition\" — lower priority than urgent updates like typing. React may interrupt the transition to handle higher-priority updates (e.g. keystrokes). isPending lets you show a loading indicator while the transition is in progress.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useTransition() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useTransition } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useTransition() — common patterns you'll see in production.\n// APPROACH  - Combine useTransition() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction SearchPage() {\n  const [query, setQuery] = useState('');\n  const [results, setResults] = useState([]);\n  const [isPending, startTransition] = useTransition();\n  function handleChange(e) {\n    const val = e.target.value;\n    setQuery(val); // urgent — update input immediately"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useTransition() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nstartTransition(() => {\n      // non-urgent — can be interrupted by new keystrokes\n      setResults(filterResults(val));\n    });\n  }\n  return (\n    <>\n      <input value={query} onChange={handleChange} />\n      {isPending && <Spinner />}\n      <ResultsList results={results} />\n    </>\n  );\n}"
                  }
        ],
        tips: [
                  "Urgent updates (typing, clicking) should NOT be inside startTransition.",
                  "Use isPending to show a subtle loading state during the transition.",
                  "useDeferredValue is the consumer-side version — use it when you can't modify the producer.",
                  "Requires React 18+ with a concurrent-enabled root (ReactDOM.createRoot)."
        ],
        mistake: "Wrapping every setState in startTransition — transitions are for deferred UI updates like filtering long lists, not for all state updates.",
        shorthand: {
          verbose: "const [isPending, startTransition] = useTransition();\n\nconst handleChange = (val) => {\n  startTransition(() => {\n    setQuery(val);\n    setResults(filterData(val));\n  });\n};",
          concise: "const [isPending, startTransition] = useTransition();\nconst handleChange = (val) => { setQuery(val); startTransition(() => setResults(filterData(val))); };",
        },
      },
      {
        id: "usedeferredvalue",
        fn: "useDeferredValue()",
        desc: "Returns a deferred copy of a value that lags behind the current value during rendering.",
        category: "Concurrent Features",
        subtitle: "Defer expensive renders driven by a value",
        signature: "const deferred = useDeferredValue(value)",
        descLong: "useDeferredValue defers re-rendering of parts of the UI driven by a value. During the deferred render, the component uses the old value until React has time to update. The deferred value will always lag behind the current value when the UI is busy. Pair with React.memo to prevent unnecessary renders with the old value.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useDeferredValue() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useDeferredValue, useState, useMemo, memo } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useDeferredValue() — common patterns you'll see in production.\n// APPROACH  - Combine useDeferredValue() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst SearchResults = memo(function SearchResults({ query }) {\n  const items = useMemo(() => filterExpensiveList(query), [query]);\n  return items.map(item => <div key={item.id}>{item.name}</div>);\n});\nexport function SearchPage() {\n  const [query, setQuery] = useState('');\n  const deferredQuery = useDeferredValue(query);\n  const isStale = query !== deferredQuery;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useDeferredValue() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <div>\n      <input\n        value={query}\n        onChange={e => setQuery(e.target.value)}\n        placeholder=\"Search...\"\n      />\n      <div style={{ opacity: isStale ? 0.6 : 1 }}>\n        <SearchResults query={deferredQuery} />\n      </div>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "useDeferredValue is the consumer-side equivalent of useTransition (producer-side).",
                  "Show stale-ness by comparing value !== deferredValue — dim the UI when stale.",
                  "Must wrap the expensive component in React.memo to skip renders during deferral.",
                  "Both useDeferredValue and useTransition require React 18+ concurrent mode."
        ],
        mistake: "Forgetting to wrap the expensive component in React.memo — without it, useDeferredValue has no effect since the component re-renders with every value anyway.",
        shorthand: {
          verbose: "function Results({ query }) {\n  return <div>{/* expensive computation */}</div>;\n}\n\nconst deferredQuery = useDeferredValue(query);\nreturn <Results query={deferredQuery} />;",
          concise: "const Results = memo(({ query }) => <div>{/* expensive computation */}</div>);\nconst deferredQuery = useDeferredValue(query);\nreturn <Results query={deferredQuery} />;",
        },
      },
      {
        id: "profiler",
        fn: "<Profiler>",
        desc: "Measures rendering performance of a part of the React tree and calls a callback with timing data.",
        category: "Profiling",
        subtitle: "Programmatic render time measurement",
        signature: "<Profiler id=\"name\" onRender={callback}>",
        descLong: "The Profiler component records how often a subtree renders and how long each render takes. The onRender callback receives the component id, phase (mount/update), actual and base durations, and timestamps. Disabled in production builds by default.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of <Profiler> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { Profiler } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of <Profiler> — common patterns you'll see in production.\n// APPROACH  - Combine <Profiler> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction onRenderCallback(id, phase, actualDuration, baseDuration) {\n  console.log(`${id} [${phase}]: ${actualDuration.toFixed(2)}ms`);\n}\nfunction App() {\n  return (\n    <Profiler id=\"Navigation\" onRender={onRenderCallback}>\n      <Navigation />\n    </Profiler>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of <Profiler> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// DevTools Profiler — more practical for day-to-day\n// React DevTools → Profiler tab → Record → interact → Stop\n// Click any bar to see which components re-rendered and why"
                  }
        ],
        tips: [
                  "React DevTools Profiler is faster for development — use the <Profiler> component for CI/monitoring.",
                  "actualDuration is the render time for the current commit; baseDuration is the estimated full render.",
                  "Look for components with high actualDuration or ones that render far more often than expected.",
                  "The \"why did you render\" library adds annotations to help understand unnecessary re-renders."
        ],
        mistake: "Guessing which components are slow instead of measuring. Profile first, then optimize — premature memoization adds complexity without solving the actual bottleneck.",
        shorthand: {
          verbose: "<Profiler id=\"List\" onRender={(id, phase, actualDuration) => console.log(actualDuration)}>\n  <List items={items} />\n</Profiler>",
          concise: "<Profiler id=\"List\" onRender={(id, phase, duration) => duration > 1 && console.warn('Slow!')}>\n  <List items={items} />\n</Profiler>",
        },
      },
      {
        id: "state-colocation",
        fn: "State Colocation",
        desc: "Move state as close as possible to where it's used — prevents unrelated components from re-rendering.",
        category: "Render Optimization Patterns",
        subtitle: "Minimize re-render scope by localizing state",
        signature: "// Move state down to the component that uses it",
        descLong: "Lifting state too high causes unnecessary re-renders of sibling and ancestor components. Move state down to the lowest component that needs it. If only one component uses the state, keep it local. Colocation is often more effective than memoization — fewer renders are better than fast renders.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of State Colocation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of State Colocation — common patterns you'll see in production.\n// APPROACH  - Combine State Colocation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// BAD — form state at App level re-renders entire tree\nfunction App() {\n  const [query, setQuery] = useState('');\n  return (\n    <>\n      <SearchInput value={query} onChange={setQuery} />\n      <ExpensiveList />     {/* re-renders on every keystroke! */}\n      <Sidebar />           {/* re-renders on every keystroke! */}\n    </>\n  );\n}\n// GOOD — form state colocated in SearchInput\nfunction SearchInput() {\n  const [query, setQuery] = useState(''); // stays here\n  return <input value={query} onChange={e => setQuery(e.target.value)} />;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of State Colocation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction App() {\n  return (\n    <>\n      <SearchInput />        {/* isolated re-renders */}\n      <ExpensiveList />      {/* never re-renders from search */}\n      <Sidebar />            {/* never re-renders from search */}\n    </>\n  );\n}"
                  }
        ],
        tips: [
                  "Ask: \"what is the smallest set of components that needs this state?\" — put it there.",
                  "State colocation reduces re-renders without any memoization overhead.",
                  "The \"children as prop\" pattern also isolates re-renders — children don't re-render when parent state changes.",
                  "Move state UP (lift) when sharing between siblings; move DOWN (colocate) when exclusive to one branch."
        ],
        mistake: "Lifting all state to a top-level store or App component \"for simplicity\" — it makes every state change re-render the entire tree. Colocate state first, lift only when sharing is necessary.",
        shorthand: {
          verbose: "function App() {\n  const [count, setCount] = useState(0);\n  return <Page count={count} setCount={setCount} />;\n}",
          concise: "function Page() {\n  const [count, setCount] = useState(0);\n  return <Counter count={count} setCount={setCount} />;\n}",
        },
      },
      {
        id: "children-pattern-perf",
        fn: "Children as Props (Performance)",
        desc: "Pass components as children/props to isolate their renders from the parent's state changes.",
        category: "Render Optimization Patterns",
        subtitle: "Isolate renders via prop composition",
        signature: "<Wrapper>{children}</Wrapper>  — children don't re-render with Wrapper",
        descLong: "When a component receives children as a prop, those children are created by the parent and their identity is stable. If the parent re-renders due to its own state change but its props don't change, the children's rendered output is reused without re-rendering them. This is a zero-boilerplate alternative to React.memo in many cases.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Children as Props (Performance) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Children as Props (Performance) — common patterns you'll see in production.\n// APPROACH  - Combine Children as Props (Performance) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Problem: Counter state causes ExpensiveTree to re-render\nfunction App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <button onClick={() => setCount(c => c + 1)}>{count}</button>\n      <ExpensiveTree />  {/* re-renders even though it doesn't use count */}\n    </div>\n  );\n}\n// Solution: extract state into a component, pass expensive tree as children\nfunction Counter({ children }) {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <button onClick={() => setCount(c => c + 1)}>{count}</button>\n      {children}  {/* created by App — stable reference */}\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Children as Props (Performance) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction App() {\n  return (\n    <Counter>\n      <ExpensiveTree />  {/* never re-renders from count changes */}\n    </Counter>\n  );\n}"
                  }
        ],
        tips: [
                  "This technique works because children are created outside the component that has state.",
                  "No useMemo or React.memo needed — the children's element identity is stable by construction.",
                  "Applies to any prop that accepts JSX — not just children.",
                  "Dan Abramov calls this \"lifting content up\" — the inverse of lifting state up."
        ],
        mistake: "Reaching for React.memo immediately when a component re-renders unnecessarily — first try restructuring with state colocation or the children pattern, which have no overhead.",
        shorthand: {
          verbose: "const MemoChild = memo(Child);\n\nfunction Parent() {\n  const [state, setState] = useState(0);\n  return <MemoChild />;\n}",
          concise: "function Parent({ children }) {\n  const [state, setState] = useState(0);\n  return <div>{children}</div>;\n}\n<Parent><Child /></Parent>",
        },
      },
      {
        id: "virtualization",
        fn: "List Virtualization",
        desc: "Only render visible list items — essential for lists with hundreds or thousands of rows.",
        category: "Render Optimization Patterns",
        subtitle: "Render only what's visible in the viewport",
        signature: "import { FixedSizeList } from \"react-window\"",
        descLong: "Virtualizing a list means only rendering the DOM nodes currently visible in the viewport. For 1000+ item lists, virtualization is non-negotiable — rendering all items creates thousands of DOM nodes and causes severe performance problems. react-window and react-virtual are the standard libraries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of List Virtualization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { FixedSizeList as List } from 'react-window';\nimport { useMemo } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of List Virtualization — common patterns you'll see in production.\n// APPROACH  - Combine List Virtualization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst Row = ({ index, style, data }) => (\n  <div style={style} className=\"list-item\">\n    <div className=\"item-content\">\n      <span>{data[index].id}</span>\n      <span>{data[index].name}</span>\n    </div>\n  </div>\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of List Virtualization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nexport default function UserList({ items }) {\n  return (\n    <List\n      height={600}\n      itemCount={items.length}\n      itemSize={50}\n      width=\"100%\"\n      itemData={items}\n    >\n      {Row}\n    </List>\n  );\n}"
                  }
        ],
        tips: [
                  "Always apply the style prop from the row render function — it sets position for the virtual window.",
                  "Use VariableSizeList when row heights differ — provide an itemSize function.",
                  "react-virtual (@tanstack/virtual) is the modern alternative with better TypeScript support.",
                  "Combine with useMemo for stable item data to avoid recreating the list on every render."
        ],
        mistake: "Rendering all 10,000 items in the DOM and using CSS to show/hide — the DOM nodes are all created. Virtualization means truly not rendering off-screen items.",
        shorthand: {
          verbose: "function List({ items }) {\n  return (\n    <div style={{ height: '600px', overflow: 'auto' }}>\n      {items.map(item => <Item key={item.id} item={item} />)}\n    </div>\n  );\n}",
          concise: "function List({ items }) {\n  return <FixedSizeList height={600} itemCount={items.length} itemSize={35}>{({ index, style }) => <Item style={style} item={items[index]} />}</FixedSizeList>;\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
