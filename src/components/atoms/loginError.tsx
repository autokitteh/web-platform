import React from "react";

export const LoginError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
	<div className="flex h-screen w-full flex-col items-center justify-center gap-4">
		<p className="text-lg text-error">{message}</p>
		<button className="rounded bg-gray-750 px-4 py-2 text-white hover:bg-gray-700" onClick={onRetry}>
			Retry
		</button>
	</div>
);
