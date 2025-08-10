# Rule Validation System

This directory contains a build-time validation system that ensures consistency between backend and frontend rule messages.

## Overview

The validation system automatically extracts rule messages from:
- **Backend**: `src/autokitteh/internal/backend/projects/lint.go` (Go)
- **Frontend**: `src/constants/project.constants.ts` (TypeScript)

And compares them to ensure they match exactly.

## Files

### `validateRuleConsistency.mjs`
The main validation script that:
1. Extracts rules from the Go backend file using regex parsing
2. Extracts rules from the TypeScript constants file
3. Compares all rule IDs and messages for exact matches
4. Fails the build if any inconsistencies are found

## Usage

### Automatic (Build-time)
The validation runs automatically during:
- `npm run build` - Development builds
- `npm run build:prod` - Production builds

### Manual
Run validation independently:
```bash
npm run validate-rules
```

## How It Works

1. **Extraction**: Uses regex patterns to extract rule maps from both files
2. **Comparison**: Compares rule IDs and messages for exact matches
3. **Validation**: Fails if any rules are missing, extra, or have different messages
4. **Build Prevention**: Stops the build process if validation fails

## Error Handling

When validation fails, the script:
- Displays detailed error messages showing exactly what doesn't match
- Provides file paths for both backend and frontend files
- Exits with code 1 to prevent the build from continuing

## Example Output

### Success (Colorized)
```
🔍 Validating rule consistency between backend and frontend...
📖 Extracting rules from Go backend...
   Found 11 backend rules
📖 Extracting rules from TypeScript frontend...
   Found 11 frontend rules

════════════════════════════════════════════════════════════════════════════════
✅ RULE VALIDATION PASSED - Frontend and Backend rules are synchronized
════════════════════════════════════════════════════════════════════════════════
🎉 Successfully validated 11 rules
   All rule messages match perfectly between backend and frontend
```

### Failure (Colorized)
```
════════════════════════════════════════════════════════════════════════════════
❌ RULE VALIDATION FAILED - Frontend and Backend rule messages are out of sync!
════════════════════════════════════════════════════════════════════════════════

The following inconsistencies were found:

1. Rule message mismatch for W1:
  Backend:  "Empty variable"
  Frontend: "Empty variable MISMATCH"

2. Extra rule in frontend: W3 - "Extra rule in frontend"

────────────────────────────────────────────────────────────────────────────────
Please update the rule messages in one of these files to match:
• Backend:  src/autokitteh/internal/backend/projects/lint.go
• Frontend: src/constants/project.constants.ts
────────────────────────────────────────────────────────────────────────────────

🚫 Build has been stopped to prevent inconsistent behavior.
```

**Note**: The actual output includes color coding for better readability:
- 🟢 Green: Success messages and matching content
- 🔴 Red: Error messages and mismatched content  
- 🟡 Yellow: Warning messages and rule IDs
- 🔵 Blue: Backend-related content
- 🟣 Magenta: Frontend-related content
- 🔵 Cyan: File paths and highlighted text

## Maintenance

When adding or modifying rules:

1. **Update Backend**: Modify the `Rules` map in `lint.go`
2. **Update Frontend**: Modify the `violationRules` object in `project.constants.ts`
3. **Test**: Run `npm run validate-rules` to ensure consistency
4. **Build**: The validation will run automatically during build

## Benefits

- **Early Detection**: Catches inconsistencies at build time, not runtime
- **Automatic Validation**: No manual checking required
- **Clear Error Messages**: Detailed feedback on what needs to be fixed
- **Build Safety**: Prevents shipping inconsistent rule messages
- **Zero Runtime Overhead**: Validation only runs during build process