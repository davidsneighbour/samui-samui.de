const webpack = require("webpack");
const path = require("path");

module.exports = {

  entry: {
    main: path.join(__dirname, "assets/js", "theme.js")
  },

  output: {
    path: path.join(__dirname, "static")
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
