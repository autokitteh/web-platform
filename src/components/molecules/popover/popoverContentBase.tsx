import React from "react";

import { FloatingFocusManager, FloatingPortal } from "@floating-ui/react";

import { useMergeRefsCustom } from "@components/molecules/popover/utilities/mergeRefs";

export const PopoverContentBase = React.forwardRef<HTMLDivElement, any>(function PopoverContentBase(
	{ context, floatingContext, style, ...props },
	propRef
) {
	const ref = useMergeRefsCustom(context.refs.setFloating, propRef);

	return (
		<FloatingPortal>
			<FloatingFocusManager context={floatingContext} initialFocus={0}>
				{context.isMounted ? (
					<div
						ref={ref}
						style={{ ...style, ...context.floatingStyles, ...context.styles }}
						{...context.getFloatingProps(props)}
						className={props?.className}
					>
						{props.children}
					</div>
				) : (
					<div />
				)}
			</FloatingFocusManager>
		</FloatingPortal>
	);
});
