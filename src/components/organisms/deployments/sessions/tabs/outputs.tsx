import React, { memo, useCallback, useEffect, useRef, useMemo } from "react";

import { SessionLogType } from "@src/enums";
import { useEventSubscription, useVirtualizedSessionList } from "@src/hooks";
import { SessionOutputLog } from "@src/interfaces/models";

const OutputRow = memo(({ log }: { log: SessionOutputLog }) => {
	const cleanedPrint = log.print.replace(/^\n+|\n+$/g, "");

	return (
		<div className="flex w-full px-4 py-2 font-fira-code">
			<div className="mr-5 shrink-0 whitespace-nowrap text-gray-1550">[{log.time}]: </div>
			<div className="scrollbar-visible grow overflow-x-auto whitespace-pre-wrap break-words">{cleanedPrint}</div>
		</div>
	);
});

OutputRow.displayName = "OutputRow";

export const SessionOutputs = () => {
	const {
		items: rawOutputs,
		loadMoreRows,
		nextPageToken,
		t,
		loading,
		parentRef,
		virtualizer,
	} = useVirtualizedSessionList<SessionOutputLog>(SessionLogType.Output);

	const scrollStateRef = useRef({
		isLoading: false,
		lastLoadTime: 0,
		lastScrollTop: 0,
		isInitialLoad: true,
	});

	const outputs = useMemo(() => {
		return [...rawOutputs].reverse();
	}, [rawOutputs]);

	useEffect(() => {
		if (!outputs.length || !scrollStateRef.current.isInitialLoad) return;

		if (parentRef.current && !loading) {
			parentRef.current.scrollTop = parentRef.current.scrollHeight;
			scrollStateRef.current.isInitialLoad = false;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [outputs, loading]);

	const loadMoreWithScroll = useCallback(async () => {
		const now = Date.now();
		const { isLoading, lastLoadTime } = scrollStateRef.current;

		if (isLoading || loading || !nextPageToken || now - lastLoadTime < 1000) return;

		scrollStateRef.current.isLoading = true;
		scrollStateRef.current.lastLoadTime = now;

		try {
			if (parentRef.current) {
				parentRef.current.style.overscrollBehavior = "none";
			}

			await loadMoreRows();
		} catch {
			if (parentRef.current) {
				parentRef.current.style.overscrollBehavior = "auto";
			}
		} finally {
			scrollStateRef.current.isLoading = false;
			if (parentRef.current && !loading) {
				parentRef.current.scrollTop = parentRef.current.scrollHeight;
				scrollStateRef.current.isInitialLoad = false;
			}
		}
	}, [loading, nextPageToken, loadMoreRows, parentRef]);

	const handleScroll = useCallback(() => {
		if (!parentRef.current || !nextPageToken || scrollStateRef.current.isLoading) return;

		const scrollTop = parentRef.current.scrollTop;
		const scrollingUp = scrollTop < scrollStateRef.current.lastScrollTop;
		scrollStateRef.current.lastScrollTop = scrollTop;

		if (scrollTop < 100 && scrollingUp) {
			loadMoreWithScroll();
		}
	}, [nextPageToken, loadMoreWithScroll, parentRef]);

	useEventSubscription(parentRef, "scroll", handleScroll);

	return (
		<div className="h-full overflow-hidden">
			<div className="scrollbar-visible h-full overflow-auto" ref={parentRef}>
				{outputs.length > 0 ? (
					<div
						className="relative w-full"
						style={{
							height: `${virtualizer.getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						{virtualizer.getVirtualItems().map((virtualItem) => (
							<div
								className="absolute left-0 top-0 w-full"
								data-index={virtualItem.index}
								key={virtualItem.key}
								ref={virtualizer.measureElement}
								style={{
									transform: `translateY(${virtualItem.start}px)`,
								}}
							>
								<OutputRow log={outputs[virtualItem.index]} />
							</div>
						))}
					</div>
				) : !loading ? (
					<div className="flex h-full items-center justify-center py-5 text-xl font-semibold">
						{t("noLogsFound")}
					</div>
				) : null}
			</div>
		</div>
	);
};
