import React from "react";
import { ModifyTriggerForm } from "@components/organisms/forms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";

export const ModifyTrigger = () => {
	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<ModifyTriggerForm />
			</MapMenuFrameLayout>
		</AppWrapper>
	);
};
