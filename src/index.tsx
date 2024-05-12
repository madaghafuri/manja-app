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
import { loginHandler, userSchema } from './auth';
import { validator } from 'hono/validator';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';

export type Bindings = {
	DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
	return c.html(<Home></Home>);
});

app.get('/login', (c) => {
	return c.html(<Login></Login>);
});

app.get('/register', (c) => {
	return c.html(<Register></Register>);
});

app.get('/api/w/:workspaceId/task', async (c) => {
	const result = await c.env.DB.prepare('SELECT * FROM ');
});

app.post(
	'/api/register',
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
			return c.json(
				{
					error: 'Email already in use',
					message: 'The email address provided is already associated with an existing account. Please use a different email address',
				},
				409
			);
		}

		try {
			const register = await c.env.DB.prepare('INSERT INTO user (email, passkey, username, created_at) VALUES (?, ?, ?, date())')
				.bind(email, password, username)
				.run();
			console.log(register);
		} catch (error) {
			console.error(error);
		}

		return c.json({
			success: 'Account created',
			message: 'Account succedfully created',
		});
	}
);

app.post(
	'/api/login',
	validator('form', async (value, c) => {
		const email = value['email'];
		const password = value['password'];

		if (!email || !password) {
			return c.text('missing required parameter', 400);
		}

		return value;
	}),
	async (c) => {
		//@ts-ignore
		const { email, password } = c.req.valid('form');

		const result = await c.env.DB.prepare(
			'SELECT id, email, username, passkey, created_at FROM user WHERE user.email = ? AND user.passkey = ?'
		)
			.bind(email, password)
			.first<typeof userSchema>();

		if (!result) return c.html(<span class="text-red-500 font-bold">Credential does not match our record</span>);

		return c.redirect('/');
	}
);

export default app;
