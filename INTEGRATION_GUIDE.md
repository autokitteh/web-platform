# Legacy Routes Integration Guide

## How to Integrate Legacy Routes

### Option 1: Add to Main Routes (Recommended for Full Rollout)

If you want to support legacy routes alongside the new routes:

**File:** `src/routes.tsx`

```typescript
// At the end of mainRoutes array, before the catch-all route
import { legacyRoutes } from "@src/routes.legacy";

export const mainRoutes = [
  // ... existing routes ...

  // Legacy route redirects (add before catch-all)
  ...legacyRoutes,

  // Catch-all
  { path: "*", element: <Navigate replace to="/404" /> },
];
```

### Option 2: Separate Legacy Routes Component (For Gradual Rollout)

If you want to gradually migrate routes:

**File:** `src/app.tsx`

```typescript
import { mainRoutes } from "@src/routes";
import { legacyRoutes } from "@src/routes.legacy";

export const App = () => {
  // ... existing code ...

  const allRoutes = useMemo(() => {
    // Only include legacy routes in development or if feature flag enabled
    const isDevelopment = import.meta.env.DEV;
    const enableLegacyRoutes = isDevelopment || // Enable in dev
      localStorage.getItem("enable_legacy_routes") === "true";

    return enableLegacyRoutes
      ? [...mainRoutes.slice(0, -1), ...legacyRoutes, mainRoutes[mainRoutes.length - 1]]
      : mainRoutes;
  }, []);

  const mainElement = useRoutes(allRoutes, location);

  // ... rest of component ...
};
```

### Option 3: Middleware-Based Redirect (Most Elegant)

For automatic URL rewriting before routing:

**File:** `src/hooks/useLegacyRouteRedirect.ts`

```typescript
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LEGACY_REDIRECTS = {
  "/projects/:projectId/code": "/projects/:projectId/explorer",
  "/projects/:projectId/connections": "/projects/:projectId/explorer/settings/connections",
  "/projects/:projectId/connections/add": "/projects/:projectId/explorer/settings/connections/new",
  "/projects/:projectId/triggers": "/projects/:projectId/explorer/settings/triggers",
  "/projects/:projectId/triggers/add": "/projects/:projectId/explorer/settings/triggers/new",
  "/projects/:projectId/variables": "/projects/:projectId/explorer/settings/variables",
  "/projects/:projectId/variables/add": "/projects/:projectId/explorer/settings/variables/new",
  "/projects/:projectId/events": "/projects/:projectId/explorer/events",
} as const;

export const useLegacyRouteRedirect = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    for (const [oldPath, newPath] of Object.entries(LEGACY_REDIRECTS)) {
      if (pathname.startsWith(oldPath.replace(":projectId", ""))) {
        const projectId = pathname.match(/\/projects\/([^/]+)/)?.[1];
        if (projectId) {
          const redirectPath = newPath.replace(":projectId", projectId);
          navigate(redirectPath, { replace: true });
          break;
        }
      }
    }
  }, [pathname, navigate]);
};
```

**Usage in App.tsx:**

```typescript
export const App = () => {
  // ... existing code ...

  useLegacyRouteRedirect(); // Add this line

  const mainElement = useRoutes(mainRoutes, location);

  // ... rest of component ...
};
```

## Testing Legacy Routes

### Manual Testing

```bash
# Test old code route
http://localhost:5173/projects/prj_01k8tmmn0red7vk9z0hzs2578n/code
# Should redirect to:
http://localhost:5173/projects/prj_01k8tmmn0red7vk9z0hzs2578n/explorer

# Test old connections route
http://localhost:5173/projects/prj_01k8tmmn0red7vk9z0hzs2578n/connections
# Should redirect to:
http://localhost:5173/projects/prj_01k8tmmn0red7vk9z0hzs2578n/explorer/settings/connections
```

### Automated Testing

**File:** `e2e/legacy-routes.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Legacy Route Redirects", () => {
  const projectId = "prj_01k8tmmn0red7vk9z0hzs2578n";
  const baseUrl = "http://localhost:5173";

  test("redirects /code to /explorer", async ({ page }) => {
    await page.goto(`${baseUrl}/projects/${projectId}/code`);
    expect(page.url()).toContain("/explorer");
  });

  test("redirects /connections to /explorer/settings/connections", async ({ page }) => {
    await page.goto(`${baseUrl}/projects/${projectId}/connections`);
    expect(page.url()).toContain("/explorer/settings/connections");
  });

  test("redirects /triggers to /explorer/settings/triggers", async ({ page }) => {
    await page.goto(`${baseUrl}/projects/${projectId}/triggers`);
    expect(page.url()).toContain("/explorer/settings/triggers");
  });

  test("redirects /variables to /explorer/settings/variables", async ({ page }) => {
    await page.goto(`${baseUrl}/projects/${projectId}/variables`);
    expect(page.url()).toContain("/explorer/settings/variables");
  });

  test("redirects /connections/add to /connections/new", async ({ page }) => {
    await page.goto(`${baseUrl}/projects/${projectId}/connections/add`);
    expect(page.url()).toContain("/settings/connections/new");
  });

  test("redirects /events to /explorer/events", async ({ page }) => {
    await page.goto(`${baseUrl}/projects/${projectId}/events`);
    expect(page.url()).toContain("/explorer/events");
  });
});
```

Run tests with:
```bash
npm run test:e2e -- e2e/legacy-routes.spec.ts
```

## Monitoring & Analytics

### Tracking Legacy Route Usage

Add analytics tracking to know when users are still using old links:

**File:** `src/hooks/useLegacyRouteTracking.ts`

```typescript
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ga4 from "react-ga4";

const LEGACY_PATTERNS = [
  /\/projects\/[^/]+\/code/,
  /\/projects\/[^/]+\/connections/,
  /\/projects\/[^/]+\/triggers/,
  /\/projects\/[^/]+\/variables/,
];

export const useLegacyRouteTracking = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (LEGACY_PATTERNS.some(pattern => pattern.test(pathname))) {
      ga4.event("legacy_route_accessed", {
        path: pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, [pathname]);
};
```

## Rollout Strategy

### Phase 1: Testing (1-2 days)
- [ ] Enable legacy routes in development
- [ ] Run manual tests on all old route patterns
- [ ] Run automated tests
- [ ] Verify no conflicts with new routes

### Phase 2: Staging (1-2 days)
- [ ] Deploy to staging environment
- [ ] Test with actual backend
- [ ] Verify redirects work correctly
- [ ] Check analytics integration

### Phase 3: Production (1 day)
- [ ] Deploy with legacy routes enabled
- [ ] Monitor analytics for legacy route usage
- [ ] Set 2-4 week deprecation window
- [ ] Communicate route changes to users

### Phase 4: Deprecation (After 4 weeks)
- [ ] Remove legacy routes code
- [ ] Monitor for any broken links
- [ ] Update documentation

## Debugging

### Check if Legacy Routes are Active

```javascript
// In browser console
localStorage.setItem("enable_legacy_routes", "true");
location.reload();
```

### Common Issues

**Issue: Redirects not working**
- Verify legacy routes are added to mainRoutes
- Check order of routes (legacy should be before catch-all)
- Ensure path parameters match

**Issue: URL parameters lost**
- Use regex or param extraction in redirect
- Verify route parameter names match

**Issue: History stack too deep**
- Consider using `replace: true` in navigate
- Limit redirect depth to 1 level

## Removal Checklist

When ready to remove legacy routes:

- [ ] Analytics show < 1% legacy route usage
- [ ] No active bookmarks detected
- [ ] Deprecation period has passed (4+ weeks)
- [ ] Team notified
- [ ] Documentation updated
- [ ] Remove `routes.legacy.tsx`
- [ ] Remove legacy tracking code
- [ ] Update this guide

## Questions?

For questions about route migration:
1. Check `ROUTE_MIGRATION.md` for detailed mapping
2. Review `routes.legacy.tsx` for implementation
3. Check related components in `src/components/organisms/`
