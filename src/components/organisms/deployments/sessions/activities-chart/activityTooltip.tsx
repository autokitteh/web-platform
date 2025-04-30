import React from "react";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useTranslation } from "react-i18next";

import { SessionActivity } from "@src/interfaces/models";

dayjs.extend(duration);

export const ActivityChartTooltip = (activity: SessionActivity) => {
	const { t } = useTranslation("deployments");

	const { startTime, endTime, functionName, duration } = activity;

	if (!startTime || !endTime) {
		return null;
	}

	return (
		<div className="rounded-md bg-gray-900 p-2 text-white">
			<div>
				${t("function")}: ${functionName}
			</div>
			<div>
				${t("startTime")}: ${startTime.toString()}
			</div>
			<div>
				${t("endTime")}: ${endTime.toString()}
			</div>
			<div>
				${t("duration")}: ${duration}
			</div>
		</div>
	);
};
