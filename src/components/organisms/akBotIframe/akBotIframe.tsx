/* eslint-disable no-console */
/* eslint-disable promise/always-return */
import React, { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { iframeCommService } from "@services/iframeComm.service";
import { MessageTypes } from "@type/iframe-communication.type";

import { Loader } from "@components/atoms/loader";

interface AkbotIframeProps {
	src: string;
	title?: string;
	width?: string | number;
	height?: string | number;
	className?: string;
	onConnect?: () => void;
}

export const AkbotIframe: React.FC<AkbotIframeProps> = ({
	src,
	title,
	width = "100%",
	height = "100%",
	className,
	onConnect,
}) => {
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Add this in your component that handles akbot iframe

	const navigate = useNavigate(); // Or whatever navigation hook you use

	useEffect(() => {
		// Add a dedicated listener for NAVIGATE_TO_PROJECT events
		const navigationListener = iframeCommService.addListener(MessageTypes.EVENT, (message) => {
			console.log("Received NAVIGATE_TO_PROJECT message:", message);

			if (message.data.eventName === "NAVIGATE_TO_PROJECT") {
				console.log("NAVIGATE_TO_PROJECT event received:", message.data);

				const { projectId, projectName } = message.data.payload;
				if (projectId) {
					console.log(`Navigating to project: ${projectName} (${projectId})`);
					navigate(`/projects/${projectId}`);
				}
			}
		});

		// Clean up the listener on component unmount
		return () => {
			iframeCommService.removeListener(navigationListener);
		};
	}, [navigate]);

	useEffect(() => {
		// Initialize communication with the iframe
		if (iframeRef.current) {
			iframeCommService.setIframe(iframeRef.current);

			// Wait for connection and notify parent
			iframeCommService
				.waitForConnection()
				.then(() => {
					console.log("Connected to akbot iframe");
					setIsLoading(false);
					if (onConnect) {
						onConnect();
					}
				})
				.catch((error) => {
					console.error("Failed to connect to akbot iframe:", error);
					setIsLoading(false); // Still hide loader on error
				});
			return () => {
				iframeCommService.destroy();
			};
		}
	}, [onConnect]);

	return (
		<div className="flex size-full flex-col items-center justify-center">
			{isLoading ? (
				<div className="flex size-full flex-col items-center justify-center">
					<div className="flex size-24 items-center justify-center rounded-full bg-gray-1250 p-2">
						<Loader className="mr-10" size="lg" />
					</div>
					<div className="mt-16 text-gray-500">Loading assistant...</div>
				</div>
			) : null}
			<iframe
				className={`${className}`}
				height={height}
				ref={iframeRef}
				src="http://localhost:3000"
				style={{
					border: "none",
					// opacity: isLoading ? 0 : 1,
					position: isLoading ? "absolute" : "relative",
					visibility: isLoading ? "hidden" : "visible",
					// zIndex: isLoading ? -1 : "auto",
				}}
				title={title}
				width={width}
			/>
		</div>
	);
};

export default AkbotIframe;
