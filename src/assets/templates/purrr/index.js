export const autokitteh_yaml = `# This YAML file is a declarative manifest that describes the setup
# of the AutoKitteh project "Pull Request Review Reminder" (PuRRR).
# PuRRR integrates GitHub and Slack to streamline code reviews.
#
# Before applying this file:
# - Modify the values in the project's "vars" section, if desired
# - Modify the Redis connection string, if needed
#
# After applying this file, initialize this AutoKitteh project's
# GitHub and Slack connections.

version: v1

project:
  name: purrr
  vars:
    # Default TTL for Redis cache = 30 days (to forget stale PRs).
    - name: REDIS_TTL
      value: 720h
    # Default PR channel names: "pr_<number>_<title>".
    - name: SLACK_CHANNEL_PREFIX
      value: "pr_"
    # Create this channel / replace with your own / specify "" to disable it.
    - name: SLACK_DEBUG_CHANNEL
      value: purrr-debug
    # Create this channel / replace with your own / specify "" to disable it.
    - name: SLACK_LOG_CHANNEL
      value: purrr-log
  connections:
    - name: github
      integration: github
    - name: redis
      integration: redis
      vars:
        - name: URL
          value: redis://localhost:6379/0 # Modify this if needed.
    - name: slack
      integration: slack
  triggers:
    - name: github_issue_comment
      connection: github
      event_type: issue_comment
      call: github_issue_comment.star:on_github_issue_comment
    - name: github_pull_request
      connection: github
      event_type: pull_request
      call: github_pr.star:on_github_pull_request
    - name: github_pull_request_review
      connection: github
      event_type: pull_request_review
      call: github_pr_review.star:on_github_pull_request_review
    - name: github_pull_request_review_comment
      connection: github
      event_type: pull_request_review_comment
      call: github_review_comment.star:on_github_pull_request_review_comment
    - name: github_pull_request_review_thread
      connection: github
      event_type: pull_request_review_thread
      call: github_thread.star:on_github_pull_request_review_thread
    - name: slack_message
      connection: slack
      event_type: message
      call: slack_message.star:on_slack_message
    - name: slack_reaction_added
      connection: slack
      event_type: reaction_added
      call: slack_reaction.star:on_slack_reaction_added
    - name: slack_slash_command
      connection: slack
      event_type: slash_command
      call: slack_cmd.star:on_slack_slash_command
`;
export const debug_star = `"""Simple, common utility for debugging and reporting errors."""

load("@slack", "slack")
load("env", "SLACK_DEBUG_CHANNEL")  # Set in "autokitteh.yaml".

def debug(msg):
    """Post a message to a special Slack channel, if defined.

    Args:
        msg: Message to post.
    """
    if not msg:
        return

    # Print the message in the autokitteh session's log.
    # This appears in the "ak session log" command's output.
    print(msg)

    if not SLACK_DEBUG_CHANNEL:
        return

    # This is more accessible than print().
    slack.chat_post_message(SLACK_DEBUG_CHANNEL, msg)
`;
export const github_helpers_star = `"""GitHub API helper functions."""

load("@github", "github")
load("debug.star", "debug")
load(
    "redis_helpers.star",
    "map_github_link_to_slack_message_ts",
    "map_slack_message_ts_to_github_link",
    "translate_slack_message_to_github_link",
    "translate_slack_review_comment_to_github_id",
)

def create_review_comment(owner, repo, pr, review, comment, channel_id, thread_ts):
    """Create a review on a pull request, with a single comment.

    No need to specify the commit ID or file path - we set them automatically.

    Args:
        owner: Owner of the GitHub repository.
        repo: GitHub repository name.
        pr: GitHub pull request number.
        review: Body of the PR review, possibly with markdown.
        comment: Body of the review comment, possibly with markdown.
        channel_id: ID of the Slack channel where the comment originated.
        thread_ts: ID (timestamp) of the Slack thread where the comment originated.
    """
    pr = int(pr)

    # See: https://docs.github.com/en/rest/pulls/reviews?#create-a-review-for-a-pull-request
    github.create_review(owner, repo, pr, body = review, event = "COMMENT")

    # See: https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request
    resp = github.get_pull_request(owner, repo, pr)
    commit_id = resp.head.sha

    # See: https://docs.github.com/en/rest/pulls/pulls#list-pull-requests-files
    # TODO: Select a file based on its "sha" and/or "status" fields, instead of [0]?
    resp = github.list_pull_request_files(owner, repo, pr)
    path = resp[0].filename

    # See: https://docs.github.com/en/rest/pulls/comments#create-a-review-comment-for-a-pull-request
    resp = github.create_review_comment(owner, repo, pr, comment, commit_id, path, subject_type = "file")

    # Remember the Slack thread timestamp (message ID) of the GitHub comment we created.
    # Usage: syncing edits and deletes of review comments from GitHub to Slack.
    map_github_link_to_slack_message_ts(resp.htmlurl, thread_ts)

    # Also remember the GitHub comment ID, so we can reply to it later from Slack
    # (in create_review_comment_reply() below).
    channel_ts = "review_comment:%s:%s" % (channel_id, thread_ts)
    map_slack_message_ts_to_github_link(channel_ts, resp.id)

def create_review_comment_reply(owner, repo, pr, body, channel_id, thread_ts):
    """https://docs.github.com/en/rest/pulls/comments#create-a-reply-for-a-review-comment

    Create a review comment which is a reply to an existing review comment.
    If the replied-to Slack message isn't a review comment, create a PR comment.

    Args:
        owner: Owner of the GitHub repository.
        repo: GitHub repository name.
        pr: GitHub pull request number.
        body: Body of the comment, possibly with markdown.
        channel_id: ID of the Slack channel where the comment originated.
        thread_ts: ID (timestamp) of the Slack thread where the comment originated.
    """
    pr = int(pr)

    # Create a review comment which is a reply to an existing review comment.
    # This mapping is created by _on_pr_review_comment_created() in "github_review_comment.star".
    gh_review_comment = translate_slack_review_comment_to_github_id(channel_id, thread_ts)
    if gh_review_comment:
        github.create_review_comment_reply(owner, repo, pr, gh_review_comment, body)
        return

    # If the Slack reply is to a different type of Slack message, create a PR comment.
    gh_issue_comment = translate_slack_message_to_github_link("issue_comment", channel_id, thread_ts)
    gh_review = translate_slack_message_to_github_link("review", channel_id, thread_ts)
    link = "to [this PR %s](%s) via"
    if gh_issue_comment:
        body = body.replace("via", link % ("comment", gh_issue_comment), 1)
    elif gh_review:
        body = body.replace("via", link % ("review", gh_review), 1)
    else:
        # Otherwise, this is a Slack reply to an unknown review comment.
        debug("Couldn't find GitHub comment ID to sync Slack reply")
        return

    # See: https://docs.github.com/en/rest/issues/comments#create-an-issue-comment
    github.create_issue_comment(owner, repo, pr, body)
`;
export const github_issue_comment_star = `"""Handler for GitHub "issue_comment" events."""

load("debug.star", "debug")
load("markdown.star", "github_markdown_to_slack")
load(
    "redis_helpers.star",
    "map_github_link_to_slack_message_ts",
    "map_slack_message_ts_to_github_link",
)
load("slack_helpers.star", "impersonate_user_in_message", "lookup_pr_channel")

def on_github_issue_comment(data):
    """https://docs.github.com/webhooks/webhook-events-and-payloads#issue_comment

    This event occurs when there is activity relating
    to a comment on an issue or pull request.

    Args:
        data: GitHub event data.
    """

    # Ignore this event if it was triggered by a bot.
    if data.sender.type == "Bot":
        return

    action_handlers = {
        "created": _on_issue_comment_created,
        "edited": _on_issue_comment_edited,
        "deleted": _on_issue_comment_deleted,
    }
    if data.action in action_handlers:
        action_handlers[data.action](data)
    else:
        debug("Unrecognized GitHub issue comment action: \`%s\`" % data.action)

def _on_issue_comment_created(data):
    """A comment on an issue or pull request was created.

    Args:
        data: GitHub event data.
    """
    pr_url = data.issue.htmlurl
    org = data.organization.login
    channel_id = lookup_pr_channel(pr_url, data.issue.state)
    if not channel_id:
        debug("Can't sync this PR comment: " + data.comment.htmlurl)
        return

    msg = "<%s|PR comment>:\n\n" % data.comment.htmlurl
    msg += github_markdown_to_slack(data.comment.body, pr_url, org)
    thread_ts = impersonate_user_in_message(channel_id, data.sender, msg, org)
    if not thread_ts:
        return

    # Remember the thread timestamp (message ID) of the Slack message we posted.
    # Usage: syncing edits and deletes below to Slack.
    map_github_link_to_slack_message_ts(data.comment.htmlurl, thread_ts)

    # Also remember the GitHub comment URL, so we can reply to it later from Slack
    # (in create_review_comment_reply() in "github_helpers.star").
    channel_ts = "issue_comment:%s:%s" % (channel_id, thread_ts)
    map_slack_message_ts_to_github_link(channel_ts, data.comment.htmlurl)

def _on_issue_comment_edited(data):
    """A comment on an issue or pull request was edited.

    TODO: Implement this.

    Args:
        data: GitHub event data.
    """
    print(data.changes)
    print(data.issue)
    print(data.comment)
    print(data.sender)

def _on_issue_comment_deleted(data):
    """A comment on an issue or pull request was deleted.

    TODO: Implement this.

    Args:
        data: GitHub event data.
    """
    print(data.issue)
    print(data.comment)
    print(data.sender)
`;
export const github_pr_star = `"""Handler for GitHub "pull_request" events."""

load("@slack", "slack")
load("debug.star", "debug")
load("markdown.star", "github_markdown_to_slack")
load(
    "redis_helpers.star",
    "map_github_link_to_slack_channel_id",
    "map_slack_channel_id_to_pr_details",
)
load(
    "slack_helpers.star",
    "add_users_to_channel",
    "archive_channel",
    "create_channel",
    "lookup_pr_channel",
    "mention_user_in_message",
    "normalize_channel_name",
    "rename_channel",
)
load(
    "user_helpers.star",
    "github_pr_participants",
    "github_username_to_slack_user_id",
    "resolve_github_user",
)

_PR_CLOSE_DELAY = 5  # Seconds.

def on_github_pull_request(data):
    """https://docs.github.com/webhooks/webhook-events-and-payloads#pull_request

    For more information, see "About pull requests":
    https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests

    Args:
        data: GitHub event data.
    """
    action_handlers = {
        # A new pull request was created.
        "opened": _on_pr_opened,
        # A pull request was closed.
        "closed": _on_pr_closed,
        # A previously closed pull request was reopened.
        "reopened": _on_pr_reopened,

        # A pull request was converted to a draft.
        "converted_to_draft": _on_pr_converted_to_draft,
        # A draft pull request was marked as ready for review.
        "ready_for_review": _on_pr_ready_for_review,

        # Review by a person or team was requested for a pull request.
        "review_requested": _on_pr_review_requested,
        # A request for review by a person or team was removed from a pull request.
        "review_request_removed": _on_pr_review_request_removed,

        # A pull request was assigned to a user.
        "assigned": _on_pr_assigned,
        # A user was unassigned from a pull request.
        "unassigned": _on_pr_unassigned,

        # TODO: locked, unlocked

        # The title or body of a pull request was edited,
        # or the base branch of a pull request was changed.
        "edited": _on_pr_edited,
        # A pull request's head branch was updated.
        "synchronize": _on_pr_synchronized,

        # Ignored actions:
        # - auto_merge_enabled, auto_merge_disabled
        # - enqueued, dequeued
        # - labeled, unlabeled
        # - milestoned, demilestoned
    }
    if data.action in action_handlers:
        action_handlers[data.action](data)

def _on_pr_opened(data):
    """A new pull request was created.

    Args:
        data: GitHub event data.
    """
    pr = data.pull_request
    org = data.organization.login

    # Create a dedicated Slack channel for the PR.
    name = "%d_%s" % (pr.number, normalize_channel_name(pr.title))
    channel_id = create_channel(data, name)
    if not channel_id:
        user_id = github_username_to_slack_user_id(data.sender.login, org)
        msg = "Failed to create a Slack channel for " + pr.htmlurl
        slack.chat_post_message(user_id, msg)
        debug(msg)
        return

    # Post an introduction message to it, describing the PR (updated
    # later based on "pull_request" events with the "edited" action).
    msg = "%%s opened %s: \`%s\`" % (pr.htmlurl, pr.title)
    if pr.body:
        msg += "\n\n" + github_markdown_to_slack(pr.body, pr.htmlurl, org)
    mention_user_in_message(channel_id, data.sender, msg, org)

    # TODO: Also post a message summarizing check states (updated
    # later based on "worklfow_job" and "workflow_run" events).

    # Create channel bookmarks corresponding to important PR links
    # (titles should be updated based on relevant GitHub events).
    slack.bookmarks_add(channel_id, "Conversation (0)", pr.htmlurl)
    title = "Commits (%d)" % pr.commits
    slack.bookmarks_add(channel_id, title, pr.htmlurl + "/commits")
    slack.bookmarks_add(channel_id, "Checks (0)", pr.htmlurl + "/checks")
    title = "Files changed (%d)" % pr.changed_files
    slack.bookmarks_add(channel_id, title, pr.htmlurl + "/files")
    title = "Diffs (+%d -%d)" % (pr.additions, pr.deletions)
    slack.bookmarks_add(channel_id, title, pr.htmlurl + ".diff")

    # Map between the GitHub PR and the new Slack channel ID, for 2-way event syncs.
    map_github_link_to_slack_channel_id(pr.htmlurl, channel_id)
    map_slack_channel_id_to_pr_details(channel_id, org, data.repo.name, pr.number)

    # In case this is a replacement Slack channel, say so.
    msg = "Note: this is not a new PR, %%s %s now"
    if data.action == "reopened":
        msg %= "reopened it"
        mention_user_in_message(channel_id, data.sender, msg, org)
    elif data.action == "ready_for_review":
        msg %= "marked it as ready for review"
        mention_user_in_message(channel_id, data.sender, msg, org)

    # Finally, add all the participants in the PR to this channel.
    slack_user_ids = []
    for username in github_pr_participants(pr):
        user_id = github_username_to_slack_user_id(username, org)
        if user_id:
            slack_user_ids.append(user_id)
    add_users_to_channel(channel_id, ",".join(slack_user_ids))

def _on_pr_closed(data):
    """A pull request (possibly a draft) was closed.

    If "merged" is false in the webhook payload, the pull request was
    closed with unmerged commits. If "merged" is true in the webhook
    payload, the pull request was merged.

    Args:
        data: GitHub event data.
    """

    # Ignore drafts - they don't have an active Slack channel anyway.
    if data.pull_request.draft:
        return

    channel_id = lookup_pr_channel(data.pull_request.htmlurl, data.action)
    if not channel_id:
        return  # Unrecoverable error.

    # Wait for a few seconds to handle other asynchronous events
    # (e.g. a PR closure comment) before archiving the channel.
    sleep(_PR_CLOSE_DELAY)

    msg = "%s closed this PR"
    if data.pull_request.merged:
        msg = msg.replace("closed", "merged")
    mention_user_in_message(channel_id, data.sender, msg, data.organization.login)

    archive_channel(channel_id, data)

def _on_pr_reopened(data):
    """A previously closed pull request (possibly a draft) was reopened.

    Attention - https://api.slack.com/methods/conversations.unarchive:
    Bug alert: bot tokens (xoxb-...) cannot currently be used to unarchive
    conversations. For now, please use a user token (xoxp-...) to unarchive
    the conversation rather than a bot token.

    Args:
        data: GitHub event data.
    """

    # Ignore drafts - they don't have an active Slack channel anyway.
    if data.pull_request.draft:
        return

    # Workaround for the unarchive bug: treat this as a new PR, instead of:
    # - lookup_pr_channel(data.pull_request.htmlurl, data.action)
    # - unarchive_channel(channel_id, data)
    # - (Updating channel metadata, posting info messages, add missing participants)
    _on_pr_opened(data)

def _on_pr_converted_to_draft(data):
    """A pull request was converted to a draft.

    For more information, see "Changing the stage of a pull request":
    https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/changing-the-stage-of-a-pull-request

    Args:
        data: GitHub event data.
    """
    channel_id = lookup_pr_channel(data.pull_request.htmlurl, data.action)
    if not channel_id:
        return  # Unrecoverable error.

    msg = "%s converted this PR to a draft"
    mention_user_in_message(channel_id, data.sender, msg, org = data.organization.login)

    archive_channel(channel_id, data)

def _on_pr_ready_for_review(data):
    """A draft pull request was marked as ready for review.

    For more information, see "Changing the stage of a pull request":
    https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/changing-the-stage-of-a-pull-request

    Attention - https://api.slack.com/methods/conversations.unarchive:
    Bug alert: bot tokens (xoxb-...) cannot currently be used to unarchive
    conversations. For now, please use a user token (xoxp-...) to unarchive
    the conversation rather than a bot token.

    Args:
        data: GitHub event data.
    """

    # Workaround for the unarchive bug: treat this as a new PR, instead of:
    # - lookup_pr_channel(data.pull_request.htmlurl, data.action)
    # - unarchive_channel(channel_id, data)
    # - (Updating channel metadata, posting info messages, add missing participants)
    _on_pr_opened(data)

def _on_pr_review_requested(data):
    """Review by a person or team was requested for a pull request.

    For more information, see "Requesting a pull request review":
    https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/requesting-a-pull-request-review

    Args:
        data: GitHub event data.
    """

    # Don't do anything if there isn't an active Slack channel anyway.
    if data.pull_request.draft or data.pull_request.state != "open":
        return

    url = data.pull_request.htmlurl
    channel_id = lookup_pr_channel(url, data.action)
    if not channel_id:
        return  # Unrecoverable error.

    if data.requested_reviewer:
        _on_pr_review_requested_person(data, channel_id)
    if data.requested_team:
        _on_pr_review_requested_team(data, channel_id)

def _on_pr_review_requested_person(data, channel_id):
    """Review by a person was requested for a pull request.

    Args:
        data: GitHub event data.
        channel_id: PR's Slack channel ID.
    """
    org = data.organization.login
    reviewer = resolve_github_user(data.requested_reviewer, org)
    msg = "%s requested a review from " + reviewer
    mention_user_in_message(channel_id, data.sender, msg, org)

    if not reviewer.startswith("<@"):
        return  # Not a real Slack user ID.

    reviewer = reviewer[2:-1]  # Remove "<@" and ">" from Slack user ID.
    add_users_to_channel(channel_id, reviewer)

    # DM the reviewer with a reference to the Slack channel.
    msg = "%%s has requested you to review a PR - see <#%s>"
    mention_user_in_message(reviewer, data.sender, msg % channel_id, org)

def _on_pr_review_requested_team(data, channel_id):
    """Review by a team was requested for a pull request.

    Args:
        data: GitHub event data.
        channel_id: PR's Slack channel ID.
    """
    msg = "%%s requested a review from the <%s|%s> team"
    msg %= (data.requested_team.htmlurl, data.requested_team.name)
    mention_user_in_message(channel_id, data.sender, msg, data.organization.login)

def _on_pr_review_request_removed(data):
    """A request for review by a person or team was removed from a pull request.

    Args:
        data: GitHub event data.
    """

    # Don't do anything if there isn't an active Slack channel anyway.
    if data.pull_request.draft or data.pull_request.state != "open":
        return

    channel_id = lookup_pr_channel(data.pull_request.htmlurl, data.action)
    if not channel_id:
        return  # Unrecoverable error.

    if data.requested_reviewer:
        _on_pr_review_request_removed_person(data, channel_id)
    if data.requested_team:
        _on_pr_review_request_removed_team(data, channel_id)

def _on_pr_review_request_removed_person(data, channel_id):
    """A request for review by a person was removed from a pull request.

    Args:
        data: GitHub event data.
        channel_id: PR's Slack channel ID.
    """
    org = data.organization.login
    reviewer = resolve_github_user(data.requested_reviewer, org)
    msg = "%s removed the request for review from " + reviewer
    mention_user_in_message(channel_id, data.sender, msg, org)

    if not reviewer.startswith("<@"):
        return  # Not a real Slack user ID.

    # TODO: Remove the review request DM.
    reviewer = reviewer[2:-1]  # Remove "<@" and ">" from Slack user ID.
    # channel_id = find_dm_channel(user_id, "")
    # if channel_id == "":
    #     print('No Slack DM channel with GitHub user "%s"' % assignee.login)
    #     return
    # delete_messages_containing(channel_id, pr.htmlurl, "")
    # ("...has requested you to review a PR - see <#channel_id>")

def _on_pr_review_request_removed_team(data, channel_id):
    """A request for review by a team was removed from a pull request.

    Args:
        data: GitHub event data.
        channel_id: PR's Slack channel ID.
    """
    msg = "%%s removed the request for review from the <%s|%s> team"
    msg %= (data.requested_team.htmlurl, data.requested_team.name)
    mention_user_in_message(channel_id, data.sender, msg, data.organization.login)

def _on_pr_assigned(data):
    """A pull request was assigned to a user.

    Args:
        data: GitHub event data.
    """

    # Don't do anything if there isn't an active Slack channel anyway.
    if data.pull_request.draft or data.pull_request.state != "open":
        return

    url = data.pull_request.htmlurl
    channel_id = lookup_pr_channel(url, data.action)
    if not channel_id:
        return  # Unrecoverable error.

    org = data.organization.login
    assignee = resolve_github_user(data.assignee, org)
    self_assigned = assignee == resolve_github_user(data.sender, org)
    if self_assigned:
        msg = "%s assigned themselves to this PR"
    else:
        msg = "%%s assigned %s to this PR" % assignee
    mention_user_in_message(channel_id, data.sender, msg, org)

    if not assignee.startswith("<@"):
        return  # Not a real Slack user ID.

    assignee = assignee[2:-1]  # Remove "<@" and ">" from Slack user ID.
    add_users_to_channel(channel_id, assignee)

    if self_assigned:
        return

    # DM the reviewer with a reference to the Slack channel.
    msg = "%%s has assigned you to a PR - see <#%s>"
    mention_user_in_message(assignee, data.sender, msg % channel_id, org)

def _on_pr_unassigned(data):
    """A user was unassigned from a pull request.

    Args:
        data: GitHub event data.
    """

    # Don't do anything if there isn't an active Slack channel anyway.
    if data.pull_request.draft or data.pull_request.state != "open":
        return

    channel_id = lookup_pr_channel(data.pull_request.htmlurl, data.action)
    if not channel_id:
        return  # Unrecoverable error.

    org = data.organization.login
    assignee = resolve_github_user(data.assignee, org)
    self_unassigned = assignee == resolve_github_user(data.sender, org)
    if self_unassigned:
        msg = "%s unassigned themselves from this PR"
    else:
        msg = "%%s unassigned %s from this PR" % assignee
    mention_user_in_message(channel_id, data.sender, msg, org)

    if not assignee.startswith("<@") or self_unassigned:
        return

    # TODO: Remove the assignment DM.
    assignee = assignee[2:-1]  # Remove "<@" and ">" from Slack user ID.
    # channel_id = find_dm_channel(user_id, "")
    # if channel_id == "":
    #     print('No Slack DM channel with GitHub user "%s"' % assignee.login)
    #     return
    # delete_messages_containing(channel_id, pr.htmlurl, "")
    # ("...has assigned you to a PR - see <#channel_id>")

def _on_pr_edited(data):
    """The title or body of a pull request was edited.

    Or the base branch of a pull request was changed.

    Args:
        data: GitHub event data.
    """
    org = data.organization.login

    # Don't do anything if there isn't an active Slack channel anyway.
    if data.pull_request.draft or data.pull_request.state != "open":
        return

    channel_id = lookup_pr_channel(data.pull_request.htmlurl, data.action)
    if not channel_id:
        return  # Unrecoverable error.

    # Update the first message if the PR description was changed.
    if data.changes.body:
        if data.pull_request.body:
            msg = "%s updated the PR description:\n\n"
            msg += github_markdown_to_slack(data.pull_request.body, data.pull_request.htmlurl, org)

            pass  # TODO: Update the first message.
        else:
            msg = "%s deleted the PR description"

            pass  # TODO: Same, but without a body.

        mention_user_in_message(channel_id, data.sender, msg, org)

    # Rename the channel if the PR was renamed.
    if data.changes.title:
        pr = data.pull_request
        msg = "%%s edited the PR title to \`%s\`" % pr.title
        mention_user_in_message(channel_id, data.sender, msg, org)

        name = "%d_%s" % (pr.number, normalize_channel_name(pr.title))
        rename_channel(channel_id, name)

def _on_pr_synchronized(data):
    """A pull request's head branch was updated.

    For example, the head branch was updated from the base
    branch or new commits were pushed to the head branch.

    Args:
        data: GitHub event data.
    """

    # Don't do anything if there isn't an active Slack channel anyway.
    if data.pull_request.draft or data.pull_request.state != "open":
        return

    channel_id = lookup_pr_channel(data.pull_request.htmlurl, data.action)
    if not channel_id:
        return  # Unrecoverable error.

    msg = "%s updated the PR's head branch"
    mention_user_in_message(channel_id, data.sender, msg, data.organization.login)

    # TODO: Update channel bookmark titles.
    pr = data.pull_request

    bookmark_id = "TODO"
    title = "Conversation (%d)" % (pr.comments + pr.review_comments)
    slack.bookmarks_edit(bookmark_id, channel_id, title = title)

    bookmark_id = "TODO"
    title = "Commits (%d)" % pr.commits
    slack.bookmarks_edit(bookmark_id, channel_id, title = title)

    bookmark_id = "TODO"
    title = "Files changed (%d)" % pr.changed_files
    slack.bookmarks_edit(bookmark_id, channel_id, title = title)

    bookmark_id = "TODO"
    title = "Diffs (+%d -%d)" % (pr.additions, pr.deletions)
    slack.bookmarks_edit(bookmark_id, channel_id, title = title)
`;
export const github_pr_review_star = `"""Handler for GitHub "pull_request_review" events."""

load("debug.star", "debug")
load("markdown.star", "github_markdown_to_slack")
load(
    "redis_helpers.star",
    "map_github_link_to_slack_message_ts",
    "map_slack_message_ts_to_github_link",
)
load(
    "slack_helpers.star",
    "impersonate_user_in_message",
    "lookup_pr_channel",
    "mention_user_in_message",
)

def on_github_pull_request_review(data):
    """https://docs.github.com/webhooks/webhook-events-and-payloads#pull_request_review

    A pull request review is a group of pull request review
    comments in addition to a body comment and a state.

    For more information, see "About pull request reviews":
    https://docs.github.com/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews

    Args:
        data: GitHub event data.
    """

    # Ignore this event if it was triggered by a bot.
    if data.sender.type == "Bot":
        return

    action_handlers = {
        "submitted": _on_pr_review_submitted,
        "edited": _on_pr_review_edited,
        "dismissed": _on_pr_review_dismissed,
    }
    if data.action in action_handlers:
        action_handlers[data.action](data)
    else:
        debug("Unrecognized GitHub PR review action: \`%s\`" % data.action)

def _on_pr_review_submitted(data):
    """A review on a pull request was submitted.

    This is usually not interesting in itself, unless the review
    state is "approved", and/or the review body isn't empty.

    Args:
        data: GitHub event data.
    """
    org = data.organization.login
    pr_url = data.pull_request.htmlurl
    channel_id = lookup_pr_channel(pr_url, data.pull_request.state)
    if not channel_id:
        debug("Can't sync this PR review: " + data.review.htmlurl)
        return

    if data.review.state == "approved":
        if not data.review.body:
            msg = "%s approved this PR :+1:"
            mention_user_in_message(channel_id, data.sender, msg, org)
            return
        else:
            msg = "<%s|PR approved> :+1:\n\n" % data.review.htmlurl
    elif data.review.body:
        msg = "<%s|PR review>:\n\n" % data.review.htmlurl
    else:
        return

    msg += github_markdown_to_slack(data.review.body, pr_url, org)
    thread_ts = impersonate_user_in_message(channel_id, data.sender, msg, org)
    if not thread_ts:
        return

    # Remember the thread timestamp (message ID) of the Slack message we posted.
    # Usage: syncing edits below to Slack.
    map_github_link_to_slack_message_ts(data.review.htmlurl, thread_ts)

    # Also remember the GitHub review URL, so we can reply to it later from Slack
    # (in create_review_comment_reply() in "github_helpers.star").
    channel_ts = "review:%s:%s" % (channel_id, thread_ts)
    map_slack_message_ts_to_github_link(channel_ts, data.review.htmlurl)

def _on_pr_review_edited(data):
    """The body comment on a pull request review was edited.

    TODO: Implement this.

    Args:
        data: GitHub event data.
    """
    if not getattr(data, "changes", None):
        return

    print(data.changes)
    print(data.review)
    print(data.sender)
    print(data.pull_request)

def _on_pr_review_dismissed(data):
    """A review on a pull request was dismissed.

    TODO: Implement this.

    Args:
        data: GitHub event data.
    """
    print(data.review)
    print(data.sender)
    print(data.pull_request)
`;
export const github_review_comment_star = `"""Handler for GitHub "pull_request_review_comment" events."""

load("debug.star", "debug")
load("markdown.star", "github_markdown_to_slack")
load(
    "redis_helpers.star",
    "map_github_link_to_slack_message_ts",
    "map_slack_message_ts_to_github_link",
)
load(
    "slack_helpers.star",
    "impersonate_user_in_message",
    "impersonate_user_in_reply",
    "lookup_pr_channel",
)

def on_github_pull_request_review_comment(data):
    """https://docs.github.com/webhooks/webhook-events-and-payloads#pull_request_review_comment

    A pull request review comment is a comment on a pull request's diff.

    For more information, see "Commenting on a pull request":
    https://docs.github.com/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/commenting-on-a-pull-request#adding-line-comments-to-a-pull-request

    Args:
        data: GitHub event data.
    """

    # Ignore this event if it was triggered by a bot.
    if data.sender.type == "Bot":
        return

    action_handlers = {
        "created": _on_pr_review_comment_created,
        "edited": _on_pr_review_comment_edited,
        "deleted": _on_pr_review_comment_deleted,
    }
    if data.action in action_handlers:
        action_handlers[data.action](data)
    else:
        debug("Unrecognized GitHub PR review comment action: \`%s\`" % data.action)

def _on_pr_review_comment_created(data):
    """A comment on a pull request diff was created.

    Args:
        data: GitHub event data.
    """
    org = data.org.login
    pr_url = data.pull_request.htmlurl
    channel_id = lookup_pr_channel(pr_url, data.pull_request.state)
    if not channel_id:
        debug("Can't sync this PR review comment: " + data.comment.htmlurl)
        return

    if not getattr(data.comment, "in_reply_to", None):
        # Review comment.
        msg = "<%s|%s review comment> in \`%s\`:\n\n"
        msg %= (data.comment.htmlurl, data.comment.subject_type.capitalize(), data.comment.path)
        msg += github_markdown_to_slack(data.comment.body, pr_url, org)
        thread_ts = impersonate_user_in_message(channel_id, data.sender, msg, org)

        # Remember the GitHub comment ID, so we can reply to it later from Slack.
        # See usage in create_review_comment_reply() in "github_helpers.star".
        if thread_ts:
            channel_ts = "review_comment:%s:%s" % (channel_id, thread_ts)
            map_slack_message_ts_to_github_link(channel_ts, data.comment.id)
    else:
        # Review comment in reply to another review comment.
        thread_url = "%s#discussion_r%d" % (pr_url, data.comment.in_reply_to)
        msg = "<%s|Reply to review comment>:\n\n" % data.comment.htmlurl
        msg += github_markdown_to_slack(data.comment.body, pr_url, org)
        thread_ts = impersonate_user_in_reply(channel_id, thread_url, data.sender, msg, org)

    # Remember the thread/reply timestamp (message ID) of the Slack message we posted.
    # Usage: edit and delete below, impersonate_user_in_reply() for syncing replies.
    if thread_ts:
        map_github_link_to_slack_message_ts(data.comment.htmlurl, thread_ts)

def _on_pr_review_comment_edited(data):
    """The content of a comment on a pull request diff was changed.

    TODO: Implement this.

    Args:
        data: GitHub event data.
    """
    print(data.changes)
    print(data.comment)
    print(data.sender)
    print(data.pull_request)

def _on_pr_review_comment_deleted(data):
    """A comment on a pull request diff was deleted.

    TODO: Implement this.

    Args:
        data: GitHub event data.
    """
    print(data.comment)
    print(data.sender)
    print(data.pull_request)
`;
export const github_thread_star = `"""Handler for GitHub "pull_request_review_thread" events."""

load("debug.star", "debug")

def on_github_pull_request_review_thread(data):
    """https://docs.github.com/webhooks/webhook-events-and-payloads#pull_request_review_thread

    Args:
        data: GitHub event data.
    """
    action_handlers = {
        "resolved": _on_pr_review_thread_resolved,
        "unresolved": _on_pr_review_thread_unresolved,
    }
    if data.action in action_handlers:
        action_handlers[data.action](data)
    else:
        debug("Unrecognized GitHub PR review thread action: \`%s\`" % data.action)

def _on_pr_review_thread_resolved(data):
    """A comment thread on a pull request was marked as resolved.

    TODO: Implement this.

    Args:
        data: GitHub event data.
    """
    print(data.thread)
    print(data.sender)
    print(data.pull_request)

def _on_pr_review_thread_unresolved(data):
    """A previously resolved comment thread on a pull request was marked as unresolved.

    TODO: Implement this.

    Args:
        data: GitHub event data.
    """
    print(data.thread)
    print(data.sender)
    print(data.pull_request)
`;
export const markdown_star = `"""Markdown-related helper functions across GitHub and Slack."""

load("user_helpers.star", "resolve_github_user", "resolve_slack_user")

def github_markdown_to_slack(text, pr_url, github_owner_org):
    """Convert GitHub markdown text to Slack markdown text.

    References:
    - https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax
    - https://api.slack.com/reference/surfaces/formatting
    - https://github.com/qri-io/starlib/tree/master/re

    Args:
        text: Text body, possibly containing GitHub markdown.
        pr_url: URL of the PR we're working on, used to convert
            other PR references in the text ("#123") to links.
        github_owner_org: Required for GitHub org-specific visibility.

    Returns:
        Slack markdown text.
    """

    # Split into lines (Qri's "re" module doesn't support the MULTILINE flag).
    lines = text.replace("\r", "").split("\n")

    # Header lines --> bold lines.
    lines = [re.sub(r"^#+\s+(.+)", "**\$1**", line) for line in lines]

    # Lists: "-" --> "•" and "◦".
    lines = [re.sub(r"^- ", "  •  ", line) for line in lines]
    lines = [re.sub(r"^  - ", r"          ◦   ", line) for line in lines]
    text = "\n".join(lines)

    # Links: "[text](url)" --> "<url|text>".
    # Images: "![text](url)" --> "Image: <url|text>".
    text = re.sub(r"\[(.*?)\]\((.*?)\)", "<\$2|\$1>", text)
    text = re.sub(r"!<(.*?)>", "Image: <\$1>", text)

    # "@..." --> "<@U...>" or "<https://github.com/...|...>".
    for github_user in re.findall(r"@[\w-]+", text):
        profile_link = pr_url.split(github_owner_org)[0] + github_user[1:]
        user_obj = struct(login = github_user[1:], htmlurl = profile_link)
        slack_user = resolve_github_user(user_obj, github_owner_org)
        text = text.replace(github_user, slack_user)

    # "#123" --> "<PR URL|#123>".
    url_base = re.sub(r"/pull/\d+\$", "/pull", pr_url)
    text = re.sub(r"#(\d+)", "<%s/\$1|#\$1>" % url_base, text)

    # Bold and nested italic text: "***" --> "**_".
    text = re.sub(r"\*\*\*(.+?)\*\*\*", "**_\${1}_**", text)

    # Italic text: "*" --> "_".
    text = re.sub(r"(^|[^*])\*([^*]+?)\*", "\${1}_\${2}_", text)

    # Bold text: "**" or "__" --> "*".
    text = re.sub(r"\*\*(.+?)\*\*", "*\$1*", text)
    text = re.sub(r"__(.+?)__", "*\$1*", text)

    return text

def slack_markdown_to_github(text, github_owner_org):
    """Convert Slack markdown text to GitHub markdown text.

    References:
    - https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax
    - https://api.slack.com/reference/surfaces/formatting
    - https://github.com/qri-io/starlib/tree/master/re

    Args:
        text: Text body, possibly containing Slack markdown.
        github_owner_org: Required for GitHub org-specific visibility.

    Returns:
        GitHub markdown text.
    """

    # Bold text: "*" --> "**".
    text = re.sub(r"\*(.+?)\*", "**\$1**", text)

    # Links: "<url|text>" --> "[text](url)".
    text = re.sub(r"<(.*?)\|(.*?)>", "[\$2](\$1)", text)

    # Channels: "<#...|name>" --> "[name](#...)" -->
    # "[#name](https://slack.com/app_redirect?channel=...)"
    # (see https://api.slack.com/reference/deep-linking).
    text = re.sub(r"\[(.*?)\]\(#(.*?)\)", "[#\$1](https://slack.com/app_redirect?channel=\$2)", text)

    # Users: "<@U...>" --> "@github-user".
    for slack_user in re.findall(r"<@[UW][0-9A-Z]*?>", text):
        github_user = resolve_slack_user(slack_user[2:-1], github_owner_org)
        text = text.replace(slack_user, github_user)

    # Multiline code blocks: \`\`\`aaa\nbbb\`\`\` --> \`\`\`\naaa\nbbb\n\`\`\`.
    text = text.replace("\`\`\`", "\n\`\`\`\n")

    # Split into lines (Qri's "re" module doesn't support the MULTILINE flag).
    lines = text.replace("\r", "").split("\n")

    # Quoted text: "&gt; aaa\n&gt; bbb\nccc" --> "> aaa\n> bbb\n\nccc".
    lines = [re.sub(r"^&gt;(.*)", ">\$1\n", line) for line in lines]
    text = "\n".join(lines)
    text = text.replace("\n\n>", "\n>")

    return text
`;
export const redis_helpers_star = `"""Redis API helper functions."""

load("@redis", "redis")
load("debug.star", "debug")
load("env", "REDIS_TTL")  # Set in "autokitteh.yaml".

_GET_TIMEOUT = 5  # Seconds.

# Optimization: cache user lookup results for a day, to
# reduce the amount of API calls, especially to Slack.
_USER_CACHE_TTL = "24h"

def _del(key):
    """https://redis.io/commands/del/"""
    redis.delete(key)

def _get(key, wait):
    """https://redis.io/commands/get/ + optional retries"""
    attempts = _GET_TIMEOUT if wait else 1
    for _ in range(attempts):
        value = redis.get(key)
        if value:
            return value
        else:
            sleep(1)  # Wait for the key to exist, up to a point.

    # Timeout.
    return ""

def _set(key, value, ttl = None):
    """https://redis.io/commands/set/"""
    if ttl:
        resp = redis.set(key, value, ttl)
    else:
        resp = redis.set(key, value)
    if resp != "OK":
        debug("Redis \`set %s %s %s\` failed: \`%s\`" % (key, value, ttl, resp))
    return resp == "OK"

def cache_github_reference(slack_user_id, github_ref):
    """Optimization to reduce the amount of API calls in "user_helpers.star"."""
    _set("slack_user:" + slack_user_id, github_ref, _USER_CACHE_TTL)

def cached_github_reference(slack_user_id):
    """Optimization to reduce the amount of API calls in "user_helpers.star".

    Args:
        slack_user_id: Slack user ID to look-up.

    Returns:
        GitHub user reference ("@username"), the Slack user's full name, or "" if not found.
    """
    github_ref = _get("slack_user:" + slack_user_id, wait = False)
    if github_ref:
        # Optimization: extend the TTL after a successful cache hit.
        # See: https://redis.io/commands/expire/
        redis.expire("slack_user:" + slack_user_id, _USER_CACHE_TTL)

    return github_ref

def cache_slack_user_id(github_username, slack_user_id):
    """Optimization to reduce the amount of API calls in "user_helpers.star"."""
    _set("github_user:" + github_username, slack_user_id, _USER_CACHE_TTL)

def cached_slack_user_id(github_username):
    """Optimization to reduce the amount of API calls in "user_helpers.star".

    Args:
        github_username: GitHub username to look-up.

    Returns:
        Slack user ID, or "" if not found.
    """
    slack_user_id = _get("github_user:" + github_username, wait = False)
    if slack_user_id:
        # Optimization: extend the TTL after a successful cache hit,
        # but only for bots and real users. If the cached result is
        # "not found" then reevaluate it on a daily basis.
        # See: https://redis.io/commands/expire/
        if slack_user_id != "not found":
            redis.expire("github_user:" + github_username, _USER_CACHE_TTL)

    return slack_user_id

def map_github_link_to_slack_channel_id(github_link, slack_channel_id):
    """Called in "github_pr.star", used by future GitHub events."""
    _set(github_link, slack_channel_id, REDIS_TTL)

def lookup_github_link_details(github_link):
    return _get(github_link, wait = True)

def map_slack_channel_id_to_pr_details(slack_channel_id, org, repo, pr_number):
    """Called in "github_pr.star", used by future Slack events."""
    _set(slack_channel_id, "%s:%s:%s" % (org, repo, pr_number), REDIS_TTL)

def translate_slack_channel_id_to_pr_details(slack_channel_id):
    """Synchronize Slack events to GitHub PRs."""
    pr_details = _get(slack_channel_id, wait = True) or "::0"
    owner, repo, pr = pr_details.split(":")
    return owner, repo, int(pr)

def map_github_link_to_slack_message_ts(github_link, slack_message_ts):
    _set(github_link, slack_message_ts, REDIS_TTL)

def map_slack_message_ts_to_github_link(slack_message_ts, github_link):
    _set(slack_message_ts, github_link, REDIS_TTL)

def translate_slack_review_comment_to_github_id(channel_id, message_ts):
    """Called by create_review_comment_reply() in "github_helpers.star"."""
    id = _get("review_comment:%s:%s" % (channel_id, message_ts), wait = True) or "0"
    return int(id)

def translate_slack_message_to_github_link(message_type, channel_id, message_ts):
    """Called by create_review_comment_reply() in "github_helpers.star"."""
    return _get("%s:%s:%s" % (message_type, channel_id, message_ts), wait = False)

def del_slack_opt_out(slack_user_id):
    """Called by _opt_in() in "slack_cmd.star"."""
    _del("slack_opt_out:" + slack_user_id)

def get_slack_opt_out(slack_user_id):
    return _get("slack_opt_out:" + slack_user_id, wait = False)

def set_slack_opt_out(slack_user_id):
    """Called by _opt_out() in "slack_cmd.star"."""
    return _set("slack_opt_out:" + slack_user_id, time.now())  # No expiration.
`;
export const slack_cmd_star = `"""Handler for Slack slash-command events."""

load("@slack", "slack")
load(
    "redis_helpers.star",
    "del_slack_opt_out",
    "get_slack_opt_out",
    "set_slack_opt_out",
)

WAKE_WORD = "purrr"
HELP_CMD = "help"

def on_slack_slash_command(data):
    """https://api.slack.com/interactivity/slash-commands

    See also: https://api.slack.com/interactivity/handling#message_responses

    Args:
        data: Slack event data.
    """

    # Split the command string into normalized arguments.
    # See: https://github.com/qri-io/starlib/tree/master/re
    args = re.split(r"\s+", data.text.lower().strip())

    # No command? Nothing to do.
    if len(args) == 0:
        return

    # Just "help"? Only hint at a more specific help command (i.e. "help"
    # with our wake-word), so we won't interfere with other autokitteh
    # projects that may be reusing the same Slack connection token to
    # implement their own slash commands with their own help messages.
    if args == (HELP_CMD,):
        # Why an ephemeral message? No need to spam the channel,
        # show the help message only to the user who asked for it.
        text = "Type: \`%s %s %s\`" % (data.command, HELP_CMD, WAKE_WORD)
        slack.chat_post_ephemeral(data.channel_id, data.user_id, text)
        return

    # Do nothing if the command doesn't start with our wake-word (it's probably
    # being handled by a different autokitteh project that is reusing the same
    # Slack connection token), unless it's "help" followed by our wake-word.
    if WAKE_WORD in args and (HELP_CMD in args or len(args) == 1):
        _help(data, args)
        return
    if args[0] != WAKE_WORD:
        return

    # Route further processing to the appropriate sub-command handler.
    for cmd, _, func in COMMANDS:
        if cmd == args[1]:
            func(data, args[1:])
            return

    error = "Error: unrecognized \`%s\` sub-command: \`%s\`" % (WAKE_WORD, args[1])
    slack.chat_post_ephemeral(data.channel_id, data.user_id, error)

def _error(data, cmd, msg):
    error = "Error in \`%s %s %s\`: %s" % (data.command, WAKE_WORD, cmd, msg)
    slack.chat_post_ephemeral(data.channel_id, data.user_id, error)

def _help(data, args):
    """Help command.

    Args:
        data: Slack event data.
        args: Tuple of normalized string arguments.
    """
    if len(args) > 2:
        _error(data, HELP_CMD, "this command doesn't accept extra arguments")
        return

    help = ":wave: *GitHub Pull Request Review Reminder (PuRRR)* :wave:\n\nAvailable slash commands:"
    for cmd, description, _ in COMMANDS:
        help += "\n  •  \`%s %s %s\` - %s" % (data.command, WAKE_WORD, cmd, description)
    slack.chat_post_ephemeral(data.channel_id, data.user_id, help)

def _opt_in(data, args):
    """Opt-in command.

    Args:
        data: Slack event data.
        args: Tuple of normalized string arguments.
    """
    if len(args) > 1:
        _error(data, args[0], "this command doesn't accept extra arguments")
        return

    if not get_slack_opt_out(data.user_id):
        msg = ":bell: You're already opted into PuRRR"
        slack.chat_post_ephemeral(data.channel_id, data.user_id, msg)
        return

    del_slack_opt_out(data.user_id)
    msg = ":bell: You are now opted into PuRRR"
    slack.chat_post_ephemeral(data.channel_id, data.user_id, msg)

def _opt_out(data, args):
    """Opt-out command.

    Args:
        data: Slack event data.
        args: Tuple of normalized string arguments.
    """
    if len(args) > 1:
        _error(data, args[0], "this command doesn't accept extra arguments")
        return

    opt_out_time = get_slack_opt_out(data.user_id)
    if opt_out_time:
        msg = ":no_bell: You're already opted out of PuRRR since: " + opt_out_time
        slack.chat_post_ephemeral(data.channel_id, data.user_id, msg)
        return

    if set_slack_opt_out(data.user_id):
        msg = ":no_bell: You are now opted out of PuRRR"
        slack.chat_post_ephemeral(data.channel_id, data.user_id, msg)

def _list(data, args):
    """List command.

    Args:
        data: Slack event data.
        args: Tuple of normalized string arguments.
    """
    if len(args) > 1:
        _error(data, args[0], "this command doesn't accept extra arguments")
        return

    slack.chat_post_ephemeral(data.channel_id, data.user_id, "TODO: implement me!")

def _status(data, args):
    """Status command.

    Args:
        data: Slack event data.
        args: Tuple of normalized string arguments.
    """

    # TODO: If the Slack channel belongs to a PR, the args are optional.
    if len(args) != 2:
        msg = "this command requires exactly 1 argument - an ID of a "
        msg += "GitHub PR (\`<org>/<repo>/<number>\`), or its full URL"
        _error(data, args[0], msg)
        return

    slack.chat_post_ephemeral(data.channel_id, data.user_id, "TODO: implement me!")

def _approve(data, args):
    """Approve command.

    Args:
        data: Slack event data.
        args: Tuple of normalized string arguments.
    """

    # TODO: If the Slack channel belongs to a PR, the args are optional.
    if len(args) != 2:
        msg = "this command requires exactly 1 argument - an ID of a "
        msg += "GitHub PR (\`<org>/<repo>/<number>\`), or its full URL"
        _error(data, args[0], msg)
        return

    slack.chat_post_ephemeral(data.channel_id, data.user_id, "TODO: implement me!")

COMMANDS = [
    ("opt-in", "Opt into receiving notifications", _opt_in),
    ("opt-out", "Opt out of receiving notifications", _opt_out),
    ("list", "List all PRs you should pay attention to", _list),
    ("status [PR]", "Check the status of a specific PR", _status),
    ("approve [PR]", "Approve a specific PR", _approve),
]
`;
export const slack_helpers_star = `"""Slack API helper functions."""

load("@slack", "slack")
load("debug.star", "debug")
load("env", "SLACK_CHANNEL_PREFIX", "SLACK_LOG_CHANNEL")  # Set in "autokitteh.yaml".
load("redis_helpers.star", "get_slack_opt_out", "lookup_github_link_details")
load("user_helpers.star", "github_username_to_slack_user", "resolve_github_user")

_CHANNEL_MAX_METADATA_LENGTH = 250  # Characters.

def add_users_to_channel(channel_id, users):
    """Invite all the participants in a GitHub PR to a Slack channel.

    Args:
        channel_id: Slack channel ID.
        users: Comma-separated list of (up to 1000) Slack user IDs.
    """

    # Quietly ignore users who opted out of PuRRR. They will still be
    # mentioned in the channel, but as non-members they won't know it.
    opted_in = []
    for user_id in users.split(","):
        if not get_slack_opt_out(user_id):
            opted_in.append(user_id)
    users = ",".join(opted_in)

    # See: https://api.slack.com/methods/conversations.invite
    resp = slack.conversations_invite(channel_id, users, force = True)
    if resp.ok or resp.error == "already_in_channel":
        return

    # An error occurred - first, report it.
    debug("Add Slack users to channel <#%s>: \`%s\`" % (channel_id, resp.error))
    for e in resp.errors:
        debug("Error: <@%s> - \`%s\`" % (e.user, e.error))

    # Now check if it's fatal or not.
    # See: https://api.slack.com/methods/conversations.members
    resp = slack.conversations_members(channel_id, limit = 100)
    if resp.ok and len(resp.members) > 1:  # At least some users were added.
        for user_id in resp.members:
            debug("Member: <@%s>" % user_id)
        return

    # No members at all? Abort the channel.
    # See: https://api.slack.com/methods/conversations.archive
    resp = slack.conversations_archive(channel_id)
    if not resp.ok:
        debug("Archive DOA channel \`%s\`: \`%s\`" % (channel_id, resp.error))

def archive_channel(channel_id, data):
    """Archive a Slack channel.

    Args:
        channel_id: Slack channel ID.
        data: GitHub event data.

    Returns:
        True on success, False on errors.
    """

    # See: https://api.slack.com/methods/conversations.archive
    resp = slack.conversations_archive(channel_id)
    if not resp.ok:
        pr_url = data.pull_request.htmlurl
        msg = "State of %s is \`%s\`, but <#%s> can't be archived: \`%s\`"
        msg %= (pr_url, data.action, channel_id, resp.error)
        slack.chat_post_message(channel_id, "Failed to archive this channel")

        debug(msg)

        # TODO: Also post a reply in the log channel.

    return resp.ok

def create_channel(data, name, suffix = 1):
    """Create a public Slack channel.

    Args:
        data: GitHub event data.
        name: Desired (and valid) name of the channel.
        suffix: Optional suffix to append to the channel name.

    Returns:
        Channel ID, or "" on errors.
    """

    # Optional suffix to make the channel name unique.
    # We could add a recursion stop condition, but it's not necessary.
    n = name
    if suffix > 1:
        n += "_%d" % suffix

    # Create the channel.
    # See: https://api.slack.com/methods/conversations.create
    resp = slack.conversations_create(SLACK_CHANNEL_PREFIX + n)
    if not resp.ok:
        if resp.error == "name_taken":
            # If a channel with the same name already exists,
            # try again recursively with a numeric suffix.
            return create_channel(data, name, suffix + 1)
        else:
            debug('Create Slack channel "%s": \`%s\`' % (n, resp.error))
            return ""

    # As long as the channel was created, these nice-to-haves aren't critical.
    channel_id = resp.channel.id
    _set_channel_description(channel_id, data)
    _set_channel_topic(channel_id, data)

    # TODO: Post a message in the log channel.

    return channel_id

def get_permalink(channel_id, message_ts):
    """Return a markdown-formatted permalink to a specific Slack message.

    Args:
        channel_id: ID of the Slack channel containing the message.
        message_ts: Timestamp of the specific message to link to.

    Returns:
        GitHub Markdown-formatted link, or just the word "Slack"
        if we couldn't generate it.
    """

    # See: https://api.slack.com/methods/chat.getPermalink
    resp = slack.chat_get_permalink(channel_id, message_ts)
    if resp.ok:
        return "[Slack](%s)" % resp.permalink
    else:
        debug("Failed to get permalink for Slack message: \`%s\`" % resp.error)
        return "Slack"

def impersonate_user_in_message(channel_id, github_user, msg, github_owner_org):
    """Post a message to a Slack channel, as a user.

    See also the "mention_user_in_message" function below.

    Args:
        channel_id: ID of the channel to send the message to.
        github_user: GitHub user object of the mentioned user.
        msg: Message to send (not containing a "%s" placeholder).
        github_owner_org: Required for GitHub org-specific visibility.

    Returns:
        Message's thread timestamp, or "" on errors.
    """
    if not channel_id:
        return ""

    user = github_username_to_slack_user(github_user.login, github_owner_org)
    if not user:
        return ""

    # TODO: Also post the message in the log channel.
    p = user.profile

    resp = slack.chat_post_message(channel_id, msg, username = p.real_name, icon_url = p.image_48)
    return resp.ts if resp.ok else ""

def impersonate_user_in_reply(channel_id, review_url, github_user, msg, github_owner_org):
    """Post a reply to a Slack message (review comment), as a user.

    See also the "mention_user_in_reply" function below.

    Args:
        channel_id: ID of the channel to send the message to.
        review_url: URL of the GitHub PR review to comment on.
        github_user: GitHub user object of the mentioned user.
        msg: Message to send (not containing a "%s" placeholder).
        github_owner_org: Required for GitHub org-specific visibility.

    Returns:
        Message's thread timestamp, or "" on errors.
    """
    if not channel_id:
        return ""

    user = github_username_to_slack_user(github_user.login, github_owner_org)
    if not user:
        return ""

    # TODO: Also post the reply in the log channel.
    p = user.profile

    thread_ts = _lookup_review_message(review_url)
    if not thread_ts:
        return ""

    resp = slack.chat_post_message(channel_id, msg, thread_ts = thread_ts, username = p.real_name, icon_url = p.image_48)
    return resp.ts if resp.ok else ""

def lookup_pr_channel(pr_url, state):
    """Return the ID of a Slack channel representing a GitHub PR.

    This function waits for the channel to exist, if it doesn't already,
    up to a timeout of a few seconds. This is useful when we want to sync
    multiple events during channel creation, i.e. PR re/opening.

    Args:
        pr_url: URL of the GitHub PR.
        state: GitHub event's action.

    Returns:
        Channel ID, or "" if not found.
    """
    channel_id = lookup_github_link_details(pr_url)
    if not channel_id:
        debug("State of %s is \`%s\`, but Slack channel ID not found" % (pr_url, state))
    return channel_id

def _lookup_review_message(review_url):
    """Return the ID of a Slack message representing a GitHub PR review.

    This function waits for the message to exist, if it doesn't already,
    up to a timeout of a few seconds.

    Args:
        review_url: URL of the GitHub PR review to search for.

    Returns:
        Message's thread timestamp, or "" if not found.
    """
    thread_ts = lookup_github_link_details(review_url)
    if not thread_ts:
        debug("Message mapping for %s not found" % review_url)
    return thread_ts

def mention_user_in_message(channel_id, github_user, msg, github_owner_org):
    """Post a message to a Slack channel, mentioning a user.

    See also the "impersonate_user_in_message" function above.

    Args:
        channel_id: ID of the channel to send the message to.
        github_user: GitHub user object of the mentioned user.
        msg: Message to send, containing a single "%s" placeholder.
        github_owner_org: Required for GitHub org-specific visibility.

    Returns:
        Message's thread timestamp, or "" on errors.
    """
    if not channel_id:
        return ""

    msg %= resolve_github_user(github_user, github_owner_org)

    # TODO: Also post the message in the log channel.

    resp = slack.chat_post_message(channel_id, msg)
    return resp.ts if resp.ok else ""

def mention_user_in_reply(channel_id, review_url, github_user, msg, github_owner_org):
    """Post a reply to a Slack message (review comment), mentioning a user.

    See also the "impersonate_user_in_reply" function above.

    Args:
        channel_id: ID of the channel to send the message to.
        review_url: URL of the GitHub PR review to comment on.
        github_user: GitHub user object of the mentioned user.
        msg: Message to send, containing a single "%s" placeholder.
        github_owner_org: Required for GitHub org-specific visibility.

    Returns:
        Message's thread timestamp, or "" on errors.
    """
    if not channel_id:
        return ""

    msg %= resolve_github_user(github_user, github_owner_org)

    # TODO: Also post the reply in the log channel.

    thread_ts = _lookup_review_message(review_url)
    if not thread_ts:
        return ""

    resp = slack.chat_post_message(channel_id, msg, thread_ts = thread_ts)
    return resp.ts if resp.ok else ""

def normalize_channel_name(name):
    """Convert arbitrary text into a valid Slack channel name.

    Args:
        name: Desired name for a Slack channel.

    Returns:
        Valid Slack channel name.
    """
    name = name.lower().strip()

    # https://github.com/qri-io/starlib/tree/master/re
    name = re.sub(r"'\"", "", name)
    name = re.sub(r"[^a-z0-9_-]", "-", name)
    name = re.sub(r"[_-]{2,}", "-", name)

    # Slack channel names are limited to 80 characters, but that's
    # too long for comfort, so we use 50 instead. Plus, we need to
    # leave room for a PR number prefix and a uniqueness suffix.
    name = name[:50]

    # Cosmetic tweak: remove leading and trailing hyphens.
    if name[0] == "-":
        name = name[1:]
    if name[-1] == "-":
        name = name[:-1]

    return name

def rename_channel(channel_id, name, suffix = 1):
    """Rename a Slack channel.

    Args:
        channel_id: Slack channel ID.
        name: Desired (and valid) name of the channel.
        suffix: Optional suffix to append to the channel name.
    """

    # Optional suffix to make the channel name unique.
    # We could add a recursion stop condition, but it's not necessary.
    n = name
    if suffix > 1:
        n += "_%d" % suffix

    # Rename the channel.
    # See: https://api.slack.com/methods/conversations.rename
    resp = slack.conversations_rename(channel_id, SLACK_CHANNEL_PREFIX + n)
    if not resp.ok:
        if resp.error == "name_taken":
            # If a channel with the same name already exists,
            # try again recursively with a numeric suffix.
            rename_channel(channel_id, name, suffix + 1)
            return
        else:
            debug('Rename Slack channel to "%s": \`%s\`' % (n, resp.error))
            return

def _set_channel_description(channel_id, data):
    """Set the description of a Slack channel to a GitHub PR title.

    Args:
        channel_id: Slack channel ID.
        data: GitHub event data.
    """
    pr = data.pull_request
    s = "\`%s\`" % pr.title
    if len(s) > _CHANNEL_MAX_METADATA_LENGTH:
        s = s[:_CHANNEL_MAX_METADATA_LENGTH - 4] + "\`..."

    # See: https://api.slack.com/methods/conversations.setPurpose
    resp = slack.conversations_set_purpose(channel_id, s)
    if not resp.ok:
        msg = "State of %s is \`%s\`, but <#%s> can't be updated: \`%s\`"
        debug(msg % (pr.htmlurl, data.action, channel_id, resp.error))

def _set_channel_topic(channel_id, data):
    """Set the topic of a Slack channel to a GitHub PR URL.

    Args:
        channel_id: Slack channel ID.
        data: GitHub event data.
    """
    pr = data.pull_request
    s = pr.htmlurl
    if len(s) > _CHANNEL_MAX_METADATA_LENGTH:
        s = s[:_CHANNEL_MAX_METADATA_LENGTH - 4] + " ..."

    # See: https://api.slack.com/methods/conversations.setTopic
    resp = slack.conversations_set_topic(channel_id, s)
    if not resp.ok:
        msg = "State of %s is \`%s\`, but <#%s> can't be updated: \`%s\`"
        debug(msg % (pr.htmlurl, data.action, channel_id, resp.error))

def unarchive_channel(channel_id, data):
    """Unarchive a Slack channel.

    Attention - https://api.slack.com/methods/conversations.unarchive:
    Bug alert: bot tokens (xoxb-...) cannot currently be used to unarchive
    conversations. For now, please use a user token (xoxp-...) to unarchive
    the conversation rather than a bot token.

    Args:
        channel_id: Slack channel ID.
        data: GitHub event data.

    Returns:
        True on success, False on errors.
    """

    # See: https://api.slack.com/methods/conversations.unarchive
    resp = slack.conversations_unarchive(channel_id)
    if not resp.ok:
        pr_url = data.pull_request.htmlurl
        msg = "State of %s is \`%s\`, but <#%s> can't be unarchived: \`%s\`"
        debug(msg % (pr_url, data.action, channel_id, resp.error))

    # TODO: Also post a reply in the log channel.

    return resp.ok
`;
export const slack_message_star = `"""Handler for Slack message events."""

load("@slack", "slack")
load("github_helpers.star", "create_review_comment", "create_review_comment_reply")
load("markdown.star", "slack_markdown_to_github")
load("redis_helpers.star", "translate_slack_channel_id_to_pr_details")
load("slack_helpers.star", "get_permalink")
load("user_helpers.star", "resolve_slack_user")

def on_slack_message(data):
    """https://api.slack.com/events/message

    Args:
        data: Slack event data.
    """
    subtype_handlers = {
        "": _on_slack_new_message,
        "message_changed": _on_slack_message_changed,
        "message_deleted": _on_slack_message_deleted,
        "thread_broadcast": _on_slack_new_message,
    }
    if data.subtype in subtype_handlers:
        subtype_handlers[data.subtype](data)

def _on_slack_new_message(data):
    """https://api.slack.com/events/message

    Args:
        data: Slack event data.
    """
    owner, repo, pr = translate_slack_channel_id_to_pr_details(data.channel)
    if not owner:
        return  # This is not a PR channel.
    github_user = resolve_slack_user(data.user, owner)

    # See subtype bug note in https://api.slack.com/events/message/message_replied
    if not data.thread_ts:
        # Slack message = GitHub review + single comment (we only need the comment
        # for correct 2-way syncs, but we can't have it without a parent review).
        review = "%s via %s" % (github_user, get_permalink(data.channel, data.ts))
        comment = slack_markdown_to_github(data.text, owner)
        create_review_comment(owner, repo, pr, review, comment, data.channel, data.ts)
    else:
        # Slack threaded reply = GitHub review comment.
        body = "%s replied via %s:\n\n"
        if not data.root:
            body %= (github_user, get_permalink(data.channel, data.ts))
        else:
            # Special case but same result: reply is broadcasted to the channel.
            body %= (github_user, get_permalink(data.channel, data.root.ts))
        body += slack_markdown_to_github(data.text, owner)

        create_review_comment_reply(owner, repo, pr, body, data.channel, data.thread_ts)

def _on_slack_message_changed(data):
    """https://api.slack.com/events/message/message_changed

    Args:
        data: Slack event data.
    """

    # Corner case 1: this event is also fired for a message when
    # a threaded reply is broadcasted to the channel, and when a
    # threaded reply is deleted - we don't care about them.
    if data.message.text == data.previous_message.text:
        return

    # Corner case 2: this event is also fired when a message
    # is deleted but its threaded replies are not - we handle
    # this as a regular deletion of a GitHub review.
    if data.message.subtype == "tombstone":
        msg = ":point_up: TODO - delete GitHub review (TS = \`%s\`)" % data.message.ts
        slack.chat_post_message(data.channel, msg)
        return

    github_user = resolve_slack_user(data.message.user)

    if not data.message.thread_ts:
        # Slack message = GitHub review.
        msg = ":point_up: TODO - edit GitHub review: \`%s\`: %s (TS = \`%s\`)"
        msg %= (github_user, data.message.text, data.message.ts)
    else:
        # Slack threaded reply = GitHub review comment.
        msg = ":point_up: TODO - edit GitHub review comment: \`%s\`: %s (TS = \`%s\`, Slack thread = \`%s\`)"
        msg %= (github_user, data.message.text, data.message.ts, data.message.thread_ts)

    slack.chat_post_message(data.channel, msg)

def _on_slack_message_deleted(data):
    """https://api.slack.com/events/message/message_deleted

    Args:
        data: Slack event data.
    """
    if not data.previous_message.thread_ts:
        # Slack message = GitHub review.
        msg = ":point_up: TODO - delete GitHub review (TS = \`%s\`)"
        msg %= data.deleted_ts
    else:
        # Slack threaded reply = GitHub review comment.
        msg = ":point_up: TODO - delete GitHub review comment (TS = \`%s\`, Slack thread = \`%s\`)"
        msg %= (data.deleted_ts, data.previous_message.thread_ts)  ###

    slack.chat_post_message(data.channel, msg)
`;
export const slack_reaction_star = `"""Handler for Slack reaction events."""

load("@slack", "slack")
load("redis_helpers.star", "translate_slack_channel_id_to_pr_details")
load("user_helpers.star", "resolve_slack_user")

def on_slack_reaction_added(data):
    """https://api.slack.com/events/reaction_added

    Args:
        data: Slack event data.
    """
    owner, _, _ = translate_slack_channel_id_to_pr_details(data.item.channel)
    if not owner:
        return  # This is not a PR channel.
    github_user = resolve_slack_user(data.user, owner)
    msg = ":point_up: TODO - add GitHub review comment: \`%s\` added reaction \`%s\` (channel = \`%s\`, TS = \`%s\`)"
    msg %= (github_user, data.reaction, data.item.channel, data.item.ts)
    slack.chat_post_message(data.channel, msg)

    # Use GitHub's reactions API instead of comments? Easy, but requires user impersonation.
    # Reminder: in the GH reactions API, Slack "smile" = "laugh", Slack "tada" = "hurray".
    # Other supported reactions in GH: "+1", "-1", "confused", "heart", "rocket", "eyes".
    # See: https://docs.github.com/en/rest/reactions/reactions?apiVersion=2022-11-28
`;
export const user_helpers_star = `"""User-related helper functions across GitHub and Slack."""

load("@github", "github")
load("@slack", "slack")
load("debug.star", "debug")
load(
    "redis_helpers.star",
    "cache_github_reference",
    "cache_slack_user_id",
    "cached_github_reference",
    "cached_slack_user_id",
)

def _email_to_github_user_id(email, github_owner_org):
    """Convert an email address into a GitHub user ID.

    Args:
        email: User's email address.
        github_owner_org: Required for GitHub org-specific visibility.

    Returns:
        GitHub user ID, or "" if not found.
    """

    # See: https://docs.github.com/en/rest/search/search#search-users
    # And: https://docs.github.com/en/search-github/searching-on-github/searching-users
    resp = github.search_users(email + " in:email", owner = github_owner_org)
    if resp.total == 1:
        return resp.users[0].login
    else:
        debug("GitHub search results: %d users with the email address \`%s\`" % (resp.total, email))
        return ""

def _email_to_slack_user_id(email):
    """Convert an email address into a Slack user ID.

    Args:
        email: Email address.

    Returns:
        Slack user ID, or "" if not found.
    """

    # See: https://api.slack.com/methods/users.lookupByEmail
    resp = slack.users_lookup_by_email(email)
    if resp.ok:
        return resp.user.id
    else:
        debug("Look-up Slack user by email %s: \`%s\`" % (email, resp.error))
        return ""

def github_pr_participants(pr):
    """Return all the participants in the given GitHub pull request.

    Args:
        pr: GitHub pull request object.

    Returns:
        List of usernames (author/reviewers/assignees),
        guaranteed to be sorted and without repetitions.
    """
    usernames = []

    # Author.
    if pr.user.type == "User":
        usernames.append(pr.user.login)

    # Specific reviewers (not reviewing teams) + assignees.
    for user in pr.requested_reviewers + pr.assignees:
        if user.type == "User" and user.login not in usernames:
            usernames.append(user.login)

    return sorted(usernames)

def github_username_to_slack_user(username, github_owner_org):
    """Convert a GitHub username into a Slack user object.

    Args:
        username: GitHub username.
        github_owner_org: Required for GitHub org-specific visibility.

    Returns:
        Slack user object, or None if not found.
    """
    slack_user_id = github_username_to_slack_user_id(username, github_owner_org)
    if not slack_user_id:
        return None

    # See: https://api.slack.com/methods/users.info
    resp = slack.users_info(slack_user_id)
    if not resp.ok:
        debug("Get Slack user info for <@%s>: \`%s\`" % (slack_user_id, resp.error))
        return None

    return resp.user

def github_username_to_slack_user_id(github_username, github_owner_org):
    """Convert a GitHub username into a Slack user ID.

    This function tries to match the email address first, and then
    falls back to matching the user's full name (case-insensitive).

    This function also caches successful results for a day,
    to reduce the amount of API calls, especially to Slack.

    Args:
        github_username: GitHub username.
        github_owner_org: Required for GitHub org-specific visibility.

    Returns:
        Slack user ID, or "" if not found.
    """

    # Optimization: if we already have it cached, no need to look it up.
    slack_user_id = cached_slack_user_id(github_username)
    if slack_user_id:
        if slack_user_id in ("bot", "not found"):
            slack_user_id = ""
        return slack_user_id

    # See: https://docs.github.com/en/rest/users#get-a-user
    resp = github.get_user(github_username, owner = github_owner_org)
    github_user_link = "<%s|%s>" % (resp.htmlurl, github_username)

    # Special case: GitHub bots can't have Slack identities.
    if resp.type == "Bot":
        cache_slack_user_id(github_username, "bot")
        return ""

    # Try to match by the email address first.
    if not resp.email:
        debug("GitHub user %s: email address not found" % github_user_link)
    else:
        slack_user_id = _email_to_slack_user_id(resp.email)
        if slack_user_id:
            cache_slack_user_id(github_username, slack_user_id)
            return slack_user_id

    # Otherwise, try to match by the user's full name.
    if not resp.name:
        debug("GitHub user %s: full name not found" % github_user_link)
        return ""

    gh_full_name = resp.name.lower()
    for user in _slack_users():
        slack_names = (
            user.profile.real_name.lower(),
            user.profile.real_name_normalized.lower(),
        )
        if gh_full_name in slack_names:
            cache_slack_user_id(github_username, user.id)
            return user.id

    # Optimization: cache unsuccessful results too (i.e. external users).
    debug("GitHub user %s: email & name not found in Slack" % github_user_link)
    cache_slack_user_id(github_username, "not found")
    return ""

def resolve_github_user(github_user, github_owner_org):
    """Convert a GitHub username to a linkified user reference in Slack.

    Args:
        github_user: GitHub user object.
        github_owner_org: Required for GitHub org-specific visibility.

    Returns:
        Slack user reference, or GitHub profile link.
        Used for mentioning users in Slack messages.
    """
    id = github_username_to_slack_user_id(github_user.login, github_owner_org)
    if id:
        # Mention the user by their Slack ID, if possible.
        return "<@%s>" % id
    else:
        # Otherwise, fall-back to their GitHub profile link.
        return "<%s|%s>" % (github_user.htmlurl, github_user.login)

def resolve_slack_user(slack_user_id, github_owner):
    """Convert a Slack user ID to a GitHub user reference.

    This function also caches successful results for a day,
    to reduce the amount of API calls, especially to Slack.

    Args:
        slack_user_id: Slack user ID.
        github_owner: Required for GitHub org-specific visibility.

    Returns:
        GitHub user reference, or the Slack user's full name, or "Someone".
        Used for mentioning users in GitHub reviews and comments.
    """
    if not slack_user_id:
        debug("Slack user ID not found in Slack message event")
        return "Someone"

    # Optimization: if we already have it cached, no need to look it up.
    github_ref = cached_github_reference(slack_user_id)
    if github_ref:
        return github_ref

    # See: https://api.slack.com/methods/users.info
    resp = slack.users_info(slack_user_id)
    if not resp.ok:
        debug("Get Slack user info for <@%s>: \`%s\`" % (slack_user_id, resp.error))
        return "Someone"

    # Special case: Slack bots can't have GitHub identities.
    if resp.user.is_bot:
        bot_name = resp.user.real_name + " (Slack bot)"
        cache_github_reference(slack_user_id, bot_name)
        return bot_name

    # Try to match by the email address first.
    email = getattr(resp.user.profile, "email", "")  # May be None.
    if not email:
        debug("Slack user <@%s>: email address not found" % slack_user_id)
    else:
        github_id = _email_to_github_user_id(email, github_owner)
        if github_id:
            github_ref = "@" + github_id
            cache_github_reference(slack_user_id, github_ref)
            return github_ref

    # TODO: Otherwise, try to match by the user's full name?
    # (Unlike Slack, where we limit the user list to a specific workspace,
    # this would search across all GitHub users, which is risky and inefficient).

    # Otherwise, return the user's full name.
    return resp.user.real_name

def _slack_users(cursor = ""):
    """Return a list of all Slack users in the workspace.

    This function uses recursion for pagination because
    Starlark doesn't officially support the "while" statement
    (even though autokitteh does, with starlark-go).

    Args:
        cursor: Optional, for pagination (initial value must be "").

    Returns:
        List of all Slack users in the workspace.
    """

    # See: https://api.slack.com/methods/users.list
    resp = slack.users_list(cursor, limit = 100)
    if not resp.ok:
        debug("List Slack users (cursor \`%s\`): \`%s\`" % (cursor, resp.error))
        return []

    users = resp.members
    if resp.response_metadata.next_cursor:
        users += _slack_users(resp.response_metadata.next_cursor)
    return users
`;