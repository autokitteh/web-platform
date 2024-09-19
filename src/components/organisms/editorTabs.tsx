import React, { useCallback, useEffect, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { debounce, last } from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { monacoLanguages } from "@constants";
import { cn } from "@utilities";

import { useFileOperations } from "@hooks";

import { Button, IconButton, IconSvg, Loader, Spinner, Tab, Toggle, Typography } from "@components/atoms";

import { Close, SaveIcon } from "@assets/image/icons";

export const EditorTabs = () => {
	const { projectId } = useParams();
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { closeOpenedFile, openFileAsActive, openFiles, saveFile } = useFileOperations(projectId!);
	const { t: tTabsEditor } = useTranslation("tabs", { keyPrefix: "editor" });

	const { fetchFiles } = useFileOperations(projectId!);

	const activeEditorFileName = openFiles?.find(({ isActive }: { isActive: boolean }) => isActive)?.name || "";
	const fileExtension = "." + last(activeEditorFileName.split("."));
	const languageEditor = monacoLanguages[fileExtension as keyof typeof monacoLanguages];

	const [content, setContent] = useState<string>("");
	const [checked, setChecked] = useState(true);
	const [loadingSave, setLoadingSave] = useState(false);
	const [lastSaved, setLastSaved] = useState<string>();

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
		if (
			!projectId ||
			!activeEditorFileName ||
			newContent === t("noFileText") ||
			newContent === undefined ||
			newContent === tTabsEditor("initialContentForNewFile")
		)
			return;
		setLoadingSave(true);
		await saveFile(activeEditorFileName, newContent);
		setContent(newContent);
		setLastSaved(moment().utc().format("YYYY-MM-DD HH:mm:ss"));
		setLoadingSave(false);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedUpdateContent = useCallback(debounce(updateContent, 1500, { leading: true, trailing: false }), [
		projectId,
		activeEditorFileName,
	]);

	const handleUpdateContent = (newContent?: string) => {
		if (!newContent) return;

		setContent(newContent);

		if (checked) {
			debouncedUpdateContent(newContent);
		}
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

						{openFiles.length ? (
							<div className="relative -right-4 -top-2 z-10 flex flex-col items-end">
								<div className="border-1 inline-flex gap-2 rounded-3xl border border-gray-1000 p-1 pl-2">
									<Toggle checked={checked} onChange={setChecked} title={t("autoSave")} />

									<Button
										className="whitespace-nowrap bg-gray-1050 px-4 py-1 hover:bg-gray-950"
										disabled={loadingSave}
										onClick={() => debouncedUpdateContent(content)}
										variant="filled"
									>
										<IconSvg className="fill-white" src={!loadingSave ? SaveIcon : Spinner} />

										{t("buttons.save")}
									</Button>
								</div>

								{lastSaved ? (
									<Typography size="small">
										{t("lastSaved")}:{lastSaved}
									</Typography>
								) : null}
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
