import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { projectTabs } from "@src/constants";
import { LoggerLevel } from "@src/enums";
import { useFileOperations } from "@src/hooks";
import { SessionEntrypoint } from "@src/interfaces/models";
import { useLoggerStore, useSharedBetweenProjectsStore } from "@src/store";
import { cn } from "@src/utilities";

import { Frame, IconButton, Typography } from "@components/atoms";

import { Close, ExternalLinkIcon, TrashIcon } from "@assets/image/icons";

export const SystemLog = () => {
	const { projectId } = useParams() as { projectId: string };
	const { clearLogs, logs, setSystemLogHeight } = useLoggerStore();
	const { openFileAsActive } = useFileOperations(projectId);
	const { setCursorPosition } = useSharedBetweenProjectsStore();
	const { t } = useTranslation("projects", { keyPrefix: "outputLog" });
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const outputTextStyle = {
		[LoggerLevel.debug]: "",
		[LoggerLevel.error]: "text-error-200",
		[LoggerLevel.info]: "text-blue-500",
		[LoggerLevel.log]: "",
		[LoggerLevel.warn]: "text-yellow-500",
		[LoggerLevel.unspecified]: "",
	} as const;

	const openWarningFile = (location: SessionEntrypoint) => {
		const isCurrentProjectTab = projectTabs.some((tab) =>
			pathname.startsWith(`/projects/${projectId}/${tab.value}`)
		);

		if (!isCurrentProjectTab) {
			navigate(`/projects/${projectId}/code`);
		}

		openFileAsActive(location.path);
		setCursorPosition(projectId, location.path, {
			column: location.col,
			lineNumber: location.row,
		});
	};

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
				{logs.map(({ id, message, status, timestamp, location }) => (
					<div className="mb-3 font-mono" key={id}>
						<span className="text-gray-250">{timestamp}</span>

						<div className="ml-2 inline">
							<span className={cn(outputTextStyle[status])}>{status}</span>:
							<span className="break-all">
								{message}{" "}
								{location ? (
									<button
										className="group inline-flex items-center gap-1 text-green-800"
										onClick={() => openWarningFile(location)}
									>
										- {location.path}
										<ExternalLinkIcon className="size-3 fill-green-800 duration-200" />
									</button>
								) : null}
							</span>
						</div>
					</div>
				))}
			</div>
		</Frame>
	);
};
