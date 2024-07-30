export enum GithubConnectionType {
	Oauth = "oauth",
	Pat = "pat",
}

export enum GoogleConnectionType {
	Oauth = "oauth",
	ServiceAccount = "serviceAccount",
}

export enum SlackConnectionType {
	Mode = "mode",
	Oauth = "oauth",
}

export enum HttpConnectionType {
	NoAuth = "oauth",
	Basic = "basic",
	Bearer = "bearer",
}

export enum TwilioConnectionType {
	AuthToken = "oauth",
	ApiKey = "apiKey",
}

export enum JiraConnectionType {
	Oauth = "oauth",
	ApiToken = "apiToken",
}
