import { ElementWithStyles, OriginalStyles } from "@src/interfaces/utilities";

const getElementWithOriginalStyles = (targetId: string): ElementWithStyles | null => {
	const element = document.getElementById(targetId);
	if (!element) return null;

	return {
		element,
		originalStyles: {
			position: element.style.position,
			zIndex: element.style.zIndex,
		},
	};
};

const applyHighlightStyles = (element: HTMLElement): void => {
	element.dataset.tourHighlight = "true";
	element.style.position = "relative";
	element.style.zIndex = "105";
	element.style.outline = "1px solid rgba(188, 248, 112, 1)";
	element.style.outlineOffset = "3px";
	element.style.animation = "pulse-highlight 3s infinite";
};

const ensureHighlightKeyframesExist = (): void => {
	if (!document.getElementById("tour-highlight-keyframes")) {
		const style = document.createElement("style");
		style.id = "tour-highlight-keyframes";
		style.textContent = `
            @keyframes pulse-highlight {
                0% {
                    box-shadow: 0 0 0 0 rgba(188, 248, 112, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 6px rgba(188, 248, 112, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(188, 248, 112, 0);
                }
            }
        `;
		document.head.appendChild(style);
	}
};

const configureCutoutOverlay = (overlay: HTMLElement, element: HTMLElement): void => {
	const rect = element.getBoundingClientRect();
	const padding = 3;

	const cutoutStyle = `
        linear-gradient(to bottom, 
            rgba(0, 0, 0, 0.5) 0%, 
            rgba(0, 0, 0, 0.5) 100%
        ) 0 0 / 100% 100%, 
        linear-gradient(to bottom, 
            transparent 0%, 
            transparent 100%
        ) ${rect.left - padding}px ${rect.top - padding}px / ${rect.width + padding * 2}px ${rect.height + padding * 2}px`;

	overlay.style.background = cutoutStyle;
	overlay.style.backgroundRepeat = "no-repeat";
	overlay.style.backgroundBlendMode = "difference";
	overlay.style.pointerEvents = "auto";
};

const createOverlayClickHandler =
	(element: HTMLElement) =>
	(e: MouseEvent): void => {
		const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
		if (clickedElement !== element && !element.contains(clickedElement as Node)) {
			e.stopPropagation();
		}
	};

const createCleanupFunction = (
	element: HTMLElement,
	originalStyles: OriginalStyles,
	overlay: HTMLElement,
	clickHandler: (e: MouseEvent) => void
) => {
	return () => {
		overlay.removeEventListener("click", clickHandler);
		if (element) {
			delete element.dataset.tourHighlight;
			element.style.position = originalStyles.position;
			element.style.zIndex = originalStyles.zIndex;
		}
	};
};

const highlightElement = (element: HTMLElement, targetId: string, isHighlighted: boolean) => {
	const result = getElementWithOriginalStyles(targetId);
	if (!result) return;

	const { element: elementWithStyles, originalStyles } = result;

	if (isHighlighted) {
		applyHighlightStyles(element);
		ensureHighlightKeyframesExist();
	}

	const overlay = document.getElementById("tour-overlay");
	if (overlay) {
		if (isHighlighted) {
			configureCutoutOverlay(overlay, element);
		}

		const handleOverlayClick = createOverlayClickHandler(element);
		overlay.addEventListener("click", handleOverlayClick);

		return createCleanupFunction(elementWithStyles, originalStyles, overlay, handleOverlayClick);
	}
};

const cleanupHighlight = (excludeId?: string, stepId?: string): void => {
	if (stepId) {
		const stepElement = getElementWithOriginalStyles(stepId)?.element;
		if (stepElement) {
			delete stepElement.dataset.tourHighlight;
			stepElement.style.removeProperty("position");
			stepElement.style.removeProperty("z-index");
			stepElement.style.removeProperty("outline");
			stepElement.style.removeProperty("outline-offset");
			stepElement.style.removeProperty("animation");
		}
	}
	const highlightedElements = document.querySelectorAll('[data-tour-highlight="true"]');
	highlightedElements.forEach((el) => {
		const htmlElement = el as HTMLElement;
		if (excludeId && htmlElement.id === excludeId) return;

		delete htmlElement.dataset.tourHighlight;
		htmlElement.style.removeProperty("position");
		htmlElement.style.removeProperty("z-index");
		htmlElement.style.removeProperty("outline");
		htmlElement.style.removeProperty("outline-offset");
		htmlElement.style.removeProperty("animation");
	});

	const overlay = document.getElementById("tour-overlay");
	if (overlay && !excludeId) {
		overlay.style.background = "rgba(0, 0, 0, 0.5)";
		overlay.style.pointerEvents = "none";
	}
};

const createTourOverlay = () => {
	const existingOverlay = document.getElementById("tour-overlay");
	if (existingOverlay) {
		document.body.removeChild(existingOverlay);
	}

	const overlayElement = document.createElement("div");
	overlayElement.id = "tour-overlay";
	overlayElement.className = "fixed inset-0 z-40 size-full bg-black/30";
	document.body.appendChild(overlayElement);

	return overlayElement;
};

export {
	highlightElement,
	cleanupHighlight,
	getElementWithOriginalStyles,
	ensureHighlightKeyframesExist,
	createTourOverlay,
};
