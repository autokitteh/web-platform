import React, { useState } from "react";
import { Bell, Receipt, Sliders, User } from "@assets/image/icons";
import { Button, IconSvg, Loader, LogoCatLarge, Title } from "@components/atoms";
import { DisplayTokenModal } from "@components/organisms/settings";
import { ModalName } from "@enums/components";
import { HttpService } from "@services";
import { useModalStore } from "@store";
import { useTranslation } from "react-i18next";

export const Settings = () => {
	const { t } = useTranslation("settings");
	const [isLoading, setIsLoading] = useState(false);
	const [token, setToken] = useState("");
	const { openModal } = useModalStore();

	const createToken = () => {
		setIsLoading(true);
		HttpService.post("/auth/tokens");
		setToken("token");
		openModal(ModalName.getToken, token);
	};

	return (
		<div className="flex w-full py-4 h-full">
			<div className="flex bg-black flex-1 rounded-tl-lg rounded-bl-lg flex-col pt-10 pl-6 h-full text-lg">
				<div className="flex mb-4 cursor-pointer group" role="link">
					<div className="p-2 bg-gray-500 rounded-full mr-2">
						<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={User} />
					</div>
					My Profile
				</div>
				<div className="flex mb-4 cursor-pointer group" role="link">
					<div className="p-2 bg-gray-500 rounded-full mr-2">
						<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={Bell} />
					</div>
					Notifications
				</div>
				<div className="flex mb-4 cursor-pointer group" role="link">
					<div className="p-2 bg-gray-500 rounded-full mr-2">
						<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={Sliders} />
					</div>
					Advanced
				</div>
				<div className="flex mb-4 cursor-pointer group" role="link">
					<div className="p-2 bg-gray-500 rounded-full mr-2">
						<IconSvg className="fill-white h-3 w-3 group-hover:fill-green-accent" src={Receipt} />
					</div>
					Billing
				</div>
			</div>
			<div className="flex bg-gray-800 flex-5 rounded-tr-lg rounded-br-lg pt-10 pl-6">
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
				<LogoCatLarge className="!-bottom-5 !-right-5" />
			</div>
			<DisplayTokenModal />
		</div>
	);
};
