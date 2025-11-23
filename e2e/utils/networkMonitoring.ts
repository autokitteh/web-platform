/* eslint-disable no-console */
import type { Page } from "@playwright/test";

export interface NetworkRequest {
	headers: Record<string, string>;
	method: string;
	postData?: string;
	timestamp: number;
	url: string;
}

export interface NetworkResponse {
	body?: string;
	headers: Record<string, string>;
	status: number;
	statusText: string;
	timestamp: number;
	url: string;
}

export interface NetworkCapture {
	attemptNumber: number;
	clickTimestamp: number;
	requests: NetworkRequest[];
	responses: NetworkResponse[];
}

export function createNetworkListeners(page: Page) {
	const requests: NetworkRequest[] = [];
	const responses: NetworkResponse[] = [];

	const requestListener = (request: any) => {
		const url = request.url();
		const method = request.method();
		const headers = request.headers();
		const postData = request.postData();

		const timestamp = Date.now();
		requests.push({
			url,
			method,
			postData: postData || undefined,
			headers: Object.fromEntries(Object.entries(headers)),
			timestamp,
		});
	};

	const responseListener = async (response: any) => {
		const url = response.url();
		const status = response.status();
		const statusText = response.statusText();
		const headers = response.headers();

		let body: string | undefined;
		try {
			body = await response.text();
		} catch {
			body = undefined;
		}

		const timestamp = Date.now();
		responses.push({
			url,
			status,
			statusText,
			headers: Object.fromEntries(Object.entries(headers)),
			body,
			timestamp,
		});
	};

	const startListening = () => {
		page.on("request", requestListener);
		page.on("response", responseListener);
	};

	const stopListening = () => {
		page.off("request", requestListener);
		page.off("response", responseListener);
	};

	return {
		requests,
		responses,
		startListening,
		stopListening,
	};
}

export function logNetworkDiagnostics(allNetworkData: NetworkCapture[], attemptCounter: number, error: unknown): void {
	console.log("\n========================================================");
	console.log("=== FAILURE DIAGNOSTICS: Network Monitoring Summary ===");
	console.log("========================================================");
	console.log(`Total Retry Attempts: ${attemptCounter}`);
	console.log(`Total Network Captures: ${allNetworkData.length}`);

	allNetworkData.forEach((capture, captureIndex) => {
		console.log(`\n--- Attempt #${capture.attemptNumber} (Capture ${captureIndex + 1}) ---`);
		console.log(`Click Timestamp: ${new Date(capture.clickTimestamp).toISOString()}`);
		console.log(`Requests Captured: ${capture.requests.length}`);
		console.log(`Responses Captured: ${capture.responses.length}`);

		if (capture.requests.length > 0) {
			console.log("\nRequests (ordered by time):");
			capture.requests.forEach((req, index) => {
				const timeSinceClick = req.timestamp - capture.clickTimestamp;
				console.log(`  ${index + 1}. [+${timeSinceClick}ms] ${req.method} ${req.url}`);
				if (req.postData) {
					console.log(
						`     Body: ${req.postData.substring(0, 200)}${req.postData.length > 200 ? "..." : ""}`
					);
				}
			});
		}

		if (capture.responses.length > 0) {
			console.log("\nResponses (ordered by time):");
			capture.responses.forEach((resp, index) => {
				const timeSinceClick = resp.timestamp - capture.clickTimestamp;
				console.log(`  ${index + 1}. [+${timeSinceClick}ms] ${resp.status} ${resp.statusText} ${resp.url}`);
				if (resp.body && resp.body.length < 500) {
					console.log(`     Body: ${resp.body}`);
				} else if (resp.body) {
					console.log(`     Body: (${resp.body.length} chars, first 200): ${resp.body.substring(0, 200)}...`);
				}
				const contentType = resp.headers["content-type"] || resp.headers["Content-Type"];
				if (contentType) {
					console.log(`     Content-Type: ${contentType}`);
				}
			});
		}

		const refreshRelatedRequests = capture.requests.filter(
			(req) => req.timestamp >= capture.clickTimestamp && req.timestamp < capture.clickTimestamp + 100
		);
		if (refreshRelatedRequests.length > 0) {
			console.log("\nLikely Refresh-Related Requests:");
			refreshRelatedRequests.forEach((req) => {
				const matchingResponse = capture.responses.find((resp) => resp.url === req.url);
				console.log(`  ${req.method} ${req.url}`);
				if (matchingResponse) {
					console.log(`    → Response: ${matchingResponse.status} ${matchingResponse.statusText}`);
				} else {
					console.log(`    → Response: (no matching response found)`);
				}
			});
		}
	});

	console.log("\n========================================================");
	console.log(`Error Details: ${error}`);
	console.log("========================================================\n");
}
