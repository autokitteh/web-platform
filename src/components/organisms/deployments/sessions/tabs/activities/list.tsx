import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ActivityList } from "./infiniteList";
import { convertSessionLogRecordsProtoToActivitiesModel } from "@src/models";
import { SessionActivity } from "@src/types/models";
import { useCacheStore } from "@store/useCacheStore";

import { Frame, Loader } from "@components/atoms";

export const SessionActivitiesList = () => {
	const { sessionId } = useParams();
	const { t } = useTranslation("deployments", { keyPrefix: "activities" });
	const { loadLogs, loading, logs, nextPageToken } = useCacheStore();
	const [activities, setActivities] = useState<SessionActivity[]>([]);

	useEffect(() => {
		const activities = convertSessionLogRecordsProtoToActivitiesModel(logs);
		setActivities(activities);
	}, [logs]);

	const handleItemsRendered = useCallback(
		({ visibleStopIndex }: { visibleStopIndex: number }) => {
			if (visibleStopIndex >= activities.length - 1 && nextPageToken && sessionId) {
				loadLogs(sessionId);
			}
		},
		[activities.length, nextPageToken, loadLogs, sessionId]
	);

	return (
		<Frame className="h-full rounded-b-[0] pb-0 pl-0 transition">
			{loading && !activities.length ? (
				<Loader isCenter size="xl" />
			) : activities.length ? (
				<ActivityList activities={activities} onItemsRendered={handleItemsRendered} />
			) : (
				<div className="mt-10 text-center text-xl font-semibold">{t("noActivitiesFound")}</div>
			)}
		</Frame>
	);
};
