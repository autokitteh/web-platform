declare module "*.svg?react" {
	import type { FunctionComponent, SVGProps } from "react";

	const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
	export default ReactComponent;
}

declare namespace React {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface HTMLAttributes<T> {
		popover?: "auto" | "manual" | "";
	}
}
