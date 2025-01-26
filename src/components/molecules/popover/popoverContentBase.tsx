import React, { Ref } from "react";

import { FloatingFocusManager, FloatingPortal } from "@floating-ui/react";

import { useMergeRefsCustom } from "@components/molecules/popover/utilities";

interface PopoverContentBaseProps {
	[key: string]: any;
	context: any;
	floatingContext: any;
	style?: React.CSSProperties;
	skipInitialFocus?: boolean;
	initialFocusElement?: Ref<any>;
}

export const PopoverContentBase = React.forwardRef<HTMLDivElement, PopoverContentBaseProps>(function PopoverContentBase(
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
