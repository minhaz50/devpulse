import { pool } from "../../db/database";

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface IssueWithReporter {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  reporter: {
    id: number;
    name: string;
    role: string;
  } | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  type: string;
  reporter_id: number;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  type?: string;
}

const attachReporter = async (
  issues: Issue[],
): Promise<IssueWithReporter[]> => {
  if (issues.length === 0) return [];

  // Collect unique reporter IDs — no JOIN allowed, fetch separately
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];

  const { rows: users } = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
    [reporterIds],
  );

  const userMap = new Map(users.map((u) => [u.id, u]));

  return issues.map(({ reporter_id, ...rest }) => ({
    ...rest,
    reporter: userMap.get(reporter_id) ?? null,
  }));
};

export const getAllIssues = async (
  sort: string = "newest",
  type?: string,
  status?: string,
): Promise<IssueWithReporter[]> => {
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (type) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const order = sort === "oldest" ? "ASC" : "DESC";

  const { rows } = await pool.query(
    `SELECT * FROM issues ${where} ORDER BY created_at ${order}`,
    params,
  );

  return attachReporter(rows);
};

export const getIssueById = async (
  id: number,
): Promise<IssueWithReporter | null> => {
  const { rows } = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);

  if (rows.length === 0) return null;

  const [issue] = await attachReporter(rows);
  return issue ?? null;
};

export const createIssue = async (input: CreateIssueInput): Promise<Issue> => {
  const { title, description, type, reporter_id } = input;

  const { rows } = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporter_id],
  );

  return rows[0];
};

export const updateIssue = async (
  id: number,
  input: UpdateIssueInput,
): Promise<Issue | null> => {
  const fields = Object.entries(input).filter(([, v]) => v !== undefined);
  if (fields.length === 0) return null;

  const setClauses = fields.map(([key], i) => `${key} = $${i + 1}`).join(", ");
  const values = fields.map(([, v]) => v);

  // updated_at is always refreshed manually (no DB trigger)
  values.push(new Date());
  const updatedAtIndex = values.length;

  values.push(id);
  const idIndex = values.length;

  const { rows } = await pool.query(
    `UPDATE issues
     SET ${setClauses}, updated_at = $${updatedAtIndex}
     WHERE id = $${idIndex}
     RETURNING *`,
    values,
  );

  return rows[0] ?? null;
};

export const deleteIssue = async (id: number): Promise<boolean> => {
  const { rowCount } = await pool.query("DELETE FROM issues WHERE id = $1", [
    id,
  ]);
  return (rowCount ?? 0) > 0;
};
