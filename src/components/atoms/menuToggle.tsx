import * as React from "react";

import { SVGMotionProps, motion } from "motion/react";

const Path = (props: SVGMotionProps<SVGPathElement>) => (
	<motion.path fill="transparent" stroke="hsl(0, 0%, 18%)" strokeLinecap="round" strokeWidth="3" {...props} />
);

export const MenuToggle = ({ className, isOpen }: { className?: string; isOpen: boolean }) => (
	<div className={className}>
		<svg height="23" viewBox="0 0 23 23" width="23">
			<Path
				animate={isOpen ? "open" : "closed"}
				initial="closed"
				variants={{
					closed: { d: "M 2 2.5 L 20 2.5" },
					open: { d: "M 3 16.5 L 17 2.5" },
				}}
			/>

			<Path
				animate={isOpen ? "open" : "closed"}
				d="M 2 9.423 L 20 9.423"
				initial="closed"
				transition={{ duration: 0.1 }}
				variants={{
					closed: { opacity: 1 },
					open: { opacity: 0 },
				}}
			/>

			<Path
				animate={isOpen ? "open" : "closed"}
				initial="closed"
				variants={{
					closed: { d: "M 2 16.346 L 20 16.346" },
					open: { d: "M 3 2.5 L 17 16.346" },
				}}
			/>
		</svg>
	</div>
);
