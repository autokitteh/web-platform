export const isComponentDefined = (component: unknown): component is React.ComponentType<any> => {
	return component !== undefined;
};
