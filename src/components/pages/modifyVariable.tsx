import React from "react";
import { ModifyVariableForm } from "@components/organisms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";

export const ModifyVariable = () => {
	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<ModifyVariableForm />
			</MapMenuFrameLayout>
		</AppWrapper>
	);
};
