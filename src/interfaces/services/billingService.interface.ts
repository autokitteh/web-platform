export interface CheckoutSessionRequest {
	stripe_price_id: string;
	success_url: string;
}

export interface CheckoutSessionResponse {
	redirectUrl: string;
	sessionId: string;
}
