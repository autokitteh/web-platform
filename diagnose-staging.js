// Run this in staging console to diagnose the issue

console.log("\n=== STAGING DATADOG DIAGNOSIS ===\n");

// 1. Check browser storage access
console.log("1. Storage Access:");
try {
	localStorage.setItem("test", "test");
	localStorage.removeItem("test");
	console.log("  ✅ localStorage: OK");
} catch (e) {
	console.log("  ❌ localStorage: BLOCKED -", e.message);
}

try {
	sessionStorage.setItem("test", "test");
	sessionStorage.removeItem("test");
	console.log("  ✅ sessionStorage: OK");
} catch (e) {
	console.log("  ❌ sessionStorage: BLOCKED -", e.message);
}

// 2. Check cookies
console.log("\n2. Cookie Access:");
try {
	document.cookie = "test=value; path=/; SameSite=Lax";
	const canSetCookie = document.cookie.includes("test=value");
	console.log("  ✅ Can set cookies:", canSetCookie);
	document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
} catch (e) {
	console.log("  ❌ Cookies: BLOCKED -", e.message);
}

// 3. Check CSP headers
console.log("\n3. Content Security Policy:");
fetch(window.location.href)
	.then((response) => {
		const csp = response.headers.get("Content-Security-Policy");
		const cspReport = response.headers.get("Content-Security-Policy-Report-Only");
		if (csp) {
			console.log("  ⚠️  CSP Active:", csp);
		} else if (cspReport) {
			console.log("  ⚠️  CSP Report-Only:", cspReport);
		} else {
			console.log("  ✅ No CSP headers");
		}
	})
	.catch((e) => console.log("  ⚠️  Could not check CSP:", e.message));

// 4. Check Datadog endpoints
console.log("\n4. Datadog Endpoint Access:");
const ddEndpoint = "https://browser-intake-datadoghq.com/api/v2/rum";
fetch(ddEndpoint, { method: "HEAD", mode: "no-cors" })
	.then(() => console.log("  ✅ Can reach Datadog endpoint"))
	.catch((e) => console.log("  ❌ Cannot reach Datadog endpoint:", e.message));

// 5. Check third-party contexts
console.log("\n5. Third-Party Context:");
console.log("  Protocol:", window.location.protocol);
console.log("  Secure Context:", window.isSecureContext);
console.log("  Cross-Origin Isolated:", window.crossOriginIsolated);

// 6. Check browser console for CSP violations
console.log("\n6. Check Network tab for:");
console.log("  - Failed requests to datadoghq.com");
console.log("  - CSP violation reports");
console.log("  - Blocked cookies in Application tab");

// 7. Check Datadog SDK state
console.log("\n7. Datadog SDK State:");
if (window.DD_RUM) {
	console.log("  DD_RUM version:", window.DD_RUM.version);
	try {
		const ctx = window.DD_RUM.getInternalContext();
		console.log("  Internal context:", ctx);
	} catch (e) {
		console.log("  ❌ Cannot get internal context:", e.message);
	}
}

console.log("\n=== END DIAGNOSIS ===\n");
