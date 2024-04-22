export interface CodeAssetsStore {
	content?: string;
	name?: string;
	setCodeAsset: (content: File | string) => void;
}
