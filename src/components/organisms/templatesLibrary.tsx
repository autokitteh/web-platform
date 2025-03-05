// src/components/organisms/templates/templatesLibrary.tsx
import React from "react";

import { useTranslation } from "react-i18next";

import { TemplatesLibraryView } from "./libraryView";

import { Frame, IconSvg, Typography } from "@components/atoms";

import { StartTemplateIcon } from "@assets/image/icons";

export const TemplatesLibrary = () => {
	const { t } = useTranslation("templates", { keyPrefix: "library" });

	return (
		<Frame className="h-full bg-gray-1100">
			<div className="mb-6 flex items-center justify-between">
				<Typography
					className="flex select-none items-center gap-3 font-averta text-3xl font-semibold"
					element="h1"
				>
					<IconSvg className="size-6 stroke-white" src={StartTemplateIcon} />
					{t("title", "Templates Library")}
				</Typography>

				<div className="flex gap-4">
					<input
						className="rounded-full border border-gray-800 bg-gray-900 px-4 py-2 text-white placeholder:text-gray-500 focus:border-green-800 focus:outline-none"
						placeholder="Search templates..."
						type="text"
					/>
				</div>
			</div>

			<TemplatesLibraryView />
		</Frame>
	);
};
