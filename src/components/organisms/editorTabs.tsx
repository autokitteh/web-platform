import React, { useState, useEffect } from "react";
import { Tabs, Tab, TabList, TabPanel } from "@components/atoms";
import { EEditorTabs } from "@enums/components";
import Editor, { Monaco } from "@monaco-editor/react";
import { useProjectStore } from "@store";
import { debounce, get } from "lodash";

export const EditorTabs = () => {
	const { currentProject, setUpdateFileContent } = useProjectStore();
	const [editorKey, setEditorKey] = useState(0);
	const [manifestCode, setManifestCode] = useState("// Code B: Initialize your code here...");
	const initialContent = "// Code A: Initialize your code here...";

	const resource = get(currentProject.resources, [currentProject.activeEditorFileName], new Uint8Array());
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

	return (
		<Tabs defaultValue={EEditorTabs.code}>
			<TabList className="uppercase">
				<Tab value={EEditorTabs.code}>CODE</Tab>
				<Tab value={EEditorTabs.manifest}>MANIFEST</Tab>
			</TabList>
			<TabPanel className="pt-10  -ml-7" value={EEditorTabs.code}>
				<Editor
					beforeMount={handleEditorWillMount}
					key={editorKey}
					language="python"
					onChange={handleUpdateContent}
					onMount={handleEditorDidMount}
					theme="vs-dark"
					value={content}
				/>
			</TabPanel>
			<TabPanel className="pt-10 -ml-7" value={EEditorTabs.manifest}>
				<Editor
					beforeMount={handleEditorWillMount}
					key={editorKey}
					language="python"
					onChange={(value) => setManifestCode(value || "")}
					onMount={handleEditorDidMount}
					theme="vs-dark"
					value={manifestCode}
				/>
			</TabPanel>
		</Tabs>
	);
};
