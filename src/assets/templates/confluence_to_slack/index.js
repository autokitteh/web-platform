export const autokitteh_yaml = `# This YAML file is a declarative manifest that describes the setup of
# an AutoKitteh project that announces new Confluence pages in Slack.
#
# Before deploying this AutoKitteh project:
# - Set the "CONFLUENCE_SPACE_KEY" in the trigger's filter expression
# - Set "FILTER_LABEL" for event filtering during runtime
#   ("" = disable this runtime check)
# - Set "SLACK_CHANNEL" to the Slack channel name/ID you want to post to
#
# After creating this AutoKitteh project by applying this file,
# initialize its Confluence and Slack connections.

version: v1

project:
  name: confluence_to_slack
  vars:
    - name: FILTER_LABEL
      value: ""
    - name: SLACK_CHANNEL
      value: slack-test
    - name: SNIPPET_LENGTH
      value: 150
  connections:
    - name: confluence_connection
      integration: confluence
    - name: slack_connection
      integration: slack
  triggers:
    - name: confluence_page_created
      connection: confluence_connection
      event_type: page_created
      filter: data.page.spaceKey == "CONFLUENCE_SPACE_KEY"
      call: program.py:on_confluence_page_created
`;
export const program_py = `"""A real-life workflow that integrates Confluence and Slack.

Workflow:
    1. Trigger: a new page is created in Confluence
    2. Static filter: the page is in a specific Confluence space
       (specified in the "autokitteh.yaml" manifest file)
    3. Runtime filter: check if the page has a specific label
    4. Notify: send a message to a Slack channel with a snippet of the page
"""

import os

from autokitteh.atlassian import confluence_client
from autokitteh.slack import slack_client


def on_confluence_page_created(event):
    """Workflow's entry-point."""
    confluence = confluence_client("confluence_connection")
    page_id = event.data.page.id

    # Ignore pages without the filter label, if specified.
    page_labels = confluence.get_page_labels(page_id)["results"]
    label_names = [label["name"] for label in page_labels]
    if os.getenv("FILTER_LABEL") not in label_names + [""]:
        print(f"Filter label not found in page: {label_names}")
        return

    # Read the page body.
    res = confluence.get_page_by_id(page_id, expand="body.view")
    html_body = res["body"]["view"]["value"]

    _send_slack_message(event.data.page, html_body)


def _send_slack_message(page, html_body):
    snippet_length = int(os.getenv("SNIPPET_LENGTH"))
    message = f"""
    A new page has been created in the \`{page.spaceKey}\` space.
    *Title*: {page.title}
    *Snippet*: \`\`\`{html_body[:snippet_length]}\n\`\`\`
    <{page.self}|Link to page>
    """

    slack = slack_client("slack_connection")
    slack.chat_postMessage(channel=os.getenv("SLACK_CHANNEL"), text=message)
`;