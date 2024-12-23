import React, { useCallback, useEffect, useRef, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { debounce, last } from "lodash";
import moment from "moment";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";

import { dateTimeFormat, monacoLanguages, namespaces } from "@constants";
import { LoggerService } from "@services";
import { useCacheStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { cn, getAutoSavePreference } from "@utilities";

import { useFileOperations } from "@hooks";

import { Button, IconButton, IconSvg, Loader, Spinner, Tab, Typography } from "@components/atoms";

import { AKRoundLogo } from "@assets/image";
import { Close, CompressIcon, ExpandIcon, SaveIcon } from "@assets/image/icons";

export const EditorTabs = ({ isExpanded, onExpand }: { isExpanded: boolean; onExpand: () => void }) => {
	const { projectId } = useParams();
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { closeOpenedFile, openFileAsActive, openFiles, saveFile } = useFileOperations(projectId!);
	const { currentProjectId, fetchResources } = useCacheStore();
	const addToast = useToastStore((state) => state.addToast);
	const { cursorPositionPerProject, setCursorPosition } = useSharedBetweenProjectsStore();
	const activeEditorFileName =
		(projectId && openFiles[projectId]?.find(({ isActive }: { isActive: boolean }) => isActive)?.name) || "";
	const fileExtension = "." + last(activeEditorFileName.split("."));
	const languageEditor = monacoLanguages[fileExtension as keyof typeof monacoLanguages];

	const [codeLoadedFirstTime, setCodeLoadedFirstTime] = useState(true);
	const [codeLoadedFirstTimeForCursor, setCodeLoadedFirstTimeForCursor] = useState(true);

	const [content, setContent] = useState("");
	const autoSaveMode = getAutoSavePreference();
	const [loadingSave, setLoadingSave] = useState(false);
	const [lastSaved, setLastSaved] = useState<string>();
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const initialContentRef = useRef("");
	const [isFirstContentLoad, setIsFirstContentLoad] = useState(true);

	useEffect(() => {
		if (content && isFirstContentLoad) {
			initialContentRef.current = content;
			setIsFirstContentLoad(false);
		}
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

	const location = useLocation();
	const fileToOpen = location.state?.fileToOpen;

	const openDefaultFile = () => {
		if (fileToOpen) {
			openFileAsActive(fileToOpen);
		}
	};

	const loadContent = async () => {
		if (!projectId) return;

		const resources = await fetchResources(projectId, true);
		const resource = resources?.[activeEditorFileName];
		updateContentFromResource(resource);
		openDefaultFile();
	};

	const loadFileResource = async () => {
		if (!projectId) return;

		const resources = await fetchResources(projectId);
		const resource = resources?.[activeEditorFileName];
		updateContentFromResource(resource);
	};

	useEffect(() => {
		if (!activeEditorFileName) return;
		if (currentProjectId !== projectId) {
			loadContent();

			return;
		}
		loadFileResource();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeEditorFileName, projectId]);

	useEffect(() => {
		setLastSaved(undefined);
	}, [projectId]);

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
		if (model) {
			model.pushEditOperations([], [], () => null);

			_editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
				const currentContent = model.getValue();

				if (currentContent !== initialContentRef.current) {
					_editor.trigger("keyboard", "undo", null);
				}
			});

			_editor.onDidChangeCursorPosition((event: monaco.editor.ICursorPositionChangedEvent) => {
				if (!codeLoadedFirstTimeForCursor) {
					setCursorPosition(projectId!, event.position);
					setCodeLoadedFirstTimeForCursor(false);
				}
			});
		}
	};

	useEffect(() => {
		const cursorPosition = cursorPositionPerProject[projectId!];

		if (content && codeLoadedFirstTime && cursorPosition) {
			const codeEditor = editorRef.current;

			if (codeEditor) {
				codeEditor.setPosition(cursorPosition);
				// codeEditor.revealLineInCenter(cursorPosition.lineNumber);
			}
			setCodeLoadedFirstTime(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content]);

	const updateContent = async (newContent?: string) => {
		if (!newContent) {
			setContent("");

			return;
		}
		setContent(newContent);

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
			handleError("codeSaveFailedMissingFileName", { projectId });

			return;
		}

		setLoadingSave(true);
		try {
			await saveFile(activeEditorFileName, newContent);
			setLastSaved(moment().local().format(dateTimeFormat));
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
				setLoadingSave(false);
			}, 1000);
		}
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedManualSave = useCallback(debounce(updateContent, 1500, { leading: true, trailing: false }), [
		projectId,
		activeEditorFileName,
	]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedAutosave = useCallback(debounce(updateContent, 1500), [projectId, activeEditorFileName]);

	const keydownListenerRef = useRef<((event: KeyboardEvent) => void) | null>(null);

	useEffect(() => {
		if (keydownListenerRef.current) {
			document.removeEventListener("keydown", keydownListenerRef.current);
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "s" && (navigator.userAgent.includes("Mac") ? event.metaKey : event.ctrlKey)) {
				event.preventDefault();
				debouncedManualSave(content);
			}
		};

		keydownListenerRef.current = handleKeyDown;

		document.addEventListener("keydown", handleKeyDown, false);

		return () => {
			if (keydownListenerRef.current) {
				document.removeEventListener("keydown", keydownListenerRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content]);

	const activeCloseIcon = (fileName: string) => {
		const isActiveFile = openFiles[projectId!].find(({ isActive, name }) => name === fileName && isActive);

		return cn("h-4 w-4 p-0.5 opacity-0 hover:bg-gray-1100 group-hover:opacity-100", {
			"opacity-100": isActiveFile,
		});
	};

	const handleCloseButtonClick = (
		event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>,
		name: string
	): void => {
		event.stopPropagation();
		closeOpenedFile(name);
		if (isExpanded && openFiles[projectId!]?.length === 1) {
			onExpand();
		}
	};

	return (
		<div className="relative flex h-full flex-col pt-11">
			{projectId ? (
				<>
					<div className="absolute left-0 top-0 flex w-full justify-between">
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
								title={lastSaved ? `${t("lastSaved")}:${lastSaved}` : ""}
							>
								<div className="inline-flex items-center gap-2 rounded-3xl border border-gray-1000 p-1">
									{autoSaveMode ? (
										<Button
											className="py-1"
											disabled={loadingSave}
											onClick={() => debouncedManualSave(content)}
											variant="flatText"
										>
											{loadingSave ? <Loader className="mr-1" size="sm" /> : null}
											<Typography size="small">{t("autoSave")}</Typography>
										</Button>
									) : (
										<Button
											className="h-6 whitespace-nowrap px-4 py-1"
											disabled={loadingSave}
											onClick={() => debouncedManualSave(content)}
											variant="filledGray"
										>
											<IconSvg className="fill-white" src={loadingSave ? Spinner : SaveIcon} />

											<div className="mt-0.5">{t("buttons.save")}</div>
										</Button>
									)}
								</div>
								<IconButton className="hover:bg-gray-1100" onClick={onExpand}>
									{isExpanded ? (
										<CompressIcon className="size-4 fill-white" />
									) : (
										<ExpandIcon className="size-4 fill-white" />
									)}
								</IconButton>
							</div>
						) : null}
					</div>

					{openFiles[projectId]?.length ? (
						<Editor
							aria-label={activeEditorFileName}
							beforeMount={handleEditorWillMount}
							className="absolute -ml-6 mt-2 h-full pb-5"
							language={languageEditor}
							loading={<Loader size="lg" />}
							onChange={autoSaveMode ? debouncedAutosave : () => {}}
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
		</div>
	);
};
