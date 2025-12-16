import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import dayjs from "dayjs";
import { debounce } from "lodash";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";

import { dateTimeFormat, namespaces } from "@constants";
import { UseFileEditorManagerOptions, UseFileEditorManagerReturn } from "@interfaces/hooks";
import { LoggerService, iframeCommService } from "@services";
import { fileOperations } from "@src/factories";
import { useCacheStore, useProjectStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { MessageTypes } from "@src/types";
import { Project } from "@src/types/models";

export const useFileEditorManager = ({
	projectId,
	activeEditorFileName,
	autoSaveMode,
}: UseFileEditorManagerOptions): UseFileEditorManagerReturn => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });

	const [syncError, setSyncError] = useState<boolean>(false);
	const [currentProject, setCurrentProject] = useState<Project>();
	const [content, setContent] = useState("");
	const [lastSaved, setLastSaved] = useState<string>();
	const [isFirstContentLoad, setIsFirstContentLoad] = useState(true);
	const [grammarLoaded, setGrammarLoaded] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);

	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const initialContentRef = useRef<string | Blob>("");
	const isInitialLoadRef = useRef(true);
	const prevFileNameRef = useRef<string>("");

	const { getProject } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const { currentProjectId, fetchResources, setLoading } = useCacheStore();
	const { cursorPositionPerProject, setCursorPosition, selectionPerProject } = useSharedBetweenProjectsStore();

	const { saveFile } = fileOperations(projectId);

	const isImageFile = useMemo(() => {
		const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".ico"];
		return imageExtensions.some((ext) => activeEditorFileName.toLowerCase().endsWith(ext));
	}, [activeEditorFileName]);

	const isPdfFile = useMemo(() => activeEditorFileName.toLowerCase().endsWith(".pdf"), [activeEditorFileName]);

	useEffect(() => {
		isInitialLoadRef.current = false;
	}, []);

	const loadProject = useCallback(async () => {
		if (!projectId) return;
		try {
			const { data: project } = await getProject(projectId);
			setCurrentProject(project);
		} catch (error) {
			LoggerService.error(
				namespaces.ui.projectCodeEditor,
				tErrors("errorLoadingProject", { projectId, error: (error as Error).message })
			);
		}
	}, [projectId, getProject, tErrors]);

	useEffect(() => {
		if (!projectId) return;
		loadProject();
	}, [projectId, loadProject]);

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

	const getLineCode = useCallback((currentPosition: { startLine: number }) => {
		const model = editorRef.current?.getModel();
		if (!model) return "";

		const lineNumber = currentPosition?.startLine || 1;
		if (lineNumber < 1 || lineNumber > model.getLineCount()) {
			return "";
		}
		return model.getLineContent(lineNumber);
	}, []);

	const loadFileResource = useCallback(async () => {
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
		if (content && isFirstContentLoad) {
			initialContentRef.current = content;
			setIsFirstContentLoad(false);
		}

		const isFileSwitching = prevFileNameRef.current !== activeEditorFileName;
		if (isFileSwitching && currentProject && editorRef.current && content && content.trim() !== "") {
			restoreCursorPosition(editorRef.current);
			prevFileNameRef.current = activeEditorFileName;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content, currentProject, activeEditorFileName]);

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

	const restoreCursorPosition = useCallback(
		(_editor: monaco.editor.IStandaloneCodeEditor) => {
			const projectCursorPosition = cursorPositionPerProject[projectId]?.[activeEditorFileName];
			if (!projectCursorPosition) return;

			_editor.revealLineInCenter(projectCursorPosition.startLine);
			_editor.focus();
			_editor.setPosition({
				lineNumber: projectCursorPosition.startLine,
				column: projectCursorPosition.startColumn,
			});
		},
		[projectId, activeEditorFileName, cursorPositionPerProject]
	);

	useEffect(() => {
		if (!editorRef.current || !projectId || !activeEditorFileName) return;
		if (!currentProject || !content || content.trim() === "") return;

		const cursorPositionChangeListener = editorRef.current.onDidChangeCursorPosition((event) => {
			const position = event.position;
			if (!position) return;

			setCursorPosition(projectId, activeEditorFileName, {
				filename: activeEditorFileName,
				startLine: position.lineNumber,
				startColumn: position.column,
				code: "",
			});
		});

		return () => {
			cursorPositionChangeListener.dispose();
		};
	}, [projectId, activeEditorFileName, currentProject, content, setCursorPosition, getLineCode]);

	const saveFileWithContent = useCallback(
		async (fileName: string, contentToSave: string): Promise<boolean> => {
			if (!projectId) {
				setSyncError(true);
				addToast({ message: tErrors("codeSaveFailed"), type: "error" });
				LoggerService.error(namespaces.projectUICode, tErrors("codeSaveFailedMissingProjectId"));
				return false;
			}

			if (contentToSave === null || contentToSave === undefined) {
				setSyncError(true);
				LoggerService.error(
					namespaces.ui.projectCodeEditor,
					`Invalid content provided for file ${fileName}: content is null or undefined`
				);
				return false;
			}

			let validatedContent: string;
			try {
				validatedContent = typeof contentToSave === "string" ? contentToSave : String(contentToSave);
				new TextEncoder().encode(validatedContent);
			} catch (error) {
				setSyncError(true);
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

					setSyncError(true);
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

				setSyncError(true);
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
		[projectId, activeEditorFileName, saveFile, setLoading, addToast, tErrors, t]
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

			await saveFileWithContent(activeEditorFileName, newContent || "");
		},
		[activeEditorFileName, projectId, saveFileWithContent, addToast, tErrors]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedManualSave = useCallback(
		debounce(
			() => {
				setSyncError(false);
				const currentContent = editorRef.current?.getValue();
				if (currentContent !== undefined) {
					updateContent(currentContent);
				}
			},
			1500,
			{ leading: true, trailing: false }
		),
		[projectId, activeEditorFileName, updateContent]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedAutosave = useCallback(debounce(updateContent, 1500), [
		projectId,
		activeEditorFileName,
		updateContent,
	]);

	const handleEditorMount = useCallback((_editor: monaco.editor.IStandaloneCodeEditor) => {
		editorRef.current = _editor;
	}, []);

	const handleContentChange = useCallback(
		(newContent: string) => {
			setContent(newContent);
			if (autoSaveMode && activeEditorFileName) {
				debouncedAutosave(newContent);
			}
		},
		[autoSaveMode, activeEditorFileName, debouncedAutosave]
	);

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

	return {
		content,
		imageUrl,
		pdfUrl,
		lastSaved,
		syncError,
		grammarLoaded,
		currentProject,
		isImageFile,
		isPdfFile,
		editorRef,
		initialContentRef,
		handleEditorMount,
		handleContentChange,
		debouncedManualSave,
		debouncedAutosave,
		saveFileWithContent,
		setGrammarLoaded,
		setContent,
	};
};
