export interface AccordionProps {
	children: React.ReactNode;
	classChildren?: string;
	className?: string;
	classIcon?: string;
	title: React.ReactNode;
	openIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	closeIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
