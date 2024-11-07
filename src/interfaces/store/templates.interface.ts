import { TemplateStorageService } from "@services";
import { TemplateCategory, TemplateMetadata } from "@src/types/components";

export interface RemoteTemplateMetadata {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	filesIndex: string[];
}

export interface RemoteTemplateCardWithFiles {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	files: Record<string, string>;
}

export interface ProcessedRemoteCategory {
	name: string;
	cards: RemoteTemplateCardWithFiles[];
}

export interface TemplateState {
	templateMap: Record<string, TemplateMetadata>;
	isLoading: boolean;
	sortedCategories?: TemplateCategory[];
	error: string | null;
	lastCommitDate?: string;
	templateStorage: TemplateStorageService;

	fetchTemplates: () => Promise<void>;
	findTemplateByAssetDirectory: (assetDirectory: string) => TemplateMetadata | undefined;
	getTemplateFiles: (assetDirectory: string) => Promise<Record<string, string>>;
}

export interface GitHubCommit {
	sha: string;
	commit: {
		author: {
			date: string;
			name: string;
		};
		message: string;
	};
}
