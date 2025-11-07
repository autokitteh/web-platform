import React from "react";

import { AddConnection } from "@components/organisms/connections/add";

interface ConnectionAddProps {
	onBack: () => void;
}

export const ConnectionAdd = ({ onBack }: ConnectionAddProps) => {
	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<AddConnection onBack={onBack} />
		</div>
	);
};
