import { AnimatePresence, motion } from "motion/react";

import { sidebarAnimateVariant } from "../sidebar.types";
import { Project } from "@type/models";
import { cn } from "@utilities";

import { IconSvg, Tooltip } from "@components/atoms";
import { PopoverListContent, PopoverListTrigger, PopoverListWrapper } from "@components/molecules/popover";

import { ProjectsIcon } from "@assets/image";

interface MyProjectsPopoverProps {
	activeProjectId?: string;
	emptyListMessage: string;
	isOpen: boolean;
	label: string;
	onProjectSelect: (project: { id: string }) => void;
	projects: Project[];
}

export const MyProjectsPopover = ({
	activeProjectId,
	emptyListMessage,
	isOpen,
	label,
	onProjectSelect,
	projects,
}: MyProjectsPopoverProps) => {
	return (
		<PopoverListWrapper animation="slideFromLeft" interactionType="click">
			<PopoverListTrigger>
				<li className="group">
					<Tooltip content={label} hide={isOpen} position="right">
						<div className="relative z-10 flex w-full items-center justify-start gap-1.5 rounded-full p-0.5 text-gray-1100 group-hover:bg-green-200">
							<div className="flex size-9 items-center justify-center">
								<IconSvg alt={label} className="fill-gray-1100" size="xl" src={ProjectsIcon} />
							</div>

							<AnimatePresence>
								{isOpen ? (
									<motion.span
										animate="visible"
										className="overflow-hidden whitespace-nowrap"
										exit="hidden"
										initial="hidden"
										variants={sidebarAnimateVariant}
									>
										{label}
									</motion.span>
								) : null}
							</AnimatePresence>
						</div>
					</Tooltip>
				</li>
			</PopoverListTrigger>
			<PopoverListContent
				activeId={activeProjectId}
				className={cn(
					"scrollbar z-20 flex h-screen flex-col overflow-scroll pb-16 pt-[212px] text-black",
					"mr-2.5 w-auto border-x border-gray-500 bg-gray-250 px-2"
				)}
				emptyListMessage={emptyListMessage}
				itemClassName={cn(
					"hover:text-current flex cursor-pointer items-center gap-2.5 rounded-3xl p-2 transition",
					"whitespace-nowrap px-4 text-center text-gray-1100 duration-300 hover:bg-green-200",
					"overflow-hidden"
				)}
				items={projects.map(({ id, name }) => ({ id, label: name, value: id }))}
				onItemSelect={onProjectSelect}
			/>
		</PopoverListWrapper>
	);
};
