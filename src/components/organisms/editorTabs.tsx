import React, { useCallback, useEffect, useMemo, useRef } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { last } from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { monacoLanguages, namespaces } from "@constants";
import { LoggerService } from "@services";
import { useToastStore } from "@src/store";
import { cn } from "@utilities";

import { useAutosave, useEditorContent, useFileOperations, useSaveState } from "@hooks";

import { Button, Checkbox, IconButton, IconSvg, Loader, Spinner, Tab } from "@components/atoms";

import { Close, SaveIcon } from "@assets/image/icons";

export const EditorTabs = () => {
	const { projectId } = useParams();
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { closeOpenedFile, openFileAsActive, openFiles, saveFile } = useFileOperations(projectId!);
	const { t: tTabsEditor } = useTranslation("tabs", { keyPrefix: "editor" });
	const addToast = useToastStore((state) => state.addToast);

	const { fetchFiles } = useFileOperations(projectId!);

	const [content, setContent] = useEditorContent();
	const [autosave, toggleAutosave] = useAutosave(true);
	const [loadingSave, lastSaved, updateSaveState] = useSaveState();

	const activeEditorFileName = openFiles?.find(({ isActive }) => isActive)?.name || "";
	const fileExtension = "." + last(activeEditorFileName.split("."));
	const languageEditor = monacoLanguages[fileExtension as keyof typeof monacoLanguages];

	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const noFileText = tTabsEditor("noFileText");

	const loadContent = useCallback(async () => {
		const resources = await fetchFiles();
		const resource = resources[activeEditorFileName];
		if (resource) {
			const byteArray = Array.from(resource);
			setContent(new TextDecoder().decode(new Uint8Array(byteArray)));
		} else {
			setContent(noFileText);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [setContent]);

	useEffect(() => {
		loadContent();
	}, [loadContent, projectId]);

	useEffect(() => {
		updateSaveState(false, undefined);
	}, [projectId, updateSaveState]);

	const handleEditorWillMount = useCallback((monaco: Monaco) => {
		monaco.editor.defineTheme("myCustomTheme", {
			base: "vs-dark",
			colors: {
				"editor.background": "#000000",
			},
			inherit: true,
			rules: [],
		});
	}, []);

	const handleEditorDidMount = useCallback((_editor: unknown, monaco: Monaco) => {
		monaco.editor.setTheme("myCustomTheme");
	}, []);

	const saveContent = useCallback(async (contentToSave: string) => {
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

		if (contentToSave === noFileText || contentToSave === undefined) {
			handleError("codeSaveFailedMissingContent", { projectId });

			return;
		}

		updateSaveState(true);
		try {
			await saveFile(activeEditorFileName, contentToSave);
			updateSaveState(false, moment().utc().format("YYYY-MM-DD HH:mm:ss"));
		} catch (error) {
			addToast({
				message: tErrors("codeSaveFailed"),
				type: "error",
			});
			LoggerService.error(
				namespaces.ui.projectCodeEditor,
				tErrors("codeSaveFailedExtended", { error: (error as Error).message })
			);
		} finally {
			updateSaveState(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const debouncedSaveContent = useCallback(
		(newContent: string) => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
			saveTimeoutRef.current = setTimeout(() => {
				saveContent(newContent);
			}, 1500);
		},
		[saveContent]
	);

	const handleUpdateContent = useCallback(
		(newContent?: string) => {
			if (newContent === undefined) {
				setContent("");

				return;
			}

			setContent(newContent);

			if (autosave && newContent !== noFileText) {
				debouncedSaveContent(newContent);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[autosave]
	);

	const activeCloseIcon = useCallback(
		(fileName: string) =>
			cn("h-4 w-4 p-0.5 opacity-0 hover:bg-gray-1100 group-hover:opacity-100", {
				"opacity-100": openFiles.find(({ isActive, name }) => name === fileName && isActive),
			}),
		[openFiles]
	);

	const handleCloseButtonClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>, name: string): void => {
			event.stopPropagation();
			closeOpenedFile(name);
		},
		[closeOpenedFile]
	);

	const memoizedTabs = useMemo(
		() =>
			openFiles?.map(({ name }) => (
				<Tab
					activeTab={activeEditorFileName}
					className="group flex items-center gap-1"
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
			)),
		[openFiles, activeEditorFileName, t, activeCloseIcon, openFileAsActive, handleCloseButtonClick]
	);

	return (
		<div className="relative flex h-full flex-col pt-11">
			{projectId ? (
				<>
					<div className="absolute left-0 top-0 flex w-full justify-between">
						<div className="scrollbar xl:gap-2 flex h-8 select-none items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap 2xl:gap-4 3xl:gap-5">
							{memoizedTabs}
						</div>

						{openFiles.length ? (
							<div
								className="relative -right-4 -top-2 z-10 flex flex-col items-end whitespace-nowrap"
								title={lastSaved ? `${t("lastSaved")}:${lastSaved}` : ""}
							>
								<div className="inline-flex gap-2 rounded-3xl border border-gray-1000 p-1">
									{!autosave ? (
										<Button
											className="whitespace-nowrap px-4 py-1"
											disabled={loadingSave || autosave}
											onClick={() => saveContent(content)}
											variant="filledGray"
										>
											<IconSvg className="fill-white" src={!loadingSave ? SaveIcon : Spinner} />

											<div className="mt-0.5">{t("buttons.save")}</div>
										</Button>
									) : null}

									<Checkbox checked={autosave} label={t("autoSave")} onChange={toggleAutosave} />
								</div>
							</div>
						) : null}
					</div>

					<Editor
						aria-label={activeEditorFileName}
						beforeMount={handleEditorWillMount}
						className="absolute -ml-6 mt-2 h-full"
						language={languageEditor}
						loading={<Loader size="lg" />}
						onChange={handleUpdateContent}
						onMount={handleEditorDidMount}
						options={{
							minimap: {
								enabled: false,
							},
							readOnly: content === noFileText,
							renderLineHighlight: "none",
							scrollBeyondLastLine: false,
							wordWrap: "on",
						}}
						theme="vs-dark"
						value={content}
					/>
				</>
			) : null}
		</div>
	);
};
