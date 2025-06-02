import React, { useMemo } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { useTranslation } from "react-i18next";

import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { SessionActivity } from "@src/interfaces/models";

import { Button } from "@components/atoms";
import { ValueRenderer } from "@components/molecules";

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

					{activity?.args?.length ? (
						<JsonView
							className="scrollbar max-h-96 overflow-auto rounded-md border border-gray-1000 !bg-transparent p-2"
							collapsed={true}
							style={githubDarkTheme}
							value={mappedArguments}
						/>
					) : (
						<div>{t("noArgumentsFound")}</div>
					)}

					<div className="mb-4 mt-8 font-bold">{t("kwArguments")}:</div>

					{activity.kwargs && !!Object.keys(activity.kwargs).length ? (
						<JsonView
							className="scrollbar max-h-96 overflow-auto rounded-md border border-gray-1000 !bg-transparent p-2"
							collapsed={true}
							style={githubDarkTheme}
							value={activity.kwargs}
						/>
					) : (
						<div>{t("noKwArgumentsFound")}</div>
					)}

					<div className="mb-4 mt-8 font-bold">{t("returnValues")}</div>
					<ValueRenderer value={activity.returnValue} />
				</div>
			</div>
		</div>
	);
};
