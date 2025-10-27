import React from "react";

import { AddConnection } from "@components/organisms/connections/add";

interface ProjectSettingsConnectionAddProps {
	onBack: () => void;
}

export const ProjectSettingsConnectionAdd = ({ onBack }: ProjectSettingsConnectionAddProps) => {
	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<AddConnection onBack={onBack} />
		</div>
	);
};
