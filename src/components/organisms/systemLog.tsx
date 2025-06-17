import React, { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";

import { LoggerLevel } from "@src/enums";
import { useLoggerStore } from "@src/store";
import { cn } from "@src/utilities";

import { Frame, IconButton, Typography } from "@components/atoms";

import { Close, TrashIcon, ArrowUpIcon } from "@assets/image/icons";

export const SystemLog = () => {
	const { clearLogs, logs, setSystemLogHeight } = useLoggerStore();
	const { t } = useTranslation("projects", { keyPrefix: "outputLog" });

	const logContainerRef = useRef<HTMLDivElement>(null);
	const [showScrollUp, setShowScrollUp] = React.useState(false);

	useEffect(() => {
		if (logContainerRef.current) {
			logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
			setShowScrollUp(false);
		}
	}, [logs]);

	const handleScroll = () => {
		const logContainer = logContainerRef.current;
		if (!logContainer) return;
		setShowScrollUp(logContainer.scrollTop > 0);
	};

	const handleScrollUp = () => {
		const logContainer = logContainerRef.current;
		if (!logContainer) return;
		logContainer.scrollBy({ top: -100, behavior: "smooth" });
		if (logContainer.scrollTop <= 0) setShowScrollUp(false);
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
			<div className="scrollbar relative flex-auto overflow-auto pt-5">
				<div className="" onScroll={handleScroll} ref={logContainerRef}>
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
				{showScrollUp ? (
					<button
						className="absolute bottom-0 right-2 rounded-full bg-gray-900/80 p-1 transition hover:bg-gray-800"
						onClick={handleScrollUp}
						title={t("scrollUp")}
					>
						<ArrowUpIcon className="size-4 text-white" />
					</button>
				) : null}
			</div>
		</Frame>
	);
};
