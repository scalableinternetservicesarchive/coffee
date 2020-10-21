module.exports = {
  client: {
    name: 'graphql-api client',
    service: {
      name: 'graphql-api',
      localSchemaFile: `${__dirname}/server/src/graphql/schema.graphql`,
    },
    includes: ['web/src/**/*.{ts,tsx}', 'server/src/**/*.{ts,tsx}', 'common/src/**/*.{ts,tsx}', 'server/src/graphql/schema.gen.json'],
  },
}
