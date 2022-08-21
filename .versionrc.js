const defaultStandardVersion = require("@davidsneighbour/config/standard-version");
module.exports = defaultStandardVersion;

const localStandardVersion = {
  bumpFiles: [
    ...defaultStandardVersion.bumpFiles,
    {
      filename: 'data/dnb/garuda/build.json',
      type: 'json',
    },
  ],
  skip: {
    changelog: true
  }
};

const standardVersion = {
  ...defaultStandardVersion,
  ...localStandardVersion,
};
module.exports = standardVersion;
