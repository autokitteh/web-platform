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

const createCleanupFunction = (element: HTMLElement, overlay: HTMLElement, clickHandler: (e: MouseEvent) => void) => {
	return () => {
		overlay.removeEventListener("click", clickHandler);
		if (!element) {
			return;
		}
		delete element.dataset.tourHighlight;
	};
};

const highlightElement = (element: HTMLElement, targetId: string, highlight: boolean) => {
	const result = document.getElementById(targetId);
	if (!result) return;

	const targetElement = result;

	if (highlight) {
		applyHighlightStyles(element);
		ensureHighlightKeyframesExist();
	}

	const overlay = document.getElementById("tour-overlay");
	if (overlay) {
		if (highlight) {
			configureCutoutOverlay(overlay, element);
		}

		const handleOverlayClick = createOverlayClickHandler(element);
		overlay.addEventListener("click", handleOverlayClick);

		return createCleanupFunction(targetElement, overlay, handleOverlayClick);
	}
};

const removeHighlightStyles = (element: HTMLElement): void => {
	delete element.dataset.tourHighlight;
	const stylesToRemove = ["position", "z-index", "outline", "outline-offset", "animation"] as const;
	stylesToRemove.forEach((style) => element.style.removeProperty(style));
};

const cleanupAllHighlights = (excludeId?: string): void => {
	document.querySelectorAll<HTMLElement>('[data-tour-highlight="true"]').forEach((element) => {
		if (excludeId && element.id === excludeId) return;
		removeHighlightStyles(element);
	});
};

const cleanupHighlight = (excludeId?: string, stepId?: string): void => {
	const stepElement = stepId ? document.getElementById(stepId) : null;
	if (stepElement) {
		removeHighlightStyles(stepElement);
		return;
	}
	cleanupAllHighlights(excludeId);
};

const createTourOverlay = (): HTMLElement | undefined => {
	const existingOverlay = document.getElementById("tour-overlay");
	if (existingOverlay) {
		document.body.removeChild(existingOverlay);
		return;
	}

	const overlayElement = document.createElement("div");
	overlayElement.id = "tour-overlay";
	overlayElement.className = "fixed inset-0 z-40 size-full bg-black/30";
	document.body.appendChild(overlayElement);

	return overlayElement;
};

export { highlightElement, ensureHighlightKeyframesExist, createTourOverlay, cleanupAllHighlights, cleanupHighlight };
