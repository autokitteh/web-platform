import React, { useRef, memo, useEffect } from "react";

import { SessionLogType, EventListenerName } from "@src/enums";
import { useVirtualizedList, useEventListener, triggerEvent } from "@src/hooks";
import { SessionActivity } from "@src/interfaces/models";

import { VirtualListWrapper } from "@components/organisms";
import { ActivityRow } from "@components/organisms/deployments/sessions/tabs/activities";

const ActivityListItem = memo(
	({
		activity,
		onClick,
		index,
		measure,
	}: {
		activity: SessionActivity;
		index: number;
		measure: () => void;
		onClick: () => void;
	}) => {
		const ref = useRef<HTMLDivElement>(null);

		useEffect(() => {
			if (!ref.current) return;
			const observer = new ResizeObserver(() => measure());
			observer.observe(ref.current);
			return () => observer.disconnect();
		}, [measure]);

		return (
			<div data-index={index} ref={ref}>
				<ActivityRow
					data={activity}
					index={index}
					setActivity={() => {
						onClick();
					}}
				/>
			</div>
		);
	}
);

ActivityListItem.displayName = "ActivityListItem";

function isSessionActivity(log: unknown): log is SessionActivity {
	return typeof log === "object" && log !== null && "functionName" in log && "key" in log && "status" in log;
}

export const ActivityList = () => {
	const {
		items: activities,
		loadMoreRows,
		nextPageToken,
		frameRef,
	} = useVirtualizedList(SessionLogType.Activity, 60);

	useEventListener(EventListenerName.sessionLogViewerScrollToTop, () => {
		if (frameRef.current) frameRef.current.scrollTo({ top: 0, behavior: "smooth" });
	});

	return (
		<VirtualListWrapper
			className="scrollbar size-full"
			estimateSize={() => 60}
			isLoading={!!nextPageToken}
			items={activities}
			loadMore={loadMoreRows}
			nextPageToken={nextPageToken}
			rowRenderer={(activity, index, measure) =>
				isSessionActivity(activity) ? (
					<ActivityListItem
						activity={activity}
						index={index}
						measure={measure}
						onClick={() => {
							triggerEvent(EventListenerName.selectSessionActivity, { activity });
						}}
					/>
				) : null
			}
		/>
	);
};
