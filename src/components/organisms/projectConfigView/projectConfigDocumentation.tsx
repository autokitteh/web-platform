import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import { useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";

import { useCacheStore } from "@src/store";

import { MermaidDiagram } from "@components/atoms";
import { Accordion } from "@components/molecules";

export const ProjectConfigDocumentation = () => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "documentation" });
	const { projectId } = useParams() as { projectId: string };
	const resources = useCacheStore((state) => state.resources);
	const [readmeContent, setReadmeContent] = useState<string>("");

	useEffect(() => {
		if (!resources || !projectId) return;

		// Look for README.md file (case insensitive)
		const readmeKey = Object.keys(resources).find((key) => key.toLowerCase() === "readme.md");

		if (readmeKey) {
			const readmeResource = resources[readmeKey];
			if (readmeResource) {
				const decodedContent = new TextDecoder().decode(readmeResource);
				const content = decodedContent.replace(/---[\s\S]*?---\n/, "");
				setReadmeContent(content);
			}
		} else {
			setReadmeContent("");
		}
	}, [resources, projectId]);

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
		<Accordion hideDivider title={t("title")}>
			{readmeContent ? (
				<div className="scrollbar markdown-dark markdown-body max-h-96 overflow-hidden overflow-y-auto bg-transparent text-sm text-white">
					<Markdown components={markdownComponents} remarkPlugins={[remarkGfm, remarkAlert]}>
						{readmeContent}
					</Markdown>
				</div>
			) : (
				<div className="text-sm text-gray-400">{t("noDocumentationFound")}</div>
			)}
		</Accordion>
	);
};
