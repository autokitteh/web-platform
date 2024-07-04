import { CatImage } from "@assets/image";
import { Close } from "@assets/image/icons";
import { Button, Frame, IconButton, Loader, LogoCatLarge } from "@components/atoms";
import { fetchSessionsInterval, sessionsEditorLineHeight } from "@constants";
import { SessionLogRecord } from "@models";
import Editor, { Monaco } from "@monaco-editor/react";
import { SessionsService } from "@services";
import { useToastStore } from "@store/useToastStore";
import { isEqual } from "lodash";
import * as monaco from "monaco-editor";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const SessionTableEditorFrame = () => {
	const [editorKey, setEditorKey] = useState(0);
	const [cachedSessionLogs, setCachedSessionLogs] = useState<SessionLogRecord[]>([]);
	const { deploymentId, projectId, sessionId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const navigate = useNavigate();
	const sessionFetchIntervalIdRef = useRef<number | null>(null);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [isScrolledDown, setIsScrolledDown] = useState(false);

	const fetchSessionLog = useCallback(async () => {
		if (firstLoad) {
			setIsLoading(true);
		}
		const { data: sessionHistoryStates, error } = await SessionsService.getLogRecordsBySessionId(sessionId!);
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

	const handleEditorWillMount = (monaco: Monaco) => {
		monaco.editor.defineTheme("sessionEditorTheme", {
			base: "vs-dark",
			colors: { "editor.background": "#000000" },
			inherit: true,
			rules: [],
		});
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

	const scrollToTop = () => {
		const editor = editorRef.current;
		if (editor) {
			editor.setScrollTop(0);
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

	useEffect(() => {
		if (checkIfLogsOverflowsEditor()) {
			scrollToBottom();
		}
	}, [cachedSessionLogs]);

	const sessionLogsAsStringForOutput = cachedSessionLogs?.map(({ logs }) => logs).join("\n");
	const closeEditor = () => navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`);

	return (
		<Frame className="ml-2.5 pt-20 transition w-3/5">
			{isLoading ? (
				<div className="flex h-full items-center w-full">
					<Loader />
				</div>
			) : (
				<>
					<div className="-mt-10 flex font-bold items-center justify-between">
						{t("output")}:
						<IconButton
							ariaLabel={t("buttons.ariaCloseEditor")}
							className="bg-gray-700 h-7 p-0.5 w-7"
							onClick={closeEditor}
						>
							<Close className="fill-white h-3 transition w-3" />
						</IconButton>
					</div>
					{cachedSessionLogs?.length ? (
						<Editor
							beforeMount={handleEditorWillMount}
							className="-ml-6"
							key={editorKey}
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
						<div className="flex flex-col items-center mt-20">
							<p className="font-bold mb-8 text-gray-400 text-lg">{t("noData")}</p>

							<CatImage className="border-b border-gray-400 fill-gray-400" />
						</div>
					)}

					{isScrolledDown ? (
						<div className="-translate-x-1/2 absolute bottom-2 left-1/2 m-auto transform">
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
