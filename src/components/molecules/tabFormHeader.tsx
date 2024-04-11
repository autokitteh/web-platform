import React from "react";
import { ArrowLeft } from "@assets/image/icons";
import { IconButton, Button } from "@components/atoms";
import { ITabFormHeader } from "@interfaces/components";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const TabFormHeader = ({ title, isLoading, form, className }: ITabFormHeader) => {
	const { t } = useTranslation("tabs");
	const navigate = useNavigate();
	const baseStyle = cn("flex justify-between", className);

	return (
		<div className={baseStyle}>
			<div className="flex items-center gap-1">
				<IconButton
					ariaLabel={t("ariaLabelReturnBack")}
					className="hover:bg-black p-0 w-8 h-8"
					onClick={() => navigate(-1)}
				>
					<ArrowLeft />
				</IconButton>
				<p className="text-gray-300 text-base">{title}</p>
			</div>
			<div className="flex items-center gap-6">
				<Button
					ariaLabel={t("cancel")}
					className="text-gray-300 hover:text-white p-0 font-semibold"
					onClick={() => navigate(-1)}
				>
					{t("cancel")}
				</Button>
				<Button
					ariaLabel={t("save")}
					className="px-4 py-2 font-semibold text-white border-white hover:bg-black"
					form={form}
					variant="outline"
				>
					{isLoading ? t("loading") + "..." : t("save")}
				</Button>
			</div>
		</div>
	);
};
