import React, { useState, useEffect } from "react";
import { Tabs, Tab, TabList, TabPanel } from "@components/atoms";
import Editor, { Monaco } from "@monaco-editor/react";
import { useUiGlobalStore } from "@store";

export const EditorTabs = () => {
	const [editorKey, setEditorKey] = useState(0);
	const [manifestCode, setManifestCode] = useState("// Code A: Initialize your code here...");
	const [codeContent, setCodeContent] = useState("// Code B: Initialize your code here...");
	const { isFullScreen } = useUiGlobalStore();

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
		<Tabs defaultValue="manifest">
			<TabList className="uppercase">
				<Tab value="manifest">MANIFEST</Tab>
				<Tab value="code">CODE</Tab>
			</TabList>
			<TabPanel className="pt-10 -ml-7" value="manifest">
				<Editor
					beforeMount={handleEditorWillMount}
					defaultValue={manifestCode}
					key={editorKey}
					language="python"
					onChange={(value) => setManifestCode(value || "")}
					onMount={handleEditorDidMount}
					theme="vs-dark"
				/>
			</TabPanel>
			<TabPanel className="pt-10  -ml-7" value="code">
				<Editor
					beforeMount={handleEditorWillMount}
					defaultValue={codeContent}
					key={editorKey}
					language="python"
					onChange={(value) => setCodeContent(value || "")}
					onMount={handleEditorDidMount}
					theme="vs-dark"
				/>
			</TabPanel>
		</Tabs>
	);
};
