import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useOrganizationStore, useProjectStore, useToastStore } from "@src/store";

import { Loader, Typography } from "@components/atoms";

export const SwitchOrganization = () => {
	const { t } = useTranslation("components.switchOrganization");
	const { t: tOrganization } = useTranslation("settings", { keyPrefix: "organization" });
	const { organizationId } = useParams();
	const { organizations, setCurrentOrganization, currentOrganization, getOrganizations } = useOrganizationStore();
	const { getProjectsList } = useProjectStore();
	const navigate = useNavigate();
	const [organizationName, setOrganizationName] = useState(currentOrganization?.displayName);
	const addToast = useToastStore((state) => state.addToast);

	const loadProjects = async () => {
		await getProjectsList();
		setTimeout(() => {
			navigate("/");
		}, 3000);
	};

	const loadOrganizations = async () => {
		const { error } = await getOrganizations();
		if (error) {
			addToast({
				message: t("errors.organizationFetchingFailed"),
				type: "error",
			});
			return;
		}
		setCurrentOrganization(organizations[organizationId!]);
		setOrganizationName(organizations[organizationId!].displayName);
		await getProjectsList();
		setTimeout(() => {
			navigate("/");
		}, 3000);
	};

	useEffect(() => {
		const organizationFromStore = Object.keys(organizations)?.find(
			(organizationFromStoreId) => organizationFromStoreId === organizationId
		);
		if (organizationFromStore) {
			setCurrentOrganization(organizations[organizationFromStore]);
			loadProjects();
			return;
		}
		loadOrganizations();
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
