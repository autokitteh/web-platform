import React, { useRef, useState } from "react";

import { motion, useDomEvent } from "motion/react";

import { cn } from "@src/utilities";

const transitions = {
	open: { type: "spring" as const, damping: 25, stiffness: 120 },
	close: { duration: 0 },
};

export const ImageMotion = ({ alt, className, src }: { alt?: string; className?: string; src: string }) => {
	const [isOpen, setOpen] = useState(false);

	useDomEvent(useRef(window), "scroll", () => isOpen && setOpen(false));

	const transition = isOpen ? transitions.open : transitions.close;

	const baseClass = cn("h-full min-h-32 cursor-zoom-in", { "cursor-zoom-out": isOpen }, className);
	const imageClass = cn("z-50 h-full object-cover", {
		"fixed w-auto max-w-7xl h-auto m-auto top-0 left-0 right-0 bottom-0 object-cover": isOpen,
	});
	const overlayClass = cn("pointer-events-none fixed inset-0 z-40 bg-black/70 opacity-0", {
		"pointer-events-auto opacity-100": isOpen,
	});

	return (
		<div className={baseClass}>
			<motion.div
				animate={{ opacity: isOpen ? 1 : 0 }}
				className={overlayClass}
				onClick={() => setOpen(false)}
				transition={transition}
			/>
			<motion.img
				alt={alt}
				className={imageClass}
				layout
				onClick={() => setOpen(!isOpen)}
				src={src}
				transition={transition}
			/>
		</div>
	);
};
