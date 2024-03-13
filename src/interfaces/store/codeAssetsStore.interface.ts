export interface ICodeAssetsStore {
	content?: string;
	name?: string;
	setCodeAsset: (content: File | string) => void;
}
