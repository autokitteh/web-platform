export interface AccordionProps {
	children: React.ReactNode;
	classChildren?: string;
	className?: string;
	classNameButton?: string;
	classIcon?: string;
	title: React.ReactNode;
	openIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	closeIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	constantIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	hideDivider?: boolean;
	isOpen?: boolean;
	onToggle?: (isOpen: boolean) => void;
}
