export const openPopup = (url: string, title: string, width: number = 0, height: number = 0) => {
	const left = (window.screen.width - width) / 2;
	const top = (window.screen.height - height) / 2;
	const options = `toolbar=no, menubar=no, width=${width}, height=${height}, top=${top}, left=${left}`;

	return window.open(url, title, options);
};
