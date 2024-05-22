import React, { useEffect, useState } from "react";
import { LogoFrame, CatImage } from "@assets/image";
import { Close } from "@assets/image/icons";
import { Frame, IconButton } from "@components/atoms";
import { SessionTableEditorProps } from "@interfaces/components";
import Editor, { Monaco } from "@monaco-editor/react";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";

export const SessionTableEditor = ({ session, isSelectedSession, onClose }: SessionTableEditorProps) => {
	const [editorKey, setEditorKey] = useState(0);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const baseStyle = cn("w-3/5 transition pt-20", {
		"bg-gray-700 rounded-l-none": !isSelectedSession,
		"ml-2.5": isSelectedSession,
	});

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

	const sessionLogValue = session?.map(({ logs }) => logs).join("\n");

	return (
		<Frame className={baseStyle}>
			{isSelectedSession ? (
				<div className="font-bold -mt-10 flex justify-between items-center">
					{t("output")}:
					<IconButton ariaLabel={t("buttons.ariaCloseEditor")} className="w-7 h-7 p-0.5 bg-gray-700" onClick={onClose}>
						<Close className="transition w-3 h-3 fill-white" />
					</IconButton>
				</div>
			) : null}
			{isSelectedSession && session?.length ? (
				<Editor
					beforeMount={handleEditorWillMount}
					className="-ml-6"
					defaultLanguage="json"
					key={editorKey}
					onMount={handleEditorDidMount}
					options={{
						readOnly: true,
						minimap: {
							enabled: false,
						},
						lineNumbers: "off",
						renderLineHighlight: "none",
						wordWrap: "on",
					}}
					theme="vs-dark"
					value={sessionLogValue}
				/>
			) : (
				<div className="flex flex-col items-center mt-20">
					<p className="font-bold text-gray-400 text-lg mb-8">
						{isSelectedSession ? t("noData") : t("noSelectedSession")}
					</p>
					<CatImage className="border-b border-gray-400 fill-gray-400" />
				</div>
			)}

			<LogoFrame
				className={cn(
					"absolute fill-white opacity-10 pointer-events-none",
					"max-w-72 2xl:max-w-80 3xl:max-w-420 -bottom-10 2xl:bottom-7 right-2 2xl:right-7"
				)}
			/>
		</Frame>
	);
};
