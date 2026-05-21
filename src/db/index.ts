import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

export const initDB = async () => {
  try {
    await pool.query(
      `
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR  NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        role VARCHAR NOT NULL DEFAULT 'contributor' CHECK(role IN ('contributor', 'maintainer')),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `,
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      CONSTRAINT description_min_length CHECK (char_length(description) >= 20),
      type VARCHAR NOT NULL CHECK (type IN ('bug', 'feature_request')),
      status VARCHAR NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
      reported_id INTEGER NOT NULL,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);

    console.log("Database Connected Successfully!");
  } catch (error) {
    console.log(error);
  }
};
