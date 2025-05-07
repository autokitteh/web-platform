import React, { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { iframeCommService } from "@services/iframeComm.service";
import { aiChatbotUrl } from "@src/constants";
import { useOrganizationStore, useToastStore } from "@src/store";
import { MessageTypes } from "@type/iframe-communication.type";

import { Button, Loader } from "@components/atoms";

interface AkbotIframeProps {
	title?: string;
	width?: string | number;
	height?: string | number;
	className?: string;
	onConnect?: () => void;
}

export const AkbotIframe: React.FC<AkbotIframeProps> = ({
	title,
	width = "100%",
	height = "100%",
	className,
	onConnect,
}) => {
	const botIframeUrl = aiChatbotUrl;
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const { user } = useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);

	const token = user?.token || "";
	const navigate = useNavigate();

	useEffect(() => {
		const navigationListener = iframeCommService.addListener(MessageTypes.EVENT, (message) => {
			if (message.data.eventName === "NAVIGATE_TO_PROJECT") {
				const { projectId, projectName } = message.data.payload;
				if (projectId) {
					navigate(`/projects/${projectId}`);
				}
			}
		});

		return () => {
			iframeCommService.removeListener(navigationListener);
		};
	}, [navigate]);

	useEffect(() => {
		if (iframeRef.current) {
			console.log("[DEBUG] Setting up iframe connection");
			iframeCommService.setIframe(iframeRef.current);

			// Set a timeout to detect if connection fails
			const timeoutId = setTimeout(() => {
				if (isLoading) {
					console.log("[DEBUG] Connection timeout reached");
					handleIframeError();
				}
			}, 15000); // 15 seconds timeout

			iframeCommService
				.waitForConnection()
				.then(() => {
					console.log("[DEBUG] Connection established successfully");
					clearTimeout(timeoutId);
					setIsLoading(false);
					setLoadError(null);
					if (onConnect) {
						onConnect();
					}
					return true;
				})
				.catch((error) => {
					console.error("[DEBUG] Connection failed:", error);
					clearTimeout(timeoutId);
					handleIframeError();
				});

			return () => {
				console.log("[DEBUG] Cleaning up iframe connection");
				clearTimeout(timeoutId);
				iframeCommService.destroy();
			};
		}
	}, [onConnect]);

	// Handle iframe load error
	const handleIframeError = () => {
		console.log("[DEBUG] Handling iframe error");
		setIsLoading(false);
		setLoadError("Failed to load assistant. The service might be unavailable.");
		addToast({
			message: "Failed to connect to AI assistant",
			type: "error",
		});
	};

	// Retry loading the iframe
	const handleRetry = () => {
		console.log("[DEBUG] Retrying iframe connection");
		setIsLoading(true);
		setLoadError(null);
		if (iframeRef.current) {
			iframeRef.current.src = `${botIframeUrl}?token=${token}&t=${Date.now()}`;
		}
	};

	return (
		<div className="flex size-full flex-col items-center justify-center">
			{isLoading ? (
				<div className="flex size-full flex-col items-center justify-center">
					<div className="flex size-24 items-center justify-center rounded-full bg-gray-1250 p-2">
						<Loader className="mr-10" size="lg" />
					</div>
					<div className="mt-16 text-gray-500">Loading assistant...</div>
				</div>
			) : loadError ? (
				<div className="flex size-full flex-col items-center justify-center">
					<div className="mb-4 text-error">{loadError}</div>
					<Button
						ariaLabel="Retry loading assistant"
						className="border-white px-4 py-2 font-semibold text-white hover:bg-black"
						onClick={handleRetry}
						variant="outline"
					>
						Retry
					</Button>
				</div>
			) : null}
			{!loadError ? (
				<iframe
					className={className}
					height={height}
					onError={handleIframeError}
					ref={iframeRef}
					src={aiChatbotUrl}
					style={{
						border: "none",
						position: isLoading ? "absolute" : "relative",
						visibility: isLoading ? "hidden" : "visible",
					}}
					title={title}
					width={width}
				/>
			) : null}
		</div>
	);
};

export default AkbotIframe;
