# Route Quick Reference Card

## Quick Migration Lookup

### Code View
```
OLD: /projects/:projectId/code
NEW: /projects/:projectId/explorer
```

### Connections
```
LIST:    /projects/:projectId/connections → /projects/:projectId/explorer/settings/connections
CREATE:  /projects/:projectId/connections/add → /projects/:projectId/explorer/settings/connections/new
EDIT:    /projects/:projectId/connections/:connectionId/edit → /projects/:projectId/explorer/settings/connections/:connectionId/edit
DELETE:  [NEW] → /projects/:projectId/explorer/settings/connections/:connectionId/delete
EVENTS:  /projects/:projectId/connections/:connectionId/events → /projects/:projectId/explorer/events
```

### Triggers
```
LIST:    /projects/:projectId/triggers → /projects/:projectId/explorer/settings/triggers
CREATE:  /projects/:projectId/triggers/add → /projects/:projectId/explorer/settings/triggers/new
EDIT:    /projects/:projectId/triggers/:triggerId/edit → /projects/:projectId/explorer/settings/triggers/:triggerId/edit
DELETE:  [NEW] → /projects/:projectId/explorer/settings/triggers/:triggerId/delete
EVENTS:  /projects/:projectId/triggers/:triggerId/events → /projects/:projectId/explorer/events
```

### Variables
```
LIST:    /projects/:projectId/variables → /projects/:projectId/explorer/settings/variables
CREATE:  /projects/:projectId/variables/add → /projects/:projectId/explorer/settings/variables/new
EDIT:    /projects/:projectId/variables/edit/:variableName → /projects/:projectId/explorer/settings/variables/:variableName/edit
DELETE:  [NEW] → /projects/:projectId/explorer/settings/variables/:variableName/delete
```

### Events
```
LIST:    /projects/:projectId/events → /projects/:projectId/explorer/events
DETAIL:  /projects/:projectId/events/:eventId → /projects/:projectId/explorer/events/:eventId
```

---

## Integration Checklist

- [ ] **Review** `src/routes.legacy.tsx` to understand all redirects
- [ ] **Choose** integration method (simple vs advanced)
- [ ] **Test** all old URL patterns in development
- [ ] **Update** any hardcoded navigation links in code
- [ ] **Update** E2E test URLs
- [ ] **Deploy** and monitor
- [ ] **Set** 4-week deprecation period
- [ ] **Communicate** changes to team

---

## Common Paths to Update

### In Navigation Components
```typescript
// BEFORE
to={`/projects/${projectId}/connections`}
to={`/projects/${projectId}/triggers`}
to={`/projects/${projectId}/variables`}

// AFTER
to={`/projects/${projectId}/explorer/settings/connections`}
to={`/projects/${projectId}/explorer/settings/triggers`}
to={`/projects/${projectId}/explorer/settings/variables`}
```

### In useNavigate Calls
```typescript
// BEFORE
navigate(`/projects/${projectId}/connections/add`);
navigate(`/projects/${projectId}/connections/${id}/edit`);

// AFTER
navigate(`/projects/${projectId}/explorer/settings/connections/new`);
navigate(`/projects/${projectId}/explorer/settings/connections/${id}/edit`);
```

### In E2E Tests
```typescript
// BEFORE
await page.goto(`/projects/${projectId}/connections`);

// AFTER
await page.goto(`/projects/${projectId}/explorer/settings/connections`);
```

---

## Files to Know

| File | Purpose |
|------|---------|
| `src/routes.tsx` | Main route definitions |
| `src/routes.legacy.tsx` | **USE THIS** for legacy redirects |
| `src/app.tsx` | App component using routes |
| `ROUTE_MIGRATION.md` | Detailed mapping guide |
| `ROUTES_COMPARISON.md` | Visual comparison |
| `INTEGRATION_GUIDE.md` | How to integrate |
| `ROUTE_REFACTOR_SUMMARY.md` | Overview |

---

## 30-Second Summary

**What changed:**
- Flat routes → hierarchical under `/explorer/settings/`
- Settings now in drawer interface
- New delete operations added

**User Impact:**
- Old URLs redirect automatically ✓
- No data loss ✓
- Bookmarks updated on first access ✓

**Developer Impact:**
- Update hardcoded navigation links
- Update E2E test URLs
- No backend changes needed

**Quick Fix:**
```typescript
// Add to src/routes.tsx (before catch-all)
import { legacyRoutes } from "@src/routes.legacy";
export const mainRoutes = [...newRoutes, ...legacyRoutes, catchAll];
```

---

## Pattern Recognition

### All Settings Now Follow This Pattern:

```
List:   /explorer/settings/{feature}
Create: /explorer/settings/{feature}/new
Edit:   /explorer/settings/{feature}/:id/edit
Delete: /explorer/settings/{feature}/:id/delete
```

### Event URLs Are Centralized:

```
All events from any feature:
/explorer/events
/explorer/events/:eventId
```

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Hardcode old paths in components
- Forget to update E2E tests
- Add legacy routes before checking main routes
- Mix old and new path patterns

✅ **DO:**
- Use the new paths in all new code
- Update existing navigation links
- Test redirects in development
- Use legacy routes file for backward compatibility

---

## Support

- **Full details:** See `ROUTE_MIGRATION.md`
- **Implementation:** See `INTEGRATION_GUIDE.md`
- **Comparison:** See `ROUTES_COMPARISON.md`
- **Code:** See `src/routes.legacy.tsx`

---

## Quick Test

Try these URLs to verify redirects are working:

```
http://localhost:5173/projects/prj_test/code
→ Should redirect to /projects/prj_test/explorer

http://localhost:5173/projects/prj_test/connections
→ Should redirect to /projects/prj_test/explorer/settings/connections

http://localhost:5173/projects/prj_test/connections/add
→ Should redirect to /projects/prj_test/explorer/settings/connections/new
```

If these work, integration is complete! ✓

---

**Print this page for quick reference during implementation.**
