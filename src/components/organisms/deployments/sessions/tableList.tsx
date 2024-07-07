import { SessionsTableRow } from "@components/organisms/deployments/sessions";
import { ModalName } from "@enums/components";
import { SessionsTableListProps } from "@interfaces/components";
import { useModalStore } from "@store";
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List, ListOnItemsRenderedProps } from "react-window";

export const SessionsTableList = ({
	onItemsRendered,
	onScroll,
	onSelectedSessionId,
	sessions,
}: SessionsTableListProps) => {
	const { deploymentId, projectId, sessionId } = useParams();
	const navigate = useNavigate();
	const { openModal } = useModalStore();
	const [scrollDisplayed, setScrollDisplayed] = useState(false);

	const openSessionLog = useCallback((sessionId: string) => {
		navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const showDeleteModal = useCallback((id: string) => {
		onSelectedSessionId(id);
		openModal(ModalName.deleteDeploymentSession);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const itemData = useMemo(
		() => ({
			openSessionLog,
			scrollDisplayed,
			selectedSessionId: sessionId,
			sessions,
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
						itemKey={(index) => sessions[index].sessionId}
						itemSize={38}
						onItemsRendered={(event) => itemsRendered(event, height)}
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
