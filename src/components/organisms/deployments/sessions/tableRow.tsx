import React, { CSSProperties, memo } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";

import { SessionState } from "@enums";
import { SessionsTableRowProps } from "@interfaces/components";
import { SessionsService } from "@services";
import { cn } from "@utilities";

import { useToastStore } from "@store";

import { IconButton } from "@components/atoms";
import { SessionsTableState } from "@components/organisms/deployments";

import { ActionStoppedIcon, TrashIcon } from "@assets/image/icons";

const areEqual = (
	prevProps: { data: SessionsTableRowProps; index: number },
	nextProps: { data: SessionsTableRowProps; index: number }
) => {
	const prevSession = prevProps.data.sessions[prevProps.index];
	const nextSession = nextProps.data.sessions[nextProps.index];

	return (
		prevProps.index === nextProps.index &&
		prevProps.data.selectedSessionId === nextProps.data.selectedSessionId &&
		prevSession === nextSession
	);
};

export const SessionsTableRow = memo(
	({ data, index, style }: { data: SessionsTableRowProps; index: number; style: CSSProperties }) => {
		const { t: tErrors } = useTranslation("errors");
		const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
		const addToast = useToastStore((state) => state.addToast);
		const { onSessionRemoved, openSessionLog, selectedSessionId, sessions, showDeleteModal } = data;
		const session = sessions[index];

		if (!session) {
			return null;
		}

		const sessionRowClass = (id: string) =>
			cn("group cursor-pointer justify-between hover:bg-gray-1300", { "bg-black": id === selectedSessionId });

		const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			showDeleteModal(session.sessionId);
		};

		const handleStopSession = async (event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			if (session.state !== SessionState.running) return;

			const { error } = await SessionsService.stop(session.sessionId);
			if (error) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("failedStopSession"),
					type: "error",
				});

				return;
			}
			onSessionRemoved();
		};

		const actionStoppedIconClass =
			session.state === SessionState.running ? "h-4 w-4 transition group-hover:fill-white" : "h-4 w-4 transition";

		return (
			<div
				className={sessionRowClass(session.sessionId)}
				onClick={() => openSessionLog(session.sessionId)}
				onKeyDown={() => openSessionLog(session.sessionId)}
				role="button"
				style={{ ...style, display: "flex", justifyContent: "space-between", alignItems: "center" }}
				tabIndex={0}
			>
				<div className="flex w-[25%] px-2.5">{moment(session.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div>

				<div className="flex w-[15%] px-2.5">
					<SessionsTableState sessionState={session.state} />
				</div>

				<div className="flex w-[40%] px-2.5" title={session.sessionId}>
					{session.sessionId}
				</div>

				<div className="flex w-[20%] justify-end px-2.5">
					<IconButton
						className="p-1"
						disabled={session.state !== SessionState.running}
						onClick={handleStopSession}
						title={t("table.stopSession")}
					>
						<ActionStoppedIcon className={actionStoppedIconClass} />
					</IconButton>

					<IconButton className="p-1.5" onClick={handleDeleteClick}>
						<TrashIcon className="h-3 w-3 fill-white" />
					</IconButton>
				</div>
			</div>
		);
	},
	areEqual
);

SessionsTableRow.displayName = "SessionsTableRow";
