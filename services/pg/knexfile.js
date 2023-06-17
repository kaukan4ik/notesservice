require("dotenv").config({ path: "../../.env" });

module.exports = {
  client: "pg",
  connection: {
    connectionString: process.env.CONNECTION_STRING_PG,
    ssl: true,
  },
  pool: { min: 0, max: 5 },
  migrations: {
    tableName: "knex_migration",
  },
};
