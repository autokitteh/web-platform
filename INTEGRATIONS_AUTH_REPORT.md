# AutoKitteh Integrations Authentication Report

## Summary

This report documents the authentication types, form fields, and connection variable storage for all AutoKitteh integrations.

### Global auth_type Constants (from `integrations/auth.go`)

| Constant | Value | Description |
|----------|-------|-------------|
| `APIKey` | `"apiKey"` | API key authentication |
| `APIToken` | `"apiToken"` | API token authentication |
| `DaemonApp` | `"daemonApp"` | Microsoft integrations only |
| `Init` | `"initialized"` | Integrations with only 1 type by definition |
| `JSONKey` | `"jsonKey"` | Google integrations only |
| `OAuth` | `"oauth"` | Deprecated - use `OAuthDefault` |
| `OAuthDefault` | `"oauthDefault"` | Default OAuth 2.0 |
| `OAuthPrivate` | `"oauthPrivate"` | Private OAuth 2.0 app |
| `PAT` | `"pat"` | Personal Access Token |
| `ServerToServer` | `"serverToServer"` | Zoom integrations only |
| `SocketMode` | `"socketMode"` | Slack integration only |
| `BotToken` | `"botToken"` | Telegram only |

---

## Variable Naming Inconsistency Report

### Question: Are there any integrations where the var name is `authType` instead of `auth_type`?

**IMPORTANT FINDING: ALL integrations use `auth_type` as the symbol value, but there's a variable naming inconsistency in the Go code:**

| Integration | Variable Name | Symbol Value |
|-------------|---------------|--------------|
| **Most integrations** | `authTypeVar` | `"auth_type"` |
| **common/vars.go** | `AuthTypeVar` | `"auth_type"` |
| **atlassian/confluence** | `authType` (lowercase) | `"auth_type"` |
| **atlassian/jira** | `authType` (lowercase) | `"auth_type"` |
| **aws** | `authType` (lowercase) | `"auth_type"` |
| **discord/vars** | `AuthType` | `"auth_type"` |
| **github/vars** | `AuthType` | `"auth_type"` |
| **google/vars** | `AuthType` | `"auth_type"` |
| **twilio/webhooks** | `AuthType` | `"auth_type"` |
| **chatgpt** | `apiKeyVar` = `"apiKey"` | Different naming for API key! |

**Note**: The `chatgpt` integration uses `apiKeyVar = sdktypes.NewSymbol("apiKey")` instead of `"api_key"` - this is an inconsistency compared to other integrations that use `"api_key"`.

---

## Detailed Integration Report

### 1. Airtable

**File**: `integrations/airtable/save.go`

**Auth Types Supported**:
- `oauthDefault` - Uses AutoKitteh's default OAuth 2.0 app
- `pat` - Personal Access Token

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type selection |
| `pat` | Personal access token (when auth_type = "pat") |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `pat` | `pat` | Yes | Personal access token |
| `auth_type` | `auth_type` | No | Authentication type |

---

### 2. Anthropic

**File**: `integrations/anthropic/save.go`

**Auth Types Supported**:
- Uses `common.SaveAuthType()` (stores whatever is provided in form)

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type |
| `api_key` | Anthropic API key |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `api_key` | `api_key` | Yes | Anthropic API key |
| `auth_type` | `auth_type` | No | Authentication type |

---

### 3. Asana

**File**: `integrations/asana/save.go`

**Auth Types Supported**:
- `pat` - Personal Access Token only

**Form Fields**:
| Field | Description |
|-------|-------------|
| `pat` | Asana personal access token |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `pat` | `pat` | Yes | Personal access token |
| `auth_type` | N/A | No | Set to `integrations.PAT` ("pat") |

---

### 4. Atlassian Confluence

**File**: `integrations/atlassian/confluence/save.go`

**Auth Types Supported**:
- `apiToken` - API Token with email
- `pat` - Personal Access Token (on-prem)

**Form Fields**:
| Field | Description |
|-------|-------------|
| `base_url` | Confluence base URL |
| `token` | API token or PAT |
| `email` | Email address (optional, determines auth type) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `BaseURL` | `base_url` | No | Confluence instance URL |
| `Token` | `token` | Yes | API token or PAT |
| `Email` | `email` | Yes | User email (if API token) |
| `auth_type` | Derived | No | "apiToken" if email provided, "pat" otherwise |
| `WebhookID_{category}` | Generated | No | Webhook IDs per event category |
| `WebhookSecret_{category}` | Generated | Yes | Webhook secrets per event category |

---

### 5. Atlassian Jira

**File**: `integrations/atlassian/jira/save.go`

**Auth Types Supported**:
- `apiToken` - API Token with email
- `pat` - Personal Access Token (on-prem)

**Form Fields**:
| Field | Description |
|-------|-------------|
| `base_url` | Jira base URL |
| `token` | API token or PAT |
| `email` | Email address (optional, determines auth type) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `BaseURL` | `base_url` | No | Jira instance URL |
| `Token` | `token` | Yes | API token or PAT |
| `Email` | `email` | Yes | User email (if API token) |
| `auth_type` | Derived | No | "apiToken" if email provided, "pat" otherwise |

---

### 6. Auth0

**File**: `integrations/auth0/save.go`

**Auth Types Supported**:
- OAuth 2.0 (redirects to OAuth flow after saving credentials)

**Form Fields**:
| Field | Description |
|-------|-------------|
| `client_id` | Auth0 client ID |
| `client_secret` | Auth0 client secret |
| `auth0_domain` | Auth0 domain |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `client_id` | `client_id` | No | Auth0 client ID |
| `client_secret` | `client_secret` | Yes | Auth0 client secret |
| `auth0_domain` | `auth0_domain` | No | Auth0 domain |

---

### 7. AWS

**File**: `integrations/aws/save.go`

**Auth Types Supported**:
- `initialized` - Static credentials only

**Form Fields**:
| Field | Description |
|-------|-------------|
| `region` | AWS region |
| `access_key` | AWS access key ID |
| `secret_key` | AWS secret access key |
| `token` | Session token (optional) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `Region` | `region` | No | AWS region |
| `AccessKeyID` | `access_key` | No | Access key ID |
| `SecretKey` | `secret_key` | Yes | Secret access key |
| `Token` | `token` | Yes | Session token |
| `auth_type` | N/A | No | Set to `integrations.Init` ("initialized") |

---

### 8. ChatGPT (OpenAI)

**File**: `integrations/chatgpt/save.go`

**Auth Types Supported**:
- `initialized` - API key only

**Form Fields**:
| Field | Description |
|-------|-------------|
| `key` | OpenAI API key |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `apiKey` | `key` | Yes | OpenAI API key (**Note**: Symbol is `apiKey`, not `api_key`) |
| `auth_type` | N/A | No | Set to `integrations.Init` ("initialized") |

---

### 9. Discord

**File**: `integrations/discord/save.go`

**Auth Types Supported**:
- `initialized` - Bot token only

**Form Fields**:
| Field | Description |
|-------|-------------|
| `botToken` | Discord bot token |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `BotID` | Derived | No | Bot ID (extracted from token) |
| `BotToken` | `botToken` | Yes | Discord bot token |
| `auth_type` | N/A | No | Set to `integrations.Init` ("initialized") |

---

### 10. GitHub

**File**: `integrations/github/save.go`

**Auth Types Supported**:
- OAuth (redirects after saving custom app details)

**Form Fields**:
| Field | Description |
|-------|-------------|
| `client_id` | GitHub OAuth app client ID |
| `client_secret` | GitHub OAuth app client secret |
| `app_id` | GitHub App ID (optional) |
| `app_name` | GitHub App name (optional) |
| `webhook_secret` | Webhook secret (optional) |
| `enterprise_url` | GitHub Enterprise URL (optional) |
| `private_key` | GitHub App private key (optional) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `client_id` | `client_id` | No | OAuth client ID |
| `client_secret` | `client_secret` | Yes | OAuth client secret |
| `app_id` | `app_id` | No | GitHub App ID |
| `app_name` | `app_name` | No | GitHub App name |
| `webhook_secret` | `webhook_secret` | Yes | Webhook secret |
| `enterprise_url` | `enterprise_url` | No | Enterprise URL |
| `private_key` | `private_key` | Yes | App private key |

---

### 11. Google (Calendar, Drive, Forms, Gmail, Sheets, Gemini)

**File**: `integrations/google/creds.go`

**Auth Types Supported**:
- `""`, `"json"`, `"jsonKey"` - GCP service account JSON key
- `"oauth"` - User OAuth 2.0

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type (`"json"`, `"jsonKey"`, `"oauth"`) |
| `json` | Service account JSON key (when auth_type is json/jsonKey) |
| `cal_id` | Google Calendar ID (optional) |
| `form_id` | Google Forms ID (optional) |
| `auth_scopes` | OAuth scopes (when auth_type is oauth) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `JSON` | `json` | Yes | Service account JSON key |
| `CalendarID` | `cal_id` | No | Google Calendar ID |
| `FormID` | `form_id` | No | Google Forms ID |
| `auth_type` | N/A | No | Set to `"jsonKey"` for JSON auth |

---

### 12. Google Gemini

**File**: `integrations/google/gemini/save.go`

**Auth Types Supported**:
- API key only (no explicit auth_type)

**Form Fields**:
| Field | Description |
|-------|-------------|
| `key` | Gemini API key |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `api_key` | `key` | Yes | Gemini API key |

---

### 13. HubSpot

**File**: `integrations/hubspot/client.go` (OAuth only)

**Auth Types Supported**:
- `oauth` - Legacy OAuth 2.0

**Form Fields**:
- OAuth flow (handled via OAuth service)

**Saved Variables**:
| Variable Name (Symbol) | Source | Secret | Description |
|------------------------|--------|--------|-------------|
| `auth_type` | OAuth callback | No | Set to `"oauth"` |
| `oauth_AccessToken` | OAuth | Yes | Legacy OAuth access token |
| `oauth_RefreshToken` | OAuth | Yes | OAuth refresh token |

---

### 14. Kubernetes

**File**: `integrations/kubernetes/save.go`

**Auth Types Supported**:
- `initialized` - Kubeconfig file only

**Form Fields**:
| Field | Description |
|-------|-------------|
| `config_file` | Kubeconfig file content |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `config_file` | `config_file` | Yes | Kubeconfig file content |
| `auth_type` | N/A | No | Set to `integrations.Init` ("initialized") |

---

### 15. Linear

**File**: `integrations/linear/save.go`

**Auth Types Supported**:
- `oauthDefault` - Default Linear OAuth 2.0
- `oauthPrivate` - Private Linear OAuth 2.0 app
- `apiKey` - API key

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type |
| `actor` | Linear actor (user/app) for OAuth |
| `client_id` | OAuth client ID (for private OAuth) |
| `client_secret` | OAuth client secret (for private OAuth) |
| `webhook_secret` | Webhook secret (for private OAuth) |
| `api_key` | Linear API key (for API key auth) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `actor` | `actor` | No | Linear actor |
| `private_client_id` | `client_id` | No | Private OAuth client ID |
| `private_client_secret` | `client_secret` | Yes | Private OAuth client secret |
| `private_webhook_secret` | `webhook_secret` | Yes | Private webhook secret |
| `api_key` | `api_key` | Yes | Linear API key |
| `org_id`, `org_name`, `org_url_key` | API | No | Organization info |
| `viewer_id`, `viewer_display_name`, `viewer_email`, `viewer_name` | API | No | User info |
| `auth_type` | `auth_type` | No | Authentication type |

---

### 16. Microsoft (Teams, Excel, etc.)

**File**: `integrations/microsoft/save.go`

**Auth Types Supported**:
- `oauthDefault` - Default Microsoft OAuth 2.0
- `oauthPrivate` - Private Microsoft OAuth 2.0 app
- `daemonApp` - Application permissions (no user OAuth flow)

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type |
| `tenant_id` | Azure tenant ID (defaults to "common") |
| `client_id` | OAuth client ID (for private OAuth/daemon) |
| `client_secret` | OAuth client secret (for private OAuth/daemon) |
| `auth_scopes` | OAuth scopes selection |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `ClientID` | `client_id` | No | Client ID |
| `ClientSecret` | `client_secret` | Yes | Client secret |
| `TenantID` | `tenant_id` | No | Azure tenant ID |
| `auth_type` | `auth_type` | No | Authentication type |

---

### 17. Notion

**File**: `integrations/notion/save.go`

**Auth Types Supported**:
- `oauthDefault` - Default Notion OAuth 2.0
- `apiKey` - Internal integration API key

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type |
| `api_key` | Notion API key (for API key auth) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `api_key` | `api_key` | Yes | Notion API key |
| `auth_type` | `auth_type` | No | Authentication type |

---

### 18. Pipedrive

**File**: `integrations/pipedrive/save.go`

**Auth Types Supported**:
- Uses `common.SaveAuthType()` (stores whatever is provided)

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type |
| `api_key` | Pipedrive API key |
| `company_domain` | Pipedrive company domain |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `api_key` | `api_key` | Yes | Pipedrive API key |
| `company_domain` | `company_domain` | No | Company domain |
| `auth_type` | `auth_type` | No | Authentication type |

---

### 19. Reddit

**File**: `integrations/reddit/save.go`

**Auth Types Supported**:
- Uses `common.SaveAuthType()` (stores whatever is provided)

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type |
| `client_id` | Reddit app client ID |
| `client_secret` | Reddit app client secret |
| `user_agent` | User agent string |
| `username` | Reddit username (optional, for password grant) |
| `password` | Reddit password (optional, for password grant) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `client_id` | `client_id` | Yes | Reddit client ID |
| `client_secret` | `client_secret` | Yes | Reddit client secret |
| `user_agent` | `user_agent` | Yes | User agent |
| `username` | `username` | Yes | Reddit username |
| `password` | `password` | Yes | Reddit password |
| `auth_type` | `auth_type` | No | Authentication type |

---

### 20. Salesforce

**File**: `integrations/salesforce/save.go`

**Auth Types Supported**:
- `oauthDefault` - Default Salesforce OAuth 2.0 (private instances only)
- `oauthPrivate` - Private Salesforce OAuth 2.0 app

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type |
| `client_id` | OAuth client ID (for private OAuth) |
| `client_secret` | OAuth client secret (for private OAuth) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `ClientID` (via struct) | `client_id` | No | Client ID |
| `ClientSecret` (via struct) | `client_secret` | Yes | Client secret |
| `auth_type` | `auth_type` | No | Authentication type |

---

### 21. Slack

**File**: `integrations/slack/save.go`

**Auth Types Supported**:
- `oauth`, `oauthDefault` - Default Slack OAuth v2
- `oauthPrivate` - Private Slack OAuth v2 app
- `socketMode` - Private Socket Mode app

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type |
| `client_id` | OAuth client ID (for private OAuth) |
| `client_secret` | OAuth client secret (for private OAuth) |
| `signing_secret` | Signing secret (for private OAuth) |
| `bot_token` | Bot token (for Socket Mode) |
| `app_token` | App token (for Socket Mode) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `private_client_id` | `client_id` | No | Private OAuth client ID |
| `private_client_secret` | `client_secret` | Yes | Private OAuth client secret |
| `private_signing_secret` | `signing_secret` | Yes | Signing secret |
| `private_bot_token` | `bot_token` | Yes | Bot token (Socket Mode) |
| `private_app_token` | `app_token` | Yes | App token (Socket Mode) |
| `enterprise_id`, `team_name`, `team_id`, `user_name`, `user_id` | API | No | Team/User info |
| `bot_name`, `bot_id`, `bot_updated`, `app_id` | API | No | Bot info |
| `install_ids` | Derived | No | Installation IDs |
| `auth_type` | `auth_type` | No | Authentication type |

---

### 22. Telegram

**File**: `integrations/telegram/save.go`

**Auth Types Supported**:
- Uses `common.SaveAuthType()` (stores whatever is provided)

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type |
| `bot_token` | Telegram bot token |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `BotToken` | `bot_token` | Yes | Telegram bot token |
| `SecretToken` | Generated | Yes | Webhook secret |
| `BotID` | Derived from token | No | Bot ID |
| `WebhookURL` | Generated | No | Webhook URL |
| `auth_type` | `auth_type` | No | Authentication type |

---

### 23. Twilio

**File**: `integrations/twilio/webhooks/auth.go`

**Auth Types Supported**:
- `apiToken` - Account SID + Auth Token
- `apiKey` - Account SID + API Key + API Secret

**Form Fields**:
| Field | Description |
|-------|-------------|
| `account_sid` | Twilio Account SID |
| `auth_token` | Twilio Auth Token (if using API token auth) |
| `api_key` | Twilio API Key (if using API key auth) |
| `api_secret` | Twilio API Secret (if using API key auth) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `AccountSID` | `account_sid` | No | Account SID |
| `Username` | `account_sid` or `api_key` | Yes | Auth username |
| `Password` | `auth_token` or `api_secret` | Yes | Auth password/secret |
| `auth_type` | Derived | No | `"apiToken"` or `"apiKey"` |

---

### 24. Zoom

**File**: `integrations/zoom/save.go`

**Auth Types Supported**:
- `oauthDefault` - Default Zoom OAuth 2.0
- `oauthPrivate` - Private Zoom OAuth 2.0 app
- `serverToServer` - Server-to-Server internal app

**Form Fields**:
| Field | Description |
|-------|-------------|
| `auth_type` | Authentication type |
| `account_id` | Zoom Account ID (required for Server-to-Server) |
| `client_id` | OAuth client ID |
| `client_secret` | OAuth client secret |
| `secret_token` | Webhook secret token (optional) |

**Saved Variables**:
| Variable Name (Symbol) | Form Field | Secret | Description |
|------------------------|------------|--------|-------------|
| `private_account_id` | `account_id` | No | Account ID |
| `private_client_id` | `client_id` | No | Client ID |
| `private_client_secret` | `client_secret` | Yes | Client secret |
| `private_secret_token` | `secret_token` | Yes | Webhook secret |
| `auth_type` | `auth_type` | No | Authentication type |

---

## Key Findings

### 1. Auth Type Consistency
All integrations consistently store `auth_type` with the symbol value `"auth_type"`. However, the Go variable naming varies:
- Most use `authTypeVar`
- Some use `authType` (lowercase, unexported)
- Some use `AuthType` (uppercase, exported)

### 2. Form Field to Variable Mapping Inconsistency
| Integration | Form Field | Stored Variable |
|-------------|------------|-----------------|
| ChatGPT | `key` | `apiKey` (not `api_key`) |
| Google Gemini | `key` | `api_key` |
| AWS | `access_key` | `AccessKeyID` |
| AWS | `secret_key` | `SecretKey` |

### 3. Integrations with Multiple Auth Types
| Integration | Auth Types |
|-------------|------------|
| Airtable | oauthDefault, pat |
| Atlassian (Jira/Confluence) | apiToken, pat |
| Linear | oauthDefault, oauthPrivate, apiKey |
| Microsoft | oauthDefault, oauthPrivate, daemonApp |
| Notion | oauthDefault, apiKey |
| Salesforce | oauthDefault, oauthPrivate |
| Slack | oauth, oauthDefault, oauthPrivate, socketMode |
| Twilio | apiToken, apiKey |
| Zoom | oauthDefault, oauthPrivate, serverToServer |

### 4. Integrations with Single Auth Type
| Integration | Auth Type | Notes |
|-------------|-----------|-------|
| Anthropic | (common.SaveAuthType) | API key via form |
| Asana | pat | PAT only |
| AWS | initialized | Static credentials |
| ChatGPT | initialized | API key only |
| Discord | initialized | Bot token only |
| Google | jsonKey, oauth | Service account or OAuth |
| Google Gemini | (none explicit) | API key only |
| HubSpot | oauth | Legacy OAuth |
| Kubernetes | initialized | Kubeconfig only |
| Pipedrive | (common.SaveAuthType) | API key via form |
| Reddit | (common.SaveAuthType) | Client credentials |
| Telegram | (common.SaveAuthType) | Bot token |

---

*Report generated: December 2025*
