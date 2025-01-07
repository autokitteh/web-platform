import React, { KeyboardEvent, MouseEvent, useCallback, useEffect, useId, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AutoSizer, ListRowProps } from "react-virtualized";

import { useEventsDrawer } from "@contexts/eventsDrawer";
import { useResize, useSort } from "@src/hooks";
import { useCacheStore } from "@src/store";
import { BaseEvent, Deployment } from "@src/types/models";
import { cn } from "@src/utilities";

import { Frame, Loader, ResizeButton, TBody, Table } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { EventViewer } from "@components/organisms/events";
import { TableHeader } from "@components/organisms/events/table/header";
import { NoEventsSelected } from "@components/organisms/events/table/notSelected";
import { EventRow } from "@components/organisms/events/table/row";
import { VirtualizedList } from "@components/organisms/events/table/virtualizer";

export const EventsTable = () => {
	const { t } = useTranslation("events");
	const {
		events,
		fetchEvents,
		loading: { events: loadingEvents },
	} = useCacheStore();
	const resizeId = useId();
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [isSourceLoad, setIsSourceLoad] = useState(false);

	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 50, max: 90, min: 10, id: resizeId });
	const { items: sortedEvents, requestSort, sortConfig } = useSort<BaseEvent>(events || []);
	const { eventId } = useParams();
	const navigate = useNavigate();
	const { filterType, isDrawer, projectId, sourceId } = useEventsDrawer();

	const fetchData = useCallback(async () => {
		setIsSourceLoad(true);
		await fetchEvents(true, sourceId, projectId);
		setIsSourceLoad(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDrawer, sourceId, projectId]);

	useEffect(() => {
		if (isInitialLoad) {
			setIsInitialLoad(false);
		}

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const frameClass = useMemo(() => cn("size-full bg-gray-1100 pb-3 pl-7 transition-all rounded-r-none"), [eventId]);

	const handleSort = useCallback(
		(key: keyof BaseEvent) => (event: MouseEvent | KeyboardEvent) => {
			if (event.type === "click" || (event as KeyboardEvent).key === "Enter") {
				requestSort(key);
			}
		},
		[requestSort]
	);

	const calculateEventAddress = useCallback(
		(eventId: string) => {
			if (!isDrawer) {
				return `/events/${eventId}`;
			}
			if (sourceId) {
				return `/projects/${projectId}/${filterType}/${sourceId}/events/${eventId}`;
			}

			return `/projects/${projectId}/events/${eventId}`;
		},
		[isDrawer, sourceId, projectId, filterType]
	);

	const rowRenderer = useCallback(
		({ index, key, style }: ListRowProps) => {
			const event = sortedEvents[index];
			const eventAddress = calculateEventAddress(event.eventId);

			return <EventRow event={event} key={key} onClick={() => navigate(eventAddress)} style={style} />;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isDrawer, sourceId, projectId, sortedEvents, navigate]
	);

	const tableContent = useMemo(() => {
		if ((loadingEvents && isInitialLoad) || isSourceLoad) {
			return <Loader isCenter size="xl" />;
		}

		if (!loadingEvents && !sortedEvents?.length) {
			return <div className="mt-10 text-center text-xl font-semibold">{t("history.noEvents")}</div>;
		}

		return (
			<div className="mt-2 h-full">
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInitialLoad, sortedEvents, isSourceLoad]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleRefresh = useCallback(() => fetchEvents(true, sourceId, projectId) as Promise<void | Deployment[]>, []);

	return (
		<div className="flex size-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<div className="flex justify-end">
						<RefreshButton isLoading={loadingEvents} onRefresh={handleRefresh} />
					</div>
					{tableContent}
				</Frame>
			</div>

			<ResizeButton className="hover:bg-white" direction="horizontal" resizeId={resizeId} />

			<div className="flex rounded-2xl bg-black" style={{ width: `${100 - leftSideWidth}%` }}>
				{eventId ? <EventViewer /> : <NoEventsSelected />}
			</div>
		</div>
	);
};
