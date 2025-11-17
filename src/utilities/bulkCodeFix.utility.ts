import type { TFunction } from "i18next";

import { namespaces } from "@constants";
import { LoggerService } from "@services";
import type { BulkCodeFixSuggestion, BulkCodeFixResult, BulkCodeFixHandlerOptions } from "@src/types/components";

export const processBulkCodeFixSuggestions = async (
	suggestions: BulkCodeFixSuggestion[],
	{ tErrors, onProcessFile, onActiveFileUpdate }: BulkCodeFixHandlerOptions
): Promise<BulkCodeFixResult> => {
	const result: BulkCodeFixResult = {
		processedFiles: new Set<string>(),
		processedErrors: [],
		successCount: 0,
		failureCount: 0,
	};

	if (!suggestions || suggestions.length === 0) {
		LoggerService.warn(namespaces.ui.projectCodeEditor, tErrors("cannotApplyBulkCodeFix"));
		return result;
	}

	const suggestionsByFile = suggestions.reduce(
		(acc: Record<string, BulkCodeFixSuggestion[]>, suggestion: BulkCodeFixSuggestion) => {
			const { fileName } = suggestion;
			if (!acc[fileName]) {
				acc[fileName] = [];
			}
			acc[fileName].push(suggestion);
			return acc;
		},
		{} as Record<string, BulkCodeFixSuggestion[]>
	);

	for (const [fileName, fileSuggestions] of Object.entries(suggestionsByFile)) {
		try {
			for (const suggestion of fileSuggestions) {
				const { newCode } = suggestion;

				const saved = await onProcessFile(fileName, newCode);
				if (saved) {
					result.processedFiles.add(fileName);
					result.successCount++;

					if (onActiveFileUpdate) {
						onActiveFileUpdate(fileName, newCode);
					}
				} else {
					result.failureCount++;
					LoggerService.error(namespaces.ui.projectCodeEditor, tErrors("codeFixesSaveFailed", { fileName }));
					result.processedErrors.push(`${fileName}: ${tErrors("codeFixesSaveFailed", { fileName })}`);
				}
			}
		} catch (error) {
			result.failureCount++;
			const errorMessage = `Failed to process ${fileName}: ${(error as Error).message}`;
			LoggerService.error(namespaces.ui.projectCodeEditor, errorMessage, true);
			result.processedErrors.push(errorMessage);
		}
	}

	return result;
};

export const generateBulkCodeFixSummary = (
	result: BulkCodeFixResult,
	tErrors: TFunction
): { message: string; success: boolean } => {
	if (result.processedErrors.length > 0) {
		const summary = `${result.failureCount} of ${result.successCount + result.failureCount} file(s) failed to process`;
		return {
			success: false,
			message: summary,
		};
	}

	return {
		success: result.processedFiles.size > 0,
		message: result.processedFiles.size > 0 ? "" : tErrors("noFilesProcessed"),
	};
};
