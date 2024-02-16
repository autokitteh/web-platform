export interface IFrame {
	className?: string;
	children: React.ReactNode;
}

export interface ISplitFrame {
	children: React.ReactNode;
	isFullScreen: boolean;
	setIsFullScreen: (value: boolean) => void;
}
