import React, { memo } from "react";

import { useTranslation } from "react-i18next";

import { THead, Th, Tr } from "@components/atoms";

export const ConnectionsTableHeader = memo(() => {
	const { t } = useTranslation("connections", { keyPrefix: "table.columns" });

	return (
		<THead>
			<Tr>
				<Th className="w-1/2 min-w-32 pl-4">{t("name")}</Th>
				<Th className="w-1/4 min-w-32 justify-center">{t("status")}</Th>
				<Th className="w-1/5 min-w-20 justify-center">{t("actions")}</Th>
			</Tr>
		</THead>
	);
});

ConnectionsTableHeader.displayName = "ConnectionsTableHeader";
