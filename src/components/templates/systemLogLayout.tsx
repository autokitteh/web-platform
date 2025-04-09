import React, { useId } from "react";

import { useLocation } from "react-router-dom";

import { defaultSystemLogSize, featureFlags } from "@src/constants";
import { DrawerName } from "@src/enums/components";
import { useResize, useWindowDimensions } from "@src/hooks";
import { useDrawerStore, useLoggerStore } from "@src/store";
import { cn } from "@src/utilities";

import { IconSvg, ResizeButton } from "@components/atoms";
import { SystemLog } from "@components/organisms";
import { BotModal } from "@components/organisms/akBotIframe/botModal";

import { AKRoundLogo } from "@assets/image";

export const SystemLogLayout = ({
	children,
	className,
	sidebar,
	topbar,
	hideSystemLog,
}: {
	children: React.ReactNode;
	className?: string;
	hideSystemLog?: boolean;
	sidebar?: React.ReactNode;
	topbar?: React.ReactNode;
}) => {
	const layoutClasses = cn("flex h-screen w-screen flex-1 md:pr-4", className);
	const { pathname } = useLocation();
	const { setSystemLogHeight, systemLogHeight } = useLoggerStore();
	const { openDrawer } = useDrawerStore();

	const openChatbot = () => {
		openDrawer(DrawerName.chatbot);
	};
	const { isIOS, isMobile } = useWindowDimensions();

	const resizeId = useId();

	const shouldDisplayChatbot = pathname.startsWith("/projects/") && featureFlags.displayChatbot;

	useResize({
		direction: "vertical",
		...defaultSystemLogSize,
		id: resizeId,
		value: systemLogHeight,
		onChange: (newVal) => {
			setSystemLogHeight(newVal);
		},
	});

	const buttonResizeClasses = cn("my-0.5", { "my-0": systemLogHeight === 100 });
	const innerLayoutClasses = cn("flex flex-1 flex-col md:mb-2", {
		"md:mb-0.5": systemLogHeight === 0,
		"w-0": ["/", "/intro"].includes(pathname),
	});

	return (
		<div className={layoutClasses}>
			<BotModal />
			{sidebar}
			<div className={innerLayoutClasses}>
				<div className="flex flex-1 flex-col overflow-hidden" style={{ height: `${100 - systemLogHeight}%` }}>
					{topbar}
					{children}
				</div>

				{isIOS || isMobile || hideSystemLog ? null : (
					<ResizeButton className={buttonResizeClasses} direction="vertical" resizeId={resizeId} />
				)}
				{hideSystemLog ? null : (
					<div className="z-20 overflow-hidden" style={{ height: `${systemLogHeight}%` }}>
						<SystemLog />
					</div>
				)}
			</div>

			{shouldDisplayChatbot ? (
				<button
					aria-label="Open Chatbot"
					className="fixed bottom-6 right-6 size-12 cursor-pointer rounded-full bg-white transition-transform hover:scale-110 hover:shadow-sm hover:shadow-green-800/70"
					id="openChatbot"
					onClick={openChatbot}
					type="button"
				>
					<IconSvg
						className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-gray-1300"
						size="3xl"
						src={AKRoundLogo}
					/>
				</button>
			) : null}
		</div>
	);
};
