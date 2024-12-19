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
			<Tr className={rowClass} style={style}>
				<Td
					className="mr-2 w-36 pl-4"
					onClick={onClick}
					title={moment(createdAt).local().format(dateTimeFormat)}
				>
					{moment(createdAt).local().format(dateTimeFormat)}
				</Td>
				<Td className="mr-2 w-24" title={eventId}>
					<IdCopyButton id={eventId} onIdClick={onClick} variant={ButtonVariant.flatText} />
				</Td>
				<Td className="mr-2 w-24" title={destinationId || ""}>
					<IdCopyButton id={destinationId || ""} onIdClick={onClick} variant={ButtonVariant.flatText} />
				</Td>
				<Td className="w-1/4" onClick={onClick} title={eventType}>
					<div className="truncate">{eventType}</div>
				</Td>
			</Tr>
		);
	}
);

EventRow.displayName = "EventRow";
