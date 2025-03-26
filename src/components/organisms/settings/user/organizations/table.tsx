import React from "react";

import omit from "lodash/omit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LoggerService, ProjectsService } from "@services";
import { namespaces } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { EnrichedOrganization } from "@src/types/models";

<<<<<<< HEAD
import { Button, Typography, IconButton, TBody, THead, Table, Td, Th, Tr, Loader } from "@components/atoms";
=======
import { Button, Typography, IconButton, TBody, THead, Table, Td, Th, Tr, Spinner } from "@components/atoms";
>>>>>>> b2f79828 (feat(UI-1242): add warning modal for organization deletion)
import { DeleteOrganizationModal } from "@components/organisms/settings/organization";
import { WarningDeleteOrganizationModal } from "@components/organisms/settings/user/organizations/warningDeleteModal";

import { TrashIcon } from "@assets/image/icons";

export const UserOrganizationsTable = () => {
	const { t } = useTranslation("settings", { keyPrefix: "userOrganizations" });
	const { closeModal, openModal } = useModalStore();
	const {
		enrichedOrganizations,
		currentOrganization,
		user,
		deleteOrganization,
		isLoading,
		logoutFunction,
		amIadminCurrentOrganization,
	} = useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);
	const navigate = useNavigate();
<<<<<<< HEAD
=======
	const [organizationsList, setOrganizationsList] = useState<EnrichedOrganization[]>();
	const [openDeleteOrganizaton, setOpenDeleteOrganizaton] = useState({
		organizationId: "",
		isLoading: false,
	});

	useEffect(() => {
		getOrganizations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const { data: latestOrganizations, error } = getEnrichedOrganizations();
		if (error || !latestOrganizations) {
			addToast({
				message: t("errors.fetchFailed"),
				type: "error",
			});
			return;
		}
		setOrganizationsList(latestOrganizations);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [organizations]);
>>>>>>> b2f79828 (feat(UI-1242): add warning modal for organization deletion)

	const onDelete = async (organization: EnrichedOrganization) => {
		const deletingCurrentOrganization = organization.id === currentOrganization?.id;

		const { error } = await deleteOrganization(omit(organization, "currentMember"));
		closeModal(ModalName.deleteOrganization);
		if (error) {
			addToast({
				message: t("errors.deleteFailed", {
					name: organization?.displayName,
					organizationId: organization?.id,
				}),
				type: "error",
			});
		}

		addToast({
			message: t("table.messages.organizationDeleted", { name: organization.displayName }),
			type: "success",
		});

		if (!deletingCurrentOrganization) return;
		setTimeout(async () => {
			if (!user?.defaultOrganizationId) {
				LoggerService.error(
					namespaces.ui.organizationTableUserSettings,
					t("errors.defaultOrganizationIdMissing", { userId: user?.id })
				);
				logoutFunction(true);
				return;
			}
			navigate(`/switch-organization/${user.defaultOrganizationId}`);
		}, 3000);
	};

	const isNameInputDisabled = (organizationId: string, amIadminCurrentOrganization?: boolean): boolean =>
		!!(
			isLoading.updatingOrganization ||
			user?.defaultOrganizationId === organizationId ||
<<<<<<< HEAD
			!amIadminCurrentOrganization
=======
			organizationRole !== MemberRole.admin ||
			openDeleteOrganizaton.isLoading
>>>>>>> b2f79828 (feat(UI-1242): add warning modal for organization deletion)
		);

	const handleDeleteOrganization = async (organization: EnrichedOrganization) => {
		setOpenDeleteOrganizaton({ organizationId: organization.id, isLoading: true });
		const { data: orgProjectList, error } = await ProjectsService.list(organization.id);
		if (error || !orgProjectList) {
			addToast({
				message: t("errors.deleteFailed", {
					name: organization?.displayName,
					organizationId: organization?.id,
				}),
				type: "error",
			});
			return;
		}
		const hasProjects = orgProjectList?.length > 0;
		setOpenDeleteOrganizaton({ organizationId: organization.id, isLoading: false });

		if (!hasProjects) {
			openModal(ModalName.deleteOrganization, organization);
			return;
		}

		openModal(ModalName.warningDeleteOrganization, { name: organization.displayName });
	};

	return (
		<div className="w-3/4">
			<Typography className="mb-9 font-averta font-bold" element="h1" size="2xl">
				{t("title")}
			</Typography>
			<Button
				className="ml-auto border-black bg-white px-5 text-base font-medium hover:bg-gray-950 hover:text-white"
				onClick={() => navigate("/settings/add-organization")}
				variant="outline"
			>
				{t("buttons.addOrganization")}
			</Button>
			<Table className="mt-6">
				<THead>
					<Tr>
						<Th className="w-2/6 min-w-32 pl-4">{t("table.headers.name")}</Th>
						<Th className="w-2/6 min-w-32">{t("table.headers.uniqueName")}</Th>
						<Th className="w-1/6 min-w-32">{t("table.headers.role")}</Th>
						<Th className="w-1/6 min-w-32">{t("table.headers.status")}</Th>
						<Th className="w-1/6 min-w-16">{t("table.headers.actions")}</Th>
					</Tr>
				</THead>

<<<<<<< HEAD
				{isLoading.organizations ? (
					<Loader isCenter size="md" />
				) : (
					<TBody>
						{enrichedOrganizations ? (
							enrichedOrganizations.map((organization) => (
								<Tr className="hover:bg-gray-1300" key={organization.id}>
									<Td className="w-2/6 min-w-32 pl-4">{organization.displayName}</Td>
									<Td className="w-2/6 min-w-32">{organization.uniqueName}</Td>
									<Td className="w-1/6 min-w-32 capitalize">{organization.currentMember?.role}</Td>
									<Td className="w-1/6 min-w-32 capitalize">{organization.currentMember?.status}</Td>
									<Td className="w-1/6 min-w-16">
										<IconButton
											className="mr-1"
											disabled={isNameInputDisabled(organization.id, amIadminCurrentOrganization)}
											onClick={() => openModal(ModalName.deleteOrganization, organization)}
											title={t("table.actions.delete", { name: organization.displayName })}
										>
											<TrashIcon className="size-4 stroke-white" />
										</IconButton>
									</Td>
								</Tr>
							))
						) : (
							<div className="mt-10 text-center text-xl font-semibold">
								{t("table.errors.noOrganizationsFound")}
							</div>
						)}
					</TBody>
				)}
=======
				<TBody>
					{organizationsList?.map((organization) => (
						<Tr className="hover:bg-gray-1300" key={organization.id}>
							<Td className="w-2/6 min-w-32 pl-4">{organization.displayName}</Td>
							<Td className="w-2/6 min-w-32">{organization.uniqueName}</Td>
							<Td className="w-1/6 min-w-32 capitalize">{organization.currentMember?.role}</Td>
							<Td className="w-1/6 min-w-32 capitalize">{organization.currentMember?.status}</Td>
							<Td className="w-1/6 min-w-16">
								<IconButton
									className="mr-1"
									disabled={isNameInputDisabled(organization.id, organization.currentMember?.role)}
									onClick={async () => handleDeleteOrganization(organization)}
									title={t("table.actions.delete", { name: organization.displayName })}
								>
									{openDeleteOrganizaton.isLoading &&
									openDeleteOrganizaton.organizationId === organization.id ? (
										<Spinner className="size-4" />
									) : (
										<TrashIcon className="size-4 stroke-white" />
									)}
								</IconButton>
							</Td>
						</Tr>
					))}
				</TBody>
>>>>>>> b2f79828 (feat(UI-1242): add warning modal for organization deletion)
			</Table>
			<DeleteOrganizationModal isDeleting={isLoading.deletingOrganization} onDelete={onDelete} />
			<WarningDeleteOrganizationModal />
		</div>
	);
};
