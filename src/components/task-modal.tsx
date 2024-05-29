import { Status, Task, User } from '../schema';
import Modal from './modal';

export default function TaskModal({ task, statuses, members }: { task: Task; statuses: Status[]; members: User[] }) {
	return (
		<Modal>
			<Modal.Header className="border-border flex justify-end gap-2 border-b-[1px] px-3 py-2">
				<button class="rounded bg-indigo-500 px-2 py-1 text-sm text-white">Share</button>
				<Modal.Close class="rounded px-4 py-2 hover:bg-zinc-200">
					<i class="fa-solid fa-xmark"></i>
				</Modal.Close>
			</Modal.Header>
			<Modal.Content class="flex min-h-[80vh] min-w-[80vw] px-3 py-2">
				<section class="border-border w-[70%] border-r-[1px] px-32 py-7">
					<input
						type="text"
						class="px-2 py-1 text-3xl font-bold focus:outline-none"
						value={task.title}
						hx-patch={`/p/${task.project.id}/t/${task.id}`}
						hx-trigger="keyup changed delay:500ms"
						hx-target="this"
						hx-swap="outerHTML"
						hx-include="[name='title']"
						name="title"
					/>
					<div class="grid grid-cols-2 items-center gap-3 p-2">
						<div class="grid grid-cols-[40%,60%] items-center gap-2 p-2">
							<label htmlFor="task-status">Status</label>
							<select
								hx-patch={`/p/${task.project.id}/t/${task.id}`}
								hx-include="[name='status']"
								hx-trigger="change"
								hx-target="this"
								hx-swap="outerHTML"
								name="status"
								id="task-status"
								class="rounded p-1 text-xs font-bold uppercase hover:bg-zinc-200 focus:outline-none"
							>
								{statuses.map((val) => {
									return (
										<option value={val.id} class="font-bold uppercase" selected={val.id === task.status.id}>
											{val.title}
										</option>
									);
								})}
							</select>
							<label htmlFor="start_date">Start Date</label>
							<input
								type="date"
								name="start_date"
								id="start_date"
								class="rounded p-1 hover:bg-zinc-200"
								value={task.start_date || ''}
								hx-patch={`/p/${task.project.id}/t/${task.id}`}
								hx-include="[name='start_date']"
								hx-trigger="change"
								hx-target="this"
								hx-swap="outerHTML"
							/>
							<label htmlFor="end_date">End Date</label>
							<input
								type="date"
								name="end_date"
								id="end_date"
								class="rounded p-1 hover:bg-zinc-200"
								value={task.end_date || ''}
								hx-patch={`/p/${task.project.id}/t/${task.id}`}
								hx-include="[name='end_date']"
								hx-trigger="change"
								hx-target="this"
								hx-swap="outerHTML"
							/>
						</div>
						<div class="grid grid-cols-[40%,60%] items-center gap-2 p-2">
							<label htmlFor="">Assignees</label>
							<select
								class="rounded p-1 hover:bg-zinc-200"
								hx-patch={`/p/${task.project.id}/t/${task.id}`}
								hx-include="[name='assignee_id']"
								hx-trigger="change"
								hx-target-="this"
								hx-swap="outerHTML"
								name="assignee_id"
								id="task_assignee"
							>
								<option value="null" selected={!task.assignee.id}>
									Empty
								</option>
								{members.map((user) => {
									return (
										<option selected={task.assignee.id === user.id} value={user.id}>
											{user.username}
										</option>
									);
								})}
							</select>
							<label>Priority</label>
							<input type="text" placeholder="High" class="rounded p-1 hover:bg-zinc-200" />
							<label htmlFor="">Tags</label>
						</div>
					</div>
					<div class="mt-10 flex flex-col gap-2 p-2">
						<label htmlFor="" class="font-bold">
							Description
						</label>
						<textarea
							name="description"
							class="border-border min-h-[200px] rounded border p-4 focus:outline-none"
							placeholder="Write something"
							hx-patch={`/p/${task.project.id}/t/${task.id}`}
							hx-include="[name='description']"
							hx-trigger="keyup changed delay:1000ms"
							hx-target="this"
							hx-swap="outerHTML"
						>
							{task.description}
						</textarea>
					</div>
				</section>
				<section class="relative w-[30%] px-5 py-2">
					<h1 class="text-xl">Activity</h1>
					<div class=" absolute bottom-0 left-0 right-0 p-2">
						<div class="border-border flex flex-col gap-2 rounded border p-2">
							<textarea class="p-2 focus:outline-none" placeholder="Comment" name="" id=""></textarea>
							<div class="flex items-center justify-end gap-2">
								<button class="rounded bg-indigo-500 px-2 py-1 text-white">Send</button>
							</div>
						</div>
					</div>
				</section>
			</Modal.Content>
		</Modal>
	);
}
