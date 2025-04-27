import { t } from "i18next";

import { namespaces } from "@constants";
import { LocalDomainHttpService, LoggerService } from "@services";

export const fetchFileContent = async (fileUrl: string): Promise<{ data?: string; error?: Error }> => {
	try {
		const response = await LocalDomainHttpService.get(fileUrl, { responseType: "text" });

		return { data: response.data, error: undefined };
	} catch (error) {
		LoggerService.error(
			namespaces.templatesUtility,
			t("errors.errorFetchingFileExtended", { ns: "templates", fileUrl, error })
		);

		return { data: undefined, error: new Error(t("errors.errorFetchingFile", { ns: "templates", fileUrl })) };
	}
};
