import * as React from "react";

import { FloatingFocusManager, FloatingPortal, useMergeRefs } from "@floating-ui/react";

import { PopoverContext, usePopoverContext } from "@contexts";
import { usePopover } from "@src/hooks";
import { PopoverOptions, PopoverTriggerProps } from "@src/interfaces/components";

export const Popover = ({
	children,
	interactionType = "hover",
	...restOptions
}: {
	children: React.ReactNode;
} & PopoverOptions) => {
	const popover = usePopover({ interactionType, ...restOptions });

	return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
};

export const PopoverTrigger = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & PopoverTriggerProps>(
	function PopoverTrigger({ children, ...props }, propRef) {
		const context = usePopoverContext();
		const childrenRef = React.isValidElement(children) ? (children as any).ref : null;
		const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef].filter(Boolean));

		const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
			if (event.key === "Enter" || event.key === " ") {
				context.setOpen(true);
			}
		};

		return (
			<button
				data-state={context.open ? "open" : "closed"}
				ref={ref}
				type="button"
				{...context.getReferenceProps(props)}
				onKeyDown={onKeyDown}
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

	return (
		<FloatingPortal>
			<FloatingFocusManager context={floatingContext} initialFocus={0}>
				{context.isMounted ? (
					<div
						ref={ref}
						style={{ ...style, ...context.floatingStyles, ...context.styles }}
						{...context.getFloatingProps(props)}
						className={props?.className}
						{...context.getReferenceProps()}
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
