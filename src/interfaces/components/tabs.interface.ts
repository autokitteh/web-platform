export interface TabsProps {
	defaultValue?: string;
	className?: string;
	children: React.ReactNode;
	onChange?: (value: string) => void;
}

export interface TabProps {
	className?: string;
	value: string;
	ariaLabel?: string;
	children: React.ReactNode;
}

export interface TabListProps {
	className?: string;
	children: React.ReactNode;
}

export interface TabsContextProps {
	activeTab?: string;
	setActiveTab: (value: string) => void;
}
