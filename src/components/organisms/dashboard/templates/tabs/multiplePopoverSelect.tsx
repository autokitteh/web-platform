import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";

import { defaultSelectedMultipleSelect } from "@src/constants";
import { MultiplePopoverSelectProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

import { Typography } from "@components/atoms";
import { PopoverListContent, PopoverListTrigger, PopoverListWrapper } from "@components/molecules/popover";
import { MultipleLabelPopoverItem } from "@components/organisms/dashboard/templates/tabs";

import { ChevronDownIcon, Close } from "@assets/image/icons";

export const MultiplePopoverSelect = ({
	label,
	items,
	emptyListMessage,
	defaultSelectedItems = [],
	onItemsSelected,
	className,
	ariaLabel,
}: MultiplePopoverSelectProps) => {
	const [selectedItem, setSelectedItem] = useState<string[]>(
		defaultSelectedItems.length > 0 ? defaultSelectedItems : [defaultSelectedMultipleSelect]
	);
	const showCloseIcon = useMemo(() => {
		return selectedItem.length > 0 && !selectedItem.includes(defaultSelectedMultipleSelect);
	}, [selectedItem]);

	const triggerClassName = cn(
		"flex h-10 w-full items-center justify-between rounded-lg border border-gray-750 px-2.5",
		className
	);

	const containerRef = useRef<HTMLDivElement>(null);
	const [contentWidth, setContentWidth] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (defaultSelectedItems.length === 0) {
			onItemsSelected?.([defaultSelectedMultipleSelect]);
		}
	}, [defaultSelectedItems, onItemsSelected]);

	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setContentWidth(entry.contentRect.width);
			}
		});

		const currentContainerRef = containerRef.current;
		if (currentContainerRef) {
			resizeObserver.observe(currentContainerRef);
		}

		return () => {
			if (currentContainerRef) {
				resizeObserver.unobserve(currentContainerRef);
			}
		};
	}, []);

	const handleItemSelect = useCallback(
		({ id }: { id: string }) => {
			setSelectedItem((prevSelected) => {
				if (id === defaultSelectedMultipleSelect) {
					onItemsSelected?.([defaultSelectedMultipleSelect]);
					return [defaultSelectedMultipleSelect];
				}

				const isCurrentlySelected = prevSelected.includes(id);

				let newSelected = prevSelected.filter(
					(item) => item !== defaultSelectedMultipleSelect && (isCurrentlySelected ? item !== id : true)
				);
				if (!isCurrentlySelected) {
					newSelected.push(id);
				}
				if (newSelected.length === 0) {
					newSelected = [defaultSelectedMultipleSelect];
				}

				onItemsSelected?.(newSelected);
				return newSelected;
			});
		},
		[onItemsSelected]
	);

	const handleResetClick = useCallback(
		(event: React.MouseEvent<SVGElement, MouseEvent>) => {
			event.stopPropagation();
			setSelectedItem([defaultSelectedMultipleSelect]);
			onItemsSelected?.([defaultSelectedMultipleSelect]);
		},
		[onItemsSelected]
	);

	const selectedLabel = useMemo(() => {
		return selectedItem.map((id) => items.find((item) => item.id === id)?.label || id).join(", ");
	}, [selectedItem, items]);

	return (
		<div aria-controls="popover-list" aria-expanded="false" ref={containerRef} role="combobox">
			<Typography className="mb-1 select-none text-xs text-gray-500">{label}</Typography>
			<PopoverListWrapper animation="slideFromBottom" interactionType="click">
				<PopoverListTrigger aria-label={ariaLabel || label} className={triggerClassName}>
					<div className="flex h-10 w-full items-center justify-between rounded-lg px-2.5">
						<div className="select-none truncate text-base text-white">{selectedLabel}</div>
						<div className="shrink-0">
							{showCloseIcon ? (
								<Close
									className="size-4 cursor-pointer fill-gray-750 hover:fill-white"
									onClick={handleResetClick}
								/>
							) : (
								<ChevronDownIcon className="pointer-events-none size-4 fill-gray-750" />
							)}
						</div>
					</div>
				</PopoverListTrigger>
				<PopoverListContent
					className="flex w-full flex-col gap-0.5 rounded-lg border border-gray-750 bg-white p-1 pt-1.5 text-black"
					closeOnSelect={false}
					displaySearch={items.length > 6}
					emptyListMessage={emptyListMessage}
					itemClassName="cursor-pointer"
					items={[
						{
							id: defaultSelectedMultipleSelect,
							label: (
								<MultipleLabelPopoverItem
									isActiveItem={selectedItem.includes(defaultSelectedMultipleSelect)}
									name="All"
								/>
							),
						},
						...items.map((item) => ({
							...item,
							label: (
								<MultipleLabelPopoverItem
									count={item.count}
									icon={item.icon}
									isActiveItem={selectedItem.includes(item.id)}
									name={item.label}
								/>
							),
						})),
					]}
					maxItemsToShow={6}
					onItemSelect={handleItemSelect}
					style={{ width: contentWidth }}
				/>
			</PopoverListWrapper>
		</div>
	);
};
