import AwsHealthToSlackYaml from "@assets/templates/aws_health_to_slack/autokitteh.yaml";
import CategorizeNotifyYaml from "@assets/templates/categorize_notify/autokitteh.yaml";
import ConfluenceToSlackYaml from "@assets/templates/confluence_to_slack/autokitteh.yaml";
import CreateJiraIssueYaml from "@assets/templates/create_jira_issue/autokitteh.yaml";
import GoogleFormsToJiraYaml from "@assets/templates/google_forms_to_jira/autokitteh.yaml";
import JiraAssigneeFromCalendarYaml from "@assets/templates/jira_assignee_from_calendar/autokitteh.yaml";
import JiraToGoogleCalendarYaml from "@assets/templates/jira_to_google_calendar/autokitteh.yaml";
import PurrrYaml from "@assets/templates/purrr/autokitteh.yaml";
import ReviewKittehYaml from "@assets/templates/reviewkitteh/autokitteh.yaml";

const AwsHealthToSlack = JSON.stringify(AwsHealthToSlackYaml);
const CategorizeNotify = JSON.stringify(CategorizeNotifyYaml);
const ConfluenceToSlack = JSON.stringify(ConfluenceToSlackYaml);
const CreateJiraIssue = JSON.stringify(CreateJiraIssueYaml);
const GoogleFormsToJira = JSON.stringify(GoogleFormsToJiraYaml);
const JiraAssigneeFromCalendar = JSON.stringify(JiraAssigneeFromCalendarYaml);
const JiraToGoogleCalendar = JSON.stringify(JiraToGoogleCalendarYaml);
const Purrr = JSON.stringify(PurrrYaml);
const ReviewKitteh = JSON.stringify(ReviewKittehYaml);

export {
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
