import * as React from "react";

import { FloatingFocusManager, FloatingPortal, useMergeRefs } from "@floating-ui/react";

import { PopoverContext, usePopoverContext } from "@contexts";
import { usePopover } from "@src/hooks";
import { PopoverOptions, PopoverTriggerProps } from "@src/interfaces/components";

export const Popover = ({
	children,
	interactionType = "hover",
	modal = false,
	...restOptions
}: {
	children: React.ReactNode;
} & PopoverOptions) => {
	const popover = usePopover({ modal, interactionType, ...restOptions });

	return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
};

export const PopoverTrigger = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & PopoverTriggerProps>(
	function PopoverTrigger({ children, ...props }, propRef) {
		const context = usePopoverContext();
		const childrenRef = React.isValidElement(children) ? (children as any).ref : null;
		const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef].filter(Boolean));

		return (
			<button
				data-state={context.open ? "open" : "closed"}
				ref={ref}
				type="button"
				{...context.getReferenceProps(props)}
			>
				{children}
			</button>
		);
	}
);

export const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function PopoverContent(
	{ style, ...props },
	propRef
) {
	const { context: floatingContext, ...context } = usePopoverContext();
	const ref = useMergeRefs([context.refs.setFloating, propRef]);

	if (!floatingContext.open) return null;

	return (
		<FloatingPortal>
			<FloatingFocusManager context={floatingContext} modal={context.modal}>
				<div
					ref={ref}
					style={{ ...context.floatingStyles, ...context.styles, ...style }}
					{...context.getFloatingProps(props)}
					className={props?.className}
				>
					{props.children}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	);
});

export const PopoverClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
	function PopoverClose(props, ref) {
		const { setOpen } = usePopoverContext();

		return (
			<button
				ref={ref}
				type="button"
				{...props}
				onClick={(event) => {
					props.onClick?.(event);
					setOpen(false);
				}}
			/>
		);
	}
);
