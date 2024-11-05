import { EntrypointTrigger } from "@src/interfaces/models/session.interface";

export type BuildInfoRuntimes = {
	artifact: {
		compiled_data: string;
		exports: EntrypointTrigger[];
	};
	info: {
		name: string;
	};
};
