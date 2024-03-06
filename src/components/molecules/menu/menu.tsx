import React from "react";
import { Button, Icon } from "@components/atoms";
import { IMenu, ISubmenuInfo } from "@interfaces/components";
import { useUiGlobalStore } from "@store";
import { cn } from "@utilities";

export const Menu = ({ className, isOpen = false, onSubmenu }: IMenu) => {
	const { menuItems } = useUiGlobalStore();
	const handleMouseEnter = (submenu: ISubmenuInfo["submenu"], e: React.MouseEvent) => {
		onSubmenu?.({ submenu: submenu || undefined, top: e.currentTarget.getBoundingClientRect().top + 5 });
	};

	return (
		<div className={cn(className, "flex flex-col gap-4")}>
			{menuItems.map(({ icon, name, href, submenu, id }) => (
				<div key={id} onMouseEnter={(e) => handleMouseEnter(submenu, e)}>
					<Button className="hover:bg-green-light" href={href}>
						{icon ? <Icon alt={name} className="w-8 h-8 p-1 " src={icon} /> : null}
						{isOpen ? name : null}
					</Button>
				</div>
			))}
		</div>
	);
};
