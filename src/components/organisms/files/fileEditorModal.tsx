import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import dayjs from "dayjs";
import { debounce, last } from "lodash";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";
import { TfiSave } from "react-icons/tfi";
import Markdown from "react-markdown";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";

import { dateTimeFormat, defaultMonacoEditorLanguage, monacoLanguages, namespaces } from "@constants";
import { LoggerService } from "@services";
import { ModalName, LocalStorageKeys } from "@src/enums";
import { fileOperations } from "@src/factories";
import { initPythonTextmate } from "@src/lib/monaco/initPythonTextmate";
import { useCacheStore, useModalStore, useToastStore } from "@src/store";
import { cn, getPreference } from "@utilities";

import { Button, IconSvg, Loader, MermaidDiagram, Spinner, Typography } from "@components/atoms";
import { Modal } from "@components/molecules";

import { Close, CompressIcon, ExpandIcon, SaveIcon } from "@assets/image/icons";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const FileEditorModal = () => {
	const { projectId } = useParams() as { projectId: string };
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { closeModal, getModalData } = useModalStore();
	const { fetchResources, setLoading, loading } = useCacheStore();
	const addToast = useToastStore((state) => state.addToast);

	const modalData = getModalData<{ fileName: string }>(ModalName.fileEditorModal);
	const fileName = modalData?.fileName || "";

	const [isFullScreen, setIsFullScreen] = useState(true);
	const [content, setContent] = useState("");
	const [lastSaved, setLastSaved] = useState<string>();
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [numPages, setNumPages] = useState<number | null>(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [editorMounted, setEditorMounted] = useState(false);
	const [grammarLoaded, setGrammarLoaded] = useState(false);
	const [editorContainerHeight, setEditorContainerHeight] = useState<number>(0);

	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const initialContentRef = useRef<string | Blob>("");
	const isInitialLoadRef = useRef(true);

	const autoSaveMode = getPreference(LocalStorageKeys.autoSave);
	const isLoadingCode = loading.resources;

	const { saveFile } = fileOperations(projectId!);

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

	const updateContentFromResource = useCallback(
		(resource?: Uint8Array) => {
			if (!resource) {
				setContent("");
				setImageUrl(null);
				setPdfUrl(null);
				return;
			}

			if (isImageFile) {
				const arrayBuffer = new ArrayBuffer(resource.length);
				const view = new Uint8Array(arrayBuffer);
				view.set(resource);
				const blob = new Blob([view]);
				const url = URL.createObjectURL(blob);
				setImageUrl(url);
				setContent("");
				setPdfUrl(null);
				initialContentRef.current = blob;
			} else if (isPdfFile) {
				const arrayBuffer = new ArrayBuffer(resource.length);
				const view = new Uint8Array(arrayBuffer);
				view.set(resource);
				const blob = new Blob([view], { type: "application/pdf" });
				const url = URL.createObjectURL(blob);
				setPdfUrl(url);
				setContent("");
				setImageUrl(null);
				setPageNumber(1);
				initialContentRef.current = blob;
			} else {
				const decodedContent = new TextDecoder().decode(resource);
				setContent(decodedContent);
				initialContentRef.current = decodedContent;
				setImageUrl(null);
				setPdfUrl(null);
			}
		},
		[isImageFile, isPdfFile]
	);

	const loadFileResource = useCallback(async () => {
		if (!fileName || !projectId) return;

		const fetchedResources = await fetchResources(projectId, true);
		if (!fetchedResources || !fetchedResources[fileName]) {
			if (fileName) {
				addToast({
					message: tErrors("fileNotFoundInFetchedResources", { fileName, projectName: projectId }),
					type: "error",
				});
			}
			setContent("");
			return;
		}

		try {
			const resource = fetchedResources[fileName];
			updateContentFromResource(resource);
		} catch (error) {
			LoggerService.warn(
				namespaces.ui.projectCodeEditor,
				tErrors("errorLoadingFile", { fileName, error: (error as Error).message })
			);
		}
	}, [fileName, projectId, fetchResources, updateContentFromResource, addToast, tErrors]);

	useEffect(() => {
		if (fileName && projectId) {
			isInitialLoadRef.current = true;
			setEditorMounted(false);
			setGrammarLoaded(false);
			loadFileResource();
		}
	}, [fileName, projectId, loadFileResource]);

	useEffect(() => {
		return () => {
			if (imageUrl) {
				URL.revokeObjectURL(imageUrl);
			}
			if (pdfUrl) {
				URL.revokeObjectURL(pdfUrl);
			}
		};
	}, [imageUrl, pdfUrl]);

	useEffect(() => {
		const updateHeight = () => {
			const viewportHeight = window.innerHeight;
			const modalHeight = isFullScreen ? viewportHeight * 0.95 : viewportHeight * 0.66;
			const headerAndPaddingHeight = 80;
			setEditorContainerHeight(Math.floor(modalHeight - headerAndPaddingHeight));
		};

		updateHeight();
		window.addEventListener("resize", updateHeight);

		return () => {
			window.removeEventListener("resize", updateHeight);
		};
	}, [isFullScreen]);

	const saveFileWithContent = async (fileNameToSave: string, contentToSave: string): Promise<boolean> => {
		if (!projectId) {
			addToast({ message: tErrors("codeSaveFailed"), type: "error" });
			return false;
		}

		if (contentToSave === null || contentToSave === undefined) {
			return false;
		}

		let validatedContent: string;
		try {
			validatedContent = typeof contentToSave === "string" ? contentToSave : String(contentToSave);
			new TextEncoder().encode(validatedContent);
		} catch {
			addToast({ message: t("contentValidationFailed", { fileName: fileNameToSave }), type: "error" });
			return false;
		}

		setLoading("resources", true);
		try {
			const fileSaved = await saveFile(fileNameToSave, validatedContent);
			if (!fileSaved) {
				addToast({ message: tErrors("codeSaveFailed"), type: "error" });
				return false;
			}

			const cacheStore = useCacheStore.getState();
			const currentResources = cacheStore.resources;
			const updatedResources = {
				...currentResources,
				[fileNameToSave]: new TextEncoder().encode(validatedContent),
			};
			useCacheStore.setState((state) => ({
				...state,
				resources: updatedResources,
			}));

			setLastSaved(dayjs().format(dateTimeFormat));
			return true;
		} catch {
			addToast({ message: tErrors("codeSaveFailed"), type: "error" });
			return false;
		} finally {
			setTimeout(() => {
				setLoading("resources", false);
			}, 1000);
		}
	};

	const updateContent = async (newContent?: string) => {
		if (!fileName) {
			return;
		}
		await saveFileWithContent(fileName, newContent || "");
	};

	const debouncedManualSave = useCallback(
		debounce(
			() => {
				const currentContent = editorRef.current?.getValue();
				if (currentContent !== undefined) {
					updateContent(currentContent);
				}
			},
			1500,
			{ leading: true, trailing: false }
		),
		[projectId, fileName]
	);

	const debouncedAutosave = useCallback(debounce(updateContent, 1500), [projectId, fileName]);

	const handleEditorWillMount = (monacoInstance: Monaco) => {
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
	};

	const handleEditorDidMount = async (_editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: Monaco) => {
		monacoInstance.editor.setTheme("myCustomTheme");
		editorRef.current = _editor;
		const model = _editor.getModel();
		if (!model) return;
		model.pushEditOperations([], [], () => null);

		_editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyZ, () => {
			const currentContent = model.getValue();
			if (currentContent === initialContentRef.current) {
				return;
			}
			_editor.trigger("keyboard", "undo", null);
		});

		if (languageEditor === "python") {
			try {
				await initPythonTextmate(monacoInstance, _editor);
				setGrammarLoaded(true);
			} catch {
				setGrammarLoaded(true);
			}
		} else {
			setGrammarLoaded(true);
		}

		setEditorMounted(true);
		isInitialLoadRef.current = false;
	};

	const handleEditorChange = (newContent?: string) => {
		if (!newContent) return;
		setContent(newContent);
		if (isInitialLoadRef.current) {
			isInitialLoadRef.current = false;
			return;
		}
		if (autoSaveMode && fileName) {
			debouncedAutosave(newContent);
		}
	};

	const handleClose = () => {
		closeModal(ModalName.fileEditorModal);
	};

	const toggleFullScreen = () => {
		setIsFullScreen(!isFullScreen);
	};

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
			code: ({ node, inline, className, children, ...props }: any) => {
				const match = /language-(\w+)/.exec(className || "");
				const language = match ? match[1] : "";

				if (!inline && language === "mermaid") {
					return <MermaidDiagram chart={String(children).replace(/\n$/, "")} className="my-4" />;
				}

				return (
					<code className={className} {...props}>
						{children}
					</code>
				);
			},
		}),
		[]
	);

	const modalClassName = cn(
		"flex flex-col overflow-hidden bg-gray-1100 transition-all duration-300",
		isFullScreen ? "h-[95vh] w-[95vw]" : "h-[66vh] w-[66vw]"
	);

	if (!fileName) {
		return null;
	}

	return (
		<Modal className={modalClassName} clickOverlayToClose={false} hideCloseButton name={ModalName.fileEditorModal}>
			<div className="flex items-center justify-between px-4 py-3">
				<div className="flex items-center gap-2">
					<Typography className="text-white" size="medium">
						{fileName}
					</Typography>
					{lastSaved ? (
						<Typography className="text-gray-500" size="small">
							{t("lastSaved")}: {lastSaved}
						</Typography>
					) : null}
				</div>

				<div className="flex items-center gap-2">
					{autoSaveMode ? (
						<Button
							className="py-1"
							disabled={isLoadingCode}
							onClick={() => debouncedManualSave()}
							variant="flatText"
						>
							{isLoadingCode ? <Loader className="mr-1" size="sm" /> : null}
							<TfiSave className="size-4 fill-white transition" />
						</Button>
					) : (
						<Button
							className="h-6 whitespace-nowrap px-4 py-1"
							disabled={isLoadingCode}
							onClick={() => debouncedManualSave()}
							variant="filledGray"
						>
							<IconSvg className="fill-white" src={isLoadingCode ? Spinner : SaveIcon} />
							<div className="mt-0.5">{t("buttons.save")}</div>
						</Button>
					)}

					<Button
						ariaLabel={isFullScreen ? "Exit full screen" : "Enter full screen"}
						className="rounded-lg bg-transparent p-2 hover:bg-gray-800"
						onClick={toggleFullScreen}
					>
						<IconSvg className="size-4 fill-white" src={isFullScreen ? CompressIcon : ExpandIcon} />
					</Button>

					<Button
						ariaLabel="Close"
						className="rounded-lg bg-transparent p-2 hover:bg-gray-800"
						onClick={handleClose}
					>
						<IconSvg className="size-4 fill-white" src={Close} />
					</Button>
				</div>
			</div>

			<div className="relative flex-1 overflow-hidden">
				{isImageFile ? (
					<div className="scrollbar flex size-full items-center justify-center overflow-auto bg-transparent p-4">
						{imageUrl ? (
							<img alt={fileName} className="max-h-full max-w-full object-contain" src={imageUrl} />
						) : (
							<div className="flex flex-col items-center gap-2 text-white">
								<Loader size="lg" />
								<div className="text-sm">Loading image...</div>
							</div>
						)}
					</div>
				) : isPdfFile ? (
					<div className="scrollbar flex size-full flex-col items-center overflow-auto bg-transparent p-4">
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
										<Button
											disabled={pageNumber <= 1}
											onClick={() => changePage(-1)}
											variant="filledGray"
										>
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
				) : isMarkdownFile ? (
					<div className="scrollbar markdown-dark markdown-body overflow-hidden overflow-y-auto bg-transparent p-4 text-white">
						<Markdown components={markdownComponents} remarkPlugins={[remarkGfm, remarkAlert]}>
							{readmeContent}
						</Markdown>
					</div>
				) : (
					<>
						{!grammarLoaded && editorMounted ? (
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
							className="w-full overflow-hidden rounded-lg"
							height={editorContainerHeight || "100%"}
							key={`${projectId}-${fileName}`}
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
					</>
				)}
			</div>
		</Modal>
	);
};
