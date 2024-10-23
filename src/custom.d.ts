declare module "*.svg?react" {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	import React = require("react");

	const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	export default ReactComponent;
}
