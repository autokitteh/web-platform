import React, { useEffect, useId, useState } from "react";

import { EventListenerName } from "@src/enums";
import { useEventListener, useResize, useWindowDimensions } from "@src/hooks";
import { useProjectStore } from "@src/store";

import { Frame, Loader, ResizeButton } from "@components/atoms";
import { DashboardProjectsTable, DashboardTopbar, WelcomePage } from "@components/organisms";
import { AkbotIframe } from "@components/organisms/akBotIframe";
import { TemplatesCatalog } from "@components/organisms/dashboard/templates";
import { Socials } from "@components/organisms/shared";

const akBotUrl = "/akbot";
const akBotOrigin = import.meta.env.VITE_AKBOT_ORIGIN || "http://localhost:3000";
console.log("Dashboard - Environment Variables:", {
	VITE_AKBOT_URL: import.meta.env.VITE_AKBOT_URL,
	VITE_AKBOT_ORIGIN: import.meta.env.VITE_AKBOT_ORIGIN,
	"Used URL": import.meta.env.VITE_AKBOT_URL,
	"Used Origin": akBotOrigin,
});

export const Dashboard = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 70, min: 30, id: resizeId });
	const { isMobile } = useWindowDimensions();
	const { getProjectsList, isLoadingProjectsList, projectsList } = useProjectStore();

	useEffect(() => {
		if (!projectsList.length && isMobile) {
			getProjectsList();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [displayAIChat, setDisplayAIChat] = useState(false);
	const toggleAIChat = () => {
		setDisplayAIChat((prev) => !prev);
	};

	useEventListener(EventListenerName.openChatBot, toggleAIChat);

	const [isConnected, setIsConnected] = useState(false);

	const handleConnect = () => {
		setIsConnected(true);
	};

	return !isLoadingProjectsList && !projectsList.length ? (
		<WelcomePage />
	) : (
		<div className="flex size-full overflow-hidden rounded-none md:mt-1.5 md:rounded-2xl">
			<div className="relative flex w-2/3 flex-col" style={{ width: `${!isMobile ? leftSideWidth : 100}%` }}>
				<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none md:pb-0">
					<DashboardTopbar />
					{displayAIChat ? (
						<div className="mt-20 flex h-5/6 rounded border">
							<div className="relative w-full">
								<button
									aria-label="Close AI Chat"
									className="absolute right-2 top-2 z-10 rounded-full bg-gray-900 p-1.5 hover:bg-gray-800"
									onClick={toggleAIChat}
								>
									<svg
										className="size-5 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M6 18L18 6M6 6l12 12"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
										/>
									</svg>
								</button>
								<AkbotIframe onConnect={handleConnect} src={import.meta.env.VITE_AKBOT_URL} />
							</div>
						</div>
					) : isLoadingProjectsList ? (
						<Loader isCenter size="lg" />
					) : (
						<>
							<DashboardProjectsTable />
							<Socials iconsClass="size-6" wrapperClass="border-t-0.5 border-gray-1050 pt-4" />
						</>
					)}
				</Frame>
			</div>
			{isMobile ? null : (
				<>
					<ResizeButton
						className="right-0.5 bg-white hover:bg-gray-700"
						direction="horizontal"
						resizeId={resizeId}
					/>

					<div style={{ width: `${100 - (leftSideWidth as number)}%` }}>
						<TemplatesCatalog />
					</div>
				</>
			)}
		</div>
	);
};
