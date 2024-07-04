import { ArrowLeft } from "@assets/image/icons";
import { Button, IconButton } from "@components/atoms";
import { TabFormHeaderProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const TabFormHeader = ({ className, form, isLoading, title }: TabFormHeaderProps) => {
	const { t } = useTranslation("buttons");
	const navigate = useNavigate();
	const baseStyle = cn("flex justify-between", className);

	return (
		<div className={baseStyle}>
			<div className="flex gap-1 items-center">
				<IconButton
					ariaLabel={t("ariaLabelReturnBack")}
					className="h-8 hover:bg-black p-0 w-8"
					onClick={() => navigate(-1)}
				>
					<ArrowLeft />
				</IconButton>

				<p className="text-base text-gray-300">{title}</p>
			</div>

			<div className="flex gap-6 items-center">
				<Button
					ariaLabel={t("cancel")}
					className="font-semibold hover:text-white p-0 text-gray-300"
					onClick={() => navigate(-1)}
				>
					{t("cancel")}
				</Button>

				<Button
					ariaLabel={t("save")}
					className="border-white font-semibold hover:bg-black px-4 py-2 text-white"
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
