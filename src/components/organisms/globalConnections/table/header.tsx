import React, { memo } from "react";

import { useTranslation } from "react-i18next";

import { THead, Th, Tr } from "@components/atoms";

export const ConnectionsTableHeader = memo(() => {
	const { t } = useTranslation("connections", { keyPrefix: "table.columns" });

	return (
		<THead>
			<Tr>
				<Th className="w-12 min-w-12 pl-4" />
				<Th className="w-1/4 min-w-32">{t("name")}</Th>
				<Th className="w-1/4 min-w-32">{t("integration")}</Th>
				<Th className="w-1/4 min-w-32">{t("status")}</Th>
				<Th className="w-1/5 min-w-20">{t("actions")}</Th>
			</Tr>
		</THead>
	);
});

ConnectionsTableHeader.displayName = "ConnectionsTableHeader";
