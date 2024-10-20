declare module "*.svg" {
	const content: string;
	export default content;
}

// For handling SVG imports with the '?react' query

declare module "*.svg?react" {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	import React = require("react");

	const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	export default ReactComponent;
}
