import { AxiosError } from "axios";

export const handleErrorResponse = (error: AxiosError) => {
	let errorResponse;
	if (error.response && error.response.data) {
		// I expect the API to handle error responses in valid format
		errorResponse = error.response.data;
		// JSON stringify if you need the json and use it later
	} else if (error.request) {
		// TO Handle the default error response for Network failure or 404 etc.,
		errorResponse = error.request.message || error.request.statusText;
	} else {
		errorResponse = error.message;
	}
	throw new Error(errorResponse);
};
