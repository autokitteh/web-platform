import React from "react";

import { EditConnection } from "@components/organisms/connections/edit";

interface ConnectionEditProps {
	connectionId: string;
	onBack: () => void;
}

export const ConnectionEdit = ({ connectionId, onBack }: ConnectionEditProps) => {
	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<EditConnection connectionId={connectionId} onBack={onBack} />
		</div>
	);
};
