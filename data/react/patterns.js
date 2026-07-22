export const meta = {
  "title": "Patterns & State",
  "domain": "react",
  "sheet": "patterns",
  "icon": "🧩"
}

export const sections = [

  // ── Section 1: Patterns & State ─────────────────────────────────────────
  {
    id: "patterns-state",
    title: "Patterns & State",
    entries: [
      {
        id: "compound-components",
        fn: "Compound Components",
        desc: "A set of components that work together as a cohesive unit with shared internal state via Context.",
        category: "Component Patterns",
        subtitle: "Flexible component composition with implicit sharing",
        signature: "<Tabs>\n  <Tabs.List>\n    <Tabs.Trigger value=\"tab1\">Tab 1</Tabs.Trigger>\n  </Tabs.List>\n  <Tabs.Content value=\"tab1\">Content</Tabs.Content>\n</Tabs>",
        descLong: "Compound Components let you build flexible, self-contained component groups where sibling components share state via Context. Each sub-component (Tabs.List, Tabs.Trigger, Tabs.Content) knows how to work together without explicit prop drilling. This pattern gives you a clean, intuitive API while keeping complexity internal.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Compound Components — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createContext, useContext, useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Compound Components — common patterns you'll see in production.\n// APPROACH  - Combine Compound Components with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst TabsContext = createContext();\nfunction Tabs({ children, defaultValue }) {\n  const [value, setValue] = useState(defaultValue);\n  return (\n    <TabsContext.Provider value={{ value, setValue }}>\n      <div className=\"tabs\">{children}</div>\n    </TabsContext.Provider>\n  );\n}\nfunction TabsList({ children }) {\n  return <div className=\"tabs-list\">{children}</div>;\n}\nfunction TabsTrigger({ value, children }) {\n  const { value: active, setValue } = useContext(TabsContext);\n  return (\n    <button\n      className={active === value ? 'active' : ''}\n      onClick={() => setValue(value)}\n    >\n      {children}\n    </button>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Compound Components — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction TabsContent({ value, children }) {\n  const { value: active } = useContext(TabsContext);\n  return active === value ? <div className=\"tabs-content\">{children}</div> : null;\n}\nTabs.List = TabsList;\nTabs.Trigger = TabsTrigger;\nTabs.Content = TabsContent;\n// Usage\n<Tabs defaultValue=\"tab1\">\n  <Tabs.List>\n    <Tabs.Trigger value=\"tab1\">Tab 1</Tabs.Trigger>\n    <Tabs.Trigger value=\"tab2\">Tab 2</Tabs.Trigger>\n  </Tabs.List>\n  <Tabs.Content value=\"tab1\">Content 1</Tabs.Content>\n  <Tabs.Content value=\"tab2\">Content 2</Tabs.Content>\n</Tabs>"
                  }
        ],
        tips: [
                  "Compound Components create an intuitive, self-documenting API — the structure tells you how to use it.",
                  "Use Context inside to share state between sub-components without prop drilling.",
                  "Great for complex UI components: Tabs, Accordion, Dialog, Dropdown menus.",
                  "Error if children use sub-components in the wrong order — validate in Context hooks."
        ],
        mistake: "Trying to use Tabs.Content outside of a Tabs.List wrapper — the Context won't be available. Always structure compound components correctly.",
        shorthand: {
          verbose: "// WRONG — Tabs.Panel outside Tabs\n<Tabs.Panel>...</Tabs.Panel>\n\n// RIGHT — Tabs.Panel inside Tabs\n<Tabs>\n  <Tabs.List><Tabs.Trigger>Tab 1</Tabs.Trigger></Tabs.List>\n  <Tabs.Panel>Content</Tabs.Panel>\n</Tabs>",
          concise: "// Always nest sub-components correctly\n<Tabs>\n  <Tabs.List><Tabs.Trigger>Tab 1</Tabs.Trigger></Tabs.List>\n  <Tabs.Panel>Content</Tabs.Panel>\n</Tabs>",
        },
      },
      {
        id: "render-props-pattern",
        fn: "Render Props",
        desc: "A function passed as a prop that returns JSX, allowing flexible child rendering and state sharing.",
        category: "Component Patterns",
        subtitle: "Share component state via render function prop",
        signature: "<MouseTracker render={(x, y) => <p>{x}, {y}</p>} />",
        descLong: "Render Props is a pattern where a component accepts a function as a prop (typically named \"render\" or \"children\") that returns JSX. The component manages state internally and calls the render function with data. This pattern gives the parent full control over rendering while letting the component handle logic. Similar to slots in Vue.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Render Props — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useEffect, useCallback } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Render Props — common patterns you'll see in production.\n// APPROACH  - Combine Render Props with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction MouseTracker({ render }) {\n  const [pos, setPos] = useState({ x: 0, y: 0 });\n  useEffect(() => {\n    const handleMove = (e) => {\n      setPos({ x: e.clientX, y: e.clientY });\n    };\n    window.addEventListener('mousemove', handleMove);\n    return () => window.removeEventListener('mousemove', handleMove);\n  }, []);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Render Props — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <div style={{ width: '100%', height: '100vh' }}>\n      {render(pos)}\n    </div>\n  );\n}\nfunction App() {\n  return (\n    <MouseTracker\n      render={({ x, y }) => (\n        <div style={{ position: 'absolute', left: x, top: y }}>\n          Cursor at {x}, {y}\n        </div>\n      )}\n    />\n  );\n}"
                  }
        ],
        tips: [
                  "Render Props and children-as-function are equivalent patterns — use whichever reads better.",
                  "The render function is called on every render — it's not a performance bottleneck for simple UI.",
                  "Keys matter: if you use render props with lists, pass a key to the returned element.",
                  "Modern custom hooks usually replace Render Props — they're simpler and more composable."
        ],
        mistake: "Defining the render function inline without useCallback — this creates a new function every render. If passing to a memoized child, wrap in useCallback.",
        shorthand: {
          verbose: "const renderItem = (item) => <div>{item.name}</div>;\n\n<List items={items} renderItem={renderItem} />",
          concise: "const renderItem = useCallback((item) => <div>{item.name}</div>, []);\n<List items={items} renderItem={renderItem} />",
        },
      },
      {
        id: "higher-order-components-pattern",
        fn: "Higher-Order Components (HOC)",
        desc: "A function that takes a component and returns an enhanced component with additional props or logic.",
        category: "Component Patterns",
        subtitle: "Component enhancement via function wrapping",
        signature: "const EnhancedComponent = withFeature(OriginalComponent)",
        descLong: "A Higher-Order Component (HOC) is a function that accepts a component and returns a new component with added behavior (state, props, hooks, etc.). HOCs are a legacy pattern — custom hooks are usually preferred today because they're simpler and avoid wrapper hell. Use HOCs when you need to modify class component props or add Provider wrappers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Higher-Order Components (HOC) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Higher-Order Components (HOC) — common patterns you'll see in production.\n// APPROACH  - Combine Higher-Order Components (HOC) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// HOC that adds theme prop\nfunction withTheme(Component) {\n  return function ThemedComponent(props) {\n    const [theme, setTheme] = useState('light');\n    const toggleTheme = () => {\n      setTheme(prev => prev === 'light' ? 'dark' : 'light');\n    };\n    return (\n      <Component\n        {...props}\n        theme={theme}\n        onToggleTheme={toggleTheme}\n      />\n    );\n  };\n}\nfunction Button({ theme, onToggleTheme, label }) {\n  return (\n    <div style={{ background: theme === 'light' ? '#fff' : '#000' }}>\n      <button onClick={onToggleTheme}>{label}</button>\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Higher-Order Components (HOC) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst ThemedButton = withTheme(Button);\n// Usage\n<ThemedButton label=\"Toggle Theme\" />\n// HOC with display name debugging\nfunction withDisplayName(hoc) {\n  return function(Component) {\n    const Wrapped = hoc(Component);\n    Wrapped.displayName = `withDisplayName(${Component.displayName || Component.name})`;\n    return Wrapped;\n  };\n}"
                  }
        ],
        tips: [
                  "HOCs can wrap a component multiple times — use static methods and refs carefully to avoid issues.",
                  "Set a displayName for easier debugging: Wrapped.displayName = `with${WrappedComponent.name}`.",
                  "Copy static methods from the wrapped component using hoist-non-react-statics package.",
                  "Prefer custom hooks — they're simpler, avoid wrapper nesting, and don't have prop naming collisions."
        ],
        mistake: "Returning a new component class on every render instead of defining the HOC outside — this resets the component state on each render. Define HOCs at module level.",
        shorthand: {
          verbose: "function App() {\n  const withTheme = (Component) => (props) => <ThemeProvider><Component {...props} /></ThemeProvider>;\n  const Wrapped = withTheme(MyComponent);\n  return <Wrapped />;\n}",
          concise: "const withTheme = (Component) => (props) => <ThemeProvider><Component {...props} /></ThemeProvider>;\nconst Wrapped = withTheme(MyComponent);\nconst App = () => <Wrapped />;",
        },
      },
      {
        id: "context-usereducer",
        fn: "Context + useReducer",
        desc: "Combine createContext and useReducer for lightweight global state management without external libraries.",
        category: "State Management",
        subtitle: "Mini-Redux with Context API",
        signature: "const StateContext = createContext();\nconst [state, dispatch] = useReducer(reducer, init);",
        descLong: "Context + useReducer is a lightweight alternative to Redux for global state. Create a Context, manage state with useReducer, and provide both state and dispatch in the Context value. This pattern scales well up to medium complexity — for large apps with frequent updates, prefer Zustand or Redux.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Context + useReducer — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createContext, useReducer, useContext } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Context + useReducer — common patterns you'll see in production.\n// APPROACH  - Combine Context + useReducer with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst AppContext = createContext();\nconst initialState = { user: null, theme: 'light', notifications: [] };\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'SET_USER':\n      return { ...state, user: action.payload };\n    case 'SET_THEME':\n      return { ...state, theme: action.payload };\n    case 'ADD_NOTIFICATION':\n      return { ...state, notifications: [...state.notifications, action.payload] };\n    case 'CLEAR_NOTIFICATIONS':\n      return { ...state, notifications: [] };\n    default:\n      return state;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Context + useReducer — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction AppProvider({ children }) {\n  const [state, dispatch] = useReducer(reducer, initialState);\n  return (\n    <AppContext.Provider value={{ state, dispatch }}>\n      {children}\n    </AppContext.Provider>\n  );\n}\nfunction useAppState() {\n  const ctx = useContext(AppContext);\n  if (!ctx) throw new Error('useAppState must be used within AppProvider');\n  return ctx;\n}\n// Usage in component\nfunction Profile() {\n  const { state, dispatch } = useAppState();\n  return (\n    <div>\n      <p>User: {state.user?.name}</p>\n      <button onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}>\n        Current theme: {state.theme}\n      </button>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Split contexts by update frequency — rarely-changing contexts separate from frequently-updated ones.",
                  "Always wrap useContext in a custom hook that validates the provider is present.",
                  "Memoize the context value if it's created inline: useMemo(() => ({ state, dispatch }), [state]).",
                  "For high-frequency updates (animations, real-time), use Zustand/Jotai instead — Context re-renders all consumers."
        ],
        mistake: "Creating the context value inline without memoization: <Context.Provider value={{ state, dispatch }}> causes all consumers to re-render on every parent render.",
        shorthand: {
          verbose: "function Provider() {\n  const [state, dispatch] = useReducer(reducer, initial);\n  return (\n    <Context.Provider value={{ state, dispatch }}>\n      {children}\n    </Context.Provider>\n  );\n}",
          concise: "function Provider() {\n  const [state, dispatch] = useReducer(reducer, initial);\n  const value = useMemo(() => ({ state, dispatch }), [state]);\n  return <Context.Provider value={value}>{children}</Context.Provider>;\n}",
        },
      },
      {
        id: "controlled-uncontrolled",
        fn: "Controlled vs Uncontrolled Components",
        desc: "Controlled components use state to manage form input value; Uncontrolled use refs to read values directly from DOM.",
        category: "State Management",
        subtitle: "Form input state management strategies",
        signature: "Controlled: <input value={value} onChange={e => setValue(e.target.value)} />\nUncontrolled: <input ref={inputRef} />",
        descLong: "Controlled components use React state as the \"single source of truth\" for form input values. Uncontrolled components let the DOM manage the value via a ref. Controlled components integrate better with React — you get real-time validation, conditional rendering, and easy integration with form libraries. Use uncontrolled only when interacting with non-React code or for file inputs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Controlled vs Uncontrolled Components — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useRef } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Controlled vs Uncontrolled Components — common patterns you'll see in production.\n// APPROACH  - Combine Controlled vs Uncontrolled Components with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Controlled component\nfunction ControlledForm() {\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');\n  const [errors, setErrors] = useState({});\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    // Real-time validation\n    const newErrors = {};\n    if (!email.includes('@')) newErrors.email = 'Invalid email';\n    if (password.length < 8) newErrors.password = 'Min 8 chars';\n    setErrors(newErrors);\n    if (Object.keys(newErrors).length === 0) {\n      console.log('Submit:', { email, password });\n    }\n  };\n  return (\n    <form onSubmit={handleSubmit}>\n      <input\n        value={email}\n        onChange={e => setEmail(e.target.value)}\n        placeholder=\"Email\"\n      />\n      {errors.email && <p className=\"error\">{errors.email}</p>}\n      <input\n        type=\"password\"\n        value={password}\n        onChange={e => setPassword(e.target.value)}\n        placeholder=\"Password\"\n      />\n      {errors.password && <p className=\"error\">{errors.password}</p>}\n      <button type=\"submit\">Submit</button>\n    </form>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Controlled vs Uncontrolled Components — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Uncontrolled component\nfunction UncontrolledForm() {\n  const emailRef = useRef(null);\n  const passwordRef = useRef(null);\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    // Read directly from refs\n    console.log('Submit:', {\n      email: emailRef.current.value,\n      password: passwordRef.current.value,\n    });\n  };\n  return (\n    <form onSubmit={handleSubmit}>\n      <input ref={emailRef} placeholder=\"Email\" />\n      <input type=\"password\" ref={passwordRef} placeholder=\"Password\" />\n      <button type=\"submit\">Submit</button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Prefer controlled components for validation, conditional rendering, and better React integration.",
                  "Use uncontrolled for file inputs (they're always uncontrolled) and when integrating non-React code.",
                  "For large forms, use a form library (React Hook Form, Formik) — they handle both patterns.",
                  "Controlled components make it easy to set values programmatically and clear form state."
        ],
        mistake: "Mixing controlled and uncontrolled — React will warn if you switch a component from uncontrolled (no value) to controlled (has value).",
        shorthand: {
          verbose: "const [isControlled, setIsControlled] = useState(false);\nconst [value, setValue] = useState('');\n\nreturn (\n  <input\n    value={isControlled ? value : undefined}\n    onChange={e => setValue(e.target.value)}\n  />\n);",
          concise: "const [value, setValue] = useState('');\nreturn <input value={value} onChange={e => setValue(e.target.value)} />;",
        },
      },
      {
        id: "custom-hook-composition",
        fn: "Custom Hook Composition",
        desc: "Build complex features by composing simple, reusable custom hooks together.",
        category: "State Management",
        subtitle: "Reusable logic through hook combination",
        signature: "function useFeature() {\n  const state = useCustomHook1();\n  const logic = useCustomHook2(state);\n  return { state, logic };\n}",
        descLong: "Custom Hook Composition is the modern way to share stateful logic in React. Build small, single-purpose hooks and combine them to create complex features. This approach is cleaner than HOCs or Render Props — hooks compose naturally, are easier to test, and avoid wrapper nesting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Hook Composition — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useCallback, useEffect } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Hook Composition — common patterns you'll see in production.\n// APPROACH  - Combine Custom Hook Composition with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Single-purpose hooks\nfunction useAsync(asyncFn, immediate = true) {\n  const [state, setState] = useState({ loading: false, data: null, error: null });\n  const execute = useCallback(async () => {\n    setState({ loading: true, data: null, error: null });\n    try {\n      const result = await asyncFn();\n      setState({ loading: false, data: result, error: null });\n    } catch (error) {\n      setState({ loading: false, data: null, error });\n    }\n  }, [asyncFn]);\n  useEffect(() => {\n    if (immediate) execute();\n  }, [immediate, execute]);\n  return { ...state, execute };\n}\nfunction useDebounce(value, delay = 500) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Hook Composition — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn debounced;\n}\n// Composed hook: search with debounce + async\nfunction useSearch(searchFn, delay = 500) {\n  const [query, setQuery] = useState('');\n  const debouncedQuery = useDebounce(query, delay);\n  const { data: results, loading } = useAsync(\n    () => searchFn(debouncedQuery),\n    debouncedQuery.length > 0\n  );\n  return { query, setQuery, results, loading };\n}\n// Usage\nfunction SearchUsers() {\n  const { query, setQuery, results, loading } = useSearch(\n    async (q) => {\n      const res = await fetch(`/api/users?q=${q}`);\n      return res.json();\n    }\n  );\n  return (\n    <div>\n      <input value={query} onChange={e => setQuery(e.target.value)} placeholder=\"Search...\" />\n      {loading && <p>Loading...</p>}\n      {results?.map(user => <div key={user.id}>{user.name}</div>)}\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Build hooks for a single concern: async, debounce, validation, etc. Compose them for complex features.",
                  "Return objects from hooks when they have multiple values — easier to destructure selectively.",
                  "Each hook call gets its own isolated state — two components calling useSearch have separate state.",
                  "Custom hooks are easy to test — just call them in tests (use a testing library like react-hooks-testing-library)."
        ],
        mistake: "Creating one huge \"god hook\" that does everything — break it into small, composable hooks. Composition beats monolithic.",
        shorthand: {
          verbose: "function useEverything() {\n  const [auth, setAuth] = useState(null);\n  const [theme, setTheme] = useState('light');\n  const [notifications, setNotifications] = useState([]);\n  // ... all logic mixed together\n  return { auth, theme, notifications };\n}",
          concise: "const useAuth = () => { const [auth, setAuth] = useState(null); return auth; };\nconst useTheme = () => { const [theme, setTheme] = useState('light'); return theme; };\n// Compose smaller hooks instead",
        },
      },
      {
        id: "container-presenter",
        fn: "Container/Presenter Pattern",
        desc: "Separate logic (container) from presentation (presenter) — logic handles state/effects, presenter renders pure UI.",
        category: "Component Patterns",
        subtitle: "Logic and UI separation for reusability",
        signature: "<UserContainer /> renders <UserPresenter user={user} />",
        descLong: "The Container/Presenter pattern (Smart/Dumb, or Container/Presentational) splits components into two: a container that manages state/logic/effects, and a presenter that receives props and renders UI. Presenters are pure, testable, and reusable. Containers orchestrate data and behavior.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Container/Presenter Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useEffect } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Container/Presenter Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Container/Presenter Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Presenter — pure UI, receives all props\nfunction UserPresenter({ user, onEdit, onDelete, isLoading }) {\n  if (isLoading) return <div>Loading...</div>;\n  return (\n    <div className=\"user-card\">\n      <h2>{user.name}</h2>\n      <p>{user.email}</p>\n      <p>Role: {user.role}</p>\n      <div className=\"actions\">\n        <button onClick={() => onEdit(user)}>Edit</button>\n        <button onClick={() => onDelete(user.id)}>Delete</button>\n      </div>\n    </div>\n  );\n}\n// Container — manages logic and state\nfunction UserContainer({ userId }) {\n  const [user, setUser] = useState(null);\n  const [isLoading, setIsLoading] = useState(true);\n  const [error, setError] = useState(null);\n  useEffect(() => {\n    const fetchUser = async () => {\n      try {\n        const res = await fetch(`/api/users/${userId}`);\n        const data = await res.json();\n        setUser(data);\n      } catch (err) {\n        setError(err.message);\n      } finally {\n        setIsLoading(false);\n      }\n    };\n    fetchUser();\n  }, [userId]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Container/Presenter Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst handleEdit = (updatedUser) => {\n    console.log('Edit user:', updatedUser);\n    // API call to update\n  };\n  const handleDelete = async (id) => {\n    try {\n      await fetch(`/api/users/${id}`, { method: 'DELETE' });\n      // Navigate away or refresh\n    } catch (err) {\n      setError(err.message);\n    }\n  };\n  if (error) return <div className=\"error\">{error}</div>;\n  return (\n    <UserPresenter\n      user={user}\n      onEdit={handleEdit}\n      onDelete={handleDelete}\n      isLoading={isLoading}\n    />\n  );\n}\n// Usage\n<UserContainer userId=\"123\" />"
                  }
        ],
        tips: [
                  "Presenters should be pure functions — same props, same output, no side effects.",
                  "Containers handle data fetching, state, and event logic.",
                  "Presenters are easy to test — just mock props and verify the output.",
                  "Presenter libraries (Storybook) showcase UI without needing containers.",
                  "Modern custom hooks often replace container components — simpler and more composable."
        ],
        mistake: "Mixing logic and UI in the presenter — this couples the component to specific data sources and makes it hard to reuse or test.",
        shorthand: {
          verbose: "// Bad: logic in presenter\nfunction UserCard({ userId }) {\n  const [user, setUser] = useState(null);\n  useEffect(() => { fetchUser(userId); }, [userId]);\n  return <div>{user?.name}</div>;\n}",
          concise: "// Good: separate concerns\nfunction UserPresenter({ user }) { return <div>{user?.name}</div>; }\nfunction UserContainer({ userId }) {\n  const user = useFetchUser(userId);\n  return <UserPresenter user={user} />;\n}",
        },
      },
      {
        id: "provider-pattern",
        fn: "Provider Pattern",
        desc: "Wrap components with context providers — combine multiple providers, manage provider setup cleanly.",
        category: "State Management",
        subtitle: "Composing context providers",
        signature: "<ThemeProvider><AuthProvider><App /></AuthProvider></ThemeProvider>",
        descLong: "The Provider Pattern uses Context providers to share state across the tree. You often need multiple providers (Theme, Auth, Router, Query Client). Create a root provider component that composes them all, avoiding prop drilling and keeping App clean.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Provider Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createContext, useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Provider Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Provider Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Theme Provider\nconst ThemeContext = createContext();\nfunction ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');\n  return (\n    <ThemeContext.Provider value={{ theme, toggleTheme }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}\n// Auth Provider\nconst AuthContext = createContext();\nfunction AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const [isLoading, setIsLoading] = useState(true);\n  useEffect(() => {\n    checkAuth().then(setUser).finally(() => setIsLoading(false));\n  }, []);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Provider Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst login = (email, password) => { /* API call */ };\n  const logout = () => setUser(null);\n  return (\n    <AuthContext.Provider value={{ user, isLoading, login, logout }}>\n      {children}\n    </AuthContext.Provider>\n  );\n}\n// Root Provider — compose all providers\nfunction RootProvider({ children }) {\n  return (\n    <ThemeProvider>\n      <AuthProvider>\n        {children}\n      </AuthProvider>\n    </ThemeProvider>\n  );\n}\n// Usage\nfunction App() {\n  return (\n    <RootProvider>\n      <Header />\n      <MainContent />\n      <Footer />\n    </RootProvider>\n  );\n}"
                  }
        ],
        tips: [
                  "Create a RootProvider component that composes all context providers.",
                  "Order matters — providers on the outside can't access inner contexts.",
                  "Memoize provider values to avoid unnecessary re-renders: useMemo(() => ({ user, setUser }), [user]).",
                  "Each provider should manage a single concern (theme, auth, notifications).",
                  "Use custom hooks (useTheme, useAuth) to access context with error checking."
        ],
        mistake: "Creating deeply nested providers without composing them — the tree becomes hard to read and manage.",
        shorthand: {
          verbose: "<ThemeProvider>\n  <AuthProvider>\n    <QueryClientProvider>\n      <RouterProvider>\n        <App />\n      </RouterProvider>\n    </QueryClientProvider>\n  </AuthProvider>\n</ThemeProvider>",
          concise: "<RootProvider>\n  <App />\n</RootProvider>\n\n// Inside RootProvider:\n<ThemeProvider><AuthProvider><QueryClientProvider>...</QueryClientProvider></AuthProvider></ThemeProvider>",
        },
      },
      {
        id: "observer-pattern-react",
        fn: "Observer Pattern with useEffect",
        desc: "Subscribe to external events (window, storage, services) and clean up on unmount.",
        category: "Side Effects",
        subtitle: "Event subscriptions and cleanup",
        signature: "useEffect(() => { addEventListener(); return () => removeEventListener(); }, []);",
        descLong: "The Observer Pattern in React uses useEffect to subscribe to external event sources (resize, scroll, storage changes, custom event emitters). Always return a cleanup function to unsubscribe — prevents memory leaks and multiple subscriptions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Observer Pattern with useEffect — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useEffect, useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Observer Pattern with useEffect — common patterns you'll see in production.\n// APPROACH  - Combine Observer Pattern with useEffect with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Subscribe to window resize\nfunction useWindowSize() {\n  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });\n  useEffect(() => {\n    const handleResize = () => {\n      setSize({ width: window.innerWidth, height: window.innerHeight });\n    };\n    window.addEventListener('resize', handleResize);\n    return () => window.removeEventListener('resize', handleResize); // cleanup\n  }, []);\n  return size;\n}\n// Subscribe to localStorage changes\nfunction useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch {\n      return initialValue;\n    }\n  });\n  useEffect(() => {\n    const handleStorageChange = (e) => {\n      if (e.key === key) setValue(JSON.parse(e.newValue || initialValue));\n    };\n    window.addEventListener('storage', handleStorageChange);\n    return () => window.removeEventListener('storage', handleStorageChange);\n  }, [key, initialValue]);\n  const setStorageValue = (newValue) => {\n    setValue(newValue);\n    window.localStorage.setItem(key, JSON.stringify(newValue));\n  };\n  return [value, setStorageValue];\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Observer Pattern with useEffect — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Subscribe to custom event emitter\nclass EventEmitter {\n  constructor() {\n    this.events = {};\n  }\n  on(event, callback) {\n    if (!this.events[event]) this.events[event] = [];\n    this.events[event].push(callback);\n  }\n  off(event, callback) {\n    if (this.events[event]) {\n      this.events[event] = this.events[event].filter(cb => cb !== callback);\n    }\n  }\n  emit(event, data) {\n    if (this.events[event]) this.events[event].forEach(cb => cb(data));\n  }\n}\nconst notificationEmitter = new EventEmitter();\nfunction useNotifications() {\n  const [notifications, setNotifications] = useState([]);\n  useEffect(() => {\n    const handleNotification = (data) => {\n      setNotifications(prev => [...prev, data]);\n    };\n    notificationEmitter.on('notification', handleNotification);\n    return () => notificationEmitter.off('notification', handleNotification); // cleanup\n  }, []);\n  return notifications;\n}\n// Usage\nfunction ResponsiveComponent() {\n  const { width, height } = useWindowSize();\n  const [theme, setTheme] = useLocalStorage('theme', 'light');\n  const notifications = useNotifications();\n  return (\n    <div>\n      <p>Window: {width}x{height}</p>\n      <p>Theme: {theme}</p>\n      <p>Notifications: {notifications.length}</p>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Always return a cleanup function from useEffect — prevents memory leaks.",
                  "Use dependency arrays correctly — [] means subscribe once, [key] means re-subscribe if key changes.",
                  "Unsubscribe from external events to avoid stale closures and multiple handlers.",
                  "Custom event emitters work well for app-wide event buses."
        ],
        mistake: "Not cleaning up subscriptions — causes memory leaks and multiple listeners on re-renders.",
        shorthand: {
          verbose: "useEffect(() => {\n  const handler = () => { /* ... */ };\n  window.addEventListener('resize', handler);\n}, []);  // No cleanup — memory leak!",
          concise: "useEffect(() => {\n  const handler = () => { /* ... */ };\n  window.addEventListener('resize', handler);\n  return () => window.removeEventListener('resize', handler);\n}, []);",
        },
      },
      {
        id: "strategy-pattern-react",
        fn: "Strategy Pattern",
        desc: "Swappable algorithms passed as props or context — different behaviors without conditional logic.",
        category: "Behavior Patterns",
        subtitle: "Pluggable algorithms via props/context",
        signature: "<DataProcessor strategy={sortStrategy} /> or <useStrategy(strategyName)>",
        descLong: "The Strategy Pattern encapsulates different algorithms (sort, filter, format) and lets you swap them at runtime via props or context. Instead of if/switch statements, pass the algorithm as a prop. Makes components flexible and composable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Strategy Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Strategy Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Strategy Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Define different sort strategies\nconst sortStrategies = {\n  ascending: (items) => [...items].sort((a, b) => a.value - b.value),\n  descending: (items) => [...items].sort((a, b) => b.value - a.value),\n  byName: (items) => [...items].sort((a, b) => a.name.localeCompare(b.name)),\n};\n// Define different format strategies\nconst formatStrategies = {\n  table: (items) => <table>...</table>,\n  list: (items) => <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>,\n  card: (items) => <div className=\"cards\">{items.map(i => <Card key={i.id} {...i} />)}</div>,\n};\n// Component using strategies\nfunction DataProcessor({ items, sortStrategy, formatStrategy }) {\n  const [currentSort, setCurrentSort] = useState('ascending');\n  const [currentFormat, setCurrentFormat] = useState('list');\n  const sortedItems = sortStrategies[currentSort](items);\n  const formattedOutput = formatStrategies[currentFormat](sortedItems);\n  return (\n    <div>\n      <div className=\"controls\">\n        <select value={currentSort} onChange={e => setCurrentSort(e.target.value)}>\n          <option value=\"ascending\">Ascending</option>\n          <option value=\"descending\">Descending</option>\n          <option value=\"byName\">By Name</option>\n        </select>\n        <select value={currentFormat} onChange={e => setCurrentFormat(e.target.value)}>\n          <option value=\"list\">List</option>\n          <option value=\"table\">Table</option>\n          <option value=\"card\">Cards</option>\n        </select>\n      </div>\n      <div className=\"content\">\n        {formattedOutput}\n      </div>\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Strategy Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Pluggable custom strategy\nfunction useDataProcessor(items, customStrategies = {}) {\n  const strategies = { ...sortStrategies, ...customStrategies };\n  const [strategy, setStrategy] = useState('ascending');\n  const process = (data) => strategies[strategy](data);\n  return { process, strategies: Object.keys(strategies), setStrategy };\n}\n// Usage\n<DataProcessor items={users} />\n// Or with custom strategy:\nconst customSort = { byAge: (items) => [...items].sort((a, b) => a.age - b.age) };\n<DataProcessor items={users} strategies={customSort} />"
                  }
        ],
        tips: [
                  "Strategies are functions that encapsulate an algorithm — easy to test and swap.",
                  "Avoid if/switch statements — use strategy objects instead.",
                  "Pass strategies as props for flexibility; use context for global strategies.",
                  "Combine strategies for complex behaviors (sorting + filtering + formatting)."
        ],
        mistake: "Hardcoding algorithms in the component — makes it inflexible and hard to test different behaviors.",
        shorthand: {
          verbose: "// Bad: if/switch logic scattered\nfunction DataView({ items, format }) {\n  if (format === 'table') return <table>...</table>;\n  if (format === 'list') return <ul>...</ul>;\n  if (format === 'card') return <Card>...</Card>;\n}",
          concise: "// Good: strategies object\nconst strategies = {\n  table: (items) => <table>...</table>,\n  list: (items) => <ul>...</ul>,\n  card: (items) => <Card />,\n};\nfunction DataView({ items, format }) { return strategies[format](items); }",
        },
      },
      {
        id: "adapter-pattern",
        fn: "Adapter Pattern",
        desc: "Wrap third-party components in a React-friendly API — normalize their interface.",
        category: "Integration Patterns",
        subtitle: "Compatible interface for external components",
        signature: "<DatePickerAdapter value={date} onChange={setDate} />",
        descLong: "The Adapter Pattern wraps incompatible third-party components (jQuery plugins, D3 charts, external libraries) to make them work seamlessly with React. Adapts their props and events to match React conventions (controlled component pattern).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Adapter Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useEffect, useRef } from 'react';\nimport $ from 'jquery';\nimport 'jquery-datepicker';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Adapter Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Adapter Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Adapter for jQuery DatePicker\nfunction DatePickerAdapter({ value, onChange, placeholder }) {\n  const inputRef = useRef(null);\n  useEffect(() => {\n    const $input = $(inputRef.current);\n    // Initialize jQuery plugin\n    $input.datepicker({\n      onSelect: (dateText) => {\n        onChange(new Date(dateText));\n      },\n      dateFormat: 'mm/dd/yy',\n    });\n    // Sync React state to jQuery\n    if (value) {\n      $input.datepicker('setDate', value);\n    }\n    return () => {\n      $input.datepicker('destroy'); // cleanup\n    };\n  }, [value, onChange]);\n  return <input ref={inputRef} type=\"text\" placeholder={placeholder} />;\n}\n// Adapter for D3 visualization\nimport * as d3 from 'd3';\nfunction D3ChartAdapter({ data, width = 500, height = 300 }) {\n  const svgRef = useRef(null);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Adapter Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nuseEffect(() => {\n    if (!data || !svgRef.current) return;\n    const svg = d3.select(svgRef.current);\n    // D3 code\n    const xScale = d3.scaleLinear().domain([0, d3.max(data, d => d.x)]).range([0, width]);\n    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.y)]).range([height, 0]);\n    svg.selectAll('*').remove(); // Clear previous\n    svg.attr('width', width).attr('height', height);\n    svg.selectAll('circle')\n      .data(data)\n      .enter()\n      .append('circle')\n      .attr('cx', d => xScale(d.x))\n      .attr('cy', d => yScale(d.y))\n      .attr('r', 5);\n  }, [data, width, height]);\n  return <svg ref={svgRef} />;\n}\n// Usage\nfunction App() {\n  const [selectedDate, setSelectedDate] = useState(null);\n  const [chartData] = useState([{ x: 10, y: 20 }, { x: 30, y: 40 }]);\n  return (\n    <div>\n      <DatePickerAdapter value={selectedDate} onChange={setSelectedDate} />\n      <D3ChartAdapter data={chartData} />\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Use refs to access the DOM element and initialize non-React libraries.",
                  "Sync React state with third-party state in useEffect.",
                  "Clean up resources (destroy plugins, remove listeners) in the return of useEffect.",
                  "Make adapters uncontrolled or controlled to match React conventions.",
                  "Consider using React-native versions of libraries (react-select instead of Select2)."
        ],
        mistake: "Initializing third-party libraries directly in render — causes re-initialization on every render and memory leaks.",
        shorthand: {
          verbose: "function Chart({ data }) {\n  // Re-initializes D3 on every render!\n  const svg = d3.select(document.querySelector('svg'));\n  // ... draw chart ...\n  return <svg></svg>;\n}",
          concise: "function Chart({ data }) {\n  const svgRef = useRef(null);\n  useEffect(() => {\n    const svg = d3.select(svgRef.current);\n    // ... draw chart once ...\n  }, [data]);\n  return <svg ref={svgRef} />;\n}",
        },
      },
      {
        id: "facade-pattern",
        fn: "Facade Pattern",
        desc: "Hide complex state management behind a simple hook API — expose clean interface.",
        category: "State Management",
        subtitle: "Simplified API for complex logic",
        signature: "const { user, loading, error, login } = useAuthFacade();",
        descLong: "The Facade Pattern provides a simplified, unified interface to complex subsystems. In React, create a custom hook that hides complicated state, effects, and logic — exposing just what components need.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Facade Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useCallback, useEffect } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Facade Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Facade Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Complex state management inside the hook\nfunction useAuthFacade() {\n  const [user, setUser] = useState(null);\n  const [token, setToken] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  const [refreshing, setRefreshing] = useState(false);\n  // Initialize auth on mount\n  useEffect(() => {\n    const initAuth = async () => {\n      try {\n        const storedToken = localStorage.getItem('token');\n        if (storedToken) {\n          const res = await fetch('/api/me', {\n            headers: { Authorization: `Bearer ${storedToken}` },\n          });\n          if (res.ok) {\n            const userData = await res.json();\n            setUser(userData);\n            setToken(storedToken);\n          } else {\n            localStorage.removeItem('token');\n          }\n        }\n      } catch (err) {\n        setError(err.message);\n      } finally {\n        setLoading(false);\n      }\n    };\n    initAuth();\n  }, []);\n  const login = useCallback(async (email, password) => {\n    setLoading(true);\n    setError(null);\n    try {\n      const res = await fetch('/api/login', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ email, password }),\n      });\n      const data = await res.json();\n      setUser(data.user);\n      setToken(data.token);\n      localStorage.setItem('token', data.token);\n    } catch (err) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  }, []);\n  const logout = useCallback(() => {\n    setUser(null);\n    setToken(null);\n    localStorage.removeItem('token');\n  }, []);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Facade Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst refreshToken = useCallback(async () => {\n    setRefreshing(true);\n    try {\n      const res = await fetch('/api/refresh', { method: 'POST' });\n      const data = await res.json();\n      setToken(data.token);\n      localStorage.setItem('token', data.token);\n    } catch (err) {\n      setError(err.message);\n    } finally {\n      setRefreshing(false);\n    }\n  }, []);\n  // Simple, clean facade API\n  return {\n    user,\n    token,\n    loading,\n    error,\n    refreshing,\n    login,\n    logout,\n    refreshToken,\n    isAuthenticated: !!user,\n  };\n}\n// Usage — components don't see the complexity\nfunction Profile() {\n  const { user, loading, error, logout, isAuthenticated } = useAuthFacade();\n  if (!isAuthenticated) return <p>Not logged in</p>;\n  if (loading) return <p>Loading...</p>;\n  if (error) return <p>Error: {error}</p>;\n  return (\n    <div>\n      <h1>{user.name}</h1>\n      <button onClick={logout}>Logout</button>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Hide implementation details — expose only what components need to use.",
                  "The facade hook manages state, effects, and logic internally.",
                  "Return an object with clear, descriptive property names.",
                  "Compose multiple facades for different domains (auth, notifications, data)."
        ],
        mistake: "Exposing all internal state and functions — make the API too broad and hard to maintain.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Complex exposed state\nconst { user, token, loading, error, refreshing, ...10 more } = useAuth();\n// More explicit but longer",
          concise: "// Simple facade\nconst { user, isAuthenticated, loading, error, login, logout } = useAuthFacade();",
        },
      },
      {
        id: "mediator-pattern",
        fn: "Mediator Pattern",
        desc: "Components communicate through shared context instead of prop drilling or direct coupling.",
        category: "Communication Patterns",
        subtitle: "Centralized event coordination via context",
        signature: "const { emit, subscribe } = useMediator();",
        descLong: "The Mediator Pattern centralizes communication between components. Instead of prop drilling or direct references, components emit/subscribe to events through a shared mediator (context). Decouples components and simplifies complex interactions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mediator Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createContext, useContext, useState, useCallback } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mediator Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Mediator Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Mediator context\nconst MediatorContext = createContext();\nfunction MediatorProvider({ children }) {\n  const [listeners, setListeners] = useState({});\n  const subscribe = useCallback((event, callback) => {\n    setListeners(prev => ({\n      ...prev,\n      [event]: [...(prev[event] || []), callback],\n    }));\n    // Return unsubscribe function\n    return () => {\n      setListeners(prev => ({\n        ...prev,\n        [event]: prev[event].filter(cb => cb !== callback),\n      }));\n    };\n  }, []);\n  const emit = useCallback((event, data) => {\n    if (listeners[event]) {\n      listeners[event].forEach(callback => callback(data));\n    }\n  }, [listeners]);\n  return (\n    <MediatorContext.Provider value={{ emit, subscribe }}>\n      {children}\n    </MediatorContext.Provider>\n  );\n}\nfunction useMediator() {\n  const ctx = useContext(MediatorContext);\n  if (!ctx) throw new Error('useMediator must be used within MediatorProvider');\n  return ctx;\n}\n// Usage: components communicate via events\nfunction FormComponent() {\n  const { emit } = useMediator();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mediator Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst handleSubmit = (data) => {\n    emit('form:submit', data); // Notify all subscribers\n  };\n  return <form onSubmit={handleSubmit}>...</form>;\n}\nfunction NotificationComponent() {\n  const [messages, setMessages] = useState([]);\n  const { subscribe } = useMediator();\n  useEffect(() => {\n    const unsubscribe = subscribe('form:submit', (data) => {\n      setMessages(prev => [...prev, `Submitted: ${JSON.stringify(data)}`]);\n    });\n    return unsubscribe;\n  }, [subscribe]);\n  return (\n    <div className=\"notifications\">\n      {messages.map((msg, i) => <div key={i}>{msg}</div>)}\n    </div>\n  );\n}\n// Usage\n<MediatorProvider>\n  <FormComponent />\n  <NotificationComponent />\n</MediatorProvider>"
                  }
        ],
        tips: [
                  "Mediator decouples components — they don't need to know about each other.",
                  "Use events for one-way communication (form submit → notification update).",
                  "Always return and call unsubscribe functions to clean up listeners.",
                  "Namespace events (form:submit, user:logout) to avoid collisions.",
                  "Consider using a state machine (XState) for complex coordinated behavior."
        ],
        mistake: "Creating circular dependencies where components emit and subscribe to each other's events.",
        shorthand: {
          verbose: "// Prop drilling (tight coupling)\n<Header user={user} onLogout={logout} />\n<Sidebar user={user} onLogout={logout} />\n<Footer onLogout={logout} />",
          concise: "// Mediator (loose coupling)\n<MediatorProvider>\n  <Header />\n  <Sidebar />\n  <Footer />\n</MediatorProvider>\n// All emit/subscribe to 'user:logout'",
        },
      },
      {
        id: "factory-pattern-react",
        fn: "Factory Pattern",
        desc: "Create components dynamically based on type maps — avoid if/switch statements for component selection.",
        category: "Component Patterns",
        subtitle: "Dynamic component creation via factories",
        signature: "const component = componentFactory[type];",
        descLong: "The Factory Pattern uses a mapping of types to component constructors. Instead of if/switch to select components, use a factory object. Easily extensible — add new types without modifying component logic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Factory Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport React from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Factory Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Factory Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Define component types\nconst TextWidget = ({ data }) => <p>{data.text}</p>;\nconst ImageWidget = ({ data }) => <img src={data.url} alt={data.alt} />;\nconst ButtonWidget = ({ data, onClick }) => <button onClick={onClick}>{data.label}</button>;\nconst CardWidget = ({ data, children }) => (\n  <div className=\"card\">\n    <h3>{data.title}</h3>\n    <p>{data.description}</p>\n    {children}\n  </div>\n);\n// Factory object — maps type to component\nconst componentFactory = {\n  text: TextWidget,\n  image: ImageWidget,\n  button: ButtonWidget,\n  card: CardWidget,\n};\n// Factory function — creates components dynamically\nfunction createWidget(type) {\n  const Component = componentFactory[type];\n  if (!Component) {\n    throw new Error(`Unknown widget type: ${type}`);\n  }\n  return Component;\n}\n// Renderer using factory\nfunction WidgetRenderer({ widgets }) {\n  return (\n    <div className=\"widget-list\">\n      {widgets.map((widget, index) => {\n        const Component = componentFactory[widget.type];\n        if (!Component) return null;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Factory Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n          <React.Fragment key={widget.id || index}>\n            <Component\n              data={widget.data}\n              onClick={() => console.log('Widget clicked:', widget.id)}\n            />\n          </React.Fragment>\n        );\n      })}\n    </div>\n  );\n}\n// Extensible — add new types without changing renderer\nconst componentFactory = {\n  ...componentFactory,\n  video: ({ data }) => (\n    <video width={data.width} height={data.height} controls>\n      <source src={data.src} type=\"video/mp4\" />\n    </video>\n  ),\n};\n// Usage\nconst widgets = [\n  { id: 1, type: 'text', data: { text: 'Hello' } },\n  { id: 2, type: 'image', data: { url: '/img.jpg', alt: 'Image' } },\n  { id: 3, type: 'button', data: { label: 'Click me' } },\n  { id: 4, type: 'card', data: { title: 'Card', description: 'Content' } },\n];\n<WidgetRenderer widgets={widgets} />"
                  }
        ],
        tips: [
                  "Factory object is just a type-to-component mapping — simple and extensible.",
                  "Add validation — throw error if type is unknown, with helpful message.",
                  "Use factory for plugin systems — register components at runtime.",
                  "Combine with lazy loading for code splitting: componentFactory[type] = lazy(() => import(...))."
        ],
        mistake: "Using if/switch statements to select components — not extensible and hard to maintain.",
        shorthand: {
          verbose: "// Bad: if/switch scattered\nfunction render(type, props) {\n  if (type === 'text') return <TextWidget {...props} />;\n  if (type === 'image') return <ImageWidget {...props} />;\n  // ... add more if statements ...\n}",
          concise: "// Good: factory object\nconst factory = { text: TextWidget, image: ImageWidget };\nfunction render(type, props) {\n  const Component = factory[type];\n  return Component ? <Component {...props} /> : null;\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
