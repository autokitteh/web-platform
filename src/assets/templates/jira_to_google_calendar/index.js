export const autokitteh_yaml = `# This YAML file is a declarative manifest that describes the setup
# of an AutoKitteh project that creates events in Google Calendar
# when Atlassian Jira issues are created in a specific project.
#
# Before deploying this AutoKitteh project, set "JIRA_PROJECT_KEY"
# in the trigger's filter expression.
#
# After creating this AutoKitteh project by applying this file,
# initialize its Jira connection.

version: v1

project:
  name: jira_to_google_calendar
  connections:
    - name: jira_connection
      integration: jira
    - name: google_calendar_connection
      integration: googlecalendar
  triggers:
    - name: jira_issue_created
      connection: jira_connection
      event_type: issue_created
      filter: data.issue.fields.project.key == "JIRA_PROJECT_KEY"
      call: program.py:on_jira_issue_created
`;
export const program_py = `"""
This program receives Jira events and creates Google Calendar events.

Scenario:
    Initiating a procedure that requires collaboration and coordination,
    e.g. scheduling a consult with another team, or planning a joint review.

Workflow:
    The user creates a new Jira ticket for the discussion. AutoKitteh
    automatically generates a Google Calendar event with a deadline for
    the completion, to ensure that the review happens as planned.
"""

import autokitteh
from autokitteh import atlassian
from autokitteh.google import google_calendar_client


def on_jira_issue_created(event):
    """Workflow's entry-point."""
    _create_calendar_event(event.data.issue.fields, event.data.issue.key)


@autokitteh.activity
def _create_calendar_event(issue, key):
    url = atlassian.get_base_url("jira_connection")
    link = f"Link to Jira issue: {url}/browse/{key}\n\n"

    event = {
        "summary": issue.summary,
        "description": link + issue.description,
        "start": {"date": issue.duedate},
        "end": {"date": issue.duedate},
        "reminders": {"useDefault": True},
        "attendees": [
            {"email": "auto@example.com"},
            {"email": "kitteh@example.com"},
        ],
    }

    gcal = google_calendar_client("google_calendar_connection").events()
    event = gcal.insert(calendarId="primary", body=event).execute()

    print("Google Cloud event created: " + event.get("htmlLink"))
`;