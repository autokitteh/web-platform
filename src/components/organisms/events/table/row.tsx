import React, { CSSProperties, memo } from "react";

import moment from "moment";
import { useParams } from "react-router-dom";

import { useEventsDrawer } from "@contexts";
import { dateTimeFormat } from "@src/constants";
import { BaseEvent } from "@src/types/models";
import { cn } from "@src/utilities";

import { IconButton, Td, Tr } from "@components/atoms";
import { IdCopyButton } from "@components/molecules";

import { ReplayIcon } from "@assets/image/icons";

export const EventRow = memo(
	({
		event: { createdAt, destinationId, eventId, eventType },
		onClick,
		style,
		onRedispatch,
	}: {
		event: BaseEvent;
		onClick: () => void;
		onRedispatch: () => void;
		style: CSSProperties;
	}) => {
		const { isDrawer } = useEventsDrawer();
		const { eventId: paramEventId } = useParams();
		const rowClass = cn("cursor-pointer hover:bg-gray-750", {
			"bg-black": paramEventId === eventId,
		});
		const firstColumnClass = cn("mr-2 w-1/4 min-w-36 pl-4", { "w-1/2": isDrawer });
		const lastColumnClass = cn("ml-auto w-20");

		return (
			<Tr className={rowClass} onClick={onClick} style={style}>
				<Td className={firstColumnClass} title={moment(createdAt).local().format(dateTimeFormat)}>
					{moment(createdAt).local().format(dateTimeFormat)}
				</Td>
				{isDrawer ? null : (
					<>
						<Td className="mr-2 w-1/4 min-w-32" title={eventId}>
							<IdCopyButton id={eventId} />
						</Td>
						<Td className="mr-2 w-1/4 min-w-32" title={destinationId || ""}>
							<IdCopyButton id={destinationId || ""} />
						</Td>
					</>
				)}
				<Td className="w-1/4 min-w-32" title={eventType}>
					<div className="truncate">{eventType}</div>
				</Td>
				<Td className={lastColumnClass}>
					<IconButton className="p-1" onClick={onRedispatch}>
						<ReplayIcon className="size-5 fill-white" />
					</IconButton>
				</Td>
			</Tr>
		);
	}
);

EventRow.displayName = "EventRow";
