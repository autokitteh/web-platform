interface Item {
	text: string;
	linkText?: string;
	linkHref?: string;
}

export interface WelcomeInfoCardProps {
	items: Item[];
	title: React.ReactNode;
}
