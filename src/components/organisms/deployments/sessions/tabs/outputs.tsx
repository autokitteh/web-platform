import React, { memo, useEffect, useRef } from "react";

import { useVirtualizedList } from "@hooks/useVirtualizedList";
import { SessionLogType, EventListenerName } from "@src/enums";
import { useEventListener } from "@src/hooks";
import { SessionOutputLog } from "@src/interfaces/models";

import { VirtualListWrapper } from "@components/organisms";

const OutputRow = memo(({ log, measure, index }: { index: number; log: SessionOutputLog; measure: () => void }) => {
	const rowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = rowRef.current;
		if (!el) return;

		const observer = new ResizeObserver(() => {
			measure();
		});

		observer.observe(el);
		return () => observer.disconnect();
	}, [log, measure]);

	return (
		<div data-index={index} ref={rowRef}>
			<div className="mb-0.5 flex font-fira-code text-sm">
				<div className="mr-4 whitespace-nowrap text-gray-1550">[{log.time}]:</div>
				<div className="w-full overflow-x-auto whitespace-pre-wrap break-words">{log.print}</div>
			</div>
		</div>
	);
});

OutputRow.displayName = "OutputRow";

export const SessionOutputs = () => {
	const {
		items: outputs,
		loadMoreRows,
		nextPageToken,
		t,
		loading,
		frameRef,
	} = useVirtualizedList<SessionOutputLog>(SessionLogType.Output);

	useEventListener(EventListenerName.sessionLogViewerScrollToTop, () => {
		if (frameRef.current) {
			frameRef.current.scrollTo({ top: 0, behavior: "smooth" });
		}
	});

	return (
		<div className="scrollbar size-full">
			<VirtualListWrapper
				className="scrollbar"
				estimateSize={() => 44}
				isLoading={!!nextPageToken}
				items={outputs}
				loadMore={loadMoreRows}
				nextPageToken={nextPageToken}
				rowRenderer={(log, index, measure) => <OutputRow index={index} log={log} measure={measure} />}
			/>

			{!outputs.length && !loading ? (
				<div className="flex h-full items-center justify-center py-5 text-xl font-semibold">
					{t("noLogsFound")}
				</div>
			) : null}
		</div>
	);
};
