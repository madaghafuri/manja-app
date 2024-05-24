DROP TABLE IF EXISTS user;
CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY, email TEXT, username TEXT, passkey TEXT, created_at DATE);

DROP TABLE IF EXISTS roles;
CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY, title TEXT, created_at DATE);
INSERT INTO roles (title, created_at) VALUES ('admin', date());
INSERT INTO roles (title, created_at) VALUES ('member', date());

DROP TABLE IF EXISTS workspace;
CREATE TABLE IF NOT EXISTS workspace (id INTEGER PRIMARY KEY, title TEXT, created_at DATE);

DROP TABLE IF EXISTS project;
CREATE TABLE IF NOT EXISTS project (id INTEGER PRIMARY KEY, title TEXT, workspace_id INTEGER, FOREIGN KEY(workspace_id) REFERENCES workspace(id) ON DELETE CASCADE);

DROP TABLE IF EXISTS workspace_member;
CREATE TABLE IF NOT EXISTS workspace_member (id INTEGER PRIMARY KEY, role_id INTEGER, user_id INTEGER, workspace_id INTEGER, FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE, FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE, FOREIGN KEY(workspace_id) REFERENCES workspace(id) ON DELETE CASCADE);

DROP TABLE IF EXISTS project_member;
CREATE TABLE IF NOT EXISTS project_member (id INTEGER PRIMARY KEY, role_id INTEGER, project_id INTEGER, user_id INTEGER, FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE, FOREIGN KEY(project_id) REFERENCES project(id) ON DELETE CASCADE, FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE);

DROP TABLE IF EXISTS priority;
CREATE TABLE IF NOT EXISTS priority (id INTEGER PRIMARY KEY, title TEXT, created_at DATE);
INSERT INTO priority (title, created_at) VALUES ('low', date());
INSERT INTO priority (title, created_at) VALUES ('medium', date());
INSERT INTO priority (title, created_at) VALUES ('high', date());

DROP TABLE IF EXISTS tag;
CREATE TABLE IF NOT EXISTS tag (id INTEGER PRIMARY KEY, title TEXT, created_at DATE, project_id INTEGER, FOREIGN KEY(project_id) REFERENCES project(id) ON DELETE CASCADE);

DROP TABLE IF EXISTS task_status;
CREATE TABLE IF NOT EXISTS task_status (id INTEGER PRIMARY KEY, title TEXT, created_at DATE, project_id INTEGER, FOREIGN KEY(project_id) REFERENCES project(id) ON DELETE CASCADE);

DROP TABLE IF EXISTS task;
CREATE TABLE IF NOT EXISTS task (id INTEGER PRIMARY KEY, title TEXT, description TEXT, created_at DATE, updated_at DATE, start_date DATE, end_date DATE, project_id INTEGER, status_id INTEGER, tag_id INTEGER, assignee_id INTEGER, FOREIGN KEY(project_id) REFERENCES project(id) ON DELETE CASCADE, FOREIGN KEY(status_id) REFERENCES task_status(id), FOREIGN KEY(tag_id) REFERENCES tag(id), FOREIGN KEY(assignee_id) REFERENCES project_member(id));