import React, { useCallback, useEffect, useRef, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { isEqual } from "lodash";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { fetchSessionsInterval, sessionsEditorLineHeight } from "@constants";
import { SessionLogRecord } from "@models";
import { SessionsService } from "@services";
import { useToastStore } from "@store/useToastStore";

import { Button, Loader } from "@components/atoms";

import { CatImage } from "@assets/image";

export const SessionOutputs = () => {
	const [cachedSessionLogs, setCachedSessionLogs] = useState<SessionLogRecord[]>([]);
	const { sessionId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const sessionFetchIntervalIdRef = useRef<null | number>(null);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [isScrolledDown, setIsScrolledDown] = useState(false);

	const fetchSessionLog = useCallback(async () => {
		if (firstLoad) {
			setIsLoading(true);
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { data: sessionHistoryStates1, error: errorAct } = await SessionsService.getSessionActivitiesBySessionId(
			sessionId!
		);

		const { data: sessionHistoryStates, error } = await SessionsService.getLogPrintsBySessionId(sessionId!);
		if (firstLoad) {
			setFirstLoad(false);
			setIsLoading(false);
		}

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
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
		monaco.languages.register({ id: "outputLogs" });

		monaco.languages.setMonarchTokensProvider("outputLogs", {
			tokenizer: {
				root: [[/\b\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\b/, "dateTime"]],
			},
		});

		monaco.editor.defineTheme("sessionEditorTheme", {
			base: "vs-dark",
			colors: { "editor.background": "#000000" },
			rules: [{ token: "dateTime", foreground: "FFA500" }],
			inherit: true,
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
		return () => {
			const editor = editorRef.current;
			if (editor) {
				const disposable = editor.onDidScrollChange(checkScrollPosition);
				disposable.dispose();
			}
		};
	}, []);

	const sessionLogsAsStringForOutput = cachedSessionLogs?.map(({ logs }) => logs).join("\n");

	return isLoading ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="mt-2 h-full">
			{cachedSessionLogs?.length ? (
				<Editor
					beforeMount={handleEditorWillMount}
					className="absolute -ml-6 h-full"
					language="outputLogs"
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
						contextmenu: false,
					}}
					theme="sessionEditorTheme"
					value={sessionLogsAsStringForOutput}
				/>
			) : (
				<div className="mt-20 flex flex-col items-center">
					<p className="mb-8 text-lg font-bold text-gray-750">{t("noData")}</p>

					<CatImage className="border-b border-gray-750 fill-gray-750" />
				</div>
			)}

			{isScrolledDown ? (
				<div className="absolute bottom-2 left-1/2 m-auto -translate-x-1/2 transform">
					<Button className="justify-center" onClick={scrollToTop} variant="filled">
						{t("buttons.scrollToTop")}
					</Button>
				</div>
			) : null}
		</div>
	);
};
