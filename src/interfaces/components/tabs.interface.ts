import { TabValueType } from "@type/components";

export interface ITabs {
	value?: TabValueType;
	className?: string;
	children: React.ReactNode;
	onChange?: (value: TabValueType) => void;
}

export interface ITab {
	className?: string;
	value: TabValueType;
	children: React.ReactNode;
}

export interface ITabList {
	className?: string;
	children: React.ReactNode;
}

export interface ITabsContext {
	activeTab?: TabValueType;
	setActiveTab: (value: TabValueType) => void;
}
