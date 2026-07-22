export const meta = {
  "title": "State Management",
  "domain": "react",
  "sheet": "state",
  "icon": "🗂️"
}

export const sections = [

  // ── Section 1: Context API Deep Dive ─────────────────────────────────────────
  {
    id: "context-api-patterns",
    title: "Context API Deep Dive",
    entries: [
      {
        id: "context-api-optimization",
        fn: "Context API Optimization",
        desc: "Preventing unnecessary re-renders with Context API through strategic splitting and memoization.",
        category: "Context API",
        subtitle: "Efficient context usage patterns",
        signature: "Split contexts by update frequency; memoize value objects",
        descLong: "Context causes all consumers to re-render when the value changes, even if they only use part of it. Split context by update frequency (rarely-changing vs frequently-changing). Memoize the value object to prevent new object creation on every render. For high-frequency updates, prefer Zustand or Jotai.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Context API Optimization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createContext, useContext, useState, useMemo } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Context API Optimization — common patterns you'll see in production.\n// APPROACH  - Combine Context API Optimization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Split contexts: user config (rarely changes) vs UI state (frequently changes)\nconst UserContext = createContext();\nconst UIStateContext = createContext();\nfunction AppProvider({ children }) {\n  // Rarely changes — memoize to prevent re-renders of consumers\n  const [user, setUser] = useState(null);\n  const userValue = useMemo(\n    () => ({ user, setUser }),\n    [user]\n  );\n  // Frequently changes — separate context\n  const [theme, setTheme] = useState('light');\n  const [sidebarOpen, setSidebarOpen] = useState(true);\n  const uiValue = useMemo(\n    () => ({ theme, setTheme, sidebarOpen, setSidebarOpen }),\n    [theme, sidebarOpen]\n  );\n  return (\n    <UserContext.Provider value={userValue}>\n      <UIStateContext.Provider value={uiValue}>\n        {children}\n      </UIStateContext.Provider>\n    </UserContext.Provider>\n  );\n}\n// Custom hooks for consuming\nfunction useUser() {\n  const ctx = useContext(UserContext);\n  if (!ctx) throw new Error('useUser must be within AppProvider');\n  return ctx;\n}\nfunction useUIState() {\n  const ctx = useContext(UIStateContext);\n  if (!ctx) throw new Error('useUIState must be within AppProvider');\n  return ctx;\n}\n// Consumer only re-renders when its specific context changes\nfunction UserProfile() {\n  const { user } = useUser(); // Only re-renders when user changes\n  return <div>{user?.name}</div>;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Context API Optimization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction ThemeToggle() {\n  const { theme, setTheme } = useUIState(); // Only re-renders when theme changes\n  return (\n    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>\n      Current theme: {theme}\n    </button>\n  );\n}\n// Pattern: Separate read and write contexts for fine-grained control\nconst ThemeReadContext = createContext();\nconst ThemeWriteContext = createContext();\nfunction ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  const readValue = useMemo(() => ({ theme }), [theme]);\n  const writeValue = useMemo(() => ({ setTheme }), []);\n  return (\n    <ThemeReadContext.Provider value={readValue}>\n      <ThemeWriteContext.Provider value={writeValue}>\n        {children}\n      </ThemeWriteContext.Provider>\n    </ThemeReadContext.Provider>\n  );\n}\n// Components that only need to read theme don't re-render when setTheme changes\nfunction ThemeDisplay() {\n  const { theme } = useContext(ThemeReadContext);\n  return <p>Theme: {theme}</p>;\n}\nfunction ThemeControls() {\n  const { setTheme } = useContext(ThemeWriteContext);\n  return (\n    <>\n      <button onClick={() => setTheme('light')}>Light</button>\n      <button onClick={() => setTheme('dark')}>Dark</button>\n    </>\n  );\n}"
                  }
        ],
        tips: [
                  "Split contexts by update frequency — rarely-changing contexts separate from frequently-updated ones.",
                  "Always memoize context value objects — prevents unnecessary re-renders.",
                  "Use selector patterns or useSyncExternalStore for granular subscriptions.",
                  "For high-frequency updates (animations, real-time), use Zustand, Jotai, or Redux.",
                  "Context is great for theme, user, and app-wide rarely-changing config."
        ],
        mistake: "Putting all state in a single Context — all consumers re-render whenever any part of the context changes, causing performance issues.",
        shorthand: {
          verbose: "const AppContext = createContext();\n\nfunction Provider() {\n  const [user, setUser] = useState(null);\n  const [theme, setTheme] = useState('light');\n  const value = { user, setUser, theme, setTheme };\n  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;\n}",
          concise: "const UserContext = createContext();\nconst ThemeContext = createContext();\n\n// Separate contexts for better performance\n<UserContext.Provider value={user}>\n  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>\n</UserContext.Provider>",
        },
      },
      {
        id: "context-reducer-state",
        fn: "Context + useReducer for Complex State",
        desc: "Combine Context and useReducer for structured, scalable global state management.",
        category: "Context API",
        subtitle: "Reducer-driven global state",
        signature: "const [state, dispatch] = useReducer(reducer, init); provide both in Context",
        descLong: "useReducer + Context is a lightweight alternative to Redux. Define a reducer function for predictable state mutations. Provide state and dispatch via Context. Dispatch actions from any component. Scale up by splitting reducers or nesting contexts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Context + useReducer for Complex State — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createContext, useContext, useReducer, useMemo } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Context + useReducer for Complex State — common patterns you'll see in production.\n// APPROACH  - Combine Context + useReducer for Complex State with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Action types\nexport const ACTIONS = {\n  SET_USER: 'SET_USER',\n  LOGOUT: 'LOGOUT',\n  ADD_NOTIFICATION: 'ADD_NOTIFICATION',\n  CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',\n  SET_THEME: 'SET_THEME',\n};\n// Initial state\nconst initialState = {\n  user: null,\n  notifications: [],\n  theme: 'light',\n};\n// Reducer\nfunction appReducer(state, action) {\n  switch (action.type) {\n    case ACTIONS.SET_USER:\n      return { ...state, user: action.payload };\n    case ACTIONS.LOGOUT:\n      return { ...state, user: null };\n    case ACTIONS.ADD_NOTIFICATION:\n      return {\n        ...state,\n        notifications: [...state.notifications, action.payload],\n      };\n    case ACTIONS.CLEAR_NOTIFICATION:\n      return {\n        ...state,\n        notifications: state.notifications.filter(n => n.id !== action.payload),\n      };\n    case ACTIONS.SET_THEME:\n      return { ...state, theme: action.payload };\n    default:\n      return state;\n  }\n}\n// Context\nconst AppStateContext = createContext();\n// Provider component\nfunction AppProvider({ children }) {\n  const [state, dispatch] = useReducer(appReducer, initialState);\n  // Memoize to prevent re-renders when dispatch changes\n  const value = useMemo(() => ({ state, dispatch }), [state]);\n  return (\n    <AppStateContext.Provider value={value}>\n      {children}\n    </AppStateContext.Provider>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Context + useReducer for Complex State — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Custom hook\nexport function useAppState() {\n  const ctx = useContext(AppStateContext);\n  if (!ctx) throw new Error('useAppState must be within AppProvider');\n  return ctx;\n}\n// Specialized hook for each feature\nexport function useAuth() {\n  const { state, dispatch } = useAppState();\n  return {\n    user: state.user,\n    login: (userData) => {\n      dispatch({ type: ACTIONS.SET_USER, payload: userData });\n    },\n    logout: () => {\n      dispatch({ type: ACTIONS.LOGOUT });\n    },\n  };\n}\nexport function useNotifications() {\n  const { state, dispatch } = useAppState();\n  return {\n    notifications: state.notifications,\n    addNotification: (message, type = 'info') => {\n      const id = Date.now();\n      dispatch({\n        type: ACTIONS.ADD_NOTIFICATION,\n        payload: { id, message, type },\n      });\n      // Auto-clear after 3s\n      setTimeout(() => {\n        dispatch({ type: ACTIONS.CLEAR_NOTIFICATION, payload: id });\n      }, 3000);\n    },\n    clearNotification: (id) => {\n      dispatch({ type: ACTIONS.CLEAR_NOTIFICATION, payload: id });\n    },\n  };\n}\nexport function useTheme() {\n  const { state, dispatch } = useAppState();\n  return {\n    theme: state.theme,\n    setTheme: (theme) => {\n      dispatch({ type: ACTIONS.SET_THEME, payload: theme });\n    },\n  };\n}\n// Component usage\nfunction Dashboard() {\n  const { user } = useAuth();\n  const { theme, setTheme } = useTheme();\n  const { addNotification } = useNotifications();\n  return (\n    <div className={theme}>\n      <h1>Welcome, {user?.name}</h1>\n      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n        Toggle theme\n      </button>\n      <button onClick={() => addNotification('Hello!', 'success')}>\n        Show notification\n      </button>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Define action types as constants — prevents typos and enables IDE autocomplete.",
                  "Keep the reducer pure — no side effects, only state transformations.",
                  "Create specialized hooks (useAuth, useNotifications) for better ergonomics.",
                  "Dispatch actions from anywhere in the component tree.",
                  "Memoize the context value to prevent unnecessary re-renders.",
                  "Scale by splitting reducers into separate contexts when state becomes large."
        ],
        mistake: "Putting async operations (API calls) inside the reducer — keep reducers pure. Handle async in components with useEffect and dispatch actions on completion.",
        shorthand: {
          verbose: "function reducer(state, action) {\n  if (action.type === 'FETCH') {\n    fetch('/api/data').then(res => res.json());  // WRONG — async in reducer!\n  }\n  return state;\n}",
          concise: "function reducer(state, action) {\n  if (action.type === 'SET_DATA') return { ...state, data: action.payload };\n  return state;\n}\n\nuseEffect(() => {\n  fetch('/api/data').then(res => res.json()).then(data => dispatch({ type: 'SET_DATA', payload: data }));\n}, []);",
        },
      },
    ],
  },

  // ── Section 2: State Management Libraries ─────────────────────────────────────────
  {
    id: "state-libraries",
    title: "State Management Libraries",
    entries: [
      {
        id: "zustand-basics",
        fn: "Zustand Basics",
        desc: "Lightweight state management with hooks API, minimal boilerplate, and excellent performance.",
        category: "State Libraries",
        subtitle: "Simple, performant state management",
        signature: "const useStore = create((set) => ({ /* state and actions */ }))",
        descLong: "Zustand is a lightweight alternative to Redux. Uses immer internally for mutations. Only re-renders components that use changed parts of state. No provider needed — just hook-based. Great for small to medium apps. Integrates with middleware, persists to localStorage.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Zustand Basics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport create from 'zustand';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Zustand Basics — common patterns you'll see in production.\n// APPROACH  - Combine Zustand Basics with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Simple store\nconst useCountStore = create((set) => ({\n  count: 0,\n  increment: () => set(state => ({ count: state.count + 1 })),\n  decrement: () => set(state => ({ count: state.count - 1 })),\n  reset: () => set({ count: 0 }),\n}));\n// Usage in component\nfunction Counter() {\n  const count = useCountStore(state => state.count);\n  const increment = useCountStore(state => state.increment);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={increment}>+</button>\n    </div>\n  );\n}\n// Advanced store with nested state\nconst useAppStore = create((set) => ({\n  user: null,\n  notifications: [],\n  ui: {\n    sidebarOpen: true,\n    theme: 'light',\n  },\n  // Actions\n  setUser: (user) => set({ user }),\n  addNotification: (message) => set((state) => ({\n    notifications: [...state.notifications, { id: Date.now(), message }],\n  })),\n  toggleSidebar: () => set((state) => ({\n    ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },\n  })),\n  setTheme: (theme) => set((state) => ({\n    ui: { ...state.ui, theme },\n  })),\n}));\n// Selector for granular subscriptions (only re-renders when selected value changes)\nfunction ThemeButton() {\n  const theme = useAppStore(state => state.ui.theme);\n  const setTheme = useAppStore(state => state.setTheme);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Zustand Basics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>\n      Theme: {theme}\n    </button>\n  );\n}\n// With middleware (persist to localStorage)\nimport { persist } from 'zustand/middleware';\nconst useUserStore = create(\n  persist(\n    (set) => ({\n      user: null,\n      setUser: (user) => set({ user }),\n    }),\n    {\n      name: 'user-storage', // localStorage key\n    }\n  )\n);\n// With immer middleware for mutations\nimport { immer } from 'zustand/middleware/immer';\nconst useTodoStore = create(\n  immer((set) => ({\n    todos: [],\n    addTodo: (todo) => set((state) => {\n      // Immer allows \"mutations\" on state\n      state.todos.push(todo);\n    }),\n    toggleTodo: (id) => set((state) => {\n      const todo = state.todos.find(t => t.id === id);\n      if (todo) todo.done = !todo.done;\n    }),\n  }))\n);"
                  }
        ],
        tips: [
                  "Use selectors to subscribe only to the parts of state you need.",
                  "Zustand uses shallow comparison — use selectors for referential stability.",
                  "Immer middleware allows immutable-looking mutations.",
                  "Persist middleware saves state to localStorage automatically.",
                  "No provider needed — works directly as a hook.",
                  "Excellent performance — only re-renders components that selected values changed."
        ],
        mistake: "Not using selectors — selecting the entire state means your component re-renders whenever ANY part of the store changes.",
        shorthand: {
          verbose: "const state = useContext(StoreContext);  // Re-renders on any state change\n\nreturn <div>{state.user.name}</div>;",
          concise: "const userName = useSelector(state => state.user.name);  // Only re-renders if user.name changes\n\nreturn <div>{userName}</div>;",
        },
      },
      {
        id: "react-query-server-state",
        fn: "TanStack Query (React Query)",
        desc: "Manage server state, caching, synchronization, and background updates with TanStack Query.",
        category: "Server State Management",
        subtitle: "Server state with automatic sync",
        signature: "const { data, isLoading, error } = useQuery({ queryKey: [], queryFn })",
        descLong: "TanStack Query (React Query) manages server state (fetched data). Handles caching, stale-while-revalidate, background updates, and pagination automatically. Reduces boilerplate compared to useEffect + useState. Provides Suspense support and devtools for debugging.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of TanStack Query (React Query) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of TanStack Query (React Query) — common patterns you'll see in production.\n// APPROACH  - Combine TanStack Query (React Query) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Fetch data with caching\nfunction UserProfile({ userId }) {\n  const {\n    data: user,\n    isLoading,\n    error,\n    isFetching, // true when refetching in background\n  } = useQuery({\n    queryKey: ['users', userId], // cache key\n    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),\n    staleTime: 5 * 60 * 1000, // 5 minutes\n    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)\n  });\n  if (isLoading) return <div>Loading...</div>;\n  if (error) return <div>Error: {error.message}</div>;\n  return (\n    <div>\n      <h1>{user.name}</h1>\n      {isFetching && <p>Updating...</p>}\n    </div>\n  );\n}\n// Mutations with automatic cache updates\nfunction UpdateUserForm({ userId }) {\n  const queryClient = useQueryClient();\n  const mutation = useMutation({\n    mutationFn: (updatedData) =>\n      fetch(`/api/users/${userId}`, {\n        method: 'PATCH',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify(updatedData),\n      }).then(r => r.json()),\n    // Optimistic update\n    onMutate: async (newData) => {\n      // Cancel any ongoing queries for this user\n      await queryClient.cancelQueries({ queryKey: ['users', userId] });\n      // Snapshot previous data\n      const previousUser = queryClient.getQueryData(['users', userId]);\n      // Optimistically update cache\n      queryClient.setQueryData(['users', userId], (old) => ({\n        ...old,\n        ...newData,\n      }));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of TanStack Query (React Query) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn { previousUser }; // rollback context\n    },\n    onError: (error, newData, context) => {\n      // Rollback on error\n      queryClient.setQueryData(\n        ['users', userId],\n        context.previousUser\n      );\n    },\n    onSuccess: () => {\n      // Revalidate after success\n      queryClient.invalidateQueries({ queryKey: ['users', userId] });\n    },\n  });\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    mutation.mutate({\n      name: e.target.name.value,\n      email: e.target.email.value,\n    });\n  };\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name=\"name\" defaultValue={user?.name} />\n      <input name=\"email\" defaultValue={user?.email} />\n      <button disabled={mutation.isPending}>\n        {mutation.isPending ? 'Saving...' : 'Save'}\n      </button>\n      {mutation.error && <p>{mutation.error.message}</p>}\n    </form>\n  );\n}\n// Pagination\nfunction UsersList() {\n  const [page, setPage] = useState(1);\n  const queryClient = useQueryClient();\n  const { data, isLoading } = useQuery({\n    queryKey: ['users', { page }],\n    queryFn: () =>\n      fetch(`/api/users?page=${page}`).then(r => r.json()),\n  });\n  return (\n    <div>\n      {/* prefetch next page on hover */}\n      <div\n        onMouseEnter={() =>\n          queryClient.prefetchQuery({\n            queryKey: ['users', { page: page + 1 }],\n            queryFn: () =>\n              fetch(`/api/users?page=${page + 1}`).then(r => r.json()),\n          })\n        }\n      >\n        <button onClick={() => setPage(p => p + 1)}>\n          Next Page\n        </button>\n      </div>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "queryKey is the cache key — includes all dependencies of queryFn.",
                  "staleTime: data is considered fresh for this duration.",
                  "gcTime: garbage collect (remove) data after this duration.",
                  "Mutations automatically revalidate related queries on success.",
                  "Optimistic updates improve UX by updating UI before server confirmation.",
                  "Prefetch data on hover/focus to improve perceived performance."
        ],
        mistake: "Not setting queryKey correctly — missing dependencies causes stale cache hits. Include all variables used in queryFn.",
        shorthand: {
          verbose: "const { data } = useQuery({\n  queryKey: ['user'],  // Missing id!\n  queryFn: () => fetch(`/api/users/${id}`).then(r => r.json())\n});",
          concise: "const { data } = useQuery({\n  queryKey: ['user', id],  // Include all dependencies\n  queryFn: () => fetch(`/api/users/${id}`).then(r => r.json())\n});",
        },
      },
      {
        id: "jotai-atomic-state",
        fn: "Jotai Atomic State",
        desc: "Primitive atom-based state management with minimal re-renders and no provider overhead.",
        category: "State Libraries",
        subtitle: "Atom-based reactive state",
        signature: "const countAtom = atom(0); const [count, setCount] = useAtom(countAtom)",
        descLong: "Jotai uses atoms (primitive state units) instead of stores. Atoms are composable, lazy by default (only computed when used), and trigger re-renders only in components that depend on them. Scales from simple to complex derived state. Works great with Suspense.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Jotai Atomic State — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { atom, useAtom } from 'jotai';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Jotai Atomic State — common patterns you'll see in production.\n// APPROACH  - Combine Jotai Atomic State with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Basic atom\nconst countAtom = atom(0);\nfunction Counter() {\n  const [count, setCount] = useAtom(countAtom);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(c => c + 1)}>+</button>\n    </div>\n  );\n}\n// Derived atom (computed from other atoms)\nconst doubleCountAtom = atom(\n  (get) => get(countAtom) * 2\n);\nfunction DoubleDisplay() {\n  const [doubled] = useAtom(doubleCountAtom);\n  return <p>Doubled: {doubled}</p>;\n}\n// Async atom (suspends with Suspense)\nimport { atom } from 'jotai';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Jotai Atomic State — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst userAtom = atom(async (get) => {\n  const userId = get(userIdAtom);\n  const res = await fetch(`/api/users/${userId}`);\n  return res.json();\n});\nfunction UserProfile() {\n  const [user] = useAtom(userAtom);\n  return <div>{user.name}</div>;\n}\n// Atom with Suspense\nfunction Page() {\n  return (\n    <Suspense fallback={<p>Loading...</p>}>\n      <UserProfile />\n    </Suspense>\n  );\n}\n// Write-only atom for actions\nconst incrementAtom = atom(\n  null,\n  (get, set) => {\n    set(countAtom, get(countAtom) + 1);\n  }\n);\n// Read/write atom\nconst userAtom = atom(\n  null, // initial\n  (get, set, newUser) => {\n    // set called when atom is updated\n    set(userAtom, newUser);\n  }\n);"
                  }
        ],
        tips: [
                  "Atoms are lazy — only computed when used.",
                  "Derived atoms (read from other atoms) are automatically memoized.",
                  "Async atoms integrate with Suspense — suspends until data loads.",
                  "Write-only atoms (actions) don't cause re-renders on read.",
                  "No provider wrapper needed — atoms are global by default.",
                  "Scales from simple to complex dependent state."
        ],
        mistake: "Creating new atoms on every render — define atoms outside components so they're stable references.",
        shorthand: {
          verbose: "function App() {\n  const countAtom = atom({ key: 'count', default: 0 });  // WRONG — new atom every render!\n  return <Component atom={countAtom} />;\n}",
          concise: "const countAtom = atom({ key: 'count', default: 0 });  // Define outside\n\nfunction App() {\n  return <Component atom={countAtom} />;\n}",
        },
      },
    ],
  },

  // ── Section 3: State Lifting & Composition ─────────────────────────────────────────
  {
    id: "state-lifting-patterns",
    title: "State Lifting & Composition",
    entries: [
      {
        id: "state-lifting",
        fn: "State Lifting Strategy",
        desc: "Best practices for deciding where state lives in the component tree.",
        category: "State Architecture",
        subtitle: "Optimal state placement",
        signature: "Lift state to the lowest common ancestor that needs it",
        descLong: "State should live at the lowest component that needs it. If only one component uses it, keep it local. If multiple components need it, lift to their common ancestor. If many components need it (entire app), use Context/Zustand. Colocation reduces unnecessary re-renders.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of State Lifting Strategy — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, createContext } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of State Lifting Strategy — common patterns you'll see in production.\n// APPROACH  - Combine State Lifting Strategy with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// BAD: State at top level, whole tree re-renders\nfunction App() {\n  const [query, setQuery] = useState('');\n  const [results, setResults] = useState([]);\n  return (\n    <>\n      <Header />\n      <SearchBox query={query} onChange={setQuery} /> {/* expensive*/}\n      <Results results={results} />\n      <Sidebar /> {/* re-renders on every keystroke */}\n    </>\n  );\n}\n// GOOD: State colocated in SearchBox\nfunction SearchBox() {\n  const [query, setQuery] = useState('');\n  return <input value={query} onChange={e => setQuery(e.target.value)} />;\n}\nfunction App() {\n  return (\n    <>\n      <Header />\n      <SearchBox /> {/* isolated re-renders */}\n      <Results />\n      <Sidebar /> {/* never re-renders from search */}\n    </>\n  );\n}\n// When multiple components need the same state\nfunction Dashboard() {\n  const [selectedTab, setSelectedTab] = useState('overview');\n  return (\n    <>\n      <TabNav selectedTab={selectedTab} onSelect={setSelectedTab} />\n      <TabContent selectedTab={selectedTab} />\n    </>\n  );\n}\n// Form state shared between fields\nfunction Form() {\n  const [formData, setFormData] = useState({ name: '', email: '' });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of State Lifting Strategy — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst handleChange = (e) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({ ...prev, [name]: value }));\n  };\n  return (\n    <>\n      <input name=\"name\" value={formData.name} onChange={handleChange} />\n      <input name=\"email\" value={formData.email} onChange={handleChange} />\n    </>\n  );\n}\n// Multiple consumers: lift to Context (already imported above)\n// const AuthContext = createContext();\nfunction AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n  return (\n    <AuthContext.Provider value={{ user, setUser }}>\n      {children}\n    </AuthContext.Provider>\n  );\n}\nfunction App() {\n  return (\n    <AuthProvider>\n      <Header /> {/* uses auth */}\n      <Dashboard /> {/* uses auth */}\n      <Footer /> {/* uses auth */}\n    </AuthProvider>\n  );\n}\n// Performance improvement: children pattern\n// Prevents ExpensiveTree from re-rendering when Counter state changes\nfunction App() {\n  return (\n    <Counter>\n      <ExpensiveTree /> {/* never re-renders with counter */}\n    </Counter>\n  );\n}\nfunction Counter({ children }) {\n  const [count, setCount] = useState(0);\n  return (\n    <>\n      <button onClick={() => setCount(c => c + 1)}>{count}</button>\n      {children}\n    </>\n  );\n}"
                  }
        ],
        tips: [
                  "Ask: \"What is the smallest set of components that need this state?\" — put it there.",
                  "Move state down (colocate) when possible — fewer re-renders without memoization overhead.",
                  "Move state up (lift) only when sharing between siblings.",
                  "The children-as-props pattern isolates renders without lifting state.",
                  "For app-wide state (auth, theme), use Context or Zustand."
        ],
        mistake: "Lifting all state to the top-level App component \"for simplicity\" — this causes the entire tree to re-render on every state change.",
        shorthand: {
          verbose: "function App() {\n  const [count, setCount] = useState(0);\n  const [theme, setTheme] = useState('light');\n  return <Page count={count} theme={theme} />;\n}",
          concise: "// Colocate state where it's needed\nfunction Page() {\n  return <ThemeProvider><CounterSection /></ThemeProvider>;\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
