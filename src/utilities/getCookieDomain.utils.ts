import psl from "psl";

export const getCookieDomain = (pslDomain: psl.ParsedDomain): string => {
	let cookieDomain = `.${pslDomain.domain}`;

	const { domain, input } = pslDomain;
	if (domain === null && input === "localhost") {
		cookieDomain = "localhost";
	}

	return cookieDomain;
};
