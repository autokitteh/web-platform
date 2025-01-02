import { PushParams } from "@src/types/hooks";

declare global {
	interface Window {
		_hsq: PushParams[];
	}
}
