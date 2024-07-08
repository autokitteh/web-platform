/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line no-undef
module.exports = {
	"**/*.{js,jsx,ts,tsx}": () => ["npm run type-check", "npm run lint-fix", "npm run fix-format:staged"],
};
