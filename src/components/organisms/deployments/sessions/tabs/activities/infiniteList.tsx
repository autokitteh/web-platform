import React, { useCallback, useMemo, useState } from "react";

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

	const itemData = useMemo(() => ({ activities }), [activities]);

	const rowRenderer: ListRowRenderer = ({ index, key, style }) => (
		<ActivityRow data={itemData} index={index} key={key} setActivity={setActivity} style={style} />
	);

	const handleResize = useCallback(({ height }: { height: number }) => {
		setResizeHeight(height - 20);
	}, []);

	const autoSizerClass = activity ? "hidden" : "";

	return (
		<div className="h-full w-full">
			{activity ? (
				<div className="absolute z-30 h-full w-full">
					<IconButton className="absolute right-0" onClick={() => setActivity(undefined)}>
						<Close fill="white" />
					</IconButton>

					<div className="mx-7">
						{/* Arguments */}

						{activity?.args?.length ? (
							<>
								<div className="font-bold">Arguments:</div>
								<Table className="mt-2">
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
							</>
						) : null}

						{/* KW Arguments */}

						{activity.kwargs && !!Object.keys(activity.kwargs).length ? (
							<>
								<div className="mt-4 font-bold">KW Arguments:</div>
								<Table className="mt-2">
									<THead>
										<Tr>
											<Th>Key</Th>

											<Th>Value</Th>
										</Tr>
									</THead>

									<TBody>
										{Object.entries(activity.kwargs).map(([key, value]) => (
											<Tr key={key}>
												<Td>{key}: </Td>

												<Td>
													{typeof value === "object" ? JSON.stringify(value) : String(value)}
												</Td>
											</Tr>
										))}
									</TBody>
								</Table>
							</>
						) : null}

						{/* Returned Value */}

						{activity.returnValue ? (
							<Accordion
								className="mt-2"
								title={<div className="font-bold underline">Returned Value</div>}
							>
								<JsonView
									className="scrollbar max-h-72 overflow-auto"
									style={githubDarkTheme}
									value={JSON.parse(activity.returnValue)}
								/>
							</Accordion>
						) : null}
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
