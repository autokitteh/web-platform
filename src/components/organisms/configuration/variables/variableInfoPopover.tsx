import React from "react";

import { useTranslation } from "react-i18next";

import { VariableItem } from "@interfaces/components";

import { IconSvg } from "@components/atoms";

import { EnvIcon, LockSolid } from "@assets/image/icons";

interface VariableInfoPopoverProps {
	item: VariableItem;
}

export const VariableInfoPopover = React.memo(({ item }: VariableInfoPopoverProps) => {
	const { t } = useTranslation("tabs", { keyPrefix: "variables.infoPopover" });
	const { t: tTable } = useTranslation("tabs", { keyPrefix: "variables.table" });

	return (
		<div className="text-white">
			<div className="mb-2 flex w-full">
				<div className="flex w-64 font-semibold">
					<IconSvg className="mr-2" src={EnvIcon} />
					{t("info")}
				</div>
			</div>

			{item.description ? (
				<dl className="flex items-start gap-x-1">
					<dt className="font-semibold">{t("description")}:</dt>
					<dd data-testid="variable-description">{item.description}</dd>
				</dl>
			) : null}

			{item.varValue ? (
				<dl className="flex items-start gap-x-1">
					<dt className="font-semibold">{t("value")}:</dt>
					<dd data-testid="variable-value">
						{!item.isSecret ? (
							<code>{item.varValue}</code>
						) : (
							<div className="flex items-center gap-x-1">
								<LockSolid className="size-3 fill-white" />
								<span>**********</span>
							</div>
						)}
					</dd>
				</dl>
			) : (
				<div className="flex items-center gap-2">
					<span className="text-xs text-yellow-500">{tTable("noValue")}</span>
				</div>
			)}
		</div>
	);
});

VariableInfoPopover.displayName = "VariableInfoPopover";
