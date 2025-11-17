import type { TFunction } from "i18next";

export interface BulkCodeFixSuggestion {
	fileName: string;
	newCode: string;
}

export interface BulkCodeFixResult {
	processedFiles: Set<string>;
	processedErrors: string[];
	successCount: number;
	failureCount: number;
}

export interface BulkCodeFixHandlerOptions {
	tErrors: TFunction;
	onProcessFile: (fileName: string, newCode: string) => Promise<boolean>;
	onActiveFileUpdate?: (fileName: string, newCode: string) => void;
}
