export interface ITabs {
	defaultValue?: string | number;
	className?: string;
	children: React.ReactNode;
	onChange?: (value: string | number) => void;
}

export interface ITab {
	className?: string;
	value: string | number;
	children: React.ReactNode;
}

export interface ITabList {
	className?: string;
	children: React.ReactNode;
}

export interface ITabsContext {
	activeTab: string | number;
	setActiveTab: (value: string | number) => void;
}
