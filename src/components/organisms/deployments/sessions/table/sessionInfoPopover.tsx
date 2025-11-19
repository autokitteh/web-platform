import React, { useState } from "react";

import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { dateTimeFormat, namespaces } from "@constants";
import { SessionState } from "@enums";
import { LoggerService, SessionsService } from "@services";
import { Session } from "@src/interfaces/models";

import { useToastStore } from "@store";

import { IconButton, IconSvg, Loader } from "@components/atoms";
import { CopyButton } from "@components/molecules";
import { PopoverWrapper, PopoverTrigger, PopoverContent } from "@components/molecules/popover";
import { SessionsTableState } from "@components/organisms/deployments";

import { ArrowRightIcon, ActionStoppedIcon, TrashIcon, InfoIconNoCircle } from "@assets/image/icons";

interface SessionInfoPopoverProps {
	className?: string;
	session: Session;
	onSessionRemoved: () => void;
	showDeleteModal: (sessionId: string) => void;
	selectedSessionId?: string;
}

export const SessionInfoPopover = ({
	session,
	onSessionRemoved,
	showDeleteModal,
	selectedSessionId,
	className,
}: SessionInfoPopoverProps) => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.viewer" });
	const { t: tSessions } = useTranslation("deployments", { keyPrefix: "sessions" });
	const { t: tErrors } = useTranslation("errors");
	const addToast = useToastStore((state) => state.addToast);
	const [isStopping, setIsStopping] = useState(false);

	const sourceType = session.memo?.trigger_source_type || t("manualRun");
	const sourceName = session.triggerName || session.connectionName || t("manualRun");
	const isDurable = session.memo?.is_durable === "true";
	const eventId = session.memo?.event_id;

	const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		showDeleteModal(session.sessionId);
	};

	const handleStopSession = async (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		if (session.state !== SessionState.running) return;
		setIsStopping(true);
		const { error } = await SessionsService.stop(session.sessionId);
		setIsStopping(false);
		if (error) {
			addToast({
				message: tErrors("failedStopSession"),
				type: "error",
			});

			return;
		}

		addToast({
			message: tSessions("actions.sessionStoppedSuccessfully"),
			type: "success",
		});
		LoggerService.info(
			namespaces.ui.sessions,
			tSessions("actions.sessionStoppedSuccessfullyExtended", { sessionId: selectedSessionId })
		);

		onSessionRemoved();
	};

	const actionStoppedIconClass =
		session.state === SessionState.running ? "h-4 w-4 transition group-hover:fill-white" : "h-4 w-4 transition";

	return (
		<div className={className}>
			<PopoverWrapper interactionType="click" placement="right">
				<PopoverTrigger
					ariaLabel={tSessions("ariaLabelAdditionalInformation", { sessionId: session.sessionId })}
					title={tSessions("ariaLabelAdditionalInformation", { sessionId: session.sessionId })}
				>
					<IconSvg
						className="z-50 mt-1 size-3.5 fill-white hover:border-green-800 hover:fill-green-800"
						src={InfoIconNoCircle}
						withCircle
					/>
				</PopoverTrigger>
				<PopoverContent className="z-50 rounded-lg border border-gray-500 bg-gray-1100 p-4 font-fira-code text-sm shadow-lg">
					<div className="flex min-w-80 flex-col gap-2 text-white">
						<div className="flex items-center gap-3">
							<div className="w-36 text-gray-200">{t("startTime")}:</div>
							<div>{dayjs(session.createdAt).format(dateTimeFormat)}</div>
						</div>

						{session.updatedAt ? (
							<div className="flex items-center gap-3">
								<div className="w-36 text-gray-200">{t("recentlyUpdated")}:</div>
								<div>{dayjs(session.updatedAt).format(dateTimeFormat)}</div>
							</div>
						) : null}

						<div className="flex items-center gap-3">
							<div className="w-36 text-gray-200">{t("source")}:</div>
							<div className="flex items-center gap-2">
								<span className="capitalize">{sourceType.toLowerCase()}</span>
								<span>-</span>
								<span>{sourceName}</span>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="w-36 text-gray-200">{t("entrypoint")}:</div>
							<div className="flex items-center gap-2">
								<span>{session.entrypoint.path}</span>
								<IconSvg className="fill-white" size="sm" src={ArrowRightIcon} />
								<span>{session.entrypoint.name}</span>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="w-36 text-gray-200">{t("status")}:</div>
							<SessionsTableState sessionState={session.state} />
						</div>

						<div className="flex items-center gap-3">
							<div className="w-36 text-gray-200">{t("isDurable")}:</div>
							<div>{isDurable ? t("yes") : t("no")}</div>
						</div>

						{eventId ? (
							<div className="flex items-center gap-3">
								<div className="w-36 text-gray-200">{tSessions("table.eventId")}:</div>
								<div className="flex flex-1 items-center gap-2">
									<div
										className="max-w-64 truncate"
										title={tSessions("table.ariaLabelEventId", {
											eventId,
										})}
									>
										{eventId}
									</div>
									<CopyButton
										ariaLabel={tSessions("table.ariaLabelEventId", {
											eventId,
										})}
										className="size-6 p-0"
										text={eventId}
										title={tSessions("table.ariaLabelEventId", {
											eventId,
										})}
									/>
								</div>
							</div>
						) : null}

						{session.deploymentId ? (
							<div className="flex items-center gap-3">
								<div className="w-36 text-gray-200">{tSessions("table.deploymentId")}:</div>
								<div className="flex flex-1 items-center gap-2">
									<div
										className="max-w-64 truncate"
										title={tSessions("table.ariaLabelDeploymentId", {
											deploymentId: session.deploymentId,
										})}
									>
										{session.deploymentId}
									</div>
									<CopyButton
										ariaLabel={tSessions("table.ariaLabelDeploymentId", {
											deploymentId: session.deploymentId,
										})}
										className="size-6 p-0"
										text={session.deploymentId}
										title={tSessions("table.ariaLabelDeploymentId", {
											deploymentId: session.deploymentId,
										})}
									/>
								</div>
							</div>
						) : null}

						{session.sessionId ? (
							<div className="flex items-center gap-3">
								<div className="w-36 text-gray-200">{tSessions("table.sessionId")}:</div>
								<div className="flex flex-1 items-center gap-2">
									<div
										className="max-w-64 truncate"
										title={tSessions("table.ariaLabelSessionId", {
											sessionId: session.sessionId,
										})}
									>
										{session.sessionId}
									</div>
									<CopyButton
										ariaLabel={tSessions("table.ariaLabelSessionId", {
											sessionId: session.sessionId,
										})}
										className="size-6 p-0"
										text={session.sessionId}
										title={tSessions("table.ariaLabelSessionId", {
											sessionId: session.sessionId,
										})}
									/>
								</div>
							</div>
						) : null}

						<div className="mt-1 flex w-full justify-start gap-2 border-t border-gray-500 pt-2">
							<IconButton
								className="mt-0"
								disabled={session.state !== SessionState.running}
								onClick={handleStopSession}
								title={tSessions("table.stopSession")}
							>
								{isStopping ? (
									<Loader size="sm" />
								) : (
									<>
										<ActionStoppedIcon className={actionStoppedIconClass} />{" "}
										<span className="ml-2">Stop</span>
									</>
								)}
							</IconButton>

							<IconButton onClick={handleDeleteClick}>
								<TrashIcon className="size-4 stroke-white" /> <span className="ml-2">Remove</span>
							</IconButton>
						</div>
					</div>
				</PopoverContent>
			</PopoverWrapper>
		</div>
	);
};
