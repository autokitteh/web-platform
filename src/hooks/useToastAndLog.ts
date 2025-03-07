import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";

import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { ErrorType } from "@src/types/hooks";

import { useToastStore } from "@store";

export const useToastAndLog = (messagesDictionary: string, errorDictionary: string) => {
	const { t: tErrors } = useTranslation(errorDictionary);
	const { t } = useTranslation(messagesDictionary);
	const addToast = useToastStore((state) => state.addToast);

	const handleErrorDetails = (error: ErrorType): string => {
		if (isAxiosError(error)) {
			if (error.response) {
				return error.response.data.message || error.response.data;
			}
			if (error.request) {
				return tErrors("axiosNoResponse");
			}

			return error.message;
		}

		if (error instanceof Error) {
			return error.message;
		}

		if (typeof error === "string") {
			return error;
		}

		return tErrors("unknownError");
	};

	const toastAndLog = (type: "error" | "success", key: string, error?: ErrorType, skipLogger: boolean = false) => {
		const message = type === "error" ? tErrors(key) : t(key);
		addToast({ message, type });

		if (!skipLogger) {
			const extendedMessage =
				type === "error" && error ? tErrors(`${key}Extended`, { error: handleErrorDetails(error) }) : message;

			if (type === "error") {
				LoggerService.error(namespaces.connectionService, extendedMessage);
			} else {
				LoggerService.info(namespaces.connectionService, extendedMessage);
			}
		}
	};

	return toastAndLog;
};
