# E2E Testing Guide

This document explains all available E2E testing scripts in the project.

## Prerequisites

- Node.js and npm installed
- Playwright browsers installed: `npx playwright install`
- For `act` commands: Docker installed and [act](https://github.com/nektos/act) CLI installed
- For `act` commands: `.secrets` and `.vars` files configured

---

## Quick Reference

| Use Case | Command |
|----------|---------|
| Run all tests | `npm run test:e2e` |
| Run specific file | `npm run test:e2e:file <path>` |
| Run with UI | `npm run test:e2e:ui` |
| Run single browser (fast) | `npm run test:e2e:fast` |
| Run serial (avoid rate limits) | `npm run test:e2e:serial` |
| View last report | `npm run test:e2e:report` |
| Run like CI locally | `npm run test:e2e:act` |
| Run like CI (specific file) | `TEST_FILE=<path> npm run test:e2e:act:debug:keep:file` |

---

## Basic Commands

### `npm run test:e2e`
Runs all Playwright E2E tests across all configured browsers.

```bash
npm run test:e2e
```

### `npm run test:e2e:ui`
Opens Playwright's interactive UI mode for debugging and running tests visually.

```bash
npm run test:e2e:ui
```

### `npm run test:e2e:report`
Opens the HTML report from the last test run.

```bash
npm run test:e2e:report
```

---

## Running Specific Tests

### `npm run test:e2e:file`
Runs tests from a specific file.

```bash
npm run test:e2e:file e2e/project/connections/global-connections.spec.ts
```

### `npm run test:e2e:ui:file`
Opens specific file in Playwright UI mode.

```bash
npm run test:e2e:ui:file e2e/project/connections/global-connections.spec.ts
```

### `npm run test:e2e:ui:dir`
Opens specific directory in Playwright UI mode.

```bash
npm run test:e2e:ui:dir e2e/project/connections/
```

### `npm run test:e2e:specific`
Runs specific tests by passing Playwright arguments.

```bash
npm run test:e2e:specific e2e/project/sessions.spec.ts
```

### `npm run test:e2e:by-name`
Runs tests matching a name pattern using a custom script.

```bash
npm run test:e2e:by-name "login"
```

### `npm run test:e2e:by-name:serial:chrome`
Same as above but serial execution on Chrome only.

```bash
npm run test:e2e:by-name:serial:chrome "connection"
```

---

## Browser-Specific Commands

### Single Browser Execution

| Command | Browser |
|---------|---------|
| `npm run test:e2e:chrome` | Chrome |
| `npm run test:e2e:firefox` | Firefox |
| `npm run test:e2e:safari` | Safari |
| `npm run test:e2e:edge` | Edge |

```bash
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:safari
npm run test:e2e:edge
```

### `npm run test:e2e:fast`
Runs tests only on Chrome (fastest option for development).

```bash
npm run test:e2e:fast
```

### `npm run test:e2e:single`
Runs tests on Chrome with 4 parallel workers.

```bash
npm run test:e2e:single
```

---

## Serial Execution (Rate Limiting)

Use these when backend rate limiting causes test failures.

### `npm run test:e2e:serial`
Runs tests sequentially on Chrome with single worker.

```bash
npm run test:e2e:serial
```

### `npm run test:e2e:rate-limited`
Adds 2-second delay between tests to avoid rate limits.

```bash
npm run test:e2e:rate-limited
```

### `npm run test:e2e:rate-limited:serial`
Combines rate limiting with serial execution on Chrome.

```bash
npm run test:e2e:rate-limited:serial
```

---

## Visual Regression Tests

### `npm run test:e2e:visual`
Runs visual regression tests (generates test data first).

```bash
npm run test:e2e:visual
```

### `npm run test:e2e:visual:update`
Updates visual regression snapshots.

```bash
npm run test:e2e:visual:update
```

### `npm run test:e2e:visual:serial`
Runs visual tests with single worker.

```bash
npm run test:e2e:visual:serial
```

### `npm run test:e2e:visual:serial:update`
Updates snapshots with serial execution.

```bash
npm run test:e2e:visual:serial:update
```

---

## CI Simulation with Act

These commands run tests in a Docker container simulating GitHub Actions CI environment.

### Prerequisites for Act Commands

1. Install [act](https://github.com/nektos/act): `brew install act`
2. Install Docker
3. Create `.secrets` file with required secrets (e.g., `TESTS_JWT_AUTH_TOKEN`)
4. Create `.vars` file with required variables

### Basic Act Commands

### `npm run test:e2e:act`
Runs E2E tests in CI-like Docker environment on Chrome.

```bash
npm run test:e2e:act
```

### `npm run test:e2e:act:logs`
Same as above with verbose logging.

```bash
npm run test:e2e:act:logs
```

### `npm run test:e2e:act:debug`
Runs with debug output for troubleshooting.

```bash
npm run test:e2e:act:debug
```

### Act with Container Reuse

These commands use `--reuse` to keep the Docker container between runs (faster subsequent runs).

### `npm run test:e2e:act:logs:keep`
Verbose logging with container reuse.

```bash
npm run test:e2e:act:logs:keep
```

### `npm run test:e2e:act:debug:keep`
Debug mode with container reuse.

```bash
npm run test:e2e:act:debug:keep
```

### `npm run test:e2e:act:debug:keep:file`
Verbose mode with container reuse for a **specific test file**.

```bash
TEST_FILE=e2e/project/connections/global-connections.spec.ts npm run test:e2e:act:debug:keep:file
```

```bash
TEST_FILE=e2e/project/sessionsCompactMode.spec.ts npm run test:e2e:act:debug:keep:file
```

### Act Browser-Specific Commands

| Command | Browser |
|---------|---------|
| `npm run test:e2e:act:chrome` | Chrome |
| `npm run test:e2e:act:firefox` | Firefox |
| `npm run test:e2e:act:safari` | Safari |
| `npm run test:e2e:act:edge` | Edge |

With verbose logs:

| Command | Browser |
|---------|---------|
| `npm run test:e2e:act:chrome:logs` | Chrome |
| `npm run test:e2e:act:firefox:logs` | Firefox |
| `npm run test:e2e:act:safari:logs` | Safari |
| `npm run test:e2e:act:edge:logs` | Edge |

---

## Common Workflows

### Development: Quick Test Iteration
```bash
npm run test:e2e:fast                    # Fast Chrome-only run
npm run test:e2e:file e2e/path/to/test   # Run specific file
npm run test:e2e:ui                      # Debug with UI
```

### Pre-Commit: Full Test Suite
```bash
npm run test:e2e                         # All browsers
npm run test:e2e:report                  # View results
```

### Debugging Failures
```bash
npm run test:e2e:ui:file e2e/failing.spec.ts   # Interactive debug
npm run test:e2e:serial                         # Isolate flaky tests
```

### CI Simulation
```bash
npm run test:e2e:act:debug:keep                 # Full CI simulation
TEST_FILE=e2e/specific.spec.ts npm run test:e2e:act:debug:keep:file  # Single file
```

### Rate Limit Issues
```bash
npm run test:e2e:rate-limited:serial    # Serial with delays
```

### Visual Regression
```bash
npm run test:e2e:visual                 # Check for regressions
npm run test:e2e:visual:update          # Update baselines
```

---

## Troubleshooting

### Tests fail with timeout errors
- Try `npm run test:e2e:serial` to run sequentially
- Check if backend is running and accessible

### Rate limiting errors
- Use `npm run test:e2e:rate-limited:serial`
- Reduce parallel workers

### Act commands fail
- Ensure Docker is running
- Check `.secrets` and `.vars` files exist
- Try with `--reuse` flag removed first

### Visual tests fail unexpectedly
- Run `npm run test:e2e:visual:update` to regenerate snapshots
- Ensure consistent viewport/environment
