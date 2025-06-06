/**
 * Centralized Modal Manager Component
 *
 * This component serves as the single root modal renderer for the entire application.
 * It automatically renders the appropriate modal based on the active modal state
 * from the modal store, providing type-safe data passing to each modal component.
 *
 * Features:
 * - Single modal root component
 * - Type-safe modal data handling
 * - Automatic modal component registration
 * - Centralized modal state management
 */

import React from "react";

import { ModalName } from "@enums/components";
import { useModalStore } from "@src/store";
import { ModalComponentMap } from "@src/types/modals.types";

// Import all modal components for registration
import { ActiveDeploymentWarningModal } from "@components/organisms/activeDeploymentWarningModal";
import { BotModal } from "@components/organisms/chatbotIframe/botModal";
import { AddFileModal } from "@components/organisms/code/addModal";
import { DeleteFileModal } from "@components/organisms/code/deleteModal";
import { DeleteConnectionModal } from "@components/organisms/connections/deleteModal";
import { ProjectTemplateCreateModalContainer } from "@components/organisms/dashboard/templates/tabs/createModalWrapper";
import { WelcomeVideoModal } from "@components/organisms/dashboard/welcomeVideoModal";
import { DeleteDeploymentModal } from "@components/organisms/deployments/deleteModal";
import { DeleteSessionModal } from "@components/organisms/deployments/sessions/deleteModal";
import { RedispatchEventModal } from "@components/organisms/events/table/redispatchEventModal";
import { DeleteActiveDeploymentProjectModal } from "@components/organisms/modals/deleteActiveDeploymentProjectModal";
import { DeleteDrainingDeploymentProjectModal } from "@components/organisms/modals/deleteDrainingDeploymentProjectModal";
import { DeleteProjectModal } from "@components/organisms/modals/deleteProjectModal";
import { DiagramViewerModal } from "@components/organisms/modals/diagramViewerModal";
import { FileViewerModal } from "@components/organisms/modals/fileViewerModal";
import { ImportProjectModal } from "@components/organisms/modals/importProjectModal";
import { InvitedUserModal } from "@components/organisms/modals/invitedUserModal";
import { NewProjectModal } from "@components/organisms/modals/newProjectModal";
import {
	ContinueTourModalWrapper,
	QuotaLimitModalWrapper,
	RateLimitModalWrapper,
} from "@components/organisms/modals/wrappers";
import { DeleteOrganizationModal } from "@components/organisms/settings/organization/deleteModal";
import { CreateMemberModal } from "@components/organisms/settings/organization/members/createMemberModal";
import { DeleteMemberModal } from "@components/organisms/settings/organization/members/deleteMemberModal";
import { OrganizationPostCreationModal } from "@components/organisms/settings/organization/postCreationModal";
import { DeleteAccountModal } from "@components/organisms/settings/user/deleteModal";
import { DuplicateProjectModal } from "@components/organisms/topbar/project/duplicateProjectModal";
import { DeleteTriggerModal } from "@components/organisms/triggers/deleteModal";
import { DeleteVariableModal } from "@components/organisms/variables/deleteModal";

/**
 * Registry mapping modal names to their corresponding React components
 * This centralized registry ensures type safety and makes it easy to manage all modals
 */
const modalRegistry: Partial<ModalComponentMap> = {
	// File and code operations
	[ModalName.addCodeAssets]: AddFileModal,
	[ModalName.deleteFile]: DeleteFileModal,
	[ModalName.fileViewer]: FileViewerModal,
	[ModalName.diagramViewer]: DiagramViewerModal,

	// Project management
	[ModalName.newProject]: NewProjectModal,
	[ModalName.importProject]: ImportProjectModal,
	[ModalName.deleteProject]: DeleteProjectModal,
	[ModalName.deleteWithActiveDeploymentProject]: DeleteActiveDeploymentProjectModal,
	[ModalName.deleteWithDrainingDeploymentProject]: DeleteDrainingDeploymentProjectModal,
	[ModalName.duplicateProject]: DuplicateProjectModal,
	[ModalName.templateCreateProject]: ProjectTemplateCreateModalContainer,

	// Connections and deployments
	[ModalName.deleteConnection]: DeleteConnectionModal,
	[ModalName.deleteDeployment]: DeleteDeploymentModal,
	[ModalName.deleteDeploymentSession]: DeleteSessionModal,

	// Variables and triggers
	[ModalName.deleteVariable]: DeleteVariableModal,
	[ModalName.deleteTrigger]: DeleteTriggerModal,

	// Organization management
	[ModalName.deleteOrganization]: DeleteOrganizationModal,
	[ModalName.organizationCreated]: OrganizationPostCreationModal,
	[ModalName.organizationMemberCreate]: CreateMemberModal,
	[ModalName.deleteMemberFromOrg]: DeleteMemberModal,
	[ModalName.invitedUser]: InvitedUserModal,

	// Account management
	[ModalName.deleteAccount]: DeleteAccountModal,

	// System modals
	[ModalName.quotaLimit]: QuotaLimitModalWrapper,
	[ModalName.rateLimit]: RateLimitModalWrapper,

	// Tour and guidance
	[ModalName.continueTour]: ContinueTourModalWrapper,

	// Event management
	[ModalName.redispatchEvent]: RedispatchEventModal,

	// Warnings and alerts
	[ModalName.warningDeploymentActive]: ActiveDeploymentWarningModal,

	// Video and welcome
	[ModalName.welcomePage]: WelcomeVideoModal,

	// Bot modal
	[ModalName.botModal]: BotModal,
};

/**
 * Central Modal Manager Component
 *
 * This component acts as the single point of modal rendering for the entire application.
 * It monitors the modal store state and renders the appropriate modal component when one
 * is active. All modals are rendered through this component, ensuring centralized control
 * and type-safe data passing.
 */
export const ModalManager: React.FC = () => {
	const { modals } = useModalStore();

	// Find the first active modal
	const activeModalName = Object.keys(modals).find((modalName) => modals[modalName]) as ModalName | undefined;

	// If no modal is active, render nothing
	if (!activeModalName) {
		return null;
	}

	// Get the modal component from the registry
	const ModalComponent = modalRegistry[activeModalName];

	// If modal component is not registered, return nothing
	if (!ModalComponent) {
		return null;
	}

	// Render the modal component
	// Note: Most modal components handle their own data retrieval from the modal store
	// This is consistent with the current pattern used throughout the application
	return <ModalComponent />;
};
