import { EntrypointTrigger } from "@type/models/session.type";

export type BuildInfoRuntimes = {
	info: {
		name: string;
	};
	artifact: {
		exports: EntrypointTrigger[];
		compiled_data: string;
	};
};
