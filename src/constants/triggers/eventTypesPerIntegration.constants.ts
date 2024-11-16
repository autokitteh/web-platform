export const eventTypes = {
	slack: [
		"app_deleted",
		"app_home_opened",
		"app_installed",
		"app_mention",
		"app_rate_limited",
		"app_requested",
		"app_uninstalled",
		"app_uninstalled_team",
		"assistant_thread_context_changed",
		"assistant_thread_started",
		"call_rejected",
		"channel_archive",
		"channel_created",
		"channel_deleted",
		"channel_history_changed",
		"channel_id_changed",
		"channel_left",
		"channel_rename",
		"channel_shared",
		"channel_unarchive",
		"channel_unshared",
		"dnd_updated",
		"dnd_updated_user",
		"email_domain_changed",
		"emoji_changed",
		"file_change",
		"file_comment_deleted",
		"file_created",
		"file_deleted",
		"file_public",
		"file_shared",
		"file_unshared",
		"function_executed",
		"grid_migration_finished",
		"grid_migration_started",
		"group_archive",
		"group_close",
		"group_deleted",
		"group_history_changed",
		"group_left",
		"group_open",
		"group_rename",
		"group_unarchive",
		"im_close",
		"im_created",
		"im_history_changed",
		"im_open",
		"invite_requested",
		"link_shared",
		"member_joined_channel",
		"member_left_channel",
		"message",
		"message.app_home",
		"message.channels",
		"message.groups",
		"message.im",
		"message.mpim",
		"message_metadata_deleted",
		"message_metadata_posted",
		"message_metadata_updated",
		"pin_added",
		"pin_removed",
		"reaction_added",
		"reaction_removed",
		"shared_channel_invite_accepted",
		"shared_channel_invite_approved",
		"shared_channel_invite_declined",
		"shared_channel_invite_received",
		"shared_channel_invite_requested",
		"star_added",
		"star_removed",
		"subteam_created",
		"subteam_members_changed",
		"subteam_self_added",
		"subteam_self_removed",
		"subteam_updated",
		"team_access_granted",
		"team_access_revoked",
		"team_domain_change",
		"team_join",
		"team_rename",
		"tokens_revoked",
		"url_verification",
		"user_change",
		"user_huddle_changed",
		"user_profile_changed",
		"user_status_changed",
		"workflow_deleted",
		"workflow_published",
		"workflow_step_deleted",
		"workflow_step_execute",
		"workflow_unpublished",
		"interaction",
		"slash_command",
	],
	confluence: [
		"attachment_archived",
		"attachment_created",
		"attachment_deleted",
		"attachment_removed",
		"attachment_restored",
		"attachment_trashed",
		"attachment_unarchived",
		"attachment_updated",
		"attachment_viewed",
		"blog_created",
		"blog_removed",
		"blog_restored",
		"blog_trashed",
		"blog_updated",
		"blog_viewed",
		"blueprint_page_created",
		"comment_created",
		"comment_deleted",
		"comment_removed",
		"comment_updated",
		"connect_addon_disabled",
		"connect_addon_enabled",
		"content_created",
		"content_permissions_updated",
		"content_removed",
		"content_restored",
		"content_trashed",
		"content_updated",
		"filter_created",
		"filter_deleted",
		"filter_updated",
		"group_created",
		"group_removed",
		"issuetype_created",
		"issuetype_deleted",
		"issuetype_updated",
		"issuelink_created",
		"issuelink_deleted",
		"issue_property_deleted",
		"issue_property_set",
		"jira:issue_created",
		"jira:issue_deleted",
		"jira:issue_updated",
		"jira:version_created",
		"jira:version_deleted",
		"jira:version_merged",
		"jira:version_moved",
		"jira:version_released",
		"jira:version_unreleased",
		"jira:version_updated",
		"label_added",
		"label_created",
		"label_deleted",
		"label_removed",
		"option_issuelinks_changed",
		"option_subtasks_changed",
		"option_timetracking_changed",
		"option_unassigned_issues_changed",
		"option_voting_changed",
		"option_watching_changed",
		"page_archived",
		"page_children_reordered",
		"page_copied",
		"page_created",
		"page_moved",
		"page_removed",
		"page_restored",
		"page_trashed",
		"page_unarchived",
		"page_updated",
		"page_viewed",
		"project_app_disabled",
		"project_app_enabled",
		"project_created",
		"project_deleted",
		"project_updated",
		"relation_created",
		"relation_deleted",
		"search_performed",
		"space_created",
		"space_logo_updated",
		"space_permissions_updated",
		"space_removed",
		"space_updated",
		"theme_enabled",
		"user_created",
		"user_deactivated",
		"user_deleted",
		"user_followed",
		"user_reactivated",
		"user_removed",
		"user_updated",
		"worklog_created",
		"worklog_deleted",
		"worklog_updated",
	],
	jira: [
		"app_access_to_objects_blocked",
		"app_access_to_objects_in_container_blocked",
		"attachment_created",
		"attachment_deleted",
		"board_configuration_changed",
		"board_created",
		"board_deleted",
		"board_updated",
		"comment_created",
		"comment_deleted",
		"comment_updated",
		"filter_created",
		"filter_deleted",
		"filter_updated",
		"issue_property_deleted",
		"issue_property_set",
		"issuelink_created",
		"issuelink_deleted",
		"issuetype_created",
		"issuetype_deleted",
		"issuetype_updated",
		"jira:issue_created",
		"jira:issue_deleted",
		"jira:issue_updated",
		"jira:version_created",
		"jira:version_deleted",
		"jira:version_moved",
		"jira:version_released",
		"jira:version_unreleased",
		"jira:version_updated",
		"jira_expression_evaluation_failed",
		"option_attachments_changed",
		"option_issuelinks_changed",
		"option_subtasks_changed",
		"option_timetracking_changed",
		"option_timetracking_provider_changed",
		"option_unassigned_issues_changed",
		"option_voting_changed",
		"option_watching_changed",
		"project_archived",
		"project_created",
		"project_deleted",
		"project_restored_archived",
		"project_restored_deleted",
		"project_soft_deleted",
		"project_updated",
		"sprint_closed",
		"sprint_created",
		"sprint_deleted",
		"sprint_started",
		"sprint_updated",
		"user_created",
		"user_deleted",
		"user_updated",
		"worklog_created",
		"worklog_deleted",
		"worklog_updated",
	],
	github: [
		"about-webhook-events-and-payloads",
		"branch_protection_configuration",
		"branch_protection_rule",
		"check_run",
		"check_suite",
		"code_scanning_alert",
		"commit_comment",
		"create",
		"custom_property",
		"custom_property_values",
		"delete",
		"dependabot_alert",
		"deploy_key",
		"deployment",
		"deployment_protection_rule",
		"deployment_review",
		"deployment_status",
		"discussion",
		"discussion_comment",
		"fork",
		"github_app_authorization",
		"gollum",
		"installation",
		"installation_repositories",
		"installation_target",
		"issue_comment",
		"issues",
		"label",
		"marketplace_purchase",
		"member",
		"membership",
		"merge_group",
		"meta",
		"milestone",
		"org_block",
		"organization",
		"package",
		"page_build",
		"personal_access_token_request",
		"ping",
		"project_card",
		"project",
		"project_column",
		"projects_v2",
		"projects_v2_item",
		"projects_v2_status_update",
		"public",
		"pull_request",
		"pull_request_review_comment",
		"pull_request_review",
		"pull_request_review_thread",
		"push",
		"registry_package",
		"release",
		"repository_advisory",
		"repository",
		"repository_dispatch",
		"repository_import",
		"repository_ruleset",
		"repository_vulnerability_alert",
		"secret_scanning_alert",
		"secret_scanning_alert_location",
		"security_advisory",
		"security_and_analysis",
		"sponsorship",
		"star",
		"status",
		"sub_issues",
		"team_add",
		"team",
		"watch",
		"workflow_dispatch",
		"workflow_job",
		"workflow_run",
	],
	gmail: ["mailbox_chage"],
	calendar: ["event_created", "event_updated", "event_deleted"],
	forms: ["responses", "schema"],
};
