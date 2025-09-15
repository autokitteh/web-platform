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

// Allowed OAuth provider domains for security
const allowedOAuthDomains = [
	"github.com",
	"api.github.com",
	"accounts.google.com",
	"login.microsoftonline.com",
	"oauth.descope.com",
	"api.descope.com",
] as const;

export const validateOAuthRedirectURL = (url: string): boolean => {
	try {
		// First check if it's a valid URL
		const parsedUrl = new URL(url);

		// Must be HTTPS for security
		if (parsedUrl.protocol !== "https:") {
			LoggerService.warn("OAuth redirect URL must use HTTPS", { url }, { consoleOnly: true });
			return false;
		}

		// Check if the domain is in our allowlist
		const isAllowedDomain = allowedOAuthDomains.some(
			(domain) => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
		);

		if (!isAllowedDomain) {
			LoggerService.warn(
				"OAuth redirect URL domain not allowed",
				{
					hostname: parsedUrl.hostname,
					url,
				},
				{ consoleOnly: true }
			);
			return false;
		}

		return true;
	} catch (error) {
		LoggerService.error("Invalid OAuth redirect URL", { url, error }, { consoleOnly: true });
		return false;
	}
};
