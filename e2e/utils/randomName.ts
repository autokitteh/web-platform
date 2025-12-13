import randomatic from "randomatic";

export const randomName = () => {
	return randomatic("Aa", 1) + randomatic("Aa0", 9);
};
