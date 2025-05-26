import React, { useCallback, useMemo } from "react";

import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { SessionsTableListProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { TBody } from "@components/atoms";
import { VirtualListWrapper } from "@components/organisms";
import { SessionsTableRow } from "@components/organisms/deployments/sessions";

export const SessionsTableList = ({
	onSelectedSessionId,
	onSessionRemoved,
	sessions,
	openSession,
}: SessionsTableListProps) => {
	const { sessionId } = useParams();
	const { openModal } = useModalStore();

	const showDeleteModal = useCallback(
		(id: string) => {
			onSelectedSessionId(id);
			openModal(ModalName.deleteDeploymentSession, id);
		},
		[onSelectedSessionId, openModal]
	);

	const itemData = useMemo(
		() => ({
			onSessionRemoved,
			openSession,
			sessionId,
			showDeleteModal,
			onSelectedSessionId,
		}),
		[onSessionRemoved, openSession, sessionId, showDeleteModal, onSelectedSessionId]
	);

	return (
		<TBody className="h-full">
			<VirtualListWrapper
				className="scrollbar"
				estimateSize={() => 40}
				items={sessions}
				rowRenderer={(session, _index, measure) => (
					<SessionsTableRow
						isSelected={session.sessionId === sessionId}
						itemData={itemData}
						key={session.sessionId}
						measure={measure}
						session={session}
					/>
				)}
			/>
		</TBody>
	);
};
