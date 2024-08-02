import axios from "axios";
import { useTranslation } from "react-i18next";

import { namespaces } from "@constants";
import { LoggerService } from "@services";

import { useToastStore } from "@store";

export const useToastAndLog = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const addToast = useToastStore((state) => state.addToast);

	const handleErrorDetails = (error: any): string => {
		if (axios.isAxiosError(error)) {
			if (error.response) {
				return error.response.data.message;
			} else if (error.request) {
				return tErrors("axiosNoResponse");
			} else {
				return error.message;
			}
		} else if (error instanceof Error) {
			return error.message;
		} else if (typeof error === "string") {
			return error;
		} else {
			console.error(tErrors("unknownError"), error);

			return tErrors("unknownError");
		}
	};

	const toastAndLog = (type: "error" | "success", key: string, error?: any, skipLogger: boolean = false) => {
		const message = type === "error" ? tErrors(key) : t(key);
		addToast({ id: Date.now().toString(), message, type });

		if (!skipLogger) {
			const extendedMessage =
				type === "error" ? tErrors(`${key}Extended`, { error: handleErrorDetails(error) }) : message;

			if (type === "error") {
				LoggerService.error(namespaces.connectionService, extendedMessage);
			} else {
				LoggerService.info(namespaces.connectionService, extendedMessage);
			}
		}
	};

	return toastAndLog;
};
