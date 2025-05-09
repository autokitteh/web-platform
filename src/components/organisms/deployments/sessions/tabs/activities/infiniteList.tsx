import React, { useCallback, useEffect, useRef, useState } from "react";

import { SessionLogType } from "@src/enums";
import { useEventSubscription, useVirtualizedSessionList } from "@src/hooks";
import { SessionActivity } from "@src/interfaces/models";
import { cn } from "@src/utilities";

import { Frame } from "@components/atoms";
import { ActivityRow, SingleActivityInfo } from "@components/organisms/deployments/sessions/tabs/activities";

export const ActivityList = () => {
	const [selectedActivity, setSelectedActivity] = useState<SessionActivity>();

	const {
		items: activities,
		loadMoreRows,
		nextPageToken,
		t,
		loading,
		parentRef,
		virtualizer,
	} = useVirtualizedSessionList<SessionActivity>(SessionLogType.Activity);

	const scrollStateRef = useRef({
		isLoading: false,
		lastLoadTime: 0,
		lastScrollTop: 0,
		isInitialLoad: true,
	});

	useEffect(() => {
		if (!activities.length || selectedActivity || !scrollStateRef.current.isInitialLoad) return;

		if (parentRef.current && !loading) {
			parentRef.current.scrollTop = parentRef.current.scrollHeight;
			scrollStateRef.current.isInitialLoad = false;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activities, loading, selectedActivity]);

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
			scrollStateRef.current.isLoading = false;
		} finally {
			if (parentRef.current && !loading) {
				parentRef.current.scrollTop = parentRef.current.scrollHeight;
				scrollStateRef.current.isInitialLoad = false;
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading, nextPageToken, parentRef]);

	const handleScroll = useCallback(() => {
		if (!parentRef.current || !nextPageToken || scrollStateRef.current.isLoading || selectedActivity) return;

		const scrollTop = parentRef.current.scrollTop;
		const scrollingUp = scrollTop < scrollStateRef.current.lastScrollTop;
		scrollStateRef.current.lastScrollTop = scrollTop;

		if (scrollTop < parentRef.current.clientHeight * 0.1 && scrollingUp) {
			loadMoreWithScroll();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [parentRef, nextPageToken, selectedActivity]);

	useEventSubscription(parentRef, "scroll", handleScroll);

	const autoSizerClass = cn({ hidden: selectedActivity });

	return (
		<Frame className="mr-3 h-4/5 w-full rounded-b-none pb-0 transition">
			{selectedActivity ? (
				<SingleActivityInfo activity={selectedActivity} setActivity={setSelectedActivity} />
			) : null}

			<div className={cn("h-full overflow-auto", autoSizerClass)} ref={parentRef}>
				{activities.length > 0 ? (
					<div
						className="relative w-full"
						style={{
							height: `${virtualizer.getTotalSize()}px`,
							paddingTop: "10px",
							paddingBottom: "10px",
						}}
					>
						{virtualizer.getVirtualItems().map((virtualItem) => (
							<div
								className="absolute left-0 top-0 w-full"
								key={virtualItem.key}
								ref={virtualizer.measureElement}
								style={{
									transform: `translateY(${virtualItem.start}px)`,
								}}
							>
								<ActivityRow
									data={activities[virtualItem.index]}
									index={virtualItem.index}
									setActivity={setSelectedActivity}
									style={{ width: "100%" }}
								/>
							</div>
						))}
					</div>
				) : (
					<div className="flex h-full items-center justify-center py-5 text-xl font-semibold">
						{t("noActivitiesFound")}
					</div>
				)}
			</div>
		</Frame>
	);
};
