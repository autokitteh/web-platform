import { useState } from "react";
import React from "react";
import { DisplayTokenModal } from "./displayTokenModal";
import { Button, Loader, Title } from "@components/atoms";
import { ModalName } from "@enums/components";
import { HttpService } from "@services";
import { useModalStore } from "@store";
import { useTranslation } from "react-i18next";

export const Security = () => {
	const { t } = useTranslation("settings");
	const [isLoading, setIsLoading] = useState(false);
	const { openModal } = useModalStore();

	const createToken = async () => {
		setIsLoading(true);
		const { data: jwtToken } = await HttpService.post("/auth/tokens");
		setIsLoading(false);
		openModal(ModalName.getToken, jwtToken);
	};
	return (
		<>
			<Title className="mb-4">{t("security.title")}</Title>
			<div>
				<p className="mb-4">{t("security.howToUseTokenText")}</p>
				<Button className="border-2 border-black" onClick={createToken} variant="light">
					{isLoading ? <Loader size="sm" /> : null}
					{t("security.creatTokenButton")}
				</Button>
			</div>
			<DisplayTokenModal />
		</>
	);
};
