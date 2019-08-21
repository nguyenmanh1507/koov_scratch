const path = require('path');

module.exports = {
  components: './src/javascripts/components/**/index.js',
  webpackConfig: require('./webpack.dev.js'),
  require: [path.join(__dirname, './src/styles/index.css')],
};
