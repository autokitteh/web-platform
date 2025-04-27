// useFetchTrigger.js
import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { namespaces } from "@constants";
import { LoggerService, TriggersService } from "@services";
import { Trigger } from "@type/models";

import { useToastStore } from "@store";

export const useFetchTrigger = (triggerId: string) => {
	const [trigger, setTrigger] = useState<Trigger | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const addToast = useToastStore((state) => state.addToast);
	const { t: tErrors } = useTranslation("errors");

	useEffect(() => {
		const handleErrors = (
			error: Error | null,
			toastMessage: string,
			logMessage = toastMessage,
			logExtendedMessage = logMessage
		) => {
			addToast({
				message: tErrors(toastMessage),
				type: "error",
			});
			LoggerService.error(
				namespaces.triggerService,
				tErrors(logExtendedMessage, { triggerId, error: error?.message })
			);
		};

		const fetchTrigger = async () => {
			try {
				const { data } = await TriggersService.get(triggerId);
				if (!data) {
					handleErrors(null, "triggerNotFound");

					return;
				}
				setTrigger(data);
			} catch (error) {
				handleErrors(error, "triggerNotFound");
			} finally {
				setIsLoading(false);
			}
		};

		fetchTrigger();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [triggerId]);

	return { trigger, isLoading };
};
