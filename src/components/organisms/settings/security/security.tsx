import { useState } from "react";
import React from "react";
import { DisplayConnectionTokenModal } from "./displayTokenModal";
import { NewProject } from "@assets/image";
import { Button, IconSvg, Loader, Title } from "@components/atoms";
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
					<div className="ml-1 flex items-center">
						{!isLoading ? (
							<IconSvg alt="New Project" className="w-4 before:w-2 before:h-2 after:w-2 after:h-2" src={NewProject} />
						) : null}
						{isLoading ? <Loader size="sm" /> : null}
					</div>
					<div className="flex mr-1">{t("security.creatTokenButton")}</div>
				</Button>
			</div>
			<DisplayConnectionTokenModal />
		</>
	);
};
