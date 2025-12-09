# CLAUDE.md

## 🧠 Project Summary

**AutoKitteh Web Platform** is a monorepo frontend for building and managing automation pipelines. It features:
- A modern React-based interface
- Deep integration with gRPC-based services
- Robust session tracking, testing tools, and localization
- Rich developer UX with Tailwind, Zustand, and custom hooks

This document guides Claude (or any AI assistant) on how to effectively explore, understand, and assist with the codebase.

---


## Tech Stack

**Languages:** TypeScript, JavaScript, HTML, CSS
**Framework:** React 18+ with Vite
**Styling:** Tailwind CSS
**UI Components:** Custom components with FontAwesome and Tabler icons
**Testing:** Playwright (E2E), Storybook (component development)
**Build Tools:** Vite, npm
**Development Tools:** Tailwind Config Viewer, ESLint, Prettier
**Authentication:** Descope (optional)
**Backend Communication:** RESTful APIs to AutoKitteh backend

## 🧭 Project Structure

```
src/
├── app.tsx                  # Root app entry
├── main.tsx                 # Vite bootstrap
├── components/              # Reusable UI components
├── hooks/                   # Custom React hooks
├── store/                   # Zustand stores
├── api/                     # gRPC/HTTP clients
├── services/                # Domain-level business logic
├── interfaces/              # Data interfaces
├── types/                   # Strongly-typed helpers
├── constants/               # Constants used across the app
├── models/                  # Local model definitions
├── validations/             # Form & schema validators
├── contexts/                # React context providers
├── i18n/, locales/          # Internationalization
```

---

## 🧩 Key Concepts and Modules

| Area | Purpose |
|------|---------|
| `components/` | UI atoms/molecules/organisms |
| `hooks/` | Custom logic such as `useResize`, `useEventListener`, `useHubspot` |
| `store/` | Zustand state for user sessions, orgs, configs |
| `api/` | gRPC clients or fetch wrappers (for services) |
| `services/` | Encapsulated backend-facing logic |
| `models/` | Pure model shapes and formatters |
| `validations/` | Schema definitions used in forms and API guards |
| `contexts/` | Logical context providers like `eventsDrawer` |
| `utilities/` | Helpers like `cn`, formatters, DOM functions |
| `i18n/` + `locales/` | Full locale coverage, including nested translations |

---

## 🧪 Test Strategy

- End-to-end tests: Playwright (`/e2e`, `playwright.config.ts`)
- Snapshots: Storybook stories (`/stories`)
- Visual regression: Playwright reports (`/playwright-report`)
- Linting: ESLint, Prettier, local plugin rules
- CI: GitHub Actions (`.github/workflows`)
- Codegen/transform: `scripts/`, `fixReactVirtualized.ts`

---

## 🔧 MCP Server Usage Policy

Claude Code may have access to specialized MCP (Model Context Protocol) servers. **Only use MCPs that are available in the current Claude Code instance.** Check tool availability before attempting to use them.

When available, use these MCPs proactively for this project:

### Recommended MCPs for This Project

| MCP Server | When to Use | Project Relevance |
|------------|-------------|-------------------|
| **task-master-ai** | Complex feature planning, PRD parsing, task breakdown | Use instead of TodoWrite for multi-step features |
| **sequential-thinking** | Complex debugging, architectural decisions, multi-step reasoning | React state bugs, Zustand flow issues, component design |
| **context7** | Library documentation lookup | React 18, Zustand, Tailwind CSS, Playwright, Zod, Vite, react-i18next |
| **playwright** | E2E test generation, browser automation, screenshots | Directly integrates with project's Playwright setup |
| **octocode** | GitHub code research, implementation examples | Find patterns for React hooks, Zustand stores, Tailwind components |
| **brave-search** | Error messages, best practices, current solutions | TypeScript errors, React patterns, package issues |
| **filesystem-server** | Read files from other directories | Access parent monorepo files, cross-project references |
| **memory** | Persist architectural decisions, project context | Store integration patterns, component decisions |

### MCP Usage Examples for This Project

```
# Planning a new connection integration
→ task-master-ai: Break down into subtasks (forms, validation, translations, E2E tests)

# Debugging Zustand state not updating
→ sequential-thinking: Trace state flow step-by-step
→ context7: Get Zustand docs for persist/immer middleware

# Creating E2E tests for a new feature  
→ playwright: Generate test structure, take screenshots
→ context7: Get Playwright best practices

# Implementing a new React hook
→ octocode: Find similar implementations in popular repos
→ context7: Get React 18 hooks documentation

# Fixing TypeScript errors
→ brave-search: Search specific error message
→ context7: Get TypeScript/Zod documentation

# Understanding parent monorepo structure
→ filesystem-server: Read cross-project and cross-root-directories files
```

### Library Documentation Quick Reference (context7)

Use `context7` with these library IDs for instant documentation:

- React: `/facebook/react`
- Zustand: `/pmndrs/zustand`  
- Tailwind CSS: `/tailwindlabs/tailwindcss`
- Playwright: `/microsoft/playwright`
- Zod: `/colinhacks/zod`
- Vite: `/vitejs/vite`
- React Hook Form: `/react-hook-form/react-hook-form`

---

## 🚀 Claude Instructions

### 🤖 Claude System Prompt

```
You are a senior code reviewer and Claude assistant working on a large React + TypeScript monorepo. Use structured reasoning. Think step-by-step. Assume user expertise. Suggest improvements only when you fully understand the context. If unsure — ask.
```

---

### 🔍 Effective Claude Prompts

| Prompt Type | Example |
|-------------|---------|
| Code walkthrough | "Explain the flow of a session from `startSession` to `onSessionRemoved`" |
| Refactor request | "Suggest a more modular way to handle toast and log logic" |
| PR review | "Review this PR with ~3,400 changed lines methodically: [link]" |
| Test generator | "Generate Playwright tests for deleting a session via `SessionsTableRow`" |
| Data model mapping | "List how `Session` interfaces map to backend gRPC messages" |

---

## 🧠 Memory & File Management

To help Claude:
- Prefer targeted context: Paste relevant files or snippets
- Chunk long files and summarize their purpose
- Use hierarchical prompts (e.g., high-level -> deep-dive)

**Avoid** sending the entire repo at once. Claude performs best with focused context (≤ 20k tokens).

---

## 🗂 Claude-Aware File Index

| Path | Role |
|------|------|
| `src/components/atoms/*` | UI primitives |
| `src/components/organisms/` | Complex UI like `DeploymentsTable`, `SessionStats`, etc |
| `src/hooks/useHubspot.ts` | Integrates with marketing CRM |
| `src/store/` | Central app state (Zustand) |
| `src/api/grpc/clients.grpc.api.ts` | gRPC client binding |
| `vite.config.ts` | Build system config |
| `tailwind.config.cjs` | UI theme and tokens |
| `scripts/` | Build + fix utilities |
| `.claude/` | Claude configuration or cache (if exists) |
| `playwright.config.ts` | Test runner config |

---

## 📦 Package Highlights

- React 18+
- Vite
- TypeScript strict mode
- Tailwind CSS
- Zustand (with persist & immer)
- Storybook
- Playwright
- gRPC client bindings

---

## Common Commands Reference

### Development Setup
```bash
# Full setup from scratch
git clone https://github.com/autokitteh/web-platform && cd autokitteh
git submodule update --init
npm install
cp .env.example .env
npm run dev

# Docker development
docker compose -f development.compose.yml up
```

3. **Configure environment variables in `.env`:**
   - `VITE_HOST_URL`: Backend API URL (default available)
   - `VITE_DESCOPE_PROJECT_ID`: Authentication project ID (optional)
   - `TESTS_JWT_AUTH_TOKEN`: E2E test authentication token

### Testing & Quality
```bash
# Run all quality checks
npm run build && npm run test:e2e
npm run storybook  # Verify component library

# Check environment
npm run tailwind-config-viewer  # Verify Tailwind setup
```

### Development Commands
- `npm run dev`: Start development server with hot reloading
- `npm run build`: Create production build
- `npm run preview`: Preview production build locally
- `npm run test:e2e`: Run Playwright E2E tests
- `npm run test:e2e:ui`: Launch Playwright test UI
- `npm run test:e2e:report`: Generate test reports
- `npm run storybook`: Launch Storybook for component development
- `npm run tailwind-config-viewer`: View Tailwind configuration

## DevOps

### Docker Support
- Use provided `development.compose.yml` for local development
- Ensure consistent environment across development and production
- Include proper health checks
- Use multi-stage builds for optimization


---


## Code Style & Conventions

### TypeScript Standards
- Use explicit typing for all variables, functions, and components
- Prefer interfaces over types for object definitions
- Use `undefined` instead of `null` for optional values
- Always provide return types for functions
- Use proper generic typing for components and hooks

### React Patterns
- Use functional components with hooks exclusively
- Implement proper prop typing with TypeScript interfaces
- Use descriptive component and prop names
- Follow React 18+ best practices for state management
- Implement proper error boundaries where needed

### Import Standards
- Group imports: React imports first, then third-party libraries, then local imports
- Use absolute imports for common utilities and components
- Use named imports where possible
- Sort imports alphabetically within groups

### Naming Conventions
- Components: PascalCase (`ProjectManager.tsx`)
- Files: kebab-case for utilities, PascalCase for components
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE
- CSS classes: Tailwind utility classes, follow Tailwind conventions

### File Organization
- One component per file
- Co-locate related files (component + styles + tests)
- Use index files for clean imports
- Separate business logic into custom hooks
- Keep utility functions in dedicated utility files

### Branch Strategy
- `main`: Production-ready code
- `ronen/feat/*`: Integration branch for features
- `ronen/refactor/*`: Individual refactor branches
- `ronen/fix/*`: Critical production fixes

### Commit Guidelines
- Use conventional commit format: `type(scope): description`
- Types: feat, fix, docs, refactor, test, chore
- Keep messages concise and descriptive
- Reference issues when applicable

### Code Generation Priorities
- **Type safety** - Always provide proper TypeScript types
- **Performance** - Consider bundle size and runtime performance
- **Accessibility** - Follow WCAG guidelines for UI components
- **Maintainability** - Write clear, self-documenting code
- **No comments** - NEVER add comments to generated code unless explicitly requested



## API Integration

### Backend Communication
- All API calls go through centralized service layer in `src/api/`
- Use proper error handling and loading states
- Implement retry logic for critical operations
- Follow RESTful conventions
- Handle authentication tokens properly

### Error Handling
- Implement user-friendly error messages
- Log errors appropriately for debugging
- Provide fallback UI states
- Handle network failures gracefully

## Testing Strategy

### E2E Testing with Playwright
- Test critical user workflows end-to-end
- Include authentication flows when enabled
- Test across different browsers and devices
- Use page object model for maintainable tests
- Run tests in CI/CD pipeline

### Component Testing with Storybook
- Document all UI components in Storybook
- Show different component states and variants
- Include interactive controls for props
- Document usage examples and best practices

### Test Naming Conventions
- Describe behavior, not implementation
- Use "should" statements for clarity
- Group related tests logically
- Include edge cases and error scenarios

## Styling Guidelines

### Tailwind CSS Usage
- Use utility-first approach
- Prefer Tailwind classes over custom CSS
- Use responsive prefixes appropriately
- Extract repeated patterns into components
- Follow Tailwind's spacing and color system

### Component Styling
- Use consistent spacing and sizing patterns
- Implement proper hover and focus states
- Ensure accessibility with proper contrast
- Follow AutoKitteh design system guidelines
- Use semantic color names and CSS variables

### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Test on multiple screen sizes
- Ensure touch-friendly interfaces
- Consider performance on mobile devices

## Performance Guidelines

### React Performance
- Use React.memo for expensive components
- Implement proper dependency arrays in hooks
- Avoid unnecessary re-renders
- Use lazy loading for route components
- Optimize bundle size with code splitting

### Asset Optimization
- Optimize images and icons
- Use appropriate image formats
- Implement lazy loading for non-critical assets
- Minimize bundle size
- Use CDN for static assets when possible

## Security Considerations

### Authentication & Authorization
- Handle JWT tokens securely
- Implement proper session management
- Use HTTPS in production
- Validate user permissions on sensitive actions
- Handle authentication failures gracefully

### Data Handling
- Validate all user inputs
- Sanitize data before display
- Use proper CORS configuration
- Implement rate limiting where needed
- Follow OWASP security guidelines


### Production Considerations
- Set appropriate environment variables
- Enable production optimizations
- Implement proper logging
- Use CDN for static assets
- Monitor application performance

## Review Process Guidelines

Before submitting any code, ensure the following steps are completed:

### 1. Code Quality Checks
- **Linting:** Run and resolve all ESLint warnings/errors
- **Type Checking:** Ensure TypeScript compilation succeeds without errors
- **Build:** Verify production build completes successfully
- **Formatting:** Apply Prettier formatting consistently

### 2. Testing Validation
- **E2E Tests:** All Playwright tests pass
- **Component Tests:** Storybook builds without errors
- **Manual Testing:** Verify functionality in development environment
- **Cross-browser:** Test in major browsers if UI changes are made

### 3. Standards Compliance Assessment
For each standard, explicitly state ✅ or ❌ and explain why:

- **TypeScript Standards:** Proper typing, interfaces, no `any` usage
- **React Patterns:** Functional components, proper hooks usage, error handling
- **Code Style:** Naming conventions, import organization, file structure
- **Performance:** No unnecessary re-renders, proper dependency arrays
- **Accessibility:** Proper contrast, keyboard navigation, semantic HTML
- **Security:** Input validation, secure authentication handling
- **Testing:** Adequate test coverage for new features
- **Documentation:** Updated README, comments for complex logic

### 4. Integration Validation
- **API Integration:** Proper error handling and loading states
- **Environment Variables:** Correct configuration for all environments
- **Dependencies:** No unnecessary or vulnerable dependencies
- **Build System:** Vite configuration optimized and working


### Troubleshooting
- **Build failures:** Check TypeScript errors and dependency conflicts
- **E2E test failures:** Verify backend is running and authentication is configured
- **Hot reload issues:** Clear Vite cache and restart development server
- **Environment issues:** Verify all required environment variables are set


---

## 🔌 Connection Integration Guidelines

This section documents the complete process for creating, modifying, or fixing connection integrations based on the Reddit integration implementation.

### Overview of Changes Made (Reddit Integration Example)

**Branch:** `ronen/feat/reddit-connection`

**Summary:** Added Reddit as a new connection integration with OAuth private authentication, including forms, validation, hints, translations, and comprehensive E2E tests.

### File Structure for a New Connection

When adding a new connection integration, you'll need to modify/create files in these locations:

```
src/
├── components/organisms/connections/integrations/
│   └── [integration-name]/
│       ├── add.tsx              # Add connection form
│       └── edit.tsx             # Edit connection form
├── constants/
│   ├── connections/
│   │   ├── addComponentsMapping.constants.ts
│   │   ├── editComponentsMapping.constants.ts
│   │   └── integrationVariablesMapping.constants.ts
│   └── lists/connections/
│       └── integrationInfoLinks.constants.ts
├── assets/image/icons/connections/
│   ├── [integration-name].svg  # Integration icon
│   └── index.ts                 # Export the icon
├── enums/components/
│   └── connection.enum.ts       # Add to Integrations enum
├── validations/
│   ├── connection.schema.ts     # Add Zod schema
│   └── index.ts                 # Export the schema
└── locales/en/integrations/
    └── translation.json          # Add translations

e2e/project/connections/
└── [integration-name].spec.ts   # E2E functional tests

e2e/visual-regression/
└── connections.spec.ts          # Visual regression (generic, not integration-specific)
```

### Step-by-Step Implementation Guide

#### 1. Create Form Components

**File:** `src/components/organisms/connections/integrations/[integration-name]/add.tsx`

**Key Points:**
- Use `useTranslation` with `keyPrefix` for integration-specific translations
- Add a second `useTranslation` hook WITHOUT `keyPrefix` for shared translations (buttons, information)
- Use `useConnectionForm` hook with your Zod schema
- Import and use `ConnectionAuthType` and `Integrations` enums
- For conditional field validation, use `register` with `validate` function, NOT Zod's `.superRefine()`

**Example Pattern:**
```typescript
export const [Integration]AddForm = ({ connectionId, triggerParentFormSubmit }) => {
  const { t } = useTranslation("integrations", { keyPrefix: "[integration]" });
  const { t: tIntegrations } = useTranslation("integrations"); // For shared keys

  const { createConnection, errors, handleSubmit, isLoading, register, watch } = 
    useConnectionForm([integration]Schema, "create");

  // For conditional validation
  const fieldA = watch("fieldA");
  const fieldB = watch("fieldB");

  return (
    <form onSubmit={handleSubmit(triggerParentFormSubmit)}>
      <Input
        {...register("fieldA", {
          validate: (value) => {
            if ((value && !fieldB) || (!value && fieldB)) {
              return "Both fields required together";
            }
            return true;
          },
        })}
        hint={t("hints.fieldA")}
      />
      
      <Accordion title={tIntegrations("information")}>
        {/* Documentation links */}
      </Accordion>

      <Button aria-label={tIntegrations("buttons.saveConnection")}>
        {tIntegrations("buttons.saveConnection")}
      </Button>
    </form>
  );
};
```

**File:** `src/components/organisms/connections/integrations/[integration-name]/edit.tsx`

Similar to add.tsx but:
- Use `onSubmitEdit` instead of `triggerParentFormSubmit`
- Use `useWatch` for form values
- Use `SecretInput` for sensitive fields with lock/unlock functionality
- Implement `lockState` for secret fields
- Use `setFormValues` utility with `integrationVariablesMapping`

#### 2. Translation Keys

**File:** `src/locales/en/integrations/translation.json`

**Critical Rule:** The `../` relative path syntax does NOT work with `react-i18next`'s `keyPrefix` option.

**Solution:** Use a second translation hook without `keyPrefix` for shared keys.

**Structure:**
```json
{
  "[integration]": {
    "placeholders": {
      "fieldName": "Field Label"
    },
    "hints": {
      "fieldName": "Helpful hint text with format examples"
    },
    "information": {
      "apiDocumentation": "Integration API Documentation"
    }
  }
}
```

**Usage:**
- Integration-specific: `t("placeholders.fieldName")` (uses keyPrefix)
- Shared keys: `tIntegrations("buttons.saveConnection")` (no keyPrefix)
- Accordion title: `tIntegrations("information")` (no keyPrefix)

#### 3. Validation Schema

**File:** `src/validations/connection.schema.ts`

**Critical Rule:** Do NOT use `.superRefine()` or `.refine()` - these wrap the schema in `ZodEffects` which is incompatible with `useConnectionForm`.

**Correct Approach:**
```typescript
export const [integration]Schema = z.object({
  field_a: z.string().min(1, "Field A is required"),
  field_b: z.string().optional(),
  // For conditional validation, use register's validate option, not Zod
});
```

**Wrong Approach:**
```typescript
// ❌ DON'T DO THIS - incompatible with useConnectionForm
export const [integration]Schema = z.object({...}).superRefine((data, ctx) => {
  // validation logic
});
```

**Export the schema:**
```typescript
// In src/validations/index.ts
export { [integration]Schema } from "./connection.schema";
```

#### 4. Hint Component Integration

**Usage:** Add `hint` prop to `Input`, `Select`, or `SecretInput` components:
```typescript
<Input
  {...register("field_name")}
  hint={t("hints.fieldName")}
  label={t("placeholders.fieldName")}
/>
```

The hint will automatically render below the input with an info icon.

#### 5. Information Links

**File:** `src/constants/lists/connections/integrationInfoLinks.constants.ts`

**Pattern:**
```typescript
let info[Integration]Links: { text: string; url: string }[] = [];

i18n.on("initialized", () => {
  info[Integration]Links = [
    {
      url: "https://docs.integration.com/api/",
      text: t("[integration].information.apiDocumentation", { ns: "integrations" }),
    },
  ];
});

export { info[Integration]Links };
```

#### 6. Constants Mapping

**Add Component Mapping:**
```typescript
// src/constants/connections/addComponentsMapping.constants.ts
import { [Integration]AddForm } from "@components/organisms/connections/integrations/[integration]/add";

export const addComponentsMapping = {
  // ...
  [[integration]]: [Integration]AddForm,
};
```

**Edit Component Mapping:**
```typescript
// src/constants/connections/editComponentsMapping.constants.ts
import { [Integration]EditForm } from "@components/organisms/connections/integrations/[integration]/edit";

export const editComponentsMapping = {
  // ...
  [[integration]]: [Integration]EditForm,
};
```

**Variables Mapping:**
```typescript
// src/constants/connections/integrationVariablesMapping.constants.ts
export const integrationVariablesMapping = {
  // ...
  [integration]: {
    field_a: "field_a",
    field_b: "field_b",
  },
};
```

#### 7. Enum Registration

**File:** `src/enums/components/connection.enum.ts`

Add your integration to the `Integrations` enum:
```typescript
export enum Integrations {
  // ...
  [integration] = "[integration]",
}
```

#### 8. Icon Setup

1. Add SVG icon to `src/assets/image/icons/connections/`
2. Export it in `src/assets/image/icons/connections/index.ts`

#### 9. E2E Testing

**File:** `e2e/project/connections/[integration].spec.ts`

**Critical Rules:**
- Each test must create a new project in `beforeEach`
- Run tests with `--workers=1` to avoid backend rate limiting
- Test on single browser (Chrome) to prevent simultaneous API calls
- Use `waitForToast()` for success/error validation
- Test full CRUD operations
- Remove `dashboardPage` from test parameters if not used

**Test Structure:**
```typescript
import { expect, test } from "e2e/fixtures";
import { waitForToast } from "e2e/utils";

test.describe("[Integration] Connection Suite", () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.createProjectFromMenu();
  });

  test("Create connection with required fields", async ({ page }) => {
    await page.getByRole("tab", { name: "connections" }).click();
    await page.getByRole("button", { name: "Add new" }).click();

    await page.getByTestId("select-integration").click();
    await page.getByRole("option", { name: "[Integration]" }).click();

    await page.getByLabel("Field A", { exact: true }).fill("test_value");

    await page.getByRole("button", { name: "Save Connection" }).click();

    const toast = await waitForToast(page, "Connection created successfully");
    await expect(toast).toBeVisible();
  });

  test("Edit connection", async ({ page }) => {
    // Create first, then edit
  });

  test("Delete connection", async ({ page }) => {
    // Create first, then delete
  });

  test("Validation errors", async ({ page }) => {
    // Test empty required fields
  });

  test("Display hints", async ({ page }) => {
    // Verify hints are visible
  });
});
```

**Run Tests:**
```bash
# Run with single worker and single browser to avoid rate limiting
npx playwright test e2e/project/connections/[integration].spec.ts --workers=1 --project=Chrome
```

#### 10. Visual Regression Testing

**Note:** Visual regression tests were initially created but removed due to backend performance and timeout issues during project creation. They can be added back in the future when the backend is more stable.

If you want to add visual regression tests in the future:
- Create them in `e2e/visual-regression/` folder
- They must run within a project context (extract `projectId` from URL after creation)
- Keep them GENERIC - test overall connections page, not specific integrations
- Consider using `beforeAll` with a shared project instead of `beforeEach` to avoid rate limits
- Use `--workers=1` to prevent backend rate limiting

**Example structure:**
```typescript
test.describe("Connections Visual Regression", () => {
	let projectId: string;

	test.beforeAll(async ({ dashboardPage, page }) => {
		await dashboardPage.createProjectFromMenu();
		projectId = page.url().match(/\/projects\/([^/]+)/)?.[1] || "";
	});

	test("List view", async ({ page }) => {
		await page.goto(`/projects/${projectId}/connections`);
		await expect(page).toHaveScreenshot("connections-list.png");
	});
});
```

### Common Issues and Solutions

#### Issue 1: Translation Keys Not Working
**Problem:** Seeing literal translation keys like "reddit.../buttons.saveConnection"
**Solution:** Don't use `../` with keyPrefix. Use separate translation hook:
```typescript
const { t } = useTranslation("integrations", { keyPrefix: "reddit" });
const { t: tIntegrations } = useTranslation("integrations");
// Use tIntegrations for shared keys
```

#### Issue 2: Zod Schema Type Error
**Problem:** `Argument of type 'ZodEffects<...>' is not assignable to parameter of type 'ZodObject<...>'`
**Solution:** Don't use `.superRefine()` or `.refine()`. Use `register`'s `validate` option instead.

#### Issue 3: E2E Tests Timing Out
**Problem:** Tests fail with 3-minute timeout
**Solution:** Backend rate limiting from parallel tests. Run with `--workers=1 --project=Chrome`

#### Issue 4: Conditional Validation
**Problem:** Need to validate that two fields are required together
**Solution:** Use react-hook-form's `validate` with `watch`:
```typescript
const fieldB = watch("fieldB");
<Input
  {...register("fieldA", {
    validate: (value) => {
      if ((value && !fieldB) || (!value && fieldB)) {
        return "Both fields required";
      }
      return true;
    },
  })}
/>
```

### Quality Checklist

Before submitting a PR for a new connection integration:

- [ ] **Forms Created:** Both add.tsx and edit.tsx implemented
- [ ] **Translations Added:** All placeholders, hints, and information links
- [ ] **Translation Hooks:** Using both prefixed and non-prefixed hooks correctly
- [ ] **Schema Defined:** Zod schema without .superRefine()/.refine()
- [ ] **Validation:** Conditional validation using register's validate option
- [ ] **Hints Added:** Helpful hints for complex fields
- [ ] **Constants Mapped:** addComponentsMapping, editComponentsMapping, variablesMapping
- [ ] **Enum Updated:** Integration added to Integrations enum
- [ ] **Icon Added:** SVG icon added and exported
- [ ] **Info Links:** Documentation links configured in integrationInfoLinks
- [ ] **E2E Tests:** Comprehensive tests covering CRUD operations
- [ ] **Tests Pass:** All tests run successfully with `--workers=1 --project=Chrome`
- [ ] **No Comments:** All code files are clean without comments
- [ ] **Linting:** `npm run lint:fix` passes
- [ ] **Type Check:** `npm run tsc` passes
- [ ] **Build:** `npm run build` completes successfully

### Files Modified in Reddit Integration Example

**Created:**
- `src/components/organisms/connections/integrations/reddit/add.tsx`
- `src/components/organisms/connections/integrations/reddit/edit.tsx`
- `src/components/atoms/hint.tsx`
- `e2e/project/connections/reddit.spec.ts`

**Modified:**
- `src/locales/en/integrations/translation.json` - Added reddit translations
- `src/constants/connections/addComponentsMapping.constants.ts` - Mapped Reddit add form
- `src/constants/connections/editComponentsMapping.constants.ts` - Mapped Reddit edit form
- `src/constants/connections/integrationVariablesMapping.constants.ts` - Added reddit field mapping
- `src/constants/lists/connections/integrationInfoLinks.constants.ts` - Added Reddit API docs
- `src/constants/lists/index.ts` - Exported infoRedditLinks
- `src/enums/components/connection.enum.ts` - Added reddit to Integrations enum
- `src/validations/connection.schema.ts` - Added redditPrivateAuthIntegrationSchema
- `src/validations/index.ts` - Exported reddit schema
- `src/components/organisms/connections/integrations/index.ts` - Exported Reddit forms
- `src/components/atoms/index.ts` - Exported Hint component
- `src/interfaces/components/forms/input.interface.ts` - Added hint prop
- `src/interfaces/components/forms/select.interface.ts` - Added hint prop
- `src/interfaces/components/forms/secretInput.interface.ts` - Added hint prop
- `src/components/atoms/input.tsx` - Integrated Hint component
- `src/components/atoms/secretInput.tsx` - Integrated Hint component
- `src/components/molecules/select/base.tsx` - Integrated Hint component

### Key Insights

1. **Translation Architecture:** react-i18next's `keyPrefix` doesn't support `../` relative paths. Use multiple translation hooks.
2. **Validation Strategy:** Keep Zod schemas simple. Use react-hook-form's built-in validation for conditional logic.
3. **Testing Strategy:** Separate concerns - functional E2E tests per integration, generic visual regression tests.
4. **Test Execution:** Always run with `--workers=1 --project=Chrome` to avoid backend rate limiting.
5. **Component Reusability:** The Hint component pattern provides consistent UX across all integrations.
6. **No Comments Policy:** Code should be self-documenting. Only add comments when explicitly requested.

---

## 🧠 Claude Optimized Labels

For best Claude comprehension, annotate your code or PRs using:
```ts
// Claude: This hook listens to session events and syncs to state.
```
```ts
// Claude: Entry point for the session deletion logic.
```

This helps Claude understand purpose + intention beyond syntax.

## Contributing Guidelines

1. **Read CONTRIBUTING.md** for detailed contribution guidelines
2. **Create feature branches** from `develop`
3. **Follow commit conventions** and provide descriptive messages
4. **Ensure all tests pass** before submitting PR
5. **Update documentation** for new features or changes
6. **Request review** from appropriate team members

## Additional Resources

- **Main AutoKitteh Repository:** https://github.com/autokitteh/autokitteh
- **Documentation:** https://docs.autokitteh.com/
- **Example Projects:** https://github.com/autokitteh/kittehub
- **Contact:** meow@autokitteh.com

---

## 📜 License & Metadata

- License: [MIT](./LICENSE)
- Contributors: AutoKitteh team
- Contact: support@autokitteh.com

---

*This document should be referenced before making any changes to ensure consistency with project standards and conventions.*

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
