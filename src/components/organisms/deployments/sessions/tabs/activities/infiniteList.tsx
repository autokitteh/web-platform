import React, { useCallback, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { AutoSizer, List, ListRowRenderer } from "react-virtualized";

import { ActivityRow } from "./infiniteRow";
import { ActivityListProps } from "@src/interfaces/components";
import { SessionActivity } from "@src/types/models";

import { IconButton, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { Close } from "@assets/image/icons";

export const ActivityList = ({ activities, onItemsRendered }: ActivityListProps) => {
	const [resizeHeight, setResizeHeight] = useState(0);
	const [activity, setActivity] = useState<SessionActivity>();

	const rowRenderer: ListRowRenderer = ({ index, key, style }) => (
		<ActivityRow data={activities[index]} index={index} key={key} setActivity={setActivity} style={style} />
	);

	const handleResize = useCallback(({ height }: { height: number }) => {
		setResizeHeight(height - 20);
	}, []);

	const autoSizerClass = activity ? "hidden" : "";

	return (
		<div className="h-full w-full">
			{activity ? (
				<div className="absolute z-30 h-full w-full">
					<div className="flex items-center">
						<IconButton className="absolute right-0" onClick={() => setActivity(undefined)}>
							<Close fill="white" />
						</IconButton>

						<div className="font-semibold">{activity.functionName}</div>
					</div>

					<div>
						<div className="pl-4">
							<div className="mb-4 mt-8 font-bold">Arguments:</div>

							{activity?.args?.length ? (
								<Table>
									<THead>
										<Tr>
											<Th>Key</Th>
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
								<div>No arguments found</div>
							)}

							<div className="mb-4 mt-8 font-bold">KW Arguments:</div>

							{activity.kwargs && !!Object.keys(activity.kwargs).length ? (
								<Table>
									<THead>
										<Tr>
											<Th>Key</Th>

											<Th>Value</Th>
										</Tr>
									</THead>

									<TBody>
										{Object.entries(activity.kwargs).map(([key, value]) => (
											<Tr key={key}>
												<Td>{key}</Td>

												<Td>
													{typeof value === "object" ? JSON.stringify(value) : String(value)}
												</Td>
											</Tr>
										))}
									</TBody>
								</Table>
							) : (
								<div>No KW arguments found</div>
							)}

							<div className="mb-4 mt-8 font-bold">Return value:</div>

							{!activity.returnStringValue &&
							!activity.returnBytesValue &&
							!Object.keys(activity.returnJSONValue || {}).length ? (
								<div>No returned value found</div>
							) : null}

							{activity.returnBytesValue ? (
								<Accordion
									className="mb-4"
									title={<div className="font-bold underline">Returned Value</div>}
								>
									<pre className="whitespace-pre-wrap">{activity.returnBytesValue}</pre>
								</Accordion>
							) : null}

							{Object.keys(activity.returnJSONValue || {}).length ? (
								<Accordion
									className="mb-4"
									title={<div className="font-bold underline">Returned Value</div>}
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
									title={<div className="font-bold underline">Returned Value</div>}
								>
									<pre className="w-4/5 whitespace-pre-wrap break-words">
										{activity.returnStringValue}
									</pre>
								</Accordion>
							) : null}
						</div>
					</div>
				</div>
			) : null}

			<AutoSizer className={autoSizerClass} onResize={handleResize}>
				{({ height, width }) => (
					<List
						className="scrollbar"
						height={resizeHeight || height * 0.9}
						onRowsRendered={({ startIndex, stopIndex }) =>
							onItemsRendered({
								visibleStartIndex: startIndex,
								visibleStopIndex: stopIndex,
							})
						}
						rowCount={activities.length}
						rowHeight={60}
						rowRenderer={rowRenderer}
						width={width}
					/>
				)}
			</AutoSizer>
		</div>
	);
};
