import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";

import { defaultPopoverSelect } from "@src/constants";
import { BasePopoverSelectProps } from "@src/interfaces/components";

import { Typography } from "@components/atoms";
import { PopoverListContent, PopoverListTrigger, PopoverListWrapper } from "@components/molecules/popover";
import { LabelSelectPopoverItem } from "@components/molecules/popoverSelect";

import { ChevronDownIcon, Close } from "@assets/image/icons";

export const BasePopoverSelect = ({
	label,
	items,
	emptyListMessage,
	defaultSelectedItems = [],
	onItemSelected,
	onItemsSelected,
	ariaLabel,
	multiple = false,
}: BasePopoverSelectProps) => {
	const [selectedItems, setSelectedItems] = useState<string[]>(defaultSelectedItems);
	const showCloseIcon = useMemo(() => {
		return selectedItems.length > 0 && !selectedItems.includes(defaultPopoverSelect);
	}, [selectedItems]);

	const containerRef = useRef<HTMLDivElement>(null);
	const [contentWidth, setContentWidth] = useState<number | undefined>(undefined);

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

	const handleAllItemSelect = useCallback(() => {
		multiple ? onItemsSelected?.([defaultPopoverSelect]) : onItemSelected?.(defaultPopoverSelect);
		return [defaultPopoverSelect];
	}, [multiple, onItemSelected, onItemsSelected]);

	const handleSingleItemSelect = useCallback(
		(id: string, prevSelected: string[]) => {
			if (id === defaultPopoverSelect) {
				return prevSelected;
			}
			const newSelected = id === prevSelected[0] ? [defaultPopoverSelect] : [id];
			onItemSelected?.(newSelected[0]);
			return newSelected;
		},
		[onItemSelected]
	);

	const handleMultipleItemSelect = useCallback(
		(id: string, prevSelected: string[]) => {
			const isCurrentlySelected = prevSelected.includes(id);
			let newSelected = prevSelected.filter((item) => item !== defaultPopoverSelect);
			newSelected = isCurrentlySelected ? newSelected.filter((itemId) => itemId !== id) : [...newSelected, id];

			if (newSelected.length === 0) {
				newSelected = [defaultPopoverSelect];
			}

			onItemsSelected?.(newSelected);
			return newSelected;
		},
		[onItemsSelected]
	);

	const handleItemSelect = useCallback(
		({ id }: { id: string }) => {
			setSelectedItems((prevSelected) => {
				if (id === defaultPopoverSelect && !prevSelected.includes(defaultPopoverSelect)) {
					return handleAllItemSelect();
				}

				if (!multiple) {
					return handleSingleItemSelect(id, prevSelected);
				}

				return handleMultipleItemSelect(id, prevSelected);
			});
		},
		[handleAllItemSelect, handleSingleItemSelect, handleMultipleItemSelect, multiple]
	);

	const handleResetClick = useCallback(
		(event: React.MouseEvent<SVGElement, MouseEvent>) => {
			event.stopPropagation();
			setSelectedItems([defaultPopoverSelect]);

			if (multiple) {
				onItemsSelected?.([defaultPopoverSelect]);
				return;
			}

			onItemSelected?.(defaultPopoverSelect);
		},
		[onItemSelected, onItemsSelected, multiple]
	);

	const selectedLabel = useMemo(() => {
		return selectedItems.map((id) => items.find((item) => item.id === id)?.label || id).join(", ");
	}, [selectedItems, items]);

	const allItems = useMemo(
		() => [
			{
				id: defaultPopoverSelect,
				label: (
					<LabelSelectPopoverItem
						isActiveItem={selectedItems.includes(defaultPopoverSelect)}
						name="All"
						showCheckbox={false}
					/>
				),
			},
			...items.map((item) => ({
				...item,
				label: (
					<LabelSelectPopoverItem
						count={item.count}
						icon={item.icon}
						isActiveItem={selectedItems.includes(item.id)}
						name={item.label}
						showCheckbox={multiple}
					/>
				),
			})),
		],
		[items, selectedItems, multiple]
	);

	return (
		<div aria-controls="popover-list" aria-expanded="false" ref={containerRef} role="combobox">
			<Typography className="mb-1 select-none text-xs text-gray-500">{label}</Typography>
			<PopoverListWrapper animation="slideFromBottom" interactionType="click">
				<PopoverListTrigger
					aria-label={ariaLabel || label}
					className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-750 px-2.5"
				>
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
				</PopoverListTrigger>
				<PopoverListContent
					className="z-40 flex w-full flex-col gap-0.5 rounded-lg border border-gray-750 bg-white p-1 pt-1.5 text-black"
					closeOnSelect={!multiple}
					displaySearch={items.length > 6}
					emptyListMessage={emptyListMessage}
					itemClassName="cursor-pointer"
					items={allItems}
					maxItemsToShow={6}
					onItemSelect={handleItemSelect}
					style={{ width: contentWidth }}
				/>
			</PopoverListWrapper>
		</div>
	);
};
