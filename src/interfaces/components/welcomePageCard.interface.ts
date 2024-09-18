interface WelcomeCardInfoListItem {
	text: string;
	linkText?: string;
	linkHref?: string;
}

export interface WelcomeInfoCardProps {
	items: WelcomeCardInfoListItem[];
	title: React.ReactNode;
	onPlay?: () => void;
}
