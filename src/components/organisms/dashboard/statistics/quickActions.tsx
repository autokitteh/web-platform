import { HiOutlineMenu } from "react-icons/hi";

import { usePopoverListContext } from "@contexts";

import { Button } from "@components/atoms/buttons";
import { PopoverListContent, PopoverListTrigger, PopoverListWrapper } from "@components/molecules/popover";

const QuickActionsMenu = () => {
	const { close } = usePopoverListContext();

	const handleClick = () => {
		close();
	};

	return (
		<div className="flex min-w-48 flex-col gap-1 p-2">
			<Button
				className="w-full justify-start rounded-md px-3 py-2 text-sm text-white hover:bg-gray-1050"
				href="/"
				onClick={handleClick}
			>
				View All Projects
			</Button>
			<Button
				className="w-full justify-start rounded-md px-3 py-2 text-sm text-white hover:bg-gray-1050"
				href="/connections"
				onClick={handleClick}
			>
				Manage Connections
			</Button>
			<Button
				className="w-full justify-start rounded-md px-3 py-2 text-sm text-white hover:bg-gray-1050"
				href="/templates-library"
				onClick={handleClick}
			>
				Browse Templates
			</Button>
			<Button
				className="w-full justify-start rounded-md px-3 py-2 text-sm text-white hover:bg-gray-1050"
				href="/events"
				onClick={handleClick}
			>
				View All Events
			</Button>
		</div>
	);
};

export const QuickActions = () => (
	<PopoverListWrapper placement="bottom-end">
		<PopoverListTrigger>
			<Button
				aria-label="Quick actions menu"
				className="rounded-md border border-gray-750 p-2 hover:bg-gray-1050"
				variant="ghost"
			>
				<HiOutlineMenu className="size-5 text-white" />
			</Button>
		</PopoverListTrigger>
		<PopoverListContent className="rounded-lg border border-gray-750 bg-gray-1100">
			<QuickActionsMenu />
		</PopoverListContent>
	</PopoverListWrapper>
);
