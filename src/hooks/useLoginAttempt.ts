import { useCallback, useState } from "react";

import { namespaces } from "@constants";
import { UseLoginAttemptArgs } from "@interfaces/hooks";
import { LoggerService } from "@services";

import { useLoggerStore, useToastStore } from "@store";

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
