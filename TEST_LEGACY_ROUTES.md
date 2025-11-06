# Test Legacy Routes - Verification Guide

## Quick Test Instructions

### Test 1: Main Issue - Code Route
**Steps:**
1. Visit: `http://localhost:8000/projects/prj_01k8tm2v41exsa1101cqagpchv/code`
2. Observe the redirect

**Expected Result:**
- ✅ URL changes to: `/projects/prj_01k8tm2v41exsa1101cqagpchv/explorer`
- ✅ Page renders with Project Explorer view
- ✅ NO 404 error
- ✅ No `/code/explorer` intermediate redirect

**Pass/Fail:** ___________

---

### Test 2: Other Legacy Routes

**Test 2a - Connections**
```
Visit:     http://localhost:8000/projects/prj_xxx/connections
Expected:  → /projects/prj_xxx/explorer/settings/connections
Result:    ✅ Works / ❌ 404
```

**Test 2b - Triggers**
```
Visit:     http://localhost:8000/projects/prj_xxx/triggers
Expected:  → /projects/prj_xxx/explorer/settings/triggers
Result:    ✅ Works / ❌ 404
```

**Test 2c - Variables**
```
Visit:     http://localhost:8000/projects/prj_xxx/variables
Expected:  → /projects/prj_xxx/explorer/settings/variables
Result:    ✅ Works / ❌ 404
```

**Test 2d - Events**
```
Visit:     http://localhost:8000/projects/prj_xxx/events
Expected:  → /projects/prj_xxx/explorer/events
Result:    ✅ Works / ❌ 404
```

---

### Test 3: Browser Developer Tools

**Steps:**
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Visit: `http://localhost:8000/projects/prj_xxx/code`
4. Check the requests

**Expected:**
- ✅ One redirect request (type: document)
- ✅ Final URL: `/projects/prj_xxx/explorer`
- ✅ Status: 200 OK
- ✅ No failed requests

---

### Test 4: Browser History

**Steps:**
1. Visit: `http://localhost:8000/projects/prj_xxx/code`
2. Page loads explorer view
3. Click browser back button

**Expected:**
- ✅ Goes back to previous page
- ✅ Does NOT loop or get stuck on `/code`
- ✅ Clean history navigation

**Pass/Fail:** ___________

---

### Test 5: Console Errors

**Steps:**
1. Open Browser Console (F12 → Console tab)
2. Visit: `http://localhost:8000/projects/prj_xxx/code`
3. Check for errors

**Expected:**
- ✅ No red error messages
- ✅ No 404 warnings
- ✅ No navigation errors
- ⚠️ May have info/debug logs (acceptable)

**Pass/Fail:** ___________

---

## Comprehensive Test URLs

Replace `prj_xxx` with an actual project ID:

```
CONNECTIONS TESTS:
  /projects/prj_xxx/connections
  /projects/prj_xxx/connections/add
  /projects/prj_xxx/connections/:id/edit
  /projects/prj_xxx/connections/:id/events

TRIGGERS TESTS:
  /projects/prj_xxx/triggers
  /projects/prj_xxx/triggers/add
  /projects/prj_xxx/triggers/:id/edit
  /projects/prj_xxx/triggers/:id/events

VARIABLES TESTS:
  /projects/prj_xxx/variables
  /projects/prj_xxx/variables/add
  /projects/prj_xxx/variables/edit/:name

EVENTS TESTS:
  /projects/prj_xxx/events
  /projects/prj_xxx/events/:eventId

CODE TESTS:
  /projects/prj_xxx/code
```

---

## Test Checklist

- [ ] Test 1: Main issue (code route) works
- [ ] Test 2a: Connections route works
- [ ] Test 2b: Triggers route works
- [ ] Test 2c: Variables route works
- [ ] Test 2d: Events route works
- [ ] Test 3: Network shows single redirect (not double)
- [ ] Test 4: Browser history is clean
- [ ] Test 5: No console errors
- [ ] All redirects render correctly
- [ ] No 404 pages anywhere

---

## Troubleshooting

### If you see 404:
1. Check that project ID is valid
2. Check that you're using correct URL format
3. Clear browser cache (Ctrl+Shift+Delete)
4. Restart dev server if needed
5. Check console for errors

### If URL doesn't change:
1. Check Network tab in DevTools
2. Look for redirect status codes (301, 302, 307)
3. Check if JavaScript is enabled
4. Try in incognito mode

### If route loops or hangs:
1. Check browser history
2. Open Network tab
3. Look for repeated redirects
4. Check DevTools console for infinite loop warning

---

## Success Criteria

✅ **All tests should pass with:**
- No 404 errors
- Clean URL redirects (no appending)
- Correct page rendering
- No console errors
- Clean browser history

---

## Test Results

**Date Tested:** ___________
**Tester Name:** ___________
**Overall Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
[Space for additional notes]
```

---

## Related Files

- **FINAL_FIX_SUMMARY.md** - What was fixed
- **LEGACY_ROUTES_FINAL.md** - Implementation details
- **README_LEGACY_ROUTES.md** - Quick reference

---

**Test Version:** 1.0
**Created:** 2025-11-06
**Status:** Ready for testing
