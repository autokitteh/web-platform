import React from "react";

import { Trans, useTranslation } from "react-i18next";

import { Typography, IconSvg } from "@components/atoms";

import { GearIcon } from "@assets/image/icons";

export const SendGmailMsg = () => {
	const { t } = useTranslation("tour");
	return (
		<div className="flex w-full flex-col gap-6">
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<Typography className="font-semibold text-white" element="h4" size="xl">
						You are ready to run your first Gmail automation!
					</Typography>
					<Typography className="mt-1 text-gray-300" element="p" size="small">
						To initiate your first automation, send a Gmail message through your configured integration.
						This demonstrates how autokitteh can interact with external services automatically.
					</Typography>
				</div>
			</div>
		</div>
	);
};
