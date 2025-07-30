/* eslint-disable no-console */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import dayjs from "dayjs";
import { debounce, last } from "lodash";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import { useLocation, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";

import { dateTimeFormat, monacoLanguages, namespaces } from "@constants";
import { LoggerService, iframeCommService } from "@services";
import { EventListenerName, LocalStorageKeys } from "@src/enums";
import { fileOperations } from "@src/factories";
import { useEventListener } from "@src/hooks/useEventListener";
import { useCacheStore, useFileStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { MessageTypes } from "@src/types";
import { EditorCodePosition } from "@src/types/components";
import { cn, getPreference } from "@utilities";

import { Button, IconButton, IconSvg, Loader, MermaidDiagram, Spinner, Tab, Typography } from "@components/atoms";
import { CodeFixDiffEditorModal } from "@components/organisms";

import { AKRoundLogo } from "@assets/image";
import { Close, SaveIcon } from "@assets/image/icons";

export const EditorTabs = () => {
	const { projectId } = useParams() as { projectId: string };
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const {
		currentProjectId,
		fetchResources,
		resourses,
		setLoading,
		loading: { code: isLoadingCode },
	} = useCacheStore();

	const addToast = useToastStore((state) => state.addToast);
	const { openFiles, openFileAsActive, closeOpenedFile } = useFileStore();
	const {
		cursorPositionPerProject,
		setCursorPosition,
		selectionPerProject,
		setSelection,
		fullScreenEditor,
		setFullScreenEditor,
	} = useSharedBetweenProjectsStore();

	const location = useLocation();
	const fileToOpen = location.state?.fileToOpen;
	console.log("File to open from location state:", fileToOpen);

	const hasOpenedFile = useRef(false);

	useEffect(() => {
		const openFileFromLocation = async () => {
			if (fileToOpen && !hasOpenedFile.current) {
				console.log("Attempting to open file from location:", fileToOpen);

				// Wait for resources to be available in cache store
				if (resourses && resourses[fileToOpen]) {
					console.log("File found in cache store resources, opening:", fileToOpen);
					openFileAsActive(fileToOpen);
					hasOpenedFile.current = true;
				} else if (resourses) {
					console.log(
						"File not found in cache store resources:",
						fileToOpen,
						"Available files:",
						Object.keys(resourses)
					);
				} else {
					console.log("Resources not yet loaded in cache store");
				}
			}
		};

		openFileFromLocation();
	}, [fileToOpen, resourses, openFileAsActive]); // Use resourses from cache store instead of fetching directly

	// Always derive the active editor file name from the store
	const activeFile = openFiles[projectId]?.find((f: { isActive: boolean }) => f.isActive);
	const activeEditorFileName = activeFile?.name || "";

	const fileExtension = "." + last(activeEditorFileName.split("."));
	const languageEditor = monacoLanguages[fileExtension as keyof typeof monacoLanguages];
	const { saveFile } = fileOperations(projectId!);

	const [content, setContent] = useState("");
	const autoSaveMode = getPreference(LocalStorageKeys.autoSave);
	const [lastSaved, setLastSaved] = useState<string>();
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const initialContentRef = useRef("");
	const [isFirstContentLoad, setIsFirstContentLoad] = useState(true);
	const [isFirstCursorPositionChange, setIsFirstCursorPositionChange] = useState(true);
	const [isFocusedAndTyping, setIsFocusedAndTyping] = useState(false);
	const [editorMounted, setEditorMounted] = useState(false);
	const [codeFixData, setCodeFixData] = useState<{
		endLine: number;
		modifiedCode: string;
		originalCode: string;
		startLine: number;
	} | null>(null);

	useEffect(() => {
		if (!content || !isFirstContentLoad) return;

		initialContentRef.current = content;
		setIsFirstContentLoad(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content]);

	const updateContentFromResource = (resource?: Uint8Array) => {
		if (!resource) {
			setContent("");

			return;
		}
		setContent(new TextDecoder().decode(resource));
		initialContentRef.current = new TextDecoder().decode(resource);
	};

	// Removed openDefaultFile function - file opening now handled directly in useEffect

	const loadContent = async () => {
		if (!projectId) return;

		const resources = await fetchResources(projectId, true);
		console.log("resoucse", resources);

		// Use the derived activeEditorFileName
		if (!resources || !Object.prototype.hasOwnProperty.call(resources, activeEditorFileName)) {
			if (activeEditorFileName) {
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					`File "${activeEditorFileName}" not found in project 2 ${projectId}`
				);
			}
			setContent("");
			return;
		}
		let resource: Uint8Array | undefined;
		if (resources && typeof resources === "object" && activeEditorFileName in resources) {
			resource = (resources as Record<string, Uint8Array>)[activeEditorFileName];
		}
		updateContentFromResource(resource);
	};

	const loadFileResource = async () => {
		if (!projectId) return;

		const resources = await fetchResources(projectId);
		if (!resources || !Object.prototype.hasOwnProperty.call(resources, activeEditorFileName)) {
			if (activeEditorFileName) {
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					`File "${activeEditorFileName}" not found in project 2 ${projectId}`
				);
			}
			setContent("");
			return;
		}
		try {
			const resource = resources[activeEditorFileName];
			updateContentFromResource(resource);
		} catch (error) {
			LoggerService.warn(
				namespaces.ui.projectCodeEditor,
				`Error loading file "${activeEditorFileName}": ${error.message}`
			);
		}
	};

	useEffect(() => {
		if (currentProjectId !== projectId) {
			loadContent();

			return;
		}

		if (!activeEditorFileName) return;

		loadFileResource();
		const currentPosition = cursorPositionPerProject[projectId]?.[activeEditorFileName];

		LoggerService.info(
			namespaces.chatbot,
			`Setting cursor positions for project ${projectId} file info: line ${currentPosition?.lineNumber || 1}`
		);

		iframeCommService.safeSendEvent(MessageTypes.SET_EDITOR_CURSOR_POSITION, {
			filename: activeEditorFileName,
			line: currentPosition?.lineNumber || 1,
		});

		const currentSelection = selectionPerProject[projectId]?.[activeEditorFileName];

		if (!currentSelection) return;

		LoggerService.info(
			namespaces.chatbot,
			`Sending stored selection for project ${projectId} file ${activeEditorFileName}: lines ${currentSelection.startLine}-${currentSelection.endLine}`
		);

		iframeCommService.safeSendEvent(MessageTypes.SET_EDITOR_CODE_SELECTION, {
			filename: activeEditorFileName,
			...currentSelection,
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeEditorFileName, projectId, currentProjectId]);

	// Removed separate useEffect for default file opening - now handled in main file opening logic above

	useEffect(() => {
		setLastSaved(undefined);
		hasOpenedFile.current = false; // Reset when project changes
	}, [projectId]);

	// Listen for code fix suggestions from chatbot using useEventListener hook
	useEventListener(EventListenerName.codeFixSuggestion, (event) => {
		const { startLine, endLine, newCode } = event.detail;

		if (!editorRef.current || !activeEditorFileName) {
			LoggerService.warn(
				namespaces.ui.projectCodeEditor,
				"Cannot apply code fix suggestion: No active editor or file"
			);
			return;
		}

		// Extract the original code between the specified lines
		const model = editorRef.current.getModel();
		if (!model) return;

		const originalCode = model.getValueInRange({
			startLineNumber: startLine,
			startColumn: 1,
			endLineNumber: endLine,
			endColumn: model.getLineMaxColumn(endLine),
		});

		setCodeFixData({
			originalCode,
			modifiedCode: newCode,
			startLine,
			endLine,
		});
	});

	const handleEditorWillMount = (monaco: Monaco) => {
		monaco.editor.defineTheme("myCustomTheme", {
			base: "vs-dark",
			colors: {
				"editor.background": "#000000",
			},
			inherit: true,
			rules: [],
		});
	};

	const handleEditorDidMount = (_editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
		monaco.editor.setTheme("myCustomTheme");
		editorRef.current = _editor;
		const model = _editor.getModel();
		if (!model) return;
		model.pushEditOperations([], [], () => null);

		_editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
			const currentContent = model.getValue();

			if (currentContent === initialContentRef.current) {
				return;
			}
			_editor.trigger("keyboard", "undo", null);
		});
		setEditorMounted(true);
	};

	const handleEditorFocus = (
		editorOrEvent: monaco.editor.IStandaloneCodeEditor | monaco.editor.ICursorPositionChangedEvent
	) => {
		if (!projectId) return;
		let position: monaco.IPosition | null = null;

		if ("getPosition" in editorOrEvent) {
			position = editorOrEvent.getPosition();
		} else if ("position" in editorOrEvent) {
			position = editorOrEvent.position;
		}

		if (!position) return;
		LoggerService.info(
			namespaces.chatbot,
			`Setting cursor positions for project ${projectId} file info: line ${position.lineNumber}, column ${position.column}`
		);

		iframeCommService.safeSendEvent(MessageTypes.SET_EDITOR_CURSOR_POSITION, {
			filename: activeEditorFileName,
			line: position.lineNumber,
		});

		setIsFocusedAndTyping(true);

		setCursorPosition(projectId, activeEditorFileName, {
			column: position.column,
			lineNumber: position.lineNumber,
		});
	};

	const handleSelectionChange = (event: monaco.editor.ICursorSelectionChangedEvent) => {
		if (!projectId) return;
		const selection = event.selection;

		if (!selection.isEmpty()) {
			console.log("Selection changed:", selection);

			const selectedText = editorRef.current?.getModel()?.getValueInRange(selection) || "";

			const selectionData = {
				startLine: selection.startLineNumber,
				startColumn: selection.startColumn,
				endLine: selection.endLineNumber,
				endColumn: selection.endColumn,
				selectedText: selectedText,
			};

			// Save to store
			setSelection(projectId, activeEditorFileName, selectionData);

			LoggerService.info(
				namespaces.chatbot,
				`Selection changed for project ${projectId}: lines ${selection.startLineNumber}-${selection.endLineNumber}, text: "${selectedText.substring(0, 100)}${selectedText.length > 100 ? "..." : ""}"`
			);

			console.log("Sending event", MessageTypes.SET_EDITOR_CODE_SELECTION + "+" + JSON.stringify(selectionData));

			iframeCommService.safeSendEvent(MessageTypes.SET_EDITOR_CODE_SELECTION, {
				filename: activeEditorFileName,
				...selectionData,
			});
		}
	};

	useEffect(() => {
		if (!editorMounted) return;
		const codeEditor = editorRef.current;
		if (!codeEditor) return;

		const cursorPositionChangeListener = codeEditor.onDidChangeCursorPosition(handleEditorFocus);
		const selectionChangeListener = codeEditor.onDidChangeCursorSelection(handleSelectionChange);

		return () => {
			cursorPositionChangeListener.dispose();
			selectionChangeListener.dispose();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, currentProjectId, activeEditorFileName, editorRef, editorMounted]);

	const revealAndFocusOnLineInEditor = (
		codeEditor: monaco.editor.IStandaloneCodeEditor,
		cursorPosition: EditorCodePosition
	) => {
		codeEditor.revealLineInCenter(cursorPosition.lineNumber);
		codeEditor.setPosition({ ...cursorPosition });

		codeEditor.focus();
	};

	useEffect(() => {
		setIsFocusedAndTyping(false);
	}, [activeEditorFileName]);

	useEffect(() => {
		if (isFocusedAndTyping) return;
		if (isFirstCursorPositionChange) {
			setIsFirstCursorPositionChange(false);
			return;
		}
		const cursorPosition = cursorPositionPerProject[projectId]?.[activeEditorFileName];
		const codeEditor = editorRef.current;
		if (!cursorPosition && codeEditor) {
			revealAndFocusOnLineInEditor(codeEditor, { lineNumber: 0, column: 0 });
		}
		if (!content || !cursorPosition || !codeEditor || !codeEditor.getModel()) return;

		revealAndFocusOnLineInEditor(codeEditor, cursorPosition);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeEditorFileName, content]);

	const updateContent = async (newContent?: string) => {
		if (!newContent) return;
		const handleError = (key: string, options?: Record<string, unknown>) => {
			addToast({
				message: tErrors("codeSaveFailed"),
				type: "error",
			});
			LoggerService.error(namespaces.projectUICode, tErrors(key, options));
		};

		if (!projectId) {
			handleError("codeSaveFailedMissingProjectId");

			return;
		}

		if (!activeEditorFileName) {
			addToast({
				message: `No file is currently open for editing in project ${projectId}`,
				type: "error",
			});
			LoggerService.warn(namespaces.projectUICode, `Save attempted with no active file for project ${projectId}`);
			return;
		}

		setLoading("code", true);
		try {
			const fileSaved = await saveFile(activeEditorFileName, newContent);
			if (!fileSaved) {
				addToast({
					message: tErrors("codeSaveFailed"),
					type: "error",
				});

				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					tErrors("codeSaveFailedExtended", { error: tErrors("codeSaveFailed"), projectId })
				);
				return;
			}
			setLastSaved(dayjs().format(dateTimeFormat));
		} catch (error) {
			addToast({
				message: tErrors("codeSaveFailed"),
				type: "error",
			});

			LoggerService.error(
				namespaces.ui.projectCodeEditor,
				tErrors("codeSaveFailedExtended", { error: (error as Error).message, projectId })
			);
		} finally {
			setTimeout(() => {
				setLoading("code", false);
			}, 1000);
		}
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedManualSave = useCallback(
		debounce(
			() => {
				const currentContent = editorRef.current?.getValue();
				if (currentContent !== undefined) {
					updateContent(currentContent);
				}
			},
			1500,
			{ leading: true, trailing: false }
		),
		[projectId, activeEditorFileName]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedAutosave = useCallback(debounce(updateContent, 1500), [projectId, activeEditorFileName]);

	const keydownListenerRef = useRef<((event: KeyboardEvent) => void) | null>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "s" || !(navigator.userAgent.includes("Mac") ? event.metaKey : event.ctrlKey)) return;
			event.preventDefault();
			debouncedManualSave();
		};

		keydownListenerRef.current = handleKeyDown;
		document.addEventListener("keydown", handleKeyDown, false);

		return () => {
			if (!keydownListenerRef.current) return;
			document.removeEventListener("keydown", keydownListenerRef.current);
		};
	}, [debouncedManualSave]);

	const activeCloseIcon = (fileName: string) => {
		const isActiveFile = openFiles[projectId].find(({ isActive, name }) => name === fileName && isActive);

		return cn("size-4 p-0.5 opacity-0 hover:bg-gray-1100 group-hover:opacity-100", {
			"opacity-100": isActiveFile,
		});
	};

	const toggleFullScreenEditor = () => {
		setFullScreenEditor(projectId, !fullScreenEditor[projectId]);
	};

	const handleCloseButtonClick = (
		event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>,
		name: string
	): void => {
		event.stopPropagation();
		closeOpenedFile(name);
		if (!fullScreenEditor[projectId] || openFiles[projectId]?.length !== 1) return;
		toggleFullScreenEditor();
	};

	const isMarkdownFile = useMemo(() => activeEditorFileName.endsWith(".md"), [activeEditorFileName]);
	const readmeContent = useMemo(() => content.replace(/---[\s\S]*?---\n/, ""), [content]);

	const markdownComponents = useMemo(
		() => ({
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			code: ({ node, inline, className, children, ...props }: any) => {
				const match = /language-(\w+)/.exec(className || "");
				const language = match ? match[1] : "";

				if (!inline && language === "mermaid") {
					return <MermaidDiagram chart={String(children).replace(/\n$/, "")} className="my-4" />;
				}

				return (
					<code className={className} {...props}>
						{children}
					</code>
				);
			},
		}),
		[]
	);

	const changePointerPosition = () => {
		const codeEditor = editorRef.current;
		if (!codeEditor || !codeEditor.getModel()) return;
		handleEditorFocus(codeEditor);
	};

	const handleEditorChange = (newContent?: string) => {
		if (!newContent) return;
		setIsFocusedAndTyping(true);
		setContent(newContent);
		changePointerPosition();
		if (autoSaveMode && activeEditorFileName) {
			debouncedAutosave(newContent);
		}
	};

	const handleApproveCodeFix = () => {
		if (!codeFixData || !editorRef.current) return;

		const model = editorRef.current.getModel();
		if (!model) return;

		const { startLine, endLine, modifiedCode } = codeFixData;

		// Replace the content in the specified range
		const range = {
			startLineNumber: startLine,
			startColumn: 1,
			endLineNumber: endLine,
			endColumn: model.getLineMaxColumn(endLine),
		};

		model.pushEditOperations(
			[],
			[
				{
					range,
					text: modifiedCode,
				},
			],
			() => null
		);

		// Update the component content state
		setContent(model.getValue());

		// Auto-save if enabled
		if (autoSaveMode && activeEditorFileName) {
			debouncedAutosave(model.getValue());
		}

		LoggerService.info(
			namespaces.ui.projectCodeEditor,
			`Applied code fix suggestion for lines ${startLine}-${endLine} in ${activeEditorFileName}`
		);

		addToast({
			message: `Successfully applied code fix to lines ${startLine}-${endLine}`,
			type: "success",
		});

		setCodeFixData(null);
	};

	const handleRejectCodeFix = () => {
		LoggerService.info(
			namespaces.ui.projectCodeEditor,
			`Rejected code fix suggestion for lines ${codeFixData?.startLine}-${codeFixData?.endLine}`
		);

		setCodeFixData(null);
	};

	return (
		<div className="relative flex h-full flex-col pt-11">
			{projectId ? (
				<>
					<div className="absolute left-0 top-0 flex w-full justify-between" id="editor-tabs">
						<div
							className={
								`flex h-8 select-none items-center gap-1 uppercase xl:gap-2 2xl:gap-4 3xl:gap-5 ` +
								`scrollbar overflow-x-auto overflow-y-hidden whitespace-nowrap`
							}
						>
							{projectId
								? openFiles[projectId]?.map(({ name }) => (
										<Tab
											activeTab={activeEditorFileName}
											className="group flex items-center gap-1 normal-case"
											key={name}
											onClick={() => openFileAsActive(name)}
											value={name}
										>
											{name}

											<IconButton
												ariaLabel={t("buttons.ariaCloseFile")}
												className={activeCloseIcon(name)}
												onClick={(event) => handleCloseButtonClick(event, name)}
											>
												<Close className="size-2 fill-gray-750 transition group-hover:fill-white" />
											</IconButton>
										</Tab>
									))
								: null}
						</div>

						{openFiles[projectId]?.length ? (
							<div
								className="relative -right-4 -top-2 z-10 flex items-center gap-1 whitespace-nowrap"
								title={lastSaved ? `${t("lastSaved")}: ${lastSaved}` : ""}
							>
								<div className="inline-flex items-center gap-2 border border-gray-1000 p-1">
									{autoSaveMode ? (
										<Button
											className="py-1"
											disabled={isLoadingCode}
											onClick={() => debouncedManualSave()}
											variant="flatText"
										>
											{isLoadingCode ? <Loader className="mr-1" size="sm" /> : null}
											<Typography size="small">{t("autoSave")}</Typography>
										</Button>
									) : (
										<Button
											className="h-6 whitespace-nowrap px-4 py-1"
											disabled={isLoadingCode}
											onClick={() => debouncedManualSave()}
											variant="filledGray"
										>
											<IconSvg className="fill-white" src={isLoadingCode ? Spinner : SaveIcon} />

											<div className="mt-0.5">{t("buttons.save")}</div>
										</Button>
									)}
								</div>
							</div>
						) : null}
					</div>

					{openFiles[projectId]?.length ? (
						isMarkdownFile ? (
							<div className="scrollbar markdown-dark markdown-body overflow-hidden overflow-y-auto bg-transparent text-white">
								<Markdown components={markdownComponents} remarkPlugins={[remarkGfm, remarkAlert]}>
									{readmeContent}
								</Markdown>
							</div>
						) : (
							<Editor
								aria-label={activeEditorFileName}
								beforeMount={handleEditorWillMount}
								className="absolute -ml-6 mt-2 h-full pb-5"
								language={languageEditor}
								loading={<Loader size="lg" />}
								onChange={handleEditorChange}
								onMount={handleEditorDidMount}
								options={{
									fontFamily: "monospace, sans-serif",
									fontSize: 14,
									minimap: {
										enabled: false,
									},
									renderLineHighlight: "none",
									scrollBeyondLastLine: false,
									wordWrap: "on",
								}}
								theme="vs-dark"
								value={content}
							/>
						)
					) : (
						<div className="flex h-full flex-col items-center justify-center pb-24">
							<IconSvg className="mb-12 fill-gray-800" size="36" src={AKRoundLogo} />
							<div className="text-center font-mono text-gray-800">
								<div>{t("noFileTextLine1")}</div>
								<div>{t("noFileTextLine2")}</div>
							</div>
						</div>
					)}
				</>
			) : null}

			{codeFixData ? (
				<CodeFixDiffEditorModal
					endLine={codeFixData.endLine}
					filename={activeEditorFileName}
					isOpen={true}
					modifiedCode={codeFixData.modifiedCode}
					onApprove={handleApproveCodeFix}
					onClose={() => setCodeFixData(null)}
					onReject={handleRejectCodeFix}
					originalCode={codeFixData.originalCode}
					startLine={codeFixData.startLine}
				/>
			) : null}
		</div>
	);
};
