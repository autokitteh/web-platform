export interface ITabs {
	value?: string;
	className?: string;
	children: React.ReactNode;
	onChange?: (value: string) => void;
}

export interface ITab {
	className?: string;
	value: string;
	children: React.ReactNode;
}

export interface ITabList {
	className?: string;
	children: React.ReactNode;
}

export interface ITabsContext {
	activeTab?: string;
	setActiveTab: (value: string) => void;
}
