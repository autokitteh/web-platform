import type { TFunction } from "i18next";

import { ServiceResponse } from "@src/types";
import { User } from "@src/types/models";

export interface UseLoginAttemptArgs {
	login: () => ServiceResponse<User>;
	t: TFunction;
}

export interface UseAutoLoginArgs {
	login: () => ServiceResponse<User>;
	enabled: boolean;
}

export interface UseAutoLoginReturn {
	isLoading: boolean;
	loginError: string | null;
	isLoggedIn: boolean;
	retry: () => void;
}
