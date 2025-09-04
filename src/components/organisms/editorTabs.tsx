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
		} catch (error) {
			LoggerService.error(
				namespaces.ui.projectCodeEditor,
				tErrors("errorLoadingProject", { projectId, error: (error as Error).message })
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
	const [codeFixData, setCodeFixData] = useState<{
		changeType: "modify" | "add" | "delete";
		fileName: string;
		modifiedCode: string;
		originalCode: string;
	} | null>(null);
	const [contentLoaded, setContentLoaded] = useState(false);

	// Combined useEffect for content setup and cursor position restoration
	useEffect(() => {
		// Handle initial content setup on first load
		if (content && isFirstContentLoad) {
			initialContentRef.current = content;
			setIsFirstContentLoad(false);
		}

		if (currentProject && contentLoaded && editorRef.current && content && content.trim() !== "") {
			restoreCursorPosition(editorRef.current);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content, currentProject, contentLoaded]);

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

		const fileToOpen = location.state?.fileToOpen;
		const fileToOpenIsOpened =
			openFiles[projectId!] && openFiles[projectId!].find((openFile) => openFile.name === fileToOpen);

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
				tErrors("errorLoadingFile", { fileName: activeEditorFileName, error: error.message })
			);
		}
	};

	const getLineCode = (currentPosition: { startLine: number }) => {
		const model = editorRef.current?.getModel();
		if (!model) return "";

		const lineNumber = currentPosition?.startLine || 1;
		if (lineNumber < 1 || lineNumber > model.getLineCount()) {
			return "";
		}
		return model.getLineContent(lineNumber);
	};

	useEffect(() => {
		if (!projectId || !currentProject) return;

		loadFileResource();

		if (currentProjectId !== projectId) {
			setLastSaved(undefined);
		}

		const currentPosition = cursorPositionPerProject[projectId]?.[activeEditorFileName];
		if (currentPosition) {
			iframeCommService.safeSendEvent(MessageTypes.SET_EDITOR_CODE_SELECTION, {
				filename: activeEditorFileName,
				startLine: currentPosition?.startLine || 1,
				endLine: currentPosition?.startLine || 1,
				code: getLineCode(currentPosition),
			});
		}

		const currentSelection = selectionPerProject[projectId];

		if (!currentSelection) return;

		iframeCommService.safeSendEvent(MessageTypes.SET_EDITOR_CODE_SELECTION, currentSelection);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeEditorFileName, projectId, currentProjectId, currentProject]);

	useEventListener(EventListenerName.codeFixSuggestion, (event) => {
		const { newCode, fileName, changeType } = event.detail;

		const targetFileName = fileName || activeEditorFileName;
		if (!targetFileName) {
			LoggerService.warn(namespaces.ui.projectCodeEditor, "Cannot apply code fix suggestion: No file specified");
			return;
		}

		// Get the current content for this file from resources
		const cacheStore = useCacheStore.getState();
		const resources = cacheStore.resources;
		const fileResource = resources?.[targetFileName];

		if (!fileResource) {
			LoggerService.warn(
				namespaces.ui.projectCodeEditor,
				`Cannot apply code fix for ${targetFileName}: File resource not found`
			);
			return;
		}

		const originalCode = new TextDecoder().decode(fileResource);

		setCodeFixData({
			originalCode,
			modifiedCode: newCode,

			fileName: targetFileName,
			changeType: changeType || "modify",
		});
		openModal(ModalName.codeFixDiffEditor);
	});

	useEventListener(EventListenerName.codeFixSuggestionAll, async (event) => {
		const { suggestions } = event.detail;

		if (!suggestions || suggestions.length === 0) {
			LoggerService.warn(
				namespaces.ui.projectCodeEditor,
				"Cannot apply bulk code fix suggestions: No suggestions provided"
			);
			return;
		}

		// Group suggestions by file name
		const suggestionsByFile = suggestions.reduce(
			(acc, suggestion) => {
				const { fileName } = suggestion;
				if (!acc[fileName]) {
					acc[fileName] = [];
				}
				acc[fileName].push(suggestion);
				return acc;
			},
			{} as Record<string, typeof suggestions>
		);

		const processedFiles = new Set<string>();

		// Process each file's suggestions
		for (const [fileName, fileSuggestions] of Object.entries(suggestionsByFile)) {
			try {
				// Get the current content for this file from resources
				const cacheStore = useCacheStore.getState();
				const resources = cacheStore.resources;
				const fileResource = resources?.[fileName];

				if (!fileResource) {
					LoggerService.warn(
						namespaces.ui.projectCodeEditor,
						`Cannot apply code fixes for ${fileName}: File resource not found`
					);
					continue;
				}

				for (const suggestion of fileSuggestions) {
					const { newCode } = suggestion;

					const saved = await saveFileWithContent(fileName, newCode);
					if (saved) {
						processedFiles.add(fileName);

						// If this is the currently active file, update the editor
						if (fileName === activeEditorFileName && editorRef.current) {
							const model = editorRef.current.getModel();
							if (model) {
								setContent(newCode);
								// Set the model content without triggering onChange
								model.setValue(newCode);
							}
						}

						LoggerService.info(
							namespaces.ui.projectCodeEditor,
							`Successfully saved ${fileSuggestions.length} code fixes for ${fileName}`
						);
					} else {
						LoggerService.error(
							namespaces.ui.projectCodeEditor,
							`Failed to save code fixes for ${fileName}`
						);
					}
				}
			} catch (error) {
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					`Error processing code fixes for ${fileName}: ${(error as Error).message}`
				);
			}
		}

		// Show success message as requested
		if (suggestions.length > 0) {
			addToast({
				message: "Fixes successfully applied on all files",
				type: "success",
			});
		} else {
			addToast({
				message: "No fixes could be found",
				type: "error",
			});
		}
	});

	// Handle file addition suggestions
	useEventListener(EventListenerName.codeFixSuggestionAdd, (event) => {
		const { fileName, newCode, changeType } = event.detail;

		setCodeFixData({
			originalCode: "",
			modifiedCode: newCode,
			fileName,
			changeType,
		});
		openModal(ModalName.codeFixDiffEditor);
	});

	useEventListener(EventListenerName.codeFixSuggestionDelete, (event) => {
		const { fileName, changeType } = event.detail;

		setCodeFixData({
			originalCode: "This file will be deleted",
			modifiedCode: "",
			fileName,
			changeType,
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
		if (!projectCursorPosition) return;

		_editor.revealLineInCenter(projectCursorPosition.startLine);
		_editor.focus();
		_editor.setPosition({
			lineNumber: projectCursorPosition.startLine,
			column: projectCursorPosition.startColumn,
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

	const handleEditorFocus = (event: monaco.editor.ICursorPositionChangedEvent) => {
		if (!projectId || !activeEditorFileName) return;

		if (!currentProject || !contentLoaded || !content || content.trim() === "") {
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
		if (!editorMounted || !projectId || !activeEditorFileName) return;
		const codeEditor = editorRef.current;
		if (!codeEditor) return;

		if (!currentProject || !contentLoaded || !content || content.trim() === "") {
			return;
		}

		const cursorPositionChangeListener = codeEditor.onDidChangeCursorPosition(handleEditorFocus);

		return () => {
			cursorPositionChangeListener.dispose();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editorMounted, projectId, activeEditorFileName, currentProject, contentLoaded, content]);

	const updateContent = async (newContent?: string) => {
		if (!activeEditorFileName) {
			addToast({
				message: tErrors("noFileOpenForEditing", { projectId }),
				type: "error",
			});
			LoggerService.warn(namespaces.projectUICode, tErrors("saveAttemptedNoActiveFile", { projectId }));
			return;
		}

		await saveFileWithContent(activeEditorFileName, newContent || "");
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

	const saveFileWithContent = async (fileName: string, content: string): Promise<boolean> => {
		if (!projectId) {
			addToast({ message: tErrors("codeSaveFailed"), type: "error" });
			LoggerService.error(namespaces.projectUICode, tErrors("codeSaveFailedMissingProjectId"));
			return false;
		}

		setLoading("code", true);
		try {
			const fileSaved = await saveFile(fileName, content || "");
			if (!fileSaved) {
				addToast({
					message: tErrors("codeSaveFailed"),
					type: "error",
				});

				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					tErrors("codeSaveFailedExtended", { error: tErrors("unknownError"), projectId })
				);
				return false;
			} else {
				const cacheStore = useCacheStore.getState();
				const currentResources = cacheStore.resources;
				const updatedResources = {
					...currentResources,
					[fileName]: new TextEncoder().encode(content),
				};
				useCacheStore.setState((state) => ({
					...state,
					resources: updatedResources,
				}));

				if (fileName === activeEditorFileName) {
					setLastSaved(dayjs().format(dateTimeFormat));
				}
				return true;
			}
		} catch (error) {
			addToast({
				message: tErrors("codeSaveFailed"),
				type: "error",
			});

			LoggerService.error(
				namespaces.ui.projectCodeEditor,
				tErrors("codeSaveFailedExtended", { error: (error as Error).message, projectId })
			);
			return false;
		} finally {
			setTimeout(() => {
				setLoading("code", false);
			}, 1000);
		}
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "s" || !(navigator.userAgent.includes("Mac") ? event.metaKey : event.ctrlKey)) return;
			event.preventDefault();
			debouncedManualSave();
		};

		document.addEventListener("keydown", handleKeyDown, false);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [debouncedManualSave]);

	const activeCloseIcon = (fileName: string) => {
		const isActiveFile = openFiles[projectId]?.find(({ isActive, name }) => name === fileName && isActive);

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
		if (autoSaveMode && activeEditorFileName) {
			debouncedAutosave(newContent);
		}
	};

	const handleCloseCodeFixModal = () => {
		setCodeFixData(null);
		closeModal(ModalName.codeFixDiffEditor);
	};

	const handleApproveCodeFix = async () => {
		if (!codeFixData) return;

		const { modifiedCode, fileName, changeType } = codeFixData;
		const { saveFile, deleteFile } = fileOperations(projectId!);

		try {
			switch (changeType) {
				case "modify": {
					// Save the modified file
					const fileSaved = await saveFile(fileName, modifiedCode);
					if (!fileSaved) {
						addToast({
							message: `Failed to save modified file: ${fileName}`,
							type: "error",
						});
						return;
					}

					// If this is the currently active file, update the editor
					if (fileName === activeEditorFileName && editorRef.current) {
						const model = editorRef.current.getModel();
						if (model) {
							setContent(modifiedCode);
							// Set the model content without triggering onChange
							model.setValue(modifiedCode);
						}
					}

					if (autoSaveMode && activeEditorFileName === fileName) {
						debouncedAutosave(modifiedCode);
					}
					break;
				}
				case "add": {
					// Create new file
					const fileSaved = await saveFile(fileName, modifiedCode);
					if (fileSaved) {
						addToast({
							message: `Successfully created file: ${fileName}`,
							type: "success",
						});
						// Open the new file as active
						openFileAsActive(fileName);
					} else {
						addToast({
							message: `Failed to create file: ${fileName}`,
							type: "error",
						});
						return;
					}
					break;
				}
				case "delete": {
					// Delete the file
					await deleteFile(fileName);
					addToast({
						message: `Successfully deleted file: ${fileName}`,
						type: "success",
					});
					break;
				}
				default:
					LoggerService.warn(namespaces.ui.projectCodeEditor, `Unknown change type: ${changeType}`);
					return;
			}
		} catch (error) {
			addToast({
				message: `Failed to apply ${changeType} operation: ${(error as Error).message}`,
				type: "error",
			});
			LoggerService.error(
				namespaces.ui.projectCodeEditor,
				`Failed to apply ${changeType} operation: ${(error as Error).message}`
			);
			return;
		}

		handleCloseCodeFixModal();

		addToast({
			message: `Successfully applied code fix`,
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
					changeType={codeFixData.changeType}
					filename={codeFixData.fileName}
					modifiedCode={codeFixData.modifiedCode}
					name={ModalName.codeFixDiffEditor}
					onApprove={handleApproveCodeFix}
					onReject={handleCloseCodeFixModal}
					originalCode={codeFixData.originalCode}
				/>
			) : null}
		</div>
	);
};
