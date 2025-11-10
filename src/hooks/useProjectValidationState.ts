import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { FrontendProjectValidationProps } from "@interfaces/components";
import { useCacheStore } from "@src/store";

type ValidationType = "connections" | "variables" | "triggers" | "resources";

export const useProjectValidationState = (
	validationType: ValidationType,
	dependency: unknown
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, dependency]);

	return validationStatus;
};
