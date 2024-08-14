import React from "react";

import JsonView from "@uiw/react-json-view";
import { vscodeTheme } from "@uiw/react-json-view/vscode";

import { Accordion } from "@components/molecules";
import { SessionsTableState } from "@components/organisms/deployments";

const example = {
	string: "Lorem ipsum dolor sit amet",
	integer: 42,
	float: 114.514,
	bigint: 10086n,
	null: null,
	undefined,
	timer: 0,
	date: new Date("Tue Sep 13 2022 14:07:44 GMT-0500 (Central Daylight Time)"),
	array: [19, 100.86, "test", NaN, Infinity],
	nestedArray: [
		[1, 2],
		[3, 4],
	],
	object: {
		"first-child": true,
		"second-child": false,
		"last-child": null,
	},
	string_number: "1234",
};

export const SessionExecutionFlow = () => {
	return (
		<div className="mt-2">
			<Accordion
				className="mt-2 rounded-md bg-gray-1000 px-2 py-1"
				title={
					<div className="flex w-full gap-3">
						<div className="mt-0.5">18:20</div>

						<div>
							<div className="font-bold"> get(url,params?,headers?,data?,json?)</div>

							<div className="flex items-center gap-1">
								Status: <SessionsTableState sessionState={4} /> - 3m | Attempt #1
							</div>
						</div>
					</div>
				}
			>
				<div className="mx-7">
					<div className="font-bold">Params:</div>

					<div>#0: https://httpbin.org/json</div>

					<Accordion className="mt-2" title={<div className="font-bold underline">Returned Value</div>}>
						<JsonView className="scrollbar max-h-72 overflow-auto" style={vscodeTheme} value={example} />
					</Accordion>
				</div>
			</Accordion>
		</div>
	);
};
