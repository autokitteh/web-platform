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
