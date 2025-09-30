## Description - Enhanced Clarity Analytics Data Enrichement

Enhanced Clarity analytics tracking to include project names for better user session analysis.

### Clarity Page ID Format

The page ID is constructed with pipe-separated parts in the following format:

```
pageTitleKey|org:xxx|project:xxx|projectName:xxx|deployment:xxx|session:xxx|event:xxx|connection:xxx|trigger:xxx|file:xxx
```

**Format Components:**

- **`pageTitleKey`** - The current page/route identifier (e.g., `base`, `home`, `chat`, `settings`)
- **`org:xxx`** - Organization ID for multi-tenant filtering
- **`project:xxx`** - Project UUID for technical identification
- **`projectName:xxx`** - ✨ **NEW** - Human-readable project name for easier session analysis
- **`deployment:xxx`** - Active deployment ID when viewing deployment details
- **`session:xxx`** - Active session ID when viewing session logs
- **`event:xxx`** - Event ID when viewing event details
- **`connection:xxx`** - Connection ID when managing integrations
- **`trigger:xxx`** - Trigger ID when configuring triggers
- **`file:xxx`** - Active filename when editing code in Monaco editor

All optional components are automatically omitted when not present, keeping the page ID concise and relevant to the current context.

## Linear Ticket
https://linear.app/autokitteh/issue/UI-1784/associate-clarity-with-org-id-and-user-id

## What type of PR is this? (check all applicable)
- [ ] 💡 (feat) - A new feature (non-breaking change which adds functionality)
- [ ] 🔄 (refactor) - Code Refactoring - A code change that neither fixes a bug nor adds a feature
- [x] 🐞 (fix) - Bug Fix (non-breaking change which fixes an issue)
- [ ] 🏎 (perf) - Optimization
- [ ] 📄 (docs) - Documentation - Documentation only changes
- [ ] 📄 (test) - Tests - Adding missing tests or correcting existing tests
- [ ] ⚙️ (ci) - Continuous Integrations - Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- [ ] ☑️ (chore) - Chores - Other changes that don't modify src or test files
- [ ] ↩️ (revert) - Reverts - Reverts a previous commit(s).

<!--
     For a timely review/response, please avoid force-pushing additional
     commits if your PR already received reviews or comments.
     Before submitting a Pull Request, please ensure you've done the following:
     - 👷‍♀️ Create small PRs. In most cases this will be possible.
     - ✅ Provide tests for your changes.
     - 📝 Use descriptive commit messages (as described below).
     - 📗 Update any related documentation and include any relevant screenshots.
     Commit Message Structure (all lower-case):
     <type>(optional ticket number): <description>
     [optional body]
-->
