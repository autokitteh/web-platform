# E2E Test Fixtures

This directory contains generated test data for E2E tests.

## Connection Test Data

### Overview

The connection button presence tests use auto-generated test data to ensure every integration and auth type combination has a proper submit button in the UI.

### Files

- **`connection-test-cases.json`** - Auto-generated test cases (DO NOT EDIT MANUALLY - regenerated before each test run)

## How It Works

1. **Before E2E tests run**, the `pretest:e2e` hook automatically generates `connection-test-cases.json`
2. The generation script **imports directly from source constants** to create test cases
3. Tests in `e2e/project/connections/button-presence.spec.ts` import and iterate over the generated JSON

## Single Source of Truth ✅

Test data is now generated **directly from source code**:
- `src/constants/connections/integrationAuthMethods.constants.ts` (`allIntegrationsAuthMethods`, `authMethodOptions`)
- `src/enums/components/integrations.enum.ts` (`IntegrationsMap`, `shouldHideIntegration`)

This means:
- ✅ **No manual synchronization required**
- ✅ **No risk of drift between source and tests**
- ✅ **Automatic test coverage for new integrations**

## Adding a New Integration

When you add a new connection integration, **no additional E2E fixture updates are needed!**

1. **Add integration to source files** (`src/constants/connections/integrationAuthMethods.constants.ts`):
```typescript
export const baseIntegrationAuthMethods = {
  // ...existing
  [Integrations.newIntegration]: [
    { authType: ConnectionAuthType.Oauth, schema: newIntegrationOauthSchema },
    { authType: ConnectionAuthType.ApiKey, schema: newIntegrationApiKeySchema }
  ]
};
```

2. **That's it!** The next time E2E tests run, test data will automatically include your new integration.

3. **Optional - verify locally**:
```bash
npm run generate:connection-test-data  # Regenerate fixture
npm run test:e2e:connections-buttons    # Run button presence tests
```

## Technical Details

### Architecture Changes That Made This Possible

The following architectural improvements enabled Node.js to import from browser-targeted source code:

1. **Separated Interface Hierarchies**
   - Created `BaseSelectOption` interface without browser-specific SVG icon property
   - Made `SelectOption` extend `BaseSelectOption` with optional icon
   - Use `BaseSelectOption` in constants that need Node.js compatibility

2. **Removed Browser Dependencies**
   - Replaced `tailwind-config` Vite alias with direct relative import in `getTailwindConfig.utils.ts`
   - Made `featureFlags.constants.ts` compatible with both `import.meta.env` (Vite) and `process.env` (Node.js)
   - Created isolated `validateDomain.utils.ts` without Logger dependencies

3. **Fixed Barrel Export Chains**
   - Changed barrel exports (`@src/constants`) to direct imports throughout validation schemas
   - Avoided pulling in form themes, asset loaders, and other browser-specific code
   - Used path-specific imports like `@src/constants/featureFlags.constants` instead of `@src/constants`

### Key Files Modified

- `src/interfaces/components/forms/select.interface.ts` - Added `BaseSelectOption`
- `src/constants/connections/integrationAuthMethods.constants.ts` - Exported constants, used `BaseSelectOption`
- `src/constants/featureFlags.constants.ts` - Dual environment support
- `src/enums/components/integrations.enum.ts` - Used `BaseSelectOption`, direct imports
- `src/utilities/getTailwindConfig.utils.ts` - Removed Vite-only alias
- `src/utilities/validateDomain.utils.ts` - **New file** - Isolated domain validation
- `src/validations/connection.schema.ts` - Removed i18next, used direct imports
- `src/utilities/forceAuthType.utils.ts` - Fixed barrel exports
- `src/utilities/validateUrl.utils.ts` - Fixed barrel exports

### Generated Test Data

The JSON fixture includes:
- **testName**: Human-readable test name (e.g., "GitHub - OAuth 2.0")
- **integration**: Integration ID from `Integrations` enum
- **label**: Integration display name
- **authType**: Auth type ID from `ConnectionAuthType` enum (or `null` for single-type)
- **authLabel**: Auth type display label (or `null` for single-type)
- **category**: Either `"single-type"` or `"multi-type"`

Single-type integrations have no auth options (AWS, Telegram, Discord, etc.) while multi-type integrations offer multiple authentication methods (GitHub, Slack, Linear, etc.).

## Manual Regeneration

To regenerate test cases without running the full test suite:

```bash
npm run generate:connection-test-data
```

This will:
1. Import from source constants
2. Generate test cases for all visible integrations
3. Write to `e2e/fixtures/connection-test-cases.json`
4. Output statistics

## OAuth Auth Types

These auth types trigger "Start OAuth Flow" button:
- `oauth`
- `oauthDefault`
- `oauthPrivate`
- `oauthApp`
- `oauthUser`
- `microsoftOauthDefault`
- `microsoftOauthPrivate`

All other auth types expect "Save Connection" button.
