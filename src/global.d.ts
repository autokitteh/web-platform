import { PushParams } from "@src/types/hooks";

declare global {
	interface Window {
		_hsq: PushParams[];
		dataLayer: any[];
		DD_RUM?: {
			getInternalContext(): any;
		};
	}
}
