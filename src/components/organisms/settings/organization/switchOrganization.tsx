import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useOrganizationStore, useProjectStore } from "@src/store";

import { Loader } from "@components/atoms";

export const SwitchOrganization = () => {
	const { t } = useTranslation("errors");
	const { organizationId } = useParams();
	const { getOrganizationsList, setCurrentOrganization } = useOrganizationStore();
	const { getProjectsList } = useProjectStore();
	const navigate = useNavigate();

	useEffect(() => {
		const switchOrganization = async () => {
			const { data: organizationsList } = await getOrganizationsList();
			const organization = organizationsList?.find((organization) => organization.id === organizationId);
			if (!organization) {
				navigate("/error", { state: { error: t("organizationNotFound") } });

				return;
			}
			await setCurrentOrganization(organization);
			await getProjectsList();
			navigate("/");
		};
		switchOrganization();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [organizationId]);

	return <Loader isCenter size="lg" />;
};
