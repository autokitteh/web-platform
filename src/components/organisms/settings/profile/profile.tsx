import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { useUserStore } from "@src/store";

import { Button, Typography } from "@components/atoms";

export const Profile = () => {
	const { t } = useTranslation("settings", { keyPrefix: "profile" });
	const { getLoggedInUser, user } = useUserStore();

	useEffect(() => {
		if (!user) {
			getLoggedInUser();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Typography className="mb-4 text-settings-title font-bold" element="h1" size="large">
				{t("title")}
			</Typography>
			<p className="mb-4">{t("name", { name: user?.name })}</p>
			<p className="mb-4">{t("email", { email: user?.email })}</p>
			<div className="mt-16">
				<Button className="mt-4" onClick={() => {}} variant="outline">
					{t("deleteAccount")}
				</Button>
			</div>
		</>
	);
};
