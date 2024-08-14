import React, { useCallback, useEffect, useRef, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { isEqual } from "lodash";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { defaultSessionTab, fetchSessionsInterval, sessionTabs, sessionsEditorLineHeight } from "@constants";
import { SessionLogRecord } from "@models";
import { SessionsService } from "@services";
import { useToastStore } from "@store/useToastStore";

import { Button, Frame, IconButton, Loader, LogoCatLarge, Tab } from "@components/atoms";
import { Accordion } from "@components/molecules";
import { SessionsTableState } from "@components/organisms/deployments";

import { CatImage } from "@assets/image";
import { Close } from "@assets/image/icons";

const longArray = new Array(1000).fill(1);
const example = {
	string: "Lorem ipsum dolor sit amet",
	integer: 42,
	float: 114.514,
	bigint: 10086n,
	null: null,
	undefined,
	timer: 0,
	date: new Date("Tue Sep 13 2022 14:07:44 GMT-0500 (Central Daylight Time)"),
	array: [19, 100.86, "test", NaN, Infinity],
	nestedArray: [
		[1, 2],
		[3, 4],
	],
	object: {
		"first-child": true,
		"second-child": false,
		"last-child": null,
	},
	longArray,
	string_number: "1234",
};

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
	const [activeTab] = useState(defaultSessionTab);

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

	const goTo = (path: string) => {
		if (path === "outputs") {
			navigate("");

			return;
		}
		navigate(path.toLowerCase());
	};

	return (
		<Frame className="ml-2.5 w-2/4 transition">
			{isLoading ? (
				<Loader isCenter size="xl" />
			) : (
				<>
					<div className="flex items-center justify-between">
						<span className="text-lg" title="Session ID">
							{sessionId}
						</span>

						<span title="Created">3 days ago</span>
					</div>
					<div className="mt-1 flex justify-between">
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-1">
								Current status: <SessionsTableState sessionState={4} />
							</div>

							<div>
								Start time: <span>{new Date().toLocaleDateString("en-GB")}</span>
							</div>

							<div>
								End time: <span>{new Date().toLocaleDateString("en-GB")}</span>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<div>Connection name: MyGitHub</div>

							<div>Event Type: Type</div>

							<div>Build ID: bld_01j53hcjq6ecqamda2qq3n8wdx</div>
						</div>
					</div>
					<Accordion className="mt-2" title="Trigger Inputs">
						<JsonView
							className="scrollbar max-h-72 overflow-auto"
							style={githubDarkTheme}
							value={example}
						/>
					</Accordion>
					<div className="mt-2 flex items-center justify-between">
						<div
							className={
								`flex items-center gap-1 uppercase xl:gap-2 2xl:gap-4 3xl:gap-5 ` +
								`scrollbar overflow-x-auto overflow-y-hidden whitespace-nowrap`
							}
						>
							{sessionTabs.map((singleTab) => (
								<Tab
									activeTab={activeTab}
									ariaLabel={singleTab.label}
									className="p-0"
									key={singleTab.value}
									onClick={() => goTo(singleTab.value)}
									value={singleTab.value}
								>
									{singleTab.label}
								</Tab>
							))}
						</div>

						<IconButton
							ariaLabel={t("buttons.ariaCloseEditor")}
							className="h-7 w-7 bg-gray-1100 p-0.5"
							onClick={closeEditor}
						>
							<Close className="h-3 w-3 fill-white transition" />
						</IconButton>
					</div>
					{cachedSessionLogs?.length ? (
						<Editor
							beforeMount={handleEditorWillMount}
							className="absolute -ml-6 h-full"
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
						<div className="absolute bottom-2 left-1/2 m-auto -translate-x-1/2 transform">
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
