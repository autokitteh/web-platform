import React, { useCallback, useMemo } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { AutoSizer, List, ListRowRenderer } from "react-virtualized";

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

	const openSessionLog = useCallback(
		(sessionId: string) => {
			navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}`);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[deploymentId]
	);

	const showDeleteModal = useCallback((id: string) => {
		onSelectedSessionId(id);
		openModal(ModalName.deleteDeploymentSession);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const itemData = useMemo(
		() => ({
			onSessionRemoved,
			openSessionLog,
			selectedSessionId: sessionId,
			sessions,
			showDeleteModal,
		}),
		[sessions, sessionId, openSessionLog, showDeleteModal, onSessionRemoved]
	);

	const rowRenderer: ListRowRenderer = ({ index, key, style }) => (
		<SessionsTableRow data={itemData} index={index} key={key} style={style} />
	);

	return (
		<AutoSizer>
			{({ height, width }) => (
				<List
					height={height - height * 0.1}
					onRowsRendered={({ overscanStartIndex, overscanStopIndex, startIndex, stopIndex }) =>
						onItemsRendered({
							visibleStartIndex: startIndex,
							visibleStopIndex: stopIndex,
							overscanStartIndex,
							overscanStopIndex,
						})
					}
					rowCount={sessions.length}
					rowHeight={40}
					rowRenderer={rowRenderer}
					width={width}
				/>
			)}
		</AutoSizer>
	);
};
