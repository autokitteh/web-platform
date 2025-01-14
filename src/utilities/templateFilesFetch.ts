import i18n from "i18next";

import { LocalDomainHttpService, LoggerService } from "@services";
import { namespaces } from "@src/constants";

export const fetchFileContent = async (fileUrl: string): Promise<{ data?: string; error?: Error }> => {
	try {
		const response = await LocalDomainHttpService.get(fileUrl, { responseType: "text" });

		return { data: response.data, error: undefined };
	} catch (error) {
		LoggerService.error(
			namespaces.templatesUtility,
			i18n.t("errors.errorFetchingFileExtended", { ns: "templates", fileUrl, error })
		);

		return { data: undefined, error: new Error(i18n.t("errors.errorFetchingFile", { ns: "templates", fileUrl })) };
	}
};
