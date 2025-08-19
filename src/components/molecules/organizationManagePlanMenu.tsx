import React from "react";

import { useTranslation } from "react-i18next";

import { IconSvg, Spinner } from "@src/components/atoms";
import { OrganizationManagePlanMenuProps } from "@src/interfaces/components";

import { PopoverListWrapper, PopoverListTrigger, PopoverListContent } from "@components/molecules/popover";

import { GearIcon, ThreeDots, TrashIcon } from "@assets/image/icons";

export const OrganizationManagePlanMenu = ({ onManage, loading }: OrganizationManagePlanMenuProps) => {
	const { t } = useTranslation("billing");

	return (
		<div className="flex items-center">
			{loading ? (
				<Spinner className="size-5 text-gray-500" />
			) : (
				<PopoverListWrapper animation="slideFromLeft" interactionType="click" placement="bottom-end">
					<PopoverListTrigger>
						<IconSvg className="fill-white" size="lg" src={ThreeDots} />
					</PopoverListTrigger>
					<PopoverListContent
						className="z-30 flex min-w-[120px] flex-col rounded-lg border border-gray-500 bg-gray-250 p-2"
						itemClassName="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition hover:bg-green-400 whitespace-nowrap px-3 text-gray-1100"
						items={[
							{
								id: "delete",
								label: (
									<span className="flex items-center gap-2 font-medium text-red-500">
										<IconSvg className="size-4 stroke-red-500" src={TrashIcon} />
										{t("delete")}
									</span>
								),
							},
							{
								id: "manage",
								label: (
									<span className="flex items-center gap-2 font-medium text-black">
										<IconSvg className="size-4 stroke-black" src={GearIcon} />
										{t("manage")}
									</span>
								),
							},
						]}
						onItemSelect={(item) => {
							if (item.id === "manage") {
								onManage();
							} else if (item.id === "delete") {
								onManage();
							}
						}}
					/>
				</PopoverListWrapper>
			)}
		</div>
	);
};
