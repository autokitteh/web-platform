import { startLanguageServer } from "pyright";
import { BrowserMessageReader, BrowserMessageWriter, createConnection } from "vscode-languageserver/browser";

self.onmessage = () => {
	const messageReader = new BrowserMessageReader(self);
	const messageWriter = new BrowserMessageWriter(self);

	const connection = createConnection(messageReader, messageWriter);

	startLanguageServer(connection, {
		rootUri: "file:///",
		publishDiagnostics: true,
	});
};
