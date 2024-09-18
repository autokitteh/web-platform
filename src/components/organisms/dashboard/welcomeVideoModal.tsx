import React from "react";

import { ModalName } from "@enums/components";
import { useModalStore } from "@src/store";

import { Modal } from "@components/molecules";

export const WelcomeVideoModal = () => {
	const data = useModalStore((state) => state.data) as { video: string };

	return (
		<Modal className="h-3/4 w-3/4" name={ModalName.welcomePage}>
			<iframe
				allowFullScreen={true}
				className="h-full w-full rounded-14 pb-7 pt-4"
				src={data?.video}
				title="Video"
			/>
		</Modal>
	);
};
