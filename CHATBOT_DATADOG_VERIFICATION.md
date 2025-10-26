# Chatbot Datadog Verification Guide

## How to Know for Sure When Chatbot Datadog is Ready

### Overview
The chatbot sends a `DATADOG_READY` event to the parent after:
1. Datadog RUM is initialized
2. Session ID is confirmed (async creation complete)
3. Cookie sharing is verified (if applicable)

This happens approximately **300ms after initial load** to account for async session creation.

---

## Verification Methods

### **Method 1: Console Logging (Quickest)**

#### **In Chatbot Console (iframe):**
```javascript
// You should see this sequence:
[Datadog Init] Initializing Datadog RUM
[Datadog Init] Datadog RUM initialized successfully
[Datadog Init] Current session ID after init: { ... }
[Datadog Init] Datadog Logs initialized successfully
[Datadog Init] ✅ Datadog fully ready, session ID confirmed: abc-123-session-id
[Datadog Init] Sent DATADOG_READY event to parent
```

**Timing:** ~300-500ms after iframe loads

#### **In Parent Console:**
```javascript
// You should see:
[Chatbot Datadog Status] ✅ Chatbot Datadog is ready: {
  sessionId: "abc-123-session-id",
  timestamp: "2025-10-26T12:30:00.000Z",
  service: "ai-chatbot"
}
```

**Key Indicator:** If you see both logs, Datadog is **100% ready** in the chatbot.

---

### **Method 2: React Hook (Programmatic)**

Use the `useChatbotDatadogStatus` hook in any parent component:

```typescript
import { useChatbotDatadogStatus } from "@hooks";

const YourComponent = () => {
  const chatbotDatadog = useChatbotDatadogStatus();

  useEffect(() => {
    if (chatbotDatadog.isReady) {
      console.log("✅ Chatbot Datadog ready!", chatbotDatadog.sessionId);
      // Now you can safely track chatbot events in Datadog
    }
  }, [chatbotDatadog.isReady]);

  return (
    <div>
      {chatbotDatadog.isReady ? (
        <span>Chatbot Datadog: ✅ Ready (Session: {chatbotDatadog.sessionId?.substring(0, 8)}...)</span>
      ) : (
        <span>Chatbot Datadog: ⏳ Initializing...</span>
      )}
    </div>
  );
};
```

---

### **Method 3: Visual Indicator (User-Facing)**

#### **Option A: Add to Chatbot Toolbar**

Modify `src/components/organisms/chatbotIframe/chatbotToolbar.tsx`:

```typescript
import { useChatbotDatadogStatus } from "@hooks";

export const ChatbotToolbar = ({ hideCloseButton }: ChatbotToolbarProps) => {
  const chatbotDatadog = useChatbotDatadogStatus();

  return (
    <div className="flex items-center justify-between">
      {/* Existing toolbar content */}

      {/* Datadog status indicator (only in dev/staging) */}
      {process.env.NODE_ENV !== "production" && (
        <div className="text-xs">
          {chatbotDatadog.isReady ? (
            <span className="text-green-500">🟢 Datadog</span>
          ) : (
            <span className="text-yellow-500">🟡 Datadog</span>
          )}
        </div>
      )}
    </div>
  );
};
```

#### **Option B: Add to ChatbotIframe Component**

Modify `src/components/organisms/chatbotIframe/chatbotIframe.tsx`:

```typescript
import { useChatbotDatadogStatus } from "@hooks";

export const ChatbotIframe = ({ ... }: ChatbotIframeProps) => {
  const chatbotDatadog = useChatbotDatadogStatus();

  useEffect(() => {
    if (chatbotDatadog.isReady) {
      console.log("[ChatbotIframe] ✅ Chatbot Datadog confirmed ready");

      // Optional: Verify session IDs match
      const parentSessionId = DatadogUtils.getSessionId();
      if (parentSessionId === chatbotDatadog.sessionId) {
        console.log("[ChatbotIframe] ✅ Session IDs match - unified session confirmed");
      } else {
        console.warn("[ChatbotIframe] ⚠️ Session ID mismatch:", {
          parent: parentSessionId,
          chatbot: chatbotDatadog.sessionId,
        });
      }
    }
  }, [chatbotDatadog.isReady, chatbotDatadog.sessionId]);

  return (
    <div className={frameClass}>
      {/* Existing content */}
    </div>
  );
};
```

---

## Timeline & Guarantees

### **Expected Timeline:**
```
0ms     → Iframe starts loading
100ms   → Chatbot React app renders
150ms   → DatadogInit useEffect runs
200ms   → datadogRum.init() completes
300ms   → Session ID available (async)
300ms   → DATADOG_READY event sent to parent
350ms   → Parent receives event and updates status
```

**Total Time:** ~300-500ms from iframe load to confirmed ready state

---

## Verification Checklist

When you see **ALL** of these, Datadog is 100% ready in chatbot:

### ✅ **In Chatbot Console:**
- [ ] `[Datadog Init] Datadog RUM initialized successfully`
- [ ] `[Datadog Init] ✅ Datadog fully ready, session ID confirmed`
- [ ] `[Datadog Init] Sent DATADOG_READY event to parent`

### ✅ **In Parent Console:**
- [ ] `[Chatbot Datadog Status] ✅ Chatbot Datadog is ready`
- [ ] Session ID is not `undefined`

### ✅ **In Datadog Dashboard:**
- [ ] See events from `service: ai-chatbot`
- [ ] Session ID matches parent (if using unified session)
- [ ] Session replay shows iframe content

---

## Troubleshooting

### **Issue: No DATADOG_READY event received**

**Possible Causes:**
1. Iframe didn't load (check network tab)
2. Parent-iframe communication not connected (check handshake logs)
3. Datadog credentials missing in chatbot env vars

**Debug:**
```javascript
// In parent console:
iframeCommService.isConnectedToIframe
// Should return: true

// In chatbot console:
window.DD_RUM
// Should return: {...} (not undefined)
```

---

### **Issue: Session ID still undefined after delay**

**Possible Causes:**
1. Datadog credentials invalid
2. Cookie was blocked by browser
3. Third-party cookie restrictions

**Debug:**
```javascript
// In chatbot console:
datadogRum.getInternalContext()
// Check what's returned

document.cookie
// Check if _dd_s cookie exists
```

---

### **Issue: Sessions don't match (parent vs chatbot)**

**Possible Causes:**
1. Duplicate `_dd_s` cookies (host-only + subdomain)
2. Cookie sharing not configured correctly
3. Browser blocking cross-site cookies

**Fix:**
1. Clear all `_dd_s` cookies
2. Verify parent has `trackSessionAcrossSubdomains: true`
3. Check cookie `domain=.autokitteh.cloud` (with leading dot)

---

## Production Monitoring

### **Add to Application Monitoring:**

```typescript
// Track Datadog readiness as a custom metric
useEffect(() => {
  if (chatbotDatadog.isReady) {
    // Send to your monitoring service
    analytics.track("chatbot_datadog_ready", {
      sessionId: chatbotDatadog.sessionId,
      timestamp: chatbotDatadog.timestamp,
      duration: Date.now() - pageLoadTime,
    });
  }
}, [chatbotDatadog.isReady]);
```

### **Set up Datadog Alert:**

In Datadog dashboard, create an alert for:
- Missing `DATADOG_READY` events after iframe load
- Session ID mismatches between parent and chatbot
- Delayed session creation (>1s)

---

## Quick Reference

| Indicator | Location | Meaning |
|-----------|----------|---------|
| `✅ Datadog fully ready` | Chatbot console | Session ID confirmed, ready to track |
| `DATADOG_READY event` | Parent console | Parent received confirmation |
| `isReady: true` | `useChatbotDatadogStatus()` hook | Programmatic confirmation |
| `sessions_match: true` | Either console | Unified session working correctly |

**Golden Rule:** When you see the `DATADOG_READY` event in parent console with a valid session ID, the chatbot is **guaranteed ready** for Datadog tracking.
