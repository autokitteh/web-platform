import { useCallback, useRef } from "react";

interface ScreenshotWorkerResponse {
	success: boolean;
	data?: string;
	error?: string;
}

export const useScreenshotWorker = () => {
	const workerRef = useRef<Worker | null>(null);

	const processScreenshot = useCallback((imageData: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			if (!workerRef.current) {
				workerRef.current = new Worker(new URL("../utils/screenshotWorker.ts", import.meta.url), {
					type: "module",
				});
			}

			const handleMessage = (event: MessageEvent<ScreenshotWorkerResponse>) => {
				workerRef.current?.removeEventListener("message", handleMessage);
				workerRef.current?.removeEventListener("error", handleError);

				if (event.data.success && event.data.data) {
					resolve(event.data.data);
				} else {
					reject(new Error(event.data.error || "Failed to process screenshot"));
				}
			};

			const handleError = (error: ErrorEvent) => {
				workerRef.current?.removeEventListener("message", handleMessage);
				workerRef.current?.removeEventListener("error", handleError);
				reject(new Error(error.message || "Worker error"));
			};

			workerRef.current.addEventListener("message", handleMessage);
			workerRef.current.addEventListener("error", handleError);

			workerRef.current.postMessage({
				type: "process",
				imageData,
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
