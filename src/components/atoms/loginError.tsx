import React from "react";

export const LoginError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
	<div className="flex h-screen w-full flex-col items-center justify-center bg-gray-1250">
		<div className="flex flex-col items-center gap-6 rounded-xl border border-gray-1100 bg-gray-1300 p-8">
			<p className="text-center text-lg text-gray-300">{message}</p>
			<button
				className="rounded-3xl border border-gray-750 bg-gray-1200 px-6 py-2 text-white transition duration-300 hover:border-white hover:bg-gray-1050"
				onClick={onRetry}
			>
				Retry
			</button>
		</div>
	</div>
);
