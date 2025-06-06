/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";

import { tours } from "@src/constants/tour.constants";
import { EventListenerName } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { AppProviderProps } from "@src/interfaces/components";
import { useModalStore, useProjectStore, useTemplatesStore, useTourStore } from "@src/store";
import { shouldShowStepOnPath, validateAllRequiredToursExist, validateAllTemplatesExist } from "@src/utilities";

import { Toast } from "@components/molecules";
import { TourManager } from "@components/organisms";
import { ModalManager } from "@components/organisms/modals/modalManager";

export const AppProvider = ({ children }: AppProviderProps) => {
	const { activeTour, activeStep, tourProjectId } = useTourStore();
	const { openModal, closeModal, closeAllModals } = useModalStore();
	const { projectsList } = useProjectStore();

	const {
		isLoading: templatesLoadingInProgress,
		sortedCategories,
		templateMap,
		fetchTemplates,
	} = useTemplatesStore();
	const [rateLimitModalDisplayed, setRateLimitModalDisplayed] = useState(false);
	const [quotaLimitModalDisplayed, setQuotaLimitModalDisplayed] = useState(false);

	useEffect(() => {
		const checkAndFetchTemplates = async () => {
			if (templatesLoadingInProgress) return;
			const templatesExist = await validateAllTemplatesExist(templateMap, sortedCategories);
			const toursExist = await validateAllRequiredToursExist();
			if (!templatesExist || !toursExist) {
				fetchTemplates(true);
			}
		};
		checkAndFetchTemplates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templatesLoadingInProgress, sortedCategories]);

	useEffect(() => {
		if (!activeTour.tourId || !activeStep) return;
		const currentTour = tours[activeTour.tourId];
		const configStep = currentTour.steps.find((step) => step.id === activeStep.id);
		const tourProjectExists = projectsList.find((project) => project.id === tourProjectId);
		if (configStep && !shouldShowStepOnPath(configStep, location.pathname) && !!tourProjectExists && !activeStep) {
			openModal(ModalName.continueTour, { name: tours?.[activeTour?.tourId]?.name });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeStep, activeTour.tourId, location.pathname, tourProjectId]);

	const displayRateLimitModal = (_: CustomEvent) => {
		if (!rateLimitModalDisplayed) {
			openModal(ModalName.rateLimit);
			setRateLimitModalDisplayed(true);
		}
	};

	const displayQuotaLimitModal = ({
		detail: { limit, resourceName, used },
	}: CustomEvent<{ limit: string; resourceName: string; used: string }>) => {
		if (!quotaLimitModalDisplayed) {
			closeAllModals();
			openModal(ModalName.quotaLimit, { limit, resource: resourceName, used });
			setQuotaLimitModalDisplayed(true);
		}
	};

	const hideRateLimitModal = () => {
		closeModal(ModalName.rateLimit);
		setRateLimitModalDisplayed(false);
	};

	const hideQuotaLimitModal = () => {
		closeModal(ModalName.quotaLimit);
		setQuotaLimitModalDisplayed(false);
	};

	useEventListener(EventListenerName.displayRateLimitModal, displayRateLimitModal);
	useEventListener(EventListenerName.displayQuotaLimitModal, displayQuotaLimitModal);
	useEventListener(EventListenerName.hideRateLimitModal, hideRateLimitModal);
	useEventListener(EventListenerName.hideQuotaLimitModal, hideQuotaLimitModal);

	return (
		<>
			{children}
			<Toast />
			<TourManager />
			<ModalManager />
		</>
	);
};
