import React, { useCallback, useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import { SessionLogType, EventListenerName } from "@src/enums";
import { useVirtualizedList, useEventListener } from "@src/hooks";
import { SessionActivity } from "@src/interfaces/models";
import { cn } from "@src/utilities";

import { Frame } from "@components/atoms";
import { ActivityRow, SingleActivityInfo } from "@components/organisms/deployments/sessions/tabs/activities";

export const ActivityList = () => {
	const [selectedActivity, setSelectedActivity] = useState<SessionActivity>();
	const parentRef = useRef<HTMLDivElement>(null);
	const initialScrollAppliedRef = useRef(false);
	const prevActivitiesLengthRef = useRef(0);
	const isInitialLoadRef = useRef(true);

	const {
		items: activities,
		loadMoreRows,
		nextPageToken,
		t,
	} = useVirtualizedList<SessionActivity>(SessionLogType.Activity);

	const handleScrollChange = useCallback(() => {
		if (!parentRef.current || !nextPageToken || selectedActivity) return;

		if (parentRef.current.scrollTop < parentRef.current.clientHeight * 0.1) {
			loadMoreRows();
		}
	}, [loadMoreRows, nextPageToken, selectedActivity]);

	const virtualizer = useVirtualizer({
		count: activities.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 70,
		overscan: 5,
		measureElement: (element) => element.getBoundingClientRect().height,
	});

	useEffect(() => {
		if (!activities.length || selectedActivity) return;

		if (isInitialLoadRef.current && !initialScrollAppliedRef.current) {
			const timer = setTimeout(() => {
				if (parentRef.current) {
					parentRef.current.scrollTop = parentRef.current.scrollHeight;
					initialScrollAppliedRef.current = true;
					isInitialLoadRef.current = false;
				}
			}, 100);

			return () => clearTimeout(timer);
		}

		if (!isInitialLoadRef.current && activities.length > prevActivitiesLengthRef.current && parentRef.current) {
			const scrollElement = parentRef.current;

			virtualizer.measure();

			setTimeout(() => {
				if (
					scrollElement &&
					virtualizer.getTotalSize() > scrollElement.scrollTop + scrollElement.clientHeight
				) {
					const scrollAdjustment = virtualizer.getTotalSize() - prevActivitiesLengthRef.current * 70;
					if (scrollAdjustment > 0) {
						scrollElement.scrollTop += scrollAdjustment * 0.8; // Adjust by approximate new content height
					}
				}
			}, 50);
		}

		prevActivitiesLengthRef.current = activities.length;
	}, [activities, virtualizer, selectedActivity]);

	useEffect(() => {
		const scrollElement = parentRef.current;
		if (!scrollElement) return;

		const handleScroll = () => {
			handleScrollChange();
		};

		scrollElement.addEventListener("scroll", handleScroll);
		return () => {
			scrollElement.removeEventListener("scroll", handleScroll);
		};
	}, [handleScrollChange]);

	useEventListener(EventListenerName.selectSessionActivity, (event) => {
		setSelectedActivity(event.detail.activity);
	});

	const autoSizerClass = cn({ hidden: selectedActivity });

	return (
		<Frame className="mr-3 size-full rounded-b-none pb-0 transition">
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
