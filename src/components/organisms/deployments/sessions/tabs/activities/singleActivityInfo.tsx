import React from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { useTranslation } from "react-i18next";

import { SessionActivity } from "@src/interfaces/models";

import { Button, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ArrowLeft, Close } from "@assets/image/icons";

export const SingleActivityInfo = ({
	activity,
	setActivity,
}: {
	activity: SessionActivity;
	setActivity: (activity?: SessionActivity) => void;
}) => {
	const { t } = useTranslation("deployments", { keyPrefix: "activities.single" });

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
						<Table>
							<THead>
								<Tr>
									<Th className="pl-4">{t("argumentsKey")}</Th>
								</Tr>
							</THead>

							<TBody>
								{activity.args.map((argument) => (
									<Tr key={argument}>
										<Td className="pl-4">{argument} </Td>
									</Tr>
								))}
							</TBody>
						</Table>
					) : (
						<div>{t("noArgumentsFound")}</div>
					)}

					<div className="mb-4 mt-8 font-bold">{t("kwArguments")}:</div>

					{activity.kwargs && !!Object.keys(activity.kwargs).length ? (
						<Table>
							<THead>
								<Tr>
									<Th className="w-1/2 pl-4">{t("kwArgumentsKey")}</Th>

									<Th className="w-1/2">{t("kwArgumentsValue")}</Th>
								</Tr>
							</THead>

							<TBody>
								{Object.entries(activity.kwargs).map(([key, value]) => (
									<Tr key={key}>
										<Td className="w-1/2 pl-4">{key}</Td>

										<Td className="w-1/2">
											{typeof value === "object" ? JSON.stringify(value) : String(value)}
										</Td>
									</Tr>
								))}
							</TBody>
						</Table>
					) : (
						<div>{t("noKwArgumentsFound")}d</div>
					)}

					<div className="mb-4 mt-8 font-bold">{t("returnValues")}</div>

					<Accordion className="mb-4" title={<div className="font-bold underline">{t("returnValues")}</div>}>
						{activity.returnStringValue ? (
							<pre className="w-4/5 whitespace-pre-wrap break-words">{activity.returnStringValue}</pre>
						) : activity.returnJSONValue ? (
							<JsonView
								className="scrollbar max-h-96 overflow-auto"
								style={githubDarkTheme}
								value={activity.returnJSONValue}
							/>
						) : (
							<div>{t("noReturnValuesFound")}</div>
						)}
					</Accordion>
				</div>
			</div>
		</div>
	);
};
