module.exports = {
  tabWidth: 2,
  printWidth: 120,
  proseWrap: 'preserve',
  semi: false,
  trailingComma: 'es5',
  singleQuote: true,
  arrowParens: 'avoid',
  overrides: [
    {
      files: '{*.js?(on),*.md,.prettierrc,.babelrc}',
      options: {
        tabWidth: 2,
      },
    },
  ],
}
