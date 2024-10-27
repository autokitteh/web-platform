import { TemplateCardType } from "@src/types/components";

export interface ArchivedFile {
	path: string;
	content: string;
}

export interface ProcessedTemplate extends TemplateCardType {
	fileContents: { [key: string]: string };
}

export interface TarHeader {
	filename: string;
	fileSize: number;
	type: number;
}

export interface ExtractedFile {
	filename: string;
	content: Uint8Array;
	size: number;
}

export interface TemplateState {
	processedTemplates: { [key: string]: ProcessedTemplate };
	isLoading: boolean;
	fetchAndProcessArchive: (url: string) => Promise<void>;
}
