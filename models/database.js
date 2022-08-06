const { Pool } = require("pg");
require("dotenv").config();

const devConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const productionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
};

const pool = new Pool(
    process.env.NODE_ENV === "development" ? devConfig : productionConfig
);
module.exports = pool;
