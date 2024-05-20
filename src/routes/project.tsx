import { Hono } from 'hono';
import { Bindings } from '..';
import { Session } from 'hono-sessions';
import { performQueryAll, performQueryFirst } from '../helper';
import { Project, Task } from '../schema';
import ProjectBoard, { BoardData } from '../pages/project-board';
import ProjectList from '../pages/project-list';
import ProjectCalendar from '../pages/project-calendar';
import ProjectDashboard from '../pages/project-dashboard';
import TaskForm from '../components/task-form';
import TaskCard from '../components/task-card';

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
		'SELECT task.id, task.title, task.description, task.start_date, task.end_date, task.status_id FROM task INNER JOIN task_status ON task.status_id = task_status.id WHERE task.project_id = ?',
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

	return c.html(<TaskForm projectId={projectId} statusId={parseInt(statusId)} />);
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
			<button class="rounded p-2 hover:bg-zinc-200" hx-get={`/p/${projectId}/t?statusId=${statusId}`} hx-target="this" hx-swap="outerHTML">
				Add Task
			</button>
		</>,
	);
});

export default app;
