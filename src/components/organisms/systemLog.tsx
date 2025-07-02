import React, { useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { LoggerLevel } from "@src/enums";
import { useLoggerStore } from "@src/store";
import { cn } from "@src/utilities";

import { IconButton, Frame, Typography } from "@components/atoms";

import { Close, TrashIcon, ArrowDown } from "@assets/image/icons";

export const SystemLog = () => {
	const { clearLogs, logs, setSystemLogHeight } = useLoggerStore();
	const { t } = useTranslation("projects", { keyPrefix: "outputLog" });

	const logContainerRef = useRef<HTMLDivElement>(null);
	const [showScrollButton, setShowScrollButton] = useState(false);

	useEffect(() => {
		const container = logContainerRef.current;
		if (!container) return;

		container.scrollTop = container.scrollHeight;
		updateScrollButtonVisibility();
	}, [logs]);

	useEffect(() => {
		const container = logContainerRef.current;
		if (!container) return;

		const resizeObserver = new ResizeObserver(updateScrollButtonVisibility);
		resizeObserver.observe(container);

		return () => resizeObserver.disconnect();
	}, []);

	const updateScrollButtonVisibility = () => {
		const container = logContainerRef.current;
		if (!container) return;

		const hasScroll = container.scrollHeight > container.clientHeight;
		const isNotAtBottom = container.scrollTop < container.scrollHeight - container.clientHeight - 10;

		setShowScrollButton(hasScroll && isNotAtBottom);
	};

	const scrollToBottom = () => {
		const container = logContainerRef.current;
		if (!container) return;

		container.scrollTop = container.scrollHeight;
		setShowScrollButton(false);
	};

	const ouputTextStyle = {
		[LoggerLevel.debug]: "",
		[LoggerLevel.error]: "text-error-200",
		[LoggerLevel.info]: "text-blue-500",
		[LoggerLevel.log]: "",
		[LoggerLevel.warn]: "text-yellow-500",
	} as const;

	return (
		<Frame className="h-full overflow-hidden border border-none px-7 py-4">
			<div className="flex justify-between">
				<Typography className="font-semibold" element="h2" size="large">
					{t("systemLog")}
				</Typography>
				<div className="flex items-center gap-2.5">
					<IconButton
						className="size-7 p-0.5 hover:bg-gray-1050"
						onClick={() => clearLogs()}
						title={t("clear")}
					>
						<TrashIcon className="size-4 stroke-white" />
					</IconButton>
					<IconButton
						className="size-7 bg-gray-1100 p-0.5 hover:bg-gray-1050"
						onClick={() => setSystemLogHeight(0)}
					>
						<Close className="size-3 fill-white" />
					</IconButton>
				</div>
			</div>
			<div className="relative overflow-auto pt-5">
				<div
					className="scrollbar h-full overflow-auto"
					onScroll={updateScrollButtonVisibility}
					ref={logContainerRef}
				>
					{logs.map(({ id, message, status, timestamp }) => (
						<div className="mb-3 font-mono" key={id}>
							<span className="text-gray-250">{timestamp}</span>
							<div className="ml-2 inline">
								<span className={cn(ouputTextStyle[status])}>{status}</span>:
								<span className="break-all">{message}</span>
							</div>
						</div>
					))}
				</div>
				{showScrollButton ? (
					<IconButton
						className="absolute bottom-4 right-4 rounded-full bg-gray-900/80 p-2 shadow-lg transition hover:bg-gray-800"
						onClick={scrollToBottom}
						title={t("scrollToBottom")}
					>
						<ArrowDown className="size-4 text-white" />
					</IconButton>
				) : null}
			</div>
		</Frame>
	);
};
