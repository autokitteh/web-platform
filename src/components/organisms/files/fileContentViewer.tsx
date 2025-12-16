import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { last } from "lodash";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import { Document, Page, pdfjs } from "react-pdf";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";

import { defaultMonacoEditorLanguage, monacoLanguages, namespaces } from "@constants";
import { FileContentViewerProps } from "@interfaces/components";
import { LoggerService } from "@services";
import { initPythonTextmate } from "@src/lib/monaco/initPythonTextmate";
import { cn } from "@utilities";

import { Button, Loader, MermaidDiagram, Typography } from "@components/atoms";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const FileContentViewer = ({
	className,
	content,
	editorHeight = "100%",
	fileName,
	imageUrl,
	initialContentRef,
	onContentChange,
	onEditorMount,
	onGrammarLoaded,
	pdfUrl,
	showLoadingOverlay = true,
}: FileContentViewerProps) => {
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { t: tErrors } = useTranslation("errors");

	const [editorMounted, setEditorMounted] = useState(false);
	const [grammarLoaded, setGrammarLoaded] = useState(false);
	const [numPages, setNumPages] = useState<number | null>(null);
	const [pageNumber, setPageNumber] = useState(1);

	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const internalInitialContentRef = useRef<string | Blob>("");
	const isInitialLoadRef = useRef(true);

	const activeInitialContentRef = initialContentRef || internalInitialContentRef;

	const fileExtension = "." + last(fileName.split("."));
	const languageEditor =
		monacoLanguages[fileExtension as keyof typeof monacoLanguages] || defaultMonacoEditorLanguage;

	const isImageFile = useMemo(() => {
		const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg", ".ico"];
		return imageExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
	}, [fileName]);

	const isPdfFile = useMemo(() => fileName.toLowerCase().endsWith(".pdf"), [fileName]);

	const isMarkdownFile = useMemo(() => fileName.endsWith(".md"), [fileName]);

	const readmeContent = useMemo(() => content.replace(/---[\s\S]*?---\n/, ""), [content]);

	useEffect(() => {
		isInitialLoadRef.current = true;
		setEditorMounted(false);
		setGrammarLoaded(false);
		setPageNumber(1);
	}, [fileName]);

	useEffect(() => {
		if (grammarLoaded) {
			onGrammarLoaded?.(true);
		}
	}, [grammarLoaded, onGrammarLoaded]);

	const handleEditorWillMount = useCallback((monacoInstance: Monaco) => {
		monacoInstance.editor.defineTheme("myCustomTheme", {
			base: "vs-dark",
			colors: {
				"editor.background": "#000000",
			},
			inherit: true,
			rules: [{ token: "storage.type.function.python", foreground: "#569cd6" }],
		});

		monacoInstance.editor.defineTheme("transparent-dark", {
			base: "vs-dark",
			colors: {
				"editor.background": "#00000000",
			},
			inherit: true,
			rules: [{ token: "storage.type.function.python", foreground: "#569cd6" }],
		});
	}, []);

	const handleEditorDidMount = useCallback(
		async (_editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: Monaco) => {
			monacoInstance.editor.setTheme("myCustomTheme");
			editorRef.current = _editor;
			const model = _editor.getModel();
			if (!model) return;
			model.pushEditOperations([], [], () => null);

			_editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyZ, () => {
				const currentContent = model.getValue();
				if (currentContent === activeInitialContentRef.current) {
					return;
				}
				_editor.trigger("keyboard", "undo", null);
			});

			if (languageEditor === "python") {
				try {
					await initPythonTextmate(monacoInstance, _editor);
					setGrammarLoaded(true);
				} catch (error) {
					LoggerService.error(
						namespaces.ui.projectCodeEditor,
						tErrors("failedInitializePythonGrammar", { error: (error as Error).message })
					);
					setGrammarLoaded(true);
				}
			} else {
				setGrammarLoaded(true);
			}

			setEditorMounted(true);
			isInitialLoadRef.current = false;

			onEditorMount?.(_editor, monacoInstance);
		},
		[languageEditor, activeInitialContentRef, onEditorMount, tErrors]
	);

	const handleEditorChange = useCallback(
		(newContent?: string) => {
			if (!newContent) return;

			if (isInitialLoadRef.current) {
				isInitialLoadRef.current = false;
				return;
			}

			onContentChange?.(newContent);
		},
		[onContentChange]
	);

	const onDocumentLoadSuccess = ({ numPages: pages }: { numPages: number }) => {
		setNumPages(pages);
		setPageNumber(1);
	};

	const changePage = (offset: number) => {
		setPageNumber((prevPageNumber) => prevPageNumber + offset);
	};

	const markdownComponents = useMemo(
		() => ({
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			code: ({ node, inline, className: codeClassName, children, ...props }: any) => {
				const match = /language-(\w+)/.exec(codeClassName || "");
				const language = match ? match[1] : "";

				if (!inline && language === "mermaid") {
					return <MermaidDiagram chart={String(children).replace(/\n$/, "")} className="my-4" />;
				}

				return (
					<code className={codeClassName} {...props}>
						{children}
					</code>
				);
			},
		}),
		[]
	);

	if (isImageFile) {
		return (
			<div
				className={cn(
					"scrollbar flex size-full items-center justify-center overflow-auto bg-transparent p-4",
					className
				)}
			>
				{imageUrl ? (
					<img alt={fileName} className="max-h-full max-w-full object-contain" src={imageUrl} />
				) : (
					<div className="flex flex-col items-center gap-2 text-white">
						<Loader size="lg" />
						<div className="text-sm">Loading image...</div>
					</div>
				)}
			</div>
		);
	}

	if (isPdfFile) {
		return (
			<div
				className={cn(
					"scrollbar flex size-full flex-col items-center overflow-auto bg-transparent p-4",
					className
				)}
			>
				{pdfUrl ? (
					<>
						<Document
							file={pdfUrl}
							loading={
								<div className="flex flex-col items-center gap-2 text-white">
									<Loader size="lg" />
									<div className="text-sm">Loading PDF...</div>
								</div>
							}
							onLoadSuccess={onDocumentLoadSuccess}
						>
							<Page
								className="border border-gray-800"
								pageNumber={pageNumber}
								renderAnnotationLayer={true}
								renderTextLayer={true}
							/>
						</Document>
						{numPages && numPages > 1 ? (
							<div className="mt-4 flex items-center gap-4 text-white">
								<Button disabled={pageNumber <= 1} onClick={() => changePage(-1)} variant="filledGray">
									Previous
								</Button>
								<Typography className="text-sm">
									Page {pageNumber} of {numPages}
								</Typography>
								<Button
									disabled={pageNumber >= numPages}
									onClick={() => changePage(1)}
									variant="filledGray"
								>
									Next
								</Button>
							</div>
						) : null}
					</>
				) : (
					<div className="flex flex-col items-center gap-2 text-white">
						<Loader size="lg" />
						<div className="text-sm">Loading PDF...</div>
					</div>
				)}
			</div>
		);
	}

	if (isMarkdownFile) {
		return (
			<div
				className={cn(
					"scrollbar markdown-dark markdown-body overflow-hidden overflow-y-auto bg-transparent text-white",
					className
				)}
			>
				<Markdown components={markdownComponents} remarkPlugins={[remarkGfm, remarkAlert]}>
					{readmeContent}
				</Markdown>
			</div>
		);
	}

	return (
		<div className={cn("relative size-full", className)}>
			{showLoadingOverlay && !grammarLoaded && editorMounted ? (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/75">
					<div className="flex flex-col items-center gap-2 text-white">
						<Loader size="lg" />
						<div className="text-sm">{t("loadingSyntaxHighlighting")}</div>
					</div>
				</div>
			) : null}
			<Editor
				aria-label={fileName}
				beforeMount={handleEditorWillMount}
				className="w-full overflow-hidden"
				height={editorHeight}
				key={fileName}
				language={languageEditor}
				loading={
					<div className="flex size-full items-center justify-center">
						<Loader data-testid="monaco-loader" size="lg" />
					</div>
				}
				onChange={handleEditorChange}
				onMount={handleEditorDidMount}
				options={{
					fontFamily: "monospace, sans-serif",
					fontSize: 14,
					minimap: {
						enabled: false,
					},
					renderLineHighlight: "none",
					scrollBeyondLastLine: false,
					wordWrap: "on",
					readOnly: !grammarLoaded,
				}}
				theme="transparent-dark"
				value={content}
			/>
		</div>
	);
};
