import React from "react";

import { useTranslation } from "react-i18next";

import { getShortId } from "@src/utilities";

export const FilterSessionsByEntityPopoverItem = ({
	entityId,
	totalSessions,
	translationKey,
}: {
	entityId: string;
	totalSessions: number;
	translationKey: string;
}) => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });

	return (
		<div className="flex w-full flex-row justify-between">
			<div>
				{t(translationKey, {
					deploymentId: getShortId(entityId, 7),
				})}
			</div>
			<div className="ml-2">({totalSessions})</div>
		</div>
	);
};
