import React from "react";

import { useTranslation } from "react-i18next";

import { LoggerLevel } from "@enums";
import { cn } from "@utilities";

import { useLoggerStore } from "@store";

import { Frame, IconButton, Typography } from "@components/atoms";

import { Close, TrashIcon } from "@assets/image/icons";

export const SystemLog = () => {
	const { clearLogs, logs, setSystemLogHeight } = useLoggerStore();
	const { t } = useTranslation("projects", { keyPrefix: "outputLog" });

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
			<div className="scrollbar h-48 flex-auto overflow-auto pt-5">
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
		</Frame>
	);
};
