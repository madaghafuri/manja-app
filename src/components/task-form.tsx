export default function TaskForm({ projectId, statusId }: { projectId: number; statusId: number }) {
	return (
		<form
			id="task-form"
			hx-post={`/p/${projectId}/t?statusId=${statusId}`}
			class="border-border flex flex-col gap-3 rounded border p-3"
			hx-target="this"
			hx-swap="outerHTML"
			_="on removeMe remove #task-form"
		>
			<input type="text" name="title" placeholder="Task name" class="px-2 py-1 focus:outline-none" autofocus _="on blur trigger removeMe" />
			<button type="submit" class="text-background justify-self-end rounded bg-indigo-500 p-2 aria-disabled:opacity-50">
				Save
			</button>
		</form>
	);
}
