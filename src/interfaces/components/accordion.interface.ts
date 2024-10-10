export interface AccordionProps {
	children: React.ReactNode;
	classChildren?: string;
	className?: string;
	classIcon?: string;
	title: React.ReactNode;
	customOpenIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	customCloseIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
