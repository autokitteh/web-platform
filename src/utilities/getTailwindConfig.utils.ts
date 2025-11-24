import { Config } from "tailwindcss";
import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "../../tailwind.config.cjs";

type ExtendedResolvedConfig = {
	[key: string]: unknown;
	theme: Record<string, any>;
};

export const twConfig = resolveConfig(tailwindConfig as Config) as unknown as ExtendedResolvedConfig;
