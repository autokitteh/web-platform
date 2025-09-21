export const getTextareaHeight = (textareaElement: HTMLTextAreaElement): number => {
	if (!textareaElement) return 0;

	const copyFullStyle = (source: HTMLTextAreaElement, target: HTMLTextAreaElement) => {
		const computed = window.getComputedStyle(source);
		for (const prop of computed as any as string[]) {
			try {
				const value = computed.getPropertyValue(prop);
				if (value) {
					target.style.setProperty(prop, value, computed.getPropertyPriority(prop));
				}
			} catch {
				// Some properties may throw (rare); ignore safely
			}
		}
	};

	const createMirrorTextarea = (rows: number) => {
		const t = document.createElement("textarea");
		copyFullStyle(textareaElement, t);

		const cs = window.getComputedStyle(textareaElement);
		const propsToCopy = [
			"padding-top",
			"padding-right",
			"padding-bottom",
			"padding-left",

			"margin-top",
			"margin-right",
			"margin-bottom",
			"margin-left",

			"border-top-width",
			"border-right-width",
			"border-bottom-width",
			"border-left-width",
			"border-top-style",
			"border-right-style",
			"border-bottom-style",
			"border-left-style",
			"border-top-color",
			"border-right-color",
			"border-bottom-color",
			"border-left-color",

			"line-height",

			"font-family",
			"font-size",
			"font-weight",

			"height",
		];
		for (const p of propsToCopy) {
			const v = cs.getPropertyValue(p);
			if (v) t.style.setProperty(p, v, cs.getPropertyPriority(p));
		}

		t.rows = rows;
		t.value = "";
		t.setAttribute("aria-hidden", "true");

		t.style.visibility = "hidden";
		t.style.position = "absolute";
		t.style.top = "-9999px";
		t.style.left = "-9999px";
		t.style.height = "auto";
		t.style.minHeight = "0";
		t.style.maxHeight = "none";
		t.style.pointerEvents = "none";
		t.style.overflow = "hidden";

		t.removeAttribute("id");
		t.removeAttribute("name");

		document.body.appendChild(t);
		return t;
	};

	const textarea1 = createMirrorTextarea(1);

	const oneRowHeight = textarea1.clientHeight;

	textarea1.remove();
	return oneRowHeight;
};
