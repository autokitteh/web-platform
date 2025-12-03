export enum ConnectionAuthType {
	Oauth = "oauth",
	OauthDefault = "oauthDefault",
	OauthPrivate = "oauthPrivate",
	Pat = "pat",
	ServiceAccount = "serviceAccount",
	Mode = "mode",
	NoAuth = "noauth",
	Basic = "basic",
	Bearer = "bearer",
	ApiKey = "apiKey",
	Key = "key",
	JsonKey = "jsonKey",
	Json = "json",
	ApiToken = "apiToken", // Also used for Twilio Auth Token (backend uses "apiToken" for both)
	AWSConfig = "awsConfig",
	Socket = "socketMode", // Changed from "socket" to match backend integrations.SocketMode
	BotToken = "botToken",
	serverToServer = "serverToServer",
	DaemonApp = "daemonApp",
	Initialized = "initialized",
}
