import React, { useCallback, useEffect, useId, useMemo, useState } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { AutoSizer } from "react-virtualized";

import { dateTimeFormat } from "@src/constants";
import { useResize, useSort } from "@src/hooks";
import { useCacheStore } from "@src/store";
import { BaseEvent } from "@src/types/models";
import { cn } from "@src/utilities";

import { Frame, Loader, ResizeButton, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

import { CatImage } from "@assets/image";

const rowHeight = 40;

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
	const [visibleRows, setVisibleRows] = useState({ start: 0, end: 20 });

	useEffect(() => {
		fetchEvents();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	const renderSortableHeader = useCallback(
		(columnKey: keyof BaseEvent, columnLabel: string) => {
			return (
				<div
					className="group cursor-pointer font-normal outline-none focus:ring-2 focus:ring-blue-500"
					onClick={handleSort(columnKey)}
					onKeyDown={handleSort(columnKey)}
					role="button"
					tabIndex={0}
				>
					{columnLabel}
					<SortButton
						className="opacity-0 group-hover:opacity-100 group-focus:opacity-100"
						isActive={columnKey === sortConfig.key}
						sortDirection={sortConfig.direction}
					/>
				</div>
			);
		},
		[handleSort, sortConfig]
	);

	const onScroll = useCallback(
		(event: React.UIEvent<HTMLDivElement>, height: number) => {
			const { scrollTop } = event.currentTarget;
			const start = Math.floor(scrollTop / rowHeight);
			const end = Math.min(sortedEvents.length, Math.ceil((scrollTop + height) / rowHeight) + 1);
			setVisibleRows({ start, end });
		},
		[sortedEvents.length]
	);

	const renderRows = useCallback(
		({ height }: { height: number }) => {
			const start = visibleRows.start;
			const end = Math.min(visibleRows.end, Math.ceil(height / rowHeight) + start);

			return sortedEvents.slice(start, end).map((event) => (
				<Tr
					className="cursor-pointer hover:bg-gray-750"
					key={event.eventId}
					onClick={() => navigate(`events/${event.eventId}`)}
				>
					<Td>{moment(event.createdAt).format(dateTimeFormat)}</Td>
					<Td>{event.eventId}</Td>
				</Tr>
			));
		},
		[sortedEvents, visibleRows, navigate]
	);

	return (
		<div className="my-2 flex size-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					{loadingEvents ? <Loader isCenter size="xl" /> : null}

					{!loadingEvents && !sortedEvents?.length ? (
						<div className="mt-10 text-center text-xl font-semibold">{t("history.noEvents")}</div>
					) : null}

					{!loadingEvents && !!sortedEvents?.length ? (
						<div className="mt-4 h-full">
							<AutoSizer>
								{({ height, width }) => (
									<div
										className="overflow-auto"
										onScroll={(event) => onScroll(event, height)}
										style={{ width, height }}
									>
										<Table className="relative w-full overflow-visible">
											<THead>
												<Th>
													<Td>
														{renderSortableHeader(
															"createdAt",
															t("table.columns.createdAt")
														)}
													</Td>
													<Td>
														{renderSortableHeader("eventId", t("table.columns.eventId"))}
													</Td>
												</Th>
											</THead>
											<TBody>{renderRows({ height })}</TBody>
										</Table>
									</div>
								)}
							</AutoSizer>
						</div>
					) : null}
				</Frame>
			</div>

			<ResizeButton className="hover:bg-white" direction="horizontal" resizeId={resizeId} />

			<div className="flex" style={{ width: `${100 - (leftSideWidth as number)}%` }}>
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
