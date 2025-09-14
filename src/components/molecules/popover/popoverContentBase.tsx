import React, { forwardRef } from "react";

import { FloatingFocusManager, FloatingPortal } from "@floating-ui/react";

import { PopoverContentBaseProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

import { useMergeRefsCustom } from "@components/molecules/popover/utilities";

export const PopoverContentBase = forwardRef<HTMLDivElement, PopoverContentBaseProps>(function PopoverContentBase(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	{ context, floatingContext, style, initialFocusElement, overlayClickDisabled, ...props },
	propRef
) {
	const ref = useMergeRefsCustom(context.refs.setFloating, propRef);
	const popoverClassName = cn("z-popover focus:outline-none focus:ring-2 focus:ring-green-800/10", props?.className);

	return (
		<FloatingPortal>
			<FloatingFocusManager context={floatingContext} initialFocus={initialFocusElement || 0}>
				{context.isMounted ? (
					<div
						ref={ref}
						style={{ ...style, ...context.floatingStyles, ...context.styles }}
						{...context.getFloatingProps(props)}
						className={popoverClassName}
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
