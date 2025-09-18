import React from "react";

import { JsonViewer } from "@components/molecules";

export const ValueRenderer = ({
	value,
	isJsonViewerCollapsed = true,
	jsonViewerClass = "",
}: {
	isJsonViewerCollapsed?: boolean;
	jsonViewerClass?: string;
	value: Record<string, unknown> | undefined;
}) => {
	return <JsonViewer className={jsonViewerClass} isCollapsed={isJsonViewerCollapsed} value={value} />;
};
