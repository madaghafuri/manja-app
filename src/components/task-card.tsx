import { Task } from '../schema';

export default function TaskCard({ task }: { task: Task }) {
	return (
		<div
			hx-get={`/p/${task.project_id}/t/${task.id}`}
			hx-target="body"
			hx-swap="beforeend"
			hx-trigger="click"
			class="border-border rounded-lg border p-2 text-sm shadow hover:cursor-pointer"
		>
			{task.title}
		</div>
	);
}
