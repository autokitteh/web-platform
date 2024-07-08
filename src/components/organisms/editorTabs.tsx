import React, { useEffect, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { byteArrayToString, getFile, openDatabase, saveFile } from "./files.utility";
import { monacoLanguages } from "@constants";
import { cn } from "@utilities";

import { useProjectStore } from "@store";

import { IconButton, Loader, Tab } from "@components/atoms";

import { Close } from "@assets/image/icons";

export const EditorTabs: React.FC = () => {
	const { projectId } = useParams<{ projectId: string }>();
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { openedFiles, resources, setUpdateFileContent, updateEditorClosedFiles, updateEditorOpenedFiles } =
		useProjectStore();
	const [editorKey, setEditorKey] = useState(0);
	const [activeTab, setActiveTab] = useState("");

	const activeEditorFileName = openedFiles?.find(({ isActive }) => isActive)?.name || "";
	const fileExtension = "." + activeEditorFileName.split(".").pop();
	const languageEditor = monacoLanguages[fileExtension as keyof typeof monacoLanguages];

	const resource = resources ? resources[activeEditorFileName] : null;
	const [content, setContent] = useState<string>(t("initialContentForNewFile"));

	useEffect(() => {
		const fetchFileContent = async () => {
			if (resource !== null) {
				const byteArray = Object.values(resource);
				const db = await openDatabase();
				const fileContent = byteArrayToString(byteArray as unknown as Uint8Array);
				await saveFile(db, activeEditorFileName, fileContent);
				const retrievedContent = await getFile(db, activeEditorFileName);
				setContent(retrievedContent || t("initialContentForNewFile"));
			}
		};
		fetchFileContent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeEditorFileName, resource]);

	useEffect(() => {
		const handleResize = () => setEditorKey((prevKey) => prevKey + 1);
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

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

	const handleEditorDidMount = (_editor: any, monaco: Monaco) => {
		monaco.editor.setTheme("myCustomTheme");
	};

	const handleUpdateContent = async (newContent?: string) => {
		if (!projectId) {
			return;
		}
		const contentUintArray = new TextEncoder().encode(newContent);
		setUpdateFileContent(contentUintArray, projectId);

		const db = await openDatabase();
		await saveFile(db, activeEditorFileName, newContent || "");
	};

	const activeCloseIcon = (fileName: string) =>
		cn("h-4 w-4 p-0.5 opacity-0 hover:bg-gray-700 group-hover:opacity-100", {
			"opacity-100": openedFiles.find(({ isActive, name }) => name === fileName && isActive),
		});

	const handleCloseButtonClick = (
		event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>,
		name: string
	): void => {
		event.stopPropagation();
		updateEditorClosedFiles(name);
	};

	const onTabClick = (value: string) => {
		setActiveTab(value);
		updateEditorOpenedFiles(value);
	};

	return (
		<div className="flex h-full flex-1 flex-col pt-8">
			{projectId ? (
				<>
					<div
						className={
							`absolute top-5 flex h-8 select-none items-center gap-1 uppercase xl:gap-2 2xl:gap-4 3xl:gap-5 ` +
							`scrollbar overflow-x-auto overflow-y-hidden whitespace-nowrap`
						}
					>
						{openedFiles?.map(({ name }) => (
							<Tab
								activeTab={activeEditorFileName}
								className="group flex items-center gap-1"
								key={name}
								onClick={() => onTabClick(name)}
								value={name}
							>
								{name}

								<IconButton
									ariaLabel={t("buttons.ariaCloseFile")}
									className={activeCloseIcon(name)}
									onClick={(event) => handleCloseButtonClick(event, name)}
								>
									<Close className="h-2 w-2 fill-gray-400 transition group-hover:fill-white" />
								</IconButton>
							</Tab>
						))}
					</div>
					<div className="mt-1 h-full">
						<Editor
							aria-label={activeTab}
							beforeMount={handleEditorWillMount}
							key={editorKey}
							language={languageEditor}
							loading={<Loader size="lg" />}
							onChange={handleUpdateContent}
							onMount={handleEditorDidMount}
							options={{
								lineNumbers: "off",
								minimap: {
									enabled: false,
								},
								readOnly: resource === null,
								renderLineHighlight: "none",
								scrollBeyondLastLine: false,
								wordWrap: "on",
							}}
							theme="vs-dark"
							value={content}
						/>
					</div>
				</>
			) : null}
		</div>
	);
};
