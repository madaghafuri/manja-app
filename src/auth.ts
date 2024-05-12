import { Context } from 'hono';
import { Bindings } from '.';
import { BlankInput } from 'hono/types';
import { z } from 'zod';

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
