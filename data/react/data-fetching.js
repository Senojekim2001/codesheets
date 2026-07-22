export const meta = {
  "title": "Data Fetching & Caching",
  "domain": "react",
  "sheet": "data-fetching",
  "icon": "🔄"
}

export const sections = [

  // ── Section 1: TanStack Query (React Query) ─────────────────────────────────────────
  {
    id: "tanstack-query",
    title: "TanStack Query (React Query)",
    entries: [
      {
        id: "usequery",
        fn: "useQuery — Declarative Server State Management",
        desc: "Fetch, cache, and synchronize server data with useQuery: automatic refetching, stale-while-revalidate, and background updates.",
        category: "TanStack Query",
        subtitle: "useQuery, queryKey, queryFn, staleTime, gcTime, enabled",
        signature: "useQuery({ queryKey, queryFn, staleTime })  |  queryClient.invalidateQueries()",
        descLong: "TanStack Query (formerly React Query) manages server state — data that lives on the server and needs fetching, caching, and synchronization. useQuery declaratively fetches data: provide a queryKey (cache key) and queryFn (fetcher). It handles loading states, errors, caching, background refetching, and window focus refetching automatically. staleTime controls how long data is considered fresh. gcTime (garbage collection time) controls how long inactive data stays in cache.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useQuery — Declarative Server State Management — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport {\n  QueryClient,\n  QueryClientProvider,\n  useQuery,\n  useQueryClient,\n} from \"@tanstack/react-query\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useQuery — Declarative Server State Management — common patterns you'll see in production.\n// APPROACH  - Combine useQuery — Declarative Server State Management with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst queryClient = new QueryClient({\n  defaultOptions: {\n    queries: {\n      staleTime: 5 * 60 * 1000,    // 5 min before refetch\n      gcTime: 30 * 60 * 1000,      // 30 min in cache\n      retry: 2,                     // retry failed requests\n      refetchOnWindowFocus: true,   // refetch on tab focus\n    },\n  },\n});\nfunction App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <MyApp />\n    </QueryClientProvider>\n  );\n}\nfunction UserList() {\n  const { data, isLoading, isError, error, isFetching } = useQuery({\n    queryKey: [\"users\"],           // cache key (array)\n    queryFn: async () => {\n      const res = await fetch(\"/api/users\");\n      if (!res.ok) throw new Error(\"Failed to fetch users\");\n      return res.json();\n    },\n  });\n  if (isLoading) return <Skeleton />;\n  if (isError) return <ErrorMessage error={error} />;\n  return (\n    <div>\n      {isFetching && <RefetchIndicator />}\n      {data.map((user) => (\n        <UserCard key={user.id} user={user} />\n      ))}\n    </div>\n  );\n}\nfunction UserProfile({ userId }) {\n  // First: fetch user\n  const userQuery = useQuery({\n    queryKey: [\"user\", userId],\n    queryFn: () => fetchUser(userId),\n  });\n  // Second: fetch posts only when user is loaded\n  const postsQuery = useQuery({\n    queryKey: [\"posts\", userId],\n    queryFn: () => fetchUserPosts(userId),\n    enabled: !!userQuery.data,  // only fetch when user exists\n  });\n  return (\n    <div>\n      <h1>{userQuery.data?.name}</h1>\n      {postsQuery.data?.map((post) => (\n        <PostCard key={post.id} post={post} />\n      ))}\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useQuery — Declarative Server State Management — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// [\"users\"]                      — all users\n// [\"users\", { page: 1 }]        — paginated users\n// [\"users\", userId]              — single user\n// [\"users\", userId, \"posts\"]     — user's posts\n// Invalidating [\"users\"] also invalidates all children!\nfunction UserListWithPrefetch() {\n  const queryClient = useQueryClient();\n  function handleHover(userId) {\n    queryClient.prefetchQuery({\n      queryKey: [\"user\", userId],\n      queryFn: () => fetchUser(userId),\n      staleTime: 60_000,  // don't refetch if less than 1 min old\n    });\n  }\n  return (\n    <ul>\n      {users.map((user) => (\n        <li key={user.id} onMouseEnter={() => handleHover(user.id)}>\n          <Link to={\"/users/\" + user.id}>{user.name}</Link>\n        </li>\n      ))}\n    </ul>\n  );\n}"
                  }
        ],
        tips: [
                  "queryKey arrays are compared deeply — [\"users\", { page: 1 }] is a different cache entry from [\"users\", { page: 2 }].",
                  "Invalidating a parent key invalidates all children — invalidateQueries([\"users\"]) clears all user-related queries.",
                  "prefetchQuery on hover loads data before navigation — the destination page renders instantly from cache.",
                  "staleTime: Infinity makes data never go stale — useful for data that rarely changes (user profile, config)."
        ],
        mistake: "Setting staleTime to 0 (default) for data that rarely changes — every component mount triggers a refetch. Set staleTime: 5 * 60 * 1000 or higher for data that does not change frequently.",
        shorthand: {
          verbose: "// useState + useEffect (verbose, repetitive)\nconst [data, setData] = useState(null);\nconst [loading, setLoading] = useState(false);\nuseEffect(() => {\n  setLoading(true);\n  fetch('/api/users').then(...).finally(() => setLoading(false));\n}, []);",
          concise: "// useQuery (concise, automatic)\nconst { data } = useQuery({\n  queryKey: ['users'],\n  queryFn: () => fetch('/api/users').then(r => r.json())\n})",
        },
      },
      {
        id: "mutations",
        fn: "useMutation — Create, Update, Delete with Optimistic UI",
        desc: "Mutate server data with useMutation: optimistic updates, cache invalidation, and rollback on failure.",
        category: "TanStack Query",
        subtitle: "useMutation, onMutate, onSuccess, onError, invalidateQueries",
        signature: "useMutation({ mutationFn, onSuccess, onMutate })  |  mutation.mutate(data)",
        descLong: "useMutation handles create/update/delete operations with lifecycle callbacks. onMutate fires before the mutation — use it for optimistic updates (immediately update the UI). onSuccess fires after success — invalidate related queries to refetch. onError fires on failure with the context from onMutate — use it to rollback optimistic updates. The mutation object provides mutate(), isPending, isError, and reset(). Combined with invalidateQueries, mutations keep the entire cache consistent.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useMutation — Create, Update, Delete with Optimistic UI — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useMutation, useQueryClient } from \"@tanstack/react-query\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useMutation — Create, Update, Delete with Optimistic UI — common patterns you'll see in production.\n// APPROACH  - Combine useMutation — Create, Update, Delete with Optimistic UI with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction CreateTodoForm() {\n  const queryClient = useQueryClient();\n  const mutation = useMutation({\n    mutationFn: async (newTodo) => {\n      const res = await fetch(\"/api/todos\", {\n        method: \"POST\",\n        headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify(newTodo),\n      });\n      if (!res.ok) throw new Error(\"Failed to create todo\");\n      return res.json();\n    },\n    onSuccess: () => {\n      // Refetch todos list after successful create\n      queryClient.invalidateQueries({ queryKey: [\"todos\"] });\n    },\n  });\n  function handleSubmit(e) {\n    e.preventDefault();\n    const formData = new FormData(e.target);\n    mutation.mutate({ title: formData.get(\"title\") });\n  }\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name=\"title\" required />\n      <button disabled={mutation.isPending}>\n        {mutation.isPending ? \"Adding...\" : \"Add Todo\"}\n      </button>\n      {mutation.isError && <p>Error: {mutation.error.message}</p>}\n    </form>\n  );\n}\nfunction TodoList() {\n  const queryClient = useQueryClient();\n  const toggleMutation = useMutation({\n    mutationFn: async ({ id, done }) => {\n      const res = await fetch(\"/api/todos/\" + id, {\n        method: \"PATCH\",\n        headers: { \"Content-Type\": \"application/json\" },\n        body: JSON.stringify({ done }),\n      });\n      return res.json();\n    },\n    // Optimistic update — before server responds\n    onMutate: async ({ id, done }) => {\n      // Cancel outgoing refetches (avoid overwriting optimistic update)\n      await queryClient.cancelQueries({ queryKey: [\"todos\"] });\n      // Snapshot current state (for rollback)\n      const previousTodos = queryClient.getQueryData([\"todos\"]);\n      // Optimistically update cache\n      queryClient.setQueryData([\"todos\"], (old) =>\n        old.map((todo) =>\n          todo.id === id ? { ...todo, done } : todo\n        )\n      );\n      // Return context for rollback\n      return { previousTodos };\n    },\n    // Rollback on error\n    onError: (err, variables, context) => {\n      queryClient.setQueryData([\"todos\"], context.previousTodos);\n    },\n    // Refetch after settle (success or error)\n    onSettled: () => {\n      queryClient.invalidateQueries({ queryKey: [\"todos\"] });\n    },\n  });\n  return (\n    <ul>\n      {todos.map((todo) => (\n        <li\n          key={todo.id}\n          onClick={() =>\n            toggleMutation.mutate({ id: todo.id, done: !todo.done })\n          }\n          style={{ opacity: todo.done ? 0.5 : 1 }}\n        >\n          {todo.title}\n        </li>\n      ))}\n    </ul>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useMutation — Create, Update, Delete with Optimistic UI — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst deleteMutation = useMutation({\n  mutationFn: (id) => fetch(\"/api/todos/\" + id, { method: \"DELETE\" }),\n  onMutate: async (id) => {\n    await queryClient.cancelQueries({ queryKey: [\"todos\"] });\n    const prev = queryClient.getQueryData([\"todos\"]);\n    queryClient.setQueryData([\"todos\"], (old) =>\n      old.filter((t) => t.id !== id)\n    );\n    return { prev };\n  },\n  onError: (err, id, ctx) => queryClient.setQueryData([\"todos\"], ctx.prev),\n  onSettled: () => queryClient.invalidateQueries({ queryKey: [\"todos\"] }),\n});"
                  }
        ],
        tips: [
                  "Always cancelQueries before optimistic updates — prevents in-flight refetches from overwriting your optimistic data.",
                  "Return the previous state from onMutate — onError receives it as context for clean rollback.",
                  "onSettled fires on both success and error — put invalidateQueries here to ensure cache is always fresh.",
                  "Use mutation.reset() to clear error/success state — useful when closing error toasts or modals."
        ],
        mistake: "Forgetting to cancelQueries in onMutate — a background refetch can overwrite your optimistic update, causing the UI to flash back to the old state before the mutation completes.",
        shorthand: {
          verbose: "// Manual optimistic + rollback (verbose, fragile)\nconst [items, setItems] = useState(data);\nconst backup = items;\nsetItems(items.filter(x => x.id !== id));\ntry {\n  await fetch('/api/items/' + id, {method: 'DELETE'});\n} catch {\n  setItems(backup); // rollback\n}",
          concise: "// useMutation with onMutate (concise, robust)\nuseMutation({\n  mutationFn: (id) => fetch('/api/items/'+id, {method:'DELETE'}),\n  onMutate: (id) => {\n    queryClient.cancelQueries({queryKey: ['items']});\n    const prev = queryClient.getQueryData(['items']);\n    queryClient.setQueryData(['items'], old => old.filter(x => x.id !== id));\n    return { prev };\n  },\n  onError: (err, id, ctx) => queryClient.setQueryData(['items'], ctx.prev)\n})",
        },
      },
    ],
  },

  // ── Section 2: TanStack Query — Advanced Patterns ─────────────────────────────────────────
  {
    id: "tanstack-query-advanced",
    title: "TanStack Query — Advanced Patterns",
    entries: [
      {
        id: "tanstack-query-basics",
        fn: "TanStack Query Basics — Fundamentals",
        desc: "Core TanStack Query concepts: useQuery, QueryClient, QueryClientProvider, and stale time configuration.",
        category: "TanStack Query",
        subtitle: "useQuery, QueryClient, QueryClientProvider, staleTime setup",
        signature: "useQuery({ queryKey, queryFn })  |  new QueryClient()  |  <QueryClientProvider client={queryClient} />",
        descLong: "TanStack Query (React Query) provides declarative server state management. useQuery fetches and caches data with a queryKey. QueryClient manages the cache globally. QueryClientProvider wraps the app. staleTime controls how long data is considered fresh before refetching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of TanStack Query Basics — Fundamentals — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport {\n  QueryClient,\n  QueryClientProvider,\n  useQuery,\n} from \"@tanstack/react-query\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of TanStack Query Basics — Fundamentals — common patterns you'll see in production.\n// APPROACH  - Combine TanStack Query Basics — Fundamentals with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst queryClient = new QueryClient({\n  defaultOptions: {\n    queries: {\n      staleTime: 5 * 60 * 1000,    // 5 min\n      gcTime: 30 * 60 * 1000,      // 30 min\n      retry: 2,\n    },\n  },\n});\nfunction App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      <MyApp />\n    </QueryClientProvider>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of TanStack Query Basics — Fundamentals — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction Users() {\n  const { data, isLoading, error } = useQuery({\n    queryKey: [\"users\"],\n    queryFn: async () => {\n      const res = await fetch(\"/api/users\");\n      return res.json();\n    },\n  });\n  if (isLoading) return <Skeleton />;\n  if (error) return <Error />;\n  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;\n}"
                  }
        ],
        tips: [
                  "staleTime: how long before a refetch is triggered; gcTime: how long unused data stays in cache.",
                  "queryKey is an array — hierarchical keys like [\"users\", userId, \"posts\"] enable selective invalidation.",
                  "Empty dependency array in useQuery dependency list is a mistake — use explicit queryKey deps instead.",
                  "QueryClient is a singleton — create once and share across the app."
        ],
        mistake: "Setting staleTime to 0 for rarely-changing data — the component refetches every mount. Use staleTime: 5 * 60 * 1000 for stable data.",
        shorthand: {
          verbose: "const { data, isLoading } = useQuery({\n  queryKey: [\"users\"],\n  queryFn: async () => {\n    const res = await fetch(\"/api/users\");\n    return res.json();\n  },\n});",
          concise: "const { data, isLoading } = useQuery({\n  queryKey: [\"users\"],\n  queryFn: () => fetch(\"/api/users\").then(r => r.json()),\n});",
        },
      },
      {
        id: "tanstack-query-mutations",
        fn: "useMutation — Mutations & Optimistic Updates",
        desc: "Mutate server data with useMutation: onSuccess, onError, optimistic cache updates via setQueryData.",
        category: "TanStack Query",
        subtitle: "useMutation, onSuccess, onError, setQueryData, optimistic updates",
        signature: "useMutation({ mutationFn, onSuccess, onMutate })  |  mutation.mutate(data)",
        descLong: "useMutation handles create/update/delete with callbacks. onMutate runs before the mutation — update the cache optimistically. onSuccess runs on success — invalidate related queries. onError runs on failure — access onMutate context for rollback. setQueryData directly updates cache without refetching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useMutation — Mutations & Optimistic Updates — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useMutation, useQueryClient } from \"@tanstack/react-query\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useMutation — Mutations & Optimistic Updates — common patterns you'll see in production.\n// APPROACH  - Combine useMutation — Mutations & Optimistic Updates with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction CreateTodo() {\n  const queryClient = useQueryClient();\n  const mutation = useMutation({\n    mutationFn: async (newTodo) => {\n      const res = await fetch(\"/api/todos\", {\n        method: \"POST\",\n        body: JSON.stringify(newTodo),\n        headers: { \"Content-Type\": \"application/json\" },\n      });\n      return res.json();\n    },\n    onSuccess: () => {\n      queryClient.invalidateQueries({ queryKey: [\"todos\"] });\n    },\n  });\n  return (\n    <form onSubmit={(e) => {\n      e.preventDefault();\n      mutation.mutate({ title: \"New todo\" });\n    }}>\n      <button disabled={mutation.isPending}>\n        {mutation.isPending ? \"Adding...\" : \"Add\"}\n      </button>\n    </form>\n  );\n}\nfunction ToggleTodo() {\n  const queryClient = useQueryClient();\n  const toggleMutation = useMutation({\n    mutationFn: ({ id, done }) =>\n      fetch(`/api/todos/${id}`, {\n        method: \"PATCH\",\n        body: JSON.stringify({ done }),\n        headers: { \"Content-Type\": \"application/json\" },\n      }).then(r => r.json()),"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useMutation — Mutations & Optimistic Updates — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nonMutate: async ({ id, done }) => {\n      await queryClient.cancelQueries({ queryKey: [\"todos\"] });\n      const prev = queryClient.getQueryData([\"todos\"]);\n      queryClient.setQueryData([\"todos\"], (old) =>\n        old.map(t => t.id === id ? { ...t, done } : t)\n      );\n      return { prev };\n    },\n    onError: (err, vars, ctx) => {\n      queryClient.setQueryData([\"todos\"], ctx.prev);\n    },\n    onSettled: () => {\n      queryClient.invalidateQueries({ queryKey: [\"todos\"] });\n    },\n  });\n  return (\n    <button onClick={() => toggleMutation.mutate({ id: 1, done: true })}>\n      {toggleMutation.isPending ? \"Updating...\" : \"Toggle\"}\n    </button>\n  );\n}"
                  }
        ],
        tips: [
                  "Always cancelQueries in onMutate before optimistic updates — prevents background refetches overwriting your optimistic data.",
                  "Return context from onMutate for clean rollback in onError.",
                  "onSettled fires on both success and error — ideal for final cache invalidation.",
                  "mutation.reset() clears error/success state — useful when closing toasts."
        ],
        mistake: "Forgetting cancelQueries in onMutate — the UI can flash back to old state when in-flight refetches overwrite optimistic updates.",
        shorthand: {
          verbose: "const mutation = useMutation({\n  mutationFn: (id) => fetch(`/api/todos/${id}`, { method: \"DELETE\" }),\n  onMutate: async (id) => {\n    await queryClient.cancelQueries({ queryKey: [\"todos\"] });\n    const prev = queryClient.getQueryData([\"todos\"]);\n    queryClient.setQueryData([\"todos\"], old => old.filter(t => t.id !== id));\n    return { prev };\n  },\n  onError: (err, id, ctx) => queryClient.setQueryData([\"todos\"], ctx.prev),\n});",
          concise: "const mutation = useMutation({\n  mutationFn: (id) => fetch(`/api/todos/${id}`, { method: \"DELETE\" }),\n  onMutate: (id) => (\n    queryClient.setQueryData([\"todos\"], old => old.filter(t => t.id !== id)),\n    { prev: queryClient.getQueryData([\"todos\"]) }\n  ),\n});",
        },
      },
      {
        id: "tanstack-query-invalidation",
        fn: "Cache Invalidation & Prefetching",
        desc: "Invalidate queries after mutations, prefetch data before navigation, and design query keys for hierarchical invalidation.",
        category: "TanStack Query",
        subtitle: "invalidateQueries, prefetchQuery, query key design",
        signature: "queryClient.invalidateQueries()  |  queryClient.prefetchQuery()  |  query key hierarchies",
        descLong: "invalidateQueries() marks queries as stale and refetches. Parent key invalidation cascades to children: invalidateQueries([\"users\"]) clears all user-related queries. prefetchQuery() loads data before navigation. Design query keys hierarchically: [\"users\"], [\"users\", userId], [\"users\", userId, \"posts\"].",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Cache Invalidation & Prefetching — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useQueryClient } from \"@tanstack/react-query\";\nfunction TodoList() {\n  const queryClient = useQueryClient();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Cache Invalidation & Prefetching — common patterns you'll see in production.\n// APPROACH  - Combine Cache Invalidation & Prefetching with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst invalidateUserTodos = () => {\n    queryClient.invalidateQueries({ queryKey: [\"todos\"] });\n  };\n  const invalidateUserTodosByUser = (userId) => {\n    queryClient.invalidateQueries({\n      queryKey: [\"todos\", { userId }],\n    });\n  };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Cache Invalidation & Prefetching — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst invalidateExpired = () => {\n    queryClient.invalidateQueries({\n      predicate: (query) =>\n        query.isStale() || Date.now() - query.state.dataUpdatedAt > 60000,\n    });\n  };\n  return (\n    <div>\n      <button onClick={invalidateUserTodos}>Refresh All Todos</button>\n      <button onClick={() => invalidateUserTodosByUser(1)}>\n        Refresh User 1 Todos\n      </button>\n    </div>\n  );\n}\nfunction UserList() {\n  const queryClient = useQueryClient();\n  const handleHoverUser = (userId) => {\n    queryClient.prefetchQuery({\n      queryKey: [\"user\", userId],\n      queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),\n      staleTime: 60_000,\n    });\n  };\n  return (\n    <ul>\n      {[1, 2, 3].map(id => (\n        <li\n          key={id}\n          onMouseEnter={() => handleHoverUser(id)}\n          onClick={() => navigate(`/users/${id}`)}\n        >\n          User {id}\n        </li>\n      ))}\n    </ul>\n  );\n}\n// Query key hierarchy design\nconst queryKeys = {\n  all: [\"todos\"],\n  lists: () => [...queryKeys.all, \"list\"],\n  list: (filters) => [...queryKeys.lists(), { filters }],\n  details: () => [...queryKeys.all, \"detail\"],\n  detail: (id) => [...queryKeys.details(), id],\n};\n// Usage:\n// invalidateQueries({ queryKey: queryKeys.lists() }) — invalidates all lists\n// invalidateQueries({ queryKey: queryKeys.detail(5) }) — invalidates one detail"
                  }
        ],
        tips: [
                  "Hierarchical query keys enable cascade invalidation: parent key invalidates all children.",
                  "prefetchQuery on element hover loads data before navigation — destination page renders instantly from cache.",
                  "Exact query key match is required for invalidation — [\"todos\"] does not match [\"todos\", 1].",
                  "Use predicate for complex invalidation logic — invalidate by age, status, or custom conditions."
        ],
        mistake: "Flat query key design like [\"todos\", 1] invalidating [\"todos\"] separately — use hierarchy: parent invalidation cascades to children.",
        shorthand: {
          verbose: "queryClient.invalidateQueries({\n  queryKey: [\"todos\"],\n  exact: false,  // invalidate children too\n});",
          concise: "queryClient.invalidateQueries({ queryKey: [\"todos\"] });",
        },
      },
      {
        id: "tanstack-query-infinite",
        fn: "useInfiniteQuery — Infinite Scroll & Pagination",
        desc: "Load paginated data incrementally with useInfiniteQuery: getNextPageParam, fetchNextPage, and hasNextPage.",
        category: "TanStack Query",
        subtitle: "useInfiniteQuery, getNextPageParam, fetchNextPage, pages array",
        signature: "useInfiniteQuery({ queryKey, queryFn, getNextPageParam })  |  fetchNextPage()",
        descLong: "useInfiniteQuery handles infinite scroll. queryFn receives { pageParam }. getNextPageParam returns the next page param or undefined. Returns { data: { pages, pageParams }, fetchNextPage, hasNextPage, isFetchingNextPage }. data.pages is an array of page results.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useInfiniteQuery — Infinite Scroll & Pagination — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useInfiniteQuery } from \"@tanstack/react-query\";\nimport { useInView } from \"react-intersection-observer\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useInfiniteQuery — Infinite Scroll & Pagination — common patterns you'll see in production.\n// APPROACH  - Combine useInfiniteQuery — Infinite Scroll & Pagination with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction InfinitePostList() {\n  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =\n    useInfiniteQuery({\n      queryKey: [\"posts\"],\n      queryFn: async ({ pageParam = 1 }) => {\n        const res = await fetch(`/api/posts?page=${pageParam}`);\n        return res.json();\n      },\n      getNextPageParam: (lastPage, pages) => {\n        // Return next page number or undefined if no more pages\n        return lastPage.hasMore ? pages.length + 1 : undefined;\n      },\n      initialPageParam: 1,\n    });\n  const { ref, inView } = useInView();\n  // Auto-load next page when observer is in view\n  React.useEffect(() => {\n    if (inView && hasNextPage) fetchNextPage();\n  }, [inView, hasNextPage, fetchNextPage]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useInfiniteQuery — Infinite Scroll & Pagination — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <div>\n      {data?.pages.map((page) =>\n        page.posts.map((post) => (\n          <div key={post.id} className=\"post\">\n            <h3>{post.title}</h3>\n            <p>{post.content}</p>\n          </div>\n        ))\n      )}\n      {isFetchingNextPage && <div>Loading more...</div>}\n      {hasNextPage && <div ref={ref}>Loading trigger</div>}\n    </div>\n  );\n}\nfunction CursorPaginatedList() {\n  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({\n    queryKey: [\"items\"],\n    queryFn: async ({ pageParam = null }) => {\n      const url = new URL(\"/api/items\", window.location.origin);\n      if (pageParam) url.searchParams.set(\"cursor\", pageParam);\n      const res = await fetch(url);\n      return res.json();\n    },\n    getNextPageParam: (lastPage) => lastPage.nextCursor,\n    initialPageParam: null,\n  });\n  return (\n    <div>\n      {data?.pages.map((page) =>\n        page.items.map((item) => <div key={item.id}>{item.name}</div>)\n      )}\n      {hasNextPage && (\n        <button onClick={() => fetchNextPage()}>Load More</button>\n      )}\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "getNextPageParam returns the param for the next page, or undefined when no more pages exist.",
                  "data.pages is an array — map over pages, then items within each page.",
                  "Combine with react-intersection-observer for automatic infinite scroll on element visibility.",
                  "Use cursor-based pagination (getNextPageParam returns a cursor) for better performance on large datasets."
        ],
        mistake: "Returning the page data structure instead of the next page param from getNextPageParam — it should return the param value (number, cursor, etc.), not the page data.",
        shorthand: {
          verbose: "const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({\n  queryKey: [\"posts\"],\n  queryFn: ({ pageParam = 1 }) =>\n    fetch(`/api/posts?page=${pageParam}`).then(r => r.json()),\n  getNextPageParam: (lastPage, pages) =>\n    lastPage.hasMore ? pages.length + 1 : undefined,\n  initialPageParam: 1,\n});",
          concise: "const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({\n  queryKey: [\"posts\"],\n  queryFn: ({ pageParam = 1 }) => fetch(`/api/posts?page=${pageParam}`).then(r => r.json()),\n  getNextPageParam: (lastPage, pages) => lastPage.hasMore ? pages.length + 1 : undefined,\n  initialPageParam: 1,\n});",
        },
      },
      {
        id: "react-query-suspense",
        fn: "Suspense Mode with TanStack Query",
        desc: "Enable Suspense: true for automatic component suspension during fetch, use error boundaries for errors.",
        category: "TanStack Query",
        subtitle: "suspense: true, error boundaries, async rendering",
        signature: "useQuery({ ..., suspense: true })  |  <ErrorBoundary fallback={<Error />}>",
        descLong: "Setting suspense: true in useQuery config makes the hook suspend (throw a Promise) while fetching. Wrap the component in <Suspense> and <ErrorBoundary>. Errors throw an error that the boundary catches. Cleaner than status checks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Suspense Mode with TanStack Query — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useQuery } from \"@tanstack/react-query\";\nimport { Suspense } from \"react\";\nimport ErrorBoundary from \"react-error-boundary\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Suspense Mode with TanStack Query — common patterns you'll see in production.\n// APPROACH  - Combine Suspense Mode with TanStack Query with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction UserDetail({ userId }) {\n  const { data: user } = useQuery({\n    queryKey: [\"user\", userId],\n    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),\n    suspense: true,  // Throw Promise, catch with <Suspense>\n  });\n  return <div><h1>{user.name}</h1></div>;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Suspense Mode with TanStack Query — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction App() {\n  return (\n    <ErrorBoundary fallback={<div>Error loading user</div>}>\n      <Suspense fallback={<div>Loading...</div>}>\n        <UserDetail userId={1} />\n      </Suspense>\n    </ErrorBoundary>\n  );\n}"
                  }
        ],
        tips: [
                  "suspense: true removes the need for isLoading checks — component suspends during fetch.",
                  "Always wrap Suspense components in ErrorBoundary — errors are thrown, not returned.",
                  "Works great with code splitting and server-side rendering in Next.js.",
                  "Suspense fallback shows for all suspended children — use selective Suspense boundaries for fine-grained loading."
        ],
        mistake: "Using suspense: true without ErrorBoundary — errors will crash the component instead of being caught.",
        shorthand: {
          verbose: "const { data, isLoading, error } = useQuery({\n  queryKey: [\"user\", userId],\n  queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),\n});\nif (isLoading) return <Skeleton />;\nif (error) return <Error />;\nreturn <div>{data.name}</div>;",
          concise: "const { data } = useQuery({\n  queryKey: [\"user\", userId],\n  queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),\n  suspense: true,\n});\nreturn <div>{data.name}</div>;",
        },
      },
      {
        id: "query-key-factory",
        fn: "Query Key Factory Pattern",
        desc: "Organize and standardize query keys for type-safe, maintainable cache management.",
        category: "TanStack Query",
        subtitle: "Query key organization, factory pattern, type safety",
        signature: "const queryKeys = { all: [...], lists: () => [...], list: (id) => [...] }",
        descLong: "Query key factories organize keys hierarchically. Define a factory object with methods for each key type. Benefits: single source of truth, type-safe, easy refactoring, automatic parent invalidation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Query Key Factory Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// query-keys.ts\nexport const queryKeys = {\n  users: {\n    all: () => [\"users\"],\n    lists: () => [...queryKeys.users.all(), \"list\"],\n    list: (filters) => [...queryKeys.users.lists(), filters],\n    details: () => [...queryKeys.users.all(), \"detail\"],\n    detail: (id) => [...queryKeys.users.details(), id],\n    search: (query) => [...queryKeys.users.all(), \"search\", query],\n  },\n  posts: {\n    all: () => [\"posts\"],\n    lists: () => [...queryKeys.posts.all(), \"list\"],\n    list: (userId) => [...queryKeys.posts.lists(), userId],\n    details: () => [...queryKeys.posts.all(), \"detail\"],\n    detail: (id) => [...queryKeys.posts.details(), id],\n  },\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Query Key Factory Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Query Key Factory Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Usage in components:\nfunction UserList() {\n  const { data } = useQuery({\n    queryKey: queryKeys.users.lists(),\n    queryFn: () => fetch(\"/api/users\").then(r => r.json()),\n  });\n  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;\n}\n// Usage in mutations:\nfunction DeleteUser({ userId }) {\n  const queryClient = useQueryClient();\n  const mutation = useMutation({\n    mutationFn: () =>\n      fetch(`/api/users/${userId}`, { method: \"DELETE\" }),\n    onSuccess: () => {\n      // Invalidate all user queries\n      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });\n    },\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Query Key Factory Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn <button onClick={() => mutation.mutate()}>Delete</button>;\n}\n// TypeScript version (strict typing)\nimport type { UseQueryOptions } from \"@tanstack/react-query\";\nexport const userQueries = {\n  all: () => [\"users\"] as const,\n  lists: () => [...userQueries.all(), \"list\"] as const,\n  list: (filters: { page: number }) =>\n    [...userQueries.lists(), filters] as const,\n} satisfies Record<string, (...args: any[]) => readonly unknown[]>;"
                  }
        ],
        tips: [
                  "Factory pattern creates a single source of truth for query keys — refactor one place, all usages update.",
                  "Hierarchical structure enables cascade invalidation: invalidate parent, children update automatically.",
                  "TypeScript \"as const\" makes keys strictly typed — benefits from IDE autocomplete and type checking.",
                  "Name factories by domain (users, posts, comments) for organization."
        ],
        mistake: "Hardcoding query keys in every component — use a factory for DRY, consistent keys across the app.",
        shorthand: {
          verbose: "const queryKeys = {\n  users: {\n    all: () => [\"users\"],\n    detail: (id) => [\"users\", \"detail\", id],\n  },\n};\n\nqueryClient.invalidateQueries({\n  queryKey: queryKeys.users.all(),\n});",
          concise: "const qk = { users: { all: () => [\"users\"], detail: (id) => [\"users\", \"detail\", id] } };\nqueryClient.invalidateQueries({ queryKey: qk.users.all() });",
        },
      },
      {
        id: "optimistic-updates",
        fn: "Optimistic Update Pattern",
        desc: "Update UI before server responds, rollback on error. Combine onMutate, setQueryData, and cancelQueries.",
        category: "TanStack Query",
        subtitle: "Optimistic updates, rollback on error, user experience",
        signature: "onMutate: (vars) => { cancelQueries, snapshot, setQueryData, return context }",
        descLong: "Optimistic updates improve perceived performance: update cache before server, show instant feedback. onMutate runs before the mutation — snapshot current state, update optimistically. onError rolls back using the snapshot. onSettled refetches to ensure consistency.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Optimistic Update Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useMutation, useQueryClient } from \"@tanstack/react-query\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Optimistic Update Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Optimistic Update Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction TodoItem({ todo }) {\n  const queryClient = useQueryClient();\n  const toggleMutation = useMutation({\n    mutationFn: ({ id, done }) =>\n      fetch(`/api/todos/${id}`, {\n        method: \"PATCH\",\n        body: JSON.stringify({ done }),\n        headers: { \"Content-Type\": \"application/json\" },\n      }).then(r => r.json()),\n    onMutate: async ({ id, done }) => {\n      // Cancel outgoing refetches for this query\n      await queryClient.cancelQueries({ queryKey: [\"todos\"] });\n      // Snapshot previous todos\n      const previousTodos = queryClient.getQueryData([\"todos\"]);\n      // Optimistically update cache\n      queryClient.setQueryData([\"todos\"], (old) =>\n        old.map(t => t.id === id ? { ...t, done } : t)\n      );\n      // Return rollback context\n      return { previousTodos };\n    },\n    onError: (err, variables, context) => {\n      // Rollback on error\n      queryClient.setQueryData([\"todos\"], context.previousTodos);\n    },\n    onSettled: () => {\n      // Refetch after settle (success or error)\n      queryClient.invalidateQueries({ queryKey: [\"todos\"] });\n    },\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Optimistic Update Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <div\n      onClick={() => toggleMutation.mutate({ id: todo.id, done: !todo.done })}\n      style={{\n        opacity: toggleMutation.isPending ? 0.6 : 1,\n        cursor: \"pointer\",\n      }}\n    >\n      {todo.done ? \"✅\" : \"⬜\"} {todo.title}\n    </div>\n  );\n}\nfunction DeleteTodo({ id }) {\n  const queryClient = useQueryClient();\n  const deleteMutation = useMutation({\n    mutationFn: () =>\n      fetch(`/api/todos/${id}`, { method: \"DELETE\" }),\n    onMutate: async () => {\n      await queryClient.cancelQueries({ queryKey: [\"todos\"] });\n      const prev = queryClient.getQueryData([\"todos\"]);\n      queryClient.setQueryData([\"todos\"], (old) =>\n        old.filter(t => t.id !== id)\n      );\n      return { prev };\n    },\n    onError: (err, vars, ctx) => {\n      queryClient.setQueryData([\"todos\"], ctx.prev);\n    },\n    onSettled: () => {\n      queryClient.invalidateQueries({ queryKey: [\"todos\"] });\n    },\n  });\n  return (\n    <button onClick={() => deleteMutation.mutate()}>\n      {deleteMutation.isPending ? \"Deleting...\" : \"Delete\"}\n    </button>\n  );\n}"
                  }
        ],
        tips: [
                  "Always cancelQueries before optimistic updates — prevents background refetches from overwriting.",
                  "Return full context from onMutate for complete rollback — include the previous state.",
                  "Use onSettled for final cache sync — fires on both success and error.",
                  "Show visual feedback (opacity, disabled button) during mutation to indicate operation in progress."
        ],
        mistake: "Forgetting onError rollback — user sees stale data if the mutation fails.",
        shorthand: {
          verbose: "const mutation = useMutation({\n  mutationFn: (data) => updateItem(data),\n  onMutate: async (vars) => {\n    await queryClient.cancelQueries({ queryKey: [\"items\"] });\n    const prev = queryClient.getQueryData([\"items\"]);\n    queryClient.setQueryData([\"items\"], old => old.map(item => item.id === vars.id ? vars : item));\n    return { prev };\n  },\n  onError: (err, vars, ctx) => queryClient.setQueryData([\"items\"], ctx.prev),\n});",
          concise: "const mutation = useMutation({\n  mutationFn: (data) => updateItem(data),\n  onMutate: (vars) => (\n    queryClient.setQueryData([\"items\"], old => old.map(item => item.id === vars.id ? vars : item)),\n    { prev: queryClient.getQueryData([\"items\"]) }\n  ),\n});",
        },
      },
      {
        id: "parallel-queries",
        fn: "useQueries — Parallel & Dynamic Queries",
        desc: "Execute multiple queries in parallel with useQueries, combine results, reduce waterfalls.",
        category: "TanStack Query",
        subtitle: "useQueries, parallel fetching, dynamic query arrays",
        signature: "useQueries({ queries: [...] })  |  return array of results",
        descLong: "useQueries accepts an array of query configs and returns an array of results. Perfect for parallel requests: fetch user data, settings, and notifications simultaneously. Better than multiple useQuery calls — single hook, combined state. Works with dynamic query counts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useQueries — Parallel & Dynamic Queries — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useQueries } from \"@tanstack/react-query\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useQueries — Parallel & Dynamic Queries — common patterns you'll see in production.\n// APPROACH  - Combine useQueries — Parallel & Dynamic Queries with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction UserDashboard({ userId }) {\n  // Fetch user, settings, and notifications in parallel\n  const [userQuery, settingsQuery, notificationsQuery] = useQueries({\n    queries: [\n      {\n        queryKey: [\"user\", userId],\n        queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),\n      },\n      {\n        queryKey: [\"settings\", userId],\n        queryFn: () => fetch(`/api/users/${userId}/settings`).then(r => r.json()),\n      },\n      {\n        queryKey: [\"notifications\", userId],\n        queryFn: () => fetch(`/api/users/${userId}/notifications`).then(r => r.json()),\n      },\n    ],\n  });\n  // Combined loading state\n  const isLoading = [userQuery, settingsQuery, notificationsQuery].some(\n    (q) => q.isLoading\n  );\n  if (isLoading) return <Skeleton />;\n  return (\n    <div>\n      <h1>{userQuery.data?.name}</h1>\n      <p>Theme: {settingsQuery.data?.theme}</p>\n      <p>Unread: {notificationsQuery.data?.unread}</p>\n    </div>\n  );\n}\nfunction UserCards({ userIds }) {\n  // Dynamic queries based on ID array length\n  const userQueries = useQueries({\n    queries: userIds.map((id) => ({\n      queryKey: [\"user\", id],\n      queryFn: () => fetch(`/api/users/${id}`).then(r => r.json()),\n    })),\n  });\n  const isLoading = userQueries.some((q) => q.isLoading);\n  const allData = userQueries.map((q) => q.data);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useQueries — Parallel & Dynamic Queries — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <div>\n      {isLoading && <p>Loading users...</p>}\n      {allData.map((user) => (\n        <div key={user?.id}>\n          <h3>{user?.name}</h3>\n        </div>\n      ))}\n    </div>\n  );\n}\n// Combining results from parallel queries\nfunction CombinedData({ userId }) {\n  const queries = useQueries({\n    queries: [\n      {\n        queryKey: [\"user\", userId],\n        queryFn: async () => {\n          const res = await fetch(`/api/users/${userId}`);\n          return res.json();\n        },\n      },\n      {\n        queryKey: [\"posts\", userId],\n        queryFn: async () => {\n          const res = await fetch(`/api/users/${userId}/posts`);\n          return res.json();\n        },\n      },\n    ],\n  });\n  const [userResult, postsResult] = queries;\n  if (userResult.isLoading || postsResult.isLoading) {\n    return <Skeleton />;\n  }\n  return (\n    <div>\n      <h1>{userResult.data?.name}</h1>\n      <div>\n        {postsResult.data?.map((post) => (\n          <article key={post.id}>{post.title}</article>\n        ))}\n      </div>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "useQueries fetches all queries in parallel — no waterfalls, faster overall load time.",
                  "Query count can be dynamic — map over userIds array for variable query counts.",
                  "Combine results manually — index into the results array, or use array methods (map, reduce).",
                  "Each query in the array respects individual config (staleTime, retry, etc.)."
        ],
        mistake: "Using multiple useQuery hooks instead of useQueries for parallel requests — less efficient, harder to manage combined state.",
        shorthand: {
          verbose: "const queries = useQueries({\n  queries: [\n    { queryKey: [\"user\", id], queryFn: () => fetchUser(id) },\n    { queryKey: [\"posts\", id], queryFn: () => fetchPosts(id) },\n    { queryKey: [\"notifications\", id], queryFn: () => fetchNotifications(id) },\n  ],\n});\nconst [user, posts, notifications] = queries;",
          concise: "const [user, posts, notifications] = useQueries({\n  queries: [\n    { queryKey: [\"user\", id], queryFn: () => fetchUser(id) },\n    { queryKey: [\"posts\", id], queryFn: () => fetchPosts(id) },\n    { queryKey: [\"notifications\", id], queryFn: () => fetchNotifications(id) },\n  ],\n});",
        },
      },
    ],
  },

  // ── Section 3: SWR & Axios Patterns ─────────────────────────────────────────
  {
    id: "swr-axios-patterns",
    title: "SWR & Axios Patterns",
    entries: [
      {
        id: "swr-basics",
        fn: "SWR — Stale-While-Revalidate Data Fetching",
        desc: "Lightweight data fetching with SWR from Vercel: cache-first, revalidation, and real-time sync.",
        category: "SWR",
        subtitle: "useSWR, mutate, SWRConfig, conditional fetching, revalidation",
        signature: "useSWR(key, fetcher)  |  mutate(key)  |  useSWRMutation(key, trigger)",
        descLong: "SWR (stale-while-revalidate) is a lightweight data fetching library from Vercel. It returns cached (stale) data immediately, then revalidates in the background. Simpler than TanStack Query with fewer features but smaller bundle size. useSWR takes a key (string or array) and a fetcher function. Global configuration via SWRConfig. Built-in deduplication prevents multiple identical requests. Good for Next.js projects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of SWR — Stale-While-Revalidate Data Fetching — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport useSWR, { SWRConfig, mutate } from \"swr\";\nimport useSWRMutation from \"swr/mutation\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of SWR — Stale-While-Revalidate Data Fetching — common patterns you'll see in production.\n// APPROACH  - Combine SWR — Stale-While-Revalidate Data Fetching with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst fetcher = (url) => fetch(url).then((r) => {\n  if (!r.ok) throw new Error(\"Fetch failed\");\n  return r.json();\n});\nfunction App() {\n  return (\n    <SWRConfig\n      value={{\n        fetcher,\n        revalidateOnFocus: true,\n        dedupingInterval: 2000,  // dedup requests within 2s\n        errorRetryCount: 3,\n      }}\n    >\n      <MyApp />\n    </SWRConfig>\n  );\n}\nfunction Profile() {\n  const { data, error, isLoading, isValidating, mutate } = useSWR(\n    \"/api/user\"\n  );\n  if (isLoading) return <Skeleton />;\n  if (error) return <Error message={error.message} />;\n  return (\n    <div>\n      <h1>{data.name}</h1>\n      <button onClick={() => mutate()}>Refresh</button>\n    </div>\n  );\n}\nfunction UserPosts({ userId }) {\n  // Pass null/false to disable fetching\n  const { data } = useSWR(\n    userId ? \"/api/users/\" + userId + \"/posts\" : null\n  );\n  return data ? <PostList posts={data} /> : null;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of SWR — Stale-While-Revalidate Data Fetching — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction TodoApp() {\n  const { data: todos } = useSWR(\"/api/todos\");\n  const { trigger, isMutating } = useSWRMutation(\n    \"/api/todos\",\n    async (url, { arg }) => {\n      const res = await fetch(url, {\n        method: \"POST\",\n        body: JSON.stringify(arg),\n        headers: { \"Content-Type\": \"application/json\" },\n      });\n      return res.json();\n    }\n  );\n  async function addTodo(title) {\n    // Optimistic update\n    mutate(\"/api/todos\", [...(todos || []), { title, id: \"temp\" }], false);\n    await trigger({ title });\n    // Revalidate\n    mutate(\"/api/todos\");\n  }\n  return (\n    <div>\n      <button onClick={() => addTodo(\"New task\")} disabled={isMutating}>\n        Add\n      </button>\n      <ul>\n        {todos?.map((t) => <li key={t.id}>{t.title}</li>)}\n      </ul>\n    </div>\n  );\n}\n// SWR:\n//   + Smaller bundle (~4KB vs ~13KB)\n//   + Simpler API, less boilerplate\n//   + Great Next.js integration\n//   - No built-in devtools\n//   - Less powerful mutations\n//   - No query cancellation\n//\n// TanStack Query:\n//   + Powerful devtools\n//   + Structured optimistic updates with rollback\n//   + Infinite queries, prefetching, pagination helpers\n//   + Framework-agnostic (Vue, Solid, Svelte)\n//   - Larger bundle, more concepts to learn"
                  }
        ],
        tips: [
                  "SWR deduplicates identical requests automatically — multiple components using useSWR(\"/api/user\") make only one network request.",
                  "Pass null as the key to conditionally disable fetching — cleaner than wrapping useSWR in conditionals.",
                  "mutate(key) revalidates a specific key globally — any component using that key updates automatically.",
                  "SWR is ideal for Next.js projects — it is from Vercel and integrates seamlessly with Next.js patterns."
        ],
        mistake: "Using SWR for complex mutations with optimistic updates and rollback — SWR mutation support is basic compared to TanStack Query. For complex CRUD with optimistic UI, TanStack Query is the better choice.",
        shorthand: {
          verbose: "function Profile({ id }) {\n  const [data, setData] = React.useState(null);\n  const [loading, setLoading] = React.useState(true);\n  const [error, setError] = React.useState(null);\n  React.useEffect(() => {\n    fetch(`/api/user/${id}`)\n      .then(r => r.json())\n      .then(setData)\n      .catch(setError)\n      .finally(() => setLoading(false));\n  }, [id]);\n  if (loading) return <Spinner />;\n  if (error) return <Error />;\n  return <div>{data.name}</div>;\n}",
          concise: "function Profile({ id }) {\n  const { data, error, isLoading } = useSWR(`/api/user/${id}`, fetcher);\n  if (isLoading) return <Spinner />;\n  if (error) return <Error />;\n  return <div>{data.name}</div>;\n}",
        },
      },
      {
        id: "axios-interceptors",
        fn: "Axios Interceptors — Auth Headers & Error Handling",
        desc: "Create Axios instance with request/response interceptors for auth tokens, error handling, and retries.",
        category: "Axios",
        subtitle: "Axios instance, interceptors, auth headers, error handling",
        signature: "axios.create()  |  instance.interceptors.request.use()  |  instance.interceptors.response.use()",
        descLong: "Axios interceptors run before/after requests and responses. Request interceptor: attach auth tokens, set headers. Response interceptor: handle errors globally, refresh tokens, retry logic. Create a single instance, export it, use everywhere.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Axios Interceptors — Auth Headers & Error Handling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport axios from \"axios\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Axios Interceptors — Auth Headers & Error Handling — common patterns you'll see in production.\n// APPROACH  - Combine Axios Interceptors — Auth Headers & Error Handling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst axiosInstance = axios.create({\n  baseURL: process.env.REACT_APP_API_URL || \"http://localhost:3000\",\n  timeout: 10000,\n});\naxiosInstance.interceptors.request.use(\n  (config) => {\n    const token = localStorage.getItem(\"authToken\");\n    if (token) {\n      config.headers.Authorization = `Bearer ${token}`;\n    }\n    config.headers[\"Content-Type\"] = \"application/json\";\n    return config;\n  },\n  (error) => Promise.reject(error)\n);\naxiosInstance.interceptors.response.use(\n  (response) => response,\n  (error) => {\n    // Handle 401 — token expired, refresh\n    if (error.response?.status === 401) {\n      // Clear token and redirect to login\n      localStorage.removeItem(\"authToken\");\n      window.location.href = \"/login\";\n    }\n    // Handle 403 — forbidden\n    if (error.response?.status === 403) {\n      console.error(\"Access denied\");\n    }\n    // Handle network error\n    if (!error.response) {\n      console.error(\"Network error:\", error.message);\n    }\n    return Promise.reject(error);\n  }\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Axios Interceptors — Auth Headers & Error Handling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction UserList() {\n  const [users, setUsers] = React.useState([]);\n  const [loading, setLoading] = React.useState(true);\n  const [error, setError] = React.useState(null);\n  React.useEffect(() => {\n    axiosInstance\n      .get(\"/users\")\n      .then((res) => setUsers(res.data))\n      .catch((err) => setError(err.message))\n      .finally(() => setLoading(false));\n  }, []);\n  if (loading) return <p>Loading...</p>;\n  if (error) return <p>Error: {error}</p>;\n  return (\n    <ul>\n      {users.map((user) => (\n        <li key={user.id}>{user.name}</li>\n      ))}\n    </ul>\n  );\n}\nconst retryRequest = async (\n  request,\n  maxRetries = 3,\n  delay = 1000\n) => {\n  for (let i = 0; i < maxRetries; i++) {\n    try {\n      return await axiosInstance(request);\n    } catch (error) {\n      if (i === maxRetries - 1) throw error;\n      await new Promise((resolve) =>\n        setTimeout(resolve, delay * Math.pow(2, i))\n      );\n    }\n  }\n};\nfunction DataFetch() {\n  const [data, setData] = React.useState(null);\n  React.useEffect(() => {\n    retryRequest({ method: \"GET\", url: \"/data\" })\n      .then((res) => setData(res.data))\n      .catch((err) => console.error(\"Failed after retries:\", err));\n  }, []);\n  return <div>{data && JSON.stringify(data)}</div>;\n}\nlet isRefreshing = false;\nlet failedQueue = [];\nconst processQueue = (error, token = null) => {\n  failedQueue.forEach((prom) => {\n    if (error) {\n      prom.reject(error);\n    } else {\n      prom.resolve(token);\n    }\n  });\n  failedQueue = [];\n};\naxiosInstance.interceptors.response.use(\n  (response) => response,\n  async (error) => {\n    const originalRequest = error.config;\n    if (error.response?.status === 401 && !originalRequest._retry) {\n      if (isRefreshing) {\n        return new Promise((resolve, reject) => {\n          failedQueue.push({ resolve, reject });\n        })\n          .then((token) => {\n            originalRequest.headers.Authorization = `Bearer ${token}`;\n            return axiosInstance(originalRequest);\n          })\n          .catch((err) => Promise.reject(err));\n      }\n      originalRequest._retry = true;\n      isRefreshing = true;\n      try {\n        const response = await axiosInstance.post(\"/refresh-token\");\n        const { token } = response.data;\n        localStorage.setItem(\"authToken\", token);\n        axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;\n        processQueue(null, token);\n        return axiosInstance(originalRequest);\n      } catch (err) {\n        processQueue(err, null);\n        window.location.href = \"/login\";\n        return Promise.reject(err);\n      } finally {\n        isRefreshing = false;\n      }\n    }\n    return Promise.reject(error);\n  }\n);"
                  }
        ],
        tips: [
                  "Create one Axios instance and export it — use everywhere to maintain consistent interceptors.",
                  "Request interceptor: attach auth tokens, set default headers.",
                  "Response interceptor: handle errors globally (401, 403, network), redirect on auth failure.",
                  "Implement token refresh queue to prevent simultaneous refresh requests during 401."
        ],
        mistake: "Creating a new Axios instance in every component — interceptors apply per instance. Create once, export, reuse.",
        shorthand: {
          verbose: "const instance = axios.create({ baseURL: \"/api\" });\ninstance.interceptors.request.use((config) => {\n  const token = localStorage.getItem(\"token\");\n  if (token) config.headers.Authorization = `Bearer ${token}`;\n  return config;\n});\ninstance.interceptors.response.use(\n  (res) => res,\n  (err) => {\n    if (err.response?.status === 401) window.location.href = \"/login\";\n    return Promise.reject(err);\n  }\n);",
          concise: "const instance = axios.create({ baseURL: \"/api\" });\ninstance.interceptors.request.use((c) => ({ ...c, headers: { ...c.headers, Authorization: `Bearer ${localStorage.getItem(\"token\")}` } }));\ninstance.interceptors.response.use((r) => r, (e) => { if (e.response?.status === 401) window.location.href = \"/login\"; return Promise.reject(e); });",
        },
      },
    ],
  },
]

export default { meta, sections }
