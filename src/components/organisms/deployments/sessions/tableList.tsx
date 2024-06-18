import React, { useCallback, useMemo, useState, useEffect } from "react";
import { SessionsTableRow } from "@components/organisms/deployments/sessions";
import { ModalName } from "@enums/components";
import { SessionsTableListProps } from "@interfaces/components";
import { useModalStore } from "@store";
import { useNavigate, useParams } from "react-router-dom";
import { FixedSizeList as List } from "react-window";

export const SessionsTableList = ({ sessions, frameRef, onItemsRendered }: SessionsTableListProps) => {
	const { projectId, deploymentId, sessionId } = useParams();
	const navigate = useNavigate();
	const { openModal } = useModalStore();

	const [listHeight, setListHeight] = useState(400);

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

	useEffect(() => {
		if (frameRef?.current) {
			const frameHeight = frameRef.current.clientHeight - 100;
			const newHeight = sessions.length * 48 > frameHeight ? frameHeight : sessions.length * 48;
			setListHeight(newHeight);
		}
	}, [sessions, frameRef]);

	return (
		<div>
			<List
				className="scrollbar"
				height={listHeight}
				itemCount={sessions.length}
				itemData={itemData}
				itemKey={(idx) => sessions?.[idx]?.sessionId || 0}
				itemSize={48}
				onItemsRendered={onItemsRendered}
				width="100%"
			>
				{SessionsTableRow}
			</List>
		</div>
	);
};
