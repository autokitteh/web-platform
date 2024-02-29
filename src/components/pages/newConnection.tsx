import React from "react";
import { AddConnectionForm } from "@components/organisms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";

export const NewConnection = () => {
	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<AddConnectionForm />
			</MapMenuFrameLayout>
		</AppWrapper>
	);
};
