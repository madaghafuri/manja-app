/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Hono } from 'hono';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import { CookieStore, Session, sessionMiddleware } from 'hono-sessions';
import { setCookie } from 'hono/cookie';
import { Workspace as WorkspaceType } from './schema';
import Workspace from './pages/workspace';
import auth from './auth';
import Modal from './components/modal';

export type Bindings = {
	DB: D1Database;
};

const app = new Hono<{
	Bindings: Bindings;
	Variables: {
		session: Session;
		session_key_rotation: boolean;
	};
}>();

const store = new CookieStore();

app.use(
	'*',
	sessionMiddleware({
		store,
		encryptionKey: 'password_at_least_32_characters_long',
		expireAfterSeconds: 900,
		cookieOptions: {
			path: '/',
			httpOnly: true,
		},
	}),
);

app.get('/', (c) => {
	const session = c.get('session');
	const userId = session.get('userId') as number;

	return c.html(<Home userId={userId}></Home>);
});

app.get('/modal', (c) => {
	return c.html(<Modal></Modal>);
});

app.get('/set-cookie', (c) => {
	setCookie(c, 'cookie_name', 'cookie_value', { httpOnly: true });
	return c.text('Done', 200);
});

app.get('/login', (c) => {
	return c.html(<Login></Login>);
});

app.get('/register', (c) => {
	return c.html(<Register></Register>);
});

app.get('/w/:workspaceId', async (c) => {
	const wsId = c.req.param('workspaceId');
	const { results } = await c.env.DB.prepare('SELECT id, title, created_at FROM workspace WHERE id = ?')
		.bind(parseInt(wsId))
		.all<WorkspaceType>();
	const userId = c.get('session').get('userId') as number;

	try {
		const projects = await c.env.DB.prepare('SELECT id, title, workspace_id FROM project WHERE workspace_id = ?').bind(results[0].id).all();
		console.log(projects);
	} catch (error) {}

	if (!userId) return c.html(<div>Unauthorized Access!</div>);

	return c.html(<Workspace authId={userId} workspace={results[0]}></Workspace>);
});

app.get('/w/:workspaceId/home', async (c) => {
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
	);
});

app.get('/w/:workspaceId/tasks', async (c) => {
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
	);
});

app.route('/auth', auth);

export default app;
