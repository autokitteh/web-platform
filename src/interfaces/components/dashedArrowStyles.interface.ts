import { CSSProperties } from "react";

interface CustomCSSProperties extends CSSProperties {
	[key: `--${string}`]: string | number;
}

export interface ArrowStyleConfig {
	base: CustomCSSProperties;
	responsive: {
		[key: string]: CustomCSSProperties;
	};
}
