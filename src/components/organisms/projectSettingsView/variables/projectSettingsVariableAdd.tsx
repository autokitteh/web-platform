import React from "react";

import { AddVariable } from "@components/organisms/variables/add";

interface ProjectSettingsVariableAddProps {
	onBack: () => void;
}

export const ProjectSettingsVariableAdd = ({ onBack }: ProjectSettingsVariableAddProps) => {
	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<AddVariable hideHeader onBack={onBack} onSuccess={onBack} />
		</div>
	);
};
