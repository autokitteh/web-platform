import React, { memo, CSSProperties } from "react";
import { TrashIcon } from "@assets/image/icons";
import { Tr, Td, IconButton } from "@components/atoms";
import { SessionsTableState } from "@components/organisms/deployments";
import { SessionsTableRowProps } from "@interfaces/components";
import { cn } from "@utilities";
import moment from "moment";
import { areEqual } from "react-window";

export const SessionsTableRow = memo(
	({ data, index, style }: { data: SessionsTableRowProps; index: number; style: CSSProperties }) => {
		const { sessions, openSessionLog, showDeleteModal, selectedSessionId } = data;
		const session = sessions[index];
		const sessionRowClass = (id: string) =>
			cn("group cursor-pointer hover:bg-gray-800", { "bg-black": id === selectedSessionId });

		return (
			session && (
				<Tr
					className={sessionRowClass(session.sessionId)}
					onClick={() => openSessionLog(session.sessionId)}
					style={style}
				>
					<Td>{moment(session.createdAt).utc().format("YYYY-MM-DD HH:mm:ss")}</Td>
					<Td className="text-green-accent">
						<SessionsTableState sessionState={session.state} />
					</Td>
					<Td className="border-r-0">{session.sessionId}</Td>
					<Td className="max-w-12 border-0 pr-1.5 justify-end">
						<IconButton onClick={showDeleteModal}>
							<TrashIcon className="w-3 h-3 fill-white" />
						</IconButton>
					</Td>
				</Tr>
			)
		);
	},
	areEqual
);

SessionsTableRow.displayName = "SessionsTableRow";
