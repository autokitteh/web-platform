import React from "react";
import { NewConnectionForm } from "@components/organisms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";

export const NewConnection = () => {
	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<NewConnectionForm />
			</MapMenuFrameLayout>
		</AppWrapper>
	);
};
