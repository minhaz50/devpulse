import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../db/database";
import type { SafeUser } from "./interface";

const SALT_ROUNDS = 10;

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: string,
): Promise<SafeUser> => {
  // Check if email already exists
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    throw new Error("Email already Used");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at
     `,
    [name, email, hashedPassword, role],
  );

  return result.rows[0];
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<{ token: string; user: SafeUser }> => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  const user = result.rows[0];
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    secret,
    { expiresIn: "24h" },
  );

  // Never return the password
  const { password: _password, ...safeUser } = user;

  return { token, user: safeUser };
};
