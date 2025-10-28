import { v4 as uuidv4 } from "uuid";

let correlationId: string | null = null;

export const CorrelationIdUtils = {
	generate(): string {
		if (!correlationId) {
			correlationId = uuidv4();
		}
		return correlationId;
	},

	get(): string | null {
		return correlationId;
	},

	reset(): void {
		correlationId = null;
	},
};
