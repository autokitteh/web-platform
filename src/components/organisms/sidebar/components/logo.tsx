import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";

import { sidebarAnimateVariant } from "./sidebar.types";

import { Button } from "@components/atoms";

import { IconLogo, IconLogoName } from "@assets/image";

interface SidebarLogoProps {
	isMobile: boolean;
	isOpen: boolean;
	showName?: boolean;
}

export const SidebarLogo = ({ isMobile, isOpen, showName = true }: SidebarLogoProps) => {
	const navigate = useNavigate();

	const handleLogoClick = () => {
		navigate("/");
	};

	if (isMobile && !isOpen) {
		return (
			<Button className="flex items-center gap-2 p-1" onClick={handleLogoClick} variant="ghost">
				<IconLogo className="size-7" />
			</Button>
		);
	}

	if (isMobile && isOpen) {
		return (
			<Button className="flex items-center gap-2.5 p-0" onClick={handleLogoClick} variant="ghost">
				<IconLogo className="size-8" />
				{showName ? <IconLogoName className="h-4 w-24" /> : null}
			</Button>
		);
	}

	return (
		<Button className="ml-1 flex items-center justify-start gap-2.5" onClick={handleLogoClick} variant="ghost">
			<IconLogo className="size-8" />
			<AnimatePresence>
				{isOpen ? (
					<motion.span
						animate="visible"
						className="overflow-hidden whitespace-nowrap"
						exit="hidden"
						initial="hidden"
						variants={sidebarAnimateVariant}
					>
						<IconLogoName className="h-3 w-20" />
					</motion.span>
				) : null}
			</AnimatePresence>
		</Button>
	);
};
