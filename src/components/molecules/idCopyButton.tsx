import React from "react";

import { useTranslation } from "react-i18next";

import { CopyButton } from "@components/molecules/copyButton";

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

	const successMessage = t("copied");
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
