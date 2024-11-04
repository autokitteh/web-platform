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
