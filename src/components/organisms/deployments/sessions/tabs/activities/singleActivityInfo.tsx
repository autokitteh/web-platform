import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { SessionActivity } from "@src/interfaces/models";

import { Button } from "@components/atoms";
import { JsonViewer } from "@components/molecules";

import { ArrowLeft, Close } from "@assets/image/icons";

export const SingleActivityInfo = ({
	activity,
	setActivity,
}: {
	activity: SessionActivity;
	setActivity: (activity?: SessionActivity) => void;
}) => {
	const { t } = useTranslation("deployments", { keyPrefix: "activities.single" });

	const mappedArguments = useMemo(() => {
		return activity.args?.map((argument) => {
			try {
				return JSON.parse(argument);
			} catch {
				return argument;
			}
		});
	}, [activity.args]);

	const handleClick = () => {
		setActivity(undefined);
		triggerEvent(EventListenerName.selectSessionActivity, { activity: undefined });
	};

	return (
		<div className="absolute z-30 h-full w-4/5">
			<Button className="flex items-center text-white hover:bg-transparent" onClick={handleClick}>
				<Close className="absolute right-3" fill="white" />

				<ArrowLeft className="ml-2 size-3 hover:bg-black" />

				<div className="ml-2 font-semibold">
					{t("functionName")}: {activity.functionName}
				</div>
			</Button>

			<div>
				<div className="pl-4">
					<div className="mb-4 mt-8 font-bold">{t("arguments")}:</div>

					{activity?.args?.length && mappedArguments?.length ? (
						<JsonViewer className="max-h-96" isCollapsed={true} value={mappedArguments} />
					) : (
						<div>{t("noArgumentsFound")}</div>
					)}

					<div className="mb-4 mt-8 font-bold">{t("kwArguments")}:</div>

					{activity.kwargs && !!Object.keys(activity.kwargs).length ? (
						<JsonViewer isCollapsed={true} value={activity.kwargs} />
					) : (
						<div>{t("noKwArgumentsFound")}</div>
					)}

					<div className="mb-4 mt-8 font-bold">{t("returnValues")}</div>

					{activity.returnValue?.value && Object.keys(activity.returnValue.value).length ? (
						<JsonViewer isCollapsed={true} value={activity.returnValue.value} />
					) : (
						<div>{t("noReturnValuesFound")}</div>
					)}
				</div>
			</div>
		</div>
	);
};
