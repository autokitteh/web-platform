export interface BadgeProps {
	children?: React.ReactNode;
	content?: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	badgeInvisible?: boolean;
	variant?: "standard" | "dot";
	anchorOrigin?: {
		horizontal: "left" | "right";
		vertical: "top" | "bottom";
	};
	ariaLabel?: string;
}
