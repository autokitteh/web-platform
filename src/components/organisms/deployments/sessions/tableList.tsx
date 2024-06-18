import React, { useCallback, useMemo } from "react";
import { SessionsTableRow } from "@components/organisms/deployments/sessions";
import { ModalName } from "@enums/components";
import { useModalStore } from "@store";
import { Session } from "@type/models";
import { useNavigate, useParams } from "react-router-dom";
import { FixedSizeList as List } from "react-window";

export const SessionsTableList = ({ sessions }: { sessions: Session[] }) => {
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
		<List
			className="scrollbar"
			height={700}
			itemCount={sessions.length}
			itemData={itemData}
			itemKey={(idx) => sessions?.[idx]?.sessionId || 0}
			itemSize={48}
			width="100%"
		>
			{SessionsTableRow}
		</List>
	);
};
