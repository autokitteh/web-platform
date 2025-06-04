/**
 * Centralized type definitions for modal data requirements
 * This file contains all modal data type mappings for type-safe modal management
 */

import { ModalName } from "@enums/components";
import { DiagramViewerModalProps, FileViewerModalProps } from "@interfaces/components";
import { EnrichedOrganization } from "@src/types/models";

// Base types for commonly used modal data
export interface VideoModalData {
	video: string;
}

export interface DeleteProjectData {
	projectName?: string;
}

export interface QuotaLimitData {
	limit: string;
	resource: string;
	used: string;
}

export interface TourProgressData {
	name?: string;
}

export interface TemplateCreateProjectData {
	infoMessage?: string;
}

export interface InvitedUserData {
	organizationId: string;
	organizationName: string;
}

export interface DeleteMemberData {
	userId: string;
	email: string;
}

/**
 * Complete type mapping for all modals in the application
 * Each modal type is mapped to its specific data requirements
 */
export interface ModalDataMap {
	// File and content modals
	[ModalName.fileViewer]: FileViewerModalProps;
	[ModalName.diagramViewer]: DiagramViewerModalProps;

	// Video and welcome modals
	[ModalName.welcomePage]: VideoModalData;

	// Project management modals
	[ModalName.newProject]: undefined; // No data required
	[ModalName.importProject]: undefined; // No data required
	[ModalName.deleteProject]: DeleteProjectData;
	[ModalName.deleteWithActiveDeploymentProject]: undefined; // Uses callbacks from props
	[ModalName.deleteWithDrainingDeploymentProject]: undefined; // No data required
	[ModalName.duplicateProject]: undefined; // Uses callbacks from props

	// Template modals
	[ModalName.templateCreateProject]: TemplateCreateProjectData;

	// Connection modals
	[ModalName.deleteConnection]: string; // connectionId

	// Deployment modals
	[ModalName.deleteDeployment]: string; // deploymentId
	[ModalName.deleteDeploymentSession]: string; // sessionId

	// File operations
	[ModalName.addCodeAssets]: undefined; // No data required
	[ModalName.deleteFile]: string; // fileName

	// Variables and triggers
	[ModalName.deleteVariable]: string; // variableId
	[ModalName.deleteTrigger]: string; // triggerId

	// Organization management
	[ModalName.deleteOrganization]: EnrichedOrganization;
	[ModalName.organizationCreated]: InvitedUserData;
	[ModalName.organizationMemberCreate]: undefined; // Uses callbacks from props
	[ModalName.deleteMemberFromOrg]: DeleteMemberData;
	[ModalName.invitedUser]: InvitedUserData;

	// Account management
	[ModalName.deleteAccount]: undefined; // Uses callbacks from props

	// System modals
	[ModalName.quotaLimit]: QuotaLimitData;
	[ModalName.rateLimit]: undefined; // Uses callbacks from props
	[ModalName.getToken]: undefined; // No data required

	// Tour and guidance
	[ModalName.toursProgress]: TourProgressData;
	[ModalName.continueTour]: TourProgressData;

	// Event management
	[ModalName.redispatchEvent]: undefined; // Uses callbacks from props

	// Warnings and alerts
	[ModalName.warningDeploymentActive]: undefined; // Uses callbacks from props

	// Bot modal
	[ModalName.botModal]: undefined; // No data required
}

/**
 * Helper type to extract the data type for a specific modal
 */
export type ModalData<T extends ModalName> = ModalDataMap[T];

/**
 * Type for modal opening function with proper type safety
 */
export type OpenModalFn = <T extends ModalName>(
	name: T,
	...args: ModalDataMap[T] extends undefined ? [] : [data: ModalDataMap[T]]
) => void;

/**
 * Generic modal component props that include typed data
 */
export interface TypedModalProps<T extends ModalName> {
	modalName: T;
	data: ModalDataMap[T];
	isOpen: boolean;
	onClose: () => void;
}

/**
 * Modal registry type for dynamic modal rendering
 */
export type ModalComponentMap = {
	[K in ModalName]: React.ComponentType<any>;
};
