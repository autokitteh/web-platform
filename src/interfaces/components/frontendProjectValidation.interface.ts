import { ProjectValidationLevel } from "@src/types/stores/cacheStore.types";

export interface FrontendProjectValidationProps {
	level?: ProjectValidationLevel;
	message?: string;
}
