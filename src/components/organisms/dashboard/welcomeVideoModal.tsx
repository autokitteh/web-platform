import React from "react";

import { ModalName } from "@enums/components";

import { useModalStore } from "@store";

import { Modal } from "@components/molecules";

export const WelcomeVideoModal = () => {
	const data = useModalStore((state) => state.data) as { video: string };

	if (!data) return null;

	return (
		<Modal className="size-3/4 bg-black/90" name={ModalName.welcomePage}>
			<iframe allowFullScreen={true} className="size-full rounded-14 pb-7 pt-4" src={data.video} title="Video" />
		</Modal>
	);
};
