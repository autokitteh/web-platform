import React, { CSSProperties, memo } from "react";

import moment from "moment";
import { useParams } from "react-router-dom";

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
		const { eventId: paramEventId } = useParams();
		const rowClass = cn("cursor-pointer pl-3 hover:bg-gray-750", {
			"bg-black": paramEventId === eventId,
		});

		return (
			<Tr className={rowClass} onClick={onClick} style={style}>
				<Td className="w-1/4" title={moment(createdAt).local().format(dateTimeFormat)}>
					{moment(createdAt).local().format(dateTimeFormat)}
				</Td>
				<Td className="w-1/4" title={eventId}>
					<IdCopyButton id={eventId} />
				</Td>
				<Td className="w-1/4" title={destinationId || ""}>
					<IdCopyButton id={destinationId || ""} />
				</Td>
				<Td className="w-1/4" title={eventType}>
					{eventType}
				</Td>
			</Tr>
		);
	}
);

EventRow.displayName = "EventRow";
