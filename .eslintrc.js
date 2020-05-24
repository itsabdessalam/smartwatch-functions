module.exports = {
  extends: ['standard', 'prettier', 'prettier/standard'],
  plugins: ['import', 'prettier', 'standard'],
  parserOptions: {
    ecmaVersion: 2017,
  },

  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    dotenv: true,
  },
  rules: {
    'no-unused-vars': 'off',
    'space-before-function-paren': 0,
    'new-cap': 0,
    'linebreak-style': ['error', 'unix'],
    'prettier/prettier': 2,
  },
};
