import { useCallback, useState } from "react";

import type { TFunction } from "i18next";

import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { ServiceResponse } from "@src/types";
import { User } from "@src/types/models";

import { useLoggerStore, useToastStore } from "@store";

interface UseLoginAttemptArgs {
	login: () => ServiceResponse<User>;
	t: TFunction;
}

export function useLoginAttempt({ login, t }: UseLoginAttemptArgs) {
	const addToast = useToastStore((state) => state.addToast);
	const clearLogs = useLoggerStore((state) => state.clearLogs);
	const [isLoggingIn, setIsLoggingIn] = useState(false);

	const attemptLogin = useCallback(async () => {
		setIsLoggingIn(true);
		try {
			const { error } = await login();
			if (error) throw new Error((error as Error).message);
			clearLogs();
		} catch (error) {
			LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);
			addToast({ message: t("errors.loginFailedTryAgainLater"), type: "error" });
		} finally {
			setIsLoggingIn(false);
		}
	}, [addToast, clearLogs, login, t]);

	return { attemptLogin, isLoggingIn };
}
