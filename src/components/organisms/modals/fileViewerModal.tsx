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

	if (!fileData) return null;

	const { filename, content, language } = fileData;

	const fileExtension = `.${filename.split(".").pop() || ""}`;
	const editorLanguage =
		language ||
		(fileExtension in monacoLanguages
			? monacoLanguages[fileExtension as keyof typeof monacoLanguages]
			: "plaintext");

	return (
		<Modal className="h-5/6 w-4/5 max-w-5xl overflow-hidden" name={ModalName.fileViewer}>
			<div className="flex h-full flex-col">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-xl font-bold">{filename}</h3>
					<CopyButton text={content} />
				</div>

				<div className="flex-1 overflow-hidden rounded border border-gray-950">
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
						}}
					/>
				</div>

				<div className="mt-6 flex justify-end">
					<Button
						ariaLabel={t("closeButton")}
						className="bg-gray-1100 px-4 py-3 font-semibold"
						onClick={() => closeModal(ModalName.fileViewer)}
						variant="filled"
					>
						{t("closeButton")}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
