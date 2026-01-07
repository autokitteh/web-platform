export type { AccordionProps } from "@interfaces/components/accordion.interface";
export type { ActivityRowProps } from "@interfaces/components/activity.interface";
export type { BadgeProps } from "@interfaces/components/badge.interface";
export type {
	ButtonProps,
	DropdownButtonProps,
	IconButtonProps,
	SortButtonProps,
	RefreshButtonProps,
} from "@interfaces/components/button.interface";
export type { CheckboxProps } from "@interfaces/components/checkbox.interface";
export type { DeploymentStatusBadgeProps } from "@interfaces/components/deploymentStatusBadge.interface";
export type { DrawerProps } from "@interfaces/components/drawer.interface";
export type { ErrorMessageProps } from "@interfaces/components/error.interface";
export type {
	InputProps,
	ITimezoneOption,
	PartialSelectOption,
	SelectOption,
	SelectProps,
	TextArea,
	SelectIconLabel,
	SelectConnectionIconLabel,
	TimezoneSelectProps,
	SelectGroup,
} from "@interfaces/components/forms";
export type { SecretInputProps } from "@interfaces/components/forms/secretInput.interface";
export type { FrameProps, SplitFrameProps } from "@interfaces/components/frame.interface";
export type { HrefProps } from "@interfaces/components/href.interface";
export type { IconProps, IconSvgProps } from "@interfaces/components/icon.interface";
export type { LinkProps } from "@interfaces/components/link.interface";
export type { LoaderProps } from "@interfaces/components/loader.interface";
export type { LoginPageProps } from "@interfaces/components/loginPage.interface";
export type { LogoCatLargeProps } from "@interfaces/components/logo.interface";
export type { MenuProps, NavigationSettingsItem } from "@interfaces/components/menu.interface";
export type {
	ProjectTemplateCreateContainerProps,
	CreateProjectModalProps,
	DeleteMemberModalProps,
	DeleteModalProps,
	ModalDeleteVariableProps,
	ModalModifyVariableProps,
	ModalProps,
	ActiveDeploymentWarningModalProps,
	CreateMemberModalProps,
	DeleteAccountModalProps,
	CreateMemberModalRef,
	DeleteOrganizationModalProps,
	RedispatchEventModalProps,
	DuplicateProjectModalProps,
	ContinueTourModalProps,
	QuotaLimitModalProps,
	RateLimitModalProps,
	DiagramViewerModalProps,
} from "@interfaces/components/modal.interface";
export type { NotificationProps } from "@interfaces/components/notification.interface";
export type {
	PopoverOptions,
	PopoverTriggerProps,
	PopoverContentBaseProps,
	MultiplePopoverSelectProps,
} from "@interfaces/components/popover.interface";
export type {
	SessionTableFilterProps,
	SessionsTableListProps,
	SessionsTableRowProps,
} from "@interfaces/components/session.interface";
export type { SpinnerProps } from "@interfaces/components/spinner.interface";
export type { StatusProps } from "@interfaces/components/status.interface";
export type { TabFormHeaderProps } from "@interfaces/components/tabFormHeader.interface";
export type {
	TableProps,
	TableContainerProps,
	TableRowGroupProps,
	TableRowProps,
	TableVariantContextType,
} from "@interfaces/components/table.interface";
export type { TableHeader } from "@interfaces/components/tables";
export type { TabListProps, TabProps, TabsContextProps, TabsProps } from "@interfaces/components/tabs.interface";
export type { Toast } from "@interfaces/components/toast.interface";
export type { ToggleProps } from "@interfaces/components/toggle.interface";
export type { TypographyProps } from "@interfaces/components/typography.interface";
export type { UserFeedbackFormProps } from "@interfaces/components/userFeedback.interface";
export type {
	WelcomeVideoCardProps,
	DashboardProjectsTableRowProps,
} from "@src/interfaces/components/dashboard.interface";
export type { ManualRunFormData } from "@interfaces/components/manualRunForm.interface";
export type { TooltipProps } from "@interfaces/components/tooltip.interface";
export type { WelcomeCardProps } from "@interfaces/components/welcomeCard.interface";
export type { TourPopoverProps } from "@interfaces/components/tour.interface";
export type { ArrowStyleConfig } from "@interfaces/components/dashedArrowStyles.interface";
export type { AppProviderProps } from "@interfaces/components/providers/appProvider.interface";
export type { RadioButtonProps } from "@interfaces/components/radioButton.interface";
export type { ChatbotIframeProps } from "@interfaces/components/chatbot.interface";
export type { UsageProgressBarProps } from "@interfaces/components/apexMinMaxChart.interface";
export type { BillingSwitcherProps } from "@interfaces/components/billing.interface";
export type { OrganizationManagePlanMenuProps } from "@interfaces/components/billingManagePlanMenu.interface";
export type { TableHeaderProps, SortableHeaderProps } from "@interfaces/components/eventsTable.interface";
export type {
	FrontendProjectValidationProps,
	FrontendProjectValidationIndicatorProps,
} from "./frontendProjectValidation.interface";

// New component interfaces
export type { MermaidDiagramProps } from "./mermaidDiagram.interface";
export type { LoadingOverlayProps } from "./loadingOverlay.interface";
export type { ResizeButtonProps } from "./resizeButton.interface";
export type { ChatbotToolbarProps } from "./chatbotToolbar.interface";
export type { ChatbotLoadingStatesProps } from "./chatbotLoadingStates.interface";
export type { CodeFixDiffEditorProps } from "./codeFixDiffEditor.interface";

// Project configuration components
export type { ActiveIndicatorProps } from "./activeIndicator.interface";
export type {
	ConfigurationSectionListProps,
	ProjectSettingsItem,
	ProjectSettingsItemAction,
	VariableItem,
	ConnectionItem,
	TriggerItem,
	VariablesSectionListProps,
	ConnectionsSectionListProps,
	TriggersSectionListProps,
	ConnectionInfoPopoverProps,
	ConnectionItemDisplayProps,
} from "./configurationSection.interface";
export type {
	ConnectionsProps,
	TriggersProps,
	VariablesProps,
	EditConnectionProps,
	AddConnectionProps,
	AddTriggerProps,
	EditTriggerProps,
	AddVariableProps,
	EditVariableProps,
	IntegrationAddFormProps,
} from "./configuration.interface";
export type { NavigationButtonProps } from "./navigationButton.interface";
export type { BaseSelectProps } from "./forms/baseSelect.interface";
export type { FileTreeNode, FileTreeProps, NodeProps } from "./fileTree.interface";
export type { DeleteFileModalData, FileTabMenuProps } from "./files.interface";
export type {
	CodeFixMessageProps,
	DeleteFileConfirmationProps,
	BulkCodeFixSuggestion,
	BulkCodeFixResult,
	BulkCodeFixHandlerOptions,
} from "./codeSuggestion.interface";
export type { SkeletonLoaderProps } from "./skeleton.interface";
// Integration component interfaces
export * from "./integrations";
export type { SuggestionPill } from "./aiSuggestionPill.interface";

export type {
	SessionStatusData,
	SessionsOverTimeData,
	EventsByTriggerData,
	IntegrationUsageData,
	RecentSessionData,
	DashboardSummary,
	SessionsByStatus,
	TotalCountersData,
} from "./dashboardStats.interface";
export type { ProjectsTableMeta } from "./projectsTable.interface";
export type {
	IntegrationNodeData,
	WorkflowNode,
	WorkflowEdge,
	WorkflowBuilderState,
	LegacyWorkflowEdgeData,
	WorkflowEdgeVariable,
} from "./workflowBuilder.interface";
