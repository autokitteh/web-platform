import React from "react";
import { CopyIcon } from "@assets/image/icons";
import { Button, Input } from "@components/atoms";
import { Modal } from "@components/molecules";
import { ModalName } from "@enums/components";
import { useModalStore, useToastStore } from "@store";
import { Trans, useTranslation } from "react-i18next";

export const DisplayConnectionTokenModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "getToken" });
	const { t: tErrors } = useTranslation("errors");
	const token = useModalStore((state) => state.data as string);
	const { closeModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);

			addToast({
				id: Date.now().toString(),
				message: t("copySuccess"),
				title: "Success",
				type: "success",
			});
		} catch (err) {
			addToast({
				id: Date.now().toString(),
				message: t("copyFailure"),
				title: tErrors("error"),
				type: "error",
			});
		}
	};

	return (
		<Modal name={ModalName.getToken}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("title")}</h3>
				<p>
					<Trans
						components={{
							anchor: (
								<a
									href="https://marketplace.visualstudio.com/items?itemName=autokitteh.autokitteh"
									key="extensionLink"
									rel="noreferrer"
									target="_blank"
									title="AutoKitteh Extension"
								/>
							),
						}}
						i18nKey={t("line")}
					/>
				</p>
				<div className="flex mt-6 w-full">
					<Input
						aria-label={t("copyInputAriaLabel")}
						className="flex-1 bg-white hover:border-gray-700"
						disabled
						placeholder={t("copyInputLabel")}
						value={token}
						variant="light"
					/>
					<Button
						aria-label={t("copyButton")}
						className="px-3 font-semibold bg-white border-black rounded-md hover:bg-gray-300 ml-4"
						onClick={() => copyToClipboard("test")}
						variant="outline"
					>
						<CopyIcon className="w-4.1 h-6 fill-black" />
					</Button>
				</div>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button
					ariaLabel={t("closeButton")}
					className="font-semibold py-3 px-4 hover:text-white w-auto"
					onClick={() => closeModal(ModalName.getToken)}
				>
					{t("closeButton")}
				</Button>
			</div>
		</Modal>
	);
};
