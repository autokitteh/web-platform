interface ScreenshotWorkerMessage {
	type: "process";
	imageData: string;
}

interface ScreenshotWorkerResponse {
	success: boolean;
	data?: string;
	error?: string;
}

self.onmessage = async (event: MessageEvent<ScreenshotWorkerMessage>) => {
	const { type, imageData } = event.data;

	if (type === "process") {
		try {
			let quality = 0.85;
			let screenshotData = imageData;

			while (screenshotData.length > 600 * 1024 && quality > 0.15) {
				quality -= 0.1;
				const canvas = new OffscreenCanvas(1, 1);
				const ctx = canvas.getContext("2d");
				if (!ctx) throw new Error("Failed to get canvas context");

				const img = new Image();
				img.src = imageData;

				await new Promise((resolve, reject) => {
					img.onload = resolve;
					img.onerror = reject;
				});

				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);

				const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
				screenshotData = await new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(blob);
				});
			}

			const response: ScreenshotWorkerResponse = {
				success: true,
				data: screenshotData,
			};
			self.postMessage(response);
		} catch (error) {
			const response: ScreenshotWorkerResponse = {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
			self.postMessage(response);
		}
	}
};
