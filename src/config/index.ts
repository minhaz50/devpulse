import dotenv from "dotenv";
import path from "path";

dotenv.config({
  quiet: true,
  path: path.join(process.cwd(), ".env"),
});

const config = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  port: process.env.PORT,
};

export default config;
