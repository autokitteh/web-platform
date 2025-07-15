/* eslint-disable tailwindcss/no-custom-classname */
import React, { useEffect, useRef } from "react";

import mermaid from "mermaid";
import "../../assets/mermaid.css";

interface MermaidDiagramProps {
	chart: string;
	className?: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className = "" }) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		mermaid.initialize({
			startOnLoad: true,
			theme: "base",
			securityLevel: "loose",
			fontFamily: "monospace",
			themeVariables: {
				background: "#161616",
				primaryColor: "#7FAE3C",
				primaryTextColor: "white",
				primaryBorderColor: "#7FAE3C",
				secondaryColor: "#ededed",
				secondaryTextColor: "#2d2d2d",
				secondaryBorderColor: "#bec3d1",
				tertiaryColor: "#f3f3f6",
				tertiaryTextColor: "#515151",
				tertiaryBorderColor: "#cdcdcd",
				lineColor: "#626262",
				noteBkgColor: "#E8FFCA",
				noteTextColor: "#2d2d2d",
				noteBorderColor: "#7FAE3C",
				actorBkg: "#7FAE3C",
				actorTextColor: "#ffffff",
				actorBorder: "#626262",
				activationBorderColor: "#BCF870",
				activationBkgColor: "#E8FFCA",
				edgeLabelBackground: "#515151",
			},
		});
	}, []);

	useEffect(() => {
		if (ref.current && chart) {
			const element = ref.current;
			element.innerHTML = "";

			try {
				const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
				mermaid
					.render(id, chart)
					.then(({ svg }) => {
						element.innerHTML = svg;
						return svg;
					})
					.catch((error) => {
						element.innerHTML = `<pre class="text-red-400">Error rendering diagram: ${error.message}</pre>`;
						throw error;
					});
			} catch {
				element.innerHTML = `<pre class="text-red-400">Error rendering diagram</pre>`;
			}
		}
	}, [chart]);

	return <div className={`mermaid ${className}`} ref={ref} />;
};
