import React, { useState, useEffect } from "react";
import { Close } from "@assets/image/icons";
import { Tab, IconButton } from "@components/atoms";
import { monacoLanguages } from "@constants";
import Editor, { Monaco } from "@monaco-editor/react";
import { useProjectStore } from "@store";
import { cn } from "@utilities";
import { debounce, get, last } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const EditorTabs = ({ editorHeight = 0 }: { editorHeight?: number }) => {
	const { projectId } = useParams();
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { resources, openedFiles, setUpdateFileContent, updateEditorOpenedFiles, updateEditorClosedFiles } =
		useProjectStore();
	const [editorKey, setEditorKey] = useState(editorHeight);
	const initialContent = "Click on a file to start editing or create a new one";

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

	const handleUpdateContent = debounce((newContent?: string) => {
		if (!projectId) return;

		if (newContent === content && newContent !== initialContent) return;
		const contentUintArray = new TextEncoder().encode(newContent);
		setUpdateFileContent(contentUintArray, projectId);
	}, 500);

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

	const onTabClick = (value: string) => {
		setActiveTab(value);
		updateEditorOpenedFiles(value);
	};

	const [activeTab, setActiveTab] = useState("");

	return (
		<div className="flex flex-col flex-1 h-full" style={{ height: `${editorHeight + 5}%` }}>
			{projectId ? (
				<>
					<div
						className={
							`uppercase flex items-center gap-1 xl:gap-2 2xl:gap-4 3xl:gap-5 select-none ` +
							`overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar mb-2`
						}
					>
						{openedFiles?.map(({ name }) => (
							<Tab
								activeTab={activeEditorFileName}
								className="flex items-center gap-1 group"
								key={name}
								onClick={() => onTabClick(name)}
								value={name}
							>
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
					</div>

					<Editor
						aria-label={activeTab}
						beforeMount={handleEditorWillMount}
						key={editorKey}
						language={languageEditor}
						onChange={handleUpdateContent}
						onMount={handleEditorDidMount}
						options={{
							minimap: {
								enabled: false,
							},
							lineNumbers: "off",
							renderLineHighlight: "none",
							wordWrap: "on",
							scrollBeyondLastLine: false,
							readOnly: activeEditorFileName === "autokitteh.yaml",
						}}
						theme="vs-dark"
						value={content}
					/>
				</>
			) : null}
		</div>
	);
};
