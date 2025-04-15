import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { RefreshButtonProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

import { IconButton, IconSvg } from "@components/atoms";

import { RotateIcon } from "@assets/image/icons";

export const RefreshButton = ({ disabled, isLoading, onRefresh, id }: RefreshButtonProps) => {
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

	const iconButtonClass = useMemo(
		() =>
			cn("group size-7.5 rounded-full bg-gray-1050 p-1", {
				"hover:bg-gray-1250": !disabled,
				"hover:bg-gray-1050 ": disabled,
			}),
		[disabled]
	);

	const rotateIconClass = useMemo(
		() =>
			cn("animate-spin fill-gray-500 transition", {
				"animation-running": isSpinning,
				"animation-paused": !isSpinning,
				"group-hover:fill-green-800": !disabled,
			}),
		[isSpinning, disabled]
	);

	return (
		<div id={id}>
			<IconButton
				ariaLabel={t("refresh")}
				className={iconButtonClass}
				disabled={isSpinning || disabled}
				onClick={handleRefreshClick}
				title={t("refresh")}
			>
				<IconSvg className={rotateIconClass} size="md" src={RotateIcon} />
			</IconButton>
		</div>
	);
};
