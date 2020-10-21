module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: "tsconfig.json",
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    'react/no-unescaped-entities': 'off',
  },
}
