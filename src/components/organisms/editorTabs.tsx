import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import dayjs from "dayjs";
import { debounce, last } from "lodash";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import { Document, Page, pdfjs } from "react-pdf";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";

import {
	dateTimeFormat,
	defaultMonacoEditorLanguage,
	monacoLanguages,
	namespaces,
	defaultCodeFixSuggestion,
} from "@constants";
import { LoggerService, iframeCommService } from "@services";
import { EventListenerName, LocalStorageKeys, ModalName } from "@src/enums";
import { fileOperations } from "@src/factories";
import { useCodeFixSuggestions, useEventListener } from "@src/hooks";
import { initPythonTextmate } from "@src/lib/monaco/initPythonTextmate";
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
import { navigateToProject } from "@src/utilities/navigation";
import { getPreference, processBulkCodeFixSuggestions, generateBulkCodeFixSummary } from "@utilities";

import { Button, IconSvg, Loader, MermaidDiagram, Spinner, Typography } from "@components/atoms";
import { CodeFixDiffEditorModal, FileTabMenu, RenameFileModal, ScrollableTabs } from "@components/organisms";

import { AKRoundLogo } from "@assets/image";
import { SaveIcon } from "@assets/image/icons";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const EditorTabs = () => {
	const { projectId } = useParams() as { projectId: string };
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const {
		currentProjectId,
		fetchResources,
		setLoading,
		loading: { resources: isLoadingCode },
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
	const { openFiles, openFileAsActive } = useFileStore();
	const { closeModal } = useModalStore();
	const { cursorPositionPerProject, setCursorPosition, selectionPerProject } = useSharedBetweenProjectsStore();

	const activeFile = openFiles[projectId]?.find((f: { isActive: boolean }) => f.isActive);
	const activeEditorFileName = activeFile?.name || "";

	const fileExtension = "." + last(activeEditorFileName.split("."));
	const languageEditor =
		monacoLanguages[fileExtension as keyof typeof monacoLanguages] || defaultMonacoEditorLanguage;
	const { saveFile } = fileOperations(projectId!);

	const isImageFile = useMemo(() => {
		const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".ico"];
		return imageExtensions.some((ext) => activeEditorFileName.toLowerCase().endsWith(ext));
	}, [activeEditorFileName]);

	const isPdfFile = useMemo(() => activeEditorFileName.toLowerCase().endsWith(".pdf"), [activeEditorFileName]);

	const location = useLocation();
	const navigate = useNavigate();

	const [content, setContent] = useState("");
	const autoSaveMode = getPreference(LocalStorageKeys.autoSave);
	const [lastSaved, setLastSaved] = useState<string>();
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const initialContentRef = useRef<string | Blob>("");
	const [isFirstContentLoad, setIsFirstContentLoad] = useState(true);
	const [editorMounted, setEditorMounted] = useState(false);
	const [grammarLoaded, setGrammarLoaded] = useState(false);
	const isInitialLoadRef = useRef(true);
	const prevFileNameRef = useRef<string>("");
	const prevProjectIdRef = useRef<string>("");

	useEffect(() => {
		isInitialLoadRef.current = false;
	}, []);

	const { codeFixData, setCodeFixData, handleCodeFixEvent } = useCodeFixSuggestions({
		activeEditorFileName,
	});
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [numPages, setNumPages] = useState<number | null>(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [contextMenu, setContextMenu] = useState<{
		fileName: string;
		position: { x: number; y: number };
	} | null>(null);

	useEffect(() => {
		if (content && isFirstContentLoad) {
			initialContentRef.current = content;
			setIsFirstContentLoad(false);
		}

		const isFileSwitching = prevFileNameRef.current !== activeEditorFileName;
		const isProjectSwitching = prevProjectIdRef.current !== "" && prevProjectIdRef.current !== projectId;

		const currentResource = resources?.[activeEditorFileName];
		const expectedContent = currentResource ? new TextDecoder().decode(currentResource) : null;
		const isContentFresh = expectedContent !== null && content === expectedContent;

		if (
			(isFileSwitching || isProjectSwitching) &&
			currentProject &&
			editorRef.current &&
			content &&
			content.trim() !== "" &&
			isContentFresh
		) {
			restoreCursorPosition(editorRef.current, projectId, activeEditorFileName);
			prevFileNameRef.current = activeEditorFileName;
			prevProjectIdRef.current = projectId;
		} else if (prevProjectIdRef.current === "") {
			prevProjectIdRef.current = projectId;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content, currentProject, activeEditorFileName, projectId, resources]);

	const updateContentFromResource = useCallback(
		(resource?: Uint8Array) => {
			if (!resource) {
				setContent("");
				setImageUrl(null);
				setPdfUrl(null);
				return;
			}

			if (isImageFile) {
				const arrayBuffer = new ArrayBuffer(resource.length);
				const view = new Uint8Array(arrayBuffer);
				view.set(resource);
				const blob = new Blob([view]);
				const url = URL.createObjectURL(blob);
				setImageUrl(url);
				setContent("");
				setPdfUrl(null);
				initialContentRef.current = blob;
			} else if (isPdfFile) {
				const arrayBuffer = new ArrayBuffer(resource.length);
				const view = new Uint8Array(arrayBuffer);
				view.set(resource);
				const blob = new Blob([view], { type: "application/pdf" });
				const url = URL.createObjectURL(blob);
				setPdfUrl(url);
				setContent("");
				setImageUrl(null);
				setPageNumber(1);
				initialContentRef.current = blob;
			} else {
				const decodedContent = new TextDecoder().decode(resource);
				setContent(decodedContent);
				initialContentRef.current = decodedContent;
				setImageUrl(null);
				setPdfUrl(null);
			}
		},
		[isImageFile, isPdfFile]
	);

	useEffect(() => {
		const fileToOpen = location.state?.fileToOpen;
		const fileToOpenIsOpened =
			openFiles[projectId!] && openFiles[projectId!].find((openFile) => openFile.name === fileToOpen);

		if (
			resources &&
			Object.values(resources || {}).length &&
			!isLoadingCode &&
			fileToOpen &&
			!fileToOpenIsOpened &&
			(!openFiles[projectId] || openFiles[projectId].length === 0)
		) {
			openFileAsActive(fileToOpen);

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { fileToOpen: _, ...newState } = location.state || {};
			const pathSuffix = location.pathname.includes("/settings") ? "/explorer/settings" : "/explorer";
			navigateToProject(navigate, projectId, pathSuffix, newState);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.state, isLoadingCode, resources]);

	const loadFileResource = useCallback(async () => {
		if (!activeEditorFileName) {
			setContent("");
			return;
		}

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
				tErrors("errorLoadingFile", { fileName: activeEditorFileName, error: (error as Error).message })
			);
		}
	}, [projectId, activeEditorFileName, currentProject, fetchResources, updateContentFromResource, addToast, tErrors]);

	const getLineCode = useCallback((currentPosition: { startLine: number }) => {
		const model = editorRef.current?.getModel();
		if (!model) return "";

		const lineNumber = currentPosition?.startLine || 1;
		if (lineNumber < 1 || lineNumber > model.getLineCount()) {
			return "";
		}
		return model.getLineContent(lineNumber);
	}, []);

	useEffect(() => {
		return () => {
			if (imageUrl) {
				URL.revokeObjectURL(imageUrl);
			}
			if (pdfUrl) {
				URL.revokeObjectURL(pdfUrl);
			}
		};
	}, [imageUrl, pdfUrl]);

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

	useEventListener(EventListenerName.codeFixSuggestion, (event: CustomEvent) => {
		handleCodeFixEvent(event.detail);
	});

	useEventListener(EventListenerName.codeFixSuggestionAdd, (event: CustomEvent) => {
		handleCodeFixEvent(event.detail);
	});

	useEventListener(EventListenerName.codeFixSuggestionRemove, (event: CustomEvent) => {
		handleCodeFixEvent(event.detail);
	});

	useEventListener(EventListenerName.codeFixSuggestionAll, async (event: CustomEvent) => {
		const { suggestions } = event.detail as { suggestions: Array<{ fileName: string; newCode: string }> };

		const result = await processBulkCodeFixSuggestions(suggestions, {
			tErrors,
			onProcessFile: saveFileWithContent,
			onActiveFileUpdate: (fileName: string, newCode: string) => {
				if (fileName === activeEditorFileName && editorRef.current) {
					const model = editorRef.current.getModel();
					if (model) {
						setContent(newCode);
						model.setValue(newCode);
					}
				}
			},
		});

		const summary = generateBulkCodeFixSummary(result, tErrors);
		if (summary.message) {
			addToast({
				message: summary.message,
				type: summary.success ? "success" : "warning",
			});
		}
	});

	const handleEditorWillMount = (monaco: Monaco) => {
		monaco.editor.defineTheme("myCustomTheme", {
			base: "vs-dark",
			colors: {
				"editor.background": "#000000",
			},
			inherit: true,
			rules: [{ token: "storage.type.function.python", foreground: "#569cd6" }],
		});

		monaco.editor.defineTheme("transparent-dark", {
			base: "vs-dark",
			colors: {
				"editor.background": "#00000000", // transparent
			},
			inherit: true,
			rules: [{ token: "storage.type.function.python", foreground: "#569cd6" }],
		});
	};

	const restoreCursorPosition = useCallback(
		(_editor: monaco.editor.IStandaloneCodeEditor, targetProjectId: string, targetFileName: string) => {
			const latestCursorPositions = useSharedBetweenProjectsStore.getState().cursorPositionPerProject;
			const projectCursorPosition = latestCursorPositions[targetProjectId]?.[targetFileName];

			if (!projectCursorPosition) {
				return;
			}

			requestAnimationFrame(() => {
				_editor.revealLineInCenter(projectCursorPosition.startLine);
				_editor.setPosition({
					lineNumber: projectCursorPosition.startLine,
					column: projectCursorPosition.startColumn,
				});
				_editor.focus();
			});
		},
		[]
	);

	const handleEditorDidMount = async (_editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: Monaco) => {
		monacoInstance.editor.setTheme("myCustomTheme");
		editorRef.current = _editor;
		const model = _editor.getModel();
		if (!model) return;
		model.pushEditOperations([], [], () => null);

		_editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyZ, () => {
			const currentContent = model.getValue();

			if (currentContent === initialContentRef.current) {
				return;
			}
			_editor.trigger("keyboard", "undo", null);
		});

		if (languageEditor === "python") {
			try {
				await initPythonTextmate(monacoInstance, _editor);
				setGrammarLoaded(true);
			} catch (error) {
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					tErrors("failedInitializePythonGrammar", { error: (error as Error).message })
				);
				setGrammarLoaded(true);
			}
		} else {
			setGrammarLoaded(true);
		}

		setEditorMounted(true);
	};

	const handleEditorFocus = useCallback(
		(event: monaco.editor.ICursorPositionChangedEvent) => {
			if (!projectId || !activeEditorFileName) return;

			if (!currentProject || !content || content.trim() === "") {
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
		},
		[projectId, activeEditorFileName, currentProject, content, setCursorPosition, getLineCode]
	);

	useEffect(() => {
		if (!editorMounted || !projectId || !activeEditorFileName) return;
		const codeEditor = editorRef.current;
		if (!codeEditor) return;

		if (!currentProject || !content || content.trim() === "") {
			return;
		}

		const cursorPositionChangeListener = codeEditor.onDidChangeCursorPosition(handleEditorFocus);

		return () => {
			cursorPositionChangeListener.dispose();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editorMounted, projectId, activeEditorFileName, currentProject, content]);

	const saveFileWithContent = useCallback(
		async (fileName: string, fileContent: string): Promise<boolean> => {
			if (!projectId) {
				addToast({ message: tErrors("codeSaveFailed"), type: "error" });
				LoggerService.error(namespaces.projectUICode, tErrors("codeSaveFailedMissingProjectId"));
				return false;
			}

			const currentResources = useCacheStore.getState().resources;
			if (!currentResources || !(fileName in currentResources)) {
				LoggerService.warn(namespaces.projectUICode, tErrors("fileNoLongerExists", { fileName, projectId }));
				return false;
			}

			if (fileContent === null || fileContent === undefined) {
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					`Invalid content provided for file ${fileName}: content is null or undefined`
				);
				return false;
			}

			let validatedContent: string;
			try {
				validatedContent = typeof fileContent === "string" ? fileContent : String(fileContent);
				new TextEncoder().encode(validatedContent);
			} catch (error) {
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					tErrors("contentValidationFailed", { fileName, error: (error as Error).message })
				);
				addToast({ message: t("contentValidationFailed", { fileName }), type: "error" });
				return false;
			}

			setLoading("resources", true);
			try {
				const fileSaved = await saveFile(fileName, validatedContent);
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
						[fileName]: new TextEncoder().encode(validatedContent),
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
					setLoading("resources", false);
				}, 1000);
			}
		},
		[projectId, activeEditorFileName, addToast, tErrors, t, setLoading, saveFile]
	);

	const updateContent = useCallback(
		async (newContent?: string) => {
			if (!activeEditorFileName) {
				addToast({
					message: tErrors("noFileOpenForEditing", { projectId }),
					type: "error",
				});
				LoggerService.warn(namespaces.projectUICode, tErrors("saveAttemptedNoActiveFile", { projectId }));
				return;
			}

			if (!resources || !(activeEditorFileName in resources)) {
				LoggerService.warn(
					namespaces.projectUICode,
					tErrors("fileNoLongerExists", { fileName: activeEditorFileName, projectId })
				);
				return;
			}

			await saveFileWithContent(activeEditorFileName, newContent || "");
		},
		[activeEditorFileName, projectId, resources, addToast, tErrors, saveFileWithContent]
	);

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

	const isMarkdownFile = useMemo(() => activeEditorFileName.endsWith(".md"), [activeEditorFileName]);
	const readmeContent = useMemo(() => content.replace(/---[\s\S]*?---\n/, ""), [content]);

	const onDocumentLoadSuccess = ({ numPages: pages }: { numPages: number }) => {
		setNumPages(pages);
		setPageNumber(1);
	};

	const changePage = (offset: number) => {
		setPageNumber((prevPageNumber) => prevPageNumber + offset);
	};

	const previousPage = () => {
		changePage(-1);
	};

	const nextPage = () => {
		changePage(1);
	};

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
		if (isInitialLoadRef.current) {
			isInitialLoadRef.current = false;
			return;
		}
		if (autoSaveMode && activeEditorFileName) {
			debouncedAutosave(newContent);
		}
	};

	const handleCloseCodeFixModal = useCallback(
		(sendRejection = true) => {
			if (codeFixData && sendRejection) {
				try {
					if (codeFixData.changeType === "add") {
						iframeCommService.safeSendEvent("CODE_ADD_REJECTED", { fileName: codeFixData.fileName });
					} else if (codeFixData.changeType === "remove") {
						iframeCommService.safeSendEvent("CODE_DELETE_REJECTED", { fileName: codeFixData.fileName });
					} else if (codeFixData.changeType === "modify") {
						iframeCommService.safeSendEvent("CODE_SUGGESTION_REJECTED", { fileName: codeFixData.fileName });
					}

					iframeCommService.sendCodeSuggestionRejected(
						codeFixData.fileName,
						codeFixData.changeType,
						undefined, // suggestionId
						"User rejected the suggestion"
					);
				} catch (error) {
					LoggerService.error(
						namespaces.ui.projectCodeEditor,
						tErrors("rejectionMessageFailed", { error: (error as Error).message })
					);
				}
			}

			setCodeFixData(defaultCodeFixSuggestion);
			closeModal(ModalName.codeFixDiffEditor);
		},
		[codeFixData, setCodeFixData, closeModal, tErrors]
	);

	const handleApproveCodeFix = useCallback(async () => {
		if (!codeFixData) return;

		const { modifiedCode, fileName, changeType } = codeFixData;
		const { saveFile: saveFileFn, deleteFile: deleteFileFn } = fileOperations(projectId!);

		try {
			switch (changeType) {
				case "modify": {
					const fileSaved = await saveFileFn(fileName, modifiedCode);
					if (!fileSaved) {
						addToast({
							message: t("fileSaveFailedModified", { fileName }),
							type: "error",
						});
						return;
					}

					if (fileName === activeEditorFileName && editorRef.current) {
						const model = editorRef.current.getModel();
						if (model) {
							setContent(modifiedCode);
							model.setValue(modifiedCode);
						}
					}

					if (autoSaveMode && activeEditorFileName === fileName) {
						debouncedAutosave(modifiedCode);
					}
					break;
				}
				case "add": {
					const fileSaved = await saveFileFn(fileName, modifiedCode);
					if (fileSaved) {
						addToast({
							message: t("fileCreatedSuccess", { fileName }),
							type: "success",
						});
						openFileAsActive(fileName);
					} else {
						addToast({
							message: t("fileCreateFailed", { fileName }),
							type: "error",
						});
						return;
					}
					break;
				}
				case "remove": {
					await deleteFileFn(fileName);
					addToast({
						message: t("fileDeletedSuccess", { fileName }),
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
				message: t("operationFailed", { changeType, error: (error as Error).message }),
				type: "error",
			});
			LoggerService.error(
				namespaces.ui.projectCodeEditor,
				t("operationFailed", { changeType, error: (error as Error).message })
			);
			return;
		}

		try {
			iframeCommService.sendCodeSuggestionAccepted(
				fileName,
				changeType,
				undefined // suggestionId
			);
		} catch (error) {
			LoggerService.error(
				namespaces.ui.projectCodeEditor,
				tErrors("acceptanceMessageFailed", { error: (error as Error).message })
			);
		}

		handleCloseCodeFixModal(false);

		addToast({
			message: t("codeFixAppliedSuccess"),
			type: "success",
		});
	}, [
		codeFixData,
		projectId,
		activeEditorFileName,
		autoSaveMode,
		addToast,
		t,
		tErrors,
		openFileAsActive,
		debouncedAutosave,
		handleCloseCodeFixModal,
	]);

	const handleTabContextMenu = (event: React.MouseEvent<HTMLDivElement>, fileName: string) => {
		event.preventDefault();
		event.stopPropagation();

		setContextMenu({
			fileName,
			position: { x: event.clientX, y: event.clientY },
		});
	};

	return (
		<div className="relative ml-8 flex h-full flex-col pt-11">
			{projectId ? (
				<>
					<div className="absolute left-0 top-0 flex w-full justify-between" id="editor-tabs">
						<ScrollableTabs onTabContextMenu={handleTabContextMenu} />

						{openFiles[projectId]?.length ? (
							<div
								className="relative -top-2 right-1 z-10 flex items-center gap-1 whitespace-nowrap"
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
						isImageFile ? (
							<div className="scrollbar flex size-full items-center justify-center overflow-auto bg-transparent p-4">
								{imageUrl ? (
									<img
										alt={activeEditorFileName}
										className="max-h-full max-w-full object-contain"
										src={imageUrl}
									/>
								) : (
									<div className="flex flex-col items-center gap-2 text-white">
										<Loader size="lg" />
										<div className="text-sm">Loading image...</div>
									</div>
								)}
							</div>
						) : isPdfFile ? (
							<div className="scrollbar flex size-full flex-col items-center overflow-auto bg-transparent p-4">
								{pdfUrl ? (
									<>
										<Document
											file={pdfUrl}
											loading={
												<div className="flex flex-col items-center gap-2 text-white">
													<Loader size="lg" />
													<div className="text-sm">Loading PDF...</div>
												</div>
											}
											onLoadSuccess={onDocumentLoadSuccess}
										>
											<Page
												className="border border-gray-800"
												pageNumber={pageNumber}
												renderAnnotationLayer={true}
												renderTextLayer={true}
											/>
										</Document>
										{numPages && numPages > 1 ? (
											<div className="mt-4 flex items-center gap-4 text-white">
												<Button
													disabled={pageNumber <= 1}
													onClick={previousPage}
													variant="filledGray"
												>
													Previous
												</Button>
												<Typography className="text-sm">
													Page {pageNumber} of {numPages}
												</Typography>
												<Button
													disabled={pageNumber >= numPages}
													onClick={nextPage}
													variant="filledGray"
												>
													Next
												</Button>
											</div>
										) : null}
									</>
								) : (
									<div className="flex flex-col items-center gap-2 text-white">
										<Loader size="lg" />
										<div className="text-sm">Loading PDF...</div>
									</div>
								)}
							</div>
						) : isMarkdownFile ? (
							<div className="scrollbar markdown-dark markdown-body overflow-hidden overflow-y-auto bg-transparent text-white">
								<Markdown components={markdownComponents} remarkPlugins={[remarkGfm, remarkAlert]}>
									{readmeContent}
								</Markdown>
							</div>
						) : (
							<>
								{!grammarLoaded && editorMounted ? (
									<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/75">
										<div className="flex flex-col items-center gap-2 text-white">
											<Loader size="lg" />
											<div className="text-sm">{t("loadingSyntaxHighlighting")}</div>
										</div>
									</div>
								) : null}
								{isInitialLoadRef.current ? (
									<Loader className="absolute left-auto right-[70%]" isCenter size="lg" />
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
											renderLineHighlight: "line",
											scrollBeyondLastLine: false,
											wordWrap: "on",
											readOnly: !grammarLoaded,
										}}
										theme="transparent-dark"
										value={content}
									/>
								)}
							</>
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

			<CodeFixDiffEditorModal
				{...codeFixData}
				onApprove={handleApproveCodeFix}
				onReject={handleCloseCodeFixModal}
			/>

			{contextMenu ? (
				<FileTabMenu
					fileName={contextMenu.fileName}
					isOpen={true}
					onClose={() => setContextMenu(null)}
					position={contextMenu.position}
					projectId={projectId}
				/>
			) : null}

			<RenameFileModal />
		</div>
	);
};
