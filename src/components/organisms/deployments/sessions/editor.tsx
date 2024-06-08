import React, { useCallback, useEffect, useState } from "react";
import { CatImage } from "@assets/image";
import { Close } from "@assets/image/icons";
import { Frame, IconButton, LogoCatLarge } from "@components/atoms";
import { fetchSessionsInterval } from "@constants";
import { SessionLogRecord } from "@models";
import Editor, { Monaco } from "@monaco-editor/react";
import { SessionsService } from "@services";
import { useToastStore } from "@store/useToastStore";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const SessionTableEditorFrame = () => {
	const [editorKey, setEditorKey] = useState(0);
	const [sessionLog, setSessionLog] = useState<SessionLogRecord[]>();
	const { sessionId, projectId, deploymentId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const navigate = useNavigate();

	const fetchSessionLog = useCallback(async () => {
		const { data, error } = await SessionsService.getLogRecordsBySessionId(sessionId!);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
			});
			return;
		}
		if (!data) return;

		setSessionLog(data);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

	useEffect(() => {
		fetchSessionLog();

		const sessionFetchIntervalId = setInterval(fetchSessionLog, fetchSessionsInterval);
		return () => clearInterval(sessionFetchIntervalId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

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
	const closeEditor = () => navigate(`/projects/${projectId}/deployments/${deploymentId}`);

	return (
		<Frame className="w-3/5 transition pt-20 ml-2.5">
			<div className="flex items-center justify-between -mt-10 font-bold">
				{t("output")}:
				<IconButton
					ariaLabel={t("buttons.ariaCloseEditor")}
					className="w-7 h-7 p-0.5 bg-gray-700"
					onClick={() => closeEditor()}
				>
					<Close className="w-3 h-3 transition fill-white" />
				</IconButton>
			</div>
			{sessionLog?.length ? (
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
					<p className="mb-8 text-lg font-bold text-gray-400">{t("noData")}</p>
					<CatImage className="border-b border-gray-400 fill-gray-400" />
				</div>
			)}

			<LogoCatLarge />
		</Frame>
	);
};
