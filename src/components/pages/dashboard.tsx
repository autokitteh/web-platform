import React, { useEffect, useId, useState } from "react";

import { EventListenerName } from "@src/enums";
import { useEventListener, useResize, useWindowDimensions } from "@src/hooks";
import { useProjectStore, useSharedBetweenProjectsStore } from "@src/store";

import { Frame, Loader, ResizeButton } from "@components/atoms";
import { DashboardProjectsTable, DashboardTopbar, WelcomePage } from "@components/organisms";
import { ChatbotIframe } from "@components/organisms/chatbotIframe";
import { TemplatesCatalog } from "@components/organisms/dashboard/templates";
import { Socials } from "@components/organisms/shared";

export const Dashboard = () => {
	const resizeId = useId();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 70, max: 70, min: 30, id: resizeId });
	const { isMobile } = useWindowDimensions();
	const { getProjectsList, isLoadingProjectsList, projectsList } = useProjectStore();
	const { fullScreenDashboard, setFullScreenDashboard } = useSharedBetweenProjectsStore();
	const [displayAIChat, setDisplayAIChat] = useState(false);

	useEffect(() => {
		if (!projectsList.length && isMobile) {
			getProjectsList();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const toggleDashboardAIChat = () => {
		if (displayAIChat) {
			setFullScreenDashboard(true);
		} else {
			setFullScreenDashboard(false);
		}
		setDisplayAIChat((prev) => !prev);
	};

	useEventListener(EventListenerName.toggleDashboardChatBot, toggleDashboardAIChat);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_isConnected, setIsConnected] = useState(false);

	const handleConnect = () => {
		setIsConnected(true);
	};

	const shouldRenderWelcome = !isLoadingProjectsList && !projectsList.length;

	return shouldRenderWelcome ? (
		<WelcomePage />
	) : (
		<div className="flex size-full overflow-hidden rounded-none md:mt-1.5 md:rounded-2xl">
			<div
				className="relative flex w-2/3 flex-col"
				style={{ width: `${isMobile || fullScreenDashboard ? 100 : leftSideWidth}%` }}
			>
				<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none md:pb-0">
					<DashboardTopbar />
					{displayAIChat ? (
						<div className="mb-6 mt-2 flex h-full">
							<div className="relative w-full">
								<ChatbotIframe onConnect={handleConnect} />
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
			{isMobile || fullScreenDashboard ? null : (
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
