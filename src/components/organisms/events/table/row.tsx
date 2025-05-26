import React, { CSSProperties, memo, useEffect } from "react";

import moment from "moment";
import { useParams } from "react-router-dom";

import { useEventsDrawer } from "@contexts";
import { dateTimeFormat } from "@src/constants";
import { BaseEvent } from "@src/types/models";
import { cn } from "@src/utilities";

import { IconButton, Td, Tr } from "@components/atoms";
import { IdCopyButton } from "@components/molecules";

import { ReplayIcon } from "@assets/image/icons";

type Props = {
	event: BaseEvent;
	measure?: () => void;
	onClick: () => void;
	onRedispatch: () => void;
	style?: CSSProperties;
};

export const EventRow = memo(({ event, onClick, onRedispatch, style, measure }: Props) => {
	const { isDrawer } = useEventsDrawer();
	const { eventId: paramEventId } = useParams();

	useEffect(() => {
		if (measure) {
			const timeout = setTimeout(() => measure(), 0);
			return () => clearTimeout(timeout);
		}
	}, [measure]);

	const { createdAt, destinationId, eventId, eventType } = event;

	const rowClass = cn("cursor-pointer hover:bg-gray-750", {
		"bg-black": paramEventId === eventId,
	});

	const firstColumnClass = cn("mr-2 w-1/4 min-w-36 pl-4", {
		"w-1/2": isDrawer,
	});
	const lastColumnClass = cn("ml-auto w-20");

	const handleRedispatchClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onRedispatch();
	};

	return (
		<Tr className={rowClass} onClick={onClick} style={style}>
			<Td className={firstColumnClass} title={moment(createdAt).local().format(dateTimeFormat)}>
				{moment(createdAt).local().format(dateTimeFormat)}
			</Td>

			{!isDrawer ? (
				<>
					<Td className="mr-2 w-1/4 min-w-32" title={eventId}>
						<IdCopyButton id={eventId} />
					</Td>
					<Td className="mr-2 w-1/4 min-w-32" title={destinationId || ""}>
						<IdCopyButton id={destinationId || ""} />
					</Td>
				</>
			) : null}

			<Td className="w-1/4 min-w-32" title={eventType}>
				<div className="truncate">{eventType}</div>
			</Td>

			{!isDrawer ? (
				<Td className={lastColumnClass}>
					<IconButton className="p-1" onClick={handleRedispatchClick}>
						<ReplayIcon className="size-5 fill-white" />
					</IconButton>
				</Td>
			) : null}
		</Tr>
	);
});

EventRow.displayName = "EventRow";
