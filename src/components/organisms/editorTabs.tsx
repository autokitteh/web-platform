import React, { useState, useEffect } from "react";
import { Tabs, Tab, TabList, TabPanel } from "@components/atoms";
import Editor from "@monaco-editor/react";

export const EditorTabs = () => {
	const [editorKey, setEditorKey] = useState(0);

	useEffect(() => {
		const handleResize = () => setEditorKey((prevKey) => prevKey + 1);

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<Tabs defaultValue="manifest">
			<TabList className="uppercase">
				<Tab value="manifest">MANIFEST</Tab>
				<Tab value="code">CODE</Tab>
			</TabList>
			<TabPanel className="pt-10" value="manifest">
				<Editor defaultValue="// Code A:" key={editorKey} language="python" theme="vs-dark" />
			</TabPanel>
			<TabPanel className="pt-10" value="code">
				<Editor defaultValue="// Code B:" key={editorKey} language="python" theme="vs-dark" />
			</TabPanel>
		</Tabs>
	);
};
