import React from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { useTranslation } from "react-i18next";

import { DeepProtoValueResult } from "@src/interfaces/utilities";
import { cn, detectBytesType } from "@src/utilities";

export const ValueRenderer = ({
	value,
	expandedByDefault,
	jsonViewerClass = "",
}: {
	expandedByDefault?: boolean;
	jsonViewerClass?: string;
	value: DeepProtoValueResult | undefined;
}) => {
	const { t } = useTranslation("components", { keyPrefix: "valueRenderer" });

	const jsonViewerStyle = cn(
		"scrollbar overflow-auto rounded-md border border-gray-1000 !bg-transparent p-2",
		jsonViewerClass
	);

	if (!value)
		return (
			<div className="mt-3 rounded-md border border-x-red bg-error p-3 font-mono text-xs">{t("emptyValue")}</div>
		);

	if (value.type === "bytes") {
		const detection = detectBytesType(value.value);

		if (detection.type === "utf8" || detection.type === "ascii") {
			return (
				<div className="mt-3 whitespace-pre-wrap break-words rounded-md border border-gray-1000 bg-transparent p-3 font-mono text-sm">
					{detection.displayString}
				</div>
			);
		}
		if (detection.type === "json") {
			return (
				<JsonView
					className="scrollbar max-h-72 overflow-auto rounded-md border border-gray-1000 !bg-transparent p-2"
					enableClipboard={true}
					style={githubDarkTheme}
					value={detection.value}
				/>
			);
		}
		if (detection.type === "image" && detection.mimeType) {
			const blob = new Blob([new Uint8Array(value.value)], { type: detection.mimeType });
			const url = URL.createObjectURL(blob);
			return (
				<div className="mt-3 flex flex-col items-center">
					<img alt="Detected" className="max-h-60 max-w-xs rounded-md border" src={url} />
					<div className="mt-1 text-xs text-gray-500">{detection.mimeType}</div>
				</div>
			);
		}
		if (detection.type === "pdf" && detection.mimeType) {
			const blob = new Blob([new Uint8Array(value.value)], { type: detection.mimeType });
			const url = URL.createObjectURL(blob);
			return (
				<a
					className="mt-3 rounded-md border border-gray-1000 bg-transparent p-3 font-mono text-xs text-green-800 underline"
					href={url}
					rel="noopener noreferrer"
					target="_blank"
				>
					{t("openPdf")}
				</a>
			);
		}
		return (
			<div className="mt-3 rounded-md border border-gray-1000 bg-transparent p-3 font-mono text-xs">
				{t("bytesLabel", { count: Array.isArray(value.value) ? value.value.length : 0 })}
			</div>
		);
	}

	switch (value.type) {
		case "string":
		case "number":
		case "boolean":
			return (
				<div className="mt-3 whitespace-pre-wrap break-words rounded-md border border-gray-1000 bg-transparent p-3 font-mono text-sm">
					{String(value.value)}
				</div>
			);
		case "null":
			return (
				<div className="mt-3 rounded-md border border-gray-1000 bg-transparent p-3 font-mono text-xs text-gray-500">
					{t("nullLabel")}
				</div>
			);
		case "undefined":
			return (
				<div className="mt-3 rounded-md border border-gray-1000 bg-transparent p-3 font-mono text-xs text-gray-500">
					{t("undefinedLabel")}
				</div>
			);
		case "object":
		case "array":
			return (
				<JsonView
					className={jsonViewerStyle}
					collapsed={!expandedByDefault}
					enableClipboard={true}
					style={githubDarkTheme}
					value={value.value}
				/>
			);
		default:
			return (
				<div className="mt-3 rounded-md border border-x-red bg-error p-3 font-mono text-xs">
					{t("unknownType", { type: String(value.type) })}
				</div>
			);
	}
};
