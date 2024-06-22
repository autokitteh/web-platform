import { useState } from "react";
import React from "react";
import { Button, Loader, Title } from "@components/atoms";
import { ModalName } from "@enums/components";
import { HttpService } from "@services";
import { useModalStore } from "@store";
import { useTranslation } from "react-i18next";

export const Security = () => {
	const { t } = useTranslation("settings");
	const [isLoading, setIsLoading] = useState(false);
	// const [token, setToken] = useState("");
	const { openModal } = useModalStore();

	const createToken = async () => {
		setIsLoading(true);
		const { data: jwtToken } = await HttpService.post("/auth/tokens");
		// setToken(jwtToken);
		openModal(ModalName.getToken, jwtToken);
	};
	return (
		<div className="flex flex-col">
			<Title className="mb-4">{t("security.title")}</Title>
			<div>
				<p className="mb-4">{t("security.howToUseTokenText")}</p>
				<Button className="border-2 border-black float-end" onClick={createToken} variant="light">
					{isLoading ? <Loader size="md" /> : null}
					{t("security.creatTokenButton")}
				</Button>
			</div>
		</div>
	);
};
