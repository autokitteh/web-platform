import React, { useEffect, useMemo, useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { SessionsTableListProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { TBody } from "@components/atoms";
import { SessionsTableRow } from "@components/organisms/deployments/sessions";

export const SessionsTableList = ({
	onItemsRendered,
	onSelectedSessionId,
	onSessionRemoved,
	sessions,
	openSession,
	hideSourceColumn,
	hideActionsColumn,
}: SessionsTableListProps) => {
	const { sessionId } = useParams();
	const { openModal } = useModalStore();
	const parentRef = useRef<HTMLDivElement>(null);

	const showDeleteModal = useMemo(
		() => (id: string) => {
			onSelectedSessionId(id);
			openModal(ModalName.deleteDeploymentSession, id);
		},
		[onSelectedSessionId, openModal]
	);

	const itemData = useMemo(
		() => ({
			onSessionRemoved,
			openSession,
			selectedSessionId: sessionId,
			sessions,
			showDeleteModal,
			hideSourceColumn,
			hideActionsColumn,
		}),
		[sessions, sessionId, openSession, showDeleteModal, onSessionRemoved, hideSourceColumn, hideActionsColumn]
	);

	const virtualizer = useVirtualizer({
		count: sessions.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 40,
		overscan: 5,
	});

	useEffect(() => {
		const virtualItems = virtualizer.getVirtualItems();
		if (virtualItems.length > 0) {
			const startIndex = virtualItems[0].index;
			const stopIndex = virtualItems[virtualItems.length - 1].index;
			onItemsRendered({
				visibleStartIndex: startIndex,
				visibleStopIndex: stopIndex,
				overscanStartIndex: Math.max(0, startIndex - 5),
				overscanStopIndex: Math.min(sessions.length - 1, stopIndex + 5),
			});
		}
	}, [virtualizer, onItemsRendered, sessions.length]);

	return (
		<TBody className="h-full overflow-auto" ref={parentRef}>
			<div
				className="relative w-full"
				style={{
					height: `${virtualizer.getTotalSize()}px`,
				}}
			>
				{virtualizer.getVirtualItems().map((virtualItem) => (
					<div
						className="absolute left-0 top-0 w-full"
						key={virtualItem.key}
						style={{
							height: `${virtualItem.size}px`,
							transform: `translateY(${virtualItem.start}px)`,
						}}
					>
						<SessionsTableRow data={itemData} index={virtualItem.index} style={{ height: "100%" }} />
					</div>
				))}
			</div>
		</TBody>
	);
};
