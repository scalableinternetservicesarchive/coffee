module.exports = {
  moduleNameMapper: {
    '^common/(.*)$': '<rootDir>/common/$1',
  },

  roots: ['<rootDir>'],
  testMatch: ['**/?(*.)+(test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  coverageReporters: ['lcov', 'text'],
  collectCoverage: true,
  coverageDirectory: 'coverage',

  // Setup Enzyme
  snapshotSerializers: ['enzyme-to-json/serializer'],
  setupFilesAfterEnv: ['<rootDir>/setupEnzyme.ts'],
}
