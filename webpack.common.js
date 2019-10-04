// const path = require('path');
const Dotenv = require('dotenv-webpack');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

const plugins = [
  new webpack.EnvironmentPlugin({
    NODE_ENV: 'development',
  }),
  new Dotenv({
    systemvars: true,
  }),
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: './src/index.ejs',
  }),
];

const resolve = {
  alias: {},
};

const rules = [
  {
    test: /\.js$/,
    exclude: [/(node_modules)|(vendors)/, /Sandbox/],
    use: ['babel-loader', 'eslint-loader'],
  },
  {
    test: /\.html$/,
    use: ['file-loader?name=[name].[ext]'],
  },
  {
    test: /\.(mp4|zip)$/,
    use: {
      loader: 'file-loader',
    },
  },
  {
    test: /\.(mp3)$/,
    use: {
      loader: 'file-loader',
    },
  },
  {
    test: /\.yaml$/,
    use: ['json-loader', 'yaml-loader'],
  },
  {
    test: /\.(gif|jpg|png|svg)$/,
    use: [
      {
        loader: 'url-loader',
        options: {
          limit: 102400, // 100KB
        },
      },
      'file-loader',
    ],
  },
  {
    test: /fonts\/.*\.(woff|woff2|svg|eot|ttf)?(\?\w+)?$/,
    use: [
      {
        loader: 'url-loader',
        options: {
          limit: 102400, // 100KB
        },
      },
    ],
  },
  {
    test: /\.(svg)$/,
    issuer: /ScratchBlocks\.jsx?$/,
    loaders: 'url-loader',
  },
  {
    test: /\.(svg)$/,
    exclude: /(pagetop.*\.svg$)|(logo_PROC\.svg$)/,
    issuer: {
      test: /\.jsx?$/,
      exclude: /ScratchBlocks\.js/,
    },
    loaders: 'svg-react-loader',
  },
  {
    test: /\.(svg)$/,
    issuer: /\.s?css$/,
    use: [
      {
        loader: 'url-loader',
        options: {
          limit: 102400, // 100KB
        },
      },
    ],
  },
  {
    test: /\.(graphql|gql)$/,
    exclude: /node_modules/,
    loader: 'graphql-tag/loader',
  },
  {
    test: /\.(html)$/,
    use: {
      loader: 'html-loader',
      options: {
        attrs: [':data-src'],
      },
    },
  },
];

module.exports = {
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: '[name].[hash].js',
    publicPath: '/',
  },
  plugins,
  resolve,
  module: { rules },
};
