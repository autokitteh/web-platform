import React from "react";

import Avatar from "react-avatar";
import { useTranslation } from "react-i18next";

import { userMenuOrganizationItems } from "@src/constants";
import { useUserStore } from "@src/store";

import { Button } from "@components/atoms";

import { GearIcon, PlusIcon } from "@assets/image/icons";
import { LogoutIcon } from "@assets/image/icons/sidebar";

export const UserMenu = () => {
	const { t } = useTranslation("sidebar", { keyPrefix: "menu" });
	const { logoutFunction, user } = useUserStore();

	// TODO: Fetch actual organizations data
	const organizations = [
		{ id: 1, name: "Organization 1" },
		{ id: 2, name: "Organization 2" },
		{ id: 3, name: "Organization 3" },
		{ id: 4, name: "Organization 4" },
		{ id: 3, name: "Organization 5" },
		{ id: 4, name: "Organization 6" },
	];

	return (
		<div className="flex gap-4">
			<div className="flex w-48 flex-col border-r border-gray-950 pr-4">
				<h3 className="mb-3 font-semibold text-black">{t("userSettings.title")}</h3>
				<div className="flex items-center gap-2 border-b border-gray-950 pb-2">
					<Avatar color="black" name={`${user?.name}`} round={true} size="28" />
					<span className="font-medium text-black">{user?.email}</span>
				</div>
				<div className="mt-2 flex flex-col gap-1">
					<Button
						className="w-full rounded-md px-2.5 text-sm hover:bg-gray-250"
						href="/settings"
						title={t("userSettings.settings")}
					>
						<GearIcon className="size-4" fill="black" />
						{t("userSettings.settings")}
					</Button>
					<Button
						className="w-full rounded-md px-2.5 text-sm hover:bg-gray-250"
						onClick={() => logoutFunction()}
					>
						<LogoutIcon className="size-4" fill="black" />
						{t("userSettings.logout")}
					</Button>
				</div>
			</div>

			<div className="flex w-48 flex-col border-r border-gray-950 pr-4">
				<h3 className="mb-3 font-semibold text-black">{t("organizationSettings.title")}</h3>
				{userMenuOrganizationItems.map(({ href, icon: Icon, label }) => (
					<Button className="w-full rounded-md px-2.5 text-sm hover:bg-gray-250" href={href} key={href}>
						<Icon className="size-4" fill="black" />
						{label}
					</Button>
				))}
			</div>

			<div className="flex w-48 flex-col">
				<h3 className="mb-3 font-semibold text-black">{t("organizationsList.title")}</h3>
				<Button
					className="mb-2 flex w-full items-center gap-2 rounded-md bg-green-800 px-2.5 py-1.5 text-sm text-black hover:bg-green-200"
					onClick={() => {
						/* TODO: Handle create organization */
					}}
				>
					<PlusIcon className="size-4" fill="white" />
					{t("organizationsList.newOrganization")}
				</Button>

				<div className="scrollbar max-h-40 overflow-y-auto">
					{organizations.map((org) => (
						<Button
							className="mb-1 w-full rounded-md px-2.5 text-sm hover:bg-gray-250"
							key={org.id}
							onClick={() => {
								/* TODO: Handle organization selection */
							}}
						>
							{org.name}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
};
