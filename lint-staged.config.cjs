/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line no-undef
module.exports = {
	"**/*.{js,jsx,ts,tsx}": () => ["npm run check-types-and-compile", "npm run lint", "npm run check-format:staged"],
};
