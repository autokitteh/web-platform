import { AnimatePresence, motion } from "motion/react";

import { sidebarAnimateVariant } from "../sidebar.types";

import { Button, IconSvg, Tooltip } from "@components/atoms";

import { NewProject } from "@assets/image";

interface NewProjectButtonProps {
	isOpen: boolean;
	label: string;
	onClick: () => void;
}

export const NewProjectButton = ({ isOpen, label, onClick }: NewProjectButtonProps) => {
	return (
		<li>
			<Tooltip content={label} hide={isOpen} position="right">
				<Button
					ariaLabel={label}
					className="w-full gap-1.5 p-0.5 hover:bg-green-200 disabled:opacity-100"
					onClick={onClick}
				>
					<div className="flex size-9 items-center justify-center">
						<IconSvg alt={label} size="xl" src={NewProject} />
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
				</Button>
			</Tooltip>
		</li>
	);
};
