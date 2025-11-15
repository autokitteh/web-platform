import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { FrontendProjectValidationProps } from "@interfaces/components";
import { useCacheStore } from "@src/store";

type ValidationType = "connections" | "variables" | "triggers" | "resources";

export const useProjectValidationState = (
	validationType: ValidationType
): FrontendProjectValidationProps | undefined => {
	const { projectId } = useParams();
	const getLatestValidationState = useCacheStore((state) => state.getLatestValidationState);
	const [validationStatus, setValidationStatus] = useState<FrontendProjectValidationProps>();

	useEffect(() => {
		let isMounted = true;

		const loadValidationStatus = async () => {
			if (!projectId) {
				return;
			}

			const latestState = await getLatestValidationState(projectId, validationType);
			if (isMounted && latestState?.[validationType]) {
				setValidationStatus(latestState[validationType]);
			} else {
				setValidationStatus(undefined);
			}
		};

		void loadValidationStatus();

		return () => {
			isMounted = false;
		};
	}, [projectId, validationType, getLatestValidationState]);

	return validationStatus;
};
