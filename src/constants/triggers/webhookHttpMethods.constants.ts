const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
export const anyHttpMethod = { value: "*", label: "Any" };
export const httpMethodOptions = [
	anyHttpMethod,
	...httpMethods.map((method) => ({ value: method.toLowerCase(), label: method })),
];
