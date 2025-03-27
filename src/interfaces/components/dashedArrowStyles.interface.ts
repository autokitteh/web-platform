import { CSSProperties } from "react";

export interface ArrowStyleConfig {
	base: CSSProperties;
	responsive: {
		[key: string]: CSSProperties;
	};
}
