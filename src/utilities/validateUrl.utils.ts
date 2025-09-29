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

// OAuth configuration constants
export const oauthConfig = {
	allowedDomains: [
		"github.com",
		"api.github.com",
		"accounts.google.com",
		"login.microsoftonline.com",
		"oauth.descope.com",
		"api.descope.com",
	] as const,
	protocol: "https:",
} as const;

export const validateOAuthRedirectURL = (url: string): boolean => {
	try {
		// First check if it's a valid URL
		const parsedUrl = new URL(url);

		// Must be HTTPS for security
		if (parsedUrl.protocol !== oauthConfig.protocol) {
			LoggerService.warn("OAuth redirect URL must use HTTPS", `URL: ${url}`, true);
			return false;
		}

		// Check if the domain is in our allowlist
		const isAllowedDomain = oauthConfig.allowedDomains.some(
			(domain) => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
		);

		if (!isAllowedDomain) {
			LoggerService.warn(
				"OAuth redirect URL domain not allowed",
				`Hostname: ${parsedUrl.hostname}, URL: ${url}`,
				true
			);
			return false;
		}

		return true;
	} catch (error) {
		LoggerService.error("Invalid OAuth redirect URL", `URL: ${url}, Error: ${String(error)}`, true);
		return false;
	}
};
