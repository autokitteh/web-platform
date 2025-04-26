import React, { useCallback, useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { supportEmail, tours } from "@constants";
import { EventListenerName, ModalName } from "@enums";
import { AppProviderProps } from "@interfaces/components";
import ErrorBoundary from "@src/errorBoundaries";
import { shouldShowStepOnPath } from "@utilities";

import { useEventListener, useRateLimitHandler } from "@hooks";
import { useModalStore, useProjectStore, useToastStore, useTourStore } from "@store";

import { Toast } from "@components/molecules";
import { TourManager } from "@components/organisms";
import { RateLimitModal, QuotaLimitModal } from "@components/organisms/modals";
import { ContinueTourModal } from "@components/organisms/tour/continueTourModal";

export const AppProvider = ({ children }: AppProviderProps) => {
	console.count("AppProvider render");

	const {
		skipTour: stopTour,
		activeTour,
		activeStep,
		getLastStepUrl,
		setPopoverVisible,
		tourProjectId,
	} = useTourStore();
	const { openModal, closeModal, closeAllModals, modals } = useModalStore();
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();
	const { addToast } = useToastStore();
	const { t } = useTranslation("tour", { keyPrefix: "general" });
	const { isRetrying, onRetryClick } = useRateLimitHandler();
	const rateLimitModalDisplayed = useRef(false);
	const quotaLimitModalDisplayed = useRef(false);

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

	const displayRateLimitModal = useCallback(
		(_: CustomEvent) => {
			console.log("EventListener fired: displayRateLimitModal");
			if (!rateLimitModalDisplayed.current) {
				console.log("Opening RateLimitModal");
				openModal(ModalName.rateLimit);
				rateLimitModalDisplayed.current = true;
			} else {
				console.log("RateLimitModal already displayed, not opening again.");
			}
		},
		[openModal]
	);

	const displayQuotaLimitModal = ({
		detail: { limit, resourceName, used },
	}: CustomEvent<{ limit: string; resourceName: string; used: string }>) => {
		console.log("EventListener fired: displayQuotaLimitModal", { limit, resourceName, used });
		if (!quotaLimitModalDisplayed.current) {
			console.log("Opening QuotaLimitModal");
			closeAllModals();
			openModal(ModalName.quotaLimit, { limit, resource: resourceName, used });
			quotaLimitModalDisplayed.current = true;
		} else {
			console.log("QuotaLimitModal already displayed, not opening again.");
		}
	};

	useEventListener(EventListenerName.displayRateLimitModal, displayRateLimitModal);
	useEventListener(EventListenerName.displayQuotaLimitModal, displayQuotaLimitModal);
	useEventListener(EventListenerName.hideRateLimitModal, () => {
		console.log("EventListener fired: hideRateLimitModal");
		closeModal(ModalName.rateLimit);
		rateLimitModalDisplayed.current = false;
	});
	useEventListener(EventListenerName.hideQuotaLimitModal, () => {
		console.log("EventListener fired: hideQuotaLimitModal");
		closeModal(ModalName.quotaLimit);
		quotaLimitModalDisplayed.current = false;
	});

	useEffect(() => {
		console.log("Tour useEffect triggered");
		if (!activeTour.tourId || !activeStep) return;
		const currentTour = tours[activeTour.tourId];
		const configStep = currentTour.steps.find((step) => step.id === activeStep.id);
		const tourProjectExists = projectsList.find((project) => project.id === tourProjectId);
		if (configStep && !shouldShowStepOnPath(configStep, location.pathname) && !!tourProjectExists) {
			openModal(ModalName.continueTour, { name: tours?.[activeTour?.tourId]?.name });
		}
	}, [activeTour, activeStep, projectsList, tourProjectId]);

	const onContactSupportClick = () => {
		try {
			window.open(`mailto:${supportEmail}`, "_blank");
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
			<ContinueTourModal onCancel={cancelTour} onContinue={continueTour} />
			<ErrorBoundary>
				<RateLimitModal isRetrying={isRetrying} onRetryClick={onRetryClick} />
			</ErrorBoundary>
			<ErrorBoundary>
				<QuotaLimitModal onContactSupportClick={onContactSupportClick} />
			</ErrorBoundary>
		</>
	);
};
