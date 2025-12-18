import { useCallback, useEffect, useState } from "react";

import { namespaces } from "@constants";
import { UseAutoLoginArgs, UseAutoLoginReturn, UseLoginAttemptArgs } from "@interfaces/hooks";
import { LoggerService } from "@services";

import { useLoggerStore, useToastStore } from "@store";

export const useLoginAttempt = ({ login, t }: UseLoginAttemptArgs) => {
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
};

export const useAutoLogin = ({ login, enabled }: UseAutoLoginArgs): UseAutoLoginReturn => {
	const [isLoading, setIsLoading] = useState(enabled);
	const [loginError, setLoginError] = useState<string | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const performLogin = useCallback(async () => {
		if (!enabled) {
			return;
		}

		setIsLoading(true);
		setLoginError(null);

		const { data: user, error } = await login();

		if (error || !user) {
			LoggerService.error(namespaces.ui.loginPage, `Auto-login failed: ${error || "No user returned"}`, true);
			setLoginError("Failed to authenticate. Please check your backend connection.");
			setIsLoading(false);
			return;
		}

		setIsLoggedIn(true);
		setIsLoading(false);
	}, [enabled, login]);

	useEffect(() => {
		performLogin();
	}, [performLogin]);

	const retry = useCallback(() => {
		window.location.reload();
	}, []);

	return { isLoading, loginError, isLoggedIn, retry };
};
