import { Context } from 'hono';
import { Bindings } from '.';
import { Session } from 'hono-sessions';

export async function performQueryAll<T>(
	c: Context<{
		Bindings: Bindings;
		Variables: {
			session: Session;
			session_key_rotation: boolean;
		};
	}>,
	query: string,
	...bind: unknown[]
) {
	try {
		const result = await c.env.DB.prepare(query)
			.bind(...bind)
			.all<T>();
		return result;
	} catch (error) {
		console.error(error.message);
	}
}

export async function performQueryFirst<T>(
	c: Context<{
		Bindings: Bindings;
		Variables: {
			session: Session;
			session_key_rotation: boolean;
		};
	}>,
	query: string,
	...bind: unknown[]
) {
	try {
		const result = await c.env.DB.prepare(query)
			.bind(...bind)
			.first<T>();
		return result;
	} catch (error) {
		console.error(error.message);
	}
}

export function findKeysNotNull<T extends Record<any, any>>(obj: T) {
	for (const key in obj) {
		if (obj[key] !== null) {
			return key;
		}
	}
	return null;
}
