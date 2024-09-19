/* eslint-disable prettier/prettier */
import React from "react";

import { useTranslation } from "react-i18next";

import { LoggerLevel } from "@enums";
import { OutputTabsVariants } from "@enums/components";

import { useLoggerStore } from "@store";

import { Button, IconSvg, Tab } from "@components/atoms";

import { TrashCanIcon } from "@assets/image/icons";

export const OutputTabs = () => {
	const { clearLogs, logs } = useLoggerStore((state) => state);
	const { t } = useTranslation("projects", { keyPrefix: "outputLog" });

	const ouputTextStyle = {
		[LoggerLevel.debug]: "",
		[LoggerLevel.error]: "text-error-200",
		[LoggerLevel.info]: "",
		[LoggerLevel.log]: "",
		[LoggerLevel.warn]: "text-yellow-500",
	} as const;

	return (
		<div className="flex h-full flex-col pb-3">
			<div
				className={
					`static top-4 flex h-8 select-none items-center gap-1 uppercase xl:gap-2 2xl:gap-4 3xl:gap-5 ` +
					`scrollbar overflow-x-auto overflow-y-hidden whitespace-nowrap`
				}
			>
				<Tab activeTab={OutputTabsVariants.output} value={OutputTabsVariants.output}>
					output
				</Tab>

				<Button className="ml-auto" onClick={() => clearLogs()} title={t("clear")}>
					<IconSvg className="fill-white" src={TrashCanIcon} />
				</Button>
			</div>

			<div className="scrollbar h-48 flex-auto overflow-auto pt-5">
				{logs.map(({ id, message, status, timestamp }) => (
					<div className="mb-4" key={id}>
						<p className="font-medium text-gray-250">{timestamp}</p>

						<p className={ouputTextStyle[status]}>{message}</p>
					</div>
				))}
			</div>
		</div>
	);
};
