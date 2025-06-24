# Playwright MCP Server

A Model Context Protocol (MCP) server that provides Playwright testing tools for VS Code Copilot.

## Features

- **Analyze Playwright Tests**: Identify common issues and anti-patterns in test files
- **Run Tests**: Execute Playwright tests and get formatted results
- **Fix Test Issues**: Get specific suggestions for fixing common Playwright problems
- **Generate Tests**: Create new test templates based on requirements

## Installation

1. Install dependencies:
```bash
cd mcp-playwright-server
npm install
```

2. Build the server:
```bash
npm run build
```

## Usage with VS Code

### Add to VS Code Settings

Add the MCP server to your VS Code settings (`settings.json`):

```json
{
  "mcp.servers": {
    "playwright-mcp": {
      "command": "node",
      "args": ["/path/to/your/mcp-playwright-server/dist/index.js"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

### Available Tools

1. **analyze_playwright_test**
   - Analyzes a test file for common issues
   - Parameters: `testFile` (path to test file)

2. **run_playwright_tests** 
   - Runs Playwright tests
   - Parameters: `testFile` (optional), `grep` (optional pattern)

3. **fix_playwright_test**
   - Provides fix suggestions for specific issues
   - Parameters: `testFile`, `issue` (description of the problem)

4. **generate_playwright_test**
   - Generates new test templates
   - Parameters: `testName`, `description`, `pageUrl` (optional)

## Example Usage

In VS Code with Copilot, you can ask:

- "Analyze my Playwright test file for issues"
- "Run the webhook session test"
- "How can I fix the timeout issue in my test?"
- "Generate a new test for login functionality"

## Development

```bash
# Development mode
npm run dev

# Build
npm run build

# Start production server
npm start
```
