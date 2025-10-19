import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { TabFormHeaderProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Button } from "@components/atoms";

export const TabFormHeader = ({
	className,
	customBackRoute,
	form,
	isHiddenButtons,
	isSaveButtonHidden,
	isLoading,
	title,
}: TabFormHeaderProps) => {
	const { t } = useTranslation("buttons");
	const navigate = useNavigate();
	const baseStyle = cn("flex justify-between bg-gray-1100 py-2.5", className);
	const navigateBack = customBackRoute ? () => navigate(customBackRoute) : () => navigate(-1);

	return (
		<div className="sticky -top-10 z-20 -my-2.5">
			<div className={baseStyle}>
				<div className="flex items-center gap-1">
					{/* <IconButton
						ariaLabel={t("ariaLabelReturnBack")}
						className="size-8 p-0 hover:bg-black"
						onClick={navigateBack}
					>
						<ArrowLeft />
					</IconButton> */}

					<p className="text-base text-gray-500">{title}</p>
				</div>

				{!isHiddenButtons ? (
					<div className="flex items-center gap-6">
						<Button
							ariaLabel={t("cancel")}
							className="p-0 font-semibold text-gray-500 hover:text-white"
							onClick={navigateBack}
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
