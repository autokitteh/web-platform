import React, { useCallback, useMemo } from "react";
import { SessionsTableRow } from "@components/organisms/deployments/sessions";
import { ModalName } from "@enums/components";
import { SessionsTableListProps } from "@interfaces/components";
import { useModalStore } from "@store";
import { useNavigate, useParams } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

export const SessionsTableList = ({ sessions, onItemsRendered, onScroll }: SessionsTableListProps) => {
	const { projectId, deploymentId, sessionId } = useParams();
	const navigate = useNavigate();
	const { openModal } = useModalStore();

	const openSessionLog = useCallback((sessionId: string) => {
		navigate(`/projects/${projectId}/deployments/${deploymentId}/${sessionId}`);
	}, []);

	const showDeleteModal = useCallback(() => {
		openModal(ModalName.deleteDeploymentSession);
	}, []);

	const itemData = useMemo(
		() => ({
			sessions,
			selectedSessionId: sessionId,
			openSessionLog,
			showDeleteModal,
		}),
		[sessions, sessionId, openSessionLog, showDeleteModal]
	);

	return (
		<div className="h-full">
			<AutoSizer>
				{({ height, width }) => (
					<List
						className="scrollbar"
						height={height}
						itemCount={sessions.length}
						itemData={itemData}
						itemKey={(idx) => sessions?.[idx]?.sessionId || 0}
						itemSize={48}
						onItemsRendered={onItemsRendered}
						onScroll={onScroll}
						width={width}
					>
						{SessionsTableRow}
					</List>
				)}
			</AutoSizer>
		</div>
	);
};
