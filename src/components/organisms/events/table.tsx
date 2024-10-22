import React, { useCallback, useEffect, useId, useMemo } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { AutoSizer, List } from "react-virtualized";

import { dateTimeFormat, defaultEventsTableRowHeight } from "@src/constants";
import { useResize, useSort } from "@src/hooks";
import { useCacheStore } from "@src/store";
import { SortConfig } from "@src/types";
import { BaseEvent } from "@src/types/models";
import { cn } from "@src/utilities";

import { Frame, Loader, ResizeButton, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

import { CatImage } from "@assets/image";

const TableHeader = ({
	onSort,
	sortConfig,
}: {
	onSort: (key: keyof BaseEvent) => (event: React.MouseEvent | React.KeyboardEvent) => void;
	sortConfig: SortConfig<BaseEvent>;
}) => {
	const { t } = useTranslation("events");

	const renderSortableHeader = useCallback(
		(columnKey: keyof BaseEvent, columnLabel: string) => {
			return (
				<div
					className="group cursor-pointer font-normal outline-none focus:ring-2 focus:ring-blue-500"
					onClick={onSort(columnKey)}
					onKeyDown={onSort(columnKey)}
					role="button"
					tabIndex={0}
				>
					{columnLabel}
					<SortButton
						className="opacity-0 group-hover:opacity-100 group-focus:opacity-100"
						isActive={columnKey === sortConfig?.key}
						sortDirection={sortConfig.direction}
					/>
				</div>
			);
		},
		[onSort, sortConfig]
	);

	return (
		<THead>
			<Th>
				<Td>{renderSortableHeader("createdAt", t("table.columns.createdAt"))}</Td>
				<Td>{renderSortableHeader("eventId", t("table.columns.eventId"))}</Td>
			</Th>
		</THead>
	);
};

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
		(key: keyof BaseEvent) => {
			return (event: React.MouseEvent | React.KeyboardEvent) => {
				if (event.type === "click" || (event as React.KeyboardEvent).key === "Enter") {
					requestSort(key);
				}
			};
		},
		[requestSort]
	);

	const rowRenderer = useCallback(
		({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
			const event = sortedEvents[index];

			return (
				<Tr
					className="cursor-pointer hover:bg-gray-750"
					key={key}
					onClick={() => navigate(`events/${event.eventId}`)}
					style={style}
				>
					<Td>{moment(event.createdAt).format(dateTimeFormat)}</Td>
					<Td>{event.eventId}</Td>
				</Tr>
			);
		},
		[sortedEvents, navigate]
	);

	const renderContent = () => {
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
							{" "}
							{/* Adjust height as needed */}
							<AutoSizer>
								{({ height, width }) => (
									<List
										height={height}
										overscanRowCount={5}
										rowCount={sortedEvents.length}
										rowHeight={defaultEventsTableRowHeight}
										rowRenderer={rowRenderer}
										width={width}
									/>
								)}
							</AutoSizer>
						</div>
					</TBody>
				</Table>
			</div>
		);
	};

	return (
		<div className="my-2 flex size-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>{renderContent()}</Frame>
			</div>

			<ResizeButton className="hover:bg-white" direction="horizontal" resizeId={resizeId} />

			<div className="flex" style={{ width: `${100 - leftSideWidth}%` }}>
				{eventId ? (
					<Outlet />
				) : (
					<Frame className="w-full rounded-l-none bg-gray-1100 pt-20 transition">
						<div className="mt-20 flex flex-col items-center">
							<p className="mb-8 text-lg font-bold text-gray-750">{t("history.noEventSelected")}</p>
							<CatImage className="border-b border-gray-750 fill-gray-750" />
						</div>
					</Frame>
				)}
			</div>
		</div>
	);
};
