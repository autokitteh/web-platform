import React from "react";
import { AddTriggerForm } from "@components/organisms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";

export const NewTrigger = () => {
	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<AddTriggerForm />
			</MapMenuFrameLayout>
		</AppWrapper>
	);
};
