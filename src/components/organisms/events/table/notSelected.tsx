import React, { memo } from "react";

import { useTranslation } from "react-i18next";

import { Frame } from "@components/atoms";

import { CatImage } from "@assets/image";

export const NoEventsSelected = memo(() => {
	const { t } = useTranslation("events");

	return (
		<Frame className="w-full rounded-none bg-gray-1100 pt-20 transition">
			<div className="mt-20 flex flex-col items-center">
				<p className="mb-8 text-lg font-bold text-gray-750">{t("history.noEventSelected")}</p>
				<CatImage className="border-b border-gray-750 fill-gray-750" />
			</div>
		</Frame>
	);
});

NoEventsSelected.displayName = "NoEventsSelected";
