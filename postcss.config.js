module.exports = ({ _, options, env }) => ({
  plugins: {
    'postcss-import': {},
    'postcss-mixins': {},
    'postcss-custom-properties': {},
    'postcss-custom-media': {},
    'postcss-nested': {},
    autoprefixer: {},
  },
});
