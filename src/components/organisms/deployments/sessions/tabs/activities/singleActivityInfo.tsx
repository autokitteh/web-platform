import React, { useMemo } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { useTranslation } from "react-i18next";

import { SessionActivity } from "@src/interfaces/models";

import { Button } from "@components/atoms";

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

	return (
		<div className="absolute z-30 h-full w-4/5">
			<Button
				className="flex items-center text-white hover:bg-transparent"
				onClick={() => setActivity(undefined)}
			>
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
						<div className="rounded-md border-2 border-dashed border-gray-400 p-2 pt-0">
							<svg
								className="stroke-gray-400"
								fill="none"
								height="24"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								width="24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M0 0h24v24H0z" fill="none" stroke="none" />
								<path d="M20 16v-8l3 8v-8" />
								<path d="M15 8a2 2 0 0 1 2 2v4a2 2 0 1 1 -4 0v-4a2 2 0 0 1 2 -2z" />
								<path d="M1 8h3v6.5a1.5 1.5 0 0 1 -3 0v-.5" />
								<path d="M7 15a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-2a1 1 0 0 0 -1 -1h-1a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1h1a1 1 0 0 1 1 1" />
							</svg>
							<JsonView
								className="scrollbar max-h-96 overflow-auto !bg-transparent"
								collapsed={true}
								style={githubDarkTheme}
								value={mappedArguments}
							/>
						</div>
					) : (
						<div>{t("noArgumentsFound")}</div>
					)}

					<div className="mb-4 mt-8 font-bold">{t("kwArguments")}:</div>

					{activity.kwargs && !!Object.keys(activity.kwargs).length ? (
						<JsonView
							className="scrollbar max-h-96 overflow-auto rounded-md border-2 border-dashed border-gray-400 !bg-transparent p-2"
							collapsed={true}
							style={githubDarkTheme}
							value={activity.kwargs}
						/>
					) : (
						<div>{t("noKwArgumentsFound")}</div>
					)}

					<div className="mb-4 mt-8 font-bold">{t("returnValues")}</div>

					{activity.returnStringValue ? (
						<pre className="w-4/5 whitespace-pre-wrap break-words">{activity.returnStringValue}</pre>
					) : activity.returnJSONValue ? (
						<JsonView
							className="scrollbar max-h-96 overflow-auto"
							collapsed={true}
							style={githubDarkTheme}
							value={activity.returnJSONValue}
						/>
					) : (
						<div>{t("noReturnValuesFound")}</div>
					)}
				</div>
			</div>
		</div>
	);
};
