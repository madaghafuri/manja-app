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
import { userSchema } from './auth';
import { validator } from 'hono/validator';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import { CookieStore, Session, sessionMiddleware } from 'hono-sessions';
import { setCookie } from 'hono/cookie';
import { z } from 'zod';

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

	console.log(userId);

	return c.html(<Home userId={userId}></Home>);
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

app.get('/w/:workspaceId/task', async (c) => {
	const result = await c.env.DB.prepare('SELECT * FROM ');
});

app.post(
	'/auth/register',
	validator('form', (value, c) => {
		const email = value['email'];
		const password = value['password'];

		if (!email || !password) {
			return c.text('missing required parameter', 400);
		}
		return value as Record<'email' | 'password' | 'username', string>;
	}),
	async (c) => {
		const { email, password, username } = c.req.valid('form');
		const checkEmail = await c.env.DB.prepare('SELECT id, email, created_at FROM user WHERE email = ?').bind(email).first();
		if (!!checkEmail) {
			return c.html(<span class="text-red-500">Email already in use!</span>, 200);
		}

		try {
			await c.env.DB.prepare('INSERT INTO user (email, passkey, username, created_at) VALUES (?, ?, ?, date())')
				.bind(email, password, username)
				.run();
			const [result] = await c.env.DB.prepare('SELECT id FROM user WHERE email = ?').bind(email).raw();
			const userId = result[0];
			await c.env.DB.prepare("INSERT INTO workspace (title, created_at) VALUES ('My Workspace', date())").run();
			await c.env.DB.prepare('INSERT INTO workspace_admin (user_id, workspace_id) VALUES (?, last_insert_rowid())').bind(userId).run();
		} catch (error) {
			return c.html(<span class="text-red-500">Error persisting record!</span>, 200);
		}

		return c.text('Account created successfully!', 200, {
			'HX-Redirect': '/login',
		});
	},
);

app.post(
	'/auth/login',
	validator('form', async (value, c) => {
		const email = value['email'];
		const password = value['password'];

		if (!email || !password) {
			return c.html('Missing email or password');
		}

		return value;
	}),
	async (c) => {
		//@ts-ignore
		const { email, password } = c.req.valid('form');

		const result = await c.env.DB.prepare(
			'SELECT id, email, username, passkey, created_at FROM user WHERE user.email = ? AND user.passkey = ?',
		)
			.bind(email, password)
			.first<z.infer<typeof userSchema>>();

		if (!result) return c.html(<span class="font-bold text-red-500">Credential does not match our record</span>);

		try {
			const res = await c.env.DB.prepare('SELECT id FROM workspace INNER JOIN workspace_admin ON workspace_admin.user_id = ?')
				.bind(result.id)
				.first();
			console.log(res);
		} catch (error) {
			console.error(error);
		}

		const session = c.get('session');
		session.set('userId', result.id);

		return c.text('Login success!', 200, {
			'HX-Redirect': '/',
		});
	},
);

app.post('/auth/logout', (c) => {
	const session = c.get('session');
	session.deleteSession();
	return c.text('Logout sucess!', 200, {
		'HX-Redirect': '/',
	});
});

export default app;
