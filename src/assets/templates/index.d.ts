/* eslint-disable @liferay/imports-first */
declare module "@assets/templates" {
	import AwsHealthToSlack from "@assets/templates/aws_health_to_slack/autokitteh.yaml";
	import * as aws_health_to_slack from "@assets/templates/aws_health_to_slack/index";
	import CategorizeNotify from "@assets/templates/categorize_notify/autokitteh.yaml";
	import * as categorize_notify from "@assets/templates/categorize_notify/index";
	import ConfluenceToSlack from "@assets/templates/confluence_to_slack/autokitteh.yaml";
	import * as confluence_to_slack from "@assets/templates/confluence_to_slack/index";
	import CreateJiraIssue from "@assets/templates/create_jira_issue/autokitteh.yaml";
	import * as create_jira_issue from "@assets/templates/create_jira_issue/index";
	import GoogleFormsToJira from "@assets/templates/google_forms_to_jira/autokitteh.yaml";
	import * as google_forms_to_jira from "@assets/templates/google_forms_to_jira/index";
	import JiraAssigneeFromCalendar from "@assets/templates/jira_assignee_from_calendar/autokitteh.yaml";
	import * as jira_assignee_from_calendar from "@assets/templates/jira_assignee_from_calendar/index";
	import JiraToGoogleCalendar from "@assets/templates/jira_to_google_calendar/autokitteh.yaml";
	import * as jira_to_google_calendar from "@assets/templates/jira_to_google_calendar/index";
	import Purrr from "@assets/templates/purrr/autokitteh.yaml";
	import * as purrr from "@assets/templates/purrr/index";
	import ReviewKitteh from "@assets/templates/reviewkitteh/autokitteh.yaml";
	import * as reviewkitteh from "@assets/templates/reviewkitteh/index";

	export {
		aws_health_to_slack,
		categorize_notify,
		confluence_to_slack,
		create_jira_issue,
		google_forms_to_jira,
		jira_assignee_from_calendar,
		jira_to_google_calendar,
		purrr,
		reviewkitteh,
		AwsHealthToSlack,
		CategorizeNotify,
		ConfluenceToSlack,
		CreateJiraIssue,
		GoogleFormsToJira,
		JiraAssigneeFromCalendar,
		JiraToGoogleCalendar,
		Purrr,
		ReviewKitteh,
	};
}
