# Routes Comparison: Old vs New

## Side-by-Side Comparison

### 1. Code View

```
OLD: /projects/:projectId/code
NEW: /projects/:projectId/explorer

Component: CodeTable → Project
```

### 2. Connections Management

```
LIST VIEW:
OLD: /projects/:projectId/connections
NEW: /projects/:projectId/explorer/settings/connections

CREATE:
OLD: /projects/:projectId/connections/add
NEW: /projects/:projectId/explorer/settings/connections/new

EDIT:
OLD: /projects/:projectId/connections/:connectionId/edit
NEW: /projects/:projectId/explorer/settings/connections/:connectionId/edit

DELETE:
OLD: [Not available]
NEW: /projects/:projectId/explorer/settings/connections/:connectionId/delete ⭐

EVENTS:
OLD: /projects/:projectId/connections/:connectionId/events
NEW: /projects/:projectId/explorer/events

SPECIFIC EVENT:
OLD: /projects/:projectId/connections/:connectionId/events/:eventId
NEW: /projects/:projectId/explorer/events/:eventId

Component Evolution:
  ConnectionsTable → ProjectSettingsMainView (in settings drawer)
  AddConnection → ProjectSettingsConnectionAdd
  EditConnection → ProjectSettingsConnectionEdit
  [NEW] → ProjectSettingsConnectionDelete
```

### 3. Triggers Management

```
LIST VIEW:
OLD: /projects/:projectId/triggers
NEW: /projects/:projectId/explorer/settings/triggers

CREATE:
OLD: /projects/:projectId/triggers/add
NEW: /projects/:projectId/explorer/settings/triggers/new

EDIT:
OLD: /projects/:projectId/triggers/:triggerId/edit
NEW: /projects/:projectId/explorer/settings/triggers/:triggerId/edit

DELETE:
OLD: [Not available]
NEW: /projects/:projectId/explorer/settings/triggers/:triggerId/delete ⭐

EVENTS:
OLD: /projects/:projectId/triggers/:triggerId/events
NEW: /projects/:projectId/explorer/events

SPECIFIC EVENT:
OLD: /projects/:projectId/triggers/:triggerId/events/:eventId
NEW: /projects/:projectId/explorer/events/:eventId

Component Evolution:
  TriggersTable → ProjectSettingsMainView (in settings drawer)
  AddTrigger → ProjectSettingsTriggerAdd
  EditTrigger → ProjectSettingsTriggerEdit
  [NEW] → ProjectSettingsTriggerDelete
```

### 4. Variables Management

```
LIST VIEW:
OLD: /projects/:projectId/variables
NEW: /projects/:projectId/explorer/settings/variables

CREATE:
OLD: /projects/:projectId/variables/add
NEW: /projects/:projectId/explorer/settings/variables/new

EDIT:
OLD: /projects/:projectId/variables/edit/:variableName
NEW: /projects/:projectId/explorer/settings/variables/:variableName/edit

DELETE:
OLD: [Not available]
NEW: /projects/:projectId/explorer/settings/variables/:variableName/delete ⭐

Component Evolution:
  VariablesTable → ProjectSettingsMainView (in settings drawer)
  AddVariable → ProjectSettingsVariableAdd
  EditVariable → ProjectSettingsVariableEdit
  [NEW] → ProjectSettingsVariableDelete
```

### 5. Events

```
LIST VIEW:
OLD: /projects/:projectId/events (from global EventsLayout)
NEW: /projects/:projectId/explorer/events (within project context)

SPECIFIC EVENT:
OLD: /projects/:projectId/events/:eventId
NEW: /projects/:projectId/explorer/events/:eventId
```

## Component Structure Comparison

### OLD STRUCTURE (Flat)
```
AppLayout
└── Project
    ├── [CodeTable] (when at /projects/:projectId/code)
    ├── [ConnectionsTable] (when at /projects/:projectId/connections)
    │   ├── AddConnection
    │   ├── EditConnection
    │   └── EventsList
    ├── [TriggersTable] (when at /projects/:projectId/triggers)
    │   ├── AddTrigger
    │   ├── EditTrigger
    │   └── EventsList
    ├── [VariablesTable] (when at /projects/:projectId/variables)
    │   ├── AddVariable
    │   ├── EditVariable
    │   └── EventsList
    └── [EventsList] (when at /projects/:projectId/events)
```

### NEW STRUCTURE (Hierarchical)
```
AppLayout
└── ProjectWrapper
    └── Project (Explorer View)
        ├── ProjectSettingsDrawer
        │   ├── ProjectSettingsMainView
        │   ├── ProjectSettingsConnectionAdd
        │   ├── ProjectSettingsConnectionEdit
        │   ├── ProjectSettingsConnectionDelete
        │   ├── ProjectSettingsTriggerAdd
        │   ├── ProjectSettingsTriggerEdit
        │   ├── ProjectSettingsTriggerDelete
        │   ├── ProjectSettingsVariableAdd
        │   ├── ProjectSettingsVariableEdit
        │   └── ProjectSettingsVariableDelete
        └── EventsList
```

## URL Pattern Changes

### Parameter Naming
```
Connections:
  OLD: :connectionId (variable name)
  NEW: :id (parameter name)

Variables:
  OLD: /edit/:variableName (separate edit route)
  NEW: /settings/variables/:variableName/edit (consistent pattern)
```

### Path Structure
```
OLD: Flat paths at project level
  /projects/:projectId/[feature]
  /projects/:projectId/[feature]/[action]

NEW: Hierarchical under explorer > settings
  /projects/:projectId/explorer/settings/[feature]
  /projects/:projectId/explorer/settings/[feature]/[action]
```

### Action Naming
```
CREATE:
  OLD: /add
  NEW: /new

EDIT:
  OLD: /edit or /[id]/edit (inconsistent)
  NEW: /[id]/edit (consistent)

DELETE:
  OLD: [Not available]
  NEW: /[id]/delete (new feature)
```

## Feature Matrix

| Feature | Old | New | Change |
|---------|-----|-----|--------|
| Code View | ✓ | ✓ | Renamed to Explorer |
| Connections List | ✓ | ✓ | Moved to Settings Drawer |
| Add Connection | ✓ | ✓ | Path changed `/add` → `/new` |
| Edit Connection | ✓ | ✓ | Param changed `:connectionId` → `:id` |
| Delete Connection | ✗ | ✓ | New feature |
| Connection Events | ✓ | ✓ | Centralized under `/explorer/events` |
| Triggers List | ✓ | ✓ | Moved to Settings Drawer |
| Add Trigger | ✓ | ✓ | Path changed `/add` → `/new` |
| Edit Trigger | ✓ | ✓ | Same parameter naming |
| Delete Trigger | ✗ | ✓ | New feature |
| Trigger Events | ✓ | ✓ | Centralized under `/explorer/events` |
| Variables List | ✓ | ✓ | Moved to Settings Drawer |
| Add Variable | ✓ | ✓ | Path changed `/add` → `/new` |
| Edit Variable | ✓ | ✓ | Path normalized |
| Delete Variable | ✗ | ✓ | New feature |
| Events View | ✓ | ✓ | Moved to project context |

## Deployment Impact

### No Breaking Changes For:
- ✅ Data structures (all IDs and parameters remain the same)
- ✅ Backend API (no API changes needed)
- ✅ Authentication (no auth changes)
- ✅ State management (store structure unchanged)

### Breaking Changes For:
- ⚠️ Bookmarked URLs (will redirect)
- ⚠️ Direct navigation links in code (must be updated)
- ⚠️ E2E tests (URLs must be updated)
- ⚠️ External links pointing to old routes

### Migration Path:
1. Old URLs automatically redirect to new URLs
2. No user action required
3. Bookmarks will be updated on first access
4. Clear communications recommended
5. Legacy route support can be maintained for 4+ weeks

## Performance Considerations

### Loading
- **Before:** Each section (code, connections, triggers, variables) loaded separately
- **After:** All managed within Project/Explorer context, reducing overhead
- **Benefit:** Faster transitions between settings sections

### Memory
- **Before:** Multiple components loaded independently
- **After:** Settings drawer manages component lifecycle
- **Benefit:** Better memory management with drawer close/open

### Navigation
- **Before:** Full page refreshes between sections
- **After:** Drawer updates without full page load
- **Benefit:** Smoother UX with faster transitions

## SEO/Analytics Considerations

### Analytics Tracking
- Update GA4 tracking for new paths
- Monitor legacy route usage
- Create redirects in analytics platform if needed

### Sitemap
- No external URLs (internal app only)
- No SEO impact

### Internal Links
- Update all hardcoded navigation links
- Use route constants where applicable
- Test all navigation flows

## Backward Compatibility Timeline

```
Week 1-2: Transition Period
  - Old routes available and redirecting
  - Analytics tracking legacy usage
  - User communication ongoing

Week 3-4: Monitoring
  - Reduce legacy route traffic
  - Monitor for issues
  - Address user feedback

Week 5+: Deprecation
  - Consider removing legacy routes if usage < 1%
  - Maintain redirects for another 4 weeks minimum
  - Clear deprecation messaging
```
