import { Hono } from 'hono';
import { Bindings } from '..';
import { Session } from 'hono-sessions';
import { performQueryAll, performQueryFirst } from '../helper';
import { Project } from '../schema';
import ProjectBoard from '../pages/project-board';
import ProjectList from '../pages/project-list';
import ProjectCalendar from '../pages/project-calendar';
import ProjectDashboard from '../pages/project-dashboard';

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

	const tasks = await performQueryAll(
		c,
		'SELECT task.id, task.title, task.description, task.start_date, task.end_date, task_status.title, tag.title, user.username FROM task INNER JOIN task_status ON task.status_id = task_status.id INNER JOIN tag ON task.tag_id = tag.id INNER JOIN project_member ON task.assignee_id = project_member.id INNER JOIN user ON project_member.user_id = user.id WHERE task.project_id = ?',
		projectId,
	);

	console.log(tasks);

	return c.html(<ProjectBoard tab="board" project={project}></ProjectBoard>);
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

export default app;
