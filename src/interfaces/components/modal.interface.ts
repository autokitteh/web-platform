export interface IModal {
	className?: string;
	children: React.ReactNode;
	name: string;
}

export interface IModalAddCodeAssets {
	onError?: (message: string) => void;
}
