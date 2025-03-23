import React, { forwardRef } from "react";

import { FloatingFocusManager, FloatingPortal } from "@floating-ui/react";

import { PopoverContentBaseProps } from "@src/interfaces/components";

import { useMergeRefsCustom } from "@components/molecules/popover/utilities";

export const PopoverContentBase = forwardRef<HTMLDivElement, PopoverContentBaseProps>(function PopoverContentBase(
	{ context, floatingContext, style, initialFocusElement, ...props },
	propRef
) {
	const ref = useMergeRefsCustom(context.refs.setFloating, propRef);

	return (
		<FloatingPortal>
			<FloatingFocusManager context={floatingContext} initialFocus={initialFocusElement || 0}>
				{context.isMounted ? (
					<div
						ref={ref}
						style={{ ...style, ...context.floatingStyles, ...context.styles }}
						{...context.getFloatingProps(props)}
						className={`${props?.className} z-40`}
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
