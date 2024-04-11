import React from "react";
import { AddVariableForm } from "@components/organisms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";

export const NewVariable = () => {
	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<AddVariableForm />
			</MapMenuFrameLayout>
		</AppWrapper>
	);
};
