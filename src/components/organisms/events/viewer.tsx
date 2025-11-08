import React, { useCallback, useEffect } from "react";

import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { dateTimeFormat } from "@src/constants";
import { useEvent } from "@src/hooks";
import { useEventsDrawerStore } from "@src/store";

import { Frame, IconButton, Loader, Typography } from "@components/atoms";
import { IdCopyButton, ValueRenderer } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const EventViewer = ({ eventId: eventIdProp, isDrawer = false }: { eventId: string; isDrawer?: boolean }) => {
	const { t } = useTranslation("events", { keyPrefix: "viewer" });
	const navigate = useNavigate();
	const id = eventIdProp;
	const { isLoading, eventInfo, eventInfoError } = useEvent(id);
	const { setSelectedEventId } = useEventsDrawerStore();
	const closeViewer = useCallback(() => {
		if (!isDrawer) navigate("/events");

		setSelectedEventId(undefined);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDrawer, location.pathname]);

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
			<div className="absolute right-7 top-8 z-10">
				<IconButton className="group h-default-icon w-default-icon bg-gray-700 p-0" onClick={closeViewer}>
					<Close className="size-3 fill-white" />
				</IconButton>
			</div>
			{eventInfo ? (
				<>
					{isDrawer ? <div className="h-16 w-full" /> : null}
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
									{dayjs(eventInfo.createdAt).format(dateTimeFormat)}
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
				</>
			) : null}
			<Typography className="mt-5 font-fira-sans">{t("payload")}</Typography>
			<ValueRenderer isJsonViewerCollapsed={false} value={eventInfo?.data} />
		</Frame>
	);
};
