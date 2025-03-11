export interface WelcomeCardProps {
	title: string;
	description: string;
	buttonText: string;
	icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	isLoading?: boolean;
	isHovered?: boolean;
	onClick: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	type?: "demo" | "template";
}
