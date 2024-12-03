import * as React from "react";

import { useMergeRefs } from "@floating-ui/react";

import { usePopoverContext } from "@contexts";
import { PopoverTriggerProps } from "@src/interfaces/components";

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
