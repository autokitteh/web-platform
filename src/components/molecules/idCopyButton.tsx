import React from "react";

import { useTranslation } from "react-i18next";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { ButtonVariant } from "@src/enums/components";
import { useToastStore } from "@src/store";
import { getShortId } from "@src/utilities";

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

	return (
		<div className="flex flex-row items-center">
			{hideId ? null : (
				<div className="mr-1 flex cursor-pointer items-center gap-2.5 text-center text-white">
					{displayFullLength ? id : getShortId(id, 3)}
				</div>
			)}
			<CopyButton className="mb-0.5 p-0" successMessage={successMessage} tabIndex={0} text={id} title={id} />
		</div>
	);
};
