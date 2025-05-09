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
			<div className="overflow-x-auto break-words whitespace-pre-wrap scrollbar-visible grow">{cleanedPrint}</div>
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

		if (isInitialLoadRef.current) {
			setTimeout(() => {
				if (parentRef.current) {
					parentRef.current.scrollTop = parentRef.current.scrollHeight;
					isInitialLoadRef.current = false;
				}
			}, 100);
		}
	}, [outputs]);

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

			setTimeout(() => {
				if (parentRef.current) {
					parentRef.current.scrollTop = parentRef.current.scrollHeight;
					isInitialLoadRef.current = false;
				}
			}, 100);
		} catch {
			if (parentRef.current) {
				parentRef.current.style.overscrollBehavior = "auto";
			}
			loadingMoreRef.current = false;
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

	useEffect(() => {
		if (!topLoaderRef.current || !nextPageToken) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !loadingMoreRef.current && nextPageToken) {
						loadMoreWithScroll();
					}
				});
			},
			{
				root: parentRef.current,
				rootMargin: "600px 0px 0px 0px",
			}
		);

		observer.observe(topLoaderRef.current);

		return () => observer.disconnect();
	}, [nextPageToken, loadMoreWithScroll]);

	return (
		<div className="h-full overflow-hidden">
			<div className="h-full overflow-auto" ref={parentRef}>
				{outputs.length > 0 ? (
					<div
						className="relative w-full"
						style={{
							height: `${virtualizer.getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						<div className="absolute top-0 left-0 w-full h-10 opacity-0" ref={topLoaderRef} />

						{virtualizer.getVirtualItems().map((virtualItem) => (
							<div
								className="absolute top-0 left-0 w-full"
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
					<div className="flex items-center justify-center h-full py-5 text-xl font-semibold">
						{t("noLogsFound")}
					</div>
				) : null}
			</div>
		</div>
	);
};
