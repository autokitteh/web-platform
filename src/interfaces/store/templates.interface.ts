import { TemplateStorageService } from "@services";

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

export interface TemplateMetadata {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	filesIndex: string[];
}

export interface TemplateMetadataWithCategory {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	filesIndex: string[];
	category: string;
}

export interface TemplateCategory {
	name: string;
	templates: TemplateMetadata[];
}

export interface TemplateCardWithFiles {
	assetDirectory: string;
	title: string;
	description: string;
	integrations: string[];
	files: Record<string, string>;
}
export interface ProcessedCategory {
	name: string;
	cards: TemplateCardWithFiles[];
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

export interface TemplateState {
	templateMap: Record<string, TemplateMetadata>;
	isLoading: boolean;
	sortedCategories?: TemplateCategory[];
	error: string | null;
	lastCommitDate?: string;
	lastCheckDate?: Date;
	templateStorage: TemplateStorageService | undefined;
	fetchTemplates: () => Promise<void>;
	findTemplateByAssetDirectory: (assetDirectory: string) => TemplateMetadata | undefined;
	getFilesForTemplate: (assetDirectory: string) => Promise<Record<string, string>>;
	getTemplateStorage: () => TemplateStorageService;
	reset: () => void;
}
