import React, { useState, useEffect } from "react";
import { Close } from "@assets/image/icons";
import { Tabs, Tab, TabList, TabPanel, IconButton } from "@components/atoms";
import { monacoLanguages } from "@constants";
import { ReadOnlyFile } from "@enums/components";
import Editor, { Monaco } from "@monaco-editor/react";
import { useProjectStore } from "@store";
import { cn } from "@utilities";
import { debounce, get, last } from "lodash";
import { editor } from "monaco-editor";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const EditorTabs = ({ key = 0 }: { key?: number }) => {
	const { projectId } = useParams();
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { resources, openedFiles, setUpdateFileContent, updateEditorOpenedFiles, updateEditorClosedFiles } =
		useProjectStore();
	const [editorKey, setEditorKey] = useState(key);
	const initialContent = "// Code A: Initialize your code here...";

	const activeEditorFileName = openedFiles?.find(({ isActive }) => isActive)?.name || "";
	const fileExtension = "." + last(activeEditorFileName.split("."));
	const languageEditor = monacoLanguages[fileExtension as keyof typeof monacoLanguages];

	const resource = get(resources, [activeEditorFileName], new Uint8Array());
	const byteArray = Object.values(resource);
	const content = String.fromCharCode.apply(null, byteArray) || initialContent;

	useEffect(() => {
		const handleResize = () => setEditorKey((prevKey) => prevKey + 1);

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleEditorWillMount = (monaco: Monaco) => {
		monaco.editor.defineTheme("myCustomTheme", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#000000",
			},
		});
	};

	const handleEditorDidMount = (_editor: unknown, monaco: Monaco) => {
		monaco.editor.setTheme("myCustomTheme");
	};

	const handleUpdateContent = debounce((content?: string) => {
		if (!projectId) return;

		const contentUintArray = new TextEncoder().encode(content);
		setUpdateFileContent(contentUintArray, projectId);
	}, 3000);

	const activeCloseIcon = (fileName: string) =>
		cn("w-4 h-4 p-0.5 hover:bg-gray-700 opacity-0 group-hover:opacity-100", {
			"opacity-100": openedFiles.find(({ name, isActive }) => name === fileName && isActive),
		});

	const handleCloseButtonClick = (
		e: React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>,
		name: string
	): void => {
		e.stopPropagation();
		updateEditorClosedFiles(name);
	};

	let editorOptions: editor.IStandaloneEditorConstructionOptions;
	if (activeEditorFileName === ReadOnlyFile.autokittehYaml) {
		editorOptions = {
			readOnly: true,
			minimap: {
				enabled: false,
			},
			lineNumbers: "off",
			renderLineHighlight: "none",
			wordWrap: "on",
			scrollBeyondLastLine: false,
		};
	}

	return (
		<Tabs defaultValue={activeEditorFileName} key={activeEditorFileName} onChange={updateEditorOpenedFiles}>
			{projectId ? (
				<>
					<TabList className="uppercase">
						{openedFiles?.map(({ name }) => (
							<Tab className="flex items-center gap-1 group" key={name} value={name}>
								{name}
								<IconButton
									ariaLabel={t("buttons.ariaCloseFile")}
									className={activeCloseIcon(name)}
									onClick={(e) => handleCloseButtonClick(e, name)}
								>
									<Close className="w-2 h-2 transition fill-gray-400 group-hover:fill-white" />
								</IconButton>
							</Tab>
						))}
					</TabList>
					{Object.entries(resources).map(([fileName]) => (
						<TabPanel className="pt-10 -ml-7" key={fileName} value={fileName}>
							<Editor
								aria-label={fileName}
								beforeMount={handleEditorWillMount}
								key={editorKey}
								language={languageEditor}
								onChange={handleUpdateContent}
								onMount={handleEditorDidMount}
								options={editorOptions}
								theme="vs-dark"
								value={content}
							/>
						</TabPanel>
					))}
				</>
			) : null}
		</Tabs>
	);
};
