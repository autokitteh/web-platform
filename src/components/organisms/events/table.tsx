import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useSort } from "@src/hooks";
import { useCacheStore } from "@src/store";
import { Event } from "@src/types/models";

import { Frame, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

export const EventsTable = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history" });
	const {
		events,
		fetchEvents,
		loading: { events: loadingEvents },
	} = useCacheStore();

	const { items: sortedEvents, requestSort, sortConfig } = useSort<Event>(events || []);

	const navigate = useNavigate();

	useEffect(() => {
		fetchEvents();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Frame className="my-2 bg-gray-1100">
			{loadingEvents ? <Loader isCenter size="xl" /> : null}

			{!loadingEvents && !sortedEvents?.length ? (
				<div className="mt-10 text-center text-xl font-semibold">{t("noDeployments")}</div>
			) : null}

			{!loadingEvents && !!sortedEvents?.length ? (
				<Table className="mt-4">
					<THead>
						<Tr>
							<Th className="group cursor-pointer font-normal" onClick={() => requestSort("eventId")}>
								{t("table.columns.deploymentTime")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"eventId" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedEvents.map(({ eventId }) => (
							<Tr
								className="group cursor-pointer"
								key={eventId}
								onClick={() => navigate(`${eventId}/sessions`)}
							>
								<Td className="font-semibold">{eventId}</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : null}
		</Frame>
	);
};
