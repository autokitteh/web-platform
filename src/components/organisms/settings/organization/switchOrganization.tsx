import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useOrganizationStore, useProjectStore } from "@src/store";

import { Loader, Typography } from "@components/atoms";

export const SwitchOrganization = () => {
	const { t } = useTranslation("errors");
	const { t: tOrganization } = useTranslation("settings", { keyPrefix: "organization" });
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

			setTimeout(() => {
				navigate("/");
			}, 3000);
		};

		switchOrganization();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [organizationId]);

	return (
		<div className="relative flex h-full flex-col items-center justify-center">
			<Loader size="lg" />
			<Typography className="mt-5 font-semibold text-black" size="large">
				{tOrganization("youRedirectToOrganization")}
			</Typography>
		</div>
	);
};
