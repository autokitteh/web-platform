export const autokitteh_yaml = `# This YAML file is a declarative manifest that describes the setup of
# an AutoKitteh project that sets the assignee of new Atlassian Jira
# issues based on an on-call rotation in a shared Google Calendar.
#
# Before deploying this AutoKitteh project:
# - Set "SHARED_CALENDAR_ID" to the URL of the shared Google Calendar
#   ("primary" is the default calendar of the authenticated user)
# - Set "JIRA_PROJECT_KEY" in the trigger's filter expression
#
# After creating this AutoKitteh project by applying this file,
# initialize its Jira connection.

version: v1

project:
  name: jira_assignee_from_calendar
  vars:
    - name: SHARED_CALENDAR_ID
      value: primary
  connections:
    - name: google_calendar_connection
      integration: googlecalendar
    - name: jira_connection
      integration: jira
  triggers:
    - name: jira_issue_created
      connection: jira_connection
      event_type: issue_created
      filter: data.issue.fields.project.key == "JIRA_PROJECT_KEY"
      call: program.py:on_jira_issue_created
`;
export const program_py = `"""
This program assignes Atlassian Jira issues based on a shared Google Calendar.

The shared Google Calendar defines a 27/4 on-call rotation.
How to create it: https://support.google.com/calendar/answer/37095

This program assumes that the calendar entries have these fields:
- Summary: the on-call person's human-readable name
- Description: their Atlassian account ID
"""

from datetime import UTC, datetime, timedelta
import os

import autokitteh
from autokitteh.atlassian import atlassian_jira_client
from autokitteh.google import google_calendar_client


def on_jira_issue_created(event):
    """Workflow's entry-point."""
    name, account_id = _get_current_oncall()
    update = {"assignee": {"accountId": account_id}}

    jira = atlassian_jira_client("jira_connection")
    jira.update_issue_field(event.data.issue.key, update, notify_users=True)

    print(f"Assigned {event.data.issue.key} to {name}")


@autokitteh.activity
def _get_current_oncall():
    """Return the name and Atlassian account ID of the current on-call."""
    gcal = google_calendar_client("google_calendar_connection").events()
    now = datetime.now(UTC)
    in_a_minute = now + timedelta(minutes=1)

    result = gcal.list(
        calendarId=os.getenv("SHARED_CALENDAR_ID"),
        timeMin=now.isoformat(),  # Request all currently-effective events.
        timeMax=in_a_minute.isoformat(),
        orderBy="updated",  # Use the most-recently updated one.
    ).execute()["items"][-1]

    # Google Calendar may add whitespaces - strip them.
    return result["summary"].strip(), result["description"].strip()
`;