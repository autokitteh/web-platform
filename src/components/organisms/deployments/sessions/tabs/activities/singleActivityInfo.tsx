import React from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { useTranslation } from "react-i18next";

import { SessionActivity } from "@src/types/models";

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

				<div className="ml-2 font-semibold">{activity.functionName}</div>
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
										<Td>{argument} </Td>
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
									<Th>{t("kwArgumentsKey")}</Th>

									<Th>{t("kwArgumentsValue")}</Th>
								</Tr>
							</THead>

							<TBody>
								{Object.entries(activity.kwargs).map(([key, value]) => (
									<Tr key={key}>
										<Td>{key}</Td>

										<Td>{typeof value === "object" ? JSON.stringify(value) : String(value)}</Td>
									</Tr>
								))}
							</TBody>
						</Table>
					) : (
						<div>{t("noKwArgumentsFound")}d</div>
					)}

					<div className="mb-4 mt-8 font-bold">{t("returnValues")}</div>

					{!activity.returnStringValue &&
					!activity.returnBytesValue &&
					!Object.keys(activity.returnJSONValue || {}).length ? (
						<div>{t("noReturnValuesFound")}</div>
					) : null}

					{activity.returnBytesValue ? (
						<Accordion
							className="mb-4"
							title={<div className="font-bold underline">{t("returnValues")}</div>}
						>
							<pre className="whitespace-pre-wrap">{activity.returnBytesValue}</pre>
						</Accordion>
					) : null}

					{Object.keys(activity.returnJSONValue || {}).length ? (
						<Accordion
							className="mb-4"
							title={<div className="font-bold underline">{t("returnValues")}</div>}
						>
							<JsonView
								className="scrollbar mt-2 max-h-72 overflow-auto"
								style={githubDarkTheme}
								value={activity.returnJSONValue}
							/>
						</Accordion>
					) : null}

					{activity.returnStringValue ? (
						<Accordion
							className="mb-4"
							title={<div className="font-bold underline">{t("returnValues")}</div>}
						>
							<pre className="w-4/5 whitespace-pre-wrap break-words">{activity.returnStringValue}</pre>
						</Accordion>
					) : null}
				</div>
			</div>
		</div>
	);
};
