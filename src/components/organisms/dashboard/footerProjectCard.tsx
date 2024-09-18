import React from "react";

import { DashboardFooterTemplateCardType } from "@src/types/components";

import { IconSvg, Typography } from "@components/atoms";

export const DashboardFooterProjectCard = ({ card }: { card: DashboardFooterTemplateCardType }) => {
	return (
		<div className="rounded-md border-2 border-gray-1050 bg-gray-1100 px-5 pb-4 pt-6 font-averta">
			<div className="flex items-center gap-4">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-1">
					<IconSvg className="rounded-full" size="xl" src={card.icon} />
				</div>

				<Typography className="font-bold" element="h3" size="large">
					{card.title}
				</Typography>
			</div>

			<Typography className="mb-1 ml-14 mt-2" element="p">
				{card.description}
			</Typography>
		</div>
	);
};
