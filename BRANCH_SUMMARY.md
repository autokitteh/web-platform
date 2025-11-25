# Branch Summary: `ronen/fix/integrations-auth-types`

**Comparison:** `main` → `ronen/fix/integrations-auth-types`

**Commits:**
- `5c1fb2c98` feat: integrations and connections
- `f1405e4fc` feat: integrations and connections
- `171f47c85` fix: connection auth_type configurations
- `b9f5f9ae8` fix: connection auth_type configurations

**Stats:** 132 files changed, 2,540 insertions, 1,096 deletions

---

## Overview

This branch introduces a major refactoring of the connection and integration authentication system, adding new integrations, standardizing auth type configurations, and improving the overall architecture for managing connection forms.

---

## Key Changes

### 1. New Integrations Added

| Integration | Auth Methods |
|-------------|--------------|
| **Airtable** | PAT (Personal Access Token), OAuth Default |
| **ChatGPT** | Dedicated form (previously used OpenAI form) |

### 2. New Authentication Types

New `ConnectionAuthType` enum values:
- `MicrosoftOauthDefault` - Default user-delegated app
- `MicrosoftOauthPrivate` - Private user-delegated app
- `OauthApp` - OAuth 2.0 App (legacy)
- `PatDataCenter` - PAT for Data Center deployments
- `OauthUser` - User OAuth 2.0
- `PatWebhook` - PAT + Webhook combination

New backend auth type enums:
- `BackendConnectionAuthType` - Snake_case auth types for backend
- `BackendConnectionUrlAuthType` - CamelCase auth types for URL parameters

### 3. Centralized Auth Methods Configuration

**New file:** `src/constants/connections/integrationAuthMethods.constants.ts`

This file introduces a centralized configuration mapping integrations to their available authentication methods and validation schemas:

```typescript
export const allIntegrationsAuthMethods: Partial<Record<Integrations, AuthMethodConfig[]>>
```

Key features:
- Maps each integration to available auth types and Zod schemas
- Provides `authMethodOptions` for all connection types with labels
- Includes feature flag filtering for conditional auth methods
- Helper functions: `getIntegrationAuthOptions()`, `getSchemaByAuthType()`, `getIntegrationSchemas()`
- AWS regions options list
- Linear actor options

### 4. Integration Enum Refactoring

**Renamed:** `connection.enum.ts` → `integrations.enum.ts`

Changes:
- Separated icon-related enums into new `integrationsWithIcons.enum.ts`
- Added `IntegrationsMap` for label/value mappings
- Added helper functions: `isGoogleIntegration()`, `isMicrosoftIntegration()`, `isLegacyIntegration()`, `hasLegacyConnectionType()`
- Added `shouldHideIntegration` partial record for feature-flagged integrations

### 5. Validation Schema Updates

**File:** `src/validations/connection.schema.ts`

Major changes:
- Added schemas: `airtablePatIntegrationSchema`, `airtableOauthIntegrationSchema`, `asanaOauthIntegrationSchema`, `jiraPatIntegrationSchema`, `confluencePatIntegrationSchema`, `chatgptIntegrationSchema`
- Renamed Google auth schemas: `JsonKeyGoogle*` → `JsonGoogle*`
- Added Microsoft Teams multi-auth schemas: `microsoftOauthDefaultIntegrationSchema`, `microsoftOauthPrivateIntegrationSchema`, `microsoftDaemonAppIntegrationSchema`
- Added Zoom default OAuth schema: `zoomOauthDefaultIntegrationSchema`
- Added Salesforce/Notion default OAuth schemas
- Standardized `auth_type` values to use string literals instead of enum references
- Removed redundant `auth_type` fields from schemas that don't need them
- Made AWS token field optional

### 6. New Auth Method Forms

| Integration | New Auth Forms |
|-------------|----------------|
| **Airtable** | `oauth.tsx`, `pat.tsx` |
| **Asana** | `oauth.tsx`, `pat.tsx` |
| **Jira** | `pat.tsx` (Data Center) |
| **Confluence** | `pat.tsx` (Data Center) |

### 7. E2E Testing Infrastructure

**New files:**
- `e2e/pages/ConnectionFormPage.ts` - Page object for connection form testing
- `e2e/project/connections/button-presence.spec.ts` - Generated test suite for connection form buttons
- `e2e/fixtures/README.md` - Documentation for test data generation
- `scripts/generateConnectionTestData.ts` - Script to generate test cases from integration config

### 8. Feature Flags Updates

**File:** `src/constants/featureFlags.constants.ts`

New/updated flags for controlling OAuth visibility:
- `linearHideDefaultOAuth`
- `microsoftHideDefaultOAuth`
- `notionHideDefaultOAuth`
- `salesforceHideDefaultOAuth`
- `zoomHideDefaultOAuth`
- `displaySlackSocketIntegration`
- `telegramHideIntegration`
- `pipedriveHideIntegration`

---

## File Changes by Category

### New Files (24)
- `src/components/organisms/configuration/connections/integrations/airtable/*` (6 files)
- `src/components/organisms/configuration/connections/integrations/chatgpt/*` (3 files)
- `src/components/organisms/configuration/connections/integrations/asana/authMethods/*` (3 files)
- `src/components/organisms/configuration/connections/integrations/confluence/authMethods/pat.tsx`
- `src/components/organisms/configuration/connections/integrations/jira/authMethods/pat.tsx`
- `src/constants/connections/integrationAuthMethods.constants.ts`
- `src/enums/components/integrations.enum.ts`
- `src/enums/components/integrationsWithIcons.enum.ts`
- `e2e/pages/ConnectionFormPage.ts`
- `e2e/project/connections/button-presence.spec.ts`
- `e2e/fixtures/README.md`
- `scripts/generateConnectionTestData.ts`

### Modified Integration Forms (25+)
Updates to add/edit forms for: Anthropic, Asana, Auth0, AWS, Confluence, Discord, GitHub, Google (all services), HubSpot, Jira, Linear, Microsoft Teams, Notion, OpenAI, Pipedrive, Reddit, Salesforce, Slack, Telegram, Twilio, Zoom

### Deleted Files
- `src/constants/lists/connections/options.constants.ts` - Moved to `integrationAuthMethods.constants.ts`

---

## Breaking Changes

1. **Enum Import Paths**: `Integrations` enum moved from `connection.enum.ts` to `integrations.enum.ts`
2. **Schema Renames**: Google JSON key schemas renamed (`JsonKey*` → `Json*`)
3. **Auth Type Literals**: Many schemas now use string literals instead of `ConnectionAuthType` enum values
4. **Removed Exports**: `options.constants.ts` removed - use `integrationAuthMethods.constants.ts` instead

---

## Migration Notes

- Update imports from `@src/enums/components/connection.enum` to `@src/enums/components/integrations.enum`
- Update any direct references to removed `options.constants.ts` exports
- Auth type handling may need updates if relying on enum-based `auth_type` values
