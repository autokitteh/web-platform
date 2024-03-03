import React from "react";
import { FullScreen, More } from "@assets/image";
import { Button, IconButton, IconSvg } from "@components/atoms";
import { DropdownButton } from "@components/molecules";
import { topbarItems } from "@constants";
import { ITopbar } from "@interfaces/components";
import { useUIGlobalStore } from "@store";
import { cn } from "@utilities";

export const Topbar = ({ name, version }: ITopbar) => {
	const { isFullScreen, toggleFullScreen } = useUIGlobalStore();
	const styleIconSreen = cn({ "border-transparent bg-black": isFullScreen });

	return (
		<div className="flex justify-between items-center bg-gray-700 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
			<div className="flex items-end gap-3">
				<span className="font-semibold text-2xl leading-6">{name}</span>
				<span className="font-semibold text-gray-300 leading-none">{version}</span>
			</div>
			<div className="flex items-stretch gap-3">
				{topbarItems.map(({ id, name, href, icon, disabled }) => (
					<Button
						className="px-4 py-2 font-semibold text-white"
						disabled={disabled}
						href={href}
						key={id}
						variant="outline"
					>
						<IconSvg className="max-w-5" disabled={disabled} src={icon} />
						{name}
					</Button>
				))}
				<DropdownButton
					className="font-semibold text-white"
					contentMenu={
						<div className="flex flex-col gap-2">
							{topbarItems.map(({ id, name, href, icon, disabled }) => (
								<Button
									className="px-4 py-1.5 font-semibold text-white"
									disabled={disabled}
									href={href}
									key={id}
									variant="outline"
								>
									<IconSvg className="w-4" disabled={disabled} src={icon} />
									{name}
								</Button>
							))}
						</div>
					}
				>
					<Button className="h-full text-white px-4" variant="outline">
						<More />
						More
					</Button>
				</DropdownButton>
				<IconButton className={styleIconSreen} onClick={toggleFullScreen} variant="outline">
					<FullScreen />
				</IconButton>
			</div>
		</div>
	);
};
