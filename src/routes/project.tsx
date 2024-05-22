import { Hono } from 'hono';
import { Bindings } from '..';
import { Session } from 'hono-sessions';
import { findKeysNotNull, performQueryAll, performQueryFirst } from '../helper';
import { Project, Status, Task } from '../schema';
import ProjectBoard, { BoardData } from '../pages/project-board';
import ProjectList from '../pages/project-list';
import ProjectCalendar from '../pages/project-calendar';
import ProjectDashboard from '../pages/project-dashboard';
import TaskForm from '../components/task-form';
import TaskCard from '../components/task-card';
import TaskModal from '../components/task-modal';
import { validator } from 'hono/validator';
import { Fragment } from 'hono/jsx/jsx-runtime';
import ContextMenu from '../components/context-menu';

const app = new Hono<{
	Bindings: Bindings;
	Variables: {
		session: Session;
		session_key_rotation: boolean;
	};
}>();

const query = 'SELECT id, title FROM project WHERE id = ?';

app.get('/board', async (c) => {
	const projectId = c.req.param('projectId');
	const project = await performQueryFirst<Project>(c, query, projectId);

	if (!project) return c.html(<div>Request Error</div>);

	const tasks = await performQueryAll<{
		id: number;
		title: string;
		description: string;
		start_date: string;
		end_date: string;
		status_id: number;
	}>(
		c,
		'SELECT task.id, task.title, task.description, task.start_date, task.end_date, task.status_id, task.project_id FROM task INNER JOIN task_status ON task.status_id = task_status.id WHERE task.project_id = ?',
		projectId,
	);

	const status = await performQueryAll<{ id: number; title: string; created_at: string }>(
		c,
		'SELECT id, title, created_at FROM task_status WHERE project_id = ?',
		projectId,
	);

	const data = status?.results.map((stat) => {
		const taskList = tasks?.results.filter((val) => val.status_id === stat.id);
		return { ...stat, tasks: taskList };
	});

	return c.html(<ProjectBoard tab="board" project={project} data={data as BoardData[]}></ProjectBoard>);
});

app.get('/list', async (c) => {
	const projectId = c.req.param('projectId');
	const project = await performQueryFirst<Project>(c, query, projectId);

	if (!project) return c.html(<div>Request Error</div>);

	return c.html(<ProjectList tab="list" project={project}></ProjectList>);
});

app.get('/calendar', async (c) => {
	const projectId = c.req.param('projectId');
	const project = await performQueryFirst<Project>(c, query, projectId);

	if (!project) return c.html(<div>Request Error</div>);

	return c.html(<ProjectCalendar tab="calendar" project={project}></ProjectCalendar>);
});

app.get('/dashboard', async (c) => {
	const projectId = c.req.param('projectId');
	const project = await performQueryFirst<Project>(c, query, projectId);

	if (!project) return c.html(<div>Request Error</div>);

	return c.html(<ProjectDashboard tab="dashboard" project={project}></ProjectDashboard>);
});

app.get('/t', async (c) => {
	const projectId = c.req.param('projectId') as unknown as number;
	const { statusId } = c.req.query();

	return c.html(
		<Fragment>
			<TaskForm projectId={projectId} statusId={parseInt(statusId)} />
			<button class="rounded p-2 hover:bg-zinc-200" hx-get={`/p/${projectId}/t?statusId=${statusId}`} hx-target="this" hx-swap="outerHTML">
				Add Task
			</button>
		</Fragment>,
	);
});

app.post('/t', async (c) => {
	const form = await c.req.formData();
	const title = form.get('title');
	const projectId = c.req.param('projectId');
	const { statusId } = c.req.query();

	if (!title) return c.html(<>Request Error</>);

	try {
		await c.env.DB.prepare('INSERT INTO task (title, project_id, created_at, status_id) VALUES (?, ?, date(), ?)')
			.bind(title, projectId, statusId)
			.run();
	} catch (error) {
		console.error(error);
		return c.html(<>Request Error</>);
	}

	const task = await performQueryFirst<Task>(c, 'SELECT * FROM task WHERE id = last_insert_rowid()');

	if (!task) return c.html(<>Request Error</>);

	return c.html(
		<>
			<TaskCard task={task} />
		</>,
	);
});

app.get('/t/:taskId', async (c) => {
	const taskId = c.req.param('taskId');
	const projectId = c.req.param('projectId');

	const task = await performQueryFirst<{ data: string }>(
		c,
		"SELECT json_object('id', task.id, 'title', task.title, 'description', task.description, 'start_date', task.start_date, 'end_date', task.end_date, 'created_at', task.created_at, 'project', json_object('id', project.id, 'title', project.title), 'status', json_object('id', task_status.id, 'title', task_status.title, 'created_at', task_status.created_at)) AS data FROM task INNER JOIN project ON task.project_id = project.id INNER JOIN task_status ON task.status_id = task_status.id WHERE task.id = ?",
		taskId,
	);

	if (!task) return c.html(<>Request Error</>);

	const statuses = await performQueryAll(c, 'SELECT id, title, created_at FROM task_status WHERE project_id = ?', projectId);

	const parsedData = JSON.parse(task.data) as Task;
	console.log(parsedData);

	return c.html(<TaskModal task={parsedData} statuses={statuses?.results as Status[]} />);
});

app.patch(
	'/t/:taskId',
	validator('form', (value) => {
		return value;
	}),
	async (c) => {
		const taskId = c.req.param('taskId');
		const projectId = c.req.param('projectId');
		const value = c.req.valid('form') as Record<keyof Task, Task[keyof Task]>;
		const column = findKeysNotNull(value);

		if (!column) return c.html(<>Error Request</>);

		if (column === 'status') {
			//** UPDATING STATUS FROM TASK MODAL */
			try {
				await c.env.DB.prepare(`UPDATE task SET status_id = ? WHERE id = ?`).bind(value[column], taskId).run();
			} catch (error) {
				console.error(error);
				return c.html(<>Error Request</>);
			}

			const statuses = await performQueryAll<Status>(c, 'SELECT id, title, created_at FROM task_status WHERE project_id = ?', projectId);

			if (!statuses?.results) {
				return c.html(<>Error</>);
			}

			return c.html(
				<select
					hx-patch={`/p/${projectId}/t/${taskId}`}
					hx-include="[name='status']"
					hx-trigger="change"
					hx-target="this"
					hx-swap="outerHTML"
					name="status"
					id="task-status"
					class="rounded p-1 text-xs font-bold uppercase hover:bg-zinc-200 focus:outline-none"
				>
					{statuses.results.map((val) => {
						return (
							<option value={val.id} class="font-bold uppercase" selected={val.id === parseInt(value[column] as string)}>
								{val.title}
							</option>
						);
					})}
				</select>,
				200,
				{ 'HX-Trigger': 'taskPatched' },
			);
		} else if (column === 'description') {
			/** UPDATING DESCRIPTION FROM TASK MODAL */
			try {
				await c.env.DB.prepare('UPDATE task SET description = ? WHERE id = ?').bind(value[column], taskId).run();
			} catch (error) {
				console.error(error);
			}

			return c.html(
				<textarea
					name="description"
					class="border-border min-h-[200px] rounded border p-4 focus:outline-none"
					placeholder="Write something"
					hx-patch={`/p/${projectId}/t/${taskId}`}
					hx-include="[name='description']"
					hx-trigger="keyup changed delay:500ms"
					hx-target="this"
					hx-swap="outerHTML"
				>
					{value[column]}
				</textarea>,
			);
		} else if (column === 'title') {
			//** UPDATING TITLE FROM TASK MODAL */
			try {
				await c.env.DB.prepare('UPDATE task SET title = ? WHERE id = ?').bind(value[column], taskId).run();
			} catch (error) {
				console.error(error);
			}

			return c.html(
				<input
					type="text"
					class="px-2 py-1 text-3xl font-bold focus:outline-none"
					value={value[column].toString()}
					hx-patch={`/p/${projectId}/t/${taskId}`}
					hx-trigger="keyup changed delay:500ms"
					hx-target="this"
					hx-swap="outerHTML"
					hx-include="[name='title']"
					name="title"
				/>,
				200,
				{ 'HX-Trigger': 'taskPatched' },
			);
		}
	},
);

//** OPEN CONTEXT MENU RESPONSE */
app.get('/t/:taskId/context', async (c) => {
	const taskId = c.req.param('taskId');
	const projectId = c.req.param('projectId');

	return c.html(
		<ContextMenu>
			<ContextMenu.Content className="bg-background min-w-[10rem] rounded-md shadow-lg">Hello World</ContextMenu.Content>
		</ContextMenu>,
	);
});

export default app;
