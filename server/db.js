const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "031216551248",
  host: "localhost",
  port: 5432,
  database: "db_webshop",
});

module.exports = pool;
// exports.pool = pool;
