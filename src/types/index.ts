export type { ServiceResponse, ServiceResponseError } from "@type/services.types";
export type { SortConfig } from "@type/sortConfig.type";
export type { StartSessionArgsType } from "@type/startSessionArgs.type";
export type { ColorSchemes, SystemSizes, TextSizes } from "@type/theme.type";

declare global {
	interface Window {
		gtag: (type: string, action: string, options: object) => void;
	}
}
