const path = require("path");

module.exports = {

  target: ['web', 'es2017'],

  entry: {
    main: path.join(__dirname, "assets/js", "theme.js")
  },

  output: {
    path: path.join(__dirname, "assets"),
    filename: "[name].js",
    chunkFilename: "[id].css"
  },

  performance: {
    maxEntrypointSize: 400000,
    maxAssetSize: 100000,
    hints: 'warning'
  },

  module: {
    rules: [
      {
        loader: "babel-loader",
        test: /\.js?$/,
        exclude: /node_modules/
      }
    ]
  }

};
