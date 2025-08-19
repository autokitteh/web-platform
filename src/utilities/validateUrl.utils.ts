import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";

export const ValidateURL = (url: string): boolean => {
	try {
		new URL(url);

		return true;
	} catch {
		return false;
	}
};

export const ValidateDomain = (domain: string): boolean => {
	try {
		const parsedUrl = new URL(`http://${domain}`);

		return parsedUrl.hostname === domain && domain.includes(".") && !domain.endsWith(".");
	} catch {
		return false;
	}
};

const urlParamsToCheck = ["org-id", "project-id", "config-mode", "display-deploy-button", "bg-color"] as const;

export const compareUrlParams = (oldUrl: string, newUrl: string): boolean => {
	try {
		const oldUrlObj = new URL(oldUrl);
		const newUrlObj = new URL(newUrl);

		return urlParamsToCheck.some(
			(param) => oldUrlObj.searchParams.get(param) !== newUrlObj.searchParams.get(param)
		);
	} catch (error) {
		LoggerService.warn(namespaces.chatbot, `Failed to compare URLs: ${error}`);
		return oldUrl !== newUrl;
	}
};
