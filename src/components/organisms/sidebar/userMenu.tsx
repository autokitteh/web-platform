import React from "react";

import Avatar from "react-avatar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { usePopoverContext } from "@contexts";
import { sentryDsn, userMenuItems, userMenuOrganizationItems } from "@src/constants";
import { MemberStatusType } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { useOrganizationStore, useToastStore, useModalStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconSvg, Loader, Typography } from "@components/atoms";
import { InvitedUserModal } from "@components/organisms/modals";

import { PlusIcon } from "@assets/image/icons";
import { AnnouncementIcon, LogoutIcon } from "@assets/image/icons/sidebar";

export const UserMenu = ({ openFeedbackForm }: { openFeedbackForm: () => void }) => {
	const { t } = useTranslation("sidebar");
	const { close } = usePopoverContext();
	const {
		logoutFunction,
		enrichedOrganizations,
		isLoading,
		currentOrganization,
		user,
		updateMemberStatus,
		amIadminCurrentOrganization,
	} = useOrganizationStore();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const { openModal, closeModal } = useModalStore();

	const openFeedbackFormClick = () => {
		openFeedbackForm();
		close();
	};

	const getStatusIndicatorClasses = (status?: MemberStatusType) =>
		cn("absolute right-1 top-1/2 hidden size-2.5 -translate-y-1/2 rounded-full", {
			"bg-error-200 block": status === MemberStatusType.invited,
		});

	const handleOrganizationClick = (status?: MemberStatusType, id?: string, displayName?: string) => {
		if (status === MemberStatusType.invited) {
			openModal(ModalName.invitedUser, {
				organizationId: id,
				organizationName: displayName,
			});
			return;
		}
		close();
		navigate(`/switch-organization/${id}`);
	};

	const onUserInvintationAction = async (status: MemberStatusType, organizationId: string) => {
		if (!organizationId || !user?.id) return;

		const { error } = await updateMemberStatus(organizationId, status);
		if (error) {
			addToast({
				message: t("menu.errors.failedUpdateOrganizationStatus"),
				type: "error",
			});

			return;
		}

		if (status === MemberStatusType.active) {
			closeModal(ModalName.invitedUser);
			close();

			navigate(`/switch-organization/${organizationId}`);
			return;
		}
		if (status === MemberStatusType.declined) {
			addToast({
				message: t("menu.organizationsList.userInvitintations.yourDeclineResponseRecoreded"),
				type: "success",
			});
			closeModal(ModalName.invitedUser);
			close();
			return;
		}
	};

	const createNewOrganization = () => {
		close();
		navigate("/settings/add-organization");
	};

	const menuItemClick = (href: string) => {
		close();
		navigate(href);
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
							key={index}
							onClick={() => menuItemClick(href)}
							title={`${t("menu.userSettings.settings")} - ${t(label)}`}
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
						onClick={() => logoutFunction(true)}
					>
						<LogoutIcon className="size-4" fill="black" />
						{t("menu.userSettings.logout")}
					</Button>
				</div>
			</div>

			{amIadminCurrentOrganization ? (
				<div className="flex w-48 flex-col border-r border-gray-950 pr-4">
					<h3 className="mb-3 font-semibold text-black">{t("menu.organizationSettings.title")}</h3>
					{userMenuOrganizationItems.map(({ href, icon: Icon, label }) => (
						<Button
							className="w-full rounded-md px-2.5 text-sm hover:bg-gray-250"
							key={href}
							onClick={() => menuItemClick(href)}
							title={label}
						>
							<Icon className="size-4" fill="black" />
							{label}
						</Button>
					))}
				</div>
			) : null}

			<div className="flex w-48 flex-col">
				<h3 className="mb-3 font-semibold text-black">{t("menu.organizationsList.title")}</h3>
				<Button
					className="mb-2 flex w-full items-center gap-2 rounded-md bg-green-800 px-2.5 py-1.5 text-sm text-black hover:bg-green-200"
					onClick={() => createNewOrganization()}
					title={t("menu.organizationsList.newOrganization")}
				>
					<PlusIcon className="size-4" fill="white" />
					{t("menu.organizationsList.newOrganization")}
				</Button>

				<div className="scrollbar max-h-40 overflow-y-auto">
					{isLoading.organizations ? (
						<div className="relative mt-8 h-10">
							<Loader isCenter />
						</div>
					) : enrichedOrganizations ? (
						enrichedOrganizations.map(({ displayName, id, currentMember, uniqueName }) =>
							currentMember?.status === MemberStatusType.declined ? null : (
								<Button
									className={cn(
										"relative mb-1 block w-full truncate rounded-md px-2.5 text-left text-sm hover:bg-gray-250 disabled:opacity-100",
										{
											"font-bold": currentOrganization?.id === id,
										}
									)}
									disabled={id === currentOrganization?.id}
									key={id}
									onClick={() => handleOrganizationClick(currentMember?.status, id, displayName)}
									title={uniqueName}
								>
									{displayName}
									<div className={getStatusIndicatorClasses(currentMember?.status)} />
								</Button>
							)
						)
					) : (
						<Typography className="text-center text-base font-semibold text-black">
							{t("menu.organizationsList.noOrganizationFound")}
						</Typography>
					)}
				</div>
			</div>

			<InvitedUserModal onUserInvintaionAction={onUserInvintationAction} />
		</div>
	);
};
