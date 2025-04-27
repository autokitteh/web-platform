import { ColorSchemes } from "@type";

export interface TabsProps {
	children: React.ReactNode;
	className?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
}

export interface TabProps {
	activeTab?: string;
	ariaLabel?: string;
	title?: string;
	children: React.ReactNode;
	className?: string;
	variant?: ColorSchemes;
	onClick?: () => void;
	value: string;
}

export interface TabListProps {
	children: React.ReactNode;
	className?: string;
}

export interface TabsContextProps {
	activeTab?: string;
	setActiveTab: (value: string) => void;
}
