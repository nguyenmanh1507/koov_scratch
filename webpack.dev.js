const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(c|sc|sa)ss$/,
        use: ['style-loader', 'css-loader', { loader: 'postcss-loader', options: { config: { path: './' } } }],
      },
    ],
  },
  devServer: {
    contentBase: [path.join(__dirname, 'src/assets')],
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: true,
      __STAGING__: false,
      __PRODUCTION__: false,
      API_ENDPOINT: false,
      __GA_ID__: false,
    }),
  ],
  devtool: 'none',
  resolve: {
    alias: { 'react-dom': '@hot-loader/react-dom'  }
  },
});
