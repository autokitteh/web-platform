import React from "react";

import { useTranslation } from "react-i18next";

import { DrawerName } from "@src/enums/components";
import { useDrawerStore } from "@src/store";

import { Button } from "@components/atoms";
import { Drawer } from "@components/molecules";

export const SettingProjectDrawer = () => {
	const { t: tButtons } = useTranslation("buttons");
	const { closeDrawer } = useDrawerStore();

	return (
		<Drawer name={DrawerName.projectSettings} variant="dark">
			<form>
				<div className="flex items-center justify-end gap-6">
					<Button
						ariaLabel={tButtons("cancel")}
						className="p-0 font-semibold text-gray-500 hover:text-white"
						onClick={() => closeDrawer(DrawerName.projectSettings)}
					>
						{tButtons("cancel")}
					</Button>

					<Button
						ariaLabel={tButtons("save")}
						className="border-white px-4 py-2 font-semibold text-white hover:bg-black"
						type="submit"
						variant="outline"
					>
						{tButtons("save")}
					</Button>
				</div>
			</form>
		</Drawer>
	);
};
