import React, { useCallback, useEffect, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { debounce, last } from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { monacoLanguages, namespaces } from "@constants";
import { LoggerService } from "@services";
import { useToastStore } from "@src/store";
import { cn } from "@utilities";

import { useFileOperations } from "@hooks";

import { Button, Checkbox, IconButton, IconSvg, Loader, Spinner, Tab } from "@components/atoms";

import { Close, SaveIcon } from "@assets/image/icons";

export const EditorTabs = () => {
	const { projectId } = useParams();
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { closeOpenedFile, fetchResources, getResources, openFileAsActive, openFiles, openProjectId, saveFile } =
		useFileOperations(projectId!);
	const { t: tTabsEditor } = useTranslation("tabs", { keyPrefix: "editor" });
	const addToast = useToastStore((state) => state.addToast);

	const activeEditorFileName =
		(projectId && openFiles[projectId]?.find(({ isActive }: { isActive: boolean }) => isActive)?.name) || "";
	const fileExtension = "." + last(activeEditorFileName.split("."));
	const languageEditor = monacoLanguages[fileExtension as keyof typeof monacoLanguages];

	const [content, setContent] = useState<string>("");
	const [autosave, setAutosave] = useState(true);
	const [loadingSave, setLoadingSave] = useState(false);
	const [lastSaved, setLastSaved] = useState<string>();
	const [isFirstLoad, setIsFirstLoad] = useState(true);

	const updateContentFromResource = (resource?: Uint8Array) => {
		if (resource) {
			const byteArray = Array.from(resource);
			setContent(new TextDecoder().decode(new Uint8Array(byteArray)));
		} else {
			setContent(t("noFileText"));
		}
	};

	const loadContent = async () => {
		const resources = await fetchResources(true);
		const resource = resources?.[activeEditorFileName];
		updateContentFromResource(resource);
	};

	const loadFileResource = async () => {
		const resources = await getResources();
		const resource = resources?.[activeEditorFileName];
		updateContentFromResource(resource);
	};

	useEffect(() => {
		if (isFirstLoad || openProjectId !== projectId) {
			loadContent();
			setIsFirstLoad(false);

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

	const handleEditorDidMount = (_editor: unknown, monaco: Monaco) => {
		monaco.editor.setTheme("myCustomTheme");
	};

	const updateContent = async (newContent?: string) => {
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

		if (newContent === t("noFileText") || newContent === undefined) {
			handleError("codeSaveFailedMissingContent", { projectId });

			return;
		}

		setLoadingSave(true);
		try {
			await saveFile(activeEditorFileName, newContent);
			setContent(newContent);
			setLastSaved(moment().utc().format("YYYY-MM-DD HH:mm:ss"));
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
			setLoadingSave(false);
		}
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedUpdateContent = useCallback(debounce(updateContent, 1500), [projectId, activeEditorFileName]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedSaveContent = useCallback(debounce(updateContent, 1500, { leading: true, trailing: false }), [
		projectId,
		activeEditorFileName,
	]);

	const handleUpdateContent = (newContent?: string) => {
		if (!newContent) {
			setContent("");

			return;
		}

		setContent(newContent);

		if (autosave && newContent !== tTabsEditor("noFileText")) {
			debouncedUpdateContent(newContent);
		}
	};

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
									))
								: null}
						</div>

						{openFiles[projectId]?.length ? (
							<div
								className="relative -right-4 -top-2 z-10 flex flex-col items-end whitespace-nowrap"
								title={lastSaved ? `${t("lastSaved")}:${lastSaved}` : ""}
							>
								<div className="inline-flex gap-2 rounded-3xl border border-gray-1000 p-1">
									{autosave ? null : (
										<Button
											className="whitespace-nowrap px-4 py-1"
											disabled={loadingSave || autosave}
											onClick={() => debouncedSaveContent(content)}
											variant="filledGray"
										>
											<IconSvg className="fill-white" src={!loadingSave ? SaveIcon : Spinner} />

											<div className="mt-0.5">{t("buttons.save")}</div>
										</Button>
									)}

									<Checkbox
										checked={autosave}
										label={t("autoSave")}
										onChange={() => setAutosave(!autosave)}
									/>
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
							lineNumbers: "off",
							minimap: {
								enabled: false,
							},
							readOnly: content === t("noFileText"),
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
