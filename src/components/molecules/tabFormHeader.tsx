import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { TabFormHeaderProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Button, IconButton } from "@components/atoms";

import { ArrowLeft, Close } from "@assets/image/icons";

export const TabFormHeader = ({
	className,
	customBackRoute,
	form,
	isHiddenButtons,
	isSaveButtonHidden,
	isLoading,
	title,
	hideTitle = false,
	onBack,
	onCancel,
	hideBackButton,
	hideXbutton = true,
}: TabFormHeaderProps) => {
	const { t } = useTranslation("buttons");
	const navigate = useNavigate();
	const baseStyle = cn("flex justify-between py-2.5", className);
	const navigateBack = onBack || (customBackRoute ? () => navigate(customBackRoute) : () => navigate(-1));
	const handleCancel = onCancel || navigateBack;

	return (
		<div className="sticky -top-10 z-20 -my-2.5">
			<div className={baseStyle}>
				{hideTitle ? null : (
					<div className="flex items-center gap-1">
						{hideBackButton ? null : (
							<IconButton
								ariaLabel={t("ariaLabelReturnBack")}
								className="size-8 p-0 hover:bg-black"
								onClick={navigateBack}
							>
								<ArrowLeft />
							</IconButton>
						)}
						<p className="text-base text-gray-500">{title}</p>
					</div>
				)}

				{hideXbutton ? null : (
					<IconButton
						aria-label={`Close ${title}`}
						className="group h-default-icon w-default-icon bg-gray-700 p-0"
						onClick={onBack}
					>
						<Close className="size-3 fill-white" />
					</IconButton>
				)}

				{!isHiddenButtons ? (
					<div className="flex items-center gap-6">
						<Button
							ariaLabel={t("cancel")}
							className="p-0 font-semibold text-gray-500 hover:text-white"
							onClick={handleCancel}
						>
							{t("cancel")}
						</Button>

						{!isSaveButtonHidden ? (
							<Button
								ariaLabel={t("save")}
								className="border-white px-4 py-2 font-semibold text-white hover:bg-black"
								disabled={isLoading}
								form={form}
								type="submit"
								variant="outline"
							>
								{isLoading ? t("loading") + "..." : t("save")}
							</Button>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
};
