import React, { CSSProperties, memo } from "react";

import moment from "moment";

import { dateTimeFormat } from "@src/constants";
import { BaseEvent } from "@src/types/models";

import { Td, Tr } from "@components/atoms";

export const EventRow = memo(
	({ event, onClick, style }: { event: BaseEvent; onClick: () => void; style: CSSProperties }) => (
		<Tr className="cursor-pointer pl-3 hover:bg-gray-750" onClick={onClick} style={style}>
			<Td>{moment(event.createdAt).local().format(dateTimeFormat)}</Td>
			<Td>{event.eventId}</Td>
			<Td>{event.destinationId}</Td>
			<Td className="w-56">{event.eventType}</Td>
		</Tr>
	)
);

EventRow.displayName = "EventRow";
