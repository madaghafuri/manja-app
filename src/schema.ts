export interface Workspace {
	id: number;
	title: string;
	created_at: string;
}

export interface User {
	id: number;
	email: string;
	username: string;
	passkey: string;
	created_at: string;
}

export interface Project {
	id: number;
	title: string;
	workspace_id: number;
}

export interface Status {
	id: number;
	title: string;
	created_at: string;
}

export interface Task {
	id: number;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	status_id: number;
	project_id: number;
	assignee_id: number;
	status: Status;
	project: Project;
	assignee: User;
}
