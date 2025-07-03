/* eslint-disable no-console */
"use client";

import React, { useEffect, useRef } from "react";

import mermaid from "mermaid";
import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DiagramViewerModalProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

// Mermaid Initialization (from your snippet)
try {
	mermaid.initialize({
		startOnLoad: false,
		securityLevel: "loose",
		theme: "base",
		logLevel: "error",
		flowchart: {
			useMaxWidth: true,
			htmlLabels: true,
		},
		themeVariables: {
			background: "#1b1b1b",
			// Primary colors
			primaryColor: "#7FAE3C", // green-600 from your theme
			primaryTextColor: "white",
			primaryBorderColor: "#7FAE3C", // green-600

			// Secondary colors
			secondaryColor: "#ededed", // gray-300
			secondaryTextColor: "#2d2d2d", // gray-1100
			secondaryBorderColor: "#bec3d1", // gray-600

			// Tertiary colors
			tertiaryColor: "#f3f3f6", // gray-200
			tertiaryTextColor: "#515151", // gray-1000
			tertiaryBorderColor: "#cdcdcd", // gray-550

			// Line colors
			lineColor: "#626262", // gray-850

			// Note colors
			noteBkgColor: "#E8FFCA", // green-100
			noteTextColor: "#2d2d2d", // gray-1100
			noteBorderColor: "#7FAE3C", // green-600

			// Actor colors
			actorBkg: "#7FAE3C", // green-600
			actorTextColor: "#ffffff", // white
			actorBorder: "#626262", // gray-850

			// Other elements
			activationBorderColor: "#BCF870", // green-800
			activationBkgColor: "#E8FFCA", // green-100
		},
	});
} catch (e) {
	console.warn("Mermaid already initialized or error during initialization:", e);
}

// Props type for the MermaidDiagram component
type MermaidDiagramComponentProps = {
	code: string;
};

// MermaidDiagram Component (from your snippet)
const MermaidDiagram = ({ code }: MermaidDiagramComponentProps) => {
	const mermaidRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (code) {
			const currentRef = mermaidRef.current;
			if (!currentRef) return;

			currentRef.innerHTML = "";

			let cleanCode = code.trim();

			if (cleanCode.startsWith("```sequenceDiagram")) {
				cleanCode = cleanCode.replace(/```sequenceDiagram\s*/, "").replace(/```\s*$/, "");
			} else if (!cleanCode.startsWith("sequenceDiagram")) {
				cleanCode = "sequenceDiagram\n" + cleanCode;
			}

			if (cleanCode.startsWith("sequenceDiagram") && !cleanCode.startsWith("sequenceDiagram\n")) {
				cleanCode = cleanCode.replace("sequenceDiagram", "sequenceDiagram\n");
			}

			cleanCode = cleanCode.replace(/\n\s{4}/g, "\n");

			try {
				const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 11)}`;

				mermaid
					.render(uniqueId, cleanCode)
					.then((result) => {
						if (currentRef) {
							while (currentRef.firstChild) {
								currentRef.removeChild(currentRef.firstChild);
							}
							currentRef.innerHTML = result.svg;

							const svg = currentRef.querySelector("svg");
							if (svg) {
								svg.style.backgroundColor = "#161616";
								svg.style.padding = "0.5rem";
							}
						}
						return result;
					})
					.catch((error) => {
						console.error("Error rendering Mermaid diagram:", error);
						if (currentRef) {
							currentRef.innerHTML = `<pre>Error rendering diagram:\n${String(error)}\n\nCode:\n${cleanCode}</pre>`;
						}
					});
			} catch (error) {
				console.error("Synchronous error during Mermaid diagram rendering:", error);
				if (currentRef) {
					currentRef.innerHTML = `<pre>Error rendering diagram:\n${String(error)}\n\nCode:\n${cleanCode}</pre>`;
				}
			}
		} else if (mermaidRef.current) {
			mermaidRef.current.innerHTML = "";
		}
	}, [code]);

	if (!code) return null;

	return (
		<div className="h-full overflow-auto rounded-xl bg-gray-1250 text-sm shadow-md">
			<div className="flex h-full items-center justify-center" ref={mermaidRef}>
				{/* Mermaid will render the diagram here */}
			</div>
		</div>
	);
};

// Main DiagramViewerModal component
export const DiagramViewerModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "diagramViewer" });
	const { closeModal, data } = useModalStore();
	const diagramData = data as DiagramViewerModalProps | undefined;

	if (!diagramData || !diagramData.content) {
		return null;
	}

	return (
		<Modal className="h-5/6 w-4/5 max-w-6xl bg-gray-1250" name={ModalName.diagramViewer}>
			<div className="flex h-full flex-col">
				<div className="flex-1 overflow-hidden">
					<MermaidDiagram code={diagramData.content} />
				</div>

				<div className="flex items-center justify-end gap-3 border-t border-gray-950 bg-gray-1250 px-4 py-3">
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

// Note: The original export default MermaidDiagram; is removed as this file now exports DiagramViewerModal.
// The MermaidDiagram component is now a local component within this modal file.
