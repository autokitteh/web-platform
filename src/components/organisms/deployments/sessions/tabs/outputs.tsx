import React, { memo, useCallback, useEffect, useRef, useMemo } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import { SessionLogType } from "@src/enums";
import { useEventSubscription, useVirtualizedList } from "@src/hooks";
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
	} = useVirtualizedList<SessionOutputLog>(SessionLogType.Output);

	const loadingMoreRef = useRef(false);
	const scrollTimerRef = useRef<number | null>(null);
	const lastScrollTopRef = useRef(0);
	const lastLoadTimeRef = useRef(0);

	const outputs = useMemo(() => {
		return [...rawOutputs].reverse();
	}, [rawOutputs]);

	const parentRef = useRef<HTMLDivElement>(null);
	const topLoaderRef = useRef<HTMLDivElement>(null);
	const isInitialLoadRef = useRef(true);

	const virtualizer = useVirtualizer({
		count: outputs.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 60,
		overscan: 10,
		measureElement: (element) => element.getBoundingClientRect().height,
	});

	useEffect(() => {
		if (!outputs.length) return;

		if (!isInitialLoadRef.current) return;

		if (parentRef.current && !loading) {
			parentRef.current.scrollTop = parentRef.current.scrollHeight;
			isInitialLoadRef.current = false;
		}
	}, [outputs, loading]);

	const loadMoreWithScroll = useCallback(async () => {
		const now = Date.now();
		const timeSinceLastLoad = now - lastLoadTimeRef.current;
		if (loadingMoreRef.current || loading || !nextPageToken || timeSinceLastLoad < 1000) return;

		loadingMoreRef.current = true;
		lastLoadTimeRef.current = now;

		try {
			if (parentRef.current) {
				parentRef.current.style.overscrollBehavior = "none";
			}

			await loadMoreRows();
		} catch {
			if (parentRef.current) {
				parentRef.current.style.overscrollBehavior = "auto";
			}
			loadingMoreRef.current = false;
		} finally {
			if (parentRef.current && !loading) {
				parentRef.current.scrollTop = parentRef.current.scrollHeight;
				isInitialLoadRef.current = false;
			}
		}
	}, [loading, loadMoreRows, nextPageToken]);

	const handleScroll = useCallback(() => {
		if (!parentRef.current || !nextPageToken || loadingMoreRef.current) return;

		const scrollTop = parentRef.current.scrollTop;
		const scrollingUp = scrollTop < lastScrollTopRef.current;
		lastScrollTopRef.current = scrollTop;

		if (scrollTimerRef.current !== null) {
			window.clearTimeout(scrollTimerRef.current);
		}

		if (scrollTop < 100 && scrollingUp) {
			scrollTimerRef.current = window.setTimeout(() => {
				loadMoreWithScroll();
				scrollTimerRef.current = null;
			}, 150);
		}
	}, [nextPageToken, loadMoreWithScroll]);

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
						<div className="absolute left-0 top-0 h-10 w-full opacity-0" ref={topLoaderRef} />

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
