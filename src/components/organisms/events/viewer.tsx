import React, { useCallback, useEffect, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { EventsService, LoggerService } from "@services";
import { dateTimeFormat, namespaces } from "@src/constants";
import { useToastStore } from "@src/store";
import { EnrichedEvent } from "@src/types/models";

import { Frame, IconButton, Loader, Typography } from "@components/atoms";
import { CopyButton } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const EventViewer = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [eventInfo, setEventInfo] = useState<EnrichedEvent | null>(null);

	const { connectionId, eventId, triggerId } = useParams();
	const navigate = useNavigate();
	const projectEventId = triggerId || connectionId;

	const closeViewer = useCallback(() => {
		if (!projectEventId) {
			navigate("/events");

			return;
		}

		const parts = location.pathname.split("/");
		parts.pop();
		const newPath = parts.join("/");
		navigate(newPath);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("events", { keyPrefix: "viewer" });
	const { t: tErrors } = useTranslation("errors");

	const fetchEventInfo = useCallback(async () => {
		if (!eventId) return;
		setIsLoading(true);
		const { data: eventInfoRes, error } = await EventsService.getEnriched(eventId);
		setIsLoading(false);

		if (error) {
			addToast({ message: tErrors("errorFetchingEvent"), type: "error" });

			return;
		}
		if (!eventInfoRes) {
			addToast({ message: tErrors("eventNotFound"), type: "error" });
			LoggerService.error(namespaces.ui.eventsViewer, tErrors("eventNotFoundExtended", { eventId, error }));

			return;
		}
		setEventInfo(eventInfoRes);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId]);

	useEffect(() => {
		fetchEventInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId]);

	return isLoading ? (
		<Loader size="xl" />
	) : (
		<Frame className="overflow-y-auto overflow-x-hidden rounded-l-none pb-3 font-fira-code">
			<div className="flex items-center justify-between border-b border-gray-950 pb-3.5">
				<IconButton className="ml-auto size-7 bg-gray-1100 p-0.5" onClick={closeViewer}>
					<Close className="size-3 fill-white" />
				</IconButton>
			</div>
			{eventInfo ? (
				<div className="mt-3 flex justify-between border-b border-gray-950 pb-3.5">
					<div className="flex flex-col gap-0.5 leading-6">
						<div className="flex items-center gap-4">
							<div className="w-32 text-gray-1550">{t("eventType")}</div>
							{eventInfo.type}
						</div>
						<div className="flex items-center gap-4">
							<div className="w-32 text-gray-1550">{t("sourceName")}</div>
							{eventInfo.destinationName} ({eventInfo.destinationType})
						</div>
						<div className="flex items-center gap-4">
							<div className="w-32 text-gray-1550" title="Start Time">
								{t("created")}
							</div>
							<div className="flex flex-row items-center">
								{moment(eventInfo.createdAt).local().format(dateTimeFormat)}
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-0.5">
						<div className="flex items-center justify-end gap-4">
							<div className="leading-6">{t("eventId")}</div>
							<CopyButton className="p-0" size="xs" text={eventInfo.type} />
						</div>
						<div className="flex items-center justify-end gap-4">
							<div className="leading-6">{t("sourceId")}</div>
							<CopyButton className="p-0" size="xs" text={eventInfo.destinationId || ""} />
						</div>
					</div>
				</div>
			) : null}
			<Typography className="mt-5 font-fira-sans">{t("payload")}</Typography>
			{eventInfo?.data ? (
				<JsonView className="scrollbar mt-3 overflow-auto" style={githubDarkTheme} value={eventInfo.data} />
			) : null}
		</Frame>
	);
};
