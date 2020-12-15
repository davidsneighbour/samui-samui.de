const { merge } = require('webpack-merge');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const common = require("./webpack.common.js");
const fs = require('fs');

class MetaInfoPlugin {
  constructor(options) {
    this.options = { filename: 'meta.json', ...options };
  }

  apply(compiler) {
    compiler.hooks.done.tap(this.constructor.name, stats => {
      const metaInfo = {
        // add any other information if necessary
        hash: stats.hash
      };
      const json = JSON.stringify(metaInfo);
      return new Promise((resolve, reject) => {
        fs.writeFile(this.options.filename, json, 'utf8', error => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    });
  }
}

module.exports = merge(common, {

  mode: "production",

  output: {
    filename: "[name].[fullhash].js",
    chunkFilename: "[id].[fullhash].css"
  },

  plugins: [
    new MetaInfoPlugin({ filename: 'data/dnb/webpack/config.json' })
  ]

});
