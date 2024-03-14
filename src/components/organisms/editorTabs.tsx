import React, { useState, useEffect } from "react";
import { Tabs, Tab, TabList, TabPanel } from "@components/atoms";
import Editor, { Monaco } from "@monaco-editor/react";
import { useUiGlobalStore, useProjectStore } from "@store";
import { get } from "lodash";

export const EditorTabs = () => {
	const { resources, activeFile, setUpdateContent } = useProjectStore();
	const { isFullScreen } = useUiGlobalStore();
	const [editorKey, setEditorKey] = useState(0);
	const [manifestCode, setManifestCode] = useState("// Code B: Initialize your code here...");
	const initialContent = "// Code A: Initialize your code here...";

	const byteArray = Object.values(get(resources, [activeFile || ""], new Uint8Array()));
	const content = String.fromCharCode.apply(null, byteArray) || initialContent;

	useEffect(() => setEditorKey((prevKey) => prevKey + 1), [isFullScreen]);

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

	return (
		<Tabs defaultValue="code">
			<TabList className="uppercase">
				<Tab value="code">CODE</Tab>
				<Tab value="manifest">MANIFEST</Tab>
			</TabList>
			<TabPanel className="pt-10  -ml-7" value="code">
				<Editor
					beforeMount={handleEditorWillMount}
					key={editorKey}
					language="python"
					onChange={(value) => setUpdateContent(value)}
					onMount={handleEditorDidMount}
					theme="vs-dark"
					value={content}
				/>
			</TabPanel>
			<TabPanel className="pt-10 -ml-7" value="manifest">
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
