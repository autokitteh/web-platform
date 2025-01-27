import React from "react";

import { useMergeRefs } from "@floating-ui/react";

import { PopoverContext, usePopoverContext } from "@contexts";
import { usePopover } from "@src/hooks";
import { PopoverOptions, PopoverTriggerProps } from "@src/interfaces/components";

export const PopoverWrapper = ({
	children,
	...restOptions
}: {
	children: React.ReactNode;
} & PopoverOptions) => {
	const popover = usePopover({ ...restOptions });

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
				onClick={() => {
					context.setOpen(!context.open);
				}}
				ref={ref}
				type="button"
				{...context.getReferenceProps(props)}
			>
				{children}
			</button>
		);
	}
);
export const PopoverCloseButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
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
