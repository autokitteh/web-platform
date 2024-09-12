import React, { useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { RefreshButtonProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

import { IconButton, IconSvg } from "@components/atoms";

import { RotateIcon } from "@assets/image/icons";

export const RefreshButton = ({ onRefresh }: RefreshButtonProps) => {
	const { t } = useTranslation("buttons");
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefreshClick = async () => {
		setIsRefreshing(true);
		try {
			await onRefresh();
		} finally {
			setTimeout(() => {
				setIsRefreshing(false);
			}, 600);
		}
	};

	const rotateIconClass = useMemo(
		() =>
			cn("animate-spin fill-white transition group-hover:fill-green-800", {
				"animation-running": isRefreshing,
				"animation-paused": !isRefreshing,
			}),
		[isRefreshing]
	);

	return (
		<IconButton
			className="group h-[2.125rem] w-[2.125rem] rounded-md bg-gray-1050 hover:bg-gray-1250"
			disabled={isRefreshing}
			onClick={handleRefreshClick}
			title={t("refresh")}
		>
			<IconSvg className={rotateIconClass} size="md" src={RotateIcon} />
		</IconButton>
	);
};
