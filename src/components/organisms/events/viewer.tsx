import React, { useCallback, useEffect } from "react";

import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { dateTimeFormat } from "@src/constants";
import { useEvent } from "@src/hooks";
import { useEventsDrawerStore } from "@src/store";
import { cn } from "@src/utilities";

import { Frame, IconButton, Loader, Typography } from "@components/atoms";
import { IdCopyButton, ValueRenderer } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const EventViewer = ({ eventId: eventIdProp, isDrawer = false }: { eventId?: string; isDrawer?: boolean }) => {
	const { t } = useTranslation("events", { keyPrefix: "viewer" });
	const navigate = useNavigate();
	const { eventId } = useParams();
	const id = eventIdProp || eventId;
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

	const frameClass = cn("overflow-y-auto overflow-x-hidden pb-3 font-fira-code", {
		"rounded-l-none": !isDrawer,
		"size-full max-w-full": isDrawer,
		"bg-transparent": isDrawer,
		"text-gray-50": isDrawer,
	});
	const infoLabelClass = cn("w-32 text-gray-1550", {
		"text-gray-200": isDrawer,
	});
	const metaLabelClass = cn("leading-6", {
		"text-gray-200": isDrawer,
	});
	const valueTextClass = cn({
		"text-white": isDrawer,
	});
	const payloadTitleClass = cn("mb-3 mt-5 font-fira-sans", {
		"text-white": isDrawer,
	});
	const jsonViewerClass = cn({
		"text-white !bg-gray-1300": isDrawer,
	});
	if (isLoading) return <Loader size="xl" />;

	return (
		<Frame className={frameClass}>
			{!isDrawer ? (
				<div className="absolute right-7 top-8 z-10">
					<IconButton className="group h-default-icon w-default-icon bg-gray-700 p-0" onClick={closeViewer}>
						<Close className="size-3 fill-white" />
					</IconButton>
				</div>
			) : null}
			{eventInfo ? (
				<>
					{isDrawer ? <div className="h-16 w-full" /> : null}
					<div className="mt-3 flex justify-between border-b border-gray-950 pb-3.5">
						<div className="flex flex-col gap-0.5 leading-6">
							<div className="flex items-center gap-4">
								<div className={infoLabelClass}>{t("eventType")}</div>
								<div className={valueTextClass}>{eventInfo.type}</div>
							</div>
							<div className="flex items-center gap-4">
								<div className={infoLabelClass}>{t("sourceName")}</div>
								<div className={valueTextClass}>
									{eventInfo.destinationName} ({eventInfo.destinationType})
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className={infoLabelClass} title="Start Time">
									{t("created")}
								</div>
								<div className={cn("flex flex-row items-center", valueTextClass)}>
									{dayjs(eventInfo.createdAt).format(dateTimeFormat)}
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-0.5">
							<div className={cn("flex items-center justify-end gap-4", valueTextClass)}>
								<div className={metaLabelClass}>{t("eventId")}</div>
								<IdCopyButton hideId id={eventInfo.id} />
							</div>
							<div className={cn("flex items-center justify-end gap-4", valueTextClass)}>
								<div className={metaLabelClass}>{t("sourceId")}</div>
								<IdCopyButton hideId id={eventInfo.destinationId || ""} />
							</div>
						</div>
					</div>
				</>
			) : null}
			<Typography className={payloadTitleClass}>{t("payload")}</Typography>
			<ValueRenderer isJsonViewerCollapsed={false} jsonViewerClass={jsonViewerClass} value={eventInfo?.data} />
		</Frame>
	);
};
