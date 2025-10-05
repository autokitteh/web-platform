import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { projectTabs, namespaces, lintRuleIds } from "@src/constants";
import { LoggerLevel } from "@src/enums";
import { SessionEntrypoint } from "@src/interfaces/models";
import { LoggerService } from "@src/services";
import { useLoggerStore, useSharedBetweenProjectsStore, useFileStore } from "@src/store";
import { cn } from "@src/utilities";
import { parseVariableFromRuleMessage } from "@src/utils";

import { Frame, IconButton, Typography } from "@components/atoms";

import { Close, ExternalLinkIcon, TrashIcon } from "@assets/image/icons";

export const SystemLog = () => {
	const { projectId } = useParams() as { projectId: string };
	const { clearLogs, logs, setSystemLogHeight } = useLoggerStore();
	const { openFileAsActive } = useFileStore();
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

	const navigateToVariables = (message: string) => {
		const variableName = parseVariableFromRuleMessage(message);
		const targetRoute = variableName
			? `/projects/${projectId}/variables/edit/${encodeURIComponent(variableName)}`
			: `/projects/${projectId}/variables`;

		navigate(targetRoute);
	};

	const navigateToTriggers = () => {
		navigate(`/projects/${projectId}/triggers/add`);
	};

	const openFileAtLocation = (location: SessionEntrypoint) => {
		const isCurrentProjectTab = projectTabs.some((tab) =>
			pathname.startsWith(`/projects/${projectId}/${tab.value}`)
		);

		if (!isCurrentProjectTab) {
			navigate(`/projects/${projectId}/code`);
		}

		openFileAsActive(location.path);
		setCursorPosition(projectId, location.path, {
			startColumn: location.col,
			startLine: location.row,
			filename: location.path,
			code: "",
		});

		LoggerService.debug(
			namespaces.ui.code,
			t("successfullyOpenedFile", { path: location.path, row: location.row, col: location.col })
		);
	};

	const handleLogClick = (ruleId: string | undefined, message: string, location?: SessionEntrypoint) => {
		try {
			if (ruleId === lintRuleIds.emptyVariable) {
				navigateToVariables(message);
			} else if (ruleId === lintRuleIds.noTriggers) {
				navigateToTriggers();
			} else if (location) {
				openFileAtLocation(location);
			}
		} catch (error) {
			LoggerService.error(
				namespaces.ui.code,
				t("errors.failedToOpenFile", {
					error: error instanceof Error ? error.message : t("errors.unknownError"),
				})
			);
		}
	};

	const getActionLabel = (ruleId: string | undefined, message: string, location?: SessionEntrypoint): string => {
		if (ruleId === lintRuleIds.emptyVariable) {
			const variableName = parseVariableFromRuleMessage(message);
			return variableName ? t("setMissingValueForVar", { variableName }) : t("setMissingValueForVarNoName");
		}

		if (ruleId === lintRuleIds.noTriggers) {
			return t("addTrigger");
		}

		return location?.path || "";
	};

	const shouldShowAction = (ruleId: string | undefined, location?: SessionEntrypoint): boolean => {
		return ruleId === lintRuleIds.emptyVariable || ruleId === lintRuleIds.noTriggers || !!location;
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
						className="size-7 bg-gray-1100 p-0 hover:bg-gray-1050"
						onClick={() => setSystemLogHeight(0)}
					>
						<Close className="size-3 fill-white" />
					</IconButton>
				</div>
			</div>
			<div className="scrollbar h-48 flex-auto overflow-auto pt-5">
				{logs.map(({ id, message, status, timestamp, location, ruleId }) => (
					<div className="mb-3 font-mono" key={id}>
						<span className="text-gray-250">{timestamp}</span>

						<div className="ml-2 inline">
							<span className={cn(outputTextStyle[status])}>{status}</span>:
							<span className="whitespace-pre-wrap break-all">
								{message}{" "}
								{shouldShowAction(ruleId, location) ? (
									<button
										className="inline-flex cursor-pointer items-center gap-1 text-green-800 transition-colors duration-200 hover:text-green-700"
										onClick={() => handleLogClick(ruleId, message, location)}
									>
										- {getActionLabel(ruleId, message, location)}
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
