import React, { useMemo, useState, useEffect } from "react";

import { defaultSelectedMultipleSelect } from "@src/constants";
import { MultiplePopoverSelectProps } from "@src/interfaces/components";

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
}: MultiplePopoverSelectProps) => {
	const [selectedItem, setSelectedItem] = useState<string[]>(
		defaultSelectedItems.length > 0 ? defaultSelectedItems : [defaultSelectedMultipleSelect]
	);
	const [showCloseIcon, setShowCloseIcon] = useState(
		defaultSelectedItems.length > 0 && !defaultSelectedItems.includes(defaultSelectedMultipleSelect)
	);

	useEffect(() => {
		if (defaultSelectedItems.length === 0) {
			onItemsSelected?.([defaultSelectedMultipleSelect]);
		}
	}, [defaultSelectedItems, onItemsSelected]);

	const handleItemSelect = ({ id }: { id: string }) => {
		setSelectedItem((prevSelected) => {
			let newSelected;
			if (id === defaultSelectedMultipleSelect) {
				newSelected = [defaultSelectedMultipleSelect];
			} else if (prevSelected.includes(id)) {
				newSelected =
					prevSelected.length > 1
						? prevSelected.filter((item) => item !== id)
						: [defaultSelectedMultipleSelect];
			} else {
				newSelected = [...prevSelected.filter((item) => item !== defaultSelectedMultipleSelect), id];
			}

			onItemsSelected?.(newSelected);
			setShowCloseIcon(newSelected.length > 0 && !newSelected.includes(defaultSelectedMultipleSelect));
			return newSelected;
		});
	};

	const handleResetClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
		event.stopPropagation();
		setSelectedItem([defaultSelectedMultipleSelect]);
		setShowCloseIcon(false);
		onItemsSelected?.([defaultSelectedMultipleSelect]);
	};

	const selectedLabel = useMemo(() => selectedItem.join(", "), [selectedItem]);

	return (
		<div className="w-full">
			<Typography className="mb-1 text-xs text-gray-500">{label}</Typography>
			<PopoverListWrapper animation="slideFromBottom" interactionType="click">
				<PopoverListTrigger className="flex h-10 w-full max-w-96 items-center justify-between rounded-lg border border-gray-750 px-2.5">
					<div className="select-none truncate text-base text-white">{selectedLabel}</div>
					<div className="shrink-0">
						{showCloseIcon ? (
							<Close className="size-4 fill-gray-750" onClick={handleResetClick} />
						) : (
							<ChevronDownIcon className="size-4 fill-gray-750" />
						)}
					</div>
				</PopoverListTrigger>
				<PopoverListContent
					className="z-40 flex w-full max-w-96 flex-col gap-0.5 rounded-lg border border-gray-750 bg-white p-1 pt-1.5 text-black"
					closeOnSelect={false}
					displaySearch={items.length > 6}
					emptyListMessage={emptyListMessage}
					itemClassName="cursor-pointer"
					items={[
						{
							id: "All",
							label: (
								<MultipleLabelPopoverItem
									count={items.length}
									isActiveItem={selectedItem.includes("All")}
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
				/>
			</PopoverListWrapper>
		</div>
	);
};
