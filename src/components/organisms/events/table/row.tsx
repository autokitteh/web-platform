import React, { CSSProperties, memo } from "react";

import moment from "moment";
import { useParams } from "react-router-dom";

import { dateTimeFormat } from "@src/constants";
import { ButtonVariant } from "@src/enums/components";
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
		const rowClass = cn("cursor-pointer hover:bg-gray-750", {
			"bg-black": paramEventId === eventId,
		});

		return (
			<Tr className={rowClass} onClick={onClick} style={style}>
				<Td className="mr-2 w-1/5 min-w-36 pl-4" title={moment(createdAt).local().format(dateTimeFormat)}>
					{moment(createdAt).local().format(dateTimeFormat)}
				</Td>
				<Td className="mr-2 w-1/5 min-w-32" title={eventId}>
					<IdCopyButton buttonClassName="pl-0" id={eventId} variant={ButtonVariant.flatText} />
				</Td>
				<Td className="mr-2 w-1/5 min-w-32" title={destinationId || ""}>
					<IdCopyButton buttonClassName="pl-0" id={destinationId || ""} variant={ButtonVariant.flatText} />
				</Td>
				<Td className="mr-2 w-2/5 min-w-40" title={eventType}>
					<div className="truncate">{eventType}</div>
				</Td>
			</Tr>
		);
	}
);

EventRow.displayName = "EventRow";
