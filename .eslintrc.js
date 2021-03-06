module.exports = {
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:flowtype/recommended'],
  env: {
    browser: true,
    es6: true,
    amd: true,
    node: true,
  },
  parser: 'babel-eslint',
  plugins: ['babel', 'react', 'flowtype'],
  rules: {
    semi: 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-multiple-empty-lines': 'error',
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
  },
  settings: {
    react: {
      version: '16.3.0',
    },
  },
  globals: {
    "__DEV__": false, /* read only */
    "__STAGING__": false, /* read only */
    "__PRODUCTION__": false, /* read only */
    "API_ENDPOINT": false, /* read only */
  }
};
