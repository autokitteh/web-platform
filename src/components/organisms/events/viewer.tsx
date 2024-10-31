import React, { useCallback, useEffect, useMemo, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { omit } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { EventsService, LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { useToastStore } from "@src/store";
import { BaseEvent } from "@src/types/models";

import { Frame, IconButton, Loader, Tab } from "@components/atoms";
import { CopyButton } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const EventViewer = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [eventInfo, setEventInfo] = useState<BaseEvent | null>(null);

	const { eventId } = useParams();
	const navigate = useNavigate();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const closeViewer = useCallback(() => navigate(`/events`), []);
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("events", { keyPrefix: "viewer" });
	const { t: tErrors } = useTranslation("errors");

	const fetchEventInfo = useCallback(async () => {
		if (!eventId) return;
		setIsLoading(true);
		const { data: eventInfoRes, error } = await EventsService.get(eventId);
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

	const eventInputs = useMemo(() => omit(eventInfo, "data"), [eventInfo]);

	return isLoading ? (
		<Loader size="xl" />
	) : (
		<Frame className="overflow-y-auto overflow-x-hidden rounded-l-none pb-3 font-fira-code">
			<div className="flex items-center justify-between border-b border-gray-950 pb-3.5">
				<div className="flex gap-2 font-fira-sans text-base text-gray-500">
					<span className="font-semibold">{t("event")}:</span>
					{eventInfo?.eventId}
					<CopyButton className="p-0" size="xs" text={eventInfo?.eventId || ""} />
				</div>
				<div className="flex items-center gap-3">
					<IconButton className="size-7 bg-gray-1100 p-0.5" onClick={closeViewer}>
						<Close className="size-3 fill-white" />
					</IconButton>
				</div>
			</div>
			{eventInfo ? (
				<div className="mt-3 border-b border-gray-950 pb-3.5">
					<JsonView
						className="scrollbar max-h-72 overflow-auto"
						style={githubDarkTheme}
						value={eventInputs}
					/>
				</div>
			) : null}
			<div className="mt-5 flex items-center justify-between">
				<Tab activeTab="output" className="p-0 font-fira-sans" value="output">
					{t("output")}
				</Tab>
			</div>
			{eventInfo?.data ? (
				<JsonView className="scrollbar mt-3 overflow-auto" style={githubDarkTheme} value={eventInfo.data} />
			) : null}
		</Frame>
	);
};
