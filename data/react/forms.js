export const meta = {
  "title": "Forms & Validation",
  "domain": "react",
  "sheet": "forms",
  "icon": "📝"
}

export const sections = [

  // ── Section 1: Form Basics ─────────────────────────────────────────
  {
    id: "form-basics",
    title: "Form Basics",
    entries: [
      {
        id: "controlled-inputs",
        fn: "Controlled Input Components",
        desc: "Form inputs managed by React state — the recommended approach for most forms.",
        category: "Form Inputs",
        subtitle: "State-driven form inputs",
        signature: "<input value={state} onChange={e => setState(e.target.value)} />",
        descLong: "Controlled components use React state as the single source of truth for input values. Every keystroke triggers an onChange handler that updates state, which then updates the input. This gives you real-time validation, conditional rendering, and easy integration with form submission logic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Controlled Input Components — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Controlled Input Components — common patterns you'll see in production.\n// APPROACH  - Combine Controlled Input Components with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction LoginForm() {\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');\n  const [errors, setErrors] = useState({});\n  const [touched, setTouched] = useState({});\n  const validateEmail = (email) => {\n    if (!email.includes('@')) return 'Invalid email';\n    return '';\n  };\n  const validatePassword = (password) => {\n    if (password.length < 8) return 'Min 8 characters';\n    return '';\n  };\n  const handleChange = (e) => {\n    const { name, value } = e.target;\n    if (name === 'email') setEmail(value);\n    if (name === 'password') setPassword(value);\n  };\n  const handleBlur = (e) => {\n    const { name } = e.target;\n    setTouched(prev => ({ ...prev, [name]: true }));\n    // Validate on blur\n    if (name === 'email') {\n      setErrors(prev => ({\n        ...prev,\n        email: validateEmail(email),\n      }));\n    }\n    if (name === 'password') {\n      setErrors(prev => ({\n        ...prev,\n        password: validatePassword(password),\n      }));\n    }\n  };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Controlled Input Components — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst handleSubmit = (e) => {\n    e.preventDefault();\n    // Validate all fields\n    const newErrors = {\n      email: validateEmail(email),\n      password: validatePassword(password),\n    };\n    setErrors(newErrors);\n    if (Object.values(newErrors).every(e => !e)) {\n      console.log('Form valid, submit:', { email, password });\n      // Reset form after successful submission\n      setEmail('');\n      setPassword('');\n      setTouched({});\n    }\n  };\n  return (\n    <form onSubmit={handleSubmit}>\n      <div className=\"form-group\">\n        <label htmlFor=\"email\">Email</label>\n        <input\n          id=\"email\"\n          name=\"email\"\n          type=\"email\"\n          value={email}\n          onChange={handleChange}\n          onBlur={handleBlur}\n          className={touched.email && errors.email ? 'error' : ''}\n          aria-invalid={!!errors.email}\n          aria-describedby={errors.email ? 'email-error' : undefined}\n        />\n        {touched.email && errors.email && (\n          <p id=\"email-error\" className=\"error-message\">\n            {errors.email}\n          </p>\n        )}\n      </div>\n      <div className=\"form-group\">\n        <label htmlFor=\"password\">Password</label>\n        <input\n          id=\"password\"\n          name=\"password\"\n          type=\"password\"\n          value={password}\n          onChange={handleChange}\n          onBlur={handleBlur}\n          className={touched.password && errors.password ? 'error' : ''}\n          aria-invalid={!!errors.password}\n          aria-describedby={errors.password ? 'password-error' : undefined}\n        />\n        {touched.password && errors.password && (\n          <p id=\"password-error\" className=\"error-message\">\n            {errors.password}\n          </p>\n        )}\n      </div>\n      <button type=\"submit\">Login</button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Use onChange to update state on every keystroke for real-time validation.",
                  "Use onBlur to validate only after the user leaves the field (better UX).",
                  "Separate touched state from errors — only show error messages for touched fields.",
                  "Always include aria-invalid and aria-describedby for accessibility.",
                  "For complex forms, use a form library like React Hook Form instead of manual state."
        ],
        mistake: "Validating on every onChange keystroke without debouncing expensive validations like email existence checks — causes lag and excessive API calls. Use onBlur for expensive validations.",
        shorthand: {
          verbose: "const [email, setEmail] = useState('');\nconst [error, setError] = useState('');\n\nconst handleChange = async (e) => {\n  setEmail(e.target.value);\n  const result = await validateEmail(e.target.value);\n  setError(result.error);\n};",
          concise: "const [email, setEmail] = useState('');\nconst debouncedValidate = useCallback(debounce(validateEmail, 500), []);\nconst handleChange = (e) => { setEmail(e.target.value); debouncedValidate(e.target.value); };",
        },
      },
      {
        id: "form-submission",
        fn: "Form Submission & Reset",
        desc: "Handling form submissions, validation, error handling, and form reset patterns.",
        category: "Form Handling",
        subtitle: "Submit forms with validation and error handling",
        signature: "<form onSubmit={handleSubmit}> ... </form>",
        descLong: "Form submissions start with onSubmit handler on the form. Always prevent default with e.preventDefault(). Validate before submission. On success, reset form and show confirmation. On error, display error messages. For async submissions, track loading and error states.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Form Submission & Reset — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Form Submission & Reset — common patterns you'll see in production.\n// APPROACH  - Combine Form Submission & Reset with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction ContactForm() {\n  const [formData, setFormData] = useState({\n    name: '',\n    email: '',\n    message: '',\n  });\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState(null);\n  const [success, setSuccess] = useState(false);\n  const handleChange = (e) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({\n      ...prev,\n      [name]: value,\n    }));\n  };\n  const validateForm = () => {\n    if (!formData.name.trim()) return 'Name is required';\n    if (!formData.email.includes('@')) return 'Valid email is required';\n    if (formData.message.length < 10) return 'Message must be at least 10 chars';\n    return null;\n  };\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    setError(null);\n    setSuccess(false);\n    const validationError = validateForm();\n    if (validationError) {\n      setError(validationError);\n      return;\n    }\n    setLoading(true);\n    try {\n      const response = await fetch('/api/contact', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify(formData),\n      });\n      if (!response.ok) {\n        throw new Error(`Server error: ${response.status}`);\n      }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Form Submission & Reset — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nsetSuccess(true);\n      // Reset form after successful submission\n      setFormData({ name: '', email: '', message: '' });\n      // Hide success message after 3 seconds\n      setTimeout(() => setSuccess(false), 3000);\n    } catch (err) {\n      setError(err.message || 'Failed to submit form');\n    } finally {\n      setLoading(false);\n    }\n  };\n  const handleReset = () => {\n    setFormData({ name: '', email: '', message: '' });\n    setError(null);\n    setSuccess(false);\n  };\n  return (\n    <form onSubmit={handleSubmit} onReset={handleReset}>\n      {error && <div className=\"alert error\">{error}</div>}\n      {success && <div className=\"alert success\">Message sent successfully!</div>}\n      <div className=\"form-group\">\n        <label htmlFor=\"name\">Name</label>\n        <input\n          id=\"name\"\n          name=\"name\"\n          value={formData.name}\n          onChange={handleChange}\n          disabled={loading}\n          required\n        />\n      </div>\n      <div className=\"form-group\">\n        <label htmlFor=\"email\">Email</label>\n        <input\n          id=\"email\"\n          name=\"email\"\n          type=\"email\"\n          value={formData.email}\n          onChange={handleChange}\n          disabled={loading}\n          required\n        />\n      </div>\n      <div className=\"form-group\">\n        <label htmlFor=\"message\">Message</label>\n        <textarea\n          id=\"message\"\n          name=\"message\"\n          value={formData.message}\n          onChange={handleChange}\n          disabled={loading}\n          rows={5}\n          required\n        />\n      </div>\n      <div className=\"form-actions\">\n        <button type=\"submit\" disabled={loading}>\n          {loading ? 'Sending...' : 'Send Message'}\n        </button>\n        <button type=\"reset\" disabled={loading}>\n          Clear\n        </button>\n      </div>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Always call e.preventDefault() in onSubmit to prevent page reload.",
                  "Validate before async submission to catch client-side errors early.",
                  "Track loading state separately from form data — use it to disable the submit button.",
                  "Display server errors prominently to the user.",
                  "Reset form after successful submission — clear state and hide success messages after delay.",
                  "Disable the submit button while loading to prevent duplicate submissions."
        ],
        mistake: "Not preventing default form submission — the page will reload and state will be lost. Always use e.preventDefault().",
        shorthand: {
          verbose: "const handleSubmit = async (e) => {\n  // Page will reload without this!\n  const response = await fetch('/api/submit', { method: 'POST', body: JSON.stringify(formData) });\n};\n\nreturn <form onSubmit={handleSubmit}>...</form>;",
          concise: "const handleSubmit = async (e) => {\n  e.preventDefault();\n  await fetch('/api/submit', { method: 'POST', body: JSON.stringify(formData) });\n};",
        },
      },
      {
        id: "checkbox-radio-select",
        fn: "Checkboxes, Radios & Selects",
        desc: "Controlled components for checkbox, radio button, and select input types.",
        category: "Form Inputs",
        subtitle: "Handling different input types",
        signature: "<input type=\"checkbox\" checked={bool} onChange={} />\n<select value={} onChange={}>",
        descLong: "Checkboxes use checked prop and toggle with e.target.checked. Radio buttons group by name and use value to identify selection. Select elements use value prop and onChange to track selection. Multiple select requires array state. All follow the controlled component pattern.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Checkboxes, Radios & Selects — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Checkboxes, Radios & Selects — common patterns you'll see in production.\n// APPROACH  - Combine Checkboxes, Radios & Selects with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction PreferencesForm() {\n  const [preferences, setPreferences] = useState({\n    newsletter: false,\n    notifications: false,\n    theme: 'light',\n    categories: [],\n  });\n  // Single checkbox toggle\n  const handleCheckboxChange = (e) => {\n    const { name, checked } = e.target;\n    setPreferences(prev => ({\n      ...prev,\n      [name]: checked,\n    }));\n  };\n  // Radio button selection\n  const handleRadioChange = (e) => {\n    const { name, value } = e.target;\n    setPreferences(prev => ({\n      ...prev,\n      [name]: value,\n    }));\n  };\n  // Multiple checkboxes array\n  const handleCategoryChange = (e) => {\n    const { value, checked } = e.target;\n    setPreferences(prev => ({\n      ...prev,\n      categories: checked\n        ? [...prev.categories, value]\n        : prev.categories.filter(cat => cat !== value),\n    }));\n  };\n  // Select element\n  const handleSelectChange = (e) => {\n    const { value } = e.target;\n    setPreferences(prev => ({\n      ...prev,\n      theme: value,\n    }));\n  };\n  // Multiple select\n  const handleMultiSelectChange = (e) => {\n    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);\n    setPreferences(prev => ({\n      ...prev,\n      categories: selectedOptions,\n    }));\n  };\n  return (\n    <form>\n      {/* Single checkbox */}\n      <div className=\"form-group\">\n        <label>\n          <input\n            type=\"checkbox\"\n            name=\"newsletter\"\n            checked={preferences.newsletter}\n            onChange={handleCheckboxChange}\n          />\n          Subscribe to newsletter\n        </label>\n      </div>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Checkboxes, Radios & Selects — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n{/* Another checkbox */}\n      <div className=\"form-group\">\n        <label>\n          <input\n            type=\"checkbox\"\n            name=\"notifications\"\n            checked={preferences.notifications}\n            onChange={handleCheckboxChange}\n          />\n          Enable notifications\n        </label>\n      </div>\n      {/* Radio buttons */}\n      <fieldset>\n        <legend>Theme</legend>\n        <label>\n          <input\n            type=\"radio\"\n            name=\"theme\"\n            value=\"light\"\n            checked={preferences.theme === 'light'}\n            onChange={handleRadioChange}\n          />\n          Light\n        </label>\n        <label>\n          <input\n            type=\"radio\"\n            name=\"theme\"\n            value=\"dark\"\n            checked={preferences.theme === 'dark'}\n            onChange={handleRadioChange}\n          />\n          Dark\n        </label>\n        <label>\n          <input\n            type=\"radio\"\n            name=\"theme\"\n            value=\"auto\"\n            checked={preferences.theme === 'auto'}\n            onChange={handleRadioChange}\n          />\n          Auto\n        </label>\n      </fieldset>\n      {/* Multiple checkboxes */}\n      <fieldset>\n        <legend>Categories</legend>\n        {['tech', 'business', 'health', 'sports'].map(cat => (\n          <label key={cat}>\n            <input\n              type=\"checkbox\"\n              value={cat}\n              checked={preferences.categories.includes(cat)}\n              onChange={handleCategoryChange}\n            />\n            {cat.charAt(0).toUpperCase() + cat.slice(1)}\n          </label>\n        ))}\n      </fieldset>\n      {/* Select dropdown */}\n      <div className=\"form-group\">\n        <label htmlFor=\"theme-select\">Preferred Theme</label>\n        <select\n          id=\"theme-select\"\n          value={preferences.theme}\n          onChange={handleSelectChange}\n        >\n          <option value=\"\">-- Choose theme --</option>\n          <option value=\"light\">Light</option>\n          <option value=\"dark\">Dark</option>\n          <option value=\"auto\">Auto</option>\n        </select>\n      </div>\n      {/* Multiple select */}\n      <div className=\"form-group\">\n        <label htmlFor=\"categories\">Interests (hold Ctrl to select multiple)</label>\n        <select\n          id=\"categories\"\n          multiple\n          value={preferences.categories}\n          onChange={handleMultiSelectChange}\n        >\n          <option value=\"tech\">Technology</option>\n          <option value=\"business\">Business</option>\n          <option value=\"health\">Health</option>\n          <option value=\"sports\">Sports</option>\n        </select>\n      </div>\n      <button type=\"submit\">Save Preferences</button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Checkboxes: use checked prop and e.target.checked (boolean).",
                  "Radio buttons: group with same name, use value to identify selection.",
                  "Selects: use value prop, onChange to track selection.",
                  "Multiple select: store selected values in an array, use Array.from(e.target.selectedOptions) to get all selected options.",
                  "Use <fieldset> and <legend> to group related inputs semantically."
        ],
        mistake: "Forgetting to toggle checkboxes in the correct array format — forgetting to add/remove values from the array when checking/unchecking.",
        shorthand: {
          verbose: "const [checked, setChecked] = useState([]);\n\nconst handleCheckboxChange = (value) => {\n  if (checked.includes(value)) {\n    setChecked(checked.filter(item => item !== value));\n  } else {\n    setChecked([...checked, value]);\n  }\n};",
          concise: "const [checked, setChecked] = useState([]);\nconst handleCheckboxChange = (value) => setChecked(checked.includes(value) ? checked.filter(v => v !== value) : [...checked, value]);",
        },
      },
    ],
  },

  // ── Section 2: Form Libraries & Advanced ─────────────────────────────────────────
  {
    id: "form-libraries",
    title: "Form Libraries & Advanced",
    entries: [
      {
        id: "react-hook-form",
        fn: "React Hook Form Basics",
        desc: "High-performance form library using uncontrolled components and refs for minimal re-renders.",
        category: "Form Libraries",
        subtitle: "Efficient forms with minimal re-renders",
        signature: "const { register, handleSubmit, watch, formState } = useForm()",
        descLong: "React Hook Form uses uncontrolled components with refs to minimize re-renders. Only the parts that change re-render, not the entire form. Perfect for large forms with many fields. Integrates with validation libraries like Zod and Yup. Supports async validation, dynamic fields, and arrays.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of React Hook Form Basics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useForm } from 'react-hook-form';\nimport { z } from 'zod';\nimport { zodResolver } from '@hookform/resolvers/zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of React Hook Form Basics — common patterns you'll see in production.\n// APPROACH  - Combine React Hook Form Basics with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Define schema with Zod\nconst schema = z.object({\n  email: z.string().email('Invalid email'),\n  password: z.string().min(8, 'Min 8 characters'),\n  rememberMe: z.boolean().default(false),\n});\ntype LoginFormData = z.infer<typeof schema>;\nfunction LoginForm() {\n  const {\n    register,\n    handleSubmit,\n    watch,\n    formState: { errors, isSubmitting },\n  } = useForm<LoginFormData>({\n    resolver: zodResolver(schema),\n    mode: 'onBlur', // validate on blur instead of change\n  });\n  const password = watch('password');\n  const onSubmit = async (data: LoginFormData) => {\n    try {\n      const response = await fetch('/api/login', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify(data),\n      });\n      // Handle response\n    } catch (error) {\n      console.error(error);\n    }\n  };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of React Hook Form Basics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <form onSubmit={handleSubmit(onSubmit)}>\n      <div className=\"form-group\">\n        <label htmlFor=\"email\">Email</label>\n        <input\n          id=\"email\"\n          {...register('email')}\n          placeholder=\"user@example.com\"\n          disabled={isSubmitting}\n        />\n        {errors.email && (\n          <p className=\"error\">{errors.email.message}</p>\n        )}\n      </div>\n      <div className=\"form-group\">\n        <label htmlFor=\"password\">Password</label>\n        <input\n          id=\"password\"\n          type=\"password\"\n          {...register('password')}\n          placeholder=\"Enter password\"\n          disabled={isSubmitting}\n        />\n        {errors.password && (\n          <p className=\"error\">{errors.password.message}</p>\n        )}\n      </div>\n      {password && (\n        <p className=\"password-length\">\n          Password strength: {password.length} characters\n        </p>\n      )}\n      <div className=\"form-group\">\n        <label>\n          <input {...register('rememberMe')} type=\"checkbox\" />\n          Remember me\n        </label>\n      </div>\n      <button type=\"submit\" disabled={isSubmitting}>\n        {isSubmitting ? 'Logging in...' : 'Login'}\n      </button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "register() connects an input to the form state — no value prop needed.",
                  "handleSubmit wraps your submit handler and only calls it if validation passes.",
                  "watch() lets you observe specific field values for dependent logic.",
                  "formState includes errors, isSubmitting, isDirty, and more.",
                  "Combine with Zod or Yup for schema-based validation.",
                  "Only re-renders the field that changes, not the entire form."
        ],
        mistake: "Using both register() and onChange props — register() already handles the field; adding onChange creates duplicate logic.",
        shorthand: {
          verbose: "const { register } = useForm();\n\n<input\n  {...register('email')}\n  onChange={(e) => {\n    handleChange(e);\n    register('email').onChange(e);\n  }}\n/>",
          concise: "const { register } = useForm();\n\n<input {...register('email')} />",
        },
      },
      {
        id: "form-validation",
        fn: "Form Validation Patterns",
        desc: "Client-side validation strategies, async validation, error display, and best practices.",
        category: "Form Validation",
        subtitle: "Validation with error handling",
        signature: "Validate on blur, submit, change with debouncing for async",
        descLong: "Validation can happen on blur (immediate but non-blocking), on change (real-time but can lag), or on submit (simplest but feedback is delayed). Async validation (checking email exists) should be debounced. Always validate on the server — client validation is UX only.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Form Validation Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useState, useCallback } from 'react';\nimport { debounce } from 'lodash-es';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Form Validation Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Form Validation Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction RegistrationForm() {\n  const [formData, setFormData] = useState({\n    email: '',\n    username: '',\n    password: '',\n  });\n  const [errors, setErrors] = useState({});\n  const [asyncErrors, setAsyncErrors] = useState({});\n  const [touched, setTouched] = useState({});\n  // Synchronous validation rules\n  const validateField = (name, value) => {\n    const newErrors = { ...errors };\n    switch (name) {\n      case 'email':\n        if (!value.includes('@')) {\n          newErrors.email = 'Invalid email format';\n        } else {\n          delete newErrors.email;\n        }\n        break;\n      case 'username':\n        if (value.length < 3) {\n          newErrors.username = 'Min 3 characters';\n        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {\n          newErrors.username = 'Only letters, numbers, underscores';\n        } else {\n          delete newErrors.username;\n        }\n        break;\n      case 'password':\n        if (value.length < 8) {\n          newErrors.password = 'Min 8 characters';\n        } else if (!/[A-Z]/.test(value)) {\n          newErrors.password = 'Must include uppercase letter';\n        } else {\n          delete newErrors.password;\n        }\n        break;\n      default:\n        break;\n    }\n    return newErrors;\n  };\n  // Debounced async validation\n  const checkEmailExists = useCallback(\n    debounce(async (email) => {\n      if (!email.includes('@')) return;\n      try {\n        const res = await fetch(`/api/check-email?email=${email}`);\n        const data = await res.json();\n        if (data.exists) {\n          setAsyncErrors(prev => ({\n            ...prev,\n            email: 'Email already registered',\n          }));\n        } else {\n          setAsyncErrors(prev => {\n            const newErrors = { ...prev };\n            delete newErrors.email;\n            return newErrors;\n          });\n        }\n      } catch (error) {\n        console.error('Validation error:', error);\n      }\n    }, 500),\n    []\n  );\n  const handleChange = (e) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({ ...prev, [name]: value }));\n    // Sync validation on change (optional, usually on blur)\n    const newErrors = validateField(name, value);\n    setErrors(newErrors);\n    // Async validation on change (email exists)\n    if (name === 'email') {\n      checkEmailExists(value);\n    }\n  };\n  const handleBlur = (e) => {\n    const { name } = e.target;\n    setTouched(prev => ({ ...prev, [name]: true }));\n    // Validate on blur\n    const newErrors = validateField(name, formData[name]);\n    setErrors(newErrors);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Form Validation Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Async validation on blur\n    if (name === 'email') {\n      checkEmailExists(formData[name]);\n    }\n  };\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    // Validate all fields\n    let allErrors = {};\n    Object.keys(formData).forEach(key => {\n      const fieldErrors = validateField(key, formData[key]);\n      allErrors = { ...allErrors, ...fieldErrors };\n    });\n    // Mark all as touched\n    setTouched({\n      email: true,\n      username: true,\n      password: true,\n    });\n    if (Object.keys(allErrors).length > 0 || Object.keys(asyncErrors).length > 0) {\n      setErrors(allErrors);\n      return;\n    }\n    // Form is valid, submit\n    try {\n      const res = await fetch('/api/register', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify(formData),\n      });\n      // Handle success\n    } catch (error) {\n      console.error(error);\n    }\n  };\n  const getFieldError = (fieldName) => {\n    return errors[fieldName] || asyncErrors[fieldName] || '';\n  };\n  const isFieldInvalid = (fieldName) => {\n    return touched[fieldName] && !!getFieldError(fieldName);\n  };\n  return (\n    <form onSubmit={handleSubmit}>\n      <div className=\"form-group\">\n        <label htmlFor=\"email\">Email</label>\n        <input\n          id=\"email\"\n          name=\"email\"\n          type=\"email\"\n          value={formData.email}\n          onChange={handleChange}\n          onBlur={handleBlur}\n          className={isFieldInvalid('email') ? 'error' : ''}\n        />\n        {isFieldInvalid('email') && (\n          <p className=\"error-message\">{getFieldError('email')}</p>\n        )}\n        {touched.email && !getFieldError('email') && (\n          <p className=\"success-message\">✓ Email is available</p>\n        )}\n      </div>\n      <div className=\"form-group\">\n        <label htmlFor=\"username\">Username</label>\n        <input\n          id=\"username\"\n          name=\"username\"\n          value={formData.username}\n          onChange={handleChange}\n          onBlur={handleBlur}\n          className={isFieldInvalid('username') ? 'error' : ''}\n        />\n        {isFieldInvalid('username') && (\n          <p className=\"error-message\">{getFieldError('username')}</p>\n        )}\n      </div>\n      <div className=\"form-group\">\n        <label htmlFor=\"password\">Password</label>\n        <input\n          id=\"password\"\n          name=\"password\"\n          type=\"password\"\n          value={formData.password}\n          onChange={handleChange}\n          onBlur={handleBlur}\n          className={isFieldInvalid('password') ? 'error' : ''}\n        />\n        {isFieldInvalid('password') && (\n          <p className=\"error-message\">{getFieldError('password')}</p>\n        )}\n      </div>\n      <button type=\"submit\">Register</button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Validate on blur for non-blocking feedback without lag.",
                  "Debounce async validations (email exists) to avoid excessive API calls.",
                  "Always validate on the server — client validation is just UX.",
                  "Show success messages when async validation passes.",
                  "Only show error messages for touched fields.",
                  "Disable submit button until all errors are cleared."
        ],
        mistake: "Running async validation on every onChange keystroke without debouncing — causes lag and excessive API calls.",
        shorthand: {
          verbose: "const handleChange = async (e) => {\n  setEmail(e.target.value);\n  const result = await validateEmail(e.target.value);\n  setError(result.error);\n};",
          concise: "const debouncedValidate = useCallback(debounce(validateEmail, 500), []);\nconst handleChange = (e) => { setEmail(e.target.value); debouncedValidate(e.target.value); };",
        },
      },
      {
        id: "file-uploads",
        fn: "File Upload Handling",
        desc: "File input handling, preview generation, and multipart form data submission.",
        category: "File Handling",
        subtitle: "Upload files with preview and validation",
        signature: "<input type=\"file\" onChange={handleFileChange} />",
        descLong: "File inputs are uncontrolled by default — use refs or onChange to access files. Use FormData to submit files to the server as multipart/form-data. Validate file size and type on the client. Generate previews for images using FileReader or URL.createObjectURL.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of File Upload Handling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useRef, useState } from 'react';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of File Upload Handling — common patterns you'll see in production.\n// APPROACH  - Combine File Upload Handling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction FileUploadForm() {\n  const [files, setFiles] = useState([]);\n  const [previews, setPreviews] = useState([]);\n  const [error, setError] = useState(null);\n  const [uploading, setUploading] = useState(false);\n  const fileInputRef = useRef(null);\n  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB\n  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];\n  const handleFileChange = (e) => {\n    const selectedFiles = Array.from(e.target.files || []);\n    setError(null);\n    // Validate files\n    const validFiles = [];\n    const newPreviews = [];\n    for (const file of selectedFiles) {\n      if (file.size > MAX_FILE_SIZE) {\n        setError(`${file.name} is too large (max 5MB)`);\n        continue;\n      }\n      if (!ALLOWED_TYPES.includes(file.type)) {\n        setError(`${file.name} is not a valid image format`);\n        continue;\n      }\n      validFiles.push(file);\n      // Generate preview for images\n      const reader = new FileReader();\n      reader.onload = (e) => {\n        newPreviews.push({\n          name: file.name,\n          src: e.target.result,\n          file,\n        });\n      };\n      reader.readAsDataURL(file);\n    }\n    setFiles(validFiles);\n    // Preview generation is async, so delay setState\n    setTimeout(() => setPreviews(newPreviews), 100);\n  };\n  const handleRemoveFile = (index) => {\n    setFiles(files.filter((_, i) => i !== index));\n    setPreviews(previews.filter((_, i) => i !== index));\n  };\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    if (files.length === 0) {\n      setError('Please select at least one file');\n      return;\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of File Upload Handling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nsetUploading(true);\n    setError(null);\n    try {\n      // Use FormData for multipart/form-data\n      const formData = new FormData();\n      files.forEach((file) => {\n        formData.append('files', file); // multiple files in one field\n      });\n      formData.append('uploadedBy', 'user123');\n      const response = await fetch('/api/upload', {\n        method: 'POST',\n        body: formData,\n        // Don't set Content-Type — browser sets it automatically\n      });\n      if (!response.ok) {\n        throw new Error(`Upload failed: ${response.status}`);\n      }\n      const result = await response.json();\n      console.log('Upload successful:', result);\n      // Reset form\n      setFiles([]);\n      setPreviews([]);\n      fileInputRef.current.value = '';\n    } catch (err) {\n      setError(err.message);\n    } finally {\n      setUploading(false);\n    }\n  };\n  return (\n    <form onSubmit={handleSubmit}>\n      {error && <div className=\"alert error\">{error}</div>}\n      <div className=\"form-group\">\n        <label htmlFor=\"files\">Upload Images</label>\n        <input\n          ref={fileInputRef}\n          id=\"files\"\n          type=\"file\"\n          multiple\n          accept=\"image/*\"\n          onChange={handleFileChange}\n          disabled={uploading}\n        />\n        <p className=\"hint\">Max 5MB per file, JPG/PNG/GIF only</p>\n      </div>\n      {previews.length > 0 && (\n        <div className=\"preview-list\">\n          <h3>Preview ({previews.length} files)</h3>\n          <div className=\"preview-grid\">\n            {previews.map((preview, index) => (\n              <div key={index} className=\"preview-item\">\n                <img src={preview.src} alt={preview.name} />\n                <p>{preview.name}</p>\n                <button\n                  type=\"button\"\n                  onClick={() => handleRemoveFile(index)}\n                  disabled={uploading}\n                >\n                  Remove\n                </button>\n              </div>\n            ))}\n          </div>\n        </div>\n      )}\n      <button\n        type=\"submit\"\n        disabled={uploading || files.length === 0}\n      >\n        {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}\n      </button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "File inputs are uncontrolled — use refs or onChange to access the FileList.",
                  "Validate file size and type on the client (but also on server).",
                  "Use FormData to submit files as multipart/form-data.",
                  "Use FileReader.readAsDataURL() to generate image previews.",
                  "Never trust file type from the name — check MIME type from e.target.files.",
                  "Disable the submit button while uploading to prevent duplicate submissions."
        ],
        mistake: "Trying to control file input with value prop — file inputs must be uncontrolled. You can only read files from onChange or with a ref.",
        shorthand: {
          verbose: "const [file, setFile] = useState(null);\n\n// WRONG — file input value cannot be set\nreturn <input type=\"file\" value={file} onChange={e => setFile(e.target.files[0])} />;",
          concise: "const fileInputRef = useRef(null);\n\nreturn (\n  <input ref={fileInputRef} type=\"file\" onChange={e => { const file = e.target.files[0]; }} />\n);",
        },
      },
      {
        id: "rhf-basics",
        fn: "React Hook Form Basics",
        desc: "useForm, register, handleSubmit, formState — high-performance form library.",
        category: "Form Libraries",
        subtitle: "Efficient forms with minimal re-renders",
        signature: "const { register, handleSubmit, formState } = useForm()",
        descLong: "React Hook Form uses uncontrolled components and refs for minimal re-renders. Only changed fields re-render, not the entire form. Perfect for large forms. Integrates with Zod/Yup for validation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of React Hook Form Basics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useForm } from 'react-hook-form';\nimport { z } from 'zod';\nimport { zodResolver } from '@hookform/resolvers/zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of React Hook Form Basics — common patterns you'll see in production.\n// APPROACH  - Combine React Hook Form Basics with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst schema = z.object({\n  email: z.string().email('Invalid email'),\n  password: z.string().min(8, 'Min 8 characters'),\n});\nfunction LoginForm() {\n  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({\n    resolver: zodResolver(schema),\n    mode: 'onBlur',\n  });\n  const onSubmit = async (data) => {\n    await fetch('/api/login', { method: 'POST', body: JSON.stringify(data) });\n  };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of React Hook Form Basics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <form onSubmit={handleSubmit(onSubmit)}>\n      <input {...register('email')} placeholder=\"Email\" />\n      {errors.email && <p>{errors.email.message}</p>}\n      <input {...register('password')} type=\"password\" placeholder=\"Password\" />\n      {errors.password && <p>{errors.password.message}</p>}\n      <button type=\"submit\" disabled={isSubmitting}>\n        {isSubmitting ? 'Logging in...' : 'Login'}\n      </button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "register() connects input to form state.",
                  "handleSubmit wraps handler, validates before calling.",
                  "Only re-renders changed fields.",
                  "Combine with Zod for schema validation."
        ],
        mistake: "Using register() and onChange together — register handles it.",
        shorthand: {
          verbose: "// Manual / verbose approach\n<input {...register('email')} onChange={(e) => { /* ... */ }} />\n// More explicit but longer",
          concise: "<input {...register('email')} />",
        },
      },
      {
        id: "rhf-validation",
        fn: "RHF Validation with Zod",
        desc: "Validation rules, async validation, Zod/Yup integration.",
        category: "Form Validation",
        subtitle: "Schema-based validation",
        signature: "resolver: zodResolver(schema)",
        descLong: "Define validation with Zod or Yup. Integrate via resolver. Supports sync and async validation. Type-safe with TypeScript.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RHF Validation with Zod — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { z } from 'zod';\nimport { zodResolver } from '@hookform/resolvers/zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RHF Validation with Zod — common patterns you'll see in production.\n// APPROACH  - Combine RHF Validation with Zod with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst schema = z.object({\n  email: z.string().email('Invalid email').refine(\n    async (val) => !(await checkEmailExists(val)),\n    { message: 'Email already registered' }\n  ),\n  password: z.string().min(8).regex(/[A-Z]/, 'Must have uppercase'),\n  confirmPassword: z.string(),\n}).refine(d => d.password === d.confirmPassword, {\n  message: 'Passwords must match',\n  path: ['confirmPassword'],\n});\ntype FormData = z.infer<typeof schema>;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RHF Validation with Zod — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction Form() {\n  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({\n    resolver: zodResolver(schema),\n  });\n  return (\n    <form onSubmit={handleSubmit(onSubmit)}>\n      <input {...register('email')} />\n      {errors.email && <p>{errors.email.message}</p>}\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Zod provides type inference.",
                  "refine() for custom validation.",
                  "async validation for server checks.",
                  "Always validate on server too."
        ],
        mistake: "No server-side validation — client validation is UX only.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst [errors, setErrors] = useState({}); // manual validation\n// More explicit but longer",
          concise: "resolver: zodResolver(schema) // automatic validation",
        },
      },
      {
        id: "rhf-controller",
        fn: "RHF Controller Component",
        desc: "Wrap controlled inputs (Select, DatePicker, custom) with Controller.",
        category: "Form Libraries",
        subtitle: "Handling controlled components",
        signature: "<Controller render={({ field }) => <CustomInput {...field} />} />",
        descLong: "Some components are controlled (Select, DatePicker). Wrap them with Controller to integrate with React Hook Form.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RHF Controller Component — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { Controller } from 'react-hook-form';\nimport { DatePicker } from 'react-datepicker';\nimport Select from 'react-select';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RHF Controller Component — common patterns you'll see in production.\n// APPROACH  - Combine RHF Controller Component with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction Form() {\n  const { control, handleSubmit } = useForm();\n  return (\n    <form onSubmit={handleSubmit(onSubmit)}>\n      {/* Select component */}\n      <Controller\n        control={control}\n        name=\"country\"\n        render={({ field }) => (\n          <Select {...field} options={countryOptions} />\n        )}\n      />"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RHF Controller Component — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n{/* DatePicker */}\n      <Controller\n        control={control}\n        name=\"birthDate\"\n        render={({ field }) => (\n          <DatePicker {...field} dateFormat=\"yyyy-MM-dd\" />\n        )}\n      />\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Use Controller for controlled components.",
                  "render prop receives field props.",
                  "Works with any controlled component."
        ],
        mistake: "Using register() for controlled components.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Doesn't work\n<input {...register('date')} />\n// More explicit but longer",
          concise: "// Works with Controller\n<Controller name=\"date\" render={({ field }) => <DatePicker {...field} />} />",
        },
      },
      {
        id: "rhf-arrays",
        fn: "RHF Dynamic Fields (useFieldArray)",
        desc: "useFieldArray for dynamic fields — append, remove, swap operations.",
        category: "Form Libraries",
        subtitle: "Dynamic form fields",
        signature: "const { fields, append, remove } = useFieldArray()",
        descLong: "Add/remove form fields dynamically with useFieldArray. Manages array of fields in form state.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RHF Dynamic Fields (useFieldArray) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { useFieldArray } from 'react-hook-form';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RHF Dynamic Fields (useFieldArray) — common patterns you'll see in production.\n// APPROACH  - Combine RHF Dynamic Fields (useFieldArray) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction DynamicForm() {\n  const { control, handleSubmit, register } = useForm({\n    defaultValues: { items: [{ name: '' }, { name: '' }] },\n  });\n  const { fields, append, remove, move } = useFieldArray({\n    control,\n    name: 'items',\n  });\n  return (\n    <form onSubmit={handleSubmit(onSubmit)}>\n      {fields.map((field, index) => (\n        <div key={field.id}>\n          <input {...register(`items.${index}.name`)} />\n          <button type=\"button\" onClick={() => remove(index)}>\n            Remove\n          </button>\n        </div>\n      ))}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RHF Dynamic Fields (useFieldArray) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n<button type=\"button\" onClick={() => append({ name: '' })}>\n        Add Item\n      </button>\n      <button type=\"submit\">Submit</button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Use field.id as key, not array index.",
                  "append() adds new field.",
                  "remove() removes field at index.",
                  "move() reorders fields."
        ],
        mistake: "Using array index as key in map.",
        shorthand: {
          verbose: "// Manual / verbose approach\n{fields.map((field, index) => <div key={index}>...</div>)}\n// More explicit but longer",
          concise: "{fields.map((field) => <div key={field.id}>...</div>)}",
        },
      },
      {
        id: "rhf-watch",
        fn: "RHF watch, getValues, setValue",
        desc: "Reactive form state — watch fields, get values, set values programmatically.",
        category: "Form Libraries",
        subtitle: "Reactive form state management",
        signature: "const password = watch(\"password\")  |  const values = getValues()",
        descLong: "watch() subscribes to field changes. getValues() reads all values. setValue() updates programmatically. trigger() validates specific fields.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RHF watch, getValues, setValue — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nfunction Form() {\n  const { register, watch, getValues, setValue, trigger } = useForm();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RHF watch, getValues, setValue — common patterns you'll see in production.\n// APPROACH  - Combine RHF watch, getValues, setValue with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst password = watch('password');\n  const email = watch('email');\n  const handleFillDefaults = () => {\n    setValue('email', 'default@example.com');\n    setValue('password', 'defaultPassword123');\n  };\n  const validateEmail = async () => {\n    await trigger('email'); // validate only email\n  };\n  const getFormData = () => {\n    const allValues = getValues();\n    console.log('Form data:', allValues);\n  };\n  return (\n    <form>\n      <input {...register('email')} />\n      <input {...register('password')} type=\"password\" />"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RHF watch, getValues, setValue — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n{password && <p>Password strength: {password.length} chars</p>}\n      <button type=\"button\" onClick={handleFillDefaults}>\n        Fill Defaults\n      </button>\n      <button type=\"button\" onClick={validateEmail}>\n        Validate Email\n      </button>\n      <button type=\"button\" onClick={getFormData}>\n        Get Values\n      </button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "watch() causes re-render on field change.",
                  "getValues() for reading without re-render.",
                  "setValue() updates field programmatically.",
                  "trigger() validates specific fields."
        ],
        mistake: "Watching all fields when you only need one.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst password = watch()['password']\n// More explicit but longer",
          concise: "const password = watch('password')",
        },
      },
      {
        id: "form-context",
        fn: "useFormContext",
        desc: "Share form state in nested components without prop drilling.",
        category: "Form State",
        subtitle: "Form state in nested components",
        signature: "const form = useFormContext()  |  <FormProvider {...form}>",
        descLong: "Wrap form with FormProvider to share form methods in nested components. Access with useFormContext().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of useFormContext — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { FormProvider, useFormContext } from 'react-hook-form';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of useFormContext — common patterns you'll see in production.\n// APPROACH  - Combine useFormContext with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction EmailField() {\n  const { register, formState: { errors } } = useFormContext();\n  return (\n    <div>\n      <input {...register('email')} />\n      {errors.email && <p>{errors.email.message}</p>}\n    </div>\n  );\n}\nfunction PasswordField() {\n  const { register, formState: { errors } } = useFormContext();\n  return (\n    <div>\n      <input {...register('password')} type=\"password\" />\n      {errors.password && <p>{errors.password.message}</p>}\n    </div>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of useFormContext — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction LoginForm() {\n  const form = useForm();\n  return (\n    <FormProvider {...form}>\n      <form onSubmit={form.handleSubmit(onSubmit)}>\n        <EmailField />\n        <PasswordField />\n        <button type=\"submit\">Login</button>\n      </form>\n    </FormProvider>\n  );\n}"
                  }
        ],
        tips: [
                  "Wrap with FormProvider at top level.",
                  "useFormContext() in nested components.",
                  "No prop drilling needed."
        ],
        mistake: "Not wrapping with FormProvider.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Pass form as prop down the tree\n// More explicit but longer",
          concise: "// FormProvider makes it available everywhere",
        },
      },
      {
        id: "multi-step-form",
        fn: "Multi-Step Form Pattern",
        desc: "Step state, validation per step, progress tracking.",
        category: "Form Patterns",
        subtitle: "Multi-page forms",
        signature: "currentStep, handleNextStep, handlePrevStep",
        descLong: "Multi-step forms track current step, validate before moving to next, show progress. Usually keep form state across steps.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Multi-Step Form Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nfunction MultiStepForm() {\n  const [currentStep, setCurrentStep] = useState(0);\n  const { register, handleSubmit, trigger } = useForm();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Multi-Step Form Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Multi-Step Form Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst steps = [\n    { title: 'Personal Info', fields: ['name', 'email'] },\n    { title: 'Address', fields: ['street', 'city'] },\n    { title: 'Review', fields: [] },\n  ];\n  const handleNextStep = async () => {\n    const isValid = await trigger(steps[currentStep].fields);\n    if (isValid) setCurrentStep(prev => prev + 1);\n  };\n  const handlePrevStep = () => {\n    setCurrentStep(prev => prev - 1);\n  };\n  const handleFinalSubmit = handleSubmit(async (data) => {\n    await fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });\n  });\n  return (\n    <div>\n      <div className=\"progress\">\n        Step {currentStep + 1} of {steps.length}\n      </div>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Multi-Step Form Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n<form>\n        {currentStep === 0 && (\n          <>\n            <input {...register('name')} placeholder=\"Name\" />\n            <input {...register('email')} placeholder=\"Email\" />\n          </>\n        )}\n        {currentStep === 1 && (\n          <>\n            <input {...register('street')} placeholder=\"Street\" />\n            <input {...register('city')} placeholder=\"City\" />\n          </>\n        )}\n        {currentStep === 2 && <p>Review information and submit</p>}\n        <div className=\"buttons\">\n          {currentStep > 0 && (\n            <button type=\"button\" onClick={handlePrevStep}>\n              Previous\n            </button>\n          )}\n          {currentStep < steps.length - 1 ? (\n            <button type=\"button\" onClick={handleNextStep}>\n              Next\n            </button>\n          ) : (\n            <button type=\"submit\" onClick={handleFinalSubmit}>\n              Submit\n            </button>\n          )}\n        </div>\n      </form>\n    </div>\n  );\n}"
                  }
        ],
        tips: [
                  "Validate current step before moving to next.",
                  "Keep form state across steps.",
                  "Show progress indicator.",
                  "Allow going back to previous steps."
        ],
        mistake: "Losing form state between steps.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Reset form on each step\n// More explicit but longer",
          concise: "// Keep form state; validate on transition",
        },
      },
      {
        id: "form-reset",
        fn: "Form Reset Patterns",
        desc: "reset(), default values from server, dirty tracking.",
        category: "Form State",
        subtitle: "Resetting and managing form state",
        signature: "reset(defaultValues)  |  isDirty, dirtyFields",
        descLong: "reset() resets to default values. Track dirty state with isDirty/dirtyFields. Load default values from server.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Form Reset Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nfunction EditUserForm({ userId }) {\n  const [defaultValues, setDefaultValues] = useState(null);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Form Reset Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Form Reset Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Load default values from server\n  useEffect(() => {\n    fetch(`/api/users/${userId}`)\n      .then(r => r.json())\n      .then(data => setDefaultValues(data));\n  }, [userId]);\n  const { register, handleSubmit, reset, formState: { isDirty, dirtyFields } } = useForm({\n    defaultValues,\n  });\n  useEffect(() => {\n    if (defaultValues) {\n      reset(defaultValues);\n    }\n  }, [defaultValues, reset]);\n  const handleReset = () => {\n    reset(); // reset to default values\n  };\n  const handleSaveChanges = handleSubmit(async (data) => {\n    await fetch(`/api/users/${userId}`, {\n      method: 'PUT',\n      body: JSON.stringify(data),\n    });\n    reset(data); // reset to new defaults\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Form Reset Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn (\n    <form>\n      <input {...register('name')} placeholder=\"Name\" />\n      <input {...register('email')} placeholder=\"Email\" />\n      <p>Changed fields: {Object.keys(dirtyFields).join(', ')}</p>\n      <button type=\"submit\" onClick={handleSaveChanges}>\n        Save Changes\n      </button>\n      <button type=\"button\" onClick={handleReset} disabled={!isDirty}>\n        Reset\n      </button>\n    </form>\n  );\n}"
                  }
        ],
        tips: [
                  "Load default values from server on mount.",
                  "Use isDirty to disable reset button.",
                  "dirtyFields shows which fields changed.",
                  "reset() after successful submission."
        ],
        mistake: "Not loading default values from server.",
        shorthand: {
          verbose: "// Manual tracking\nconst [original, setOriginal] = useState(null);\nconst [current, setCurrent] = useState(null);",
          concise: "// Built-in tracking\nconst { formState: { isDirty, dirtyFields } } = useForm()",
        },
      },
    ],
  },
]

export default { meta, sections }
