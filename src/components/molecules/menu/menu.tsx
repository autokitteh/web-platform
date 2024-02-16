import React from "react";
import { Button, IconSvg } from "@components/atoms";
import { menuItems } from "@constants";
import { IMenu, ISubmenuInfo } from "@interfaces/components";
import { cn } from "@utilities";

export const Menu = ({ className, isOpen = false, onSubmenu }: IMenu) => {
	const handleMouseEnter = (submenu: ISubmenuInfo["submenu"], e: React.MouseEvent) => {
		onSubmenu?.({ submenu: submenu || undefined, top: e.currentTarget.getBoundingClientRect().top + 5 });
	};

	return (
		<div className={cn(className, "flex flex-col gap-4")}>
			{menuItems.map(({ icon, name, href, submenu, id }) => (
				<div key={id} onMouseEnter={(e) => handleMouseEnter(submenu, e)}>
					<Button className="hover:bg-green-light" href={href}>
						<IconSvg alt={name} className="w-8 h-8 p-1 " src={icon} />
						{isOpen ? name : null}
					</Button>
				</div>
			))}
		</div>
	);
};
