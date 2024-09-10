import { EntrypointTrigger } from "@type/models/session.type";

export type BuildInfoRuntimes = {
	artifact: {
		compiled_data: string;
		exports: EntrypointTrigger[];
	};
	info: {
		name: string;
	};
};
