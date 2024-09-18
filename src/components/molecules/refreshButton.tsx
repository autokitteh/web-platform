import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { RefreshButtonProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

import { IconButton, IconSvg } from "@components/atoms";

import { RotateIcon } from "@assets/image/icons";

export const RefreshButton = ({ isLoading, onRefresh }: RefreshButtonProps) => {
	const { t } = useTranslation("buttons");
	const [isSpinning, setIsSpinning] = useState(false);
	const [spinStartTime, setSpinStartTime] = useState<number | null>(null);

	useEffect(() => {
		if (isLoading && !isSpinning) {
			setIsSpinning(true);
			setSpinStartTime(Date.now());

			return;
		}

		if (!isLoading && isSpinning) {
			const elapsedTime = Date.now() - (spinStartTime || 0);
			const remainingTime = Math.max(0, 600 - elapsedTime);

			setTimeout(() => {
				setIsSpinning(false);
				setSpinStartTime(null);
			}, remainingTime);
		}
	}, [isLoading, isSpinning, spinStartTime]);

	const handleRefreshClick = () => {
		if (!isSpinning) {
			setIsSpinning(true);
			setSpinStartTime(Date.now());
			onRefresh();
		}
	};

	const rotateIconClass = useMemo(
		() =>
			cn("animate-spin fill-white transition group-hover:fill-green-800", {
				"animation-running": isSpinning,
				"animation-paused": !isSpinning,
			}),
		[isSpinning]
	);

	return (
		<IconButton
			className="group size-[2.125rem] rounded-md bg-gray-1050 hover:bg-gray-1250"
			disabled={isSpinning}
			onClick={handleRefreshClick}
			title={t("refresh")}
		>
			<IconSvg className={rotateIconClass} size="md" src={RotateIcon} />
		</IconButton>
	);
};
