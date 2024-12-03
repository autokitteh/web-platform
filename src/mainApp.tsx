import React from "react";

import "@utilities/getApiBaseUrl.utils";

import { App } from "./app";
import { ModalName } from "./enums/components";
import { useModalStore } from "./store";
import { descopeProjectId, isAuthEnabled } from "@constants";

import { Button, IconSvg } from "@components/atoms";
import { UserFeedbackModal } from "@components/organisms";
import { DescopeWrapper } from "@components/templates";

import { Announcement } from "@assets/image/icons";

export const MainApp = () => {
	const { openModal } = useModalStore();

	return (
		<>
			<UserFeedbackModal />
			<Button
				className="absolute bottom-24 right-4 z-40 rounded-full bg-black p-4 py-3 text-white"
				onClick={() => openModal(ModalName.userFeedback)}
			>
				<IconSvg className="fill-white" src={Announcement} />
				Send us a Feedback
			</Button>
			{isAuthEnabled && descopeProjectId ? (
				<DescopeWrapper>
					<App />
				</DescopeWrapper>
			) : (
				<App />
			)}
		</>
	);
};
