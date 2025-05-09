import React, { memo, useCallback, useEffect, useRef, useMemo } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import { SessionLogType } from "@src/enums";
import { useSafeEventListener, useVirtualizedList } from "@src/hooks";
import { SessionOutputLog } from "@src/interfaces/models";

// Enhanced OutputRow component with line break trimming
const OutputRow = memo(({ log }: { log: SessionOutputLog }) => {
	// Trim line breaks from beginning and end of the print content
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

	// Used to keep track of whether we're in a loading process
	const loadingMoreRef = useRef(false);
	// Timer to manage debouncing scroll events
	const scrollTimerRef = useRef<number | null>(null);
	// Last known scroll position to detect direction
	const lastScrollTopRef = useRef(0);
	// Time of last load request
	const lastLoadTimeRef = useRef(0);

	// Reverse the outputs array to display them in chronological order
	const outputs = useMemo(() => {
		return [...rawOutputs].reverse();
	}, [rawOutputs]);

	const parentRef = useRef<HTMLDivElement>(null);
	const topLoaderRef = useRef<HTMLDivElement>(null);
	const isInitialLoadRef = useRef(true);

	// Set up the virtualizer with dynamic measurement
	const virtualizer = useVirtualizer({
		count: outputs.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 60,
		overscan: 10,
		measureElement: (element) => element.getBoundingClientRect().height,
	});

	// For initial load - scroll to bottom
	useEffect(() => {
		if (!outputs.length) return;

		// First time load - scroll to bottom
		if (isInitialLoadRef.current) {
			setTimeout(() => {
				if (parentRef.current) {
					parentRef.current.scrollTop = parentRef.current.scrollHeight;
					isInitialLoadRef.current = false;
				}
			}, 100);
		}
	}, [outputs]);

	// Custom function to load more data with controlled scrolling
	const loadMoreWithScroll = useCallback(async () => {
		// Prevent rapid multiple loads
		const now = Date.now();
		const timeSinceLastLoad = now - lastLoadTimeRef.current;

		// Don't load if already loading or loaded recently (within last 1000ms)
		if (loadingMoreRef.current || loading || !nextPageToken || timeSinceLastLoad < 1000) return;

		loadingMoreRef.current = true;
		lastLoadTimeRef.current = now;

		try {
			// Immediately stop any inertial scrolling
			if (parentRef.current) {
				// This prevents further scrolling due to momentum
				parentRef.current.style.overscrollBehavior = "none";
			}

			await loadMoreRows();

			setTimeout(() => {
				if (parentRef.current) {
					parentRef.current.scrollTop = parentRef.current.scrollHeight;
					isInitialLoadRef.current = false;
				}
			}, 100);
			// After loading completes, force scroll to a safe position
			// setTimeout(() => {
			// 	if (parentRef.current) {
			// 		// Force scroll down to a position well below the trigger zone
			// 		const targetScrollPosition = Math.max(500, parentRef.current.clientHeight / 2);
			// 		parentRef.current.scrollTop = targetScrollPosition;

			// 		// Re-enable normal scrolling after a delay
			// 		setTimeout(() => {
			// 			if (parentRef.current) {
			// 				parentRef.current.style.overscrollBehavior = "auto";
			// 				loadingMoreRef.current = false;
			// 			}
			// 		}, 600);
			// 	} else {
			// 		loadingMoreRef.current = false;
			// 	}
			// }, 200);
		} catch {
			if (parentRef.current) {
				parentRef.current.style.overscrollBehavior = "auto";
			}
			loadingMoreRef.current = false;
		}
	}, [loading, loadMoreRows, nextPageToken]);

	// Handle scroll events with debounce and direction detection
	const handleScroll = useCallback(() => {
		if (!parentRef.current || !nextPageToken || loadingMoreRef.current) return;

		const scrollTop = parentRef.current.scrollTop;
		const scrollingUp = scrollTop < lastScrollTopRef.current;
		lastScrollTopRef.current = scrollTop;

		// Clear any existing scroll timer
		if (scrollTimerRef.current !== null) {
			window.clearTimeout(scrollTimerRef.current);
		}

		// Only proceed if we're near the top and scrolling upward
		if (scrollTop < 100 && scrollingUp) {
			// Use a small timeout to ensure we're not responding to every scroll event
			scrollTimerRef.current = window.setTimeout(() => {
				loadMoreWithScroll();
				scrollTimerRef.current = null;
			}, 150);
		}
	}, [nextPageToken, loadMoreWithScroll]);

	// Set up scroll event handler
	useSafeEventListener(parentRef, "scroll", handleScroll);

	// Set up intersection observer as backup for infinite scrolling
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
				rootMargin: "600px 0px 0px 0px", // Increased margin to detect earlier
				threshold: 0.1,
			}
		);

		observer.observe(topLoaderRef.current);

		return () => observer.disconnect();
	}, [nextPageToken, loadMoreWithScroll]);

	return (
		<div className="scrollbar mt-4 size-full">
			<div className="size-full overflow-auto" ref={parentRef}>
				{outputs.length > 0 ? (
					<div
						className="relative w-full"
						style={{
							height: `${virtualizer.getTotalSize()}px`,
							width: "100%",
							position: "relative",
						}}
					>
						{/* Top loader element that triggers more data loading when visible */}
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
