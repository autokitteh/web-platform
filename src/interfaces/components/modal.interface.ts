export interface IModal {
	className?: string;
	children: React.ReactNode;
	name: string;
}

export interface IModalAddCodeAssets {
	projectId: string;
	onError?: (message: string) => void;
}
