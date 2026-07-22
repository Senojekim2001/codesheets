export const meta = {
  "title": "Hooks",
  "domain": "react",
  "sheet": "hooks",
  "icon": "🪝"
}

export const sections = [

  // ── Section 1: Core Hooks ─────────────────────────────────────────
  {
    id: "core-hooks",
    title: "Core Hooks",
    entries: [
      {
        id: "usestate",
        fn: "useState()",
        desc: "Adds local state to a functional component. Returns [currentValue, setterFn].",
        category: "State Hooks",
        subtitle: "Local component state",
        signature: "const [state, setState] = useState(initialValue)",
        descLong: "useState returns a state value and a setter. Calling the setter schedules a re-render with the new value. The initial value is only used on the first render. For expensive initial values, pass a function (lazy initialization). State updates are batched in React 18+.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useState() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useState() — common patterns you'll see in production.\n// APPROACH  - Combine useState() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <><p>Count: {count}</p><button onClick={() => setCount(count + 1)}>+</button></>;\n}\nfunction TodoList() {\n  const [todos, setTodos] = useState(() => loadTodosFromStorage());\n  return <div>{todos.map(t => <div key={t.id}>{t.text}</div>)}</div>;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useState() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction Form() {\n  const [count, setCount] = useState(0);\n  const handleClick = () => setCount(prev => prev + 1);\n  return <button onClick={handleClick}>Count: {count}</button>;\n}"
                  }
        ],
        tips: [
                  "Use functional updates for state based on previous state.",
                  "Pass an init function for expensive computations.",
                  "State updates are merged with existing state (shallow).",
                  "Avoid placing setState in render — it causes infinite loops."
        ],
        mistake: "Mutating state directly: todos.push(...) — create new arrays/objects instead.",
        shorthand: {
          verbose: "const [count, setCount] = useState(0);\n\nconst handleClick = () => {\n  setCount(count + 1);\n};\n\nreturn <button onClick={handleClick}>{count}</button>;",
          concise: "const [count, setCount] = useState(0);\nreturn <button onClick={() => setCount(c => c + 1)}>{count}</button>;",
        },
      },
      {
        id: "useeffect",
        fn: "useEffect()",
        desc: "Synchronize a component with an external system — fetch data, subscribe to events, or manipulate the DOM after render.",
        category: "Effect Hooks",
        subtitle: "Side effects after render",
        signature: "useEffect(setup, dependencies?)",
        descLong: "useEffect runs after the component renders and the DOM updates. The setup function can optionally return a cleanup function that runs before the next effect and on unmount. The dependency array controls when the effect re-runs: empty array means mount-only, no array means every render, specific deps means only when those values change. React 18 Strict Mode double-invokes effects in development to catch missing cleanups.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useEffect() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useEffect } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useEffect() — common patterns you'll see in production.\n// APPROACH  - Combine useEffect() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Fetch data on mount\nfunction UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n  useEffect(() => {\n    let cancelled = false;\n    setLoading(true);\n    fetch('/api/users/' + userId)\n      .then(res => res.json())\n      .then(data => {\n        if (!cancelled) {\n          setUser(data);\n          setLoading(false);\n        }\n      });\n    return () => { cancelled = true; };  // cleanup on unmount or userId change\n  }, [userId]);\n  if (loading) return <p>Loading...</p>;\n  return <h1>{user.name}</h1>;\n}\n// Subscribe to browser events\nfunction useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useEffect() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nuseEffect(() => {\n    const handler = () => setWidth(window.innerWidth);\n    window.addEventListener('resize', handler);\n    return () => window.removeEventListener('resize', handler);\n  }, []);  // empty deps = mount/unmount only\n  return width;\n}\n// Sync with external store (e.g., WebSocket)\nfunction useLivePrice(symbol) {\n  const [price, setPrice] = useState(null);\n  useEffect(() => {\n    const ws = new WebSocket('wss://prices.example.com/' + symbol);\n    ws.onmessage = (e) => setPrice(JSON.parse(e.data).price);\n    return () => ws.close();\n  }, [symbol]);\n  return price;\n}"
                  }
        ],
        tips: [
                  "Always return a cleanup function for subscriptions, timers, and event listeners.",
                  "Use a cancelled/aborted flag to prevent setting state after unmount.",
                  "Empty dependency array [] = runs once on mount, cleans up on unmount.",
                  "React 18 Strict Mode runs setup+cleanup twice in dev — if this breaks your effect, you have a bug."
        ],
        mistake: "Omitting the dependency array entirely — the effect runs after every render, which can cause infinite loops if it sets state.",
        shorthand: {
          verbose: "useEffect(() => {\n  fetch('/api/users/' + userId)\n    .then(res => res.json())\n    .then(data => setUser(data));\n}, [userId]);",
          concise: "useEffect(() => {\n  fetch('/api/users/' + userId).then(res => res.json()).then(data => setUser(data));\n}, [userId]);",
        },
      },
      {
        id: "useref",
        fn: "useRef()",
        desc: "Hold a mutable value that persists across renders without causing re-renders — or reference a DOM element.",
        category: "Ref Hooks",
        subtitle: "Mutable refs and DOM access",
        signature: "const ref = useRef(initialValue)",
        descLong: "useRef returns a mutable object with a .current property that persists for the lifetime of the component. Unlike state, changing .current does NOT trigger a re-render. Two primary uses: (1) accessing DOM elements via the ref prop, and (2) storing mutable values like timers, previous state, or flags that should not trigger re-renders.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useRef() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useRef, useEffect, useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useRef() — common patterns you'll see in production.\n// APPROACH  - Combine useRef() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// DOM access — focus an input\nfunction SearchBar() {\n  const inputRef = useRef(null);\n  useEffect(() => {\n    inputRef.current.focus();  // auto-focus on mount\n  }, []);\n  return <input ref={inputRef} placeholder=\"Search...\" />;\n}\n// Mutable value — timer ID\nfunction Stopwatch() {\n  const [time, setTime] = useState(0);\n  const intervalRef = useRef(null);\n  const start = () => {\n    intervalRef.current = setInterval(() => {\n      setTime(t => t + 1);\n    }, 1000);\n  };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useRef() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst stop = () => clearInterval(intervalRef.current);\n  useEffect(() => stop, []);  // cleanup on unmount\n  return (\n    <div>\n      <p>{time}s</p>\n      <button onClick={start}>Start</button>\n      <button onClick={stop}>Stop</button>\n    </div>\n  );\n}\n// Previous value pattern\nfunction usePrevious(value) {\n  const ref = useRef();\n  useEffect(() => {\n    ref.current = value;\n  });\n  return ref.current;\n}\nfunction PriceDisplay({ price }) {\n  const prevPrice = usePrevious(price);\n  const direction = price > prevPrice ? 'up' : 'down';\n  return <span className={direction}>{price}</span>;\n}"
                  }
        ],
        tips: [
                  "ref.current changes do NOT cause re-renders — use state if you need UI updates.",
                  "Refs are perfect for timer IDs, WebSocket instances, and abort controllers.",
                  "Use callback refs (ref={el => ...}) when you need to know when an element mounts.",
                  "Do not read/write ref.current during render — only in effects and event handlers."
        ],
        mistake: "Using useRef to store a value and expecting the component to re-render when it changes — refs are invisible to React rendering. Use useState for values that affect the UI.",
        shorthand: {
          verbose: "const inputRef = useRef(null);\n\nuseEffect(() => {\n  inputRef.current.focus();\n}, []);\n\nreturn <input ref={inputRef} />;",
          concise: "const inputRef = useRef(null);\nuseEffect(() => { inputRef.current?.focus(); }, []);\nreturn <input ref={inputRef} />;",
        },
      },
      {
        id: "usememo-usecallback",
        fn: "useMemo() & useCallback()",
        desc: "Cache expensive computations (useMemo) and function references (useCallback) between renders.",
        category: "Performance Hooks",
        subtitle: "Memoize values and callbacks",
        signature: "useMemo(() => compute(a, b), [a, b])  |  useCallback(fn, [deps])",
        descLong: "useMemo caches the return value of a computation — it only re-runs when dependencies change. useCallback caches a function reference — equivalent to useMemo(() => fn, [deps]). Both are performance optimizations: useMemo avoids expensive recalculations, useCallback prevents unnecessary re-renders of child components that receive the function as a prop (when combined with React.memo).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useMemo() & useCallback() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useMemo, useCallback, useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useMemo() & useCallback() — common patterns you'll see in production.\n// APPROACH  - Combine useMemo() & useCallback() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// useMemo — cache expensive computation\nfunction FilteredList({ items, filter }) {\n  const filtered = useMemo(() => {\n    return items.filter(item =>\n      item.name.toLowerCase().includes(filter.toLowerCase())\n    );\n  }, [items, filter]);  // only recomputes when items or filter change\n  const stats = useMemo(() => ({\n    total: items.length,\n    showing: filtered.length,\n    hidden: items.length - filtered.length,\n  }), [items.length, filtered.length]);\n  return (\n    <div>\n      <p>Showing {stats.showing} of {stats.total}</p>\n      {filtered.map(item => <Item key={item.id} item={item} />)}\n    </div>\n  );\n}\n// useCallback — stabilize function reference for React.memo children\nconst TodoItem = React.memo(function TodoItem({ todo, onToggle }) {\n  return (\n    <li onClick={() => onToggle(todo.id)}>\n      {todo.done ? '✅' : '⬜'} {todo.text}\n    </li>\n  );\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useMemo() & useCallback() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction TodoList() {\n  const [todos, setTodos] = useState([]);\n  const handleToggle = useCallback((id) => {\n    setTodos(prev =>\n      prev.map(t => t.id === id ? { ...t, done: !t.done } : t)\n    );\n  }, []);  // empty deps — uses functional setState\n  return (\n    <ul>\n      {todos.map(t => (\n        <TodoItem key={t.id} todo={t} onToggle={handleToggle} />\n      ))}\n    </ul>\n  );\n}"
                  }
        ],
        tips: [
                  "useMemo and useCallback are optimizations — do not rely on them for correctness.",
                  "useCallback is only useful when the callback is passed to a React.memo child.",
                  "Profile before memoizing — unnecessary memoization adds overhead.",
                  "React Compiler (React 19+) auto-memoizes — manual useMemo/useCallback may become unnecessary."
        ],
        mistake: "Memoizing everything \"just in case\" — each useMemo/useCallback has overhead. Only memoize when profiling shows a performance problem or when passing callbacks to React.memo children.",
        shorthand: {
          verbose: "const filtered = useMemo(() => {\n  return items.filter(item =>\n    item.name.toLowerCase().includes(filter.toLowerCase())\n  );\n}, [items, filter]);",
          concise: "const filtered = useMemo(() => items.filter(item => item.name.toLowerCase().includes(filter.toLowerCase())), [items, filter]);",
        },
      },
      {
        id: "usereducer",
        fn: "useReducer()",
        desc: "Manage complex state transitions with a reducer function — like useState but for state with multiple sub-values or complex update logic.",
        category: "State Hooks",
        subtitle: "Reducer-based state management",
        signature: "const [state, dispatch] = useReducer(reducer, initialState)",
        descLong: "useReducer accepts a reducer function (state, action) => newState and returns the current state paired with a dispatch function. Prefer over useState when: state has multiple related fields, the next state depends on the previous, or update logic is complex. The dispatch function is stable (never changes) — safe to pass to children without useCallback.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useReducer() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useReducer } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useReducer() — common patterns you'll see in production.\n// APPROACH  - Combine useReducer() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Reducer function — pure, no side effects\nfunction todoReducer(state, action) {\n  switch (action.type) {\n    case 'ADD':\n      return [...state, { id: Date.now(), text: action.text, done: false }];\n    case 'TOGGLE':\n      return state.map(t =>\n        t.id === action.id ? { ...t, done: !t.done } : t\n      );\n    case 'DELETE':\n      return state.filter(t => t.id !== action.id);\n    case 'CLEAR_DONE':\n      return state.filter(t => !t.done);\n    default:\n      throw new Error('Unknown action: ' + action.type);\n  }\n}\nfunction TodoApp() {\n  const [todos, dispatch] = useReducer(todoReducer, []);\n  const [text, setText] = useState('');\n  const handleAdd = () => {\n    if (!text.trim()) return;\n    dispatch({ type: 'ADD', text });\n    setText('');\n  };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useReducer() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <div>\n      <input value={text} onChange={e => setText(e.target.value)} />\n      <button onClick={handleAdd}>Add</button>\n      <button onClick={() => dispatch({ type: 'CLEAR_DONE' })}>\n        Clear Done\n      </button>\n      <ul>\n        {todos.map(t => (\n          <li key={t.id}>\n            <span\n              onClick={() => dispatch({ type: 'TOGGLE', id: t.id })}\n              style={{ textDecoration: t.done ? 'line-through' : 'none' }}\n            >\n              {t.text}\n            </span>\n            <button onClick={() => dispatch({ type: 'DELETE', id: t.id })}>\n              x\n            </button>\n          </li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n// Form reducer — complex multi-field state\nfunction formReducer(state, action) {\n  switch (action.type) {\n    case 'SET_FIELD':\n      return { ...state, [action.field]: action.value };\n    case 'SET_ERROR':\n      return { ...state, errors: { ...state.errors, [action.field]: action.error } };\n    case 'RESET':\n      return action.initial;\n    default:\n      return state;\n  }\n}"
                  }
        ],
        tips: [
                  "dispatch is referentially stable — safe to pass as a prop without useCallback.",
                  "Reducer must be a pure function — no side effects, no mutations.",
                  "Throw in the default case to catch unhandled action types during development.",
                  "Combine with useContext to create a lightweight Redux-like store."
        ],
        mistake: "Mutating state inside the reducer — always return a new object. state.push(item) mutates; [...state, item] creates a copy.",
        shorthand: {
          verbose: "function todoReducer(state, action) {\n  switch (action.type) {\n    case 'ADD':\n      return [...state, { id: Date.now(), text: action.text }];\n    default:\n      return state;\n  }\n}\n\nconst [todos, dispatch] = useReducer(todoReducer, []);",
          concise: "const [todos, dispatch] = useReducer((state, action) => {\n  if (action.type === 'ADD') return [...state, action.payload];\n  return state;\n}, []);",
        },
      },
      {
        id: "usetransition-advanced",
        fn: "useTransition() Deep Dive",
        desc: "Advanced patterns for marking state updates as non-urgent, with pending indicators and error handling.",
        category: "Concurrent Features",
        subtitle: "Non-blocking updates with pending UI",
        signature: "const [isPending, startTransition] = useTransition()",
        descLong: "useTransition marks a state update as lower priority than user input. React can interrupt the transition for typing, clicking, or other urgent updates. Use isPending to show loading states. Combines with useDeferredValue, useActionState, and React Router forms for smooth, responsive UIs. React 18+ feature.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useTransition() Deep Dive — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useTransition, useDeferredValue } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useTransition() Deep Dive — common patterns you'll see in production.\n// APPROACH  - Combine useTransition() Deep Dive with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction SearchPage() {\n  const [query, setQuery] = useState('');\n  const [results, setResults] = useState([]);\n  const [isPending, startTransition] = useTransition();\n  // Alternative: useDeferredValue for the same pattern\n  const deferredQuery = useDeferredValue(query);\n  const handleChange = (e) => {\n    const val = e.target.value;\n    setQuery(val); // urgent — updates input immediately\n    startTransition(() => {\n      // Non-urgent — can be interrupted\n      const filtered = filterData(val);\n      setResults(filtered);\n    });\n  };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useTransition() Deep Dive — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <div>\n      <input\n        value={query}\n        onChange={handleChange}\n        placeholder=\"Search...\"\n      />\n      {isPending && (\n        <div className=\"loading-indicator\">\n          Searching for: {query}\n        </div>\n      )}\n      <ResultsList results={results} />\n    </div>\n  );\n}\n// Nested transitions\nfunction SaveForm() {\n  const [data, setData] = useState(null);\n  const [isPending, startTransition] = useTransition();\n  const handleSave = async (formData) => {\n    startTransition(async () => {\n      const result = await saveToServer(formData);\n      setData(result);\n    });\n  };\n  return (\n    <div>\n      {isPending && <p>Saving...</p>}\n      <Form onSave={handleSave} />\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "isPending becomes true immediately when startTransition runs, false when all state updates settle.",
                  "Do not wrap urgent updates (typing, clicking) in startTransition — only non-urgent processing.",
                  "Combine with useTransition for consumer-side and startTransition on producer side.",
                  "Works with async operations — startTransition can wrap async functions that call setState.",
                  "React will visually interrupt the transition if the user types or clicks again."
        ],
        mistake: "Wrapping every setState call in startTransition — transitions are only for deferred, non-blocking updates like filtering long lists or heavy computations.",
        shorthand: {
          verbose: "const [isPending, startTransition] = useTransition();\n\nconst handleChange = (val) => {\n  setQuery(val);\n  startTransition(() => {\n    const results = filterData(val);\n    setResults(results);\n  });\n};",
          concise: "const [isPending, startTransition] = useTransition();\nconst handleChange = (val) => {\n  setQuery(val);\n  startTransition(() => setResults(filterData(val)));\n};",
        },
      },
      {
        id: "usedeferredvalue-advanced",
        fn: "useDeferredValue() Deep Dive",
        desc: "Consumer-side deferred rendering with visual stale state feedback.",
        category: "Concurrent Features",
        subtitle: "Defer expensive renders driven by a value",
        signature: "const deferred = useDeferredValue(value, initialValue?)",
        descLong: "useDeferredValue defers re-rendering a component driven by a value. Returns the old value while React renders the update in the background. The component still renders, but with the stale value. Use value !== deferredValue to detect when rendering is stale and provide visual feedback. Requires React.memo to prevent re-renders with the old value.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useDeferredValue() Deep Dive — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useDeferredValue, useMemo } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useDeferredValue() Deep Dive — common patterns you'll see in production.\n// APPROACH  - Combine useDeferredValue() Deep Dive with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst SearchResults = React.memo(function SearchResults({ query }) {\n  // Expensive computation happens with every query change\n  const items = useMemo(() => {\n    if (!query) return [];\n    return filterExpensiveList(query);\n  }, [query]);\n  return (\n    <div>\n      {items.length === 0 && query && (\n        <p>No results for: {query}</p>\n      )}\n      {items.map(item => (\n        <div key={item.id} className=\"result-item\">\n          <h3>{item.title}</h3>\n          <p>{item.description}</p>\n        </div>\n      ))}\n    </div>\n  );\n});\nexport function SearchPage() {\n  const [query, setQuery] = useState('');\n  const deferredQuery = useDeferredValue(query);\n  // Detect stale rendering\n  const isStale = query !== deferredQuery;\n  return (\n    <div className=\"search-page\">\n      <input\n        value={query}\n        onChange={e => setQuery(e.target.value)}\n        placeholder=\"Type to search...\"\n        className=\"search-input\"\n      />\n      {/* Visual feedback that we're rendering stale results */}\n      <div\n        className=\"results-container\"\n        style={{\n          opacity: isStale ? 0.6 : 1,\n          transition: 'opacity 0.15s ease-out',\n        }}\n      >\n        <SearchResults query={deferredQuery} />\n        {isStale && (\n          <div className=\"stale-indicator\">\n            Updating results for: {query}\n          </div>\n        )}\n      </div>\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useDeferredValue() Deep Dive — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// useTransition vs useDeferredValue\n// useTransition: Producer-side (setState inside startTransition)\n// useDeferredValue: Consumer-side (wrap a value prop)\nfunction SwitchingExample() {\n  const [count, setCount] = useState(0);\n  const [isPending, startTransition] = useTransition();\n  // These are functionally equivalent:\n  // 1. useTransition producer:\n  const handleClick1 = () => {\n    startTransition(() => {\n      setCount(c => c + 1);\n    });\n  };\n  // 2. useDeferredValue consumer:\n  const deferredCount = useDeferredValue(count);\n  return (\n    <div>\n      <button onClick={() => setCount(c => c + 1)}>\n        Increment: {count}\n      </button>\n      {isPending && <p>Updating...</p>}\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "useDeferredValue initialValue param (React 19) lets you render something else until first update.",
                  "Always wrap the expensive component in React.memo — without it, useDeferredValue has no effect.",
                  "Visual feedback (opacity, skeleton) helps users understand the stale state.",
                  "value !== deferredValue tells you when the component is rendering with stale data.",
                  "useDeferredValue is the consumer version; useTransition is the producer version — choose based on where your state update happens."
        ],
        mistake: "Not wrapping the expensive component in React.memo — useDeferredValue only helps if the component skips re-renders with the old value.",
        shorthand: {
          verbose: "const [query, setQuery] = useState('');\nconst deferredQuery = useDeferredValue(query);\nconst isStale = query !== deferredQuery;\n\nreturn (\n  <div style={{ opacity: isStale ? 0.6 : 1 }}>\n    <SearchResults query={deferredQuery} />\n  </div>\n);",
          concise: "const [query, setQuery] = useState('');\nconst deferredQuery = useDeferredValue(query);\nreturn <div style={{ opacity: query !== deferredQuery ? 0.6 : 1 }}><SearchResults query={deferredQuery} /></div>;",
        },
      },
      {
        id: "use-hook",
        fn: "use() Hook (React 19)",
        desc: "Unwrap a promise or read context inside render, working with Suspense for async rendering.",
        category: "React 19 Hooks",
        subtitle: "Promise unwrapping in render",
        signature: "const value = use(promise | context)",
        descLong: "The use() hook (React 19) unwraps a Promise during render and suspends if not ready. Also reads context without needing useContext. This enables passing promises from server components to client components with automatic Suspense integration. Can be conditionally called (no hook rules for use).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of use() Hook (React 19) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { use, Suspense } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of use() Hook (React 19) — common patterns you'll see in production.\n// APPROACH  - Combine use() Hook (React 19) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// use() with Promises\nfunction UserProfile({ userPromise }) {\n  const user = use(userPromise);\n  return <div>Hello, {user.name}</div>;\n}\n// use() with Context\nconst ThemeContext = createContext();\nfunction Button() {\n  const theme = use(ThemeContext);\n  return <button className={theme}>Click</button>;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of use() Hook (React 19) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// use() allows conditional calls\nfunction ConditionalComponent({ dataPromise, shouldLoad }) {\n  let data = null;\n  if (shouldLoad) {\n    data = use(dataPromise); // Only unwraps if shouldLoad is true\n  }\n  return <div>{data ? <p>{data.title}</p> : <p>No data</p>}</div>;\n}\n// Server components passing promises to client\nasync function Page() {\n  const userPromise = fetchUser(id); // Don't await!\n  return (\n    <Suspense fallback={<UserSkeleton />}>\n      <UserProfile userPromise={userPromise} />\n    </Suspense>\n  );\n}\n// Integration with React Router loader\nfunction RouteComponent() {\n  const loaderData = use(loaderPromise);\n  return <div>{loaderData}</div>;\n}"
                  }
        ],
        tips: [
                  "use() can be called conditionally (inside if blocks) — it breaks normal hook rules.",
                  "use(promise) triggers Suspense — wrap the component in a Suspense boundary.",
                  "use(context) is an alternative to useContext() — both work identically.",
                  "Server components can pass promises directly to client components — no await needed.",
                  "use() is perfect for Server-Driven UI patterns with Next.js app router."
        ],
        mistake: "Passing an unwrapped promise to a child component without Suspense — the component will never render until you use() it.",
        shorthand: {
          verbose: "function UserProfile({ userPromise }) {\n  const user = use(userPromise);\n  return <div>Hello, {user.name}</div>;\n}\n\nasync function Page() {\n  const userPromise = fetchUser(id);\n  return <Suspense fallback={<div>Loading...</div>}><UserProfile userPromise={userPromise} /></Suspense>;\n}",
          concise: "function UserProfile({ userPromise }) {\n  const user = use(userPromise);\n  return <div>Hello, {user.name}</div>;\n}\n\nfunction Page() {\n  return <Suspense fallback={<div>Loading...</div>}><UserProfile userPromise={fetchUser(id)} /></Suspense>;\n}",
        },
      },
      {
        id: "use-reducer-patterns",
        fn: "useReducer with TypeScript — Discriminated Unions",
        desc: "Advanced useReducer patterns with TypeScript: discriminated union actions and reducer factories.",
        category: "Advanced State",
        subtitle: "useReducer, discriminated unions, TypeScript, action types",
        signature: "type Action = { type: \"ADD\", payload } | { type: \"REMOVE\", id } | ...  |  useReducer(reducer, initial)",
        descLong: "Discriminated union types in TypeScript make reducers type-safe. Each action type has specific payload shape. Reducer automatically narrows types based on action.type. Factory pattern encapsulates reducer logic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useReducer with TypeScript — Discriminated Unions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useReducer } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useReducer with TypeScript — Discriminated Unions — common patterns you'll see in production.\n// APPROACH  - Combine useReducer with TypeScript — Discriminated Unions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype TodoAction =\n  | { type: 'ADD'; payload: string }\n  | { type: 'TOGGLE'; id: number }\n  | { type: 'DELETE'; id: number }\n  | { type: 'CLEAR_DONE' };\ninterface Todo {\n  id: number;\n  text: string;\n  done: boolean;\n}\ntype TodoState = Todo[];\nfunction todoReducer(state: TodoState, action: TodoAction): TodoState {\n  switch (action.type) {\n    case 'ADD':\n      return [\n        ...state,\n        { id: Date.now(), text: action.payload, done: false },\n      ];\n    case 'TOGGLE':\n      return state.map((t) =>\n        t.id === action.id ? { ...t, done: !t.done } : t\n      );\n    case 'DELETE':\n      return state.filter((t) => t.id !== action.id);\n    case 'CLEAR_DONE':\n      return state.filter((t) => !t.done);\n    default:\n      const exhaustive: never = action;\n      return exhaustive;\n  }\n}\nfunction createReducer<State, Action>(\n  handlers: Record<string, (state: State, action: Action) => State>\n) {\n  return (state: State, action: Action) => {\n    const handler = handlers[(action as any).type];\n    if (!handler) throw new Error(`Unknown action type`);\n    return handler(state, action);\n  };\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useReducer with TypeScript — Discriminated Unions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype FormState = {\n  values: Record<string, any>;\n  errors: Record<string, string>;\n  touched: Record<string, boolean>;\n  isSubmitting: boolean;\n};\ntype FormAction =\n  | { type: 'SET_FIELD'; field: string; value: any }\n  | { type: 'SET_ERROR'; field: string; error: string }\n  | { type: 'SET_TOUCHED'; field: string }\n  | { type: 'RESET' }\n  | { type: 'SET_SUBMITTING'; value: boolean };\nfunction formReducer(state: FormState, action: FormAction): FormState {\n  switch (action.type) {\n    case 'SET_FIELD':\n      return {\n        ...state,\n        values: { ...state.values, [action.field]: action.value },\n      };\n    case 'SET_ERROR':\n      return {\n        ...state,\n        errors: { ...state.errors, [action.field]: action.error },\n      };\n    case 'SET_TOUCHED':\n      return {\n        ...state,\n        touched: { ...state.touched, [action.field]: true },\n      };\n    case 'RESET':\n      return { values: {}, errors: {}, touched: {}, isSubmitting: false };\n    case 'SET_SUBMITTING':\n      return { ...state, isSubmitting: action.value };\n    default:\n      const exhaustive: never = action;\n      return exhaustive;\n  }\n}\nfunction useForm(initialValues: Record<string, any>) {\n  const [state, dispatch] = useReducer(formReducer, {\n    values: initialValues,\n    errors: {},\n    touched: {},\n    isSubmitting: false,\n  });\n  return {\n    ...state,\n    setField: (field: string, value: any) =>\n      dispatch({ type: 'SET_FIELD', field, value }),\n    setError: (field: string, error: string) =>\n      dispatch({ type: 'SET_ERROR', field, error }),\n    setTouched: (field: string) =>\n      dispatch({ type: 'SET_TOUCHED', field }),\n    reset: () => dispatch({ type: 'RESET' }),\n    setSubmitting: (value: boolean) =>\n      dispatch({ type: 'SET_SUBMITTING', value }),\n  };\n}\nfunction TodoApp() {\n  const [todos, dispatch] = useReducer(todoReducer, []);\n  const [input, setInput] = React.useState('');\n  const handleAdd = () => {\n    if (!input.trim()) return;\n    dispatch({ type: 'ADD', payload: input });  // TypeScript validates payload\n    setInput('');\n  };\n  return (\n    <div>\n      <input\n        value={input}\n        onChange={(e) => setInput(e.target.value)}\n        placeholder=\"Add todo...\"\n      />\n      <button onClick={handleAdd}>Add</button>\n      <ul>\n        {todos.map((t) => (\n          <li key={t.id}>\n            <input\n              type=\"checkbox\"\n              checked={t.done}\n              onChange={() => dispatch({ type: 'TOGGLE', id: t.id })}\n            />\n            {t.text}\n            <button onClick={() => dispatch({ type: 'DELETE', id: t.id })}>\n              Delete\n            </button>\n          </li>\n        ))}\n      </ul>\n      <button onClick={() => dispatch({ type: 'CLEAR_DONE' })}>\n        Clear Done\n      </button>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Discriminated unions enforce type safety — TypeScript narrows action shape based on type field.",
                  "The exhaustive never pattern catches missing action types at compile time.",
                  "Reducer factories encapsulate logic — reuse across multiple components.",
                  "Separate action types make reducers clearer than inline switch cases."
        ],
        mistake: "Using any for action payload — lose type safety. Use discriminated unions for compile-time checks.",
        shorthand: {
          verbose: "type Action = { type: 'ADD'; text: string } | { type: 'REMOVE'; id: number };\nfunction reducer(state, action) {\n  if (action.type === 'ADD') return [...state, { text: action.text }];\n  if (action.type === 'REMOVE') return state.filter(x => x.id !== action.id);\n  return state;\n}",
          concise: "type Action = { type: 'ADD'; text: string } | { type: 'REMOVE'; id: number };\nconst reducer = (state, action) => action.type === 'ADD' ? [...state, { text: action.text }] : state.filter(x => x.id !== action.id);",
        },
      },
      {
        id: "use-context-patterns",
        fn: "useContext Patterns — Context + Reducer",
        desc: "Avoid re-renders with useContext: separate state/dispatch, memoize context value.",
        category: "Context API",
        subtitle: "useContext, context + reducer combo, preventing re-renders",
        signature: "const Context = createContext()  |  useContext(Context)",
        descLong: "Context + useReducer pattern creates a lightweight Redux-like store. Split context into state and dispatch to avoid unnecessary re-renders: dispatch never changes. Memoize context value. Pass both context objects to avoid rebuilding.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useContext Patterns — Context + Reducer — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createContext, useContext, useReducer, useMemo } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useContext Patterns — Context + Reducer — common patterns you'll see in production.\n// APPROACH  - Combine useContext Patterns — Context + Reducer with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst StateContext = createContext();\nconst DispatchContext = createContext();\nfunction TodoProvider({ children }) {\n  const [state, dispatch] = useReducer(todoReducer, []);\n  // Memoize context values\n  const stateValue = useMemo(() => state, [state]);\n  const dispatchValue = useMemo(() => dispatch, [dispatch]);\n  return (\n    <StateContext.Provider value={stateValue}>\n      <DispatchContext.Provider value={dispatchValue}>\n        {children}\n      </DispatchContext.Provider>\n    </StateContext.Provider>\n  );\n}\nfunction useTodoState() {\n  const context = useContext(StateContext);\n  if (!context) throw new Error('useTodoState must be used within TodoProvider');\n  return context;\n}\nfunction useTodoDispatch() {\n  const context = useContext(DispatchContext);\n  if (!context) throw new Error('useTodoDispatch must be used within TodoProvider');\n  return context;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useContext Patterns — Context + Reducer — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction TodoList() {\n  const todos = useTodoState();  // Subscribes only to state changes\n  return (\n    <ul>\n      {todos.map((t) => (\n        <TodoItem key={t.id} todo={t} />\n      ))}\n    </ul>\n  );\n}\nfunction TodoItem({ todo }) {\n  const dispatch = useTodoDispatch();  // Doesn't re-render on state changes\n  return (\n    <li\n      onClick={() => dispatch({ type: 'TOGGLE', id: todo.id })}\n      style={{ textDecoration: todo.done ? 'line-through' : 'none' }}\n    >\n      {todo.text}\n      <button onClick={() => dispatch({ type: 'DELETE', id: todo.id })}>x</button>\n    </li>\n  );\n}\nfunction AddTodo() {\n  const dispatch = useTodoDispatch();\n  const [input, setInput] = React.useState('');\n  const handleAdd = () => {\n    dispatch({ type: 'ADD', payload: input });\n    setInput('');\n  };\n  return (\n    <div>\n      <input\n        value={input}\n        onChange={(e) => setInput(e.target.value)}\n        placeholder=\"New todo...\"\n      />\n      <button onClick={handleAdd}>Add</button>\n    </div>\n  );\n}\nfunction App() {\n  return (\n    <TodoProvider>\n      <AddTodo />\n      <TodoList />\n    </TodoProvider>\n  );\n}"
                  }
        ],
        tips: [
                  "Split state and dispatch contexts — dispatch never changes, preventing child re-renders.",
                  "Memoize context values to prevent unnecessary provider re-renders.",
                  "Provide custom hooks (useTodoState, useTodoDispatch) for cleaner usage.",
                  "Validate context existence in hooks — throw clear error if used outside provider."
        ],
        mistake: "Single context with both state and dispatch — children re-render on every state change. Split them.",
        shorthand: {
          verbose: "const StateContext = createContext();\nconst DispatchContext = createContext();\n\nfunction Provider({ children }) {\n  const [state, dispatch] = useReducer(reducer, []);\n  return (\n    <StateContext.Provider value={state}>\n      <DispatchContext.Provider value={dispatch}>\n        {children}\n      </DispatchContext.Provider>\n    </StateContext.Provider>\n  );\n}",
          concise: "const StateContext = createContext();\nconst DispatchContext = createContext();\nfunction Provider({ children }) {\n  const [state, dispatch] = useReducer(reducer, []);\n  return <StateContext.Provider value={state}><DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider></StateContext.Provider>;\n}",
        },
      },
      {
        id: "use-id",
        fn: "useId() Hook — Stable IDs for Accessibility",
        desc: "Generate stable unique IDs for label/input association and accessibility attributes.",
        category: "Utility Hooks",
        subtitle: "useId, unique IDs, accessibility, SSR safe",
        signature: "const id = useId()",
        descLong: "useId generates a unique, stable ID per component instance. Persists across renders and hydration. Ideal for associating labels with form inputs, generating IDs for aria-labelledby, aria-describedby.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useId() Hook — Stable IDs for Accessibility — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useId } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useId() Hook — Stable IDs for Accessibility — common patterns you'll see in production.\n// APPROACH  - Combine useId() Hook — Stable IDs for Accessibility with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction TextField({ label, type = 'text' }) {\n  const id = useId();\n  return (\n    <div>\n      <label htmlFor={id}>{label}</label>\n      <input id={id} type={type} />\n    </div>\n  );\n}\nfunction FormWithValidation() {\n  const nameId = useId();\n  const emailId = useId();\n  const errorId = useId();\n  const [errors, setErrors] = React.useState({});\n  return (\n    <form>\n      <div>\n        <label htmlFor={nameId}>Name</label>\n        <input id={nameId} />\n        {errors.name && (\n          <span id={`${nameId}-error`} role=\"alert\">\n            {errors.name}\n          </span>\n        )}\n      </div>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useId() Hook — Stable IDs for Accessibility — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n<div>\n        <label htmlFor={emailId}>Email</label>\n        <input\n          id={emailId}\n          aria-describedby={errors.email ? `${emailId}-error` : undefined}\n        />\n        {errors.email && (\n          <span id={`${emailId}-error`} role=\"alert\">\n            {errors.email}\n          </span>\n        )}\n      </div>\n    </form>\n  );\n}\nfunction ComplexComponent() {\n  const headingId = useId();\n  const descId = useId();\n  const dialogId = useId();\n  return (\n    <div>\n      <h2 id={headingId}>Title</h2>\n      <p id={descId}>Description</p>\n      <div\n        role=\"dialog\"\n        aria-labelledby={headingId}\n        aria-describedby={descId}\n        id={dialogId}\n      >\n        Dialog content\n      </div>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "useId generates a stable ID that persists across renders and hydration.",
                  "Perfect for label htmlFor associations — screen readers link labels to inputs.",
                  "Use for aria-labelledby, aria-describedby, aria-controls relationships.",
                  "Each useId call per component creates a unique ID — no manual UUID generation needed."
        ],
        mistake: "Using Math.random() or Date.now() for IDs in rendered markup — not stable across renders, breaks accessibility, SSR hydration mismatches.",
        shorthand: {
          verbose: "function TextField({ label }) {\n  const id = useId();\n  return (\n    <div>\n      <label htmlFor={id}>{label}</label>\n      <input id={id} />\n    </div>\n  );\n}",
          concise: "function TextField({ label }) {\n  const id = useId();\n  return <><label htmlFor={id}>{label}</label><input id={id} /></>;\n}",
        },
      },
      {
        id: "use-sync-external-store",
        fn: "useSyncExternalStore — Subscribe to External Stores",
        desc: "Subscribe to external state stores (Redux, Zustand, MobX) with useSyncExternalStore.",
        category: "State Management",
        subtitle: "useSyncExternalStore, external stores, subscription pattern",
        signature: "useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)",
        descLong: "useSyncExternalStore connects a component to an external state management store. Takes: subscribe (function to register listener), getSnapshot (function to read current state), optional getServerSnapshot (for SSR). Handles concurrent rendering correctly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useSyncExternalStore — Subscribe to External Stores — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useSyncExternalStore } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useSyncExternalStore — Subscribe to External Stores — common patterns you'll see in production.\n// APPROACH  - Combine useSyncExternalStore — Subscribe to External Stores with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nlet nextId = 1;\nlet listeners = [];\nlet state = { todos: [], nextId: 1 };\nconst store = {\n  getState: () => state,\n  setState: (newState) => {\n    state = newState;\n    listeners.forEach((listener) => listener());\n  },\n  subscribe: (listener) => {\n    listeners.push(listener);\n    return () => {\n      listeners = listeners.filter((l) => l !== listener);\n    };\n  },\n};\nfunction useTodoStore(selector) {\n  return useSyncExternalStore(\n    store.subscribe,\n    () => selector(store.getState())\n  );\n}\nfunction TodoList() {\n  const todos = useTodoStore((state) => state.todos);\n  return (\n    <ul>\n      {todos.map((t) => (\n        <li key={t.id}>{t.text}</li>\n      ))}\n    </ul>\n  );\n}\nimport { create } from 'zustand';\nimport { subscribeWithSelector } from 'zustand/react';\nconst useStore = create(\n  subscribeWithSelector((set) => ({\n    count: 0,\n    increment: () => set((state) => ({ count: state.count + 1 })),\n  }))\n);\nfunction Counter() {\n  const count = useSyncExternalStore(\n    (listener) => useStore.subscribe((state) => state.count, listener),\n    () => useStore.getState().count\n  );\n  return <div>Count: {count}</div>;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useSyncExternalStore — Subscribe to External Stores — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nimport { createSelector } from '@reduxjs/toolkit';\nfunction TodoCounter() {\n  const selectTodoCount = (state) => state.todos.length;\n  const count = useSyncExternalStore(\n    (listener) => {\n      const unsubscribe = store.subscribe(listener);\n      return unsubscribe;\n    },\n    () => selectTodoCount(store.getState())\n  );\n  return <div>Total todos: {count}</div>;\n}\nfunction useServerSafeStore(selector) {\n  return useSyncExternalStore(\n    store.subscribe,\n    () => selector(store.getState()),\n    () => selector({ todos: [], nextId: 1 })  // Initial server state\n  );\n}"
                  }
        ],
        tips: [
                  "useSyncExternalStore handles concurrent rendering — suspense and startTransition compatible.",
                  "Selector function allows fine-grained subscriptions — only re-render on relevant state changes.",
                  "getServerSnapshot important for SSR — must return consistent initial state on server.",
                  "Most state libraries (Zustand, Redux, MobX) provide hooks; useSyncExternalStore is for custom stores."
        ],
        mistake: "Not providing getServerSnapshot — SSR hydration can mismatch client and server state.",
        shorthand: {
          verbose: "const count = useSyncExternalStore(\n  (listener) => store.subscribe(listener),\n  () => store.getState().count,\n  () => 0  // server snapshot\n);",
          concise: "const count = useSyncExternalStore(store.subscribe, () => store.getState().count, () => 0);",
        },
      },
      {
        id: "use-insertion-effect",
        fn: "useInsertionEffect — CSS-in-JS Injection",
        desc: "Inject styles before DOM paint: useInsertionEffect for CSS-in-JS libraries.",
        category: "Effect Hooks",
        subtitle: "useInsertionEffect, CSS injection, styled-components, emotion",
        signature: "useInsertionEffect(setup, dependencies?)",
        descLong: "useInsertionEffect runs before DOM mutations, ideal for injecting styles. Fires before useLayoutEffect and useEffect. Used by CSS-in-JS libraries (styled-components, emotion) to avoid layout thrashing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useInsertionEffect — CSS-in-JS Injection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useInsertionEffect } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useInsertionEffect — CSS-in-JS Injection — common patterns you'll see in production.\n// APPROACH  - Combine useInsertionEffect — CSS-in-JS Injection with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction StyledComponent() {\n  useInsertionEffect(() => {\n    const style = document.createElement('style');\n    style.textContent = `\n      .my-component {\n        color: blue;\n        font-weight: bold;\n      }\n    `;\n    document.head.appendChild(style);\n    return () => {\n      document.head.removeChild(style);\n    };\n  }, []);\n  return <div className=\"my-component\">Styled text</div>;\n}\nfunction ThemedButton({ theme }) {\n  useInsertionEffect(() => {\n    const style = document.createElement('style');\n    const rules = theme === 'dark'\n      ? `\n        .themed-button {\n          background: #333;\n          color: #fff;\n        }\n      `\n      : `\n        .themed-button {\n          background: #fff;\n          color: #333;\n        }\n      `;\n    style.textContent = rules;\n    document.head.appendChild(style);\n    return () => {\n      document.head.removeChild(style);\n    };\n  }, [theme]);\n  return <button className=\"themed-button\">Click me</button>;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useInsertionEffect — CSS-in-JS Injection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst cssCache = new Map();\nfunction useCSSInJS(styles) {\n  useInsertionEffect(() => {\n    // Generate unique class name\n    const hash = JSON.stringify(styles).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);\n    const className = `css-${hash}`;\n    if (!cssCache.has(className)) {\n      const style = document.createElement('style');\n      const cssText = Object.entries(styles)\n        .map(([key, value]) => `${key} { ${value} }`)\n        .join('');\n      style.textContent = cssText;\n      document.head.appendChild(style);\n      cssCache.set(className, true);\n    }\n    return () => {\n      // Don't remove — styles persist\n    };\n  }, [styles]);\n  const hash = JSON.stringify(styles).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);\n  return `css-${hash}`;\n}\nfunction Button() {\n  const className = useCSSInJS({\n    '.btn': 'padding: 10px; border: none; cursor: pointer;',\n    '.btn:hover': 'opacity: 0.8;',\n  });\n  return <button className={className}>Hover me</button>;\n}"
                  }
        ],
        tips: [
                  "useInsertionEffect runs before DOM paint — styles apply without FOUC (flash of unstyled content).",
                  "Cleanup function still runs, but styles typically persist once injected.",
                  "Order: useInsertionEffect → DOM mutations → useLayoutEffect → useEffect.",
                  "CSS-in-JS libraries use this internally — rarely needed in app code."
        ],
        mistake: "Using useEffect for style injection — styles may not be injected before first paint, causing FOUC.",
        shorthand: {
          verbose: "useInsertionEffect(() => {\n  const style = document.createElement('style');\n  style.textContent = `.my-class { color: blue; }`;\n  document.head.appendChild(style);\n  return () => document.head.removeChild(style);\n}, []);",
          concise: "useInsertionEffect(() => {\n  const style = document.createElement('style');\n  style.textContent = `.my-class { color: blue; }`;\n  document.head.appendChild(style);\n}, []);",
        },
      },
      {
        id: "use-event-pattern",
        fn: "useEvent Pattern — Stable Function Reference",
        desc: "useEvent (RFC) or useStableCallback: stable function reference without stale closures.",
        category: "Custom Hooks",
        subtitle: "useEvent, stable callbacks, closure problems",
        signature: "function useEvent(handler) { const ref = useRef(handler); ... return callback; }",
        descLong: "useEvent is a proposed React hook for stable function references. Until it ships, implement via useRef + useCallback. Problem: useCallback dependencies cause handler function to change. Solution: always return the same function reference, call the latest handler via ref.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useEvent Pattern — Stable Function Reference — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useRef, useCallback } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useEvent Pattern — Stable Function Reference — common patterns you'll see in production.\n// APPROACH  - Combine useEvent Pattern — Stable Function Reference with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction useEvent(handler) {\n  const ref = useRef(handler);\n  // Update ref when handler changes (in render, safe per React docs for refs)\n  ref.current = handler;\n  return useCallback((...args) => {\n    return ref.current(...args);\n  }, []);\n}\nfunction SearchInput() {\n  const [query, setQuery] = React.useState('');\n  // This handler changes when query changes!\n  const handleSearch = useCallback((q) => {\n    console.log('Searching for:', q);\n    // doSearch(q);\n  }, [query]);  // Dependency on query\n  // Every time query changes, handleSearch reference changes\n  // Child components re-render unnecessarily\n  return (\n    <div>\n      <input\n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n        onBlur={() => handleSearch(query)}\n      />\n      <SearchResults onSearch={handleSearch} />\n    </div>\n  );\n}\nfunction SearchInputFixed() {\n  const [query, setQuery] = React.useState('');\n  // Handler always has same reference\n  const handleSearch = useEvent((q) => {\n    console.log('Searching for:', q);\n    // Has access to latest query without dependency\n  });\n  return (\n    <div>\n      <input\n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n        onBlur={() => handleSearch(query)}\n      />\n      <SearchResults onSearch={handleSearch} />\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useEvent Pattern — Stable Function Reference — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst SearchResults = React.memo(function SearchResults({ onSearch }) {\n  // This component doesn't re-render unless onSearch reference changes\n  // With useEvent, it never changes!\n  return <div>Results</div>;\n});\nfunction useEventAdvanced(handler) {\n  const ref = useRef(null);\n  ref.current = handler;\n  return useCallback((...args) => {\n    return ref.current?.(...args);\n  }, []);\n}\nfunction Form() {\n  const [values, setValues] = React.useState({ name: '', email: '' });\n  const handleSubmit = useEvent((e) => {\n    e.preventDefault();\n    // Always has access to latest values without dependency\n    console.log('Submit:', values);\n  });\n  return (\n    <form onSubmit={handleSubmit}>\n      <input\n        value={values.name}\n        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}\n      />\n      <button type=\"submit\">Submit</button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "useEvent returns a stable function reference that never changes.",
                  "Inside the function, you always have access to the latest state/props without dependencies.",
                  "Perfect for passing callbacks to React.memo children — they never re-render.",
                  "useEvent is an RFC; implement as custom hook until it ships in React."
        ],
        mistake: "Using useCallback for event handlers passed to React.memo children — deps change, forcing re-renders. Use useEvent instead.",
        shorthand: {
          verbose: "function useEvent(handler) {\n  const ref = useRef(handler);\n  ref.current = handler;\n  return useCallback((...args) => ref.current(...args), []);\n}\n\nconst handleClick = useEvent(() => {\n  console.log('Clicked');\n});",
          concise: "const useEvent = (handler) => {\n  const ref = useRef(handler);\n  ref.current = handler;\n  return useCallback((...args) => ref.current(...args), []);\n};",
        },
      },
      {
        id: "use-previous",
        fn: "usePrevious Hook — Track Previous Value",
        desc: "Store and access the previous value of a prop or state using useRef and useEffect.",
        category: "Custom Hooks",
        subtitle: "usePrevious, useRef, tracking value changes",
        signature: "function usePrevious(value) { ... }  |  const prev = usePrevious(count)",
        descLong: "usePrevious pattern tracks the previous render value. Implemented with useRef (holds value across renders) and useEffect (updates ref after each render). Compare current vs previous to detect changes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of usePrevious Hook — Track Previous Value — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useRef, useEffect } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of usePrevious Hook — Track Previous Value — common patterns you'll see in production.\n// APPROACH  - Combine usePrevious Hook — Track Previous Value with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction usePrevious(value) {\n  const ref = useRef();\n  useEffect(() => {\n    ref.current = value;\n  }, [value]);\n  return ref.current;\n}\nfunction Price({ price }) {\n  const prevPrice = usePrevious(price);\n  const direction = price > prevPrice ? 'up' : price < prevPrice ? 'down' : 'same';\n  return (\n    <div>\n      <span className={direction}>{price}</span>\n      {direction === 'up' && ' ↑'}\n      {direction === 'down' && ' ↓'}\n    </div>\n  );\n}\nfunction UserProfile({ userId }) {\n  const prevUserId = usePrevious(userId);\n  const [profile, setProfile] = React.useState(null);\n  React.useEffect(() => {\n    if (userId !== prevUserId) {\n      // userId changed — fetch new profile\n      fetch(`/api/users/${userId}`)\n        .then((r) => r.json())\n        .then(setProfile);\n    }\n  }, [userId, prevUserId]);\n  return <div>{profile?.name}</div>;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of usePrevious Hook — Track Previous Value — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction usePreviousGeneric(value, initialValue) {\n  const ref = useRef(initialValue);\n  useEffect(() => {\n    ref.current = value;\n  }, [value]);\n  return ref.current;\n}\nfunction useChangedProperty(obj, property) {\n  const prevObj = usePrevious(obj);\n  return {\n    changed: obj?.[property] !== prevObj?.[property],\n    previous: prevObj?.[property],\n    current: obj?.[property],\n  };\n}\nfunction Item({ data }) {\n  const nameChange = useChangedProperty(data, 'name');\n  return (\n    <div>\n      <span className={nameChange.changed ? 'highlight' : ''}>\n        {data.name}\n      </span>\n      {nameChange.changed && (\n        <span className=\"subtle\">\n          (was: {nameChange.previous})\n        </span>\n      )}\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "usePrevious returns the value from the previous render — undefined on first render.",
                  "Useful for detecting value changes without additional state.",
                  "Compare current vs previous to trigger side effects conditionally.",
                  "Don't rely on usePrevious for correctness — it's a convenience hook."
        ],
        mistake: "Trying to access prevValue immediately after setState — it doesn't update synchronously. usePrevious updates after render completes.",
        shorthand: {
          verbose: "function usePrevious(value) {\n  const ref = useRef();\n  useEffect(() => {\n    ref.current = value;\n  }, [value]);\n  return ref.current;\n}\n\nconst prev = usePrevious(count);\nconst changed = count !== prev;",
          concise: "const usePrevious = (v) => { const ref = useRef(); useEffect(() => { ref.current = v; }, [v]); return ref.current; };\nconst prev = usePrevious(count);",
        },
      },
      {
        id: "use-debounce",
        fn: "useDebounce & useThrottle Custom Hooks",
        desc: "Debounce and throttle state/callbacks: delay updates, limit function calls.",
        category: "Custom Hooks",
        subtitle: "useDebounce, useThrottle, rate limiting",
        signature: "function useDebounce(value, delay) { ... }  |  function useThrottle(fn, delay) { ... }",
        descLong: "useDebounce delays state updates (wait until user stops typing). useThrottle limits function calls (max once per delay). Essential for search inputs, resize handlers, scroll listeners.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useDebounce & useThrottle Custom Hooks — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useEffect, useRef, useCallback } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useDebounce & useThrottle Custom Hooks — common patterns you'll see in production.\n// APPROACH  - Combine useDebounce & useThrottle Custom Hooks with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction useDebounce(value, delay = 500) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}\nfunction SearchUsers() {\n  const [query, setQuery] = useState('');\n  const debouncedQuery = useDebounce(query, 300);\n  const [results, setResults] = useState([]);\n  const [loading, setLoading] = useState(false);\n  useEffect(() => {\n    if (!debouncedQuery) {\n      setResults([]);\n      return;\n    }\n    setLoading(true);\n    fetch(`/api/users?q=${debouncedQuery}`)\n      .then((r) => r.json())\n      .then((data) => {\n        setResults(data);\n        setLoading(false);\n      });\n  }, [debouncedQuery]);\n  return (\n    <div>\n      <input\n        type=\"text\"\n        value={query}\n        onChange={(e) => setQuery(e.target.value)}\n        placeholder=\"Search...\"\n      />\n      {loading && <p>Loading...</p>}\n      <ul>\n        {results.map((user) => (\n          <li key={user.id}>{user.name}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}\nfunction useThrottle(fn, delay = 300) {\n  const timeoutRef = useRef(null);\n  const lastRunRef = useRef(Date.now());\n  return useCallback(\n    (...args) => {\n      const now = Date.now();\n      const remainingTime = delay - (now - lastRunRef.current);\n      if (remainingTime <= 0) {\n        // Run immediately\n        fn(...args);\n        lastRunRef.current = now;\n      } else {\n        // Schedule for later\n        if (timeoutRef.current) clearTimeout(timeoutRef.current);\n        timeoutRef.current = setTimeout(() => {\n          fn(...args);\n          lastRunRef.current = Date.now();\n        }, remainingTime);\n      }\n    },\n    [fn, delay]\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useDebounce & useThrottle Custom Hooks — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction ResponsiveGrid() {\n  const [columns, setColumns] = useState(3);\n  const handleResize = useThrottle(() => {\n    const width = window.innerWidth;\n    const cols = width < 600 ? 1 : width < 1200 ? 2 : 3;\n    setColumns(cols);\n  }, 300);\n  useEffect(() => {\n    window.addEventListener('resize', handleResize);\n    return () => window.removeEventListener('resize', handleResize);\n  }, [handleResize]);\n  return (\n    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }}>\n      {[...Array(12)].map((_, i) => (\n        <div key={i} className=\"card\">Item {i + 1}</div>\n      ))}\n    </div>\n  );\n}\nfunction useDebounceFn(fn, delay = 500) {\n  const timeoutRef = useRef(null);\n  return useCallback(\n    (...args) => {\n      if (timeoutRef.current) clearTimeout(timeoutRef.current);\n      timeoutRef.current = setTimeout(() => fn(...args), delay);\n    },\n    [fn, delay]\n  );\n}\nfunction AutoSavingForm() {\n  const [data, setData] = useState({ title: '', content: '' });\n  const saveToServer = useDebounceFn(async (formData) => {\n    console.log('Saving:', formData);\n    await fetch('/api/save', { method: 'POST', body: JSON.stringify(formData) });\n  }, 1000);\n  const handleChange = (e) => {\n    const updated = { ...data, [e.target.name]: e.target.value };\n    setData(updated);\n    saveToServer(updated);\n  };\n  return (\n    <form>\n      <input\n        name=\"title\"\n        value={data.title}\n        onChange={handleChange}\n        placeholder=\"Title...\"\n      />\n      <textarea\n        name=\"content\"\n        value={data.content}\n        onChange={handleChange}\n        placeholder=\"Content...\"\n      />\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "useDebounce delays updates — ideal for search inputs, filter fields (wait until user finishes typing).",
                  "useThrottle limits function calls — ideal for scroll/resize listeners (fire max once per delay).",
                  "Debounce waits for silence; throttle fires periodically. Choose based on use case.",
                  "Clean up timers in useEffect return to prevent memory leaks."
        ],
        mistake: "Not cleaning up timeouts — multiple debounce/throttle hooks without cleanup cause memory leaks.",
        shorthand: {
          verbose: "function useDebounce(value, delay = 500) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}",
          concise: "const useDebounce = (v, d = 500) => { const [d, setD] = useState(v); useEffect(() => { const t = setTimeout(() => setD(v), d); return () => clearTimeout(t); }, [v, d]); return d; };",
        },
      },
      {
        id: "use-local-storage",
        fn: "useLocalStorage Custom Hook",
        desc: "Sync state with localStorage: persist data, SSR-safe, two-way binding.",
        category: "Custom Hooks",
        subtitle: "useLocalStorage, localStorage sync, persistence",
        signature: "function useLocalStorage(key, initialValue) { ... }  |  [value, setValue] = useLocalStorage(key)",
        descLong: "useLocalStorage keeps component state synced with localStorage. Reads initial value from storage, updates storage on state change. Works with JSON objects. SSR-safe: detects browser environment.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useLocalStorage Custom Hook — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useEffect } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useLocalStorage Custom Hook — common patterns you'll see in production.\n// APPROACH  - Combine useLocalStorage Custom Hook with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction useLocalStorage(key, initialValue) {\n  const [state, setState] = useState(() => {\n    try {\n      // Browser only: read from localStorage\n      if (typeof window === 'undefined') return initialValue;\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      console.error(`Error reading localStorage key \"${key}\":`, error);\n      return initialValue;\n    }\n  });\n  // Update localStorage when state changes\n  useEffect(() => {\n    try {\n      if (typeof window === 'undefined') return;\n      window.localStorage.setItem(key, JSON.stringify(state));\n    } catch (error) {\n      console.error(`Error writing to localStorage key \"${key}\":`, error);\n    }\n  }, [key, state]);\n  return [state, setState];\n}\nfunction App() {\n  const [theme, setTheme] = useLocalStorage('theme', 'light');\n  return (\n    <div className={theme}>\n      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n        Toggle Theme\n      </button>\n    </div>\n  );\n}\nfunction FormWithPersistence() {\n  const [formData, setFormData] = useLocalStorage('formData', {\n    name: '',\n    email: '',\n  });\n  const handleChange = (e) => {\n    setFormData((prev) => ({\n      ...prev,\n      [e.target.name]: e.target.value,\n    }));\n  };\n  const handleClear = () => {\n    setFormData({ name: '', email: '' });\n  };\n  return (\n    <form>\n      <input\n        name=\"name\"\n        value={formData.name}\n        onChange={handleChange}\n        placeholder=\"Name\"\n      />\n      <input\n        name=\"email\"\n        value={formData.email}\n        onChange={handleChange}\n        placeholder=\"Email\"\n      />\n      <button type=\"button\" onClick={handleClear}>Clear</button>\n    </form>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useLocalStorage Custom Hook — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction useLocalStorageAdvanced(key, initialValue, options = {}) {\n  const { serialize = JSON.stringify, deserialize = JSON.parse } = options;\n  const [state, setState] = useState(() => {\n    if (typeof window === 'undefined') return initialValue;\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? deserialize(item) : initialValue;\n    } catch (error) {\n      console.error(`Failed to read localStorage[\"${key}\"]:`, error);\n      return initialValue;\n    }\n  });\n  const setValue = (value) => {\n    try {\n      const resolved = typeof value === 'function' ? value(state) : value;\n      setState(resolved);\n      if (typeof window !== 'undefined') {\n        window.localStorage.setItem(key, serialize(resolved));\n      }\n    } catch (error) {\n      console.error(`Failed to write localStorage[\"${key}\"]:`, error);\n    }\n  };\n  // Listen to other tabs' storage changes\n  useEffect(() => {\n    if (typeof window === 'undefined') return;\n    const handleStorageChange = (e) => {\n      if (e.key === key && e.newValue) {\n        try {\n          setState(deserialize(e.newValue));\n        } catch (error) {\n          console.error(`Failed to sync from storage event:`, error);\n        }\n      }\n    };\n    window.addEventListener('storage', handleStorageChange);\n    return () => window.removeEventListener('storage', handleStorageChange);\n  }, [key, deserialize]);\n  return [state, setValue];\n}\nfunction MultiTabSync() {\n  const [sharedData, setSharedData] = useLocalStorageAdvanced('shared', {\n    count: 0,\n  });\n  return (\n    <div>\n      <p>Shared Count: {sharedData.count}</p>\n      <button\n        onClick={() =>\n          setSharedData((prev) => ({ ...prev, count: prev.count + 1 }))\n        }\n      >\n        Increment\n      </button>\n      <p>Changes in other tabs update here!</p>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "useLocalStorage persists data across page reloads — survives browser restarts.",
                  "SSR-safe: check typeof window before accessing localStorage.",
                  "JSON.parse/stringify work for objects; customize for complex types.",
                  "Listen to storage events for cross-tab sync — changes in one tab update others."
        ],
        mistake: "Accessing localStorage in render or SSR context — will crash in Node.js. Always check typeof window.",
        shorthand: {
          verbose: "function useLocalStorage(key, initialValue) {\n  const [state, setState] = useState(() => {\n    if (typeof window === 'undefined') return initialValue;\n    const item = window.localStorage.getItem(key);\n    return item ? JSON.parse(item) : initialValue;\n  });\n\n  useEffect(() => {\n    if (typeof window !== 'undefined') {\n      window.localStorage.setItem(key, JSON.stringify(state));\n    }\n  }, [key, state]);\n\n  return [state, setState];\n}",
          concise: "const useLocalStorage = (key, init) => {\n  const [state, setState] = useState(() => {\n    if (typeof window === 'undefined') return init;\n    const item = window.localStorage.getItem(key);\n    return item ? JSON.parse(item) : init;\n  });\n  useEffect(() => { window.localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);\n  return [state, setState];\n};",
        },
      },
      {
        id: "custom-hook-patterns",
        fn: "Custom Hook Patterns & Best Practices",
        desc: "Advanced patterns for building reusable, testable, and composable custom hooks.",
        category: "Custom Hooks",
        subtitle: "Patterns for scalable hook development",
        signature: "function useCustom(options) { /* hooks */ return value }",
        descLong: "Custom hooks are the modern way to share stateful logic. Key patterns: single responsibility, clear naming, explicit dependencies, return objects for flexibility, and composition. Always test custom hooks in isolation. Avoid putting too much logic in a single hook — compose smaller hooks instead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Hook Patterns & Best Practices — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useEffect, useCallback, useRef, useMemo } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Hook Patterns & Best Practices — common patterns you'll see in production.\n// APPROACH  - Combine Custom Hook Patterns & Best Practices with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Pattern 1: Single responsibility\nfunction useWindowSize() {\n  const [size, setSize] = useState({ width: 0, height: 0 });\n  useEffect(() => {\n    const handleResize = () => {\n      setSize({ width: window.innerWidth, height: window.innerHeight });\n    };\n    window.addEventListener('resize', handleResize);\n    return () => window.removeEventListener('resize', handleResize);\n  }, []);\n  return size;\n}\n// Pattern 2: Composable hooks\nfunction useAsync(fn, deps = []) {\n  const [state, setState] = useState({ loading: true, data: null, error: null });\n  useEffect(() => {\n    let isMounted = true;\n    (async () => {\n      try {\n        const result = await fn();\n        if (isMounted) setState({ loading: false, data: result, error: null });\n      } catch (error) {\n        if (isMounted) setState({ loading: false, data: null, error });\n      }\n    })();\n    return () => { isMounted = false; };\n  }, deps);\n  return state;\n}\nfunction useDebounce(value, delay = 500) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}\n// Pattern 3: Composition of hooks\nfunction useFetchSearch(searchFn, delay = 500) {\n  const [query, setQuery] = useState('');\n  const debouncedQuery = useDebounce(query, delay);\n  const { data, loading, error } = useAsync(\n    () => searchFn(debouncedQuery),\n    [debouncedQuery]\n  );\n  return { query, setQuery, results: data, loading, error };\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Hook Patterns & Best Practices — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Pattern 4: Hook with options object\nfunction usePagination(items, { pageSize = 10 } = {}) {\n  const [page, setPage] = useState(1);\n  const paginatedItems = useMemo(() => {\n    const start = (page - 1) * pageSize;\n    return items.slice(start, start + pageSize);\n  }, [items, page, pageSize]);\n  const totalPages = Math.ceil(items.length / pageSize);\n  return {\n    page,\n    setPage,\n    items: paginatedItems,\n    totalPages,\n    hasNextPage: page < totalPages,\n    hasPrevPage: page > 1,\n    goToNextPage: () => setPage(p => Math.min(p + 1, totalPages)),\n    goToPrevPage: () => setPage(p => Math.max(p - 1, 1)),\n  };\n}\n// Pattern 5: Return object with stable reference\nfunction useForm(initialValues) {\n  const [values, setValues] = useState(initialValues);\n  const [errors, setErrors] = useState({});\n  const handleChange = useCallback((e) => {\n    const { name, value } = e.target;\n    setValues(prev => ({ ...prev, [name]: value }));\n  }, []);\n  const handleSubmit = useCallback((onSubmit) => {\n    return (e) => {\n      e.preventDefault();\n      onSubmit(values);\n    };\n  }, [values]);\n  const reset = useCallback(() => {\n    setValues(initialValues);\n    setErrors({});\n  }, [initialValues]);\n  return useMemo(() => ({\n    values,\n    setValues,\n    errors,\n    setErrors,\n    handleChange,\n    handleSubmit,\n    reset,\n  }), [values, errors, handleChange, handleSubmit, reset]);\n}\n// Usage\nfunction SearchUsers() {\n  const { query, setQuery, results, loading } = useFetchSearch(\n    async (q) => {\n      const res = await fetch(`/api/users?q=${q}`);\n      return res.json();\n    }\n  );\n  return (\n    <div>\n      <input\n        value={query}\n        onChange={e => setQuery(e.target.value)}\n        placeholder=\"Search users...\"\n      />\n      {loading && <p>Loading...</p>}\n      {results?.map(user => <div key={user.id}>{user.name}</div>)}\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Each custom hook call gets its own isolated state — two components calling the same hook have separate state instances.",
                  "Return an object from hooks with multiple values — consumers can destructure what they need.",
                  "Name hooks starting with \"use\" — the linter enforces hook rules inside them.",
                  "Consider memoizing the return object if the hook is passed to React.memo children.",
                  "Test custom hooks using @testing-library/react-hooks or similar tools.",
                  "Avoid putting too much logic in one hook — compose simpler hooks for better reusability."
        ],
        mistake: "Creating a \"god hook\" that does too much (auth + theme + notifications) — break it into smaller, single-purpose hooks and compose them.",
        shorthand: {
          verbose: "function useAsync(fn, deps = []) {\n  const [state, setState] = useState({ loading: true, data: null, error: null });\n\n  useEffect(() => {\n    (async () => {\n      try {\n        const result = await fn();\n        setState({ loading: false, data: result, error: null });\n      } catch (error) {\n        setState({ loading: false, data: null, error });\n      }\n    })();\n  }, deps);\n\n  return state;\n}",
          concise: "function useAsync(fn, deps = []) {\n  const [state, setState] = useState({ loading: true, data: null, error: null });\n  useEffect(() => { fn().then(data => setState({ loading: false, data, error: null })).catch(error => setState({ loading: false, data: null, error })); }, deps);\n  return state;\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
