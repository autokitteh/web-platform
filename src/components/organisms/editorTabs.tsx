import React, { useCallback, useEffect, useState } from "react";

import {
	RegisteredFileSystemProvider,
	RegisteredMemoryFile,
	registerFileSystemOverlay,
} from "@codingame/monaco-vscode-files-service-override";
import Editor, { Monaco } from "@monaco-editor/react";
import { debounce, last } from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import * as vscode from "vscode";

import { dateTimeFormat, monacoLanguages, namespaces } from "@constants";
import { LoggerService } from "@services";
import { getEditor, startPythonClient } from "@src/setupPythonWorker";
import { useCacheStore, useToastStore } from "@src/store";
import { cn } from "@utilities";

import { useFileOperations } from "@hooks";

import { Button, Checkbox, IconButton, IconSvg, Loader, Spinner, Tab } from "@components/atoms";

import { AKRoundLogo } from "@assets/image";
import { Close, CompressIcon, ExpandIcon, SaveIcon } from "@assets/image/icons";

startPythonClient();

export const EditorTabs = ({ isExpanded, onExpand }: { isExpanded: boolean; onExpand: () => void }) => {
	const { projectId } = useParams();
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { closeOpenedFile, openFileAsActive, openFiles, saveFile } = useFileOperations(projectId!);
	const { currentProjectId, fetchResources } = useCacheStore();
	const addToast = useToastStore((state) => state.addToast);

	const activeEditorFileName =
		(projectId && openFiles[projectId]?.find(({ isActive }: { isActive: boolean }) => isActive)?.name) || "";
	const fileExtension = "." + last(activeEditorFileName.split("."));
	const languageEditor = monacoLanguages[fileExtension as keyof typeof monacoLanguages];

	const [content, setContent] = useState("");
	const [autosaveMode, setAutosaveMode] = useState(true);
	const [loadingSave, setLoadingSave] = useState(false);
	const [lastSaved, setLastSaved] = useState<string>();

	const updateContentFromResource = (resource?: Uint8Array) => {
		if (!resource) {
			setContent("");

			return;
		}
		const byteArray = Array.from(resource);
		setContent(new TextDecoder().decode(new Uint8Array(byteArray)));
	};

	const location = useLocation();
	const fileToOpen = location.state?.fileToOpen;

	const openDefaultFile = () => {
		if (fileToOpen) {
			openFileAsActive(fileToOpen);
		}
	};

	const fileSystemProvider = new RegisteredFileSystemProvider(false);
	fileSystemProvider.registerFile(
		new RegisteredMemoryFile(vscode.Uri.file("/workspace/hello.py"), 'print("Hello, World testtt!")')
	);
	registerFileSystemOverlay(1, fileSystemProvider);

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

	useEffect(() => {
		const handleEditorChange = (event: CustomEvent<string>) => {
			const newContent = event.detail;

			if (autosaveMode) {
				debouncedAutosave(newContent);
			}
			setContent(newContent);
		};

		window.addEventListener("monacoEditorChange", handleEditorChange as EventListener);

		return () => {
			window.removeEventListener("monacoEditorChange", handleEditorChange as EventListener);
		};
	}, [autosaveMode, debouncedAutosave]);

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
									{autosaveMode ? null : (
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
									<Checkbox
										checked={autosaveMode}
										isLoading={autosaveMode ? loadingSave : false}
										label={t("autoSave")}
										onChange={() => setAutosaveMode((prevAutosave) => !prevAutosave)}
									/>
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
						<div className="size-full" id="app" />
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
