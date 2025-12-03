# PR Review: `ronen/fix/connections-auth-types`

## Summary
Updates frontend connection auth types to match backend enum values from `integrations/auth.go`.

## Changes
| Integration | Before | After |
|-------------|--------|-------|
| AWS | `AWSConfig` | `Initialized` |
| Discord | `BotToken` | `Initialized` |
| Kubernetes | `JsonKey` | `Initialized` |
| OpenAI | `Key` | `Initialized` |
| Twilio | `AuthToken` | `ApiToken` |

## Files Modified
- `src/components/organisms/.../aws/add.tsx`
- `src/components/organisms/.../discord/add.tsx`
- `src/components/organisms/.../kubernetes/add.tsx`
- `src/components/organisms/.../openAI/add.tsx`
- `src/components/organisms/.../twilio/add.tsx`
- `src/components/organisms/.../twilio/edit.tsx`
- `src/constants/connections/formsPerIntegrationsMapping.constants.ts`
- `src/constants/lists/connections/options.constants.ts`
- `src/enums/connections/connectionTypes.enum.ts`
- `src/validations/connection.schema.ts`

## Required Actions Before Merge

### High Priority
- [ ] Remove `INTEGRATIONS_AUTH_REPORT.md` from commit (violates no-docs policy)
- [ ] Remove inline comments from all changed files

### Medium Priority
- [ ] Verify `ConnectionAuthType.Initialized` exists in enum
- [ ] Run E2E tests for affected integrations
- [ ] Confirm backwards compatibility with backend team

## Risk Level
**Medium** - Existing connections may fail if auth_type values mismatch with backend expectations.

## Commands to Run
```bash
npm run type-check
npm run lint:fix
npx playwright test e2e/project/connections --workers=1 --project=Chrome
```
