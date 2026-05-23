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
