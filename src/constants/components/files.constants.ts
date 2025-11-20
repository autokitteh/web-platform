import { cn } from "@utilities/cn.utils";

export const fileNodeClasses = {
	button: cn("group -ml-3 flex w-full items-center rounded-none py-1 transition-all duration-200"),
	buttonHovered: (isHovered: boolean) =>
		cn({
			"bg-gray-1100 text-gray-200": isHovered,
			"text-gray-400 hover:text-gray-200": !isHovered,
		}),
	buttonSelected: cn("bg-gray-1100"),
	nameContainer: cn("flex min-w-0 flex-1 cursor-pointer items-center gap-2"),
	caretPlaceholder: cn("size-4 shrink-0"),
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
		cn("size-4 shrink-0", {
			"stroke-green-800": isActive,
			"text-gray-400": !isActive,
		}),
	nameText: (isActive: boolean, isEditing: boolean) =>
		cn("w-full min-w-0 flex-1 truncate text-start text-sm", {
			"text-white": isActive || isEditing,
			"text-gray-400": !isActive && !isEditing,
		}),
	editInput: cn(
		"w-full rounded border border-green-800 bg-gray-1100 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-800"
	),
	validationError: cn("text-xs text-error"),
	actionsContainer: cn(
		"absolute right-2 top-1/2 flex -translate-y-1/2 flex-row gap-1 opacity-0 transition-all group-hover:bg-gray-1250 group-hover:opacity-100"
	),
	actionButton: cn("flex size-6 shrink-0 cursor-pointer items-center justify-center transition-colors"),
	editIcon: cn("size-4 fill-gray-400 hover:fill-green-800"),
	deleteIcon: cn("size-4 fill-gray-400 hover:fill-error"),
};

export const fileTreeClasses = {
	container: cn("flex py-2"),
	dropdown: cn("w-full justify-start text-left hover:bg-gray-1250"),
	createButton: cn("w-full justify-start text-left hover:bg-gray-1250"),
	importLabel: cn("group flex w-full cursor-pointer items-center gap-2 !p-0"),
	uploadIcon: cn("size-4 stroke-green-800 stroke-[4] transition-all"),
	importText: cn("text-sm text-green-800"),
	emptyStateContainer: cn("-ml-0.5 mt-1.5 flex gap-1.5"),
	emptyStateText: cn("text-sm text-gray-300"),
	mainButton: cn("group mr-4 !p-0 hover:bg-transparent hover:font-semibold"),
	createIcon: cn("size-4 stroke-green-800 stroke-[2] transition-all group-hover:stroke-[3]"),
	createText: cn("-ml-1 text-sm text-green-800 hover:underline"),
	importButton: cn("pl-1 text-sm text-green-800 hover:underline"),
	searchContainer: cn("mb-3"),
	searchInput: cn(
		"w-full rounded-lg border border-gray-800 bg-gray-1100 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-green-800 focus:outline-none"
	),
	keyboardHint: cn("mt-2 text-xs text-gray-600"),
};

export const FILE_TREE_TIMING = {
	NODE_OPEN_DELAY_MS: 50,
	REVEAL_SCROLL_DELAY_MS: 50,
	SEARCH_DEBOUNCE_MS: 300,
} as const;
