module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  parser: "babel-eslint",
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module",
    allowImportExportEverywhere: true
  },
  globals: {
    React: "readonly"
  },
  plugins: ["react", "react-hooks"],
  rules: {
    "react/prop-types": 0,
    "react/react-in-jsx-scope": "off",
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "[iI]gnored",
        argsIgnorePattern: "[iI]gnored"
      }
    ]
  }
};
