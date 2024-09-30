# Google Sheets Sample

This AutoKitteh project demonstrates 2-way integration with
[Google Sheets](https://workspace.google.com/products/sheets/).

## API Documentation

https://docs.autokitteh.com/integrations/google/sheets/python

## Setup Instructions

1. Install and start a
   [self-hosted AutoKitteh server](https://docs.autokitteh.com/get_started/quickstart),
   or use AutoKitteh Cloud

2. Optional for self-hosted servers (preconfigured in AutoKitteh Cloud):

   - [Enable Google connections to use OAuth 2.0](https://docs.autokitteh.com/integrations/google/config)
   - [Enable Slack connections to use an OAuth v2 app](https://docs.autokitteh.com/integrations/slack/config)

3. Run these commands to deploy this project's manifest file:

   ```shell
   git clone https://github.com/autokitteh/kittehub.git
   ak deploy --manifest kittehub/samples/google/sheets/autokitteh.yaml
   ```

4. Initialize this project's connections:

   - Google Sheets: with user impersonation using OAuth 2.0 (based on step 2),
     or a GCP service account's JSON key
   - Slack: with an OAuth v2 app (based on step 2), or a Socket Mode app

> [!TIP]
> The exact CLI commands to do so (`ak connection init ...`) will appear in
> the output of the `ak deploy` command from step 3 when you create the
> project on the server, i.e. when you run that command for the first time.

## Usage Instructions

Outgoing API calls:

1. Create a new Google Sheet: https://sheets.new

2. Run a slash command of the Slack app that you initialized in step 4 above,
   with the URL of the new Google Sheet as the slash command's text

3. See the Google Sheet, and the Slack app's DM responses to you