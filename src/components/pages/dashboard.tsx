/* eslint-disable no-console */
import React, { useEffect, useId, useState } from "react";

import { EventListenerName } from "@src/enums";
import { triggerEvent, useEventListener, useResize, useWindowDimensions } from "@src/hooks";
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
	const { fullScreenDashboard } = useSharedBetweenProjectsStore();
	const [displayAIChat, setDisplayAIChat] = useState(false);

	const toggleDashboardAIChat = (event?: CustomEvent<boolean | undefined>) => {
		console.log("[Dashboard] toggleDashboardAIChat", event);
		if (event && typeof event.detail === "boolean") {
			setDisplayAIChat(event.detail);
		} else {
			setDisplayAIChat((prev) => !prev);
		}
	};

	const hideAIChat = () => {
		console.log("[Dashboard] hideAIChat", false);
		setDisplayAIChat(false);
	};

	// useEventListener(EventListenerName.displayDashboardChat, toggleDashboardAIChat);

	useEffect(() => {
		if (!projectsList.length && isMobile) {
			getProjectsList();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// const toggleDashboardAIChat = (event: CustomEvent<boolean | undefined>) => {
	// 	if (fullScreenDashboard) {
	// 		setFullScreenDashboard(false);
	// 	}
	// 	const newState = event.detail;
	// 	if (newState !== undefined) {
	// 		setDisplayAIChat(newState);
	// 		return;
	// 	}
	// 	setDisplayAIChat((prev) => !prev);
	// };

	useEventListener(EventListenerName.displayDashboardChat, toggleDashboardAIChat);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_isConnected, setIsConnected] = useState(false);

	const handleConnect = () => {
		setIsConnected(true);
	};

	const shouldRenderWelcome = !isLoadingProjectsList && !projectsList.length;

	useEffect(() => {
		if (shouldRenderWelcome) {
			window.location.replace("/welcome");
		}
	}, [shouldRenderWelcome]);

	useEventListener(EventListenerName.toggleDashboardChatBot, (newState) => {
		console.log("[Dashboard] EventListenerName.toggleDashboardChatBot", newState);

		if (newState.detail !== undefined) {
			setDisplayAIChat(newState.detail);
		} else {
			setDisplayAIChat((prev) => !prev);
		}
	});

	useEffect(() => {
		console.log("[Dashboard] useEffect triggered", displayAIChat);
		if (displayAIChat) {
			triggerEvent(EventListenerName.toggleDashboardChatBot, true);
		} else {
			triggerEvent(EventListenerName.toggleDashboardChatBot, false);
		}
	}, [displayAIChat]);

	return shouldRenderWelcome ? (
		<WelcomePage />
	) : (
		<div className="flex size-full overflow-hidden rounded-none md:mt-1.5 md:rounded-2xl">
			<div
				className="relative flex w-2/3 flex-col"
				style={{ width: `${isMobile || fullScreenDashboard || displayAIChat ? 100 : leftSideWidth}%` }}
			>
				<Frame className="flex-1 rounded-none bg-gray-1100 md:rounded-r-none md:pb-0">
					{!displayAIChat ? <DashboardTopbar /> : null}
					{displayAIChat ? (
						<div className="mb-6 mt-2 flex h-full">
							<div className="relative w-full">
								<ChatbotIframe configMode={false} onBack={hideAIChat} onConnect={handleConnect} />
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
			{isMobile || fullScreenDashboard || displayAIChat ? null : (
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
