// src/test/__mocks__/auth-mongodb-adapter.ts

export const MongoDBAdapter = (client: any) => ({
  type: 'adapter',
  client,
});
