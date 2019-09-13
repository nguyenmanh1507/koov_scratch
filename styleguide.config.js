const path = require('path');

module.exports = {
  components: './src/javascripts/components/**/index.js',
  webpackConfig: require('./webpack.dev.js'),
  require: [path.join(__dirname, './src/styles/index.css')],
  template: {
    head: {
      links: [
        {
          rel: 'stylesheet',
          href:
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/css/all.min.css',
        },
      ],
    },
  },
};
