import React from "react";
import { Button, Icon } from "@components/atoms";
import { IMenu } from "@components/molecules/menu";
import { cn, menuItems } from "@utils";

export const Menu = ({ className, isOpen = false, onSubmenu }: IMenu) => {
	const handleMouseEnter = (
		submenu:
			| {
					id: number;
					name: string;
					href: string;
			  }[]
			| undefined,
		e: React.MouseEvent
	) => {
		onSubmenu?.({ submenu: submenu || null, top: e.currentTarget.getBoundingClientRect().top + 5 });
	};

	return (
		<div className={cn(className, "grid gap-4")}>
			{menuItems.map(({ icon, name, href, submenu, id }) => (
				<div key={id} onMouseEnter={(e) => handleMouseEnter(submenu, e)}>
					<Button className="hover:bg-green-light" href={href}>
						<Icon alt={name} className="w-8 h-8 p-1 " src={icon} />
						{isOpen ? name : null}
					</Button>
				</div>
			))}
		</div>
	);
};
