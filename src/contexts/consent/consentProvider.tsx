import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { ConsentContext } from "./consentContext";
import { consentConfig, defaultConsentStates } from "@src/constants/consent.constants";
import { ConsentStorageService } from "@src/services/consent/consentStorage.service";
import { GoogleConsentModeService } from "@src/services/consent/googleConsentMode.service";
import { RegionDetectionService } from "@src/services/consent/regionDetection.service";
import type { ConsentContext as ConsentContextType, ConsentRecord, ConsentStates } from "@src/types/consent.type";

interface ConsentProviderProps {
	children: React.ReactNode;
}

export const ConsentProvider: React.FC<ConsentProviderProps> = ({ children }) => {
	const { i18n } = useTranslation();

	const [isLoaded, setIsLoaded] = useState(false);
	const [consentRecord, setConsentRecord] = useState<ConsentRecord | null>(null);
	const [purposes, setPurposes] = useState<ConsentStates>(defaultConsentStates);
	const [showBanner, setShowBanner] = useState(false);
	const [showPreferences, setShowPreferences] = useState(false);

	// Create a new consent record
	const createConsentRecord = useCallback(
		(consentStates: ConsentStates): ConsentRecord => {
			return {
				version: consentConfig.version,
				bannerVersion: consentConfig.bannerVersion,
				timestamp: Date.now(),
				language: i18n.language || consentConfig.defaultLanguage,
				region: RegionDetectionService.getDetectedRegion() || undefined,
				purposes: consentStates,
			};
		},
		[i18n.language]
	);

	// Initialize consent system
	useEffect(() => {
		const initializeConsent = async () => {
			try {
				// Initialize Google Consent Mode in denied state
				GoogleConsentModeService.initialize();

				// Detect user's region for compliance requirements
				const profile = await RegionDetectionService.detectRegion();

				// Load existing consent record
				const existingRecord = ConsentStorageService.load();

				if (existingRecord) {
					// Check if consent is still valid
					const isExpired = ConsentStorageService.isConsentExpired(
						existingRecord,
						consentConfig.consentDuration
					);

					if (isExpired || existingRecord.version !== consentConfig.version) {
						// Consent is expired or version changed - need new consent
						ConsentStorageService.clear();
						setPurposes(profile.defaultConsentStates);
						setShowBanner(profile.requiresExplicitConsent);
						setConsentRecord(null);
					} else {
						// Valid existing consent
						setConsentRecord(existingRecord);
						setPurposes(existingRecord.purposes);

						// Update Google Consent Mode with existing preferences
						GoogleConsentModeService.updateConsent(existingRecord.purposes);

						// Emit consent loaded event
						ConsentStorageService.emitConsentEvent("consent_loaded", existingRecord);
					}
				} else {
					// No existing consent
					setPurposes(profile.defaultConsentStates);
					setShowBanner(profile.requiresExplicitConsent);

					// For regions that don't require explicit consent, create implicit record
					if (!profile.requiresExplicitConsent) {
						const implicitRecord = createConsentRecord(profile.defaultConsentStates);
						setConsentRecord(implicitRecord);
						ConsentStorageService.save(implicitRecord);
						GoogleConsentModeService.updateConsent(profile.defaultConsentStates);
						ConsentStorageService.emitConsentEvent("consent_loaded", implicitRecord);
					}
				}

				setIsLoaded(true);
			} catch {
				// Failed to initialize consent system - fallback behavior

				// Fallback: show banner and require explicit consent
				setPurposes(defaultConsentStates);
				setShowBanner(true);
				setIsLoaded(true);
			}
		};

		initializeConsent();
	}, [createConsentRecord]);

	// Save consent and update integrations
	const saveConsent = useCallback(
		(newPurposes: ConsentStates) => {
			const record = createConsentRecord(newPurposes);

			// Update state
			setConsentRecord(record);
			setPurposes(newPurposes);

			// Persist to storage
			ConsentStorageService.save(record);

			// Update Google Consent Mode
			GoogleConsentModeService.updateConsent(newPurposes);

			// Emit consent updated event
			ConsentStorageService.emitConsentEvent("consent_updated", record);

			// Hide banner and preferences modal
			setShowBanner(false);
			setShowPreferences(false);
		},
		[createConsentRecord]
	);

	// Accept all non-essential purposes
	const acceptAll = useCallback(() => {
		const allGranted: ConsentStates = {
			"strictly-necessary": "granted",
			functional: "granted",
			analytics: "granted",
			marketing: "granted",
		};

		saveConsent(allGranted);
	}, [saveConsent]);

	// Reject all non-essential purposes
	const rejectAll = useCallback(() => {
		const allRejected: ConsentStates = {
			"strictly-necessary": "granted", // Always granted
			functional: "denied",
			analytics: "denied",
			marketing: "denied",
		};

		saveConsent(allRejected);
	}, [saveConsent]);

	// Update specific purposes (partial update)
	const updatePurposes = useCallback(
		(updatedPurposes: Partial<ConsentStates>) => {
			const newPurposes: ConsentStates = {
				...purposes,
				...updatedPurposes,
				"strictly-necessary": "granted", // Always ensure strictly necessary is granted
			};

			saveConsent(newPurposes);
		},
		[purposes, saveConsent]
	);

	// UI controls
	const openPreferences = useCallback(() => {
		setShowPreferences(true);
	}, []);

	const closePreferences = useCallback(() => {
		setShowPreferences(false);
	}, []);

	const closeBanner = useCallback(() => {
		setShowBanner(false);
	}, []);

	// Reset all consent (for testing/debugging)
	const resetConsent = useCallback(() => {
		ConsentStorageService.clear();
		RegionDetectionService.clearCache();
		setConsentRecord(null);
		setPurposes(defaultConsentStates);
		setShowBanner(true);
		setShowPreferences(false);
		setIsLoaded(false);

		// Re-initialize
		window.location.reload();
	}, []);

	// Derived state
	const hasConsent = useMemo(() => consentRecord !== null, [consentRecord]);

	// Context value
	const contextValue: ConsentContextType = useMemo(
		() => ({
			isLoaded,
			hasConsent,
			consentRecord,
			purposes,
			showBanner,
			showPreferences,
			acceptAll,
			rejectAll,
			updatePurposes,
			openPreferences,
			closePreferences,
			closeBanner,
			resetConsent,
		}),
		[
			isLoaded,
			hasConsent,
			consentRecord,
			purposes,
			showBanner,
			showPreferences,
			acceptAll,
			rejectAll,
			updatePurposes,
			openPreferences,
			closePreferences,
			closeBanner,
			resetConsent,
		]
	);

	return <ConsentContext.Provider value={contextValue}>{children}</ConsentContext.Provider>;
};
