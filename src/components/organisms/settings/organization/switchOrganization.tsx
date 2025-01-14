import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { useOrganizationStore, useProjectStore } from "@src/store";

import { Loader, Typography } from "@components/atoms";

export const SwitchOrganization = () => {
	const { t } = useTranslation("errors");
	const { t: tOrganization } = useTranslation("settings", { keyPrefix: "organization" });
	const { organizationId } = useParams();
	const { currentOrganization, getOrganizationsList, setCurrentOrganization } = useOrganizationStore();
	const { getProjectsList } = useProjectStore();
	const navigate = useNavigate();

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		const switchOrganization = async () => {
			if (currentOrganization?.id === organizationId) {
				timeoutId = setTimeout(() => {
					navigate("/");
				}, 3000);

				return;
			}

			const { data: organizationsList } = await getOrganizationsList();
			const organization = organizationsList?.find((organization) => organization.id === organizationId);

			if (!organization) {
				LoggerService.error(
					namespaces.switchOrganization,
					t("organizationNotFoundExtended", { organizationId })
				);
				navigate("/error", { state: { error: t("organizationNotFound") } });

				return;
			}

			await setCurrentOrganization(organization);
			await getProjectsList();

			timeoutId = setTimeout(() => {
				navigate("/");
			}, 3000);
		};

		switchOrganization();

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [organizationId]);

	return (
		<div className="relative flex h-full flex-col items-center justify-center">
			<Typography className="mb-10 font-semibold text-black" size="large">
				{currentOrganization?.displayName
					? tOrganization("youRedirectToOrganizationExtended", { name: currentOrganization.displayName })
					: tOrganization("youRedirectToOrganization")}
			</Typography>
			<Loader size="lg" />
		</div>
	);
};
