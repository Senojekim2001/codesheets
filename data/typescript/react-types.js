export const meta = {
  "title": "TypeScript + React",
  "domain": "typescript",
  "sheet": "react-types",
  "icon": "🔷"
}

export const sections = [

  // ── Section 1: React Component Types ─────────────────────────────────────────
  {
    id: "react-typescript",
    title: "React Component Types",
    entries: [
      {
        id: "typed-props",
        fn: "Typed Props & Children",
        desc: "Define component props with interfaces — required, optional, union types, and typed children.",
        category: "React",
        subtitle: "Props interfaces, children, default props",
        signature: "function Card({ title, children }: CardProps)  |  React.PropsWithChildren<T>",
        descLong: "TypeScript props use interfaces or type aliases. Mark optional props with ?. Use React.PropsWithChildren<T> or explicit children: React.ReactNode for components that accept children. Discriminated unions enable polymorphic components (as=\"button\" vs as=\"a\" with different prop sets). Never use React.FC — it adds implicit children typing and prevents generics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Typed Props & Children — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { ReactNode } from 'react'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Typed Props & Children — common patterns you'll see in production.\n// APPROACH  - Combine Typed Props & Children with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface ButtonProps {\n  label: string\n  variant?: 'primary' | 'secondary' | 'danger'  // optional with union\n  size?: 'sm' | 'md' | 'lg'\n  disabled?: boolean\n  onClick: () => void\n}\nfunction Button({ label, variant = 'primary', size = 'md', disabled = false, onClick }: ButtonProps) {\n  return <button className={`btn-${variant} btn-${size}`} disabled={disabled} onClick={onClick}>{label}</button>\n}\ninterface CardProps {\n  title: string\n  children: ReactNode           // any renderable content\n  footer?: ReactNode\n}\nfunction Card({ title, children, footer }: CardProps) {\n  return (\n    <div>\n      <h2>{title}</h2>\n      <div>{children}</div>\n      {footer && <div>{footer}</div>}\n    </div>\n  )\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Typed Props & Children — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ninterface DataLoaderProps<T> {\n  url: string\n  children: (data: T, loading: boolean) => ReactNode\n}\ntype BoxProps<T extends React.ElementType> = {\n  as?: T\n  children: ReactNode\n} & React.ComponentPropsWithoutRef<T>\nfunction Box<T extends React.ElementType = 'div'>({\n  as, children, ...rest\n}: BoxProps<T>) {\n  const Component = as || 'div'\n  return <Component {...rest}>{children}</Component>\n}\n// Usage:\n<Box>div by default</Box>\n<Box as=\"section\" id=\"main\">section element</Box>\n<Box as=\"a\" href=\"/home\">anchor with href</Box>  // href is type-safe!"
                  }
        ],
        tips: [
                  "Use ReactNode for children — it covers strings, numbers, JSX, arrays, null, and fragments.",
                  "Never use React.FC — it adds implicit children and prevents generic components. Use plain functions.",
                  "Polymorphic components with \"as\" prop use React.ComponentPropsWithoutRef<T> for type-safe HTML attributes.",
                  "Default prop values in destructuring ({ size = \"md\" }) are cleaner than defaultProps."
        ],
        mistake: "Using React.FC<Props> — it implicitly includes children (which may not be intended), prevents generic components, and adds no real value. Just type the props parameter directly.",
        shorthand: {
          verbose: "const Button: React.FC<ButtonProps> = ({ label }) => (\n  <button>{label}</button>\n);",
          concise: "function Button({ label }: ButtonProps): JSX.Element { ... } or interface CardProps extends React.ComponentPropsWithoutRef<'div'> { ... }",
        },
      },
      {
        id: "event-types",
        fn: "Event & Ref Types",
        desc: "Type-safe event handlers, form events, and ref types for DOM access.",
        category: "React",
        subtitle: "React.MouseEvent, ChangeEvent, FormEvent, RefObject",
        signature: "onChange: React.ChangeEvent<HTMLInputElement>  |  useRef<HTMLDivElement>(null)",
        descLong: "React provides generic event types parameterized by the target element. ChangeEvent<HTMLInputElement> gives you typed e.target.value. MouseEvent<HTMLButtonElement> gives you typed click targets. Refs use useRef<HTMLElement>(null) for DOM access or useRef<T>(initialValue) for mutable values. forwardRef requires explicit typing of the ref and props.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Event & Ref Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useRef, forwardRef, FormEvent, ChangeEvent, MouseEvent, KeyboardEvent } from 'react'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Event & Ref Types — common patterns you'll see in production.\n// APPROACH  - Combine Event & Ref Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction SearchForm() {\n  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {\n    e.preventDefault()\n    const formData = new FormData(e.currentTarget)\n    const query = formData.get('query') as string\n  }\n  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {\n    console.log(e.target.value)  // typed as string\n  }\n  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {\n    console.log(e.clientX, e.clientY)\n  }\n  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {\n    if (e.key === 'Enter') { /* submit */ }\n  }\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name=\"query\" onChange={handleChange} onKeyDown={handleKeyDown} />\n      <button type=\"submit\" onClick={handleClick}>Search</button>\n    </form>\n  )\n}\n<input onChange={(e) => {\n  // e is automatically ChangeEvent<HTMLInputElement>\n  console.log(e.target.value)\n}} />\nfunction VideoPlayer() {\n  const videoRef = useRef<HTMLVideoElement>(null)\n  const intervalRef = useRef<number>(0)  // mutable ref (no null)\n  const play = () => {\n    videoRef.current?.play()  // need ?. because initial value is null\n  }\n  return <video ref={videoRef} />\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Event & Ref Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ninterface InputProps {\n  label: string\n  error?: string\n}\nconst Input = forwardRef<HTMLInputElement, InputProps>(\n  ({ label, error }, ref) => (\n    <div>\n      <label>{label}</label>\n      <input ref={ref} aria-invalid={!!error} />\n      {error && <span>{error}</span>}\n    </div>\n  )\n)\nInput.displayName = 'Input'\ninterface SelectProps<T> {\n  items: T[]\n  onSelect: (item: T) => void\n  getLabel: (item: T) => string\n}"
                  }
        ],
        tips: [
                  "Inline event handlers get automatic type inference — no need to annotate the parameter.",
                  "useRef<HTMLElement>(null) returns RefObject (readonly .current); useRef<T>(value) returns MutableRefObject.",
                  "forwardRef<RefType, PropsType> — ref type comes FIRST, which is counterintuitive.",
                  "Use e.currentTarget (the element with the handler) not e.target (the actual clicked element) for type safety."
        ],
        mistake: "Typing useRef<HTMLDivElement>() without null — the initial value must be null for DOM refs, otherwise TypeScript won't let you pass it to ref={...}.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst ref = useRef<HTMLDivElement>();\n// Error: Argument of type 'undefined' is not assignable to 'HTMLDivElement'\n// More explicit but longer",
          concise: "useRef<HTMLDivElement>(null) or useRef<T | null>(null); forwardRef<HTMLDivElement, Props>(Comp)",
        },
      },
      {
        id: "generic-components",
        fn: "Generic React Components",
        desc: "Create reusable components that preserve type information through generic type parameters.",
        category: "React",
        subtitle: "Generic list, select, table components",
        signature: "function List<T>({ items, renderItem }: ListProps<T>)",
        descLong: "Generic components maintain type safety across their props — if items is T[], renderItem receives T. This lets you build reusable List, Select, Table, and DataGrid components that work with any data type while providing full autocomplete and type checking at the call site.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic React Components — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { ReactNode } from 'react'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic React Components — common patterns you'll see in production.\n// APPROACH  - Combine Generic React Components with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface ListProps<T> {\n  items: T[]\n  renderItem: (item: T, index: number) => ReactNode\n  keyExtractor: (item: T) => string\n  emptyMessage?: string\n}\nfunction List<T>({ items, renderItem, keyExtractor, emptyMessage = 'No items' }: ListProps<T>) {\n  if (items.length === 0) return <p>{emptyMessage}</p>\n  return (\n    <ul>\n      {items.map((item, i) => (\n        <li key={keyExtractor(item)}>{renderItem(item, i)}</li>\n      ))}\n    </ul>\n  )\n}\n// Usage — TypeScript infers T from items\ninterface User { id: string; name: string; email: string }\n<List\n  items={users}                          // T = User (inferred)\n  renderItem={(user) => <span>{user.name}</span>}  // user: User ✓\n  keyExtractor={(user) => user.id}       // user: User ✓\n/>\ninterface SelectProps<T> {\n  options: T[]\n  value: T | null\n  onChange: (value: T) => void\n  getLabel: (item: T) => string\n  getValue: (item: T) => string\n}\nfunction Select<T>({ options, value, onChange, getLabel, getValue }: SelectProps<T>) {\n  return (\n    <select\n      value={value ? getValue(value) : ''}\n      onChange={(e) => {\n        const selected = options.find(o => getValue(o) === e.target.value)\n        if (selected) onChange(selected)\n      }}\n    >\n      <option value=\"\">Select...</option>\n      {options.map(option => (\n        <option key={getValue(option)} value={getValue(option)}>\n          {getLabel(option)}\n        </option>\n      ))}\n    </select>\n  )\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic React Components — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ninterface Column<T> {\n  key: keyof T\n  header: string\n  render?: (value: T[keyof T], row: T) => ReactNode\n}\ninterface TableProps<T> {\n  data: T[]\n  columns: Column<T>[]\n}\nfunction Table<T extends Record<string, unknown>>({ data, columns }: TableProps<T>) {\n  return (\n    <table>\n      <thead>\n        <tr>{columns.map(c => <th key={String(c.key)}>{c.header}</th>)}</tr>\n      </thead>\n      <tbody>\n        {data.map((row, i) => (\n          <tr key={i}>\n            {columns.map(col => (\n              <td key={String(col.key)}>\n                {col.render ? col.render(row[col.key], row) : String(row[col.key])}\n              </td>\n            ))}\n          </tr>\n        ))}\n      </tbody>\n    </table>\n  )\n}"
                  }
        ],
        tips: [
                  "Let TypeScript infer the generic type from props — users rarely need to specify <User> explicitly.",
                  "keyof T in Column definitions ensures only valid property names are used — catches typos at compile time.",
                  "Generic components are the type-safe alternative to \"any\" props — you get autocomplete without losing flexibility.",
                  "Combine with discriminated unions for variant-aware generic components."
        ],
        mistake: "Using any or unknown for reusable component props — you lose all type safety at the call site. Generic components preserve types end-to-end.",
        shorthand: {
          verbose: "interface ListProps {\n  items: any[]\n  renderItem: (item: any) => ReactNode\n}\n// Call site: no type hints",
          concise: "interface ListProps<T> { items: T[]; renderItem: (item: T) => ReactNode; } function List<T>({ items, renderItem }: ListProps<T>)",
        },
      },
      {
        id: "typed-hooks",
        fn: "Typed Custom Hooks & Context",
        desc: "Type-safe custom hooks with generic return types, and typed Context API with strict null checking.",
        category: "React",
        subtitle: "Typed useState, useContext, useReducer, custom hooks",
        signature: "createContext<T>(null!)  |  useReducer<State, Action>  |  function useFetch<T>()",
        descLong: "Custom hooks benefit from generics: useFetch<T>(url) returns { data: T | null }. Context requires careful typing: createContext with a default value or a non-null assertion pattern. useReducer with discriminated union actions gives exhaustive type checking on dispatch. Type the return value of custom hooks explicitly when inference isn't clear enough.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Typed Custom Hooks & Context — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { createContext, useContext, useReducer, useState, useEffect, useCallback } from 'react'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Typed Custom Hooks & Context — common patterns you'll see in production.\n// APPROACH  - Combine Typed Custom Hooks & Context with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface AuthContextType {\n  user: User | null\n  login: (email: string, password: string) => Promise<void>\n  logout: () => void\n  isLoading: boolean\n}\nconst AuthContext = createContext<AuthContextType | null>(null)\n// Typed hook with null guard\nfunction useAuth(): AuthContextType {\n  const context = useContext(AuthContext)\n  if (!context) throw new Error('useAuth must be used within AuthProvider')\n  return context  // guaranteed non-null\n}\ninterface State {\n  count: number\n  error: string | null\n  loading: boolean\n}\ntype Action =\n  | { type: 'increment' }\n  | { type: 'decrement' }\n  | { type: 'set'; payload: number }\n  | { type: 'error'; message: string }\n  | { type: 'reset' }\nfunction reducer(state: State, action: Action): State {\n  switch (action.type) {\n    case 'increment': return { ...state, count: state.count + 1 }\n    case 'decrement': return { ...state, count: state.count - 1 }\n    case 'set':       return { ...state, count: action.payload }  // payload typed as number\n    case 'error':     return { ...state, error: action.message }\n    case 'reset':     return { count: 0, error: null, loading: false }\n  }\n}\nconst [state, dispatch] = useReducer(reducer, { count: 0, error: null, loading: false })\ndispatch({ type: 'set', payload: 42 })      // ✓\n// dispatch({ type: 'set', payload: 'hi' }) // ✗ payload must be number"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Typed Custom Hooks & Context — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ninterface UseFetchResult<T> {\n  data: T | null\n  error: Error | null\n  loading: boolean\n  refetch: () => void\n}\nfunction useFetch<T>(url: string): UseFetchResult<T> {\n  const [data, setData] = useState<T | null>(null)\n  const [error, setError] = useState<Error | null>(null)\n  const [loading, setLoading] = useState(true)\n  const refetch = useCallback(() => {\n    setLoading(true)\n    fetch(url)\n      .then(r => r.json() as Promise<T>)\n      .then(setData)\n      .catch(setError)\n      .finally(() => setLoading(false))\n  }, [url])\n  useEffect(() => { refetch() }, [refetch])\n  return { data, error, loading, refetch }\n}\n// Usage — T inferred or explicit\nconst { data } = useFetch<User[]>('/api/users')\n// data is User[] | null"
                  }
        ],
        tips: [
                  "Always throw in useContext hooks if context is null — it catches missing providers immediately in development.",
                  "Discriminated union actions in useReducer give exhaustive checking — TypeScript errors if you miss a case.",
                  "Generic hooks like useFetch<T> let callers specify the response type while keeping the hook reusable.",
                  "Explicitly type the return value of complex custom hooks — it serves as documentation and catches regressions."
        ],
        mistake: "Using createContext<AuthContextType>(undefined as any) — it silently hides null access bugs. Use createContext<T | null>(null) and throw in the hook if null.",
        shorthand: {
          verbose: "const AuthContext = createContext<AuthContextType>(undefined as any);\nexport const useAuth = () => {\n  const ctx = useContext(AuthContext); // could be undefined!\n  return ctx;\n};",
          concise: "const AuthContext = createContext<AuthType | null>(null); export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error(...); return ctx; }",
        },
      },
      {
        id: "component-props",
        fn: "ComponentProps & Element Type Extraction",
        desc: "Extract props from existing components — ComponentProps<T>, ComponentPropsWithRef, HTML attributes.",
        category: "React",
        subtitle: "Extract props from components, typed HTML attributes",
        signature: "ComponentProps<typeof MyComponent>  |  ComponentPropsWithRef<\"button\">  |  HTMLAttributes<T>",
        descLong: "ComponentProps<T> extracts the props interface from a component — useful for wrapping or extending components without duplicating props. ComponentPropsWithRef adds ref handling. For HTML elements, use React.ComponentPropsWithoutRef<\"button\"> to get all valid button attributes. This prevents prop interface drift when the wrapped component changes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ComponentProps & Element Type Extraction — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport React, { ComponentProps, ComponentPropsWithRef, HTMLAttributes } from 'react'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ComponentProps & Element Type Extraction — common patterns you'll see in production.\n// APPROACH  - Combine ComponentProps & Element Type Extraction with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface ButtonProps {\n  label: string\n  variant?: 'primary' | 'secondary'\n  disabled?: boolean\n  onClick: () => void\n}\nfunction Button({ label, variant, disabled, onClick }: ButtonProps) {\n  return (\n    <button\n      className={`btn-${variant}`}\n      disabled={disabled}\n      onClick={onClick}\n    >\n      {label}\n    </button>\n  )\n}\n// Extract Button props without redefining\ntype ExtractedButtonProps = ComponentProps<typeof Button>\n// Equivalent to ButtonProps\n// Wrapper component — automatically gets all Button props\ninterface WrapperProps extends ComponentProps<typeof Button> {\n  tooltip?: string\n}\nfunction ButtonWithTooltip({ tooltip, ...rest }: WrapperProps) {\n  return (\n    <div title={tooltip}>\n      <Button {...rest} />\n    </div>\n  )\n}\ninterface InputProps {\n  label: string\n  error?: string\n}\nconst Input = React.forwardRef<HTMLInputElement, InputProps>(\n  ({ label, error }, ref) => (\n    <div>\n      <label>{label}</label>\n      <input ref={ref} aria-invalid={!!error} />\n      {error && <span>{error}</span>}\n    </div>\n  )\n)\n// Extract including ref\ntype InputPropsWithRef = ComponentPropsWithRef<typeof Input>\n// Equivalent to InputProps & { ref: React.Ref<HTMLInputElement> }\n// ButtonHTMLAttributes for <button>\ninterface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'primary' | 'secondary'\n  size?: 'sm' | 'md' | 'lg'\n}\nfunction CustomButton({\n  variant,\n  size,\n  className,\n  ...htmlProps\n}: CustomButtonProps) {\n  return (\n    <button\n      className={`btn btn-${variant} btn-${size} ${className || ''}`}\n      {...htmlProps}\n    />\n  )\n}\n// HTMLAttributes for generic elements\ninterface DivProps extends HTMLAttributes<HTMLDivElement> {\n  padding?: 'sm' | 'md' | 'lg'\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ComponentProps & Element Type Extraction — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype MyDivProps = React.ComponentPropsWithoutRef<'div'> & {\n  customProp: string\n}\n// Polymorphic \"as\" prop with ComponentPropsWithoutRef\ntype BoxProps<T extends React.ElementType = 'div'> = {\n  as?: T\n  children: React.ReactNode\n} & React.ComponentPropsWithoutRef<T>\nfunction Box<T extends React.ElementType = 'div'>({\n  as: Component = 'div',\n  children,\n  ...rest\n}: BoxProps<T>) {\n  return <Component {...rest}>{children}</Component>\n}\n// Usage — href is valid for <a>, not for <div>\n<Box>text</Box>  // ✓ div, no href\n<Box as=\"a\" href=\"/home\">link</Box>  // ✓ a, href valid\n// <Box href=\"/bad\" />  // ✗ div has no href\ntype DetailedButtonProps = React.DetailedHTMLProps<\n  React.ButtonHTMLAttributes<HTMLButtonElement>,\n  HTMLButtonElement\n> & {\n  variant?: 'primary' | 'secondary'\n}"
                  }
        ],
        tips: [
                  "ComponentProps<T> pulls the interface from the component — stay DRY by not redefining props.",
                  "ComponentPropsWithoutRef is better than ComponentPropsWithRef unless you specifically need ref support.",
                  "HTML*Attributes generics for custom elements provide all native attributes (className, style, onClick, etc.).",
                  "Use \"as\" polymorphic pattern with ComponentPropsWithoutRef<T> for maximum flexibility."
        ],
        mistake: "Redefining a component's props interface instead of extracting with ComponentProps — changes to the wrapped component prop signature won't flow to consumers.",
        shorthand: {
          verbose: "// Manual / verbose approach\ninterface MyProps extends ButtonHTMLAttributes<HTMLButtonElement> { custom: string; }\n// More explicit but longer",
          concise: "type MyProps = ComponentPropsWithoutRef<\"button\"> & { custom: string }",
        },
      },
      {
        id: "children-types",
        fn: "Children Types — ReactNode vs ReactElement vs JSX.Element",
        desc: "Distinguish between ReactNode (any renderable), ReactElement (JSX), and JSX.Element (React.createElement result).",
        category: "React",
        subtitle: "Children typing, renderable content, element types",
        signature: "children: React.ReactNode  |  children: React.ReactElement  |  children: JSX.Element",
        descLong: "ReactNode is the broadest — it includes strings, numbers, null, undefined, JSX elements, fragments, and arrays. ReactElement is specifically a JSX element object. JSX.Element is the return type of JSX expressions. Use ReactNode for most cases (especially children props), ReactElement when you need actual element objects, and JSX.Element when typing the return value of render functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Children Types — ReactNode vs ReactElement vs JSX.Element — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport React, { ReactNode, ReactElement, ReactText } from 'react'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Children Types — ReactNode vs ReactElement vs JSX.Element — common patterns you'll see in production.\n// APPROACH  - Combine Children Types — ReactNode vs ReactElement vs JSX.Element with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface CardProps {\n  title: string\n  children: ReactNode        // strings, numbers, elements, arrays, null, undefined\n  footer?: ReactNode\n}\nfunction Card({ title, children, footer }: CardProps) {\n  return (\n    <div>\n      <h2>{title}</h2>\n      <div>{children}</div>\n      {footer && <footer>{footer}</footer>}\n    </div>\n  )\n}\n// Valid children\n<Card title=\"Example\">\n  Hello                          {/* string */}\n  {42}                           {/* number */}\n  <span>element</span>           {/* ReactElement */}\n  {null}                         {/* null */}\n  {undefined}                    {/* undefined */}\n  {[<div>1</div>, <div>2</div>]} {/* array of elements */}\n  <>fragment</>                  {/* fragment */}\n</Card>\ninterface ListProps {\n  items: string[]\n  renderItem: (item: string) => ReactElement  // Must return JSX element\n}\nfunction List({ items, renderItem }: ListProps) {\n  return (\n    <ul>\n      {items.map((item, i) => (\n        <li key={i}>{renderItem(item)}</li>\n      ))}\n    </ul>\n  )\n}\n// Valid\n<List\n  items={[\"a\", \"b\"]}\n  renderItem={(item) => <span>{item}</span>}  // ✓ returns ReactElement\n/>\n// Invalid\n// renderItem={(item) => item}  // ✗ string is not ReactElement\nfunction renderStatus(status: \"idle\" | \"loading\"): JSX.Element {\n  if (status === \"idle\") {\n    return <p>Ready</p>\n  } else {\n    return <p>Loading...</p>\n  }\n}\ninterface DataLoaderProps<T> {\n  data: T | null\n  loading: boolean\n  error: Error | null\n  children: (props: { data: T | null; loading: boolean; error: Error | null }) => ReactNode\n}\nfunction DataLoader<T>({ data, loading, error, children }: DataLoaderProps<T>) {\n  return <div>{children({ data, loading, error })}</div>\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Children Types — ReactNode vs ReactElement vs JSX.Element — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype ReactText = string | number\ninterface TooltipProps {\n  content: ReactText  // Only strings/numbers, not JSX\n}\n// Only allow element children (not text)\ninterface ContainerProps {\n  children: ReactElement | ReactElement[]\n}\nfunction Container({ children }: ContainerProps) {\n  return <div>{children}</div>\n}\n// Valid\n<Container>\n  <div>only elements allowed</div>\n</Container>\n// Invalid\n// <Container>text only</Container>  // ✗ string not allowed\ninterface WrapperProps extends React.PropsWithChildren {\n  label: string\n}\nfunction Wrapper({ label, children }: WrapperProps) {\n  return (\n    <div>\n      <h3>{label}</h3>\n      {children}\n    </div>\n  )\n}"
                  }
        ],
        tips: [
                  "Use ReactNode for children prop in almost all cases — it's the most flexible.",
                  "ReactElement is for when you explicitly need element objects, not strings/numbers.",
                  "PropsWithChildren<Props> is equivalent to Props & { children: ReactNode }.",
                  "JSX.Element is the return type of render functions — it's never used for props."
        ],
        mistake: "Using ReactElement for children when you want to allow strings — ReactElement excludes text. Use ReactNode instead.",
        shorthand: {
          verbose: "interface Props {\n  children: React.ReactElement  // Too restrictive, excludes strings/numbers\n}",
          concise: "interface Props { children: React.ReactNode } // Strings, elements, arrays, null, undefined",
        },
      },
      {
        id: "hoc-types",
        fn: "Higher-Order Component Typing",
        desc: "Type-safe wrappers that enhance component props — WithAuth, WithTheme, WithRouter.",
        category: "React",
        subtitle: "HOC pattern, component wrapping, prop injection",
        signature: "function withAuth<P>(Component: React.ComponentType<P>): React.ComponentType<Omit<P, \"user\">>",
        descLong: "A higher-order component (HOC) is a function that takes a component and returns a new component with added functionality. Typing HOCs requires extracting the original component's props, removing the injected ones, and typing the wrapper. This is essential for middleware-like patterns (auth guards, theme providers, analytics wrappers).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Higher-Order Component Typing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport React, { ComponentType } from 'react'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Higher-Order Component Typing — common patterns you'll see in production.\n// APPROACH  - Combine Higher-Order Component Typing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface User { id: string; email: string }\ninterface WithAuthProps {\n  user: User\n  isLoading: boolean\n}\nfunction withAuth<P extends WithAuthProps>(\n  Component: ComponentType<P>\n): ComponentType<Omit<P, keyof WithAuthProps>> {\n  return (props: Omit<P, keyof WithAuthProps>) => {\n    const [user, setUser] = React.useState<User | null>(null)\n    const [isLoading, setIsLoading] = React.useState(true)\n    React.useEffect(() => {\n      fetchUser().then((u) => {\n        setUser(u)\n        setIsLoading(false)\n      })\n    }, [])\n    if (isLoading) return <p>Loading...</p>\n    if (!user) return <p>Not authenticated</p>\n    return <Component {...(props as P)} user={user} isLoading={false} />\n  }\n}\n// Usage\ninterface DashboardProps extends WithAuthProps {\n  title: string\n}\nfunction Dashboard({ user, isLoading, title }: DashboardProps) {\n  return <h1>{title} — {user.email}</h1>\n}\nconst ProtectedDashboard = withAuth(Dashboard)\n// Props: Omit<DashboardProps, \"user\" | \"isLoading\"> = { title: string }\n<ProtectedDashboard title=\"Dashboard\" />  // ✓ user, isLoading injected\ntype Theme = \"light\" | \"dark\"\ninterface WithThemeProps {\n  theme: Theme\n  toggleTheme: () => void\n}\nfunction withTheme<P extends WithThemeProps>(\n  Component: ComponentType<P>\n): ComponentType<Omit<P, keyof WithThemeProps>> {\n  return (props: Omit<P, keyof WithThemeProps>) => {\n    const [theme, setTheme] = React.useState<Theme>(\"light\")\n    return (\n      <Component\n        {...(props as P)}\n        theme={theme}\n        toggleTheme={() => setTheme((t) => t === \"light\" ? \"dark\" : \"light\")}\n      />\n    )\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Higher-Order Component Typing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction compose<P1, P2>(\n  hoc1: (c: ComponentType<P1>) => ComponentType<Omit<P1, keyof any>>,\n  hoc2: (c: ComponentType<P2>) => ComponentType<Omit<P2, keyof any>>\n) {\n  return (Component: ComponentType<P1 & P2>) => {\n    return hoc1(hoc2(Component) as any) as any\n  }\n}\ninterface WithRouterProps {\n  navigate: (path: string) => void\n  currentPath: string\n}\nfunction withRouter<P extends WithRouterProps>(\n  Component: ComponentType<P>\n): ComponentType<Omit<P, keyof WithRouterProps>> {\n  return (props: Omit<P, keyof WithRouterProps>) => {\n    const [path, setPath] = React.useState(\"/\")\n    return (\n      <Component\n        {...(props as P)}\n        navigate={(p) => setPath(p)}\n        currentPath={path}\n      />\n    )\n  }\n}"
                  }
        ],
        tips: [
                  "Extract injected props into an interface (WithAuthProps) — makes the HOC contract explicit.",
                  "Omit<P, keyof WithAuthProps> removes injected props from the wrapper return type.",
                  "ComponentType<P> is React.FunctionComponent<P> | React.ClassComponent<P> — works with both.",
                  "Modern React prefers custom hooks over HOCs, but HOCs are still useful for code reuse."
        ],
        mistake: "Not removing injected props from the wrapped component's props — callers shouldn't need to provide user/theme/router props manually.",
        shorthand: {
          verbose: "// Manual / verbose approach\nfunction withAuth<P extends { user: User }>(C: ComponentType<P>): ComponentType<Omit<P, \"user\">> { ... }\n// More explicit but longer",
          concise: "// HOC returns ComponentType with injected props removed from signature",
        },
      },
      {
        id: "styled-components-types",
        fn: "Typed Styled Components",
        desc: "Type styled-components with generic props — styled.div<Props>, theme typing, DefaultTheme.",
        category: "React",
        subtitle: "Styled-components generics, theme types, prop-based styling",
        signature: "styled.div<Props>`...`  |  ThemeProvider + DefaultTheme",
        descLong: "Styled-components supports generic type parameters to enable prop-based styling with type safety. Define a Props interface, pass it to styled.div<Props>, and use ${(props) => ...} accessors. For global theme typing, extend DefaultTheme and create a typed theme object. This prevents typos in style functions and ensures consistency across styled components.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Typed Styled Components — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport styled from 'styled-components'\nimport { DefaultTheme } from 'styled-components'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Typed Styled Components — common patterns you'll see in production.\n// APPROACH  - Combine Typed Styled Components with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ndeclare module 'styled-components' {\n  export interface DefaultTheme {\n    colors: {\n      primary: string\n      secondary: string\n      background: string\n    }\n    spacing: {\n      xs: string\n      sm: string\n      md: string\n      lg: string\n    }\n    fonts: {\n      body: string\n      heading: string\n    }\n  }\n}\nconst theme: DefaultTheme = {\n  colors: {\n    primary: \"#0070f3\",\n    secondary: \"#ff0080\",\n    background: \"#ffffff\"\n  },\n  spacing: {\n    xs: \"4px\",\n    sm: \"8px\",\n    md: \"16px\",\n    lg: \"32px\"\n  },\n  fonts: {\n    body: \"system-ui, sans-serif\",\n    heading: \"Georgia, serif\"\n  }\n}\ninterface ButtonProps {\n  variant?: \"primary\" | \"secondary\" | \"danger\"\n  size?: \"sm\" | \"md\" | \"lg\"\n  fullWidth?: boolean\n}\nconst Button = styled.button<ButtonProps>`\n  padding: ${(p) => p.theme.spacing[p.size === \"sm\" ? \"sm\" : \"md\"]};\n  background-color: ${(p) =>\n    p.variant === \"primary\"\n      ? p.theme.colors.primary\n      : p.variant === \"secondary\"\n      ? p.theme.colors.secondary\n      : \"red\"};\n  width: ${(p) => (p.fullWidth ? \"100%\" : \"auto\")};\n  font-family: ${(p) => p.theme.fonts.body};\n`\n// Usage — props are type-checked\n<Button variant=\"primary\" size=\"md\">\n  Click me\n</Button>\ninterface InputProps {\n  isValid?: boolean\n  isError?: boolean\n}\nconst Input = styled.input<InputProps>`\n  border: 2px solid ${(p) =>\n    p.isError ? \"red\" : p.isValid ? \"green\" : p.theme.colors.primary};\n  padding: ${(p) => p.theme.spacing.md};\n  font-family: ${(p) => p.theme.fonts.body};\n`"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Typed Styled Components — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ninterface CardProps {\n  hoverable?: boolean\n}\nconst Card = styled.div<CardProps>`\n  padding: ${(p) => p.theme.spacing.lg};\n  border-radius: 8px;\n  background: ${(p) => p.theme.colors.background};\n  transition: ${(p) => (p.hoverable ? \"0.2s\" : \"none\")};\n  &:hover {\n    box-shadow: ${(p) => (p.hoverable ? \"0 4px 12px rgba(0,0,0,0.1)\" : \"none\")};\n  }\n`\n// Extend base card\nconst HighlightedCard = styled(Card)`\n  border: 2px solid ${(p) => p.theme.colors.primary};\n`\ninterface TextProps {\n  color?: keyof typeof theme.colors\n  size?: \"sm\" | \"md\" | \"lg\"\n  weight?: \"normal\" | \"bold\" | \"900\"\n}\nconst Text = styled.span<TextProps>`\n  color: ${(p) => (p.color ? p.theme.colors[p.color] : \"inherit\")};\n  font-size: ${(p) => (p.size === \"sm\" ? \"14px\" : p.size === \"lg\" ? \"20px\" : \"16px\")};\n  font-weight: ${(p) => p.weight || \"normal\"};"
                  }
        ],
        tips: [
                  "Extend DefaultTheme in a declare module block to get autocomplete on props.theme.",
                  "Generic props <Props> enable prop-based conditional styling without className gymnastics.",
                  "keyof typeof theme.colors provides strict typing — only valid color names pass type check.",
                  "styled(Component) creates variants that inherit base styles — use for consistent style inheritance."
        ],
        mistake: "Using string literal types in styled component props without constraining to theme values — typos cause runtime mismatches.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst Button = styled.button<ButtonProps> with tagged template for CSS\n// More explicit but longer",
          concise: "// Generic props on styled.tag<T> for type-safe conditional styling; extend DefaultTheme",
        },
      },
    ],
  },
]

export default { meta, sections }
