import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { tours } from "@src/constants/tour.constants";
import { EventListenerName } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { AppProviderProps } from "@src/interfaces/components";
import { useModalStore, useProjectStore, useToastStore, useTourStore } from "@src/store";
import { getTimeUntilUnblock, requestBlocker, shouldShowStepOnPath, unblockRequestsImmediately } from "@src/utilities";

import { Toast } from "@components/molecules";
import { TourManager } from "@components/organisms";
import { RateLimitModal } from "@components/organisms/modals";
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

	const [timeLeft, setTimeLeft] = useState(getTimeUntilUnblock());

	useEffect(() => {
		const interval = setInterval(() => {
			const remaining = getTimeUntilUnblock();
			setTimeLeft(remaining);

			if (remaining <= 0 && requestBlocker.isBlocked) {
				unblockRequestsImmediately();
				closeModal(ModalName.rateLimit);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, []);

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

	const contactSales = () => {
		closeModal(ModalName.rateLimit);
		window.open("mailto:sales@autokitteh.com.com", "_blank");
	};

	const cancelTour = () => {
		closeModal(ModalName.continueTour);
		stopTour();
	};

	useEventListener(EventListenerName.displayrateLimitModal, (event) => {
		openModal(ModalName.rateLimit, {
			limit: event.detail.limit,
			used: event.detail.used,
			resourceName: event.detail.resourceName,
		});
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

	return (
		<>
			{children}
			<Toast />
			<TourManager />
			<ContinueTourModal onCancel={cancelTour} onContinue={continueTour} />
			<RateLimitModal onOkClick={contactSales} timeLeft={timeLeft} />
		</>
	);
};
