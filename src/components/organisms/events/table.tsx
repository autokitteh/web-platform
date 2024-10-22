import React, { useCallback, useEffect, useId, useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { AutoSizer, ListRowProps } from "react-virtualized";

import { TableHeader } from "./table/header";
import { NoEventsSelected } from "./table/notSelected";
import { EventRow } from "./table/row";
import { VirtualizedList } from "./table/virtualizer";
import { useResize, useSort } from "@src/hooks";
import { useCacheStore } from "@src/store";
import { BaseEvent } from "@src/types/models";
import { cn } from "@src/utilities";

import { Frame, Loader, ResizeButton, TBody, Table } from "@components/atoms";

export const EventsTable = () => {
	const { t } = useTranslation("events");
	const {
		events,
		fetchEvents,
		loading: { events: loadingEvents },
	} = useCacheStore();
	const resizeId = useId();

	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 50, max: 90, min: 10, id: resizeId });
	const { eventId } = useParams();
	const { items: sortedEvents, requestSort, sortConfig } = useSort<BaseEvent>(events || []);
	const navigate = useNavigate();

	useEffect(() => {
		fetchEvents();
	}, [fetchEvents]);

	const frameClass = useMemo(
		() =>
			cn("size-full bg-gray-1100 pb-3 pl-7 transition-all", {
				"rounded-r-none": !eventId,
			}),
		[eventId]
	);

	const handleSort = useCallback(
		(key: keyof BaseEvent) => (event: React.MouseEvent | React.KeyboardEvent) => {
			if (event.type === "click" || (event as React.KeyboardEvent).key === "Enter") {
				requestSort(key);
			}
		},
		[requestSort]
	);

	const rowRenderer = useCallback(
		({ index, key, style }: ListRowProps) => {
			const event = sortedEvents[index];

			return (
				<EventRow event={event} key={key} onClick={() => navigate(`events/${event.eventId}`)} style={style} />
			);
		},
		[sortedEvents, navigate]
	);

	const renderContent = useMemo(() => {
		if (loadingEvents) {
			return <Loader isCenter size="xl" />;
		}

		if (!sortedEvents?.length) {
			return <div className="mt-10 text-center text-xl font-semibold">{t("history.noEvents")}</div>;
		}

		return (
			<div className="mt-4 h-full">
				<Table className="relative w-full overflow-visible">
					<TableHeader onSort={handleSort} sortConfig={sortConfig} />
					<TBody>
						<div className="h-[calc(100vh-200px)]">
							<AutoSizer>
								{({ height, width }) => (
									<VirtualizedList
										height={height}
										rowRenderer={rowRenderer}
										sortedEvents={sortedEvents}
										width={width}
									/>
								)}
							</AutoSizer>
						</div>
					</TBody>
				</Table>
			</div>
		);
	}, [loadingEvents, sortedEvents, t, handleSort, sortConfig, rowRenderer]);

	return (
		<div className="my-2 flex size-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>{renderContent}</Frame>
			</div>

			<ResizeButton className="hover:bg-white" direction="horizontal" resizeId={resizeId} />

			<div className="flex" style={{ width: `${100 - leftSideWidth}%` }}>
				{eventId ? <Outlet /> : <NoEventsSelected />}
			</div>
		</div>
	);
};
