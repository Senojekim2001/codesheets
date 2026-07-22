export const meta = {
  "title": "React Router",
  "domain": "react",
  "sheet": "router",
  "icon": "🗺️"
}

export const sections = [

  // ── Section 1: Routing Fundamentals ─────────────────────────────────────────
  {
    id: "routing-fundamentals",
    title: "Routing Fundamentals",
    entries: [
      {
        id: "browser-router",
        fn: "BrowserRouter",
        desc: "Component-based router wrapper to enable client-side routing. Use createBrowserRouter for projects requiring loaders/actions.",
        category: "Setup & Basic Routing",
        subtitle: "Component-based router setup",
        signature: "<BrowserRouter>  <Routes>  <Route>",
        descLong: "React Router's <BrowserRouter> component wraps your app to enable client-side routing. Pair with <Routes> and <Route> for declarative routing. This component-based API is simple but doesn't support data loaders or actions. For those features, migrate to createBrowserRouter (v6.4+).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of BrowserRouter — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Component-based router (v6.0-v6.3)\nimport { BrowserRouter, Routes, Route } from 'react-router-dom';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of BrowserRouter — common patterns you'll see in production.\n// APPROACH  - Combine BrowserRouter with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path=\"/\" element={<Home />} />\n        <Route path=\"/about\" element={<About />} />"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of BrowserRouter — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n<Route path=\"/contact\" element={<Contact />} />\n        <Route path=\"*\" element={<NotFound />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}"
                  }
        ],
        tips: [
                  "<BrowserRouter uses the History API — works in all modern browsers.",
                  "Pair with <Routes> and nested <Route> elements for declarative routing.",
                  "No loader or action support — use createBrowserRouter for data APIs.",
                  "<Route path=\"*\"> catches all unmatched paths (404 fallback)."
        ],
        mistake: "Mixing <BrowserRouter> with createBrowserRouter config — they are different APIs. Pick one approach consistently.",
        shorthand: {
          verbose: "<BrowserRouter><Routes><Route path=\"/\" element={<Home />} /></Routes></BrowserRouter>\n\n// vs\n\nconst router = createBrowserRouter([{ path: '/', element: <Home /> }]);\n<RouterProvider router={router} />",
          concise: "// Use createBrowserRouter for modern routing\nconst router = createBrowserRouter([{ path: '/', element: <Home /> }]);\n<RouterProvider router={router} />",
        },
      },
      {
        id: "create-browser-router",
        fn: "createBrowserRouter",
        desc: "Modern data API for client-side routing with loaders, actions, and automatic revalidation (v6.4+).",
        category: "Setup & Basic Routing",
        subtitle: "Data-driven router with loaders and actions",
        signature: "createBrowserRouter([{ path, element, loader, action, errorElement }])",
        descLong: "createBrowserRouter (v6.4+) is the modern approach to React Router. It accepts a route config array and returns a router object passed to <RouterProvider>. Enables route-level data loading via loaders, mutations via actions, and automatic revalidation. Perfect for new projects — offers better DX and data flow control.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of createBrowserRouter — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Modern — createBrowserRouter (v6.4+)\nimport { createBrowserRouter, RouterProvider } from 'react-router-dom';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of createBrowserRouter — common patterns you'll see in production.\n// APPROACH  - Combine createBrowserRouter with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    element: <RootLayout />,\n    errorElement: <ErrorPage />,\n    children: [\n      { index: true, element: <Home /> },\n      { path: 'about', element: <About /> },\n      {\n        path: 'users/:id',\n        element: <UserDetail />,\n        loader: ({ params }) => fetchUser(params.id),\n      },\n    ],\n  },\n]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of createBrowserRouter — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction App() {\n  return <RouterProvider router={router} />;\n}"
                  }
        ],
        tips: [
                  "createBrowserRouter enables data loaders and actions — use it for new projects.",
                  "The index: true route matches the parent path exactly (like / for the root layout).",
                  "errorElement catches loader/action errors and render errors for that route subtree.",
                  "Pass router config array once; RouterProvider wires everything up."
        ],
        mistake: "Using <BrowserRouter> when you need loaders or actions — the component API doesn't support data APIs. Migrate to createBrowserRouter.",
        shorthand: {
          verbose: "<BrowserRouter>\n  <Routes>\n    <Route path=\"/user/:id\" element={<User />} />\n  </Routes>\n</BrowserRouter>",
          concise: "const router = createBrowserRouter([\n  { path: '/user/:id', element: <User />, loader: userLoader }\n]);\n<RouterProvider router={router} />",
        },
      },
      {
        id: "route",
        fn: "<Route>",
        desc: "Defines URL-to-component mappings. Used with <Routes> to declare routes declaratively.",
        category: "Setup & Basic Routing",
        subtitle: "Individual route definition",
        signature: "<Route path=\"/path\" element={<Component />} />",
        descLong: "<Route> is a declarative component that maps a URL path to a component. Used as children of <Routes> in the component-based API. Each <Route> specifies a path pattern and the element to render. Can be nested for nested routes. For the data-driven API, use createBrowserRouter instead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of <Route> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { Routes, Route } from 'react-router-dom';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of <Route> — common patterns you'll see in production.\n// APPROACH  - Combine <Route> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction App() {\n  return (\n    <Routes>\n      <Route path=\"/\" element={<Home />} />\n      <Route path=\"/about\" element={<About />} />\n      <Route path=\"/contact\" element={<Contact />} />\n      <Route path=\"/users/:id\" element={<UserDetail />} />\n      {/* Nested routes */}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of <Route> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n<Route path=\"/dashboard\" element={<DashboardLayout />}>\n        <Route index element={<DashboardHome />} />\n        <Route path=\"settings\" element={<Settings />} />\n      </Route>\n      <Route path=\"*\" element={<NotFound />} />\n    </Routes>\n  );\n}"
                  }
        ],
        tips: [
                  "<Route path=\"*\"> catches all unmatched routes — place it last as a 404 fallback.",
                  "Nested <Route> elements create nested layouts — parent renders via <Outlet>.",
                  "index routes render at the parent URL exactly (path=\"/\" with index: true in data API).",
                  "Dynamic segments use colons: path=\"/users/:id\" passes params to useParams()."
        ],
        mistake: "Forgetting to wrap routes in <Routes> — <Route> elements must be direct children of <Routes>.",
        shorthand: {
          verbose: "<BrowserRouter>\n  <Route path=\"/\" element={<Home />} />\n  <Route path=\"/about\" element={<About />} />\n</BrowserRouter>",
          concise: "<BrowserRouter>\n  <Routes>\n    <Route path=\"/\" element={<Home />} />\n    <Route path=\"/about\" element={<About />} />\n  </Routes>\n</BrowserRouter>",
        },
      },
      {
        id: "outlet",
        fn: "<Outlet>",
        desc: "Placeholder in layout components that renders the matched child route.",
        category: "Setup & Basic Routing",
        subtitle: "Nested route rendering in layouts",
        signature: "<Outlet />  or  <Outlet context={value} />",
        descLong: "<Outlet> is a component that renders whichever child route matched the current URL. Place it in a layout component to enable nested routing with persistent shells (nav, sidebar). <Outlet> can pass context to child routes via the context prop, retrieved with useOutletContext().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of <Outlet> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Layout component with persistent nav\nfunction RootLayout() {\n  return (\n    <div>\n      <NavBar />\n      <main>\n        <Outlet />  {/* matched child route renders here */}\n      </main>\n      <Footer />\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of <Outlet> — common patterns you'll see in production.\n// APPROACH  - Combine <Outlet> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Nested layout passing context\nfunction DashboardLayout() {\n  return (\n    <div className=\"dashboard\">\n      <Sidebar />\n      <Outlet context={{ user: currentUser }} />\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of <Outlet> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Access outlet context in child route\nfunction DashboardPage() {\n  const { user } = useOutletContext();\n  return <div>Welcome, {user.name}</div>;\n}"
                  }
        ],
        tips: [
                  "Always place <Outlet /> in layout components to render child routes.",
                  "<Outlet context={...}> passes data to child routes — retrieve with useOutletContext().",
                  "Multiple <Outlet> levels create deeply nested layouts.",
                  "Outlets are essential for persistent layouts — nav/sidebar stay mounted."
        ],
        mistake: "Forgetting <Outlet /> in a layout component — child routes won't render. Always add <Outlet /> where nested content should appear.",
        shorthand: {
          verbose: "function Layout() {\n  return (\n    <div>\n      <Header />\n      {/* Child routes go here but won't render without <Outlet /> */}\n    </div>\n  );\n}",
          concise: "function Layout() {\n  return <div><Header /><Outlet /></div>;\n}",
        },
      },
      {
        id: "link-navlink",
        fn: "<Link> / <NavLink>",
        desc: "<Link> creates client-side navigation links. <NavLink> adds active styling when its route matches.",
        category: "Navigation",
        subtitle: "Declarative in-app navigation",
        signature: "<Link to=\"/path\">  |  <NavLink to=\"/path\" className={({isActive}) => ...}>",
        descLong: "<Link> renders an <a> tag but handles the click to perform client-side navigation without a full page reload. <NavLink> extends <Link> by providing an isActive flag to its className/style function — perfect for highlighting the active nav item.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of <Link> / <NavLink> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { Link, NavLink } from 'react-router-dom';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of <Link> / <NavLink> — common patterns you'll see in production.\n// APPROACH  - Combine <Link> / <NavLink> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction Navigation() {\n  return (\n    <nav>\n      <Link to=\"/\">Home</Link>\n      <NavLink\n        to=\"/dashboard\"\n        className={({ isActive }) =>\n          isActive ? 'nav-link active' : 'nav-link'\n        }\n      >\n        Dashboard\n      </NavLink>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of <Link> / <NavLink> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n<NavLink\n        to=\"/profile\"\n        className={({ isActive, isPending }) =>\n          isActive ? 'active' : isPending ? 'pending' : ''\n        }\n      >\n        Profile\n      </NavLink>\n    </nav>\n  );\n}"
                  }
        ],
        tips: [
                  "Use <NavLink> for nav menus — the isActive callback gives you precise active styling.",
                  "to can be relative — \"./edit\" or \"../\" works relative to the current route.",
                  "The replace prop replaces the current history entry instead of pushing a new one.",
                  "Use state prop to pass location state: <Link to=\"/page\" state={{ from: location }}>."
        ],
        mistake: "Using <a href=\"/path\"> instead of <Link to=\"/path\"> — a regular href triggers a full page reload, losing all React state.",
        shorthand: {
          verbose: "// Page reloads, React state lost\n<a href=\"/about\">About</a>\n\n// Client-side navigation, state preserved\n<Link to=\"/about\">About</Link>",
          concise: "// WRONG: <a href=\"/about\">About</a>\n// RIGHT: <Link to=\"/about\">About</Link>",
        },
      },
      {
        id: "usenavigate",
        fn: "useNavigate()",
        desc: "Programmatically navigate to a route — useful after form submissions, auth checks, or async actions.",
        category: "Navigation",
        subtitle: "Imperative navigation in event handlers",
        signature: "const navigate = useNavigate()  →  navigate('/path')",
        descLong: "useNavigate returns a navigate function for imperative navigation. Pass a number to navigate history: navigate(-1) goes back. Pass options { replace: true } to replace history. For data mutation workflows, prefer React Router's Form/action APIs over manual navigate calls.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useNavigate() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useNavigate, useLocation } from 'react-router-dom';\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useNavigate() — common patterns you'll see in production.\n// APPROACH  - Combine useNavigate() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction LoginForm() {\n  const navigate = useNavigate();\n  const [error, setError] = useState('');\n  const [loading, setLoading] = useState(false);\n  async function handleSubmit(e) {\n    e.preventDefault();\n    setLoading(true);\n    try {\n      const user = await login();\n      navigate('/dashboard', { replace: true });\n    } catch (err) {\n      setError(err.message);\n      setLoading(false);\n    }\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useNavigate() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <form onSubmit={handleSubmit}>\n      {error && <p className=\"error\">{error}</p>}\n      <button disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "navigate(-1) is the programmatic equivalent of the browser back button.",
                  "Use replace: true after login/logout so the auth page isn't in the back history.",
                  "Pass state for cross-route context — read with useLocation().state in the destination.",
                  "Prefer <Link> and <NavLink> for user-triggered navigation; navigate() for programmatic flows."
        ],
        mistake: "Calling navigate() during render — it must be called inside event handlers or effects, not at the top level of a component.",
        shorthand: {
          verbose: "function Page() {\n  const navigate = useNavigate();\n  navigate('/home');  // WRONG — during render!\n  return <div>Page</div>;\n}",
          concise: "function Page() {\n  const navigate = useNavigate();\n  useEffect(() => { navigate('/home'); }, []);  // RIGHT — in effect\n  return <div>Page</div>;\n}",
        },
      },
    ],
  },

  // ── Section 2: Data & Actions ─────────────────────────────────────────
  {
    id: "data-actions",
    title: "Data & Actions",
    entries: [
      {
        id: "uselocation-usematch",
        fn: "useLocation() / useMatch()",
        desc: "useLocation returns the current location object. useMatch tests if a path matches the current URL.",
        category: "Location Hooks",
        subtitle: "Current URL inspection",
        signature: "const location = useLocation()  |  const match = useMatch(pattern)",
        descLong: "useLocation returns the current location (pathname, search, hash, state, key). useMatch tests if the current URL matches a given pattern and returns match params or null. Both are useful for conditional rendering, analytics, and breadcrumbs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useLocation() / useMatch() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useLocation, useMatch, Link } from 'react-router-dom';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useLocation() / useMatch() — common patterns you'll see in production.\n// APPROACH  - Combine useLocation() / useMatch() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction Breadcrumbs() {\n  const location = useLocation();\n  const segments = location.pathname.split('/').filter(Boolean);\n  return (\n    <nav aria-label=\"breadcrumb\">\n      <ol>\n        <li><Link to=\"/\">Home</Link></li>\n        {segments.map((segment, i) => (\n          <li key={i}>\n            <Link to={'/' + segments.slice(0, i + 1).join('/')}>\n              {segment}\n            </Link>\n          </li>\n        ))}\n      </ol>\n    </nav>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useLocation() / useMatch() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction NavMenu() {\n  const dashboardMatch = useMatch('/dashboard/*');\n  const profileMatch = useMatch('/profile');\n  return (\n    <nav>\n      <Link to=\"/dashboard\" className={dashboardMatch ? 'active' : ''}>\n        Dashboard\n      </Link>\n      <Link to=\"/profile\" className={profileMatch ? 'active' : ''}>\n        Profile\n      </Link>\n    </nav>\n  );\n}"
                  }
        ],
        tips: [
                  "useLocation re-renders the component on every navigation — use sparingly or memoize derived values.",
                  "useMatch is stricter than NavLink's isActive — it returns null if there's no match.",
                  "location.state carries data from navigate(path, { state }) — useful for breadcrumbs and back-navigation.",
                  "location.key changes on every navigation — use as a key prop to force remount on route change."
        ],
        mistake: "Using window.location directly in React components — it bypasses React Router's state management and won't trigger re-renders on navigation.",
        shorthand: {
          verbose: "// Bypasses Router\nwindow.location.href = '/about';\n\n// Uses Router\nconst navigate = useNavigate();\nnavigate('/about');",
          concise: "// WRONG: window.location.href = '/about'\n// RIGHT: const navigate = useNavigate(); navigate('/about')",
        },
      },
      {
        id: "useparams",
        fn: "useParams()",
        desc: "Returns an object of URL parameters from the matched route's dynamic segments.",
        category: "Params & Loaders",
        subtitle: "Access URL dynamic segments",
        signature: "const { id } = useParams()  (for route path=\"users/:id\")",
        descLong: "useParams() reads dynamic segments defined with : in the route path. All values are strings — parse numbers with parseInt or Number(). For query strings (?key=val), use useSearchParams() instead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useParams() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useParams, useSearchParams } from 'react-router-dom';\nimport { useState, useEffect } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useParams() — common patterns you'll see in production.\n// APPROACH  - Combine useParams() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction PostDetail() {\n  const { postId } = useParams();\n  const [searchParams, setSearchParams] = useSearchParams();\n  const [post, setPost] = useState(null);\n  const [loading, setLoading] = useState(true);\n  useEffect(() => {\n    fetchPost(postId).then(p => {\n      setPost(p);\n      setLoading(false);\n    });\n  }, [postId]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useParams() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst page = Number(searchParams.get('page') ?? 1);\n  if (loading) return <div>Loading...</div>;\n  return (\n    <article>\n      <h1>{post.title}</h1>\n      <p>Comment page: {page}</p>\n      <button onClick={() => setSearchParams({ page: page + 1 })}>\n        Next page\n      </button>\n    </article>\n  );\n}"
                  }
        ],
        tips: [
                  "URL params are always strings — always convert with Number() or parseInt() for numeric IDs.",
                  "Use useSearchParams() for query string params — works like useState for the URL query.",
                  "setSearchParams({ page: 2 }) replaces all search params — merge with spread: setSearchParams({ ...Object.fromEntries(searchParams), page: 2 }).",
                  "Prefer loading data in route loaders (useLoaderData) rather than useEffect + useParams."
        ],
        mistake: "Treating URL params as numbers directly — they are always strings. Number(\"123\") is 123 but Number(\"abc\") is NaN — validate before use.",
        shorthand: {
          verbose: "const { id } = useParams();\nconst numId = parseInt(id);  // Could be NaN!\nif (isNaN(numId)) { /* handle error */ }",
          concise: "const { id } = useParams();\nconst numId = parseInt(id);\nif (isNaN(numId)) return <Error />;",
        },
      },
      {
        id: "loader",
        fn: "loader",
        desc: "Route loaders fetch data before the route renders. Define async functions in route config.",
        category: "Params & Loaders",
        subtitle: "Route-level data fetching before render",
        signature: "{ path, loader: async ({ params, request }) => data }",
        descLong: "Loaders are async functions defined in route config that run before the route component renders. They receive { params, request } and must return a value or throw. Throwing a Response triggers errorElement; throwing redirect() redirects to another route. Loaders eliminate loading spinners by ensuring data arrives before component render.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of loader — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { redirect } from 'react-router-dom';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of loader — common patterns you'll see in production.\n// APPROACH  - Combine loader with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport async function userLoader({ params }) {\n  try {\n    const res = await fetch(`/api/users/${params.id}`);\n    if (!res.ok) {\n      if (res.status === 404) throw new Response('User not found', { status: 404 });\n      throw new Response('Server error', { status: res.status });\n    }\n    return res.json();\n  } catch (error) {\n    throw new Response('Failed to load user', { status: 500 });\n  }\n}\nexport async function adminLoader() {\n  const user = await getCurrentUser();\n  if (!user?.isAdmin) {\n    return redirect('/');\n  }\n  return user;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of loader — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Route config\nconst routes = [\n  { path: '/users/:id', element: <UserDetail />, loader: userLoader },\n  { path: '/admin', element: <AdminPanel />, loader: adminLoader },\n];"
                  }
        ],
        tips: [
                  "Throw a Response object (not Error) to trigger the nearest errorElement.",
                  "Use redirect() from react-router-dom inside loaders for auth checks or conditional redirects.",
                  "Parallel loading: multiple nested loaders run in parallel when navigating.",
                  "Loaders run on every navigation — great for fresh data, but cache if needed."
        ],
        mistake: "Using useEffect in components when a loader would eliminate the need entirely — loaders run before render, skipping loading states.",
        shorthand: {
          verbose: "function Page() {\n  const [user, setUser] = useState(null);\n  useEffect(() => { fetchUser().then(setUser); }, []);\n  if (!user) return <Spinner />;\n  return <div>{user.name}</div>;\n}",
          concise: "const user = use(userPromise);\nreturn <div>{user.name}</div>;\n\n// With loader: const user = useLoaderData();",
        },
      },
      {
        id: "use-loader-data",
        fn: "useLoaderData()",
        desc: "Hook that returns the resolved value from a route loader. Data is always ready.",
        category: "Params & Loaders",
        subtitle: "Access route-level loaded data",
        signature: "const data = useLoaderData()",
        descLong: "useLoaderData() returns the value returned by the route loader — it only works inside a component rendered by a route with a loader. The data is fully resolved before render, so the component never sees a loading state. Useful for extracting data in nested child components without passing props.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useLoaderData() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useLoaderData } from 'react-router-dom';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useLoaderData() — common patterns you'll see in production.\n// APPROACH  - Combine useLoaderData() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction UserProfile() {\n  const user = useLoaderData();\n  return (\n    <div className=\"profile\">\n      <h1>{user.name}</h1>\n      <UserCard user={user} />\n      <UserStats user={user} />\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useLoaderData() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction UserCard() {\n  const user = useLoaderData();\n  return (\n    <div className=\"card\">\n      <img src={user.avatar} alt={user.name} />\n      <h2>{user.name}</h2>\n      <p>{user.email}</p>\n      <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "useLoaderData only works in components rendered by a route with a loader.",
                  "Data is always defined — no undefined checks needed like with useEffect.",
                  "Use in nested children without prop drilling — each component can call it.",
                  "Fully typed with TypeScript by specifying loader return type."
        ],
        mistake: "Using useLoaderData outside a route context or in a route without a loader — it will throw an error. Ensure the parent route has a loader defined.",
        shorthand: {
          verbose: "// Without loader: useLoaderData() throws!\nconst router = createBrowserRouter([\n  { path: '/user', element: <User /> }\n]);\n\n// With loader: works\nconst router = createBrowserRouter([\n  { path: '/user', element: <User />, loader: userLoader }\n]);",
          concise: "// WRONG: No loader\n{ path: '/user', element: <User /> }\n\n// RIGHT: With loader\n{ path: '/user', element: <User />, loader: userLoader }",
        },
      },
      {
        id: "route-actions",
        fn: "Route Actions + <Form>",
        desc: "Handle form submissions server-side via route actions — the React Router data mutation pattern.",
        category: "Actions & Mutations",
        subtitle: "Form submissions via route actions",
        signature: "{ path, action: async ({ request }) => { } }  +  <Form method=\"post\">",
        descLong: "Route actions handle non-GET submissions. The action function receives the Request and should return a redirect or data. <Form> from react-router-dom submits to the current route's action by default. Works progressively — functions without JavaScript too. After an action, React Router automatically revalidates all loaders.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Route Actions + <Form> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Route config\n{\n  path: 'todos/new',\n  element: <NewTodoForm />,\n  action: async ({ request }) => {\n    const formData = await request.formData();\n    const title = formData.get('title');\n    if (!title) {\n      return { error: 'Title is required' };\n    }\n    await createTodo({ title });\n    return redirect('/todos');\n  },\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Route Actions + <Form> — common patterns you'll see in production.\n// APPROACH  - Combine Route Actions + <Form> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Component — uses React Router's <Form>\nimport { Form, useActionData, useNavigation } from 'react-router-dom';\nfunction NewTodoForm() {\n  const actionData = useActionData();\n  const navigation = useNavigation();\n  const isSubmitting = navigation.state === 'submitting';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Route Actions + <Form> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <Form method=\"post\">\n      <input name=\"title\" />\n      {actionData?.error && <p>{actionData.error}</p>}\n      <button disabled={isSubmitting}>\n        {isSubmitting ? 'Saving...' : 'Save'}\n      </button>\n    </Form>\n  );\n}"
                  }
        ],
        tips: [
                  "Always redirect after a successful action — prevents form resubmission on refresh.",
                  "Return validation errors (not throw) from actions so useActionData can display them.",
                  "navigation.state tracks the submission lifecycle: idle → submitting → loading → idle.",
                  "React Router revalidates all loaders automatically after every action."
        ],
        mistake: "Using a submit handler with fetch instead of React Router's Form + action — you lose automatic loader revalidation, pending state, and progressive enhancement.",
        shorthand: {
          verbose: "const handleSubmit = async (e) => {\n  e.preventDefault();\n  await fetch('/api/user', { method: 'POST', body: formData });\n};\nreturn <form onSubmit={handleSubmit}>...</form>;",
          concise: "<Form method=\"post\"><input name=\"email\" /></Form>\n\n// Route action handles submission + revalidation",
        },
      },
      {
        id: "usefetcher",
        fn: "useFetcher()",
        desc: "Submit data and call actions/loaders without causing navigation — for in-page mutations.",
        category: "Actions & Mutations",
        subtitle: "Non-navigating fetches and submissions",
        signature: "const fetcher = useFetcher()  →  <fetcher.Form>  or  fetcher.submit()",
        descLong: "useFetcher lets you call loaders and actions without navigating. Use it for inline mutations (like/unlike, delete, status update) that shouldn't change the URL. fetcher.state tracks pending, and fetcher.data holds the last returned value. Multiple fetchers can be active simultaneously.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useFetcher() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useFetcher } from 'react-router-dom';\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useFetcher() — common patterns you'll see in production.\n// APPROACH  - Combine useFetcher() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction PostCard({ post }) {\n  const likeFetcher = useFetcher();\n  const deleteFetcher = useFetcher();\n  const isLiking = likeFetcher.state !== 'idle';\n  const isDeleting = deleteFetcher.state !== 'idle';\n  const currentLikes = likeFetcher.data?.likes ?? post.likes;\n  return (\n    <article className=\"post\">\n      <h3>{post.title}</h3>\n      <p>{post.content}</p>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useFetcher() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n<likeFetcher.Form method=\"post\" action={`/posts/${post.id}/like`}>\n        <button disabled={isLiking} name=\"action\" value=\"toggle\">\n          {isLiking ? 'Updating...' : '❤️'} {currentLikes}\n        </button>\n      </likeFetcher.Form>\n      <deleteFetcher.Form method=\"post\" action={`/posts/${post.id}/delete`}>\n        <button disabled={isDeleting} className=\"danger\">\n          {isDeleting ? 'Deleting...' : 'Delete'}\n        </button>\n      </deleteFetcher.Form>\n    </article>\n  );\n}"
                  }
        ],
        tips: [
                  "fetcher.state is \"idle\" | \"loading\" | \"submitting\" — use for granular pending UI.",
                  "fetcher.data persists between submissions — great for showing last result.",
                  "Multiple useFetcher instances can run simultaneously — each has independent state.",
                  "Use fetcher.load(path) to imperatively fetch a loader's data."
        ],
        mistake: "Using useNavigate + fetch for in-page mutations — useFetcher handles pending state, revalidation, and optimistic UI without navigation.",
        shorthand: {
          verbose: "const navigate = useNavigate();\nconst handleSubmit = async (e) => {\n  e.preventDefault();\n  await fetch('/api/like', { method: 'POST' });\n  navigate('/');\n};",
          concise: "const fetcher = useFetcher();\n<fetcher.Form method=\"post\" action=\"/api/like\">\n  <button type=\"submit\" disabled={fetcher.state === 'submitting'}>Like</button>\n</fetcher.Form>",
        },
      },
    ],
  },
]

export default { meta, sections }
