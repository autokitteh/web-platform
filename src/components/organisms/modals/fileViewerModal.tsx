import React from "react";

import { Editor } from "@monaco-editor/react";
import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { FileViewerModalProps } from "@interfaces/components";
import { monacoLanguages } from "@src/constants";

import { useModalStore } from "@store";

import { Button, Loader } from "@components/atoms";
import { CopyButton, Modal } from "@components/molecules";

export const FileViewerModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "fileViewer" });
	const { closeModal } = useModalStore();
	const fileData = useModalStore((state) => state.data as FileViewerModalProps);

	if (!fileData || typeof (fileData as FileViewerModalProps).filename !== "string") {
		return null;
	}

	const { filename, content, language } = fileData;

	const fileExtension = `.${filename.split(".").pop() || ""}`;
	const editorLanguage =
		language ||
		(fileExtension in monacoLanguages
			? monacoLanguages[fileExtension as keyof typeof monacoLanguages]
			: "plaintext");

	return (
		<Modal
			className="h-5/6 w-4/5 max-w-5xl overflow-hidden bg-gray-1250"
			closeButtonClass="p-2"
			name={ModalName.fileViewer}
		>
			<div className="flex h-full flex-col p-4">
				<h3 className="mb-2 text-lg text-white">{filename}</h3>

				<div className="flex-1 overflow-hidden rounded">
					<Editor
						className="size-full"
						defaultLanguage={editorLanguage}
						defaultValue={content}
						loading={<Loader size="lg" />}
						options={{
							readOnly: true,
							minimap: { enabled: true },
							scrollBeyondLastLine: false,
							automaticLayout: true,
							fontFamily: "monospace, sans-serif",
							fontSize: 14,
							renderLineHighlight: "none",
							wordWrap: "on",
						}}
						theme="vs-dark"
					/>
				</div>

				<div className="flex items-center justify-end gap-3 border-t border-gray-950 bg-gray-1250 px-4 py-3">
					<CopyButton
						buttonText={t("copyButton")}
						className="w-24 bg-gray-1100 px-4 py-3 font-semibold"
						size="md"
						text={content}
					/>
					<Button
						ariaLabel={t("proceedButton")}
						className="h-12 bg-gray-1100 px-4 py-3 font-semibold"
						onClick={() => closeModal(ModalName.fileViewer)}
						variant="filled"
					>
						{t("proceedButton")}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
