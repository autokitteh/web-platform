export interface ITabs {
	defaultValue?: number;
	className?: string;
	children: React.ReactNode;
	onChange?: (value: number) => void;
}

export interface ITab {
	className?: string;
	value: number;
	children: React.ReactNode;
}

export interface ITabList {
	className?: string;
	children: React.ReactNode;
}

export interface ITabsContext {
	activeTab: number;
	setActiveTab: (value: number) => void;
}
