import React, { useCallback, useEffect, useRef, useState } from "react";
import { CatImage } from "@assets/image";
import { Close } from "@assets/image/icons";
import { Button, Frame, IconButton, Loader, LogoCatLarge } from "@components/atoms";
import { fetchSessionsInterval } from "@constants";
import { SessionLogRecord } from "@models";
import Editor, { Monaco } from "@monaco-editor/react";
import { SessionsService } from "@services";
import { useToastStore } from "@store/useToastStore";
import { isEqual } from "lodash";
import * as monaco from "monaco-editor"; // Ensure to import monaco-editor types
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
const editorLineHeight = 20;

export const SessionTableEditorFrame = () => {
	const [editorKey, setEditorKey] = useState(0);
	const [cachedSessionLogs, setCachedSessionLogs] = useState<SessionLogRecord[]>();
	const { sessionId, projectId, deploymentId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const navigate = useNavigate();
	const intervalIdRef = useRef<number | null>(null);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);

	const fetchSessionLog = useCallback(async () => {
		if (firstLoad) setIsLoading(true);
		const { data: sessionHistoryStates, error } = await SessionsService.getLogRecordsBySessionId(sessionId!);
		if (firstLoad) setIsLoading(false);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
			});
			return;
		}
		if (!sessionHistoryStates) {
			setCachedSessionLogs([]);
			return;
		}

		if (!isEqual(cachedSessionLogs, sessionHistoryStates)) {
			setCachedSessionLogs(sessionHistoryStates);
		}

		const completedState = sessionHistoryStates.find((state) => state.isFinished());
		if (completedState && intervalIdRef.current) {
			clearInterval(intervalIdRef.current);
			intervalIdRef.current = null;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, addToast, tErrors, cachedSessionLogs]);

	useEffect(() => {
		setFirstLoad(false);
		scrollToTop();
	}, [sessionId]);

	useEffect(() => {
		fetchSessionLog();
		intervalIdRef.current = window.setInterval(fetchSessionLog, fetchSessionsInterval);
		return () => {
			if (intervalIdRef.current) clearInterval(intervalIdRef.current);
		};
	}, [fetchSessionLog]);

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
			colors: { "editor.background": "#000000" },
		});
	};

	const handleEditorDidMount = (_editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
		monaco.editor.setTheme("sessionEditorTheme");
		editorRef.current = _editor;
	};

	const scrollToBottom = () => {
		const editor = editorRef.current;
		if (editor) {
			const lastLine = editor.getModel()?.getLineCount();
			if (lastLine) {
				editor.revealLine(lastLine * 1.2);
			}
		}
	};

	const scrollToTop = () => {
		const editor = editorRef.current;
		if (editor) {
			editor.setScrollTop(0);
		}
	};

	const calculateNonEmptyLinesHeight = () => {
		const model = editorRef.current?.getModel();
		if (!model) return 0;

		return editorLineHeight * model.getLineCount();
	};

	const checkIfLogsOverflowsEditor = () => {
		if (!editorRef.current) return;

		const contentHeight = calculateNonEmptyLinesHeight();
		const editorHeight = editorRef.current.getLayoutInfo().height;

		return contentHeight > editorHeight;
	};

	useEffect(() => {
		if (checkIfLogsOverflowsEditor()) scrollToBottom();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cachedSessionLogs]);

	const sessionLogsAsStringForOutput = cachedSessionLogs?.map(({ logs }) => logs).join("\n");
	const closeEditor = () => navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`);

	return (
		<Frame className="w-3/5 transition pt-20 ml-2.5">
			{isLoading ? (
				<div className="flex items-center h-full w-full">
					<Loader />
				</div>
			) : (
				<>
					<div className="flex items-center justify-between -mt-10 font-bold">
						{t("output")}:
						<IconButton
							ariaLabel={t("buttons.ariaCloseEditor")}
							className="w-7 h-7 p-0.5 bg-gray-700"
							onClick={closeEditor}
						>
							<Close className="w-3 h-3 transition fill-white" />
						</IconButton>
					</div>
					{cachedSessionLogs?.length ? (
						<Editor
							beforeMount={handleEditorWillMount}
							className="-ml-6"
							key={editorKey}
							onMount={handleEditorDidMount}
							options={{
								readOnly: true,
								minimap: { enabled: false },
								lineNumbers: "off",
								renderLineHighlight: "none",
								wordWrap: "on",
								lineHeight: 20,
							}}
							theme="vs-dark"
							value={sessionLogsAsStringForOutput}
						/>
					) : (
						<div className="flex flex-col items-center mt-20">
							<p className="mb-8 text-lg font-bold text-gray-400">{t("noData")}</p>
							<CatImage className="border-b border-gray-400 fill-gray-400" />
						</div>
					)}

					<Button className="m-auto" onClick={scrollToTop} variant="filled">
						{t("buttons.scrollToTop")}
					</Button>
				</>
			)}

			<LogoCatLarge />
		</Frame>
	);
};
