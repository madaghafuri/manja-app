import { Hono } from 'hono';
import { Bindings } from '..';
import { Session } from 'hono-sessions';
import { performQueryAll, performQueryFirst } from '../helper';
import { Project, Task } from '../schema';
import ProjectBoard, { BoardData } from '../pages/project-board';
import ProjectList from '../pages/project-list';
import ProjectCalendar from '../pages/project-calendar';
import ProjectDashboard from '../pages/project-dashboard';
import ContextMenu from '../components/context-menu';
import task from './task';

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

	const tasks = await performQueryAll<Task>(
		c,
		'SELECT task.id, task.title, task.description, task.start_date, task.end_date, task.status_id, task.project_id FROM task WHERE task.project_id = ?',
		projectId,
	);

	if (!project) return c.html(<div>Request Error</div>);

	const parsedTasks = tasks?.results.map((value) => {
		return { id: value.id.toString(), title: value.title, start: value.start_date, end: value.end_date };
	});

	return c.html(<ProjectCalendar tab="calendar" project={project} tasks={JSON.stringify(parsedTasks) || '[]'}></ProjectCalendar>);
});

app.get('/dashboard', async (c) => {
	const projectId = c.req.param('projectId');
	const project = await performQueryFirst<Project>(c, query, projectId);

	if (!project) return c.html(<div>Request Error</div>);

	return c.html(<ProjectDashboard tab="dashboard" project={project}></ProjectDashboard>);
});

app.route('/t', task);

//** OPEN CONTEXT MENU RESPONSE */
app.get('/t/:taskId/context', async (c) => {
	const taskId = c.req.param('taskId');
	const projectId = c.req.param('projectId');

	return c.html(
		<ContextMenu>
			<ContextMenu.Content className="bg-background min-w-[10rem] rounded-md shadow-lg">
				<div class="flex flex-col">
					<button
						hx-delete={`/p/${projectId}/t/${taskId}`}
						hx-trigger="click"
						type="button"
						class="flex items-center gap-3 rounded-md px-2 py-1 text-red-700 hover:bg-zinc-200"
					>
						<i class="fa-regular fa-trash-can"></i>
						Delete
					</button>
				</div>
			</ContextMenu.Content>
		</ContextMenu>,
	);
});

export default app;
