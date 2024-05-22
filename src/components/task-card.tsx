import { Task } from '../schema';

export default function TaskCard({ task }: { task: Task } & HtmxAttributes) {
	return (
		<div
			id={`task-card-${task.id}`}
			hx-get={`/p/${task.project_id}/t/${task.id}`}
			hx-target="body"
			hx-swap="beforeend"
			hx-trigger="click target:#task-card"
			class="border-border relative flex items-center justify-between rounded-lg border p-2 text-sm shadow hover:cursor-pointer"
			oncontextmenu="return false"
		>
			{task.title}
			<button
				type="button"
				hx-trigger="click"
				hx-get={`/p/${task.project_id}/t/${task.id}/context`}
				hx-target={`#task-card-${task.id}`}
				hx-swap="beforeend"
				class="rounded px-2 py-1 hover:bg-zinc-200"
			>
				<i class="fa-solid fa-ellipsis-vertical"></i>
			</button>
		</div>
	);
}
