import { MkcertPluginOptions } from "vite-plugin-mkcert";

export const securedDomainConfigured = process.env.VITE_APP_DOMAIN && process.env.VITE_ENABLE_MKCERT_SSL;

export const securedDomainHosts = securedDomainConfigured
	? ["localhost", process.env.VITE_APP_DOMAIN].filter(Boolean)
	: ["localhost"];

export const mkcertConfig: MkcertPluginOptions = {
	hosts: securedDomainHosts as string[],
};
