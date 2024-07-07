import React, { CSSProperties, memo } from "react";

import moment from "moment";
import { areEqual } from "react-window";

import { TrashIcon } from "@assets/image/icons";
import { IconButton, Td, Tr } from "@components/atoms";
import { SessionsTableState } from "@components/organisms/deployments";
import { SessionsTableRowProps } from "@interfaces/components";
import { cn } from "@utilities";

export const SessionsTableRow = memo(
	({ data, index, style }: { data: SessionsTableRowProps; index: number; style: CSSProperties }) => {
		const { openSessionLog, scrollDisplayed, selectedSessionId, sessions, showDeleteModal } = data;
		const session = sessions[index];

		const sessionRowClass = (id: string) =>
			cn("group cursor-pointer hover:bg-gray-800", { "bg-black": id === selectedSessionId });
		const sessionLastTdClass = cn("justify-end border-0 max-w-20", { "mr-1.5": !scrollDisplayed });

		if (!session) {
			return null;
		}

		const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			showDeleteModal(session.sessionId);
		};

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
					<IconButton onClick={handleDeleteClick}>
						<TrashIcon className="fill-white h-3 w-3" />
					</IconButton>
				</Td>
			</Tr>
		);
	},
	areEqual
);

SessionsTableRow.displayName = "SessionsTableRow";
