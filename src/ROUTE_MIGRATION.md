# Route Migration Guide

## Overview

This document outlines the migration from the old flat route structure to the new hierarchical structure with a project explorer and drawer-based settings interface.

## Key Changes

### 1. Project Code View
**Reason for change:** Consolidates the code/project view under a consistent explorer interface.

| Old Path | New Path |
|----------|----------|
| `/projects/:projectId/code` | `/projects/:projectId/explorer` |
| `/projects/:projectId` (index) | `/projects/:projectId/explorer` |

### 2. Settings Interface Migration
**Reason for change:** Settings for connections, triggers, and variables are now accessible via a drawer within the explorer view, creating a consistent UI pattern.

#### Connections
| Old Path | New Path |
|----------|----------|
| `/projects/:projectId/connections` | `/projects/:projectId/explorer/settings/connections` |
| `/projects/:projectId/connections/add` | `/projects/:projectId/explorer/settings/connections/new` |
| `/projects/:projectId/connections/:connectionId/edit` | `/projects/:projectId/explorer/settings/connections/:connectionId/edit` |
| `/projects/:projectId/connections/:connectionId/delete` | `/projects/:projectId/explorer/settings/connections/:connectionId/delete` ⭐ NEW |
| `/projects/:projectId/connections/:connectionId/events` | `/projects/:projectId/explorer/events` |
| `/projects/:projectId/connections/:connectionId/events/:eventId` | `/projects/:projectId/explorer/events/:eventId` |

#### Triggers
| Old Path | New Path |
|----------|----------|
| `/projects/:projectId/triggers` | `/projects/:projectId/explorer/settings/triggers` |
| `/projects/:projectId/triggers/add` | `/projects/:projectId/explorer/settings/triggers/new` |
| `/projects/:projectId/triggers/:triggerId/edit` | `/projects/:projectId/explorer/settings/triggers/:triggerId/edit` |
| `/projects/:projectId/triggers/:triggerId/delete` | `/projects/:projectId/explorer/settings/triggers/:triggerId/delete` ⭐ NEW |
| `/projects/:projectId/triggers/:triggerId/events` | `/projects/:projectId/explorer/events` |
| `/projects/:projectId/triggers/:triggerId/events/:eventId` | `/projects/:projectId/explorer/events/:eventId` |

#### Variables
| Old Path | New Path |
|----------|----------|
| `/projects/:projectId/variables` | `/projects/:projectId/explorer/settings/variables` |
| `/projects/:projectId/variables/add` | `/projects/:projectId/explorer/settings/variables/new` |
| `/projects/:projectId/variables/edit/:variableName` | `/projects/:projectId/explorer/settings/variables/:variableName/edit` |
| `/projects/:projectId/variables/:variableName/delete` | `/projects/:projectId/explorer/settings/variables/:variableName/delete` ⭐ NEW |

### 3. Events Routes
**Reason for change:** Events are now accessed from within the explorer context rather than independently.

| Old Path | New Path |
|----------|----------|
| `/projects/:projectId/events` | `/projects/:projectId/explorer/events` |
| `/projects/:projectId/events/:eventId` | `/projects/:projectId/explorer/events/:eventId` |

## Architectural Changes

### Component Structure

**Before (Flat):**
```
Project
├── CodeTable
├── ConnectionsTable
├── TriggersTable
├── VariablesTable
└── Events
```

**After (Hierarchical):**
```
Project (Explorer)
├── EventsList
└── ProjectSettingsDrawer
    ├── ProjectSettingsConnectionAdd
    ├── ProjectSettingsConnectionEdit
    ├── ProjectSettingsConnectionDelete
    ├── ProjectSettingsTriggerAdd
    ├── ProjectSettingsTriggerEdit
    ├── ProjectSettingsTriggerDelete
    ├── ProjectSettingsVariableAdd
    ├── ProjectSettingsVariableEdit
    └── ProjectSettingsVariableDelete
```

### Benefits

1. **Unified Navigation:** All project-related operations flow through the explorer
2. **Drawer UI Pattern:** Settings open in a consistent drawer interface
3. **Improved UX:** Reduced route proliferation, cleaner URL structure
4. **Better Organization:** Settings are logically grouped under settings paths
5. **Flexible Resource Management:** Delete operations formalized as dedicated routes

## Migration Path

### For Users

Users with bookmarks or direct links to old paths will be automatically redirected:
- Old URL will automatically redirect to new URL
- Browser history is maintained with redirects
- No data loss or broken functionality

### For Developers

When updating links or navigation:

1. **Update internal links:**
   ```typescript
   // Old
   navigate(`/projects/${projectId}/connections`);

   // New
   navigate(`/projects/${projectId}/explorer/settings/connections`);
   ```

2. **Update routing logic:**
   - Replace hardcoded old paths with new paths
   - Use route constants if available
   - Test all navigation flows

3. **Update E2E tests:**
   - Update URL assertions
   - Verify redirect behavior
   - Test bookmark scenarios

## Backward Compatibility

All old routes are handled by `routes.legacy.tsx` which provides automatic redirects to the new route structure.

To enable legacy routes:

```typescript
// In app.tsx or routes configuration
import { legacyRoutes } from "@src/routes.legacy";

export const mainRoutes = [
  ...newRoutes,
  ...legacyRoutes,  // Add at the end, before catch-all
];
```

## Deployment Considerations

- **No backend changes required:** This is purely a frontend routing refactor
- **No data migration needed:** All resource IDs and references remain the same
- **Gradual rollout:** Old and new routes can coexist during transition
- **Analytics:** Update tracking to reflect new route structure

## Testing Checklist

- [ ] Verify all old routes redirect to new routes
- [ ] Test bookmark functionality with old links
- [ ] Verify events show correctly in new location
- [ ] Test connection/trigger/variable add/edit/delete flows
- [ ] Verify drawer opens/closes properly
- [ ] Test deep links with parameters
- [ ] Verify browser history works with redirects
- [ ] Check analytics tracking with new routes

## Related Files

- `src/routes.tsx` - Main route definitions
- `src/routes.legacy.tsx` - Legacy route redirects
- `src/app.tsx` - App component using routes
- `src/components/templates/projectWrapper.tsx` - Project layout wrapper
- `src/components/organisms/projectSettingsView/` - Settings components
