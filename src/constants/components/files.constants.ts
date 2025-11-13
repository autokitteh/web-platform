import { cn } from "@utilities/cn.utils";

export const fileNodeClasses = {
	button: cn("group flex w-full items-center justify-between rounded-lg px-3 py-0 transition-all duration-200"),
	buttonHovered: (isHovered: boolean) =>
		cn({
			"bg-gray-1100 text-gray-200": isHovered,
			"text-gray-400 hover:text-gray-200": !isHovered,
		}),
	nameContainer: cn("flex min-w-0 flex-1"),
	chevronIcon: (isOpen: boolean, isActive: boolean) =>
		cn(
			"size-4 shrink-0 transition-transform duration-200",
			{ "rotate-0": isOpen, "-rotate-90": !isOpen },
			{
				"fill-green-800": isActive,
				"fill-gray-400 group-hover:fill-green-800": !isActive,
			}
		),
	folderIcon: (isActive: boolean) =>
		cn("size-4 shrink-0", {
			"fill-green-800": isActive,
			"fill-green-500 group-hover:fill-green-800": !isActive,
		}),
	fileIcon: (isActive: boolean) =>
		cn("mr-2 size-4 shrink-0", {
			"stroke-green-800": isActive,
			"text-gray-400": !isActive,
		}),
	nameText: (isActive: boolean) =>
		cn("text-sm", {
			"text-white": isActive,
			"text-gray-400": !isActive,
		}),
	actionsContainer: cn("flex gap-1 opacity-0 transition-all group-hover:opacity-100"),
	actionButton: cn("flex size-6 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-gray-1250"),
	editIcon: cn("size-4 fill-gray-400 hover:fill-blue-500"),
	deleteIcon: cn("size-4 stroke-gray-400 hover:stroke-red-500"),
};

export const fileTreeClasses = {
	container: cn("flex py-2"),
	dropdown: cn("group mr-4 !p-0 hover:bg-transparent hover:font-semibold"),
	createButton: cn("group mr-4 !p-0 hover:bg-transparent hover:font-semibold"),
	importLabel: cn("group flex cursor-pointer !p-0 hover:bg-transparent hover:font-semibold"),
	uploadIcon: cn("size-4 stroke-green-800 stroke-[4] transition-all group-hover:stroke-[5]"),
	importText: cn("ml-1 text-sm text-green-800 hover:underline"),
	emptyStateContainer: cn("-ml-0.5 mt-1.5 flex gap-1.5"),
	emptyStateText: cn("text-sm text-gray-300"),
	mainButton: cn("group mr-4 !p-0 hover:bg-transparent hover:font-semibold"),
	createIcon: cn("size-4 stroke-green-800 stroke-[2] transition-all group-hover:stroke-[3]"),
	createText: cn("-ml-1 text-sm text-green-800 hover:underline"),
};
