import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import dayjs from "dayjs";
import { debounce, last } from "lodash";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";

import { dateTimeFormat, defaultMonacoEditorLanguage, monacoLanguages, namespaces } from "@constants";
import { LoggerService, iframeCommService } from "@services";
import { EventListenerName, LocalStorageKeys, ModalName } from "@src/enums";
import { fileOperations } from "@src/factories";
import { triggerEvent, useEventListener } from "@src/hooks";
import {
	useCacheStore,
	useFileStore,
	useModalStore,
	useProjectStore,
	useSharedBetweenProjectsStore,
	useToastStore,
} from "@src/store";
import { MessageTypes } from "@src/types";
import { Project } from "@src/types/models";
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
		setLoading,
		loading: { code: isLoadingCode },
		resources,
	} = useCacheStore();
	const { getProject } = useProjectStore();
	const [currentProject, setCurrentProject] = useState<Project>();

	const loadProject = async () => {
		try {
			const { data: project } = await getProject(projectId);
			setCurrentProject(project);
			setProjectLoaded(true);
		} catch (error) {
			LoggerService.error(
				namespaces.ui.projectCodeEditor,
				`Error loading project "${projectId}": ${(error as Error).message}`
			);
		}
	};

	useEffect(() => {
		if (!projectId) return;
		loadProject();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const addToast = useToastStore((state) => state.addToast);
	const { openFiles, openFileAsActive, closeOpenedFile } = useFileStore();
	const { openModal, closeModal } = useModalStore();
	const { cursorPositionPerProject, setCursorPosition, selectionPerProject, fullScreenEditor, setFullScreenEditor } =
		useSharedBetweenProjectsStore();

	const hasOpenedFile = useRef(false);

	const activeFile = openFiles[projectId]?.find((f: { isActive: boolean }) => f.isActive);
	const activeEditorFileName = activeFile?.name || "";

	const fileExtension = "." + last(activeEditorFileName.split("."));
	const languageEditor =
		monacoLanguages[fileExtension as keyof typeof monacoLanguages] || defaultMonacoEditorLanguage;
	const { saveFile } = fileOperations(projectId!);

	const [content, setContent] = useState("");
	const autoSaveMode = getPreference(LocalStorageKeys.autoSave);
	const [lastSaved, setLastSaved] = useState<string>();
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const initialContentRef = useRef("");
	const [isFirstContentLoad, setIsFirstContentLoad] = useState(true);
	const [editorMounted, setEditorMounted] = useState(false);
	const isRestoringPositionRef = useRef<{ [projectId: string]: boolean }>({});
	const [codeFixData, setCodeFixData] = useState<{
		endLine: number;
		modifiedCode: string;
		originalCode: string;
		startLine: number;
	} | null>(null);
	const [projectLoaded, setProjectLoaded] = useState(false);
	const [contentLoaded, setContentLoaded] = useState(false);

	useEffect(() => {
		if (!content || !isFirstContentLoad) return;

		initialContentRef.current = content;
		setIsFirstContentLoad(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content]);

	useEffect(() => {
		if (projectLoaded && contentLoaded && editorRef.current && content && content.trim() !== "") {
			restoreCursorPosition(editorRef.current);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectLoaded, contentLoaded, content]);

	const updateContentFromResource = (resource?: Uint8Array) => {
		if (!resource) {
			setContent("");
			setContentLoaded(false);
			return;
		}
		const decodedContent = new TextDecoder().decode(resource);
		setContent(decodedContent);
		initialContentRef.current = decodedContent;
		setContentLoaded(true);
	};

	const [hasOpenFiles, setHasOpenFiles] = useState(false);

	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (location.state?.revealStatusSidebar) {
			setTimeout(() => {
				triggerEvent(EventListenerName.displayProjectStatusSidebar);
			}, 100);

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { revealStatusSidebar: dontIncludeRevealSidebarInNewState, ...newState } = location.state || {};
			navigate(location.pathname, { state: newState });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.state]);

	useEffect(() => {
		const fileToOpen = location.state?.fileToOpen;
		const fileToOpenIsOpened =
			openFiles[projectId!] && openFiles[projectId!].find((openFile) => openFile.name === fileToOpen);

		if (openFiles[projectId!]?.length > 0 && !hasOpenFiles) setHasOpenFiles(true);

		if (resources && Object.values(resources || {}).length && !isLoadingCode && fileToOpen && !fileToOpenIsOpened) {
			openFileAsActive(fileToOpen);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.state, isLoadingCode, resources]);

	const loadFileResource = async () => {
		const fetchedResources = await fetchResources(projectId, true);
		if (!fetchedResources || !fetchedResources[activeEditorFileName]) {
			if (activeEditorFileName) {
				const projectName = currentProject?.name || tErrors("unknownProject");
				const errorMessage = tErrors("fileNotFoundInFetchedResources", {
					fileName: activeEditorFileName,
					projectName,
				});

				addToast({
					message: errorMessage,
					type: "error",
				});

				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					tErrors("fileNotFoundInFetchedResourcesDetailed", {
						fileName: activeEditorFileName,
						projectId,
						projectName,
					})
				);
			}
			setContent("");
			return;
		}

		try {
			const resource = fetchedResources[activeEditorFileName];
			updateContentFromResource(resource);
		} catch (error) {
			LoggerService.warn(
				namespaces.ui.projectCodeEditor,
				`Error loading file "${activeEditorFileName}": ${error.message}`
			);
		}
	};

	const getLineCode = (currentPosition: { startLine: number }) => {
		if (!editorRef.current) return "";
		const model = editorRef.current.getModel();
		if (!model) return "";

		const lineNumber = currentPosition?.startLine || 1;
		if (lineNumber < 1 || lineNumber > model.getLineCount()) {
			return "";
		}
		return model.getLineContent(lineNumber);
	};

	useEffect(() => {
		loadFileResource();

		if (currentProjectId !== projectId) {
			setLastSaved(undefined);
			hasOpenedFile.current = false;
		}
		if (!projectId || !currentProject) return;

		const currentPosition = cursorPositionPerProject[projectId]?.[activeEditorFileName];
		if (!currentPosition) return;

		iframeCommService.safeSendEvent(MessageTypes.SET_EDITOR_CODE_SELECTION, {
			filename: activeEditorFileName,
			startLine: currentPosition?.startLine || 1,
			endLine: currentPosition?.startLine || 1,
			code: getLineCode(currentPosition),
		});

		const currentSelection = selectionPerProject[projectId];

		if (!currentSelection) return;

		iframeCommService.safeSendEvent(MessageTypes.SET_EDITOR_CODE_SELECTION, currentSelection);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeEditorFileName, projectId, currentProjectId, currentProject]);

	useEventListener(EventListenerName.codeFixSuggestion, (event) => {
		const { startLine, endLine, newCode } = event.detail;

		if (!editorRef.current || !activeEditorFileName) {
			LoggerService.warn(
				namespaces.ui.projectCodeEditor,
				"Cannot apply code fix suggestion: No active editor or file"
			);
			return;
		}

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
		openModal(ModalName.codeFixDiffEditor);
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

	const restoreCursorPosition = (_editor: monaco.editor.IStandaloneCodeEditor) => {
		const projectCursorPosition = cursorPositionPerProject[projectId!]?.[activeEditorFileName];

		if (projectCursorPosition) {
			isRestoringPositionRef.current[projectId!] = true;
			_editor.revealLineInCenter(projectCursorPosition.startLine);
			_editor.focus();
			_editor.setPosition({
				lineNumber: projectCursorPosition.startLine,
				column: projectCursorPosition.startColumn,
			});

			if (isRestoringPositionRef.current) {
				isRestoringPositionRef.current[projectId!] = false;
			}
		}
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

	const handleEditorFocus = (event: monaco.editor.ICursorPositionChangedEvent) => {
		if (!projectId || !activeEditorFileName) return;

		if (isRestoringPositionRef.current[projectId]) {
			return;
		}

		if (!projectLoaded || !contentLoaded || !content || content.trim() === "") {
			return;
		}

		const position = event.position;
		if (!position) return;

		setCursorPosition(projectId, activeEditorFileName, {
			filename: activeEditorFileName,
			startLine: position.lineNumber,
			startColumn: position.column,
			code: "",
		});

		iframeCommService.safeSendEvent(MessageTypes.SET_EDITOR_CODE_SELECTION, {
			filename: activeEditorFileName,
			startLine: position.lineNumber,
			endLine: position.lineNumber,
			code: getLineCode({ startLine: position.lineNumber }),
		});
	};

	useEffect(() => {
		if (isRestoringPositionRef.current && projectId) {
			isRestoringPositionRef.current[projectId] = false;
		}
	}, [projectId]);

	useEffect(() => {
		if (!editorMounted || !projectId || !activeEditorFileName) return;
		const codeEditor = editorRef.current;
		if (!codeEditor) return;

		if (!projectLoaded || !contentLoaded || !content || content.trim() === "") {
			return;
		}

		const cursorPositionChangeListener = codeEditor.onDidChangeCursorPosition(handleEditorFocus);

		return () => {
			cursorPositionChangeListener.dispose();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editorMounted, projectId, activeEditorFileName, projectLoaded, contentLoaded, content]);

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

			const cacheStore = useCacheStore.getState();
			const currentResources = cacheStore.resources;
			const updatedResources = {
				...currentResources,
				[activeEditorFileName]: new TextEncoder().encode(newContent),
			};
			useCacheStore.setState((state) => ({
				...state,
				resources: updatedResources,
			}));

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

		if (name === activeEditorFileName) {
			debouncedAutosave.cancel();
		}

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

	const handleEditorChange = (newContent?: string) => {
		if (!newContent) return;
		setContent(newContent);
		// changeCursorPosition();
		if (autoSaveMode && activeEditorFileName) {
			debouncedAutosave(newContent);
		}
	};

	const handleCloseCodeFixModal = () => {
		setCodeFixData(null);
		closeModal(ModalName.codeFixDiffEditor);
	};

	const handleApproveCodeFix = () => {
		if (!codeFixData || !editorRef.current) return;

		const model = editorRef.current.getModel();
		if (!model) return;

		const { startLine, endLine, modifiedCode } = codeFixData;

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

		setContent(model.getValue());

		if (autoSaveMode && activeEditorFileName) {
			debouncedAutosave(model.getValue());
		}

		addToast({
			message: `Successfully applied code fix to lines ${startLine}-${endLine}`,
			type: "success",
		});
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
								key={projectId}
								language={languageEditor}
								loading={<Loader data-testid="monaco-loader" size="lg" />}
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
					modifiedCode={codeFixData.modifiedCode}
					name={ModalName.codeFixDiffEditor}
					onApprove={handleApproveCodeFix}
					onReject={handleCloseCodeFixModal}
					originalCode={codeFixData.originalCode}
					startLine={codeFixData.startLine}
				/>
			) : null}
		</div>
	);
};
