// DETAILED DATADOG DIAGNOSTIC
// Run this on BOTH staging and production, then compare results

console.log("\n=== DETAILED DATADOG DIAGNOSTIC ===\n");

// 1. Environment Info
console.log("1. ENVIRONMENT:");
console.log("   URL:", window.location.href);
console.log("   Protocol:", window.location.protocol);
console.log("   Hostname:", window.location.hostname);
console.log("   isSecureContext:", window.isSecureContext);

// 2. Datadog SDK Info
console.log("\n2. DATADOG SDK:");
if (window.DD_RUM) {
	console.log("   ✅ DD_RUM exists");
	console.log("   Version:", window.DD_RUM.version);

	// Try to get context multiple times with delays
	const checkContext = () => {
		try {
			const ctx = window.DD_RUM.getInternalContext();
			return {
				exists: !!ctx,
				sessionId: ctx?.session_id,
				viewId: ctx?.view?.id,
				applicationId: ctx?.application_id,
				fullContext: ctx,
			};
		} catch (e) {
			return { error: e.message };
		}
	};

	console.log("   Immediate context:", checkContext());

	// Check again after 500ms
	setTimeout(() => {
		console.log("\n   Context after 500ms:", checkContext());
	}, 500);

	// Check again after 2 seconds
	setTimeout(() => {
		console.log("\n   Context after 2s:", checkContext());
	}, 2000);

	// Check again after 5 seconds
	setTimeout(() => {
		console.log("\n   Context after 5s:", checkContext());
	}, 5000);
} else {
	console.log("   ❌ DD_RUM does not exist");
}

// 3. Check localStorage/sessionStorage for Datadog data
console.log("\n3. STORAGE:");
try {
	const ddKeys = Object.keys(localStorage).filter((k) => k.includes("dd") || k.includes("datadog"));
	console.log("   localStorage DD keys:", ddKeys);
	ddKeys.forEach((key) => {
		const value = localStorage.getItem(key);
		console.log(`   - ${key}:`, value?.substring(0, 100));
	});
} catch (e) {
	console.log("   ❌ localStorage error:", e.message);
}

// 4. Check cookies for Datadog
console.log("\n4. COOKIES:");
const cookies = document.cookie.split(";").filter((c) => c.includes("dd") || c.includes("datadog"));
console.log("   DD cookies:", cookies.length > 0 ? cookies : "None found");

// 5. Check Network requests
console.log("\n5. NETWORK REQUESTS:");
console.log('   Open Network tab and filter for "datadoghq"');
console.log("   Look for:");
console.log("   - Requests to browser-intake-datadoghq.com");
console.log("   - Status codes (200, 202, 401, etc.)");
console.log("   - Request payload (should contain session info)");

// 6. Check Performance API for Datadog requests
try {
	const ddRequests = performance.getEntriesByType("resource").filter((r) => r.name.includes("datadoghq"));
	console.log("\n6. PERFORMANCE API:");
	console.log("   DD requests found:", ddRequests.length);
	ddRequests.slice(0, 5).forEach((r) => {
		console.log(`   - ${r.name.split("?")[0]}`);
		console.log(`     Duration: ${r.duration.toFixed(2)}ms, Size: ${r.transferSize || 0} bytes`);
	});
} catch (e) {
	console.log("\n6. PERFORMANCE API: Error -", e.message);
}

// 7. Browser Info
console.log("\n7. BROWSER:");
console.log("   UserAgent:", navigator.userAgent);
console.log("   cookieEnabled:", navigator.cookieEnabled);
console.log("   doNotTrack:", navigator.doNotTrack);

// 8. Check for privacy extensions
console.log("\n8. PRIVACY CHECK:");
console.log("   Check browser extensions - disable ad blockers/privacy extensions and retry");

// 9. Console errors
console.log("\n9. CONSOLE ERRORS:");
console.log("   Check console for any Datadog-related errors above");

// 10. Test session replay specifically
console.log("\n10. SESSION REPLAY CHECK:");
if (window.DD_RUM) {
	try {
		// Force a custom action to trigger recording
		window.DD_RUM.addAction("diagnostic_test_action", {
			timestamp: Date.now(),
			test: true,
		});
		console.log("   ✅ Sent test action");
	} catch (e) {
		console.log("   ❌ Error sending action:", e.message);
	}
}

console.log("\n=== END DIAGNOSTIC ===");
console.log("\nℹ️  Wait 5 seconds for delayed context checks to complete");
console.log("ℹ️  Then check Network tab for any new requests to datadoghq.com\n");
