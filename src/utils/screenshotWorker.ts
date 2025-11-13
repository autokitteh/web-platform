interface ScreenshotWorkerMessage {
	type: "process";
	imageData: string;
	id: string;
}

interface ScreenshotWorkerResponse {
	success: boolean;
	data?: string;
	error?: string;
	id: string;
}

self.onmessage = async (event: MessageEvent<ScreenshotWorkerMessage>) => {
	const { type, imageData, id } = event.data;

	if (type === "process") {
		try {
			let quality = 0.85;
			let screenshotData = imageData;

			while (screenshotData.length > 600 * 1024 && quality > 0.15) {
				quality -= 0.1;
				const img = new Image();
				img.src = screenshotData;

				await new Promise((resolve, reject) => {
					img.onload = resolve;
					img.onerror = reject;
				});

				const canvas = new OffscreenCanvas(img.width, img.height);
				const ctx = canvas.getContext("2d");
				if (!ctx) throw new Error("Failed to get canvas context");

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
				id,
			};
			self.postMessage(response);
		} catch (error) {
			const response: ScreenshotWorkerResponse = {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
				id,
			};
			self.postMessage(response);
		}
	}
};
