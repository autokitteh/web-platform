import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { tours } from "@src/constants/tour.constants";
import { ModalName } from "@src/enums/components";
import { AppProviderProps } from "@src/interfaces/components";
import { useModalStore, useProjectStore, useToastStore, useTourStore } from "@src/store";
import { shouldShowStepOnPath } from "@src/utilities";

import { Toast } from "@components/molecules";
import { TourManager } from "@components/organisms";
import { ContinueTourModal } from "@components/organisms/tour/continueTourModal";

export const AppProvider = ({ children }: AppProviderProps) => {
	const {
		skipTour: stopTour,
		activeTour,
		activeStep,
		getLastStepUrl,
		setPopoverVisible,
		tourProjectId,
	} = useTourStore();
	const { openModal, closeModal } = useModalStore();
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();
	const { addToast } = useToastStore();
	const { t } = useTranslation("tour", { keyPrefix: "general" });

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
		if (configStep && !shouldShowStepOnPath(configStep, location.pathname) && !!tourProjectExists) {
			openModal(ModalName.continueTour, { name: tours?.[activeTour?.tourId]?.name });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeStep, activeTour.tourId, location.pathname, tourProjectId]);

	// const displayRateLimitModal =
	// 	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// 	(_: CustomEvent) => {
	// 		if (!rateLimitModalDisplayed) {
	// 			openModal(ModalName.rateLimit);
	// 			setRateLimitModalDisplayed(true);
	// 		}
	// 	};

	// const displayQuotaLimitModal = ({
	// 	detail: { limit, resourceName, used },
	// }: CustomEvent<{ limit: string; resourceName: string; used: string }>) => {
	// 	if (!quotaLimitModalDisplayed) {
	// 		closeAllModals();
	// 		openModal(ModalName.quotaLimit, { limit, resource: resourceName, used });
	// 		setQuotaLimitModalDisplayed(true);
	// 	}
	// };

	// const hideRateLimitModal = () => {
	// 	closeModal(ModalName.rateLimit);
	// 	setRateLimitModalDisplayed(false);
	// };

	// const hideQuotaLimitModal = () => {
	// 	closeModal(ModalName.quotaLimit);
	// 	setQuotaLimitModalDisplayed(false);
	// };

	// useEventListener(EventListenerName.displayRateLimitModal, displayRateLimitModal);
	// useEventListener(EventListenerName.displayQuotaLimitModal, displayQuotaLimitModal);
	// useEventListener(EventListenerName.hideRateLimitModal, hideRateLimitModal);
	// useEventListener(EventListenerName.hideQuotaLimitModal, hideQuotaLimitModal);

	// const onContactSupportClick = () => {
	// 	try {
	// 		window.open(`mailto:${supportEmail}`, "_blank");
	// 		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// 	} catch (error) {
	// 		const mailtoLink = document.createElement("a");
	// 		mailtoLink.href = `mailto:${supportEmail}`;
	// 		mailtoLink.target = "_blank";
	// 		mailtoLink.click();
	// 	}
	// };

	return (
		<>
			{children}
			<Toast />
			<TourManager />
			<ContinueTourModal onCancel={cancelTour} onContinue={continueTour} />
		</>
	);
};
