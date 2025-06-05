import { ModalName } from "@enums/components";
import {
  DeleteProjectModal,
  ImportProjectModal,
  NewProjectModal,
  InvitedUserModal,
  DeleteActiveDeploymentProjectModal,
  DeleteDrainingDeploymentProjectModal,
  RateLimitModal,
  QuotaLimitModal,
  FileViewerModal,
  DiagramViewerModal,
} from "@components/organisms/modals";
import { ActiveDeploymentWarningModal } from "@components/organisms";
import { ContinueTourModal } from "@components/organisms/tour/continueTourModal";

/**
 * Configuration for rendering modals: mapping modal names to components and data requirements.
 */
export interface ModalConfig {
  component: React.ComponentType<any>;
  requiresData?: boolean;
}

export const modalRegistry: Record<ModalName, ModalConfig> = {
  [ModalName.deleteProject]: { component: DeleteProjectModal, requiresData: true },
  [ModalName.importProject]: { component: ImportProjectModal },
  [ModalName.newProject]: { component: NewProjectModal },
  [ModalName.invitedUser]: { component: InvitedUserModal, requiresData: true },
  [ModalName.deleteWithActiveDeploymentProject]: { component: DeleteActiveDeploymentProjectModal, requiresData: true },
  [ModalName.deleteWithDrainingDeploymentProject]: { component: DeleteDrainingDeploymentProjectModal, requiresData: true },
  [ModalName.rateLimit]: { component: RateLimitModal, requiresData: true },
  [ModalName.quotaLimit]: { component: QuotaLimitModal, requiresData: true },
  [ModalName.fileViewer]: { component: FileViewerModal, requiresData: true },
  [ModalName.diagramViewer]: { component: DiagramViewerModal, requiresData: true },
  [ModalName.warningDeploymentActive]: { component: ActiveDeploymentWarningModal, requiresData: true },
  [ModalName.continueTour]: { component: ContinueTourModal, requiresData: true },
  // Other modals can be added here as needed
};