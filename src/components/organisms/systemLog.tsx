import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { projectTabs, namespaces } from "@src/constants";
import { LoggerLevel } from "@src/enums";
import { SessionEntrypoint } from "@src/interfaces/models";
import { LoggerService } from "@src/services";
import { useLoggerStore, useSharedBetweenProjectsStore, useFileStore } from "@src/store";
import { lintViolationRules } from "@src/types/models/lintViolationCheck.type";
import { cn } from "@src/utilities";
import { extractOriginalMessage, parseVariableFromRuleMessage } from "@src/utils";

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

	const openWarningFile = (
		location?: SessionEntrypoint,
		ruleId?: keyof typeof lintViolationRules,
		ruleMessage?: string
	) => {
		if (!location && !ruleId) return;

		if (ruleId) {
			if (ruleId === "W1") {
				try {
					const variableName = parseVariableFromRuleMessage(ruleMessage);

					try {
						const targetRoute = variableName
							? `/projects/${projectId}/variables/edit/${encodeURIComponent(variableName)}`
							: `/projects/${projectId}/variables`;

						navigate(targetRoute);
					} catch (navigationError) {
						LoggerService.error(
							namespaces.ui.variables,
							t("errors.navigationFailedW1", {
								error:
									navigationError instanceof Error
										? navigationError.message
										: t("errors.unknownError"),
							})
						);
					}
				} catch (parseError) {
					LoggerService.error(
						namespaces.ui.variables,
						t("errors.errorProcessingW1", {
							error: parseError instanceof Error ? parseError.message : t("errors.unknownError"),
						})
					);

					try {
						navigate(`/projects/${projectId}/variables`);
					} catch (fallbackError) {
						LoggerService.error(
							namespaces.ui.variables,
							t("errors.fallbackNavigationFailed", {
								error:
									fallbackError instanceof Error ? fallbackError.message : t("errors.unknownError"),
							})
						);
					}
				}
			} else if (ruleId === "W2") {
				try {
					navigate(`/projects/${projectId}/triggers/add`);
				} catch (navigationError) {
					LoggerService.error(
						namespaces.ui.triggers,
						t("errors.navigationFailedW2", {
							error:
								navigationError instanceof Error ? navigationError.message : t("errors.unknownError"),
						})
					);
				}
			}
			return;
		}

		if (!location) return;

		try {
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
		} catch (fileOpenError) {
			LoggerService.error(
				namespaces.ui.code,
				t("errors.failedToOpenFile", {
					error: fileOpenError instanceof Error ? fileOpenError.message : t("errors.unknownError"),
				})
			);
		}
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
								{(ruleId && (ruleId === "W1" || ruleId === "W2")) || location ? (
									<button
										className="inline-flex cursor-pointer items-center gap-1 text-green-800 transition-colors duration-200 hover:text-green-700"
										onClick={() =>
											openWarningFile(location, ruleId, extractOriginalMessage(message))
										}
									>
										{ruleId === "W1"
											? (() => {
													const variableName = parseVariableFromRuleMessage(
														extractOriginalMessage(message)
													);
													return variableName
														? t("setMissingValueForVar", { variableName })
														: `- ${t("setMissingValueForVarNoName")}`;
												})()
											: ruleId === "W2"
												? `- ${t("addTrigger")}`
												: `- ${location?.path}`}
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
