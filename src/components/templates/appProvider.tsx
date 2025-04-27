import React, { useEffect, useState, useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { supportEmail, tours } from "@src/constants";
import { ModalName } from "@src/enums";
import { EventListenerName } from "@src/enums/eventListenerNames.enum";
import { AppProviderProps } from "@src/interfaces/components";
import { useModalStore, useProjectStore, useToastStore, useTourStore } from "@src/store";
import { shouldShowStepOnPath } from "@src/utilities";

import { useEventListener, useRateLimitHandler } from "@hooks";

import { Toast } from "@components/molecules";
import { TourManager } from "@components/organisms";
import { RateLimitModal, QuotaLimitModal } from "@components/organisms/modals";
import { ContinueTourModal } from "@components/organisms/tour";

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
	const { isRetrying, onRetryClick } = useRateLimitHandler();
	const [rateLimitModalDisplayed, setRateLimitModalDisplayed] = useState(false);
	const [quotaLimitModalDisplayed, setQuotaLimitModalDisplayed] = useState(false);

	const continueTour = () => {
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

	const cancelTour = useCallback(() => {
		closeModal(ModalName.continueTour);
		stopTour();
	}, [closeModal, stopTour]);

	const displayRateLimitModal = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(_: CustomEvent) => {
			if (!rateLimitModalDisplayed) {
				openModal(ModalName.rateLimit);
				setRateLimitModalDisplayed(true);
			}
		},
		[rateLimitModalDisplayed, openModal]
	);

	const displayQuotaLimitModal = useCallback(
		({
			detail: { limit, resourceName, used },
		}: CustomEvent<{ limit: string; resourceName: string; used: string }>) => {
			if (!quotaLimitModalDisplayed) {
				closeAllModals();
				openModal(ModalName.quotaLimit, { limit, resource: resourceName, used });
				setQuotaLimitModalDisplayed(true);
			}
		},
		[quotaLimitModalDisplayed, closeAllModals, openModal]
	);

	const hideRateLimitModal = useCallback(() => {
		closeModal(ModalName.rateLimit);
		setRateLimitModalDisplayed(false);
	}, [closeModal]);

	const hideQuotaLimitModal = useCallback(() => {
		closeModal(ModalName.quotaLimit);
		setQuotaLimitModalDisplayed(false);
	}, [closeModal]);

	useEventListener(EventListenerName.displayRateLimitModal, displayRateLimitModal);
	useEventListener(EventListenerName.displayQuotaLimitModal, displayQuotaLimitModal);
	useEventListener(EventListenerName.hideRateLimitModal, hideRateLimitModal);
	useEventListener(EventListenerName.hideQuotaLimitModal, hideQuotaLimitModal);

	useEffect(() => {
		if (!activeTour.tourId || !activeStep) return;
		const currentTour = tours[activeTour.tourId];
		const configStep = currentTour.steps.find((step) => step.id === activeStep.id);
		const tourProjectExists = projectsList.find((project) => project.id === tourProjectId);
		if (configStep && !shouldShowStepOnPath(configStep, location.pathname) && !!tourProjectExists) {
			openModal(ModalName.continueTour, { name: tours?.[activeTour?.tourId]?.name });
		}
	}, [activeTour.tourId, activeStep, projectsList, tourProjectId, openModal]);

	const onContactSupportClick = useCallback(() => {
		try {
			window.open(`mailto:${supportEmail}`, "_blank");
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			const mailtoLink = document.createElement("a");
			mailtoLink.href = `mailto:${supportEmail}`;
			mailtoLink.target = "_blank";
			mailtoLink.click();
		}
	}, []);

	return (
		<>
			{children}
			<Toast />
			<TourManager />
			<ContinueTourModal onCancel={cancelTour} onContinue={continueTour} />
			<RateLimitModal isRetrying={isRetrying} onRetryClick={onRetryClick} />
			<QuotaLimitModal onContactSupportClick={onContactSupportClick} />
		</>
	);
};
