import React, { useEffect, useRef } from "react";

import mermaid from "mermaid";

interface MermaidDiagramProps {
	chart: string;
	className?: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className = "" }) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		mermaid.initialize({
			startOnLoad: true,
			theme: "dark",
			securityLevel: "loose",
			fontFamily: "monospace",
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

	return <div className={className} ref={ref} />;
};
