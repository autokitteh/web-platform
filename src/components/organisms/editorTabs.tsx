import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { MdSave } from "react-icons/md";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { LocalStorageKeys } from "@src/enums";
import { useCodeFixManager, useFileEditorManager } from "@src/hooks";
import { useCacheStore, useFileStore } from "@src/store";
import { navigateToProject } from "@src/utilities/navigation";
import { abbreviateFilePath, cn, getPreference } from "@utilities";

import { Button, IconButton, IconSvg, Loader, Tab, Typography } from "@components/atoms";
import { FileTabMenu, RenameFileModal, FileContentViewer } from "@components/organisms";

import { AKRoundLogo } from "@assets/image";
import { Close, CloudSyncOffIcon } from "@assets/image/icons";

export const EditorTabs = () => {
	const { projectId } = useParams() as { projectId: string };
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });

	const {
		loading: { resources: isLoadingCode },
		resources,
	} = useCacheStore();
	const { openFiles, openFileAsActive, closeOpenedFile } = useFileStore();

	const activeFile = openFiles[projectId]?.find((f: { isActive: boolean }) => f.isActive);
	const activeEditorFileName = activeFile?.name || "";

	const location = useLocation();
	const navigate = useNavigate();

	const autoSaveMode = getPreference(LocalStorageKeys.autoSave);

	const [contextMenu, setContextMenu] = useState<{
		fileName: string;
		position: { x: number; y: number };
	} | null>(null);

	const fileEditor = useFileEditorManager({
		projectId,
		activeEditorFileName,
		autoSaveMode,
	});

	useCodeFixManager({
		projectId,
		activeEditorFileName,
		saveFileWithContent: fileEditor.saveFileWithContent,
		setContent: fileEditor.setContent,
		editorRef: fileEditor.editorRef,
		debouncedAutosave: fileEditor.debouncedAutosave,
		autoSaveMode,
	});

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

	const activeCloseIcon = (fileName: string) => {
		const isActiveFile = openFiles[projectId]?.find(({ isActive, name }) => name === fileName && isActive);

		return cn("size-4 p-0.5 opacity-50 hover:bg-gray-1100 group-hover:opacity-100", {
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

	const handleTabContextMenu = (event: React.MouseEvent<HTMLDivElement>, fileName: string) => {
		event.preventDefault();
		event.stopPropagation();

		setContextMenu({
			fileName,
			position: { x: event.clientX, y: event.clientY },
		});
	};

	return (
		<div className="relative ml-8 flex size-full flex-col">
			{projectId ? (
				<>
					{openFiles[projectId]?.length ? (
						<div
							className="absolute right-10 top-0 z-20 flex items-center gap-1 whitespace-nowrap"
							title={fileEditor.lastSaved ? `${t("lastSaved")}: ${fileEditor.lastSaved}` : ""}
						>
							{autoSaveMode ? (
								<Button
									className="z-20 w-24 justify-center bg-black py-1"
									disabled={isLoadingCode}
									onClick={() => fileEditor.debouncedManualSave()}
									variant="ghost"
								>
									{isLoadingCode ? <Loader className="mr-1" size="sm" /> : null}
									<Typography className="text-white" size="small">
										{t("autoSave")}
									</Typography>
								</Button>
							) : (
								<Button
									className="absolute right-2.5 z-20"
									disabled={isLoadingCode}
									onClick={() => fileEditor.debouncedManualSave()}
									variant="flatText"
								>
									{isLoadingCode ? (
										<Loader className="mr-1" size="sm" />
									) : fileEditor.syncError ? (
										<IconSvg className="size-7 text-red-500" src={CloudSyncOffIcon} />
									) : (
										<MdSave className="size-6" />
									)}
								</Button>
							)}
						</div>
					) : null}
					<div className="absolute flex w-full justify-between pt-0" id="editor-tabs">
						<div
							className={
								`flex h-8 select-none items-center gap-1 uppercase xl:gap-2 2xl:gap-4 3xl:gap-5 ` +
								`scrollbar overflow-x-auto overflow-y-hidden whitespace-nowrap`
							}
						>
							{projectId
								? openFiles[projectId]?.map(({ name }) => {
										return (
											<div key={name} onContextMenu={(e) => handleTabContextMenu(e, name)}>
												<Tab
													activeTab={activeEditorFileName}
													className="group flex items-center gap-1 normal-case"
													onClick={() => openFileAsActive(name)}
													title={name}
													value={name}
												>
													{abbreviateFilePath(name)}

													<IconButton
														ariaLabel={t("buttons.ariaCloseFile")}
														className={activeCloseIcon(name)}
														onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
															handleCloseButtonClick(event, name)
														}
													>
														<Close className="size-3 fill-gray-750 transition group-hover:fill-white" />
													</IconButton>
												</Tab>
											</div>
										);
									})
								: null}
						</div>
					</div>

					{openFiles[projectId]?.length ? (
						<FileContentViewer
							className="-ml-6 pb-5 pt-14"
							content={fileEditor.content}
							editorHeight="100%"
							fileName={activeEditorFileName}
							imageUrl={fileEditor.imageUrl}
							initialContentRef={fileEditor.initialContentRef}
							onContentChange={fileEditor.handleContentChange}
							onEditorMount={fileEditor.handleEditorMount}
							onGrammarLoaded={fileEditor.setGrammarLoaded}
							pdfUrl={fileEditor.pdfUrl}
							projectId={projectId}
							showLoadingOverlay={!fileEditor.grammarLoaded}
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
