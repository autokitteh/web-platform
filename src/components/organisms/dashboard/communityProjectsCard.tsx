import React from "react";

import { CommunityProjectCardType } from "@type/components";

import { IconSvg, Status } from "@components/atoms";

import { IconLogo } from "@assets/image";
import { MenuCircleIcon } from "@assets/image/icons";

export const CommunityProjectCard = ({ card, category }: { card: CommunityProjectCardType; category: string }) => {
	return (
		<div className="border-gray-50 flex flex-col gap-4 rounded-md border border-black-300 bg-white px-5 pb-7 pt-4">
			<div className="flex items-center gap-1.5">
				<IconSvg size="3xl" src={MenuCircleIcon} />

				<div className="flex gap-1">
					{card.integrations.map(({ icon, title }, index) => (
						<div key={index} title={title}>
							<IconSvg size="2xl" src={icon} withCircle />
						</div>
					))}
				</div>
			</div>

			<div className="text-base">{card.description}</div>

			<div className="mt-auto flex items-center gap-4">
				<Status>{category}</Status>

				<div className="flex items-center gap-1">
					<IconSvg size="lg" src={IconLogo} />

					<span className="text-black-500">{card.counter}</span>
				</div>
			</div>
		</div>
	);
};
