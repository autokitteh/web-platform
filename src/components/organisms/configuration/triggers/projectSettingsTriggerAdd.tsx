import React from "react";

import { AddTrigger } from "@components/organisms/triggers/add";

interface ProjectSettingsTriggerAddProps {
	onBack: () => void;
}

export const ProjectSettingsTriggerAdd = ({ onBack }: ProjectSettingsTriggerAddProps) => {
	const handleSuccess = () => {
		onBack();
	};

	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<AddTrigger onBack={onBack} onSuccess={handleSuccess} />
		</div>
	);
};
