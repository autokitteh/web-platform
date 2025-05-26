import React, { memo, useEffect, useState } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";

import { SessionState } from "@enums";
import { LoggerService, SessionsService } from "@services";
import { dateTimeFormat, namespaces } from "@src/constants";
import { Session } from "@src/interfaces/models";
import { cn } from "@utilities";

import { useToastStore } from "@store";

import { IconButton, Loader, Td, Tr } from "@components/atoms";
import { SessionsTableState } from "@components/organisms/deployments";

import { ActionStoppedIcon, TrashIcon } from "@assets/image/icons";

interface SessionRowRendererProps {
	session: Session;
	sessionId?: string;
	measure?: () => void;
	itemData: {
		onSelectedSessionId: (id: string) => void;
		onSessionRemoved: () => void;
		openSession: (id: string) => void;
		showDeleteModal: (id: string) => void;
	};
}

interface SessionsTableRowProps {
	session: Session;
	sessionId?: string;
	isSelected: boolean;
	measure?: () => void;
	itemData: {
		onSelectedSessionId: (id: string) => void;
		onSessionRemoved: () => void;
		openSession: (id: string) => void;
		showDeleteModal: (id: string) => void;
	};
}

export const SessionsTableRow = memo(
	({ session, isSelected, measure, itemData }: SessionsTableRowProps) => {
		const { t: tErrors } = useTranslation("errors");
		const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
		const addToast = useToastStore((state) => state.addToast);
		const [isStopping, setIsStopping] = useState(false);

		const sessionRowClass = cn("group flex cursor-pointer items-center hover:bg-gray-1300", {
			"bg-black": isSelected,
		});

		const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			itemData.showDeleteModal(session.sessionId);
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
				t("actions.sessionStoppedSuccessfullyExtended", { sessionId: session.sessionId })
			);

			itemData.onSessionRemoved();
		};

		useEffect(() => {
			if (!measure) return;
			const timeout = setTimeout(() => measure(), 0);
			return () => clearTimeout(timeout);
		}, [measure]);

		const actionStoppedIconClass =
			session.state === SessionState.running ? "h-4 w-4 transition group-hover:fill-white" : "h-4 w-4 transition";

		if (!session?.sessionId) return null;

		return (
			<Tr className={sessionRowClass} onClick={() => itemData.openSession(session.sessionId)}>
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
	(prev, next) => prev.session.sessionId === next.session.sessionId && prev.isSelected === next.isSelected
);

SessionsTableRow.displayName = "SessionsTableRow";

export const SessionRowRenderer = ({ session, measure, sessionId, itemData }: SessionRowRendererProps) => (
	<SessionsTableRow
		isSelected={session.sessionId === sessionId}
		itemData={itemData}
		measure={measure}
		session={session}
		sessionId={sessionId}
	/>
);
