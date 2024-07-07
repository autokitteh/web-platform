import React, { useEffect, useState } from "react";

import { Close } from "@assets/image/icons";
import { IconButton, Loader, Tab } from "@components/atoms";
import { monacoLanguages } from "@constants";
import Editor, { Monaco } from "@monaco-editor/react";
import { useProjectStore } from "@store";
import { cn } from "@utilities";
import { get, last } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const EditorTabs = () => {
	const { projectId } = useParams();
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { openedFiles, resources, setUpdateFileContent, updateEditorClosedFiles, updateEditorOpenedFiles } =
		useProjectStore();
	const [editorKey, setEditorKey] = useState(0);
	const [activeTab, setActiveTab] = useState("");

	const activeEditorFileName = openedFiles?.find(({ isActive }) => isActive)?.name || "";
	const fileExtension = "." + last(activeEditorFileName.split("."));
	const languageEditor = monacoLanguages[fileExtension as keyof typeof monacoLanguages];

	const resource = get(resources, [activeEditorFileName], null);
	let content;

	if (resource === null) {
		content = t("noFileText");
	} else {
		const byteArray = Object.values(resource);
		content = String.fromCharCode.apply(null, byteArray) || t("initialContentForNewFile");
	}

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

	const handleEditorDidMount = (_editor: unknown, monaco: Monaco) => {
		monaco.editor.setTheme("myCustomTheme");
	};

	const handleUpdateContent = (newContent?: string) => {
		if (!projectId) {
			return;
		}
		const contentUintArray = new TextEncoder().encode(newContent);
		setUpdateFileContent(contentUintArray, projectId);
	};

	const activeCloseIcon = (fileName: string) =>
		cn("w-4 h-4 p-0.5 hover:bg-gray-700 opacity-0 group-hover:opacity-100", {
			"opacity-100": openedFiles.find(({ isActive, name }) => name === fileName && isActive),
		});

	const handleCloseButtonClick = (
		event: React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>,
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
		<div className="flex flex-1 flex-col h-full pt-8">
			{projectId ? (
				<>
					<div
						className={
							`absolute top-5 h-8 uppercase flex items-center gap-1 xl:gap-2 2xl:gap-4 3xl:gap-5 select-none ` +
							`overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar`
						}
					>
						{openedFiles?.map(({ name }) => (
							<Tab
								activeTab={activeEditorFileName}
								className="flex gap-1 group items-center"
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
									<Close className="fill-gray-400 group-hover:fill-white h-2 transition w-2" />
								</IconButton>
							</Tab>
						))}
					</div>
					<div className="h-full mt-1">
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
