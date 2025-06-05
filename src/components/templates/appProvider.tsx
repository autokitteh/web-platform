/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { supportEmail } from "@src/constants";
import { tours } from "@src/constants/tour.constants";
import { EventListenerName } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { AppProviderProps } from "@src/interfaces/components";
import { useModalStore, useProjectStore, useTemplatesStore, useToastStore, useTourStore } from "@src/store";
import { shouldShowStepOnPath, validateAllRequiredToursExist, validateAllTemplatesExist } from "@src/utilities";

import { Toast } from "@components/molecules";
import { TourManager } from "@components/organisms";
import { ModalManager } from "@components/ModalManager";

export const AppProvider = ({ children }: AppProviderProps) => {
	const {
		skipTour: stopTour,
		activeTour,
		activeStep,
		getLastStepUrl,
		setPopoverVisible,
		tourProjectId,
	} = useTourStore();
	const { openModal, closeModal, closeAllModals } = useModalStore();
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();
	const { addToast } = useToastStore();
	const { t } = useTranslation("tour", { keyPrefix: "general" });

	const {
		isLoading: templatesLoadingInProgress,
		sortedCategories,
		templateMap,
		fetchTemplates,
	} = useTemplatesStore();

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

	const continueTour = async () => {
		closeModal(ModalName.continueTour);
		closeModal(ModalName.toursProgress);
		setPopoverVisible(false);
		const lastTourStepUrl = getLastStepUrl();
		if (!lastTourStepUrl) {
			addToast({
				message: t("noLastStepUrl"),
				type: "error",
			});
			stopTour();
			return;
		}
		if (!activeStep) return;

		navigate(lastTourStepUrl, { state: { startAbandonedTour: true } });
	};

	const cancelTour = () => {
		closeModal(ModalName.continueTour);
		stopTour();
	};

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



	const onContactSupportClick = () => {
		try {
			window.open(`mailto:${supportEmail}`, "_blank");
		} catch (error) {
			const mailtoLink = document.createElement("a");
			mailtoLink.href = `mailto:${supportEmail}`;
			mailtoLink.target = "_blank";
			mailtoLink.click();
		}
	};

	return (
		<>
			{children}
			<Toast />
			<TourManager />
			<ModalManager />
		</>
	);
};
