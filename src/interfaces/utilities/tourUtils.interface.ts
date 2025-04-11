export interface OriginalStyles {
	position: string;
	zIndex: string;
}

export interface ElementWithStyles {
	element: HTMLElement;
	originalStyles: OriginalStyles;
}
