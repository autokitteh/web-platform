import React, { useEffect, useMemo } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import { dateTimeFormat } from "@src/constants";
import { useResize, useSort } from "@src/hooks";
import { useCacheStore } from "@src/store";
import { SimpleEvent } from "@src/types/models";
import { cn } from "@src/utilities";

import { Button, Frame, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

import { CatImage } from "@assets/image";

export const EventsTable = () => {
	const { t } = useTranslation("events");
	const {
		events,
		fetchEvents,
		loading: { events: loadingEvents },
	} = useCacheStore();
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 50, max: 90, min: 10 });
	const { eventId } = useParams();
	const { items: sortedEvents, requestSort, sortConfig } = useSort<SimpleEvent>(events || []);

	const navigate = useNavigate();

	useEffect(() => {
		fetchEvents();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const resizeClass = useMemo(
		() =>
			cn(
				"resize-handle-horizontal bg-gray-white z-0 h-[97%] cursor-ew-resize self-center rounded-none p-1.5 transition hover:bg-gray-750",
				{
					"h-full bg-gray-1100 p-1": !eventId,
				}
			),
		[eventId]
	);
	const frameClass = useMemo(
		() =>
			cn("h-full w-full overflow-hidden bg-gray-1100 pb-3 pl-7 transition-all", {
				"rounded-r-none": !eventId,
			}),
		[eventId]
	);

	return (
		<div className="my-2 flex w-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					{loadingEvents ? <Loader isCenter size="xl" /> : null}

					{!loadingEvents && !sortedEvents?.length ? (
						<div className="mt-10 text-center text-xl font-semibold">{t("history.noEvents")}</div>
					) : null}

					{!loadingEvents && !!sortedEvents?.length ? (
						<Table className="mt-4">
							<THead>
								<Tr>
									<Th
										className="group cursor-pointer font-normal"
										onClick={() => requestSort("createdAt")}
									>
										{t("table.columns.createdAt")}

										<SortButton
											className="opacity-0 group-hover:opacity-100"
											isActive={"createdAt" === sortConfig.key}
											sortDirection={sortConfig.direction}
										/>
									</Th>

									<Th
										className="group cursor-pointer font-normal"
										onClick={() => requestSort("eventId")}
									>
										{t("table.columns.eventId")}

										<SortButton
											className="opacity-0 group-hover:opacity-100"
											isActive={"eventId" === sortConfig.key}
											sortDirection={sortConfig.direction}
										/>
									</Th>
								</Tr>
							</THead>

							<TBody>
								{sortedEvents.map(({ createdAt, eventId }) => (
									<Tr
										className="group cursor-pointer"
										key={eventId}
										onClick={() => navigate(`events/${eventId}`)}
									>
										<Td className="font-semibold">{moment(createdAt).format(dateTimeFormat)}</Td>

										<Td className="font-semibold">{eventId}</Td>
									</Tr>
								))}
							</TBody>
						</Table>
					) : null}
				</Frame>
			</div>

			<Button className={resizeClass} />

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
