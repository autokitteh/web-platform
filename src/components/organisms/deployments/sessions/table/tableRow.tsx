import React, { CSSProperties, memo, useState } from "react";

import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { SessionState } from "@enums";
import { SessionsTableRowProps } from "@interfaces/components";
import { LoggerService, SessionsService } from "@services";
import { dateTimeFormat, namespaces } from "@src/constants";
import { cn, getSessionTriggerType } from "@utilities";

import { useToastStore } from "@store";

import { IconButton, Loader, Td, Tr } from "@components/atoms";
import { SessionsTableState, SessionInfoPopover } from "@components/organisms/deployments";

import { ActionStoppedIcon, TrashIcon, WebhookIcon, ClockIcon, PlayIcon, LinkIcon } from "@assets/image/icons";

const areEqual = (
	prevProps: { data: SessionsTableRowProps; index: number },
	nextProps: { data: SessionsTableRowProps; index: number }
) => {
	const prevSession = prevProps.data.sessions[prevProps.index];
	const nextSession = nextProps.data.sessions[nextProps.index];

	return (
		prevProps.index === nextProps.index &&
		prevProps.data.selectedSessionId === nextProps.data.selectedSessionId &&
		prevProps.data.hideSourceColumn === nextProps.data.hideSourceColumn &&
		prevProps.data.hideActionsColumn === nextProps.data.hideActionsColumn &&
		prevSession === nextSession
	);
};

export const SessionsTableRow = memo(
	({ data, index, style }: { data: SessionsTableRowProps; index: number; style: CSSProperties }) => {
		const { t: tErrors } = useTranslation("errors");
		const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
		const addToast = useToastStore((state) => state.addToast);
		const {
			onSessionRemoved,
			openSession,
			selectedSessionId,
			sessions,
			showDeleteModal,
			hideSourceColumn,
			hideActionsColumn,
		} = data;
		const session = sessions[index];
		const [isStopping, setIsStopping] = useState(false);

		if (!session) {
			return null;
		}
		const triggerType = getSessionTriggerType(session.memo);

		const sessionRowClass = (id: string) =>
			cn("group flex cursor-pointer items-center fill-white hover:bg-gray-1300", {
				"bg-black": id === selectedSessionId,
			});

		const renderTriggerIcon = () => {
			const iconClassName = cn("size-4 shrink-0", {
				"fill-white stroke-white": triggerType === "manual",
			});
			switch (triggerType) {
				case "webhook":
					return <WebhookIcon className={iconClassName} />;
				case "schedule":
					return <ClockIcon className={iconClassName} />;
				case "connection":
					return <LinkIcon className={iconClassName} />;
				case "manual":
					return <PlayIcon className={iconClassName} />;
				default:
					return null;
			}
		};

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
				message: t("actions.sessionStoppedSuccessfully"),
				type: "success",
			});
			LoggerService.info(
				namespaces.ui.sessions,
				t("actions.sessionStoppedSuccessfullyExtended", { sessionId: selectedSessionId })
			);

			onSessionRemoved();
		};

		const actionStoppedIconClass =
			session.state === SessionState.running ? "h-4 w-4 transition group-hover:fill-white" : "h-4 w-4 transition";

		const sessionTriggerName = session.triggerName || session.connectionName || "Manual run";
		return (
			<Tr
				className={sessionRowClass(session.sessionId)}
				onClick={() => openSession(session.sessionId)}
				style={{ ...style }}
			>
				<Td
					ariaLabel={`Session ${session.sessionId} created at ${dayjs(session.createdAt).format(dateTimeFormat)} by ${triggerType} ${sessionTriggerName} trigger`}
					className={hideSourceColumn ? "w-2/5 min-w-48 pl-4" : "w-1/5 min-w-44 pl-4"}
				>
					<div className="flex items-center justify-between gap-0.5 pl-2">
						{dayjs(session.createdAt).format(dateTimeFormat)}
						<SessionInfoPopover
							onSessionRemoved={onSessionRemoved}
							selectedSessionId={selectedSessionId}
							session={session}
							showDeleteModal={showDeleteModal}
						/>
						{hideSourceColumn ? (
							<div aria-label={`${triggerType} ${sessionTriggerName} trigger`} role="img">
								{renderTriggerIcon()}
							</div>
						) : null}
					</div>
				</Td>

				<Td className="w-1/5 min-w-20 pl-2">
					<SessionsTableState sessionState={session.state} />
				</Td>

				{hideSourceColumn ? null : (
					<Td
						ariaLabel={sessionTriggerName}
						className="w-2/5 min-w-28 pl-2"
						textWrapperClassName="flex flex-row gap-1.5 items-center"
					>
						<div aria-label={`${triggerType} ${sessionTriggerName} trigger icon`} role="img">
							{renderTriggerIcon()}
						</div>
						<div
							aria-label={`${triggerType} ${sessionTriggerName} trigger`}
							title={`${triggerType} ${sessionTriggerName} trigger`}
						>
							{sessionTriggerName}
						</div>
					</Td>
				)}

				{!hideActionsColumn ? (
					<Td className="w-1/5 min-w-20">
						<div className="flex w-full justify-start">
							<IconButton
								disabled={session.state !== SessionState.running}
								onClick={handleStopSession}
								title={t("table.stopSession")}
							>
								{isStopping ? (
									<Loader size="sm" />
								) : (
									<ActionStoppedIcon className={actionStoppedIconClass} />
								)}
							</IconButton>

							<IconButton className="ml-1" onClick={handleDeleteClick}>
								<TrashIcon className="size-4 stroke-white" />
							</IconButton>
						</div>
					</Td>
				) : null}
			</Tr>
		);
	},
	areEqual
);

SessionsTableRow.displayName = "SessionsTableRow";
