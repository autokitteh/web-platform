import React, { useRef, useState } from "react";

import { FloatingFocusManager, FloatingPortal, useMergeRefs } from "@floating-ui/react";

import { PopoverListContext } from "@contexts";
import { usePopoverListContext } from "@contexts/usePopover";
import { usePopoverList } from "@src/hooks";
import { PopoverOptions, PopoverTriggerProps } from "@src/interfaces/components";
import { PopoverListItem } from "@src/interfaces/components/popover.interface";
import { cn } from "@src/utilities";

export const PopoverList = ({
	children,
	...restOptions
}: {
	children: React.ReactNode;
} & PopoverOptions) => {
	const popoverList = usePopoverList({ ...restOptions });

	return <PopoverListContext.Provider value={popoverList}>{children}</PopoverListContext.Provider>;
};

export const PopoverListTrigger = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & PopoverTriggerProps>(
	function PopoverListTrigger({ children, ...props }, propRef) {
		const context = usePopoverListContext();
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

export const PopoverListContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLProps<HTMLDivElement> & {
		className?: string;
		itemClassName?: string;
		items: PopoverListItem[];
		onItemSelect?: (item: PopoverListItem) => void;
	}
>(function PopoverListContent({ items, onItemSelect, style, ...props }, propRef) {
	const { context: floatingContext, ...context } = usePopoverListContext();
	const listRef = useRef<(HTMLElement | null)[]>([]);
	const ref = useMergeRefs([context.refs.setFloating, propRef]);
	const [activeId, setActiveId] = useState("");

	// Update the listRef in the floating-ui context
	React.useEffect(() => {
		if (listRef.current) {
			context.listRef.current = listRef.current;
		}
	}, [context.listRef]);

	const handleItemClick = (item: PopoverListItem, index: number, id: string) => {
		onItemSelect?.(item);
		setActiveId(id);
		context.setActiveIndex(index);
		context.setOpen(false);
	};

	const onKeyDown = (event: React.KeyboardEvent, item: PopoverListItem, index: number) => {
		if (event.key === "Enter" || event.key === " ") {
			handleItemClick(item, index, item.id);
		} else if (event.key === "ArrowDown") {
			context.setActiveIndex(Math.min(index + 1, items.length - 1));
		} else if (event.key === "ArrowUp") {
			context.setActiveIndex(Math.max(index - 1, 0));
		}
	};

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
						{items.map((item, index) => (
							<div
								aria-selected={context.activeIndex === index}
								className={cn(props?.itemClassName, {
									"bg-gray-1100 text-white hover:bg-gray-1100": item.id === activeId,
								})}
								key={item.id}
								onClick={() => handleItemClick(item, index, item.id)}
								onKeyDown={(event) => onKeyDown(event, item, index)}
								ref={(node) => {
									listRef.current[index] = node;
								}}
								role="option"
								style={{
									cursor: "pointer",
								}}
								tabIndex={context.activeIndex === index ? 0 : -1}
							>
								{item.label}
							</div>
						))}
					</div>
				) : (
					<div />
				)}
			</FloatingFocusManager>
		</FloatingPortal>
	);
});

export const PopoverListClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
	function PopoverListClose(props, ref) {
		const { setOpen } = usePopoverListContext();

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
