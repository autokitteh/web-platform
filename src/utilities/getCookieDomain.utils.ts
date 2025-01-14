import i18n from "i18next";
import psl from "psl";

import { LoggerService } from "@services/logger.service";

export const getCookieDomain = (url: string, namespace: string): { cookieDomain?: string; error?: Error } => {
	try {
		const rootDomain = psl.parse(url);
		if (rootDomain.error) {
			throw rootDomain.error.message;
		}

		const { domain, input } = rootDomain;
		if (!domain && input === "localhost") {
			return { cookieDomain: "localhost" };
		}

		return { cookieDomain: `.${rootDomain.domain}` };
	} catch (error) {
		LoggerService.error(namespace, i18n.t("gettingCookieDomain.parsingError", { error, ns: "utilities" }));

		return { error };
	}
};
