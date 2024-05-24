import React, { useEffect, useState } from "react";
import { CatImage } from "@assets/image";
import { Close } from "@assets/image/icons";
import { Frame, IconButton, LogoCatLarge } from "@components/atoms";
import { SessionTableEditorProps } from "@interfaces/components";
import Editor, { Monaco } from "@monaco-editor/react";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";

export const SessionTableEditorFrame = ({ sessionLog, isSelectedSession, onClose }: SessionTableEditorProps) => {
	const [editorKey, setEditorKey] = useState(0);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const sessionLogsEditorClass = cn("w-3/5 transition pt-20", {
		"bg-gray-700 rounded-l-none": !isSelectedSession,
		"ml-2.5": isSelectedSession,
	});

	useEffect(() => {
		const handleResize = () => setEditorKey((prevKey) => prevKey + 1);

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleEditorWillMount = (monaco: Monaco) => {
		monaco.editor.defineTheme("sessionEditorTheme", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#000000",
			},
		});
	};

	const handleEditorDidMount = (_editor: unknown, monaco: Monaco) => {
		monaco.editor.setTheme("sessionEditorTheme");
	};

	const sessionLogValue = sessionLog?.map(({ logs }) => logs).join("\n");

	return (
		<Frame className={sessionLogsEditorClass}>
			{isSelectedSession ? (
				<div className="flex items-center justify-between -mt-10 font-bold">
					{t("output")}:
					<IconButton ariaLabel={t("buttons.ariaCloseEditor")} className="w-7 h-7 p-0.5 bg-gray-700" onClick={onClose}>
						<Close className="w-3 h-3 transition fill-white" />
					</IconButton>
				</div>
			) : null}
			{isSelectedSession && sessionLog?.length ? (
				<Editor
					beforeMount={handleEditorWillMount}
					className="-ml-6"
					defaultLanguage="json"
					key={editorKey}
					onMount={handleEditorDidMount}
					options={{
						readOnly: true,
						minimap: {
							enabled: false,
						},
						lineNumbers: "off",
						renderLineHighlight: "none",
						wordWrap: "on",
					}}
					theme="vs-dark"
					value={sessionLogValue}
				/>
			) : (
				<div className="flex flex-col items-center mt-20">
					<p className="mb-8 text-lg font-bold text-gray-400">
						{isSelectedSession ? t("noData") : t("noSelectedSession")}
					</p>
					<CatImage className="border-b border-gray-400 fill-gray-400" />
				</div>
			)}

			<LogoCatLarge />
		</Frame>
	);
};
