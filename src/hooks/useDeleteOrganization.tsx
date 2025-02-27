import { useState } from "react";

import omit from "lodash/omit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LoggerService, ProjectsService } from "@services";
import { namespaces } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { EnrichedOrganization } from "@src/types/models";

export const useDeleteOrganization = () => {
	const [organizationIdInDeletion, setOrganizationIdInDeletion] = useState<string>();
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal, openModal } = useModalStore();
	const { currentOrganization, user, deleteOrganization, logoutFunction } = useOrganizationStore();
	const { t } = useTranslation("settings", { keyPrefix: "userOrganizations" });
	const navigate = useNavigate();

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

			return { error: true };
		}

		if (!deletingCurrentOrganization) return { error: false };
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
		return { error: false };
	};

	const handleDeleteOrganization = async (organization: EnrichedOrganization) => {
		setOrganizationIdInDeletion(organization.id);
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
		setOrganizationIdInDeletion(undefined);

		if (hasProjects) {
			openModal(ModalName.warningDeleteOrganization, { name: organization.displayName });
			return;
		}

		openModal(ModalName.deleteOrganization, organization);
	};

	return { organizationIdInDeletion, onDelete, handleDeleteOrganization };
};
