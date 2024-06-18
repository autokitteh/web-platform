import React, { useCallback, useState, useMemo } from "react";
import { SessionsTableRow } from "@components/organisms/deployments/sessions";
import { ModalName } from "@enums/components";
import { SessionsTableListProps } from "@interfaces/components";
import { useModalStore } from "@store";
import { useNavigate, useParams } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List, ListOnItemsRenderedProps } from "react-window";

export const SessionsTableList = ({
	sessions,
	onItemsRendered,
	onScroll,
	onSelectedSessionId,
}: SessionsTableListProps) => {
	const { projectId, deploymentId, sessionId } = useParams();
	const navigate = useNavigate();
	const { openModal } = useModalStore();
	const [scrollDisplayed, setScrollDisplayed] = useState(false);

	const openSessionLog = useCallback((sessionId: string) => {
		navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}`);
	}, []);

	const showDeleteModal = useCallback((id: string) => {
		onSelectedSessionId(id);
		openModal(ModalName.deleteDeploymentSession);
	}, []);

	const itemData = useMemo(
		() => ({
			sessions,
			selectedSessionId: sessionId,
			scrollDisplayed,
			openSessionLog,
			showDeleteModal,
		}),
		[sessions, sessionId, scrollDisplayed, openSessionLog, showDeleteModal]
	);

	const itemsRendered = useCallback(
		(event: ListOnItemsRenderedProps, height: number) => {
			const totalSessionsHeight = sessions.length * 48;
			const hasScroll = height < totalSessionsHeight;
			onItemsRendered(event);
			setScrollDisplayed(hasScroll);
		},
		[sessions]
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
						itemKey={(idx) => sessions[idx].sessionId}
						itemSize={48}
						onItemsRendered={(e) => itemsRendered(e, height)}
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
