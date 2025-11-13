import { useCallback, useRef } from "react";

interface ScreenshotWorkerResponse {
	success: boolean;
	data?: string;
	error?: string;
}

interface PendingRequest {
	resolve: (value: string) => void;
	reject: (reason?: Error) => void;
	timeoutId: NodeJS.Timeout;
}

export const useScreenshotWorker = () => {
	const workerRef = useRef<Worker | null>(null);
	const pendingRequestsRef = useRef<Map<string, PendingRequest>>(new Map());
	const requestIdCounterRef = useRef(0);

	const processScreenshot = useCallback((imageData: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			if (!workerRef.current) {
				workerRef.current = new Worker(new URL("../utils/screenshotWorker.ts", import.meta.url), {
					type: "module",
				});

				workerRef.current.addEventListener(
					"message",
					(event: MessageEvent<ScreenshotWorkerResponse & { id: string }>) => {
						const { id } = event.data;
						const pending = pendingRequestsRef.current.get(id);

						if (pending) {
							clearTimeout(pending.timeoutId);
							pendingRequestsRef.current.delete(id);

							if (event.data.success && event.data.data) {
								pending.resolve(event.data.data);
							} else {
								pending.reject(new Error(event.data.error || "Failed to process screenshot"));
							}
						}
					}
				);

				workerRef.current.addEventListener("error", (error: ErrorEvent) => {
					const firstPending = pendingRequestsRef.current.values().next().value as PendingRequest | undefined;
					if (firstPending) {
						clearTimeout(firstPending.timeoutId);
						firstPending.reject(new Error(error.message || "Worker error"));
					}
					pendingRequestsRef.current.clear();
				});
			}

			const requestId = `${Date.now()}-${++requestIdCounterRef.current}`;
			const timeoutId = setTimeout(() => {
				pendingRequestsRef.current.delete(requestId);
				reject(new Error("Screenshot processing timeout"));
			}, 30000);

			pendingRequestsRef.current.set(requestId, { resolve, reject, timeoutId });

			workerRef.current.postMessage({
				type: "process",
				imageData,
				id: requestId,
			});
		});
	}, []);

	const terminate = useCallback(() => {
		if (workerRef.current) {
			workerRef.current.terminate();
			workerRef.current = null;
		}
	}, []);

	return { processScreenshot, terminate };
};
