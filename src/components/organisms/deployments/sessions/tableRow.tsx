import React, { CSSProperties, memo } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { areEqual } from "react-window";

import { SessionState } from "@enums";
import { SessionsTableRowProps } from "@interfaces/components";
import { SessionsService } from "@services";
import { cn } from "@utilities";

import { useToastStore } from "@store";

import { IconButton, Td, Tr } from "@components/atoms";
import { SessionsTableState } from "@components/organisms/deployments";

import { ActionStoppedIcon, TrashIcon } from "@assets/image/icons";

export const SessionsTableRow = memo(
	({ data, index, style }: { data: SessionsTableRowProps; index: number; style: CSSProperties }) => {
		const { t: tErrors } = useTranslation("errors");
		const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
		const addToast = useToastStore((state) => state.addToast);
		const { openSessionLog, scrollDisplayed, selectedSessionId, sessions, showDeleteModal } = data;
		const session = sessions[index];

		const sessionRowClass = (id: string) =>
			cn("group cursor-pointer hover:bg-gray-800", { "bg-black": id === selectedSessionId });
		const sessionLastTdClass = cn("max-w-20 justify-end border-0", { "mr-1.5": !scrollDisplayed });

		if (!session) {
			return null;
		}

		const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			showDeleteModal(session.sessionId);
		};

		const handleStopSession = async (event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();

			if (session.state !== SessionState.running) {
				return;
			}

			const { error } = await SessionsService.stop(session.sessionId);
			if (error) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("failedStopSession"),
					type: "error",
				});

				return;
			}
		};

		const actionStoppedIconClass =
			session.state === SessionState.running ? "h-4 w-4 transition group-hover:fill-white" : "h-4 w-4 transition";

		return (
			<Tr
				className={sessionRowClass(session.sessionId)}
				onClick={() => openSessionLog(session.sessionId)}
				style={style}
			>
				<Td>{moment(session.createdAt).utc().format("YYYY-MM-DD HH:mm:ss")}</Td>

				<Td>
					<SessionsTableState sessionState={session.state} />
				</Td>

				<Td className="border-r-0">{session.sessionId}</Td>

				<Td className={sessionLastTdClass}>
					<div className="flex space-x-1">
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
				</Td>
			</Tr>
		);
	},
	areEqual
);

SessionsTableRow.displayName = "SessionsTableRow";
