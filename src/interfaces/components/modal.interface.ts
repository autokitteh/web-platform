import { TemplateMetadata } from "@interfaces/store";
import { SelectOption } from "@src/interfaces/components";
import { EnrichedEvent, EnrichedOrganization, Variable } from "@src/types/models";
import { ColorSchemes } from "@type";

export interface ModalProps {
	"data-testid"?: string;
	children: React.ReactNode;
	className?: string;
	name: string;
	hideCloseButton?: boolean;
	focusTabIndexOnLoad?: number;
	closeButtonClass?: string;
	hideOverlay?: boolean;
	wrapperClass?: string;
	forceOpen?: boolean;
	onCloseCallbackOverride?: () => void;
	clickOverlayToClose?: boolean;
	variant?: ColorSchemes;
}
export interface DeleteModalProps {
	onDelete: () => void;
	id?: string;
	isDeleting: boolean;
	isOrgConnection?: boolean;
}

export interface ModalDeleteVariableProps {
	onDelete?: () => void;
	variable?: Variable;
	isDeleting?: boolean;
}

export interface ModalModifyVariableProps {
	onError: (message: string) => void;
}

export interface DeleteMemberModalProps {
	onDelete: (userId: string, email: string) => void;
	isDeleting: boolean;
}
export interface DeleteOrganizationModalProps {
	onDelete: (organization: EnrichedOrganization) => void;
	isDeleting: boolean;
}

export interface DeleteAccountModalProps {
	onDelete: () => void;
}

export interface CreateProjectModalProps {
	template: TemplateMetadata;
	readme: string;
	isReadmeLoading: boolean;
	isCreating: boolean;
	projectNamesList: string[];
	onSubmit: (projectName: string) => Promise<void>;
	onCancel: () => void;
}

export interface DiagramViewerModalProps {
	content: string;
}

export interface ProjectTemplateCreateContainerProps {
	template: TemplateMetadata;
}

export interface ActiveDeploymentWarningModalProps {
	goToEdit: (modifiedId: string) => void;
	goToAdd: () => void;
	modifiedId: string;
	action?: "add" | "edit";
}

export interface CreateMemberModalProps {
	createMember: (email: string) => void;
	isCreating: boolean;
	membersEmails: Set<string>;
}

export interface CreateMemberModalRef {
	resetForm: () => void;
}

export interface RedispatchEventModalProps {
	eventInfo?: EnrichedEvent;
	activeDeployment?: string;
	isLoading: boolean;
	projectOptions: SelectOption[];
	selectedProject: SelectOption | null;
	onProjectChange: (option: SelectOption | null) => void;
	onSubmit: () => void;
}

export interface DuplicateProjectModalProps {
	isLoading: boolean;
	error?: string;
	onProjectNameChange: (value: string) => void;
	onSubmit: () => void;
}

export interface ContinueTourModalProps {
	onContinue: () => void;
	onCancel: () => void;
}

export interface RateLimitModalProps {
	onRetryClick: () => void;
	isRetrying: boolean;
}

export interface QuotaLimitModalProps {
	onContactSupportClick: () => void;
}
