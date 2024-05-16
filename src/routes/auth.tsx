import { Context, Hono } from 'hono';
import { Bindings } from '..';
import { BlankInput } from 'hono/types';
import { z } from 'zod';
import { validator } from 'hono/validator';
import { Workspace as WorkspaceType } from '../schema';
import { Session } from 'hono-sessions';
import Modal from '../components/modal';

type User = {
	id: number;
	email: string;
	passkey: string;
	created_at: string;
	username: string;
};

export const userSchema = z.object({
	id: z.number(),
	email: z.string(),
	passkey: z.string(),
	username: z.string(),
	created_at: z.string(),
});

export const loginHandler = async (c: Context<{ Bindings: Bindings }, '/login', BlankInput>) => {
	const { email, password } = c.req.query();
	const result = await c.env.DB.prepare('SELECT id, email, username, password, created_on WHERE email = ? AND password = ?')
		.bind(email, password)
		.first<User>();

	return c.json({
		data: result,
	});
};

const app = new Hono<{
	Bindings: Bindings;
	Variables: {
		session: Session;
		session_key_rotation: boolean;
	};
}>();

app.post(
	'/register',
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
			await c.env.DB.prepare('INSERT INTO workspace_member (user_id, workspace_id, role_id) VALUES (?, last_insert_rowid(), ?)')
				.bind(userId, 1)
				.run();
		} catch (error) {
			return c.html(<span class="text-red-500">Error persisting record!</span>, 200);
		}

		return c.text('Account created successfully!', 200, {
			'HX-Redirect': '/login',
		});
	},
);

app.post(
	'/login',
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

		let workspaceId: number;
		try {
			const res = await c.env.DB.prepare(
				'SELECT workspace.id, workspace.title, workspace.created_at FROM workspace INNER JOIN workspace_member ON workspace_member.user_id = ?',
			)
				.bind(result.id)
				.first<WorkspaceType>();
			workspaceId = (res as WorkspaceType).id as number;
		} catch (error) {
			return c.html(<div>Error 404 Not found</div>);
		}

		const session = c.get('session');
		session.set('userId', result.id);

		return c.text('Login success!', 200, {
			'HX-Redirect': `/w/${workspaceId}`,
		});
	},
);

app.post('/logout', (c) => {
	const session = c.get('session');
	session.deleteSession();
	return c.text('Logout sucess!', 200, {
		'HX-Redirect': '/',
	});
});

export default app;
