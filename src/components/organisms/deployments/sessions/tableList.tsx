import React, { useCallback, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import { ListOnItemsRenderedProps } from "react-window";

import { ModalName } from "@enums/components";
import { SessionsTableListProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { VirtualTable } from "@components/molecules";
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
			onSessionRemoved,
			openSessionLog,
			scrollDisplayed,
			selectedSessionId: sessionId,
			sessions,
			showDeleteModal,
		}),
		[sessions, sessionId, scrollDisplayed, openSessionLog, showDeleteModal, onSessionRemoved]
	);

	const itemsRendered = useCallback(
		(event: ListOnItemsRenderedProps, height: number) => {
			const totalSessionsHeight = sessions.length * 36;
			const hasScroll = height < totalSessionsHeight;
			onItemsRendered(event);
			setScrollDisplayed(hasScroll);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[sessions]
	);

	return (
		<AutoSizer>
			{({ height, width }) => (
				<VirtualTable
					height={height}
					itemCount={sessions.length}
					itemData={itemData}
					itemSize={36}
					onItemsRendered={(event) => itemsRendered(event, height)}
					row={SessionsTableRow}
					width={width}
				/>
			)}
		</AutoSizer>
	);
};
