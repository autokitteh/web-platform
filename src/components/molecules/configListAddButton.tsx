import { Button } from "@components/atoms/buttons/button";

import { CirclePlusIcon } from "@assets/image/icons";

export const AddButton = ({
	addButtonLabel,
	isLoading,
	onAdd,
	title,
}: {
	addButtonLabel: string;
	isLoading?: boolean;
	onAdd: () => void;
	title: string;
}) => {
	return (
		<Button
			ariaLabel={`Add ${title}`}
			className="group z-above-drawer-overlay flex items-center gap-2 !p-0 hover:bg-transparent hover:font-semibold"
			disabled={isLoading}
			onClick={onAdd}
		>
			<CirclePlusIcon className="size-4 stroke-green-800 stroke-[2] transition-all group-hover:stroke-[2]" />
			<span className="text-sm text-green-800">{addButtonLabel}</span>
		</Button>
	);
};
