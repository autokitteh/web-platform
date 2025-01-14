import React, { CSSProperties, memo } from "react";

import moment from "moment";
import { useParams } from "react-router-dom";

import { useEventsDrawer } from "@contexts";
import { dateTimeFormat } from "@src/constants";
import { BaseEvent } from "@src/types/models";
import { cn } from "@src/utilities";

import { Td, Tr } from "@components/atoms";
import { IdCopyButton } from "@components/molecules";

export const EventRow = memo(
	({
		event: { createdAt, destinationId, eventId, eventType },
		onClick,
		style,
	}: {
		event: BaseEvent;
		onClick: () => void;
		style: CSSProperties;
	}) => {
		const { isDrawer } = useEventsDrawer();
		const { eventId: paramEventId } = useParams();
		const rowClass = cn("cursor-pointer hover:bg-gray-750", {
			"bg-black": paramEventId === eventId,
		});
		const firstColumnClass = cn("mr-2 w-1/5 min-w-36 pl-4", { "w-1/2": isDrawer });
		const lastColumnClass = cn("mr-2 w-2/5 min-w-40", { "w-1/2": isDrawer });

		return (
			<Tr className={rowClass} onClick={onClick} style={style}>
				<Td className={firstColumnClass} title={moment(createdAt).local().format(dateTimeFormat)}>
					{moment(createdAt).local().format(dateTimeFormat)}
				</Td>
				{isDrawer ? null : (
					<>
						<Td className="mr-2 w-1/5 min-w-32" title={eventId}>
							<IdCopyButton id={eventId} />
						</Td>
						<Td className="mr-2 w-1/5 min-w-32" title={destinationId || ""}>
							<IdCopyButton id={destinationId || ""} />
						</Td>
					</>
				)}
				<Td className={lastColumnClass} title={eventType}>
					<div className="truncate">{eventType}</div>
				</Td>
			</Tr>
		);
	}
);

EventRow.displayName = "EventRow";
