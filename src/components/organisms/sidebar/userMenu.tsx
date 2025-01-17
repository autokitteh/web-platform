import React, { useEffect } from "react";

import Avatar from "react-avatar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { usePopoverContext } from "@contexts";
import { sentryDsn, userMenuItems, userMenuOrganizationItems } from "@src/constants";
import { MemberStatus } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useUserStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconSvg, Loader, Typography } from "@components/atoms";
import { InvitedUserModal } from "@components/organisms/modals";

import { PlusIcon } from "@assets/image/icons";
import { AnnouncementIcon, LogoutIcon } from "@assets/image/icons/sidebar";

export const UserMenu = ({ openFeedbackForm }: { openFeedbackForm: () => void }) => {
	const { t } = useTranslation("sidebar");
	const { logoutFunction, user } = useUserStore();
	const { close } = usePopoverContext();
	const { getOrganizationsList, isLoadingOrganizations, organizationsList, currentOrganization } =
		useOrganizationStore();
	const navigate = useNavigate();
	const { openModal } = useModalStore();

	useEffect(() => {
		getOrganizationsList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const openFeedbackFormClick = () => {
		openFeedbackForm();
		close();
	};

	const getStatusIndicatorClasses = (status?: MemberStatus) =>
		cn("absolute right-1 top-1/2 size-2.5 -translate-y-1/2 rounded-full hidden", {
			"bg-error-200 block": status === MemberStatus.invited,
			"bg-gray-600 block": status === MemberStatus.declined,
		});

	const handleOrganizationClick = (status?: MemberStatus, id?: string, displayName?: string) => {
		if (status === MemberStatus.invited) {
			openModal(ModalName.invitedUser, {
				organizationId: id,
				organizationName: displayName,
			});
			return;
		}

		navigate(`/switch-organization/${id}`);
	};

	return (
		<div className="flex gap-4">
			<div className="flex w-48 flex-col border-r border-gray-950 pr-4">
				<h3 className="mb-3 font-semibold text-black">{t("menu.userSettings.title")}</h3>
				<div className="flex items-center gap-2 border-b border-gray-950 pb-2">
					<Avatar color="black" name={`${user?.name}`} round={true} size="28" />
					<span className="font-medium text-black">{user?.email}</span>
				</div>
				<div className="mt-2 flex flex-col gap-1">
					{sentryDsn ? (
						<Button
							className="w-full rounded-md px-2.5 text-sm hover:bg-gray-250"
							onClick={() => openFeedbackFormClick()}
						>
							<AnnouncementIcon className="size-4" fill="black" />
							{t("menu.userSettings.feedback")}
						</Button>
					) : null}
					{userMenuItems.map(({ href, icon, label, stroke }, index) => (
						<Button
							className="w-full rounded-md px-2.5 text-sm hover:bg-gray-250"
							href={href}
							key={index}
							title={t("menu.userSettings.settings")}
						>
							<IconSvg
								className={cn({
									"fill-black": !stroke,
									"stroke-black": stroke,
								})}
								size="md"
								src={icon}
							/>
							{t(label)}
						</Button>
					))}

					<Button
						className="w-full rounded-md px-2.5 text-sm hover:bg-gray-250"
						onClick={() => logoutFunction()}
					>
						<LogoutIcon className="size-4" fill="black" />
						{t("menu.userSettings.logout")}
					</Button>
				</div>
			</div>

			<div className="flex w-48 flex-col border-r border-gray-950 pr-4">
				<h3 className="mb-3 font-semibold text-black">{t("menu.organizationSettings.title")}</h3>
				{userMenuOrganizationItems.map(({ href, icon: Icon, label }) => (
					<Button className="w-full rounded-md px-2.5 text-sm hover:bg-gray-250" href={href} key={href}>
						<Icon className="size-4" fill="black" />
						{label}
					</Button>
				))}
			</div>

			<div className="flex w-48 flex-col">
				<h3 className="mb-3 font-semibold text-black">{t("menu.organizationsList.title")}</h3>
				<Button
					className="mb-2 flex w-full items-center gap-2 rounded-md bg-green-800 px-2.5 py-1.5 text-sm text-black hover:bg-green-200"
					href="/organization-settings/add"
				>
					<PlusIcon className="size-4" fill="white" />
					{t("menu.organizationsList.newOrganization")}
				</Button>

				<div className="scrollbar max-h-40 overflow-y-auto">
					{isLoadingOrganizations ? (
						<div className="relative mt-8 h-10">
							<Loader isCenter />
						</div>
					) : organizationsList ? (
						organizationsList.map(({ displayName, id, status }) => (
							<Button
								className={cn(
									"relative mb-1 block w-full truncate rounded-md px-2.5 text-left text-sm hover:bg-gray-250",
									{
										"font-bold": currentOrganization?.id === id,
									}
								)}
								key={id}
								onClick={() => handleOrganizationClick(status, id, displayName)}
							>
								{displayName}
								<div className={getStatusIndicatorClasses(status)} />
							</Button>
						))
					) : (
						<Typography className="text-center text-base font-semibold text-black">
							{t("menu.organizationsList.noOrganizationFound")}
						</Typography>
					)}
				</div>
			</div>

			<InvitedUserModal />
		</div>
	);
};
