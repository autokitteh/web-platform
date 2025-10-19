import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";

import { ModalName } from "@enums/components";
import { useModalStore } from "@src/store";

import { MermaidDiagram } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DocumentationModal = () => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "documentation" });
	const { getModalData } = useModalStore();
	const readmeContent = getModalData<string>(ModalName.documentationModal);

	const markdownComponents = useMemo(
		() => ({
			code: ({ inline, className, children, ...props }: any) => {
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

	return (
		<Modal className="h-[90vh] w-[90vw] max-w-none bg-gray-1250" name={ModalName.documentationModal}>
			<div className="mx-6 flex h-full flex-col">
				<h3 className="mb-5 text-xl font-bold">{t("modalTitle")}</h3>

				<div className="scrollbar markdown-dark markdown-body mb-6 flex-1 overflow-y-auto bg-transparent text-sm text-white">
					<Markdown components={markdownComponents} remarkPlugins={[remarkGfm, remarkAlert]}>
						{readmeContent || ""}
					</Markdown>
				</div>
			</div>
		</Modal>
	);
};
