import React from "react";
import { ArrowLeft } from "@assets/image/icons";
import { IconButton, Button } from "@components/atoms";
import { TabFormHeaderProps } from "@interfaces/components";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const TabFormHeader = ({ title, isLoading, form, className }: TabFormHeaderProps) => {
	const { t } = useTranslation("buttons");
	const navigate = useNavigate();
	const baseStyle = cn("flex justify-between sticky -top-10 z-20 bg-gray-800 py-1 -mt-1", className);

	return (
		<div className={baseStyle}>
			<div className="flex items-center gap-1">
				<IconButton
					ariaLabel={t("ariaLabelReturnBack")}
					className="w-8 h-8 p-0 hover:bg-black"
					onClick={() => navigate(-1)}
				>
					<ArrowLeft />
				</IconButton>
				<p className="text-base text-gray-300">{title}</p>
			</div>
			<div className="flex items-center gap-6">
				<Button
					ariaLabel={t("cancel")}
					className="p-0 font-semibold text-gray-300 hover:text-white"
					onClick={() => navigate(-1)}
				>
					{t("cancel")}
				</Button>
				<Button
					ariaLabel={t("save")}
					className="px-4 py-2 font-semibold text-white border-white hover:bg-black"
					disabled={isLoading}
					form={form}
					type="submit"
					variant="outline"
				>
					{isLoading ? t("loading") + "..." : t("save")}
				</Button>
			</div>
		</div>
	);
};
