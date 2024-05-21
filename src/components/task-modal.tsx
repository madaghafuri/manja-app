import { Status, Task } from '../schema';
import Modal from './modal';

export default function TaskModal({ task, statuses }: { task: Task; statuses: Status[] }) {
	return (
		<Modal>
			<Modal.Header class="border-border border-b-[1px] px-3 py-2">
				<button class="rounded bg-indigo-500 px-2 py-1 text-sm text-white">Share</button>
				<Modal.Close class="rounded px-4 py-2 hover:bg-zinc-200">
					<i class="fa-solid fa-xmark"></i>
				</Modal.Close>
			</Modal.Header>
			<Modal.Content class="flex min-h-[70vh] min-w-[80vw] px-3 py-2">
				<section class="border-border w-[70%] border-r-[1px] px-14 py-7">
					<h1 class="text-3xl font-bold">{task.title}</h1>
					<div class="grid grid-cols-2 gap-3 p-2">
						<div class="grid grid-cols-[40%,60%] items-center gap-2">
							<label htmlFor="task-status">Status</label>
							<select
								hx-patch={`/p/${task.project.id}/t/${task.id}`}
								hx-include="[name='status_id']"
								hx-trigger="change"
								hx-target="this"
								hx-swap="outerHTML"
								name="status_id"
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
							<label>Dates</label>
							<input type="date" class="rounded p-1 hover:bg-zinc-200" value={'2024-05-21'} />
							<label htmlFor="">Track Time</label>
						</div>
						<div class="grid grid-cols-[40%,60%] gap-2">
							<label htmlFor="">Assignees</label>
							<input type="text" value={task.status.title} class="rounded p-1 hover:bg-zinc-200" />
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
							value={task.description}
							class="border-border min-h-[200px] rounded border p-4 focus:outline-none"
							placeholder="Write something"
						/>
					</div>
				</section>
				<section class="w-[30%] px-5 py-2">
					<h1 class="text-xl">Activity</h1>
				</section>
			</Modal.Content>
		</Modal>
	);
}
