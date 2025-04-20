import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useOrganizationStore, useProjectStore, useLoggerStore } from "@src/store";

import { Loader, Typography } from "@components/atoms";

export const SwitchOrganization = () => {
	const { t } = useTranslation("components", { keyPrefix: "switchOrganization" });
	const { t: tOrganization } = useTranslation("settings", { keyPrefix: "organization" });
	const { organizationId } = useParams();
	const { organizations, setCurrentOrganization, currentOrganization, getEnrichedOrganizations } =
		useOrganizationStore();
	const { getProjectsList } = useProjectStore();
	const { clearLogs } = useLoggerStore();
	const navigate = useNavigate();
	const [organizationName, setOrganizationName] = useState(currentOrganization?.displayName);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		const loadProjects = async () => {
			await getProjectsList();
			timeoutId = setTimeout(() => {
				navigate("/");
			}, 3000);
		};

		const getOrganizationFromStore = (organizationId: string): boolean => {
			const organizationFromStore =
				organizations && Object.values(organizations).length > 0
					? Object.values(organizations).find(({ id }) => id === organizationId)
					: undefined;
			if (organizationFromStore) {
				setCurrentOrganization(organizationFromStore);
				setOrganizationName(organizationFromStore.displayName);
				clearLogs();
				loadProjects();
				return true;
			}
			return false;
		};

		const handleOrganizationLoading = async () => {
			const organizationLoadedFromStore = getOrganizationFromStore(organizationId!);
			if (!organizationLoadedFromStore) {
				navigate("/error", { state: { error: t("errors.permissionDenied") } });
			}

			const { error } = getEnrichedOrganizations();
			if (error) {
				navigate("/error", { state: { error: t("errors.organizationFetchingFailed") } });
				return;
			}
		};

		if (organizationId === currentOrganization?.id) {
			timeoutId = setTimeout(() => {
				navigate("/");
			}, 3000);
		} else {
			handleOrganizationLoading();
		}

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
				{organizationName
					? tOrganization("youRedirectToOrganizationExtended", { name: organizationName })
					: tOrganization("youRedirectToOrganization")}
			</Typography>
			<Loader size="lg" />
		</div>
	);
};
