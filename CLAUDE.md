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
- Types: feat, fix, docs, style, refactor, test, chore
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
