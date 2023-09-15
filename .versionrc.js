const defaultStandardVersion = require("@davidsneighbour/standard-version-config");
module.exports = defaultStandardVersion;

const localStandardVersion = {
	bumpFiles: [
		...defaultStandardVersion.bumpFiles,
		{
			filename: 'data/dnb/garuda/build.json',
			type: 'json',
		},
	],
	scripts: {
		prerelease: "./bin/repo/release/prerelease",
	},
	skip: {
		changelog: true
	}
};

const standardVersion = {
	...defaultStandardVersion,
	...localStandardVersion,
};
module.exports = standardVersion;
