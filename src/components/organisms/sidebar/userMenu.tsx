import React, { useEffect, useMemo, useState } from "react";

import Avatar from "react-avatar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SingleValue } from "react-select";

import { usePopoverContext } from "@contexts";
import { sentryDsn, userMenuOrganizationItems } from "@src/constants";
import { MemberRole, MemberStatusType } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { useOrganizationStore, useToastStore, useModalStore } from "@src/store";
import { EnrichedOrganization } from "@src/types/models";
import { cn } from "@src/utilities";

import { Button, Loader, Typography } from "@components/atoms";
import { Select } from "@components/molecules";
import { InvitedUserModal } from "@components/organisms/modals";

import { PlusIcon, GearIcon } from "@assets/image/icons";
import { AnnouncementIcon, LogoutIcon } from "@assets/image/icons/sidebar";

export const UserMenu = ({ openFeedbackForm }: { openFeedbackForm: () => void }) => {
	const { t } = useTranslation("sidebar");
	const { logoutFunction, user } = useOrganizationStore();
	const { close } = usePopoverContext();
	const {
		getEnrichedOrganizations,
		isLoading,
		currentOrganization,
		members,
		updateMemberStatus,
		getCurrentOrganizationEnriched,
	} = useOrganizationStore();
	const navigate = useNavigate();
	const [organizations, setOrganizations] = useState<EnrichedOrganization[]>();
	const [currentOrganizationEnriched, setCurrentOrganizationEnriched] = useState<EnrichedOrganization>();
	const addToast = useToastStore((state) => state.addToast);
	const { openModal, closeModal } = useModalStore();

	useEffect(() => {
		const { data, error } = getEnrichedOrganizations();
		if (error || !data) {
			addToast({
				message: t("menu.errors.organizationFetchingFailed"),
				type: "error",
			});
			return;
		}
		setOrganizations(data);

		const { data: currengOrganizationData, error: currengOrganizationError } = getCurrentOrganizationEnriched();
		if (currengOrganizationError || !currengOrganizationData) {
			addToast({
				message: t("menu.errors.currentOrganizationFetchingFailed"),
				type: "error",
			});
			return;
		}

		setCurrentOrganizationEnriched(currengOrganizationData);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const openFeedbackFormClick = () => {
		openFeedbackForm();
		close();
	};

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

	const selectOrganizations = useMemo(
		() =>
			organizations?.map(({ id, displayName }) => ({
				value: id,
				label: displayName,
			})) || [],
		[organizations]
	);

	const membersLength = useMemo(
		() => (currentOrganization?.id ? Object.keys(members[currentOrganization.id])?.length : 0),
		[currentOrganization, members]
	);

	const handleOrganizationChange = (selected: SingleValue<SelectOption>) => {
		const selectedOrg = organizations?.find((org) => org.id === selected?.value);
		if (selectedOrg) {
			handleOrganizationClick(selectedOrg.currentMember?.status, selectedOrg.id, selectedOrg.displayName);
		}
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
		<>
			<div className="flex items-center gap-2">
				<div
					className="group relative size-16 shrink-0 cursor-pointer"
					onClick={() => menuItemClick("/settings")}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							menuItemClick("/settings");
						}
					}}
					role="button"
					tabIndex={0}
				>
					<Avatar color="black" name={user?.name} round={true} size="100%" />
					<span className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-black transition group-hover:scale-110">
						<GearIcon className="size-4 transition group-hover:rotate-180" fill="white" />
					</span>
				</div>

				<div className="leading-none text-gray-1100">
					<Typography className="font-bold leading-none" element="p">
						{user?.name}
					</Typography>
					<Typography className="mt-2 leading-none" element="p">
						{user?.email}
					</Typography>
				</div>
			</div>
			<div className="my-3.5 h-px bg-gray-500" />
			<h3 className="mb-2 font-bold text-gray-1100">
				{t("menu.organizationsList.title")} ({organizations?.length || 0})
			</h3>
			<div className="mb-2.5 w-72">
				{isLoading.organizations ? (
					<div className="relative h-10">
						<Loader isCenter />
					</div>
				) : (
					<Select
						defaultValue={selectOrganizations.find((option) => option.value === currentOrganization?.id)}
						noOptionsLabel={t("menu.organizationsList.noOrganizationFound")}
						onChange={handleOrganizationChange}
						options={selectOrganizations}
						variant="light"
					/>
				)}
			</div>
			{currentOrganizationEnriched?.currentMember?.role === MemberRole.admin ? (
				<div className="flex flex-col gap-1">
					{userMenuOrganizationItems.map(({ href, icon: Icon, label, stroke, isMembers }) => (
						<Button
							className="w-full rounded-md px-2.5 text-sm hover:bg-gray-250"
							key={href}
							onClick={() => menuItemClick(href)}
							title={label}
						>
							<Icon className={cn("size-4", { "stroke-gray-1100": stroke, "fill-gray-1100": !stroke })} />
							{label}
							{isMembers ? ` (${membersLength})` : null}
						</Button>
					))}
				</div>
			) : null}
			<Button
				className="mt-1 flex w-full items-center gap-2 rounded-md bg-green-800 px-2.5 py-1.5 text-sm text-black hover:bg-green-200"
				onClick={() => createNewOrganization()}
				title={t("menu.organizationsList.newOrganization")}
			>
				<PlusIcon className="size-4" fill="white" />
				{t("menu.organizationsList.newOrganization")}
			</Button>
			<div className="my-3.5 h-px bg-gray-500" />
			{sentryDsn ? (
				<Button
					className="w-full rounded-md px-2.5 text-sm hover:bg-gray-250"
					onClick={() => openFeedbackFormClick()}
				>
					<AnnouncementIcon className="size-4" fill="black" />
					{t("menu.userSettings.feedback")}
				</Button>
			) : null}

			<Button className="w-full rounded-md px-2.5 text-sm hover:bg-gray-250" onClick={() => logoutFunction(true)}>
				<LogoutIcon className="h-5 w-4 fill-gray-1100" />
				{t("menu.userSettings.logout")}
			</Button>
			<InvitedUserModal onUserInvintaionAction={onUserInvintationAction} />
		</>
	);
};
