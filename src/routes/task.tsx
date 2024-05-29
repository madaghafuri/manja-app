import { Hono } from 'hono';
import { Bindings } from '..';
import { Session } from 'hono-sessions';
import { findKeysNotNull, performQueryAll, performQueryFirst } from '../helper';
import { Fragment } from 'hono/jsx/jsx-runtime';
import TaskForm from '../components/task-form';
import TaskCard from '../components/task-card';
import { Status, Task, User } from '../schema';
import TaskModal from '../components/task-modal';
import { validator } from 'hono/validator';

const task = new Hono<{
	Bindings: Bindings;
	Variables: {
		session: Session;
		session_key_rotation: boolean;
	};
}>();

task.get('/', async (c) => {
	const projectId = c.req.param('projectId') as unknown as number;
	const { statusId } = c.req.query();

	return c.html(
		<Fragment>
			<TaskForm projectId={projectId} statusId={parseInt(statusId)} />
			<button class="rounded p-2 hover:bg-zinc-200" hx-get={`/p/${projectId}/t?statusId=${statusId}`} hx-target="this" hx-swap="outerHTML">
				Add Task
			</button>
		</Fragment>,
	);
});
task.post('/', async (c) => {
	const form = await c.req.formData();
	const title = form.get('title');
	const projectId = c.req.param('projectId');
	const { statusId } = c.req.query();

	if (!title) return c.html(<>Request Error</>);

	try {
		await c.env.DB.prepare('INSERT INTO task (title, project_id, created_at, status_id) VALUES (?, ?, date(), ?)')
			.bind(title, projectId, statusId)
			.run();
	} catch (error) {
		console.error(error);
		return c.html(<>Request Error</>);
	}

	const task = await performQueryFirst<Task>(c, 'SELECT * FROM task WHERE id = last_insert_rowid()');

	if (!task) return c.html(<>Request Error</>);

	return c.html(
		<>
			<TaskCard task={task} />
		</>,
	);
});
task.get('/:taskId', async (c) => {
	const taskId = c.req.param('taskId');
	const projectId = c.req.param('projectId');

	const task = await performQueryFirst<{ data: string }>(
		c,
		"SELECT json_object('id', task.id, 'title', task.title, 'description', task.description, 'start_date', task.start_date, 'end_date', task.end_date, 'created_at', task.created_at, 'project', json_object('id', project.id, 'title', project.title), 'status', json_object('id', task_status.id, 'title', task_status.title, 'created_at', task_status.created_at), 'assignee', json_object('id', user.id, 'email', user.email, 'username', user.username, 'created_at', user.created_at)) AS data FROM task INNER JOIN project ON task.project_id = project.id INNER JOIN task_status ON task.status_id = task_status.id LEFT JOIN user ON task.assignee_id = user.id WHERE task.id = ?",
		taskId,
	);

	if (!task) return c.html(<>Request Error</>);

	const statuses = await performQueryAll(c, 'SELECT id, title, created_at FROM task_status WHERE project_id = ?', projectId);

	const members = await performQueryAll<User>(
		c,
		'SELECT user.id, user.email, user.username, user.created_at from user JOIN project_member ON user.id = project_member.user_id WHERE project_member.project_id = ?',
		projectId,
	);

	const parsedData = JSON.parse(task.data) as Task;

	return c.html(<TaskModal task={parsedData} statuses={statuses?.results as Status[]} members={members?.results as User[]} />);
});
task.patch(
	'/:taskId',
	validator('form', (value) => {
		return value;
	}),
	async (c) => {
		const taskId = c.req.param('taskId');
		const projectId = c.req.param('projectId');
		const value = c.req.valid('form') as Record<keyof Task, Task[keyof Task]>;
		const column = findKeysNotNull(value);

		if (!column) return c.html(<>Error Request</>);

		if (column === 'status') {
			//** UPDATING STATUS FROM TASK MODAL */
			try {
				await c.env.DB.prepare(`UPDATE task SET status_id = ? WHERE id = ?`).bind(value[column], taskId).run();
			} catch (error) {
				console.error(error);
				return c.html(<>Error Request</>);
			}

			const statuses = await performQueryAll<Status>(c, 'SELECT id, title, created_at FROM task_status WHERE project_id = ?', projectId);

			if (!statuses?.results) {
				return c.html(<>Error</>);
			}

			return c.html(
				<select
					hx-patch={`/p/${projectId}/t/${taskId}`}
					hx-include="[name='status']"
					hx-trigger="change"
					hx-target="this"
					hx-swap="outerHTML"
					name="status"
					id="task-status"
					class="rounded p-1 text-xs font-bold uppercase hover:bg-zinc-200 focus:outline-none"
				>
					{statuses.results.map((val) => {
						return (
							<option value={val.id} class="font-bold uppercase" selected={val.id === parseInt(value[column] as string)}>
								{val.title}
							</option>
						);
					})}
				</select>,
				200,
				{ 'HX-Trigger': 'taskPatched' },
			);
		} else if (column === 'description') {
			/** UPDATING DESCRIPTION FROM TASK MODAL */
			try {
				await c.env.DB.prepare('UPDATE task SET description = ? WHERE id = ?').bind(value[column], taskId).run();
			} catch (error) {
				console.error(error);
			}

			return c.html(
				<textarea
					name="description"
					class="border-border min-h-[200px] rounded border p-4 focus:outline-none"
					placeholder="Write something"
					hx-patch={`/p/${projectId}/t/${taskId}`}
					hx-include="[name='description']"
					hx-trigger="keyup changed delay:500ms"
					hx-target="this"
					hx-swap="outerHTML"
				>
					{value[column]}
				</textarea>,
			);
		} else if (column === 'title') {
			//** UPDATING TITLE FROM TASK MODAL */
			try {
				await c.env.DB.prepare('UPDATE task SET title = ? WHERE id = ?').bind(value[column], taskId).run();
			} catch (error) {
				console.error(error);
			}

			return c.html(
				<input
					type="text"
					class="px-2 py-1 text-3xl font-bold focus:outline-none"
					value={value[column].toString()}
					hx-patch={`/p/${projectId}/t/${taskId}`}
					hx-trigger="keyup changed delay:500ms"
					hx-target="this"
					hx-swap="outerHTML"
					hx-include="[name='title']"
					name="title"
				/>,
				200,
				{ 'HX-Trigger': 'taskPatched' },
			);
		} else if (column === 'assignee_id') {
			//** UPDATING ASSIGNEE FROM TASK MODAL */

			if (value[column] == 'null')
				try {
					await c.env.DB.prepare('UPDATE task SET assignee_id = NULL WHERE id = ?').bind(taskId).run();
				} catch (error) {
					console.error(error);
				}
			else
				try {
					await c.env.DB.prepare('UPDATE task SET assignee_id = ? WHERE id = ?').bind(value[column], taskId).run();
				} catch (error) {
					console.error(error);
				}

			const members = await performQueryAll<User>(
				c,
				'SELECT user.id, user.email, user.username, user.created_at from user JOIN project_member ON user.id = project_member.user_id WHERE project_member.project_id = ?',
				projectId,
			);

			return c.html(
				<select
					class="rounded p-1 hover:bg-zinc-200"
					hx-patch={`/p/${projectId}/t/${taskId}`}
					hx-include="[name='assignee_id]"
					hx-trigger="change"
					hx-target-="this"
					hx-swap="outerHTML"
					name="assignee_id"
					id="task_assignee"
				>
					<option value="null">Empty</option>;
					{members?.results.map((user) => {
						return (
							<option selected={user.id === parseInt(value[column] as string)} value={user.id}>
								{user.username}
							</option>
						);
					})}
				</select>,
				200,
				{ 'HX-Trigger': 'taskPatched' },
			);
		} else if (column === 'start_date') {
			try {
				await c.env.DB.prepare('UPDATE task SET start_date = ? WHERE id = ?').bind(value[column], taskId).run();
			} catch (error) {
				console.error(error);
			}

			return c.html(
				<input
					type="date"
					name="start_date"
					id="start_date"
					class="rounded p-1 hover:bg-zinc-200"
					value={(value[column] as string) || ''}
					hx-patch={`/p/${projectId}/t/${taskId}`}
					hx-include="[name='start_date']"
					hx-trigger="change"
					hx-target="this"
					hx-swap="outerHTML"
				/>,
			);
		} else if (column === 'end_date') {
			try {
				await c.env.DB.prepare('UPDATE task SET end_date = ? WHERE id = ?').bind(value[column], taskId).run();
			} catch (error) {
				console.error(error);
			}

			return c.html(
				<input
					type="date"
					name="end_date"
					id="end_date"
					class="rounded p-1 hover:bg-zinc-200"
					value={(value[column] as string) || ''}
					hx-patch={`/p/${projectId}/t/${taskId}`}
					hx-include="[name='end_date']"
					hx-trigger="change"
					hx-target="this"
					hx-swap="outerHTML"
				/>,
			);
		}
	},
);
task.delete('/:taskId', async (c) => {
	const taskId = c.req.param('taskId');

	try {
		await c.env.DB.prepare('DELETE FROM task where id = ?').bind(taskId).run();
	} catch (error) {
		console.error(error);
	}

	return c.html(<></>, 200, { 'HX-Trigger': 'taskPatched' });
});

export default task;
