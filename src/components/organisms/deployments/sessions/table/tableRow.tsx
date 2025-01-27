import React, { CSSProperties, memo, useState } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";

import { SessionState } from "@enums";
import { SessionsTableRowProps } from "@interfaces/components";
import { LoggerService, SessionsService } from "@services";
import { dateTimeFormat, namespaces } from "@src/constants";
import { cn } from "@utilities";

import { useToastStore } from "@store";

import { IconButton, Loader, Td, Tr } from "@components/atoms";
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
		const { onSessionRemoved, openSession, selectedSessionId, sessions, showDeleteModal } = data;
		const session = sessions[index];
		const [isStopping, setIsStopping] = useState(false);

		if (!session) {
			return null;
		}

		const sessionRowClass = (id: string) =>
			cn("group flex cursor-pointer items-center hover:bg-gray-1300", {
				"bg-black": id === selectedSessionId,
			});

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

		return (
			<Tr
				className={sessionRowClass(session.sessionId)}
				onClick={() => openSession(session.sessionId)}
				style={{ ...style }}
			>
				<Td className="w-1/5 min-w-36 pl-4">{moment(session.createdAt).local().format(dateTimeFormat)}</Td>

				<Td className="w-1/5 min-w-20">
					<SessionsTableState sessionState={session.state} />
				</Td>

				<Td className="w-2/5 min-w-40 pl-2">{session.triggerName || session.connectionName}</Td>

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
			</Tr>
		);
	},
	areEqual
);

SessionsTableRow.displayName = "SessionsTableRow";
