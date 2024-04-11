import React, { useState, useEffect } from "react";
import { Close } from "@assets/image/icons";
import { Tabs, Tab, TabList, TabPanel, IconButton } from "@components/atoms";
import Editor, { Monaco } from "@monaco-editor/react";
import { useProjectStore } from "@store";
import { cn } from "@utilities";
import { debounce, get } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const EditorTabs = () => {
	const { projectId } = useParams();
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const {
		currentProject: { resources, openedFiles },
		setUpdateFileContent,
		updateEditorOpenedFiles,
		updateEditorClosedFiles,
	} = useProjectStore();
	const [editorKey, setEditorKey] = useState(0);
	const initialContent = "// Code A: Initialize your code here...";
	const activeEditorFileName = openedFiles?.find(({ isActive }) => isActive)?.name || "";

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
		const contentUintArray = new TextEncoder().encode(content);
		setUpdateFileContent(contentUintArray);
	}, 1000);

	const activeCloseIcon = (fileName: string) =>
		cn("w-4 h-4 p-0.5 hover:bg-gray-700 opacity-0 group-hover:opacity-100", {
			"opacity-100": openedFiles.find(({ name, isActive }) => name === fileName && isActive),
		});

	const handleCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement>, name: string): void => {
		e.stopPropagation();
		updateEditorClosedFiles(name);
	};

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
									<Close className="transition w-2 h-2 fill-gray-400 group-hover:fill-white" />
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
								language="python"
								onChange={handleUpdateContent}
								onMount={handleEditorDidMount}
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
