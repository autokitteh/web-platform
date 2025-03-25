interface AppConfig {
	apiBaseUrl: string;
}

const runtimeConfig = (window as any).appConfig || {};
export const config: AppConfig = {
	apiBaseUrl: runtimeConfig.apiBaseUrl || "",
};
