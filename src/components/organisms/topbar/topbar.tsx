import React from "react";
import FullScreenI from "@assets/topbar/FullScreen.svg?react";
import More from "@assets/topbar/More.svg?react";
import { Button, IconButton, Icon } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import { topbarItems } from "@utils";

interface ITopbar {
	name: string;
	version: string;
}

export const Topbar = ({ name, version }: ITopbar) => {
	return (
		<div className="flex justify-between items-center bg-gray-700 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
			<div className="flex items-end gap-3">
				<span className="font-semibold text-2xl leading-6">{name}</span>
				<span className="font-semibold text-sm text-gray-300 leading-none">{version}</span>
			</div>
			<div className="flex items-center gap-3">
				{topbarItems.map(({ id, name, href, icon, disabled }) => (
					<Button
						className="px-4 py-2.5"
						color="white"
						disabled={disabled}
						fontWeight={600}
						href={href}
						key={id}
						variant="outline"
					>
						<Icon disabled={disabled} src={icon} />
						{name}
					</Button>
				))}
				<DropdownButton
					className="px-4 py-2.5"
					color="white"
					fontWeight={600}
					iconLeft={More}
					name="More"
					variant="outline"
				>
					<div className="grid gap-2">
						{topbarItems.map(({ id, name, href, icon, disabled }) => (
							<Button
								className="px-4 py-1.5"
								color="white"
								disabled={disabled}
								fontWeight={600}
								href={href}
								key={id}
								variant="outline"
							>
								<Icon disabled={disabled} src={icon} />
								{name}
							</Button>
						))}
					</div>
				</DropdownButton>
				<IconButton icon={FullScreenI} variant="outline" />
			</div>
		</div>
	);
};
