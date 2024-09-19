import React, { useCallback, useEffect, useRef, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { isEqual } from "lodash";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { fetchSessionsInterval, sessionsEditorLineHeight } from "@constants";
import { SessionLogRecord } from "@models";
import { SessionsService } from "@services";
import { useToastStore } from "@store/useToastStore";

import { Button, Frame, IconButton, Loader, LogoCatLarge } from "@components/atoms";

import { CatImage } from "@assets/image";
import { Close } from "@assets/image/icons";

export const SessionTableEditorFrame = () => {
	const [editorKey, setEditorKey] = useState(0);
	const [cachedSessionLogs, setCachedSessionLogs] = useState<SessionLogRecord[]>([]);
	const { deploymentId, projectId, sessionId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const navigate = useNavigate();
	const sessionFetchIntervalIdRef = useRef<null | number>(null);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [isScrolledDown, setIsScrolledDown] = useState(false);

	const fetchSessionLog = useCallback(async () => {
		if (firstLoad) {
			setIsLoading(true);
		}
		const { data: sessionHistoryStates, error } = await SessionsService.getLogRecordsBySessionId(sessionId!);
		const sessionLogRecords = sessionHistoryStates?.records.map((logRecord) => new SessionLogRecord(logRecord));
		if (firstLoad) {
			setFirstLoad(false);
			setIsLoading(false);
		}
		if (error) {
			addToast({
				message: (error as Error).message,
				type: "error",
			});

			return;
		}
		if (!sessionLogRecords) {
			setCachedSessionLogs([]);

			return;
		}

		if (!isEqual(cachedSessionLogs, sessionHistoryStates)) {
			setCachedSessionLogs(sessionLogRecords);
		}

		const completedState = sessionLogRecords.find((state: SessionLogRecord) => state.isFinished());
		if (completedState && sessionFetchIntervalIdRef.current) {
			clearInterval(sessionFetchIntervalIdRef.current);
			sessionFetchIntervalIdRef.current = null;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, cachedSessionLogs]);

	useEffect(() => {
		fetchSessionLog();
		sessionFetchIntervalIdRef.current = window.setInterval(fetchSessionLog, fetchSessionsInterval);

		return () => {
			if (sessionFetchIntervalIdRef.current) {
				clearInterval(sessionFetchIntervalIdRef.current);
			}
		};
	}, [fetchSessionLog]);

	const handleEditorWillMount = (monaco: Monaco) => {
		monaco.editor.defineTheme("sessionEditorTheme", {
			base: "vs-dark",
			colors: { "editor.background": "#000000" },
			inherit: true,
			rules: [],
		});
	};

	const scrollToBottom = () => {
		const editor = editorRef.current;
		if (!editor) {
			return;
		}
		const lastLine = editor.getModel()?.getLineCount();
		if (lastLine) {
			editor.revealLine(lastLine);
		}
	};

	const checkIfLogsOverflowsEditor = () => {
		if (!editorRef.current) {
			return;
		}

		const editorHeight = editorRef.current.getLayoutInfo().height;

		return sessionsEditorLineHeight > editorHeight;
	};

	const checkScrollPosition = () => {
		const editor = editorRef.current;

		if (!editor) {
			return;
		}

		const scrollPosition = editor.getScrollTop();

		setIsScrolledDown(scrollPosition > 0);
	};

	const handleEditorDidMount = (_editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
		monaco.editor.setTheme("sessionEditorTheme");
		editorRef.current = _editor;

		// Add scroll listener

		_editor.onDidScrollChange(checkScrollPosition);

		if (checkIfLogsOverflowsEditor()) {
			scrollToBottom();
		}
	};

	const scrollToTop = () => {
		const editor = editorRef.current;
		if (editor) {
			editor.setScrollTop(0);
		}
	};

	useEffect(() => {
		if (checkIfLogsOverflowsEditor()) {
			scrollToBottom();
		}
	}, [cachedSessionLogs]);

	useEffect(() => {
		const handleResize = () => setEditorKey((prevKey) => prevKey + 1);
		window.addEventListener("resize", handleResize);

		return () => {
			const editor = editorRef.current;
			if (editor) {
				const disposable = editor.onDidScrollChange(checkScrollPosition);
				disposable.dispose();
			}
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const sessionLogsAsStringForOutput = cachedSessionLogs?.map(({ logs }) => logs).join("\n");
	const closeEditor = () => navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`);

	return (
		<Frame className="size-full pt-20 transition">
			{isLoading ? (
				<Loader isCenter size="xl" />
			) : (
				<>
					<div className="-mt-10 flex items-center justify-between font-bold">
						{t("output")}:{/* eslint-disable @liferay/empty-line-between-elements */}
						<IconButton
							ariaLabel={t("buttons.ariaCloseEditor")}
							className="size-7 bg-gray-1100 p-0.5"
							onClick={closeEditor}
						>
							<Close className="size-3 fill-white transition" />
						</IconButton>
					</div>
					{cachedSessionLogs?.length ? (
						<Editor
							beforeMount={handleEditorWillMount}
							className="-ml-6"
							key={editorKey}
							loading={<Loader isCenter size="lg" />}
							onMount={handleEditorDidMount}
							options={{
								lineHeight: sessionsEditorLineHeight,
								lineNumbers: "off",
								minimap: { enabled: false },
								readOnly: true,
								renderLineHighlight: "none",
								scrollBeyondLastLine: false,
								wordWrap: "on",
							}}
							theme="vs-dark"
							value={sessionLogsAsStringForOutput}
						/>
					) : (
						<div className="mt-20 flex flex-col items-center">
							<p className="mb-8 text-lg font-bold text-gray-750">{t("noData")}</p>

							<CatImage className="border-b border-gray-750 fill-gray-750" />
						</div>
					)}

					{isScrolledDown ? (
						<div className="absolute bottom-2 left-1/2 m-auto -translate-x-1/2">
							<Button className="justify-center" onClick={scrollToTop} variant="filled">
								{t("buttons.scrollToTop")}
							</Button>
						</div>
					) : null}
				</>
			)}

			<LogoCatLarge />
		</Frame>
	);
};
