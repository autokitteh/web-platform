import React, { forwardRef } from "react";

import { FloatingFocusManager, FloatingPortal } from "@floating-ui/react";

import { PopoverContentBaseProps } from "@src/interfaces/components";

import { useMergeRefsCustom } from "@components/molecules/popover/utilities";

export const PopoverContentBase = forwardRef<HTMLDivElement, PopoverContentBaseProps>(function PopoverContentBase(
	{ context, floatingContext, style, initialFocusElement, ...props },
	propRef
) {
	const ref = useMergeRefsCustom(context.refs.setFloating, propRef);

	const handleOverlayKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
			context.setOpen(false);
		}
	};

	const isClickInteraction = context.interactionType === "click";

	return (
		<FloatingPortal>
			<FloatingFocusManager context={floatingContext} initialFocus={initialFocusElement || 0}>
				{context.isMounted ? (
					<>
						{isClickInteraction ? (
							<div
								aria-hidden="true"
								className="fixed inset-0 z-30 bg-black/10"
								onClick={() => context.setOpen(false)}
								onKeyDown={handleOverlayKeyDown}
								role="button"
								tabIndex={0}
							/>
						) : null}
						<div
							ref={ref}
							style={{ ...style, ...context.floatingStyles, ...context.styles }}
							{...context.getFloatingProps(props)}
							className={`${props?.className} z-40`}
						>
							{props.children}
						</div>
					</>
				) : (
					<div />
				)}
			</FloatingFocusManager>
		</FloatingPortal>
	);
});
