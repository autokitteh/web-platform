import React from "react";

import { useTranslation } from "react-i18next";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { ButtonVariant } from "@src/enums/components";
import { useToastStore } from "@src/store";

import { Button } from "@components/atoms";
import { CopyButton } from "@components/molecules/copyButton";

import { CopyIcon } from "@assets/image/icons";

export const IdCopyButton = ({
	displayFullLength,
	id,
	hideId,
}: {
	displayFullLength?: boolean;
	hideId?: boolean;
	id: string;
}) => {
	const { t } = useTranslation("components", { keyPrefix: "buttons" });
	const addToast = useToastStore((state) => state.addToast);

	const successMessage = t("copied");

	if (!id) {
		const noIdButtonClick = () => {
			LoggerService.error(namespaces.ui.idCopyButton, t("idCopyButtonNoId"));
			addToast({ message: t("idCopyButtonNoId"), type: "error" });
		};
		return (
			<Button onClick={noIdButtonClick} title={t("idCopyButtonNoId")} variant={ButtonVariant.flatText}>
				<CopyIcon className="size-3 fill-white" />
			</Button>
		);
	}

	const idPrefix = id.split("_")[0];
	const idSuffix = id.split("_")[1];
	const idSuffixEnd = idSuffix.substring(idSuffix.length - 3, idSuffix.length);
	const idStr = `${idPrefix}...${idSuffixEnd}`;

	return (
		<div className="flex flex-row items-center">
			{hideId ? null : (
				<div className="mr-1 flex cursor-pointer items-center gap-2.5 text-center text-white">
					{displayFullLength ? id : idStr}
				</div>
			)}
			<CopyButton className="mb-0.5 p-0" successMessage={successMessage} tabIndex={0} text={id} title={id} />
		</div>
	);
};
