import React, { useCallback, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { AutoSizer, Column, Table } from "react-virtualized";

import { ModalName } from "@enums/components";
import { SessionsTableListProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { SessionsTableRow } from "@components/organisms/deployments/sessions";

export const SessionsTableList = ({
	onItemsRendered,
	onSelectedSessionId,
	onSessionRemoved,
	sessions,
}: SessionsTableListProps) => {
	const { deploymentId, projectId, sessionId } = useParams();
	const navigate = useNavigate();
	const { openModal } = useModalStore();
	const [scrollDisplayed, setScrollDisplayed] = useState(false);

	const openSessionLog = useCallback(
		(sessionId: string) => {
			navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}`);
		},
		[navigate, projectId, deploymentId]
	);

	const showDeleteModal = useCallback(
		(id: string) => {
			onSelectedSessionId(id);
			openModal(ModalName.deleteDeploymentSession);
		},
		[onSelectedSessionId, openModal]
	);

	const itemData = useMemo(
		() => ({
			onSessionRemoved,
			openSessionLog,
			scrollDisplayed,
			selectedSessionId: sessionId,
			sessions,
			showDeleteModal,
		}),
		[sessions, sessionId, scrollDisplayed, openSessionLog, showDeleteModal, onSessionRemoved]
	);

	const rowGetter = ({ index }: { index: number }) => sessions[index];

	const rowRenderer = ({ index, key, style }: { index: number; key: string; style: object }) => {
		const session = sessions[index];
		if (!session) return null;

		return (
			<div key={key} style={style}>
				<SessionsTableRow data={itemData} index={index} style={style} />
			</div>
		);
	};

	return (
		<AutoSizer>
			{({ height, width }) => (
				<Table
					headerHeight={0}
					height={height}
					onRowsRendered={({ overscanStartIndex, overscanStopIndex, startIndex, stopIndex }) =>
						onItemsRendered({
							overscanStartIndex,
							overscanStopIndex,
							visibleStartIndex: startIndex,
							visibleStopIndex: stopIndex,
						})
					}
					onScroll={({ clientHeight, scrollHeight }) => {
						const hasScroll = scrollHeight > clientHeight;
						setScrollDisplayed(hasScroll);
					}}
					rowCount={sessions.length}
					rowGetter={rowGetter}
					rowHeight={36}
					rowRenderer={rowRenderer}
					width={width}
				>
					<Column dataKey="sessionId" label="Session ID" width={width} />
				</Table>
			)}
		</AutoSizer>
	);
};
