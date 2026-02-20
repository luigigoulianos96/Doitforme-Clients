# AGENTS.md

# 1. Core Principle

- Readability is the primary constraint.
- Clarity over brevity.
- Explicit over compact.
- Prioritize readability over defensive runtime validation inside functions (e.g., avoid `typeof` checks unless explicitly required).
- Write a bit riskier code in return of readability. Don t use so many validations inside the functions, example: typeof, I don t care if I pass wrong typeby mistake.

---

# 2. Project Structure

## Pages
- Path: `src/pages/<pageName>/`
- One page = one folder
- Main file:
  - Pattern: `PAGE_NAME.jsx`
  - Uppercase
  - Multi-word: underscores `_`
  - One-word: single uppercase word

Examples:
- `src/pages/userSettings/USER_SETTINGS.jsx`
- `src/pages/login/LOGIN.jsx`

---

## Components

### Page-specific
- Used in one page only
- Path: `src/pages/<pageName>/components/`
- Filename: `Page_Name_Component.jsx`

### Shared
- Used in more than one page
- Path: `src/components/<componentGroup>/`
- Filename:
  - Multi-word: `Component_Name.jsx`
  - One-word: `Component_.jsx`

---

## Utilities

### Page-only
- Used in one page only
- Path: `src/pages/<pageName>/utils/`
- Filename:
  - Lowercase
  - Underscores `_`
  - **Must be multi-word**
- Pattern: `descriptive_name.jsx`

### Shared
- Used in more than one page
- Path: `src/utils/`
- Filename:
  - Lowercase
  - Underscores `_`
  - **Must be multi-word**
- Pattern: `descriptive_name.jsx`

One-word utilities: **not allowed**

---

# 3. Naming Conventions

- Multi-word names use `_`
- Case:
  - Pages: UPPERCASE
  - Components: PascalCase_with_underscores
  - Utilities: lowercase_with_underscores
- Props and variables: camelCase

One-word names:
- Pages: allowed (`LOGIN.jsx`)
- Shared components: allowed (`Modal_.jsx`)
- Utilities: **forbidden**

---

# 4. Scope & Relocation (Mandatory)

- Page-only code stays inside its page folder.
- The moment code is used in a second page, it becomes shared and must be moved.

Placement:
- Page-only:
  - Components → `src/pages/<pageName>/components/`
  - Utilities → `src/pages/<pageName>/utils/`
- Shared:
  - Components → `src/components/<componentGroup>/`
  - Utilities → `src/utils/<utilGroup>/`

Rules:
- No alternative structures
- No shared code inside page folders
- No duplication instead of relocation
- Imports must be updated after moves

---

# 5. JavaScript Rules

## General
- Function names: `snake_case` (lowercase)
- Exports: named only
  - `export const function_name = (...) => { ... }`
- Default exports: not allowed
- One quote style per project
- Explicit braces only
- No compact or implicit logic
- Do not use `useMemo`
- Functions must not contain conditional logic (no `if / else`, `switch`, or `?:`)
- Don t use "useMemo"
- Returns must be explicit and intentional
- Side effects must be intentional and obvious
- Every function must start with a 2-line max comment describing what it does
- Every function must include backend-integration comments that clearly state:
  - What values to replace
  - Where to place requests, and the required order for backend calls

## Component Exports
- Export name must match filename exactly
- For one-word shared components:
  - `Component_.jsx`
  - `export const Component_ = (...) => { ... }`
- Each `Component_.jsx` must contain a parent styled-component named `Component`

---

# 6. Readability Rules

Forbidden:
- Nested ternaries
- Chained `?:`
- Deep inline boolean chains inside assignments

Required:
- Declare variable with default
- No conditional logic inside functions (no `if / else`, `switch`, or `?:`)
- Keep function bodies linear and explicit
- Function description comments are required (max 2 lines)
- For frontend code that will be wired to the backend later, add comments that show where requests belong and what data they use
- Always add 1-2 lines of function description over each function
- Always, when writting front end that will be wired with backend in the future, add comments showing the backend developers where to perform the requests and on what

## Component Rendering

Forbidden:
- Assigning JSX to variables via `if / else` before a component `return`
  - Example pattern: `let content; if (...) { content = (...) }`

Required:
- Each component must have a single `return`.
- No conditional rendering inside components (no `if / else`, `switch`, or `?:` in JSX).
- If multiple render paths are needed, use lookup tables or separate components selected via maps defined outside the component function.

## Props Usage

Forbidden:
- Assigning props to local variables with fallback defaults
  - Example pattern: `const facebook = props?.fb || {}`

Required:
- Use props inline in JSX without fallback defaults or `||`
  - Example: `<h5>{props?.fb}</h5>`

---

# 7. Styling

## General
- **styled-components only**
- No inline styles
- No CSS files / modules
- No Tailwind / Emotion
- `monica-alexandria` is available and preferred

## Typography (Strict)
- Every text node must use exactly one:
  `h1 > h2 > h3 > h4 > h5 > p > h6`
- Follow hierarchy
- Never modify:
  - font-size
  - line-height
  - font-weight
- Only non-typography styles allowed

---

# 8. styled-components Rules

## Naming
- PascalCase only
- No underscores
- Example: `HomeWrap`, not `Home_Wrap`

## Units
- `rem` only
- No `px`
- `1rem = 10px`
- Other non-px units allowed (e.g., `vh`)

## Design Tokens
- Prefer existing CSS variables for spacing, radius, colors, shadows
- Do not hardcode values if a variable exists

Spacing:
- Prefer `--smallPads`, `--normalPads`, `--largePads`
- Otherwise use `rem`

Radius:
- Prefer `--smallRadius`, `--normalRadius`

Shadows:
- Prefer predefined shadow variables
- No custom shadow strings

---

# 9. Theme-Based Colors & Shadows

## Mandatory
- All non-brand colors and shadows must use `p.theme`

Examples:
- `color: ${p => p.theme.color}`
- `background: ${p => p.theme.background}`
- `box-shadow: ${p => p.theme.out}`

## Allowed Tokens

Colors:
- `flare`, `background`, `color`, `low`, `mid`, `high`, `overlay`

Shadows:
- `in`, `inFocus`, `out`, `outFocus`

## Prohibited
- Raw CSS variables
- Hex / rgb / rgba / hsl
- Custom shadow values
- `filter: drop-shadow(...)`

## Brand / Semantic Exception
Allowed only when intentional:
- `main*`, `focus*`, `error*`, `warning*`, `success*`
- Platform colors when representing that platform
