import React, { CSSProperties, memo } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";

import { SessionState } from "@enums";
import { SessionsTableRowProps } from "@interfaces/components";
import { SessionsService } from "@services";
import { cn } from "@utilities";

import { useToastStore } from "@store";

import { IconButton, Td, Tr } from "@components/atoms";
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
			cn("group flex cursor-pointer items-center justify-between hover:bg-gray-1300", {
				"bg-black": id === selectedSessionId,
			});

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
			<Tr
				className={sessionRowClass(session.sessionId)}
				onClick={() => openSessionLog(session.sessionId)}
				style={{ ...style }}
			>
				<Td className="w-56">{moment(session.createdAt).utc().format("YYYY-MM-DD HH:mm:ss")}</Td>

				<Td className="w-32">
					<SessionsTableState sessionState={session.state} />
				</Td>

				<Td className="w-32">{session.triggerName}</Td>

				<Td className="w-32">{session.connectionName}</Td>

				<Td className="flex w-32">
					<IconButton
						className="inline p-0"
						disabled={session.state !== SessionState.running}
						onClick={handleStopSession}
						title={t("table.stopSession")}
					>
						<ActionStoppedIcon className={actionStoppedIconClass} />
					</IconButton>

					<IconButton className="ml-1 inline p-1.5" onClick={handleDeleteClick}>
						<TrashIcon className="size-4 stroke-white" />
					</IconButton>
				</Td>
			</Tr>
		);
	},
	areEqual
);

SessionsTableRow.displayName = "SessionsTableRow";
