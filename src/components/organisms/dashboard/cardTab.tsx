import React from "react";

import { CommunityProjectCard } from "@type/components";

import { IconSvg, Status } from "@components/atoms";

import { IconLogo } from "@assets/image";
import { MenuCircleIcon } from "@assets/image/icons";

export const Card = ({ card, category }: { card: CommunityProjectCard; category: string }) => {
	return (
		<div className="border-gray-50 flex flex-col gap-4 rounded-md border border-black-300 bg-white px-5 pb-7 pt-4">
			<div className="flex items-center gap-1.5">
				<IconSvg size="3xl" src={MenuCircleIcon} />

				<div className="flex gap-1">
					{card.integrations.map((icon, index) => (
						<IconSvg key={index} size="2xl" src={icon} withCircle />
					))}
				</div>
			</div>

			<div className="text-base">{card.description}</div>

			<div className="mt-auto flex items-center gap-4">
				<Status>{category}</Status>

				<div className="flex items-center gap-1">
					<IconSvg size="lg" src={IconLogo} />

					<span className="text-black-500">{card.akCounter}</span>
				</div>
			</div>
		</div>
	);
};
