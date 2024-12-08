import React, { CSSProperties, memo } from "react";

import moment from "moment";

import { dateTimeFormat } from "@src/constants";
import { BaseEvent } from "@src/types/models";

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
	}) => (
		<Tr className="cursor-pointer pl-3 hover:bg-gray-750" onClick={onClick} style={style}>
			<Td className="w-1/4">{moment(createdAt).local().format(dateTimeFormat)}</Td>
			<Td className="w-1/4">
				<IdCopyButton id={eventId} />
			</Td>
			<Td className="w-1/4">
				<IdCopyButton id={destinationId || ""} />
			</Td>
			<Td className="w-1/4">{eventType}</Td>
		</Tr>
	)
);

EventRow.displayName = "EventRow";
