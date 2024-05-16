import { Hono } from 'hono';
import { Bindings } from '..';
import { Session } from 'hono-sessions';
import { performQueryFirst } from '../helper';
import { Project } from '../schema';
import ProjectBoard from '../pages/project-board';
import ProjectList from '../pages/project-list';

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

	return c.html(<ProjectBoard project={project}></ProjectBoard>);
});

app.get('/list', async (c) => {
	const projectId = c.req.param('projectId');
	const project = await performQueryFirst<Project>(c, query, projectId);

	if (!project) return c.html(<div>Request Error</div>);

	return c.html(<ProjectList project={project}></ProjectList>);
});

export default app;
