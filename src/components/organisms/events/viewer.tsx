import React, { useCallback, useEffect } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useEventsDrawer } from "@contexts";
import { dateTimeFormat } from "@src/constants";
import { useEvent } from "@src/hooks";

import { Frame, Loader, Typography } from "@components/atoms";
import { IdCopyButton } from "@components/molecules";

export const EventViewer = () => {
	const { eventId } = useParams();
	const { t } = useTranslation("events", { keyPrefix: "viewer" });
	const navigate = useNavigate();
	const { isDrawer } = useEventsDrawer();
	const { isLoading, eventInfo, eventInfoError } = useEvent(eventId);

	const closeViewer = useCallback(() => {
		if (!isDrawer) {
			navigate("/events");

			return;
		}

		const parts = location.pathname.split("/");
		parts.pop();
		const newPath = parts.join("/");
		navigate(newPath);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	useEffect(() => {
		if (eventInfoError) {
			closeViewer();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventInfoError]);

	return isLoading ? (
		<Loader size="xl" />
	) : (
		<Frame className="overflow-y-auto overflow-x-hidden rounded-l-none pb-3 font-fira-code">
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
							<IdCopyButton hideId id={eventInfo.id} />
						</div>
						<div className="flex items-center justify-end gap-4">
							<div className="leading-6">{t("sourceId")}</div>
							<IdCopyButton hideId id={eventInfo.destinationId || ""} />
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
