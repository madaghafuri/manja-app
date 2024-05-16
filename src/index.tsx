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
import auth from './routes/auth';
import Modal from './components/modal';
import workspace from './routes/workspace';
import project from './routes/project';

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

app.route('/w/:workspaceId', workspace);

app.route('/auth', auth);

app.route('/p/:projectId', project);

export default app;
