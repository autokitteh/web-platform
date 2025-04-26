import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { supportEmail, tours } from "@constants";
import { EventListenerName, ModalName } from "@enums";
import { AppProviderProps } from "@interfaces/components";
import { shouldShowStepOnPath } from "@utilities";

import { useEventListener, useRateLimitHandler } from "@hooks";
import { useModalStore, useProjectStore, useToastStore, useTourStore } from "@store";

import { Toast } from "@components/molecules";
import { TourManager } from "@components/organisms";
import { RateLimitModal, QuotaLimitModal } from "@components/organisms/modals";
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
	const { openModal, closeModal, closeAllModals } = useModalStore();
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();
	const { addToast } = useToastStore();
	const { t } = useTranslation("tour", { keyPrefix: "general" });
	const { isRetrying, onRetryClick } = useRateLimitHandler();
	const [limitModalDisplayed, setLimitModalDisplayed] = useState(false);

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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const displayRateLimitModal = (_: CustomEvent) => {
		if (!limitModalDisplayed) {
			openModal(ModalName.rateLimit);
			setLimitModalDisplayed(true);
		}
	};

	const displayQuotaLimitModal = ({
		detail: { limit, resourceName, used },
	}: CustomEvent<{ limit: string; resourceName: string; used: string }>) => {
		if (!limitModalDisplayed) {
			closeAllModals();
			openModal(ModalName.quotaLimit, { limit, resource: resourceName, used });
			setLimitModalDisplayed(true);
		}
	};

	useEventListener(EventListenerName.displayRateLimitModal, displayRateLimitModal);
	useEventListener(EventListenerName.displayQuotaLimitModal, displayQuotaLimitModal);
	useEventListener(EventListenerName.hideRateLimitModal, () => {
		closeModal(ModalName.rateLimit);
		setLimitModalDisplayed(false);
	});
	useEventListener(EventListenerName.hideQuotaLimitModal, () => {
		closeModal(ModalName.quotaLimit);
	});

	useEffect(() => {
		if (!activeTour.tourId || !activeStep) return;
		const currentTour = tours[activeTour.tourId];
		const configStep = currentTour.steps.find((step) => step.id === activeStep.id);
		const tourProjectExists = projectsList.find((project) => project.id === tourProjectId);
		if (configStep && !shouldShowStepOnPath(configStep, location.pathname) && !!tourProjectExists) {
			openModal(ModalName.continueTour, { name: tours?.[activeTour?.tourId]?.name });
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
			<RateLimitModal isRetrying={isRetrying} onRetryClick={onRetryClick} />
			<QuotaLimitModal onContactSupportClick={onContactSupportClick} />
		</>
	);
};
