import { PushParams } from "@type/hooks";

declare global {
	interface Window {
		_hsq: PushParams[];
		dataLayer: any[];
	}
}
