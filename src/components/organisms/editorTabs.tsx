import React, { useCallback, useEffect, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { debounce, last } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { monacoLanguages } from "@constants";
import { cn } from "@utilities";

import { useFileOperations } from "@hooks";

import { Button, IconButton, Loader, Tab, Toggle } from "@components/atoms";

import { Close } from "@assets/image/icons";

export const EditorTabs = () => {
	const [checked, setChecked] = useState(true);
	const { projectId } = useParams();
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { closeOpenedFile, openFileAsActive, openFiles, saveFile } = useFileOperations(projectId!);
	const { t: tTabsEditor } = useTranslation("tabs", { keyPrefix: "editor" });

	const { fetchFiles } = useFileOperations(projectId!);

	const activeEditorFileName = openFiles?.find(({ isActive }: { isActive: boolean }) => isActive)?.name || "";
	const fileExtension = "." + last(activeEditorFileName.split("."));
	const languageEditor = monacoLanguages[fileExtension as keyof typeof monacoLanguages];

	const [content, setContent] = useState<string>("");

	const loadContent = async () => {
		const resources = await fetchFiles();

		const resource = resources[activeEditorFileName];
		if (resource) {
			const byteArray = Array.from(resource);
			setContent(new TextDecoder().decode(new Uint8Array(byteArray)));
		} else {
			setContent(t("noFileText"));
		}
	};

	useEffect(() => {
		loadContent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeEditorFileName, projectId]);

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
		if (
			!projectId ||
			!activeEditorFileName ||
			newContent === t("noFileText") ||
			newContent === undefined ||
			newContent === tTabsEditor("initialContentForNewFile")
		)
			return;
		await saveFile(activeEditorFileName, newContent);
		setContent(newContent);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedUpdateContent = useCallback(debounce(updateContent, 1500), [projectId, activeEditorFileName]);

	const handleUpdateContent = (newContent?: string) => {
		debouncedUpdateContent(newContent);
	};

	const activeCloseIcon = (fileName: string) =>
		cn("h-4 w-4 p-0.5 opacity-0 hover:bg-gray-1100 group-hover:opacity-100", {
			"opacity-100": openFiles.find(({ isActive, name }) => name === fileName && isActive),
		});

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
							{openFiles?.map(({ name }) => (
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
										<Close className="h-2 w-2 fill-gray-750 transition group-hover:fill-white" />
									</IconButton>
								</Tab>
							))}
						</div>

						<div className="border-1 relative -right-4 -top-2 inline-flex gap-2 rounded-3xl border border-gray-1000 p-1 pl-2">
							<Toggle checked={checked} onChange={setChecked} title="Autosave" />

							<Button
								className="whitespace-nowrap bg-gray-1050 px-5 py-1 hover:bg-gray-950"
								variant="filled"
							>
								Save
							</Button>
						</div>
					</div>

					<Editor
						aria-label={activeEditorFileName}
						beforeMount={handleEditorWillMount}
						className="absolute -ml-6 h-full"
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
