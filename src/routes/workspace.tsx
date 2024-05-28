import { Hono } from 'hono';
import { Bindings } from '..';
import { Session } from 'hono-sessions';
import { Project, Task, Workspace as WorkspaceType } from '../schema';
import { performQueryAll, performQueryFirst } from '../helper';
import BaseLayout from '../layouts/base-layout';
import Workspace from '../pages/workspace';
import Modal from '../components/modal';
import { AuthInput } from '../components/auth-input';
import { validator } from 'hono/validator';
import ProjectPage from '../pages/projects';

const app = new Hono<{ Bindings: Bindings; Variables: { session: Session; session_key_rotation: boolean } }>();

app.get('/', async (c) => {
	const wsId = c.req.param('workspaceId');
	const { results } = await c.env.DB.prepare('SELECT id, title, created_at FROM workspace WHERE id = ?')
		//@ts-ignore
		.bind(parseInt(wsId))
		.all<WorkspaceType>();
	const userId = c.get('session').get('userId') as number;

	const projects = await performQueryAll<Project>(
		c,
		'SELECT project.id, project.title FROM project INNER JOIN project_member ON project.id = project_member.project_id JOIN user ON project_member.user_id = user.id WHERE user.id = ?',
		userId,
	);

	const tasks = await performQueryAll<{ data: string }>(
		c,
		"SELECT json_object('id', task.id, 'title', task.title, 'created_at', task.created_at, 'project', json_object('id', project.id, 'title', project.title)) AS data FROM task LEFT JOIN project on task.project_id = project.id WHERE assignee_id = ?",
		userId,
	);

	const parsedData = tasks?.results.map((val) => {
		return JSON.parse(val.data);
	}) as Task[];

	if (!userId) return c.html(<BaseLayout>Unauthorized Access</BaseLayout>);

	return c.html(
		<Workspace authId={userId} workspace={results[0]} projects={projects?.results as Project[]} tasks={parsedData}></Workspace>,
	);
});

app.get('/home', async (c) => {
	const wsId = c.req.param('workspaceId');

	return c.html(
		<div>
			<div role="tablist">
				<button
					hx-get={`/w/${wsId}/home`}
					class="bg-secondary rounded-lg px-4 py-2"
					aria-selected="true"
					autofocus
					role="tab"
					aria-controls="tab-content"
				>
					Home
				</button>
				<button hx-get={`/w/${wsId}/tasks`} class="rounded-lg px-4 py-2" role="tab" aria-selected="false" aria-controls="tab-content">
					Tasks
				</button>
			</div>
			<div id="tab-content" role="tabpanel">
				Home content
			</div>
		</div>,
		{
			headers: {
				'HX-Replace-Url': `/w/${wsId}/home`,
			},
		},
	);
});

app.get('/tasks', async (c) => {
	const wsId = c.req.param('workspaceId');

	return c.html(
		<div>
			<div role="tablist">
				<button hx-get={`/w/${wsId}/home`} class="rounded-lg px-4 py-2" aria-selected="false" role="tab" aria-controls="tab-content">
					Home
				</button>
				<button
					hx-get={`/w/${wsId}/tasks`}
					class="bg-secondary rounded-lg px-4 py-2"
					role="tab"
					autofocus
					aria-selected="true"
					aria-controls="tab-content"
				>
					Tasks
				</button>
			</div>
			<div id="tab-content" role="tabpanel">
				Task content
			</div>
		</div>,
		{
			headers: {
				'HX-Replace-Url': `/w/${wsId}/tasks`,
			},
		},
	);
});

app.get('/p/create', async (c) => {
	const wsId = c.req.param('workspaceId');

	const statuses = ['to do', 'doing', 'done'];

	return c.html(
		<Modal>
			<Modal.Header className="px-3 py-2">
				<h1>Create Project</h1>
			</Modal.Header>
			<Modal.Description className="px-3 py-2">
				A projects represents a team, or groups, each with its own List, workflows, and settings
			</Modal.Description>
			<br />
			<Modal.Content className="px-3 py-2">
				<form class="flex flex-col gap-2" hx-post={`/w/${wsId}/p`}>
					<label htmlFor="" class="text-sm font-semibold tracking-tight">
						Project's Name
					</label>
					<AuthInput required type="text" name="title" />
					<label htmlFor="status" class="text-sm font-semibold tracking-tight">
						Status
					</label>

					<div class="grid grid-cols-3 gap-5">
						{statuses.map((val) => {
							return (
								<input
									id="status"
									value={val}
									name="status[]"
									class="border-border rounded border px-2 py-1 font-light uppercase tracking-wide shadow-lg"
								></input>
							);
						})}
					</div>
					<div class="absolute bottom-5 right-5">
						<button type="submit" class="rounded bg-indigo-600 px-2 py-1 text-white">
							Create
						</button>
					</div>
				</form>
			</Modal.Content>
			<br />
			<br />
			<Modal.Close className="absolute bottom-5 left-5" />
		</Modal>,
	);
});

app.post(
	'/p',
	validator('form', async (value, c) => {
		return value;
	}),
	async (c) => {
		const value = c.req.valid('form');
		const title = value['title'];
		const wsId = c.req.param('workspaceId');
		const statuses = value['status[]'] as unknown as string[];

		const userId = c.get('session').get('userId');

		try {
			c.env.DB.prepare('INSERT INTO project (title, workspace_id) VALUES (?, ?)').bind(title, wsId).run();
		} catch (error) {
			return c.html(<Modal>Error Creating Project!</Modal>);
		}

		const projectid = await performQueryFirst<{ 'last_insert_rowid()': number }>(c, 'SELECT last_insert_rowid()');

		if (!projectid) return c.html(<Modal>Error Creating Project!</Modal>);

		try {
			await c.env.DB.batch([
				c.env.DB.prepare('INSERT INTO project_member (project_id, user_id, role_id) VALUES (?, ?, ?)').bind(
					projectid['last_insert_rowid()'],
					userId,
					1,
				),
				c.env.DB.prepare(
					'INSERT INTO task_status (title, created_at, project_id) VALUES (?2, date(), ?1), (?3, date(), ?1), (?4, date(), ?1)',
				).bind(projectid['last_insert_rowid()'], statuses[0], statuses[1], statuses[2]),
			]);
		} catch (error: any) {
			return c.html(<Modal>Error Creating Project!</Modal>);
		}

		return c.html(<Modal>Success</Modal>, 200, { 'HX-Trigger': 'projectCreated' });
	},
);

app.get('/p/:projectId', async (c) => {
	const userId = c.get('session').get('userId') as number;
	const workspaceId = c.req.param('workspaceId');
	const projectId = c.req.param('projectId');

	const project = await performQueryFirst<Project>(c, 'SElECT id, title FROM project WHERE id = ?', projectId);
	const workspace = await performQueryFirst<WorkspaceType>(c, 'SELECT id, title, created_at FROM workspace WHERE id = ?', workspaceId);
	const projects = await performQueryAll<Project>(
		c,
		'SELECT project.id, project.title FROM project INNER JOIN project_member ON project.id = project_member.project_id JOIN user ON project_member.user_id = user.id WHERE user.id = ?',
		userId,
	);

	if (!workspace || !project || !projects?.results || !userId) {
		return c.html(<BaseLayout>Unauthorized Access</BaseLayout>);
	}

	return c.html(<ProjectPage authId={userId} workspace={workspace} project={project} projects={projects.results}></ProjectPage>);
});

//** TRIGGERED AFTER SUCCESS CREATING PROJECT */
app.get('/p', async (c) => {
	const workspaceId = c.req.param('workspaceId');
	const userId = c.get('session').get('userId');

	const projects = await performQueryAll<Project>(
		c,
		'SELECT project.id, project.title, project.workspace_id FROM project INNER JOIN project_member ON project.id = project_member.project_id JOIN user ON project_member.user_id = user.id WHERE user.id = ? AND project.workspace_id = ?',
		userId,
		workspaceId,
	);

	return c.html(
		<>
			{projects?.results.map((val) => {
				return (
					<a href={`/w/${val.workspace_id}/p/${val.id}`} class="px-2 py-1 text-sm">
						{val.title}
					</a>
				);
			})}
		</>,
	);
});

export default app;
