require("dotenv").config();

// const pg = require('pg')
// pg.defaults.ssl = true

module.exports = {
  client: "pg",
  connection: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT,
    ssl: process.env.DATABASE_SSL === "true" ? true : false,
  },
  acquireConnectionTimeout: 1000000,
  pool: {
    min: 0,
    max: 15,
    acquireTimeoutMillis: 300000,
    createTimeoutMillis: 300000,
    destroyTimeoutMillis: 300000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 2000,
  },
  migrations: {
    directory: "./migrations",
  },
  seeds: {
    directory: "./seeds",
  },
};
