import React from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";

import { cn } from "@src/utilities";

export const JsonViewer = ({
	value,
	className,
	isCollapsed,
}: {
	className?: string;
	isCollapsed?: boolean;
	value: Record<string, unknown> | unknown[] | undefined;
}) => {
	const viewerClass = cn("scrollbar overflow-auto rounded-md border border-gray-1000 p-2", className);
	return (
		<JsonView
			className={viewerClass}
			collapsed={isCollapsed}
			enableClipboard={true}
			style={
				{
					...githubDarkTheme,
					"background-color": "transparent",
				} as React.CSSProperties
			}
			value={value}
		/>
	);
};
