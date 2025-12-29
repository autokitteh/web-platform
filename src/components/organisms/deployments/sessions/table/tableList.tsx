import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { useParams } from "react-router-dom";
import { AutoSizer, List, ListRowRenderer, ScrollParams } from "react-virtualized";

import { ModalName } from "@enums/components";
import { SessionsTableListProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { TBody } from "@components/atoms";
import { SessionsTableRow } from "@components/organisms/deployments/sessions";

const TOP_THRESHOLD = 48;
const ROW_HEIGHT = 40;

export const SessionsTableList = ({
	onItemsRendered,
	onSelectedSessionId,
	onSessionRemoved,
	onScrollPositionChange,
	sessions,
	openSession,
	hideSourceColumn,
	hideActionsColumn,
	listRef: externalListRef,
}: SessionsTableListProps) => {
	const { sessionId } = useParams();
	const { openModal } = useModalStore();
	const [resizeHeight, setResizeHeight] = useState(0);
	const internalListRef = useRef<List | null>(null);
	const lastScrollTopRef = useRef(0);

	useImperativeHandle(
		externalListRef,
		() => ({
			scrollToTop: () => {
				internalListRef.current?.scrollToPosition(0);
			},
		}),
		[]
	);

	const showDeleteModal = useCallback((id: string) => {
		onSelectedSessionId(id);
		openModal(ModalName.deleteDeploymentSession, id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	const rowRenderer: ListRowRenderer = ({ index, key, style }) => (
		<SessionsTableRow data={itemData} index={index} key={key} style={style} />
	);

	const handleResize = useCallback(({ height }: { height: number }) => {
		setResizeHeight(height - 20);
	}, []);

	const handleScroll = useCallback(
		({ scrollTop }: ScrollParams) => {
			lastScrollTopRef.current = scrollTop;
			const isAtTop = scrollTop <= TOP_THRESHOLD;
			onScrollPositionChange?.(isAtTop);
		},
		[onScrollPositionChange]
	);

	useEffect(() => {
		onScrollPositionChange?.(lastScrollTopRef.current <= TOP_THRESHOLD);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onScrollPositionChange]);

	return (
		<TBody className="h-full">
			<AutoSizer onResize={handleResize}>
				{({ height, width }) => (
					<List
						className="scrollbar"
						height={resizeHeight || height * 0.9}
						onRowsRendered={({ overscanStartIndex, overscanStopIndex, startIndex, stopIndex }) =>
							onItemsRendered({
								visibleStartIndex: startIndex,
								visibleStopIndex: stopIndex,
								overscanStartIndex,
								overscanStopIndex,
							})
						}
						onScroll={handleScroll}
						ref={internalListRef}
						rowCount={sessions.length}
						rowHeight={ROW_HEIGHT}
						rowRenderer={rowRenderer}
						width={width}
					/>
				)}
			</AutoSizer>
		</TBody>
	);
};
