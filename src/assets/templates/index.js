import * as aws_health_to_slack from "./aws_health_to_slack/index";
import * as categorize_notify from "./categorize_notify/index";
import * as confluence_to_slack from "./confluence_to_slack/index";
import * as create_jira_issue from "./create_jira_issue/index";
import * as google_forms_to_jira from "./google_forms_to_jira/index";
import * as jira_assignee_from_calendar from "./jira_assignee_from_calendar/index";
import * as jira_to_google_calendar from "./jira_to_google_calendar/index";
import * as purrr from "./purrr/index";
import * as reviewkitteh from "./reviewkitteh/index";

import AwsHealthToSlack from "@assets/templates/aws_health_to_slack/autokitteh.yaml";
import CategorizeNotify from "@assets/templates/categorize_notify/autokitteh.yaml";
import ConfluenceToSlack from "@assets/templates/confluence_to_slack/autokitteh.yaml";
import CreateJiraIssue from "@assets/templates/create_jira_issue/autokitteh.yaml";
import GoogleFormsToJira from "@assets/templates/google_forms_to_jira/autokitteh.yaml";
import JiraAssigneeFromCalendar from "@assets/templates/jira_assignee_from_calendar/autokitteh.yaml";
import JiraToGoogleCalendar from "@assets/templates/jira_to_google_calendar/autokitteh.yaml";
import Purrr from "@assets/templates/purrr/autokitteh.yaml";
import Reviewkitteh from "@assets/templates/reviewkitteh/autokitteh.yaml";

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
	Reviewkitteh,
};
