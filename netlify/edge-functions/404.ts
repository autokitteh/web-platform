import type { Context } from "@netlify/edge-functions";

export default async (req: Request, { next }: Context) => {
	const res = await next();

	return new Response(await res.text(), {
		status: 404,
		headers: res.headers,
	});
};

export const config = { path: "/404" };
