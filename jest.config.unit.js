module.exports = {
  ...require('./jest.config'),
  rootDir: './src',
  moduleNameMapper: {
    // other mappers...
    '^@auth/mongodb-adapter$': '<rootDir>/src/test/__mocks__/auth-mongodb-adapter.ts',
  },
};
